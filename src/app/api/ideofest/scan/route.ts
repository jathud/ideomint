import { type NextRequest } from 'next/server';
import { createAdminClient } from '@/lib/ideofest/supabase/server';
import { validateQRToken } from '@/lib/ideofest/qr-security';
import type { ApiResponse } from '@/lib/ideofest/types';

/**
 * POST /api/ideofest/scan
 * QR code scan endpoint for gate staff.
 * Supports partial group check-in (e.g. 3 of 4 arrive first, 1 arrives later).
 * Body: { qr_token?: string, qrPayload?: string, check_in_qty?: number, gate?: string, scanner_name?: string }
 */
export async function POST(request: NextRequest) {
  const supabase = createAdminClient();

  try {
    const body = await request.json();
    const rawPayload = (body.qr_token || body.qrPayload || body.token || body.code || '').trim();
    const requestedCheckInQty = Math.max(1, parseInt(body.check_in_qty || body.count || '1'));
    const gate = body.gate || 'Main Gate';
    const scanner_name = body.scanner_name || 'Staff';

    if (!rawPayload) {
      return Response.json({ success: false, error: 'QR token or payload code is required', result: 'invalid' } satisfies ApiResponse, { status: 400 });
    }

    let ticketNumber = '';
    const validation = validateQRToken(rawPayload);
    if (validation.valid && validation.payload?.ref) {
      ticketNumber = validation.payload.ref;
    }

    // 1. Query ticket from Supabase PostgreSQL
    let ticketQuery = supabase
      .from('tickets')
      .select(`
        *,
        booking:bookings(
          id, booking_ref, event_id, event_title, event_slug, event_date, venue,
          attendee_name, attendee_email, attendee_nic,
          tier_label, quantity, payment_status, status
        )
      `);

    if (ticketNumber) {
      ticketQuery = ticketQuery.eq('ticket_number', ticketNumber);
    } else {
      ticketQuery = ticketQuery.or(`ticket_number.ilike.%${rawPayload}%,qr_token.ilike.%${rawPayload}%`);
    }

    let { data: ticket } = await ticketQuery.maybeSingle();

    // 2. If not found directly, search by booking_ref
    if (!ticket) {
      const { data: bookingData } = await supabase
        .from('bookings')
        .select('id')
        .ilike('booking_ref', rawPayload)
        .maybeSingle();

      if (bookingData?.id) {
        const { data: tkt } = await supabase
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
          .maybeSingle();

        if (tkt) ticket = tkt;
      }
    }

    if (!ticket) {
      return Response.json({
        success: false,
        error: 'Invalid QR Code or Ticket Not Found',
        result: 'not_found',
      } satisfies ApiResponse, { status: 404 });
    }

    const booking = ticket.booking;
    const finalTicketNumber = ticket.ticket_number || ticketNumber || rawPayload;
    const totalQty = booking?.quantity || 1;

    // 3. Check ticket status
    if (ticket.status === 'cancelled') {
      return Response.json({ success: false, error: 'Ticket is cancelled', result: 'invalid' } satisfies ApiResponse, { status: 400 });
    }
    if (ticket.status === 'expired') {
      return Response.json({ success: false, error: 'Ticket has expired', result: 'expired' } satisfies ApiResponse, { status: 400 });
    }

    // 4. Calculate previous check-ins for this booking
    const { data: logs } = await supabase
      .from('attendance_logs')
      .select('id, scanned_at, gate')
      .eq('booking_id', ticket.booking_id)
      .eq('result', 'success');

    const previousCheckIns = logs ? logs.length : (ticket.status === 'used' ? totalQty : 0);
    const remaining = totalQty - previousCheckIns;

    if (remaining <= 0) {
      const lastScan = logs?.[logs.length - 1];
      return Response.json({
        success: false,
        error: `Duplicate Scan — All ${totalQty}/${totalQty} tickets for this booking have already been checked in.`,
        result: 'duplicate',
        data: {
          attendee_name: booking?.attendee_name || 'Attendee',
          scanned_at: lastScan?.scanned_at || ticket.used_at || new Date().toISOString(),
          ticket_number: finalTicketNumber,
          totalQty,
          checkedIn: totalQty,
          remaining: 0,
        },
      } satisfies ApiResponse, { status: 409 });
    }

    // 5. Calculate new check-in batch count
    const checkInCount = Math.min(requestedCheckInQty, remaining);
    const newTotalCheckedIn = previousCheckIns + checkInCount;
    const remainingAfterScan = totalQty - newTotalCheckedIn;

    // If all tickets in booking are now checked in, update ticket status to used
    if (remainingAfterScan <= 0) {
      await supabase.from('tickets').update({
        status: 'used',
        used_at: new Date().toISOString(),
      }).eq('id', ticket.id);
    }

    // 6. Record attendance log entries for each attendee checked in
    const logInserts = Array.from({ length: checkInCount }).map(() => ({
      ticket_id: ticket.id,
      booking_id: ticket.booking_id,
      event_id: booking?.event_id,
      customer_id: ticket.customer_id,
      gate,
      scanner_name,
      ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
      user_agent: request.headers.get('user-agent'),
      result: 'success',
    }));

    await supabase.from('attendance_logs').insert(logInserts);

    const message = remainingAfterScan > 0
      ? `✓ Checked in ${checkInCount} attendee(s). (${newTotalCheckedIn}/${totalQty} checked in, ${remainingAfterScan} remaining)`
      : `✓ All ${totalQty} attendee(s) checked in successfully!`;

    return Response.json({
      success: true,
      result: 'success',
      data: {
        ticket_number: finalTicketNumber,
        attendeeName: booking?.attendee_name || 'Attendee',
        attendee_name: booking?.attendee_name || 'Attendee',
        attendee_nic: booking?.attendee_nic,
        tier_label: booking?.tier_label || 'Standard',
        ticketTierLabel: booking?.tier_label || 'Standard',
        quantity: totalQty,
        checkInCount,
        newTotalCheckedIn,
        remainingAfterScan,
        eventTitle: booking?.event_title || 'Ideofest Event',
        event_title: booking?.event_title || 'Ideofest Event',
        event_date: booking?.event_date,
        venue: booking?.venue,
        booking_ref: booking?.booking_ref,
        checked_in_at: new Date().toISOString(),
      },
      message,
    } satisfies ApiResponse);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Scan failed';
    return Response.json({ success: false, error: msg, result: 'invalid' } satisfies ApiResponse, { status: 500 });
  }
}
