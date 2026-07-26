// ============================================================
// PayHere Payment Gateway Integration — Sri Lanka (LKR)
// ============================================================
import crypto from 'crypto';
import type { IBooking, IPayHereCheckout } from './types';

const PAYHERE_MERCHANT_ID = process.env.PAYHERE_MERCHANT_ID!;
const PAYHERE_SECRET = process.env.PAYHERE_MERCHANT_SECRET!;
const IS_SANDBOX = process.env.PAYHERE_SANDBOX === 'true';

export const PAYHERE_BASE_URL = IS_SANDBOX
  ? 'https://sandbox.payhere.lk/pay/checkout'
  : 'https://www.payhere.lk/pay/checkout';

/**
 * Generate the MD5 hash required by PayHere.
 * hash = MD5(merchant_id + order_id + amount + currency + MD5(secret).toUpperCase())
 */
export function generatePayHereHash(
  merchantId: string,
  orderId: string,
  amount: number,
  currency: string,
  secret: string
): string {
  const amountFormatted = amount.toFixed(2);
  const hashedSecret = crypto
    .createHash('md5')
    .update(secret)
    .digest('hex')
    .toUpperCase();

  const rawStr = `${merchantId}${orderId}${amountFormatted}${currency}${hashedSecret}`;
  return crypto.createHash('md5').update(rawStr).digest('hex').toUpperCase();
}

/**
 * Build the complete PayHere checkout payload for a booking.
 */
export function buildPayHereCheckoutPayload(booking: IBooking): IPayHereCheckout {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const orderId = booking.booking_ref;
  const amount = booking.total_amount;
  const currency = 'LKR';

  const hash = generatePayHereHash(PAYHERE_MERCHANT_ID, orderId, amount, currency, PAYHERE_SECRET);

  // Split name safely
  const nameParts = booking.attendee_name.trim().split(' ');
  const firstName = nameParts[0] || '';
  const lastName = nameParts.slice(1).join(' ') || '-';

  return {
    merchant_id: PAYHERE_MERCHANT_ID,
    return_url: `${baseUrl}/ideofest/booking/payhere-return?ref=${orderId}`,
    cancel_url: `${baseUrl}/ideofest/booking/payhere-cancel?ref=${orderId}`,
    notify_url: `${baseUrl}/api/ideofest/payhere/notify`,
    order_id: orderId,
    items: `${booking.tier_label} × ${booking.quantity} — ${booking.event_title}`,
    amount: amount.toFixed(2),
    currency,
    first_name: firstName,
    last_name: lastName,
    email: booking.attendee_email,
    phone: booking.attendee_phone || '',
    address: [booking.address_line_1, booking.address_line_2].filter(Boolean).join(', '),
    city: booking.city || 'Colombo',
    country: booking.country || 'Sri Lanka',
    hash,
  };
}

/**
 * Verify the PayHere webhook notification signature.
 * Called from the /api/ideofest/payhere/notify endpoint.
 */
export function verifyPayHereNotification(params: Record<string, string>): boolean {
  const { merchant_id, order_id, payhere_amount, payhere_currency, status_code, md5sig } = params;

  if (!merchant_id || !order_id || !payhere_amount || !payhere_currency || !status_code || !md5sig) {
    return false;
  }

  const hashedSecret = crypto
    .createHash('md5')
    .update(PAYHERE_SECRET)
    .digest('hex')
    .toUpperCase();

  const rawStr = `${merchant_id}${order_id}${payhere_amount}${payhere_currency}${status_code}${hashedSecret}`;
  const expectedSig = crypto.createHash('md5').update(rawStr).digest('hex').toUpperCase();

  return crypto.timingSafeEqual(
    Buffer.from(expectedSig.toLowerCase()),
    Buffer.from(md5sig.toLowerCase())
  );
}

/**
 * PayHere status codes:
 *  2 = Success
 *  0 = Pending
 * -1 = Cancelled
 * -2 = Failed
 * -3 = Chargeback
 */
export function payHereStatusToBooking(statusCode: string) {
  switch (statusCode) {
    case '2':
      return { payment_status: 'paid', booking_status: 'confirmed' };
    case '0':
      return { payment_status: 'pending_verification', booking_status: 'pending_verification' };
    case '-1':
      return { payment_status: 'cancelled', booking_status: 'cancelled' };
    case '-2':
    case '-3':
      return { payment_status: 'failed', booking_status: 'cancelled' };
    default:
      return { payment_status: 'pending', booking_status: 'pending' };
  }
}
