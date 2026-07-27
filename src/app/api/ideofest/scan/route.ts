import { type NextRequest } from 'next/server';
import { createAdminClient } from '@/lib/ideofest/supabase/server';
import { validateQRToken } from '@/lib/ideofest/qr-security';
import type { ApiResponse } from '@/lib/ideofest/types';

/**
 * POST /api/ideofest/scan
 * Gate QR Code scanning endpoint.
 * Supports:
 * - Encrypted & HMAC-signed QR Tokens
 * - Plain Ticket Numbers (IDF-TKT-XXXXXXXX)
 * - Booking References (IDF-XXXXXXXX)
 * - Partial group check-in
 */
export async function POST(request: NextRequest) {
  const supabase = createAdminClient();

  try {
    const body = await request.json();
    const rawPayload = (body.qr_token || body.qrPayload || body.token || body.code || body.raw || '').trim();
    const requestedCheckInQty = Math.max(1, parseInt(body.check_in_qty || body.count || '1'));
    const gate = body.gate || 'Main Gate';
    const scanner_name = body.scanner_name || 'Gate Staff';

    if (!rawPayload) {
      return Response.json(
        { success: false, error: 'QR token or payload code is required', result: 'invalid' } satisfies ApiResponse,
        { status: 400 }
      );
    }

    let extractedRef = '';
    // 1. Attempt decrypting signed QR token
    if (rawPayload.includes('.')) {
      const validation = validateQRToken(rawPayload);
      if (validation.valid && validation.payload?.ref) {
        extractedRef = validation.payload.ref;
      }
    }

    const searchTerm = extractedRef || rawPayload;

    // 2. Query ticket by ticket_number (from decrypted ref) first
    let ticket: any = null;

    if (extractedRef) {
      // We successfully decrypted the QR — look up by the embedded ticket number
      const { data: byRef } = await supabase
        .from('tickets')
        .select(`
          *,
          booking:bookings(
            id, booking_ref, event_id, event_title, event_slug, event_date, venue,
            attendee_name, attendee_email, attendee_nic,
            tier_label, quantity, payment_status, status
          )
        `)
        .eq('ticket_number', extractedRef)
        .maybeSingle();
      ticket = byRef || null;
    }

    // 3. If not found by decrypted ref, try matching the raw payload as a ticket number or booking ref directly
    if (!ticket) {
      const { data: byTicketNum } = await supabase
        .from('tickets')
        .select(`
          *,
          booking:bookings(
            id, booking_ref, event_id, event_title, event_slug, event_date, venue,
            attendee_name, attendee_email, attendee_nic,
            tier_label, quantity, payment_status, status
          )
        `)
        .eq('ticket_number', rawPayload)
        .maybeSingle();
      ticket = byTicketNum || null;
    }

    // 4. Fallback: Search by booking reference (ilike for case-insensitive match)
    if (!ticket) {
      const { data: bookingData } = await supabase
        .from('bookings')
        .select('id')
        .ilike('booking_ref', searchTerm)
        .maybeSingle();

      if (bookingData?.id) {
        const { data: bkgTickets } = await supabase
          .from('tickets')
          .select(`
            *,
            booking:bookings(
              id, booking_ref, event_id, event_title, event_slug, event_date, venue,
              attendee_name, attendee_email, attendee_nic,
              tier_label, quantity, payment_status, status
            )
          `)
          .eq('booking_id', bookingData.id)
          .order('pass_index', { ascending: true });

        if (bkgTickets && bkgTickets.length > 0) {
          // Prefer first un-used ticket
          const unused = bkgTickets.find((t: any) => t.status !== 'used');
          ticket = unused || bkgTickets[0];
        }
      }
    }


    if (!ticket) {
      return Response.json({
        success: false,
        error: `Invalid QR Code or Ticket Not Found (${searchTerm})`,
        result: 'not_found',
      } satisfies ApiResponse, { status: 404 });
    }

    const booking = ticket.booking;
    const ticketNumber = ticket.ticket_number || ticket.qr_token || searchTerm;
    const totalQty = booking?.quantity || 1;

    // 4. Check ticket status
    if (ticket.status === 'cancelled') {
      return Response.json({ success: false, error: 'Ticket is cancelled', result: 'invalid' } satisfies ApiResponse, { status: 400 });
    }
    if (ticket.status === 'expired') {
      return Response.json({ success: false, error: 'Ticket has expired', result: 'expired' } satisfies ApiResponse, { status: 400 });
    }

    // 5. Check attendance logs for previous check-ins
    const { data: logs } = await supabase
      .from('attendance_logs')
      .select('id, scanned_at, gate')
      .eq('booking_id', ticket.booking_id)
      .eq('result', 'success');

    const previousCheckIns = logs ? logs.length : (ticket.status === 'used' ? totalQty : 0);
    const remaining = Math.max(0, totalQty - previousCheckIns);

    if (remaining <= 0 || ticket.status === 'used') {
      const lastScan = logs?.[logs.length - 1];
      return Response.json({
        success: false,
        error: `Duplicate Scan — Pass #${ticket.pass_index || 1} for ${ticket.attendee_name || booking?.attendee_name} has already been scanned.`,
        result: 'duplicate',
        data: {
          attendee_name: ticket.attendee_name || booking?.attendee_name || 'Attendee',
          scanned_at: lastScan?.scanned_at || ticket.used_at || new Date().toISOString(),
          ticket_number: ticketNumber,
          totalQty,
          checkedIn: totalQty,
          remaining: 0,
          pass_index: ticket.pass_index || 1,
        },
      } satisfies ApiResponse, { status: 409 });
    }

    // 6. Perform check-in
    const actualCheckInQty = Math.min(requestedCheckInQty, remaining);
    const now = new Date().toISOString();

    // Mark ticket used
    await supabase
      .from('tickets')
      .update({ status: 'used', used_at: now, updated_at: now })
      .eq('id', ticket.id);

    // Update attendee status in attendees table
    await supabase
      .from('attendees')
      .update({ checked_in: true, checked_in_at: now, status: 'checked_in' })
      .eq('ticket_id', ticket.id);

    // Insert attendance log
    await supabase.from('attendance_logs').insert({
      booking_id: ticket.booking_id,
      ticket_id: ticket.id,
      event_id: booking?.event_id,
      scanned_by: scanner_name,
      gate,
      result: 'success',
      quantity_checked_in: actualCheckInQty,
      scanned_at: now,
    });

    const newCheckedInCount = previousCheckIns + actualCheckInQty;
    const newRemaining = totalQty - newCheckedInCount;

    return Response.json({
      success: true,
      message: `VALID TICKET — Welcome ${ticket.attendee_name || booking?.attendee_name}! Pass #${ticket.pass_index || 1} Checked In`,
      result: 'valid',
      data: {
        attendee_name: ticket.attendee_name || booking?.attendee_name,
        attendee_email: booking?.attendee_email,
        attendee_nic: ticket.attendee_nic || booking?.attendee_nic,
        attendee_phone: ticket.attendee_phone || booking?.attendee_phone,
        ticket_number: ticketNumber,
        booking_ref: booking?.booking_ref,
        event_title: booking?.event_title,
        tier_label: booking?.tier_label,
        quantity_checked_in: actualCheckInQty,
        totalQty,
        checkedIn: newCheckedInCount,
        remaining: newRemaining,
        pass_index: ticket.pass_index || 1,
        scanned_at: now,
        gate,
      },
    } satisfies ApiResponse);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'QR Scan failed';
    return Response.json({ success: false, error: msg, result: 'invalid' } satisfies ApiResponse, { status: 500 });
  }
}
