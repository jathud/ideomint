// ============================================================
// Email Service — Nodemailer Provider
// All transactional emails for Ideofest
// ============================================================
import nodemailer from 'nodemailer';
import { createAdminClient } from './supabase/server';
import type { IBooking, ITicket, IEvent } from './types';

const SMTP_HOST = process.env.SMTP_HOST || 'smtp.gmail.com';
const SMTP_PORT = parseInt(process.env.SMTP_PORT || '587');
const SMTP_USER = process.env.EMAIL_USER || process.env.SMTP_USER || process.env.EMAIL_FROM || '';
const SMTP_PASS = process.env.EMAIL_PASS || process.env.SMTP_PASS || '';
const EMAIL_SERVICE = process.env.EMAIL_SERVICE || (SMTP_HOST.includes('gmail') ? 'gmail' : '');
const SMTP_SECURE = process.env.SMTP_SECURE === 'true' || SMTP_PORT === 465;

const FROM_EMAIL = process.env.EMAIL_FROM || SMTP_USER || 'ideoment@gmail.com';
const REPLY_TO = process.env.EMAIL_REPLY_TO || 'ideomint@gmail.com';

function getAppUrl(): string {
  const envUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.VERCEL_URL;
  if (envUrl && !envUrl.includes('localhost')) {
    return envUrl.startsWith('http') ? envUrl : `https://${envUrl}`;
  }
  if (process.env.NODE_ENV === 'production') {
    return 'https://ideomint.com';
  }
  return 'https://ideomint.com';
}

function getTransporter() {
  const user = process.env.EMAIL_USER || process.env.SMTP_USER || process.env.EMAIL_FROM || '';
  const pass = process.env.EMAIL_PASS || process.env.SMTP_PASS || '';
  const service = process.env.EMAIL_SERVICE;

  if (!user || !pass) {
    return null;
  }

  if (service) {
    return nodemailer.createTransport({
      service,
      auth: { user, pass },
    });
  }

  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_SECURE,
    auth: { user, pass },
  });
}

// ── Helpers ───────────────────────────────────────────────────

function formatLKR(amount: number): string {
  return `LKR ${amount.toLocaleString('en-LK', { minimumFractionDigits: 2 })}`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-LK', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

async function logEmail(params: {
  customer_id?: string;
  booking_id?: string;
  template: string;
  to_email: string;
  subject: string;
  provider_id?: string;
  status: string;
  error?: string;
}) {
  try {
    const supabase = createAdminClient();
    await supabase.from('email_logs').insert(params);
  } catch (err) {
    console.warn('[logEmail Warning]:', err);
  }
}

async function sendMail(to: string, subject: string, html: string) {
  const transporter = getTransporter();
  if (!transporter) {
    console.warn(`[Nodemailer Warning] Email credentials not configured in .env.local. Email skipped for: ${to}`);
    return { success: false, message: 'Nodemailer credentials missing' };
  }

  try {
    const info = await transporter.sendMail({
      from: `Ideofest <${FROM_EMAIL}>`,
      to,
      subject,
      html,
      replyTo: REPLY_TO,
    });
    console.log(`[Nodemailer] Email sent successfully to ${to} (Message ID: ${info.messageId})`);
    return { success: true, messageId: info.messageId };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes('535') || msg.includes('BadCredentials') || msg.includes('Username and Password not accepted')) {
      console.warn(`[Nodemailer Notice] Google rejected login for ${FROM_EMAIL}. Please generate a 16-character App Password at https://myaccount.google.com/apppasswords and update EMAIL_PASS in .env.local.`);
    } else {
      console.error(`[Nodemailer Error] Failed to send email to ${to}:`, msg);
    }
    return { success: false, error: msg };
  }
}

// ── Base HTML Template ─────────────────────────────────────────

