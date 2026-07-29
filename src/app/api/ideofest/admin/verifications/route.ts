import { type NextRequest } from 'next/server';
import { createAdminClient } from '@/lib/ideofest/supabase/server';
import { generateSecureQRToken, qrExpiryFromEventDate } from '@/lib/ideofest/qr-security';
import { sendPaymentApprovedEmail, sendPaymentRejectedEmail } from '@/lib/ideofest/email';
import type { ApiResponse, IBooking, ITicket } from '@/lib/ideofest/types';

// ── POST: Admin verify slip (Approve / Reject) ────────────────
export async function POST(request: NextRequest) {
  try {
    const supabase = createAdminClient();
    const body = await request.json();

    const bookingId = body.booking_id || body.bookingId;
    const action = body.action as 'approve' | 'reject';
    const rejectionReason = body.admin_notes || body.notes || body.reason || '';

    if (!bookingId || !['approve', 'reject'].includes(action)) {
      return Response.json(
        { success: false, error: 'booking_id and action (approve/reject) are required' } satisfies ApiResponse,
        { status: 400 }
      );
    }

    // 1. Fetch booking
    const { data: booking, error: fetchError } = await supabase
      .from('bookings')
      .select('*, events(*)')
      .eq('id', bookingId)
      .single();

    if (fetchError || !booking) {
      return Response.json(
        { success: false, error: 'Booking not found' } satisfies ApiResponse,
        { status: 404 }
      );
    }

    const isApprove = action === 'approve';
    const newStatus = isApprove ? 'confirmed' : 'payment_rejected';
    const newPaymentStatus = isApprove ? 'paid' : 'rejected';

    // 2. Update booking status & store pass counts
    const qty = Math.max(1, booking.quantity || 1);
    const { error: updateError } = await supabase
      .from('bookings')
      .update({
        status: newStatus,
        payment_status: newPaymentStatus,
        admin_notes: rejectionReason || null,
        total_passes: qty,
        checked_in_count: isApprove ? 0 : booking.checked_in_count || 0,
        updated_at: new Date().toISOString(),
      })
      .eq('id', bookingId);

    if (updateError) {
      throw new Error(`Failed to update booking: ${updateError.message}`);
    }

    let issuedTicket: ITicket | undefined;

    // 3. If Approved: Issue individual passes & save every attendee detail into Supabase
    if (isApprove) {
      try {
        const eventDate = booking.events?.date || booking.event_date || new Date().toISOString();
        const eventSlug = booking.event_slug || 'event';
        const expiresAt = qrExpiryFromEventDate(eventDate);

        const extras = Array.isArray(booking.additional_attendees) ? booking.additional_attendees : [];

        for (let i = 0; i < qty; i++) {
          const passIndex = i + 1;
          const attendeeName = i === 0 ? booking.attendee_name : (extras[i - 1]?.name || `Attendee ${passIndex}`);
          const attendeeNic = i === 0 ? booking.attendee_nic : (extras[i - 1]?.nic || booking.attendee_nic);
          const attendeePhone = i === 0 ? booking.attendee_phone : (extras[i - 1]?.phone || booking.attendee_phone);

          const tempToken = generateSecureQRToken(`TEMP-${booking.booking_ref}-${passIndex}`, eventSlug, expiresAt);

          // Insert individual ticket pass into tickets table with explicit pass counts
          const { data: ticket } = await supabase
            .from('tickets')
            .insert({
              booking_id: booking.id,
              customer_id: booking.customer_id,
              qr_token: tempToken,
              qr_expires_at: expiresAt.toISOString(),
              status: 'issued',
              attendee_name: attendeeName,
              attendee_nic: attendeeNic,
              attendee_phone: attendeePhone,
              pass_index: passIndex,
              total_passes: qty,
              checked_in_count: 0,
            })
            .select()
            .single();

          if (ticket) {
            const finalQR = generateSecureQRToken(ticket.ticket_number || `${booking.booking_ref}-${passIndex}`, eventSlug, expiresAt);
            await supabase.from('tickets').update({ qr_token: finalQR }).eq('id', ticket.id);

            // Also insert into dedicated attendees table
            await supabase.from('attendees').insert({
              booking_id: booking.id,
              ticket_id: ticket.id,
              event_id: booking.event_id,
              pass_index: passIndex,
              full_name: attendeeName,
              nic_number: attendeeNic,
              phone: attendeePhone,
              email: booking.attendee_email,
              status: 'issued',
            });

            if (i === 0) issuedTicket = ticket as ITicket;
          }
        }

        // Update sold count on tier
        if (booking.ticket_tier_id) {
          const { data: tier } = await supabase
            .from('ticket_tiers')
            .select('sold')
            .eq('id', booking.ticket_tier_id)
            .single();
          if (tier) {
            await supabase
              .from('ticket_tiers')
              .update({ sold: (tier.sold || 0) + qty })
              .eq('id', booking.ticket_tier_id);
          }
        }

        // Send Email for Approved Booking
        sendPaymentApprovedEmail(booking as IBooking, issuedTicket, rejectionReason).catch((err) =>
          console.error('[sendPaymentApprovedEmail Error]:', err)
        );
      } catch (issueErr) {
        console.error('[Ticket Issuance Error]:', issueErr);
      }
    } else {
      // Send Rejection Email
      sendPaymentRejectedEmail(booking as IBooking, rejectionReason).catch((err) =>
        console.error('[sendPaymentRejectedEmail Error]:', err)
      );
    }

    return Response.json({
      success: true,
      message: `Booking ${booking.booking_ref} ${isApprove ? 'approved & tickets issued' : 'rejected'} successfully`,
      data: { booking_ref: booking.booking_ref, action, ticket: issuedTicket },
    } satisfies ApiResponse);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Admin verification failed';
    return Response.json({ success: false, error: msg } satisfies ApiResponse, { status: 500 });
  }
}
