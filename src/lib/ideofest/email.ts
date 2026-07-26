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
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

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
      console.warn(`[Nodemailer Notice] Google rejected login for ${FROM_EMAIL}. Please generate a 16-character App Password (App name: Ideofest) at https://myaccount.google.com/apppasswords and update EMAIL_PASS in .env.local.`);
    } else {
      console.error(`[Nodemailer Error] Failed to send email to ${to}:`, msg);
    }
    return { success: false, error: msg };
  }
}

// ── Base HTML Template ─────────────────────────────────────────

function baseTemplate(content: string, title: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0a0a0a; color: #e5e5e5; }
    .wrapper { max-width: 600px; margin: 0 auto; padding: 32px 16px; }
    .card { background: #111; border: 1px solid #222; border-radius: 16px; overflow: hidden; }
    .header { background: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%); padding: 32px; text-align: center; }
    .header img { height: 40px; margin-bottom: 16px; }
    .header h1 { color: #fff; font-size: 22px; font-weight: 700; letter-spacing: -0.5px; }
    .header p { color: rgba(255,255,255,0.8); font-size: 14px; margin-top: 6px; }
    .body { padding: 32px; }
    .detail-row { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #222; }
    .detail-row:last-child { border-bottom: none; }
    .detail-label { color: #888; font-size: 13px; }
    .detail-value { color: #fff; font-size: 14px; font-weight: 500; text-align: right; }
    .badge { display: inline-block; padding: 4px 12px; border-radius: 999px; font-size: 12px; font-weight: 600; }
    .badge-pending { background: #422006; color: #fb923c; }
    .badge-success { background: #052e16; color: #4ade80; }
    .badge-danger  { background: #450a0a; color: #f87171; }
    .btn { display: inline-block; background: linear-gradient(135deg,#7c3aed,#a855f7); color: #fff !important; text-decoration: none; padding: 14px 28px; border-radius: 10px; font-weight: 600; font-size: 15px; margin-top: 24px; }
    .notice { background: #1a1a2e; border-left: 3px solid #7c3aed; padding: 16px; border-radius: 0 8px 8px 0; margin: 20px 0; font-size: 13px; color: #aaa; line-height: 1.6; }
    .footer { text-align: center; padding: 24px 32px; border-top: 1px solid #222; font-size: 12px; color: #555; line-height: 1.8; }
    .footer a { color: #7c3aed; text-decoration: none; }
    h2 { color: #fff; font-size: 18px; margin-bottom: 20px; }
    p { font-size: 14px; color: #aaa; line-height: 1.7; margin-bottom: 12px; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="card">
      <div class="header">
        <h1>🎪 Ideofest × Ideomint</h1>
        <p>Sri Lanka's Premier Creative Festival Series</p>
      </div>
      <div class="body">
        ${content}
      </div>
      <div class="footer">
        <p>© 2026 Ideomint. Perfectly Minted.</p>
        <p><a href="${APP_URL}/ideofest">ideomint.com/ideofest</a> · <a href="mailto:${REPLY_TO}">support@ideomint.com</a></p>
        <p style="margin-top:8px;color:#333;">This email was sent regarding your Ideofest activity.</p>
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
  const subject = `Booking Received — ${booking.event_title} | ${booking.booking_ref}`;

  const paymentInstruction =
    booking.payment_method === 'bank_transfer'
      ? `<div class="notice">
          <strong>⏳ Awaiting Payment Verification</strong><br/>
          Please upload your bank transfer receipt in your booking portal. Our team will verify your payment within 24 hours.
        </div>`
      : `<div class="notice">
          <strong>⏳ Awaiting Payment Confirmation</strong><br/>
          We have received your booking. Payment confirmation from PayHere is being processed.
        </div>`;

  const content = `
    <h2>Booking Received! 🎉</h2>
    <p>Hi <strong>${booking.attendee_name}</strong>, your booking has been received. Here are your details:</p>
    <div style="background:#0d0d0d;border-radius:12px;padding:20px;margin:20px 0;">
      <div class="detail-row"><span class="detail-label">Booking Reference</span><span class="detail-value" style="color:#a855f7;font-family:monospace;">${booking.booking_ref}</span></div>
      <div class="detail-row"><span class="detail-label">Event</span><span class="detail-value">${booking.event_title}</span></div>
      <div class="detail-row"><span class="detail-label">Date</span><span class="detail-value">${formatDate(booking.event_date)}</span></div>
      <div class="detail-row"><span class="detail-label">Venue</span><span class="detail-value">${booking.venue}</span></div>
      <div class="detail-row"><span class="detail-label">Ticket</span><span class="detail-value">${booking.tier_label} × ${booking.quantity}</span></div>
      <div class="detail-row"><span class="detail-label">Total Amount</span><span class="detail-value">${formatLKR(booking.total_amount)}</span></div>
      <div class="detail-row"><span class="detail-label">Payment Method</span><span class="detail-value">${booking.payment_method === 'bank_transfer' ? '🏦 Bank Transfer' : '💳 PayHere'}</span></div>
      <div class="detail-row"><span class="detail-label">Status</span><span class="detail-value"><span class="badge badge-pending">Pending Verification</span></span></div>
    </div>
    ${paymentInstruction}
    <a class="btn" href="${APP_URL}/ideofest/my-tickets?ref=${booking.booking_ref}">View Booking →</a>
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
 * Payment approved + ticket ready
 */
export async function sendPaymentApprovedEmail(booking: IBooking, ticket?: ITicket, notes?: string) {
  const subject = `✅ Payment Approved — Your Ticket is Ready! | ${booking.booking_ref}`;
  const customNote = notes || booking.notes;

  const notesSection = customNote
    ? `<div style="background:#1e1b4b;border-left:4px solid #818cf8;padding:16px;border-radius:8px;margin:20px 0;">
        <p style="color:#c7d2fe;font-weight:700;font-size:13px;margin-bottom:4px;">📌 Important Note / Instructions:</p>
        <p style="color:#ffffff;font-size:14px;margin:0;line-height:1.5;">${customNote}</p>
      </div>`
    : '';

  const ticketSection = ticket
    ? `<div style="background:#0d0d0d;border-radius:12px;padding:20px;margin:20px 0;text-align:center;">
        <p style="color:#4ade80;font-weight:600;font-size:16px;">🎫 Ticket Number</p>
        <p style="font-family:monospace;font-size:22px;color:#fff;letter-spacing:2px;">${ticket.ticket_number}</p>
        ${ticket.pdf_url ? `<a class="btn" href="${ticket.pdf_url}" style="margin-top:16px;">📄 Download PDF Ticket</a>` : ''}
      </div>`
    : '';

  const content = `
    <h2>Payment Approved! 🎊</h2>
    <p>Hi <strong>${booking.attendee_name}</strong>, your payment has been verified and your ticket is confirmed!</p>
    ${notesSection}
    <div style="background:#0d0d0d;border-radius:12px;padding:20px;margin:20px 0;">
      <div class="detail-row"><span class="detail-label">Booking Reference</span><span class="detail-value" style="color:#a855f7;font-family:monospace;">${booking.booking_ref}</span></div>
      <div class="detail-row"><span class="detail-label">Event</span><span class="detail-value">${booking.event_title}</span></div>
      <div class="detail-row"><span class="detail-label">Date</span><span class="detail-value">${formatDate(booking.event_date)}</span></div>
      <div class="detail-row"><span class="detail-label">Venue</span><span class="detail-value">${booking.venue}</span></div>
      <div class="detail-row"><span class="detail-label">Amount Paid</span><span class="detail-value">${formatLKR(booking.total_amount)}</span></div>
      <div class="detail-row"><span class="detail-label">Status</span><span class="detail-value"><span class="badge badge-success">Confirmed ✓</span></span></div>
    </div>
    ${ticketSection}
    <div class="notice">
      <strong>📱 At the Event</strong><br/>
      Please bring this email or your ticket QR code. Present it at the gate for check-in. Your ticket is valid for one entry only.
    </div>
    <a class="btn" href="${APP_URL}/ideofest/my-tickets?ref=${booking.booking_ref}">View Ticket →</a>
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
  const subject = `❌ Payment Not Verified — Action Required | ${booking.booking_ref}`;

  const content = `
    <h2>Payment Not Verified</h2>
    <p>Hi <strong>${booking.attendee_name}</strong>, unfortunately we could not verify your payment for the following booking.</p>
    <div style="background:#0d0d0d;border-radius:12px;padding:20px;margin:20px 0;">
      <div class="detail-row"><span class="detail-label">Booking Reference</span><span class="detail-value" style="font-family:monospace;">${booking.booking_ref}</span></div>
      <div class="detail-row"><span class="detail-label">Event</span><span class="detail-value">${booking.event_title}</span></div>
      <div class="detail-row"><span class="detail-label">Amount</span><span class="detail-value">${formatLKR(booking.total_amount)}</span></div>
      ${reason ? `<div class="detail-row"><span class="detail-label">Reason</span><span class="detail-value">${reason}</span></div>` : ''}
      <div class="detail-row"><span class="detail-label">Status</span><span class="detail-value"><span class="badge badge-danger">Rejected</span></span></div>
    </div>
    <div class="notice">
      Please contact our support team at <a href="mailto:${REPLY_TO}" style="color:#a855f7;">${REPLY_TO}</a> quoting your booking reference <strong>${booking.booking_ref}</strong> if you believe this is an error.
    </div>
    <a class="btn" href="mailto:${REPLY_TO}?subject=Payment Dispute — ${booking.booking_ref}">Contact Support →</a>
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
  const subject = `Your Ideofest Account — ${bookingRef}`;

  const content = `
    <h2>Your Account Has Been Created 🎫</h2>
    <p>Hi <strong>${name}</strong>, an Ideofest account has been automatically created for you so you can access your tickets and booking history.</p>
    <div style="background:#0d0d0d;border-radius:12px;padding:20px;margin:20px 0;">
      <div class="detail-row"><span class="detail-label">Email</span><span class="detail-value">${email}</span></div>
      <div class="detail-row"><span class="detail-label">Temporary Password</span><span class="detail-value" style="font-family:monospace;color:#a855f7;">${tempPassword}</span></div>
    </div>
    <div class="notice">
      <strong>⚠️ Important</strong><br/>
      Please login and change your password immediately. Your temporary password expires in 48 hours.
    </div>
    <a class="btn" href="${APP_URL}/ideofest/auth/login">Login & Change Password →</a>
  `;

  const html = baseTemplate(content, subject);
  return await sendMail(email, subject, html);
}