function baseTemplate(content: string, title: string): string {
  const appUrl = getAppUrl();
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #05070d; color: #e5e5e5; }
    .wrapper { max-width: 600px; margin: 0 auto; padding: 32px 16px; }
    .card { background: #11141d; border: 1px solid #222736; border-radius: 20px; overflow: hidden; }
    .header { background: linear-gradient(135deg, #11141d 0%, #1a1f2e 100%); border-b: 1px solid #222736; padding: 32px; text-align: center; }
    .header h1 { color: #c1e527; font-size: 24px; font-weight: 900; letter-spacing: 1px; }
    .header p { color: rgba(255,255,255,0.7); font-size: 13px; margin-top: 6px; }
    .body { padding: 32px; }
    .detail-row { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #222736; }
    .detail-row:last-child { border-bottom: none; }
    .detail-label { color: #888; font-size: 13px; }
    .detail-value { color: #fff; font-size: 14px; font-weight: 600; text-align: right; }
    .badge { display: inline-block; padding: 4px 12px; border-radius: 999px; font-size: 12px; font-weight: 700; }
    .badge-pending { background: #422006; color: #fb923c; }
    .badge-success { background: #052e16; color: #4ade80; }
    .badge-danger  { background: #450a0a; color: #f87171; }
    .btn { display: inline-block; background: linear-gradient(135deg, #c1e527, #d4ff33); color: #05070d !important; text-decoration: none; padding: 14px 28px; border-radius: 12px; font-weight: 900; font-size: 15px; margin-top: 24px; text-align: center; }
    .notice { background: #181d2c; border-left: 4px solid #c1e527; padding: 16px; border-radius: 0 12px 12px 0; margin: 20px 0; font-size: 13px; color: #ccc; line-height: 1.6; }
    .footer { text-align: center; padding: 24px 32px; border-top: 1px solid #222736; font-size: 12px; color: #666; line-height: 1.8; }
    .footer a { color: #c1e527; text-decoration: none; }
    h2 { color: #fff; font-size: 20px; margin-bottom: 16px; font-weight: 800; }
    p { font-size: 14px; color: #aaa; line-height: 1.7; margin-bottom: 12px; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="card">
      <div class="header">
        <h1>IDEOMINT × IDEOFEST</h1>
        <p>Sri Lanka's Premier Live Event Series</p>
      </div>
      <div class="body">
        ${content}
      </div>
      <div class="footer">
        <p>© 2026 Ideomint. Perfectly Minted.</p>
        <p><a href="${appUrl}/ideofest">${appUrl.replace('https://', '')}/ideofest</a> · <a href="mailto:${REPLY_TO}">support@ideomint.com</a></p>
      </div>
    </div>
  </div>
</body>
</html>`;
}

// ── Email Senders ─────────────────────────────────────────────

/**
 * Booking confirmation (pending payment verification)
 */
export async function sendBookingConfirmationEmail(booking: IBooking) {
  const appUrl = getAppUrl();
  const subject = `Booking Received — ${booking.event_title} | ${booking.booking_ref}`;

  const paymentInstruction =
    booking.payment_method === 'bank_transfer'
      ? `<div class="notice">
          <strong>⏳ Awaiting Payment Receipt Verification</strong><br/>
          Please upload your bank transfer receipt in your booking portal if not already uploaded. Our team will verify your payment within 24 hours.
        </div>`
      : `<div class="notice">
          <strong>⏳ Awaiting Payment Confirmation</strong><br/>
          We have received your booking. Payment confirmation is being processed.
        </div>`;

  const content = `
    <h2>Booking Received! 🎉</h2>
    <p>Hi <strong>${booking.attendee_name}</strong>, your booking request has been received. Here are your details:</p>
    <div style="background:#0c0f17;border:1px solid #1e2433;border-radius:14px;padding:20px;margin:20px 0;">
      <div class="detail-row"><span class="detail-label">Booking Reference</span><span class="detail-value" style="color:#c1e527;font-family:monospace;">${booking.booking_ref}</span></div>
      <div class="detail-row"><span class="detail-label">Event</span><span class="detail-value">${booking.event_title}</span></div>
      <div class="detail-row"><span class="detail-label">Date</span><span class="detail-value">${formatDate(booking.event_date)}</span></div>
      <div class="detail-row"><span class="detail-label">Venue</span><span class="detail-value">${booking.venue}</span></div>
      <div class="detail-row"><span class="detail-label">Pass Tier</span><span class="detail-value">${booking.tier_label} × ${booking.quantity}</span></div>
      <div class="detail-row"><span class="detail-label">Total Amount</span><span class="detail-value">${formatLKR(booking.total_amount)}</span></div>
      <div class="detail-row"><span class="detail-label">Payment Method</span><span class="detail-value">${booking.payment_method === 'bank_transfer' ? '🏦 Bank Transfer' : '💳 PayHere'}</span></div>
      <div class="detail-row"><span class="detail-label">Status</span><span class="detail-value"><span class="badge badge-pending">Pending Verification</span></span></div>
    </div>
    ${paymentInstruction}
    <a class="btn" href="${appUrl}/ideofest/my-tickets?ref=${booking.booking_ref}">View My Booking →</a>
  `;

  const html = baseTemplate(content, subject);
  const result = await sendMail(booking.attendee_email, subject, html);
  await logEmail({
    customer_id: booking.customer_id,
    booking_id: booking.id,
    template: 'booking_confirmation',
    to_email: booking.attendee_email,
    subject,
    status: result.success ? 'sent' : 'failed',
    provider_id: result.messageId,
    error: result.error,
  });
  return result;
}

/**
 * Payment approved + ticket ready + Attached QR Code Image
 */
export async function sendPaymentApprovedEmail(booking: IBooking, ticket?: ITicket, notes?: string) {
  const appUrl = getAppUrl();
  const subject = `✅ Official Entry Pass — ${booking.event_title} | ${booking.booking_ref}`;
  const customNote = notes || booking.notes;

  const notesSection = customNote
    ? `<div style="background:#1a1d2d;border-left:4px solid #6366f1;padding:16px;border-radius:12px;margin:20px 0;">
        <p style="color:#a5b4fc;font-weight:700;font-size:12px;margin-bottom:4px;text-transform:uppercase;">📌 Organizer Instructions:</p>
        <p style="color:#ffffff;font-size:14px;margin:0;line-height:1.5;">${customNote}</p>
      </div>`
    : '';

  // Generate QR Code image URL for embedded email display
  const qrData = ticket?.qr_token || booking.booking_ref;
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrData)}`;

  const qrSection = `
    <div style="background:#0c0f17;border:1px solid #1e2433;border-radius:16px;padding:24px;margin:24px 0;text-align:center;">
      <p style="color:#c1e527;font-weight:800;font-size:11px;text-transform:uppercase;letter-spacing:1.5px;margin-bottom:8px;">OFFICIAL ENTRY TICKET PASS</p>
      <p style="font-family:monospace;font-size:22px;color:#ffffff;font-weight:bold;letter-spacing:2px;margin-bottom:16px;">${ticket?.ticket_number || booking.booking_ref}</p>

      <!-- Embedded Visual QR Code Image -->
      <div style="background:#ffffff;padding:16px;border-radius:16px;display:inline-block;margin:8px 0;box-shadow:0 0 20px rgba(193,229,39,0.2);">
        <img src="${qrImageUrl}" alt="Gate Entry QR Pass" width="220" height="220" style="display:block;margin:0 auto;border-radius:8px;" />
      </div>

      <p style="color:#a1a1aa;font-size:12px;margin-top:12px;">Scan this QR code at gate entry for instant check-in.</p>
    </div>
  `;

  const content = `
    <h2>Payment Verified & Pass Issued! 🎊</h2>
    <p>Hi <strong>${booking.attendee_name}</strong>, your ticket booking for <strong>${booking.event_title}</strong> is confirmed!</p>
    ${notesSection}
    ${qrSection}
    <div style="background:#0c0f17;border:1px solid #1e2433;border-radius:14px;padding:20px;margin:20px 0;">
      <div class="detail-row"><span class="detail-label">Booking Reference</span><span class="detail-value" style="color:#c1e527;font-family:monospace;">${booking.booking_ref}</span></div>
      <div class="detail-row"><span class="detail-label">Event</span><span class="detail-value">${booking.event_title}</span></div>
      <div class="detail-row"><span class="detail-label">Date</span><span class="detail-value">${formatDate(booking.event_date)}</span></div>
      <div class="detail-row"><span class="detail-label">Venue</span><span class="detail-value">${booking.venue}</span></div>
      <div class="detail-row"><span class="detail-label">Pass Tier</span><span class="detail-value">${booking.tier_label} × ${booking.quantity}</span></div>
      <div class="detail-row"><span class="detail-label">Total Amount</span><span class="detail-value">${formatLKR(booking.total_amount)}</span></div>
      <div class="detail-row"><span class="detail-label">Status</span><span class="detail-value"><span class="badge badge-success">Confirmed ✓</span></span></div>
    </div>
    <div class="notice">
      <strong>📱 Gate Entry Instructions</strong><br/>
      Present the QR code above or your booking reference <strong>${booking.booking_ref}</strong> at the venue entrance. Your pass is valid for entry.
    </div>
    <a class="btn" href="${appUrl}/ideofest/my-tickets?ref=${booking.booking_ref}">Open Live Ticket Wallet →</a>
  `;

  const html = baseTemplate(content, subject);
  const result = await sendMail(booking.attendee_email, subject, html);
  await logEmail({
    customer_id: booking.customer_id,
    booking_id: booking.id,
    template: 'payment_approved',
    to_email: booking.attendee_email,
    subject,
    status: result.success ? 'sent' : 'failed',
    provider_id: result.messageId,
    error: result.error,
  });
  return result;
}

/**
 * Payment rejected
 */
export async function sendPaymentRejectedEmail(booking: IBooking, reason?: string) {
  const appUrl = getAppUrl();
  const subject = `❌ Payment Not Verified — Action Required | ${booking.booking_ref}`;

  const content = `
    <h2>Payment Receipt Not Verified</h2>
    <p>Hi <strong>${booking.attendee_name}</strong>, we could not verify your payment receipt for the following booking.</p>
    <div style="background:#0c0f17;border:1px solid #1e2433;border-radius:14px;padding:20px;margin:20px 0;">
      <div class="detail-row"><span class="detail-label">Booking Reference</span><span class="detail-value" style="font-family:monospace;color:#f87171;">${booking.booking_ref}</span></div>
      <div class="detail-row"><span class="detail-label">Event</span><span class="detail-value">${booking.event_title}</span></div>
      <div class="detail-row"><span class="detail-label">Amount</span><span class="detail-value">${formatLKR(booking.total_amount)}</span></div>
      ${reason ? `<div class="detail-row"><span class="detail-label">Reason</span><span class="detail-value" style="color:#f87171;">${reason}</span></div>` : ''}
      <div class="detail-row"><span class="detail-label">Status</span><span class="detail-value"><span class="badge badge-danger">Rejected</span></span></div>
    </div>
    <div class="notice">
      Please contact support at <a href="mailto:${REPLY_TO}" style="color:#c1e527;">${REPLY_TO}</a> quoting reference <strong>${booking.booking_ref}</strong> if you believe this is an error or need to re-upload your payment receipt.
    </div>
    <a class="btn" href="${appUrl}/ideofest/my-tickets?ref=${booking.booking_ref}">Re-upload Payment Slip →</a>
  `;

  const html = baseTemplate(content, subject);
  const result = await sendMail(booking.attendee_email, subject, html);
  await logEmail({
    customer_id: booking.customer_id,
    booking_id: booking.id,
    template: 'payment_rejected',
    to_email: booking.attendee_email,
    subject,
    status: result.success ? 'sent' : 'failed',
    provider_id: result.messageId,
    error: result.error,
  });
  return result;
}

/**
 * Guest auto-account created
 */
export async function sendAutoAccountEmail(
  email: string,
  name: string,
  tempPassword: string,
  bookingRef: string
) {
  const appUrl = getAppUrl();
  const subject = `Your Ideofest Account — ${bookingRef}`;

  const content = `
    <h2>Your Account Has Been Created 🎫</h2>
    <p>Hi <strong>${name}</strong>, an Ideofest account has been created for you so you can access your tickets and booking history.</p>
    <div style="background:#0c0f17;border:1px solid #1e2433;border-radius:14px;padding:20px;margin:20px 0;">
      <div class="detail-row"><span class="detail-label">Email</span><span class="detail-value">${email}</span></div>
      <div class="detail-row"><span class="detail-label">Temporary Password</span><span class="detail-value" style="font-family:monospace;color:#c1e527;">${tempPassword}</span></div>
    </div>
    <div class="notice">
      <strong>⚠️ Important</strong><br/>
      Please login and change your password immediately.
    </div>
    <a class="btn" href="${appUrl}/ideofest/admin/login">Login to My Account →</a>
  `;

  const html = baseTemplate(content, subject);
  return await sendMail(email, subject, html);
}
