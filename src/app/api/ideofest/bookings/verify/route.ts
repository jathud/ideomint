import { type NextRequest } from 'next/server';
import { createAdminClient } from '@/lib/ideofest/supabase/server';
import { generateSecureQRToken, qrExpiryFromEventDate } from '@/lib/ideofest/qr-security';
import { sendPaymentApprovedEmail, sendPaymentRejectedEmail } from '@/lib/ideofest/email';
import { isAdminAuthenticated } from '@/lib/ideofest/auth';
import type { ApiResponse } from '@/lib/ideofest/types';

/**
 * POST /api/ideofest/bookings/verify
 * Admin: Approve or reject a bank transfer booking after reviewing slip.
 */
export async function POST(request: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return Response.json({ success: false, error: 'Unauthorized' } satisfies ApiResponse, { status: 401 });
  }

  const supabase = createAdminClient();

  try {
    const { booking_id, action, admin_notes } = await request.json();

    if (!booking_id || !['approve', 'reject'].includes(action)) {
      return Response.json({ success: false, error: 'booking_id and action (approve|reject) are required' } satisfies ApiResponse, { status: 400 });
    }

    const { data: booking, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('id', booking_id)
      .single();

    if (error || !booking) {
      return Response.json({ success: false, error: 'Booking not found' } satisfies ApiResponse, { status: 404 });
    }

    if (action === 'approve') {
      const qty = Math.max(1, booking.quantity || 1);
      // Update booking to confirmed with total_passes and initial checked_in_count
      await supabase.from('bookings').update({
        status: 'confirmed',
        payment_status: 'paid',
        paid_at: new Date().toISOString(),
        admin_notes: admin_notes || null,
        approved_by: 'admin',
        approved_at: new Date().toISOString(),
        total_passes: qty,
        checked_in_count: 0,
      }).eq('id', booking_id);

      // Fetch event for QR
      const { data: event } = await supabase
        .from('events')
        .select('date, slug')
        .eq('id', booking.event_id)
        .single();

      let ticket = null;
      if (event) {
        const expiresAt = qrExpiryFromEventDate(event.date);
        const tempQR = generateSecureQRToken('PENDING', event.slug, expiresAt);

        const { data: newTicket } = await supabase
          .from('tickets')
          .insert({
            booking_id: booking.id,
            customer_id: booking.customer_id,
            qr_token: tempQR,
            qr_expires_at: expiresAt.toISOString(),
            status: 'issued',
            total_passes: qty,
            checked_in_count: 0,
          })
          .select()
          .single();

        if (newTicket) {
          const finalQR = generateSecureQRToken(newTicket.ticket_number, event.slug, expiresAt);
          await supabase.from('tickets').update({ qr_token: finalQR }).eq('id', newTicket.id);
          ticket = { ...newTicket, qr_token: finalQR };

          // Increment sold count
          const { data: tier } = await supabase
            .from('ticket_tiers')
            .select('sold')
            .eq('id', booking.ticket_tier_id)
            .single();
          if (tier) {
            await supabase.from('ticket_tiers')
              .update({ sold: tier.sold + booking.quantity })
              .eq('id', booking.ticket_tier_id);
          }
        }
      }

      // Write audit log
      await supabase.from('audit_logs').insert({
        action: 'booking_approved',
        entity_type: 'booking',
        entity_id: booking_id,
        actor: 'admin',
        changes: { booking_ref: booking.booking_ref, admin_notes },
        ip_address: request.headers.get('x-forwarded-for'),
      });

      // Send approval email with admin notes
      sendPaymentApprovedEmail({ ...booking, status: 'confirmed' }, ticket ?? undefined, admin_notes).catch(console.error);

      return Response.json({ success: true, message: 'Booking approved and ticket issued' } satisfies ApiResponse);
    } else {
      // Reject
      await supabase.from('bookings').update({
        status: 'rejected',
        payment_status: 'rejected',
        admin_notes: admin_notes || null,
      }).eq('id', booking_id);

      sendPaymentRejectedEmail({ ...booking, status: 'rejected' }, admin_notes).catch(console.error);

      await supabase.from('audit_logs').insert({
        action: 'booking_rejected',
        entity_type: 'booking',
        entity_id: booking_id,
        actor: 'admin',
        changes: { booking_ref: booking.booking_ref, admin_notes },
      });

      sendPaymentRejectedEmail(booking, admin_notes).catch(console.error);

      return Response.json({ success: true, message: 'Booking rejected' } satisfies ApiResponse);
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Verification failed';
    return Response.json({ success: false, error: msg } satisfies ApiResponse, { status: 500 });
  }
}
