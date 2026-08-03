import { type NextRequest } from 'next/server';
import { createAdminClient } from '@/lib/ideofest/supabase/server';
import { validateQRToken } from '@/lib/ideofest/qr-security';
import type { ApiResponse } from '@/lib/ideofest/types';

/**
 * GET /api/ideofest/scan?action=lookup&code=... OR ?action=attended_list&event_id=...
 * - lookup: Inspects pass details, group quantity & check-in count without consuming pass.
 * - attended_list: Returns real-time validated attendance logs filtered by event_id.
 */
export async function GET(request: NextRequest) {
  const supabase = createAdminClient();
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action') || 'lookup';
  const code = (searchParams.get('code') || searchParams.get('qr_token') || '').trim();
  const eventId = searchParams.get('event_id') || searchParams.get('eventId') || '';

  try {
    if (action === 'attended_list') {
      const formattedLogs: any[] = [];
      const seenBookingIds = new Set<string>();
      const bookingIdsToFetch = new Set<string>();

      // A. Query attendance_logs directly using valid columns
      let logsQuery = supabase
        .from('attendance_logs')
        .select('id, booking_id, ticket_id, event_id, scanned_at, gate')
        .order('scanned_at', { ascending: false });

      if (eventId && eventId !== 'all') {
        logsQuery = logsQuery.eq('event_id', eventId);
      }

      const { data: rawLogs } = await logsQuery;
      if (Array.isArray(rawLogs) && rawLogs.length > 0) {
        rawLogs.forEach((l: any) => {
          if (l.booking_id) bookingIdsToFetch.add(l.booking_id);
        });
      }

      // B. Query tickets with status 'used' or 'partially_used'
      const { data: usedTickets } = await supabase
        .from('tickets')
        .select('id, booking_id, event_id, status, used_at')
        .in('status', ['used', 'partially_used']);

      if (Array.isArray(usedTickets)) {
        usedTickets.forEach((t: any) => {
          if (t.booking_id) bookingIdsToFetch.add(t.booking_id);
        });
      }

      // C. Query bookings with status 'attended' or 'partially_used'
      let bookingQuery = supabase
        .from('bookings')
        .select('id, booking_ref, attendee_name, attendee_email, attendee_nic, attendee_phone, event_id, event_title, tier_label, quantity, status, updated_at')
        .order('updated_at', { ascending: false });

      if (eventId && eventId !== 'all') {
        bookingQuery = bookingQuery.eq('event_id', eventId);
      }

      const { data: allBookings } = await bookingQuery;
      const bookingsMap = new Map<string, any>();
      if (Array.isArray(allBookings)) {
        allBookings.forEach((b: any) => {
          bookingsMap.set(b.id, b);
          if (b.status === 'attended' || b.status === 'partially_used') {
            bookingIdsToFetch.add(b.id);
          }
        });
      }

      // 1. Process logs from attendance_logs
      if (Array.isArray(rawLogs)) {
        for (const log of rawLogs) {
          if (log.booking_id) seenBookingIds.add(log.booking_id);
          const bInfo = bookingsMap.get(log.booking_id) || null;
          formattedLogs.push({
            id: log.id,
            booking_id: log.booking_id,
            ticket_id: log.ticket_id,
            event_id: log.event_id,
            scanned_by: log.scanned_by || log.scanner_name || 'Gate Staff',
            gate: log.gate || 'Main Gate',
            result: log.result || 'success',
            quantity_checked_in: log.quantity_checked_in || 1,
            scanned_at: log.scanned_at || new Date().toISOString(),
            booking: bInfo,
          });
        }
      }

      // 2. Add any booking IDs found from used tickets or attended status that weren't in attendance_logs
      for (const bId of Array.from(bookingIdsToFetch)) {
        if (!seenBookingIds.has(bId)) {
          seenBookingIds.add(bId);
          const b = bookingsMap.get(bId);
          if (b) {
            formattedLogs.push({
              id: `attended-${b.id}`,
              booking_id: b.id,
              ticket_id: null,
              event_id: b.event_id,
              scanned_by: 'Gate Staff',
              gate: 'Main Gate',
              result: 'success',
              quantity_checked_in: b.quantity || 1,
              scanned_at: b.updated_at || new Date().toISOString(),
              booking: b,
            });
          }
        }
      }

      return Response.json({ success: true, data: formattedLogs } satisfies ApiResponse);
    }

    // Action: Lookup ticket / booking details without marking as used
    if (!code) {
      return Response.json({ success: false, error: 'Code or QR token required' } satisfies ApiResponse, { status: 400 });
    }

    let extractedRef = '';
    if (code.includes('.')) {
      const validation = validateQRToken(code);
      if (validation.valid && validation.payload?.ref) {
        extractedRef = validation.payload.ref;
      }
    }

    const searchTerm = extractedRef || code;
    const bookingSelectFields = `
      id, booking_ref, event_id, event_title, event_slug, event_date, venue,
      attendee_name, attendee_email, attendee_nic, attendee_phone, additional_attendees,
      tier_label, quantity, payment_status, status
    `;

    // Query ticket / booking
    let ticket: any = null;
    const { data: byTicketNum } = await supabase
      .from('tickets')
      .select(`*, booking:bookings(${bookingSelectFields})`)
      .or(`ticket_number.eq.${searchTerm},qr_token.eq.${searchTerm}`)
      .maybeSingle();
    
    ticket = byTicketNum || null;

    if (!ticket) {
      const { data: bookingData } = await supabase
        .from('bookings')
        .select('id')
        .ilike('booking_ref', searchTerm)
        .maybeSingle();

      if (bookingData?.id) {
        const { data: bkgTickets } = await supabase
          .from('tickets')
          .select(`*, booking:bookings(${bookingSelectFields})`)
          .eq('booking_id', bookingData.id)
          .order('pass_index', { ascending: true });

        if (bkgTickets && bkgTickets.length > 0) {
          ticket = bkgTickets[0];
        }
      }
    }

    if (!ticket) {
      return Response.json({ success: false, error: `No pass or booking found for "${searchTerm}"` } satisfies ApiResponse, { status: 404 });
    }

    const booking = ticket.booking;
    const totalQty = booking?.quantity || 1;

    // Check attendance logs for previous check-ins
    const { data: logs } = await supabase
      .from('attendance_logs')
      .select('id, scanned_at, gate, quantity_checked_in')
      .eq('booking_id', ticket.booking_id)
      .eq('result', 'success');

    let previousCheckIns = 0;
    if (Array.isArray(logs) && logs.length > 0) {
      previousCheckIns = logs.reduce((sum: number, log: any) => sum + (log.quantity_checked_in || 1), 0);
    } else if (ticket.status === 'used') {
      previousCheckIns = totalQty;
    } else if (ticket.status === 'partially_used') {
      previousCheckIns = 1;
    }

    const remaining = Math.max(0, totalQty - previousCheckIns);
    const extras = Array.isArray(booking?.additional_attendees) ? booking.additional_attendees : [];
    const allAttendees = [
      {
        index: 1,
        role: `Lead Booker (1/${totalQty})`,
        name: booking?.attendee_name || ticket.attendee_name || 'Lead Booker',
        nic: booking?.attendee_nic || ticket.attendee_nic || '—',
        phone: booking?.attendee_phone || ticket.attendee_phone || '—',
      },
      ...extras.map((extra: any, idx: number) => ({
        index: idx + 2,
        role: `Attendee ${idx + 2} of ${totalQty}`,
        name: extra.name || `Attendee ${idx + 2}`,
        nic: extra.nic || '—',
        phone: extra.phone || booking?.attendee_phone || '—',
      })),
    ];

    return Response.json({
      success: true,
      data: {
        bookingId: ticket.booking_id,
        ticketId: ticket.id,
        ticket_number: ticket.ticket_number || searchTerm,
        booking_ref: booking?.booking_ref || ticket.booking_ref,
        attendee_name: booking?.attendee_name || ticket.attendee_name,
        attendee_email: booking?.attendee_email,
        attendee_nic: booking?.attendee_nic || ticket.attendee_nic,
        attendee_phone: booking?.attendee_phone || ticket.attendee_phone,
        event_title: booking?.event_title,
        event_id: booking?.event_id,
        tier_label: booking?.tier_label,
        totalQty,
        checkedIn: previousCheckIns,
        remaining,
        status: ticket.status,
        all_attendees: allAttendees,
      },
    } satisfies ApiResponse);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Lookup failed';
    return Response.json({ success: false, error: msg } satisfies ApiResponse, { status: 500 });
  }
}

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

    const bookingSelectFields = `
      id, booking_ref, event_id, event_title, event_slug, event_date, venue,
      attendee_name, attendee_email, attendee_nic, attendee_phone, additional_attendees,
      tier_label, quantity, payment_status, status
    `;

    if (extractedRef) {
      // Look up by the embedded ticket number
      const { data: byRef } = await supabase
        .from('tickets')
        .select(`*, booking:bookings(${bookingSelectFields})`)
        .eq('ticket_number', extractedRef)
        .maybeSingle();
      ticket = byRef || null;
    }

    // 3. Try matching the raw payload as a ticket number
    if (!ticket) {
      const { data: byTicketNum } = await supabase
        .from('tickets')
        .select(`*, booking:bookings(${bookingSelectFields})`)
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
          .select(`*, booking:bookings(${bookingSelectFields})`)
          .eq('booking_id', bookingData.id)
          .order('pass_index', { ascending: true });

        if (bkgTickets && bkgTickets.length > 0) {
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

    // Build multi-attendee list
    const extras = Array.isArray(booking?.additional_attendees) ? booking.additional_attendees : [];
    const allAttendees = [
      {
        index: 1,
        role: `Lead Booker (1/${totalQty})`,
        name: booking?.attendee_name || ticket.attendee_name || 'Lead Booker',
        nic: booking?.attendee_nic || ticket.attendee_nic || '—',
        phone: booking?.attendee_phone || ticket.attendee_phone || '—',
      },
      ...extras.map((extra: any, idx: number) => ({
        index: idx + 2,
        role: `Attendee ${idx + 2} of ${totalQty}`,
        name: extra.name || `Attendee ${idx + 2}`,
        nic: extra.nic || '—',
        phone: extra.phone || booking?.attendee_phone || '—',
      })),
    ];

    // Check ticket status
    if (ticket.status === 'cancelled') {
      return Response.json({ success: false, error: 'Ticket is cancelled', result: 'invalid' } satisfies ApiResponse, { status: 400 });
    }
    if (ticket.status === 'expired') {
      return Response.json({ success: false, error: 'Ticket has expired', result: 'expired' } satisfies ApiResponse, { status: 400 });
    }

    // Check attendance logs for previous check-ins
    const { data: logs } = await supabase
      .from('attendance_logs')
      .select('id, scanned_at, gate, quantity_checked_in')
      .eq('booking_id', ticket.booking_id)
      .eq('result', 'success');

    let previousCheckIns = 0;
    if (Array.isArray(logs) && logs.length > 0) {
      previousCheckIns = logs.reduce((sum: number, log: any) => sum + (log.quantity_checked_in || 1), 0);
    } else if (ticket.status === 'used') {
      previousCheckIns = totalQty;
    } else if (ticket.status === 'partially_used') {
      previousCheckIns = 1;
    }

    const remaining = Math.max(0, totalQty - previousCheckIns);

    if (remaining <= 0) {
      const lastScan = logs?.[logs.length - 1];
      return Response.json({
        success: false,
        error: `Duplicate Scan — All ${totalQty} attendee pass(es) for ${booking?.attendee_name} have already entered.`,
        result: 'duplicate',
        data: {
          attendee_name: booking?.attendee_name || ticket.attendee_name || 'Attendee',
          scanned_at: lastScan?.scanned_at || ticket.used_at || new Date().toISOString(),
          ticket_number: ticketNumber,
          totalQty,
          checkedIn: totalQty,
          remaining: 0,
          pass_index: ticket.pass_index || 1,
          all_attendees: allAttendees,
        },
      } satisfies ApiResponse, { status: 409 });
    }

    // Perform check-in logic
    const actualCheckInQty = Math.min(requestedCheckInQty, remaining);
    const newCheckedInCount = previousCheckIns + actualCheckInQty;
    const newRemaining = Math.max(0, totalQty - newCheckedInCount);
    const now = new Date().toISOString();

    // Mark ticket as used ONLY if all remaining passes are consumed, else set partially_used
    const newTicketStatus = newRemaining <= 0 ? 'used' : 'partially_used';
    await supabase
      .from('tickets')
      .update({ status: newTicketStatus, used_at: now, updated_at: now })
      .eq('id', ticket.id);

    // Update overall booking status if all passes used
    if (newRemaining <= 0 && ticket.booking_id) {
      await supabase.from('bookings').update({ status: 'attended', updated_at: now }).eq('id', ticket.booking_id);
    } else if (newRemaining > 0 && ticket.booking_id) {
      await supabase.from('bookings').update({ status: 'partially_used', updated_at: now }).eq('id', ticket.booking_id);
    }

    // Insert attendance log safely matching exact schema columns
    try {
      const { error: logErr } = await supabase.from('attendance_logs').insert({
        booking_id: ticket.booking_id,
        ticket_id: ticket.id,
        event_id: booking?.event_id || ticket.event_id,
        gate: gate || 'Main Gate',
        scanned_at: now,
      });

      if (logErr) {
        console.warn('attendance_logs insert warning:', logErr.message);
      }
    } catch (e) {
      console.error('Failed to insert attendance log:', e);
    }

    return Response.json({
      success: true,
      message: `VALID PASS — Welcome ${booking?.attendee_name}! Admitted ${actualCheckInQty} of ${totalQty} attendee(s)`,
      result: 'valid',
      data: {
        attendee_name: booking?.attendee_name || ticket.attendee_name,
        attendee_email: booking?.attendee_email,
        attendee_nic: booking?.attendee_nic || ticket.attendee_nic,
        attendee_phone: booking?.attendee_phone || ticket.attendee_phone,
        ticket_number: ticketNumber,
        booking_ref: booking?.booking_ref,
        event_title: booking?.event_title,
        tier_label: booking?.tier_label,
        quantity_checked_in: actualCheckInQty,
        totalQty,
        checkedIn: newCheckedInCount,
        remaining: newRemaining,
        pass_index: ticket.pass_index || 1,
        all_attendees: allAttendees,
        scanned_at: now,
        gate,
      },
    } satisfies ApiResponse);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'QR Scan failed';
    return Response.json({ success: false, error: msg, result: 'invalid' } satisfies ApiResponse, { status: 500 });
  }
}

