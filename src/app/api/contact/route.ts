import nodemailer from 'nodemailer';
import { z } from 'zod';

export const runtime = 'nodejs';
const attempts = new Map<string, { count: number; expires: number }>();

const enquiry = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.email().max(254),
  service: z.string().trim().max(300).default('Not sure yet'),
  message: z.string().trim().max(6000).default(''),
  company_url: z.string().max(200).default(''),
});

export async function POST(request: Request) {
  const origin = request.headers.get('origin');
  if (origin && origin !== new URL(request.url).origin) {
    return Response.json({ error: 'Please send your request from this website.' }, { status: 403 });
  }
  if (Number(request.headers.get('content-length') || 0) > 20000) {
    return Response.json({ error: 'Your message is too long.' }, { status: 413 });
  }
  let data;
  try {
    const body = await request.text();
    if (body.length > 20000) return Response.json({ error: 'Your message is too long.' }, { status: 413 });
    data = enquiry.safeParse(JSON.parse(body));
  } catch {
    return Response.json({ error: 'Please check your request and try again.' }, { status: 400 });
  }
  if (!data.success) return Response.json({ error: 'Please check your name, email and message.' }, { status: 400 });
  if (data.data.company_url) return Response.json({ error: 'Unable to send this request.' }, { status: 400 });

  const host = process.env.CONTACT_SMTP_HOST;
  const user = process.env.CONTACT_SMTP_USER;
  const pass = process.env.CONTACT_SMTP_PASSWORD;
  const port = Number(process.env.CONTACT_SMTP_PORT || 465);
  if (!host || !user || !pass || ![465, 587].includes(port)) {
    return Response.json({ error: 'The request could not be sent. Please email hello@ideomint.com or chat with us on WhatsApp.' }, { status: 503 });
  }

  // Best-effort per-instance limit in addition to the existing proxy limiter.
  const now = Date.now();
  for (const [key, bucket] of attempts) if (bucket.expires <= now) attempts.delete(key);
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'unknown';
  const bucket = attempts.get(ip);
  if ((bucket && bucket.count >= 5) || (!bucket && attempts.size >= 2000)) {
    return Response.json({ error: 'Please wait a minute before trying again, or email hello@ideomint.com.' }, { status: 429, headers: { 'Retry-After': '60' } });
  }
  attempts.set(ip, { count: (bucket?.count || 0) + 1, expires: bucket?.expires || now + 60000 });

  const transport = nodemailer.createTransport({
    host, port, secure: port === 465, requireTLS: port === 587,
    auth: { user, pass }, connectionTimeout: 10000, socketTimeout: 15000,
  });
  try {
    const { name, email, service, message } = data.data;
    const result = await transport.sendMail({
      from: { name: 'IdeoMint Website', address: user },
      to: 'hello@ideomint.com',
      replyTo: { name, address: email },
      subject: 'New project enquiry — IdeoMint website',
      text: `Name: ${name}\nEmail: ${email}\nInterested in: ${service}\n\n${message || 'No additional details provided.'}`,
      disableFileAccess: true,
      disableUrlAccess: true,
    });
    if (!result.accepted?.length) throw new Error('Recipient not accepted');
    return Response.json({ ok: true });
  } catch {
    return Response.json({ error: 'We could not send your request. Please try again or email hello@ideomint.com.' }, { status: 502 });
  } finally {
    transport.close();
  }
}
