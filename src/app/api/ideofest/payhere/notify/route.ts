import { type NextRequest } from 'next/server';
import { createAdminClient } from '@/lib/ideofest/supabase/server';
import { verifyPayHereNotification, payHereStatusToBooking } from '@/lib/ideofest/payhere';
import { generateSecureQRToken, qrExpiryFromEventDate } from '@/lib/ideofest/qr-security';
import { sendPaymentApprovedEmail, sendPaymentRejectedEmail } from '@/lib/ideofest/email';

/**
 * PayHere Payment Notification Webhook
 * POST /api/ideofest/payhere/notify
 * Called by PayHere servers after every payment attempt.
 */
export async function POST(request: NextRequest) {
  const supabase = createAdminClient();

  try {
    const formData = await request.formData();
    const params: Record<string, string> = {};
    formData.forEach((value, key) => { params[key] = String(value); });

    // 1. Verify signature
    if (!verifyPayHereNotification(params)) {
      console.error('[PayHere] Invalid signature:', params);
      return new Response('Invalid signature', { status: 400 });
    }

    const { order_id, status_code, payhere_amount, payhere_currency, payment_id } = params;

    // 2. Find booking
    const { data: booking, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('booking_ref', order_id)
      .single();

    if (error || !booking) {
      console.error('[PayHere] Booking not found:', order_id);
      return new Response('Booking not found', { status: 404 });
    }

    // 3. Map PayHere status
    const { payment_status, booking_status } = payHereStatusToBooking(status_code);

    // 4. Update booking
    const updateData: Record<string, unknown> = {
      payment_status,
      status: booking_status,
      gateway_payment_id: payment_id,
      gateway_status_code: status_code,
    };
    if (payment_status === 'paid') {
      updateData.paid_at = new Date().toISOString();
    }

    await supabase.from('bookings').update(updateData).eq('id', booking.id);

    // 5. For successful payment: issue ticket
    if (payment_status === 'paid') {
      // Fetch event for QR expiry
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
          })
          .select()
          .single();

        if (newTicket) {
          const finalQR = generateSecureQRToken(newTicket.ticket_number, event.slug, expiresAt);
          await supabase.from('tickets').update({ qr_token: finalQR }).eq('id', newTicket.id);
          ticket = { ...newTicket, qr_token: finalQR };

          // Update sold count
          await supabase.rpc('increment_sold', {
            tier_id: booking.ticket_tier_id,
            qty: booking.quantity,
          });
        }
      }

      // Send approval email
      sendPaymentApprovedEmail(booking, ticket ?? undefined).catch(console.error);
    } else if (payment_status === 'failed' || payment_status === 'cancelled') {
      sendPaymentRejectedEmail(booking, `PayHere status: ${status_code}`).catch(console.error);
    }

    // PayHere expects "OK" or HTTP 200
    return new Response('OK', { status: 200 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Internal error';
    console.error('[PayHere notify]', msg);
    return new Response('Internal Server Error', { status: 500 });
  }
}