/**
 * DELETE /api/ideofest/scan?booking_id=...&ticket_id=...
 * - Un-validates / resets a pass check-in entry.
 * - Restores ticket & booking status back to 'confirmed'.
 * - Deletes associated attendance_logs entries.
 */
export async function DELETE(request: NextRequest) {
  const supabase = createAdminClient();
  const { searchParams } = new URL(request.url);
  const bookingId = searchParams.get('booking_id') || searchParams.get('bookingId');
  const ticketId = searchParams.get('ticket_id') || searchParams.get('ticketId');
  const logId = searchParams.get('log_id') || searchParams.get('id');

  try {
    if (!bookingId && !ticketId && !logId) {
      return Response.json(
        { success: false, error: 'booking_id, ticket_id, or log_id is required to un-validate pass' } satisfies ApiResponse,
        { status: 400 }
      );
    }

    let targetBookingId = bookingId;

    if (logId) {
      const cleanLogId = logId.replace(/^(attended|fallback)-/, '');
      if (cleanLogId.includes('-') && cleanLogId.length === 36) {
        if (!targetBookingId) {
          const { data: b } = await supabase.from('bookings').select('id').eq('id', cleanLogId).maybeSingle();
          if (b?.id) {
            targetBookingId = b.id;
          } else {
            const { data: l } = await supabase.from('attendance_logs').select('booking_id').eq('id', cleanLogId).maybeSingle();
            if (l?.booking_id) targetBookingId = l.booking_id;
          }
        }
      }
    }

    if (!targetBookingId && ticketId) {
      const { data: t } = await supabase.from('tickets').select('booking_id').eq('id', ticketId).maybeSingle();
      if (t?.booking_id) targetBookingId = t.booking_id;
    }

    if (!targetBookingId) {
      return Response.json({ success: false, error: 'Target booking not found for un-validation' } satisfies ApiResponse, { status: 404 });
    }

    const now = new Date().toISOString();

    // 1. Reset tickets status for this booking back to 'confirmed'
    await supabase
      .from('tickets')
      .update({ status: 'confirmed', used_at: null, updated_at: now })
      .eq('booking_id', targetBookingId);

    // 2. Reset main booking status back to 'confirmed'
    await supabase
      .from('bookings')
      .update({ status: 'confirmed', updated_at: now })
      .eq('id', targetBookingId);

    // 3. Delete attendance logs for this booking
    await supabase.from('attendance_logs').delete().eq('booking_id', targetBookingId);

    return Response.json({
      success: true,
      message: 'Pass validation reset successfully. Ticket is now active and can be scanned again.',
    } satisfies ApiResponse);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Un-validation failed';
    return Response.json({ success: false, error: msg } satisfies ApiResponse, { status: 500 });
  }
}
