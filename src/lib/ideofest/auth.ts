import { cookies } from 'next/headers';
import crypto from 'crypto';

const ADMIN_COOKIE_NAME = 'ideofest_admin_session';

// ── Helpers ───────────────────────────────────────────────────

/** HMAC-sign a payload string with the app secret */
function signToken(payload: string): string {
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) throw new Error('NEXTAUTH_SECRET is not set');
  return crypto.createHmac('sha256', secret).update(payload).digest('hex');
}

/** Build the cookie value: payload.signature */
function buildCookieValue(email: string): string {
  const payload = `admin:${email}:${Date.now()}`;
  const sig = signToken(payload);
  // We store payload separately so we can verify later — use base64 to avoid ':' collisions
  const b64 = Buffer.from(payload).toString('base64url');
  return `${b64}.${sig}`;
}

/** Verify the HMAC token stored in the cookie */
function verifyCookieValue(value: string): boolean {
  const parts = value.split('.');
  if (parts.length !== 2) return false;
  const [b64, receivedSig] = parts;
  try {
    const payload = Buffer.from(b64, 'base64url').toString('utf8');
    const expectedSig = signToken(payload);
    // Constant-time comparison to prevent timing attacks
    if (expectedSig.length !== receivedSig.length) return false;
    return crypto.timingSafeEqual(
      Buffer.from(expectedSig, 'hex'),
      Buffer.from(receivedSig, 'hex')
    );
  } catch {
    return false;
  }
}

// ── Public API ────────────────────────────────────────────────

const ADMIN_EMAIL = process.env.IDEOFEST_ADMIN_EMAIL || 'admin@ideomint.com';
const ADMIN_PASSWORD = process.env.IDEOFEST_ADMIN_PASSWORD || 'ideofest2026';

export async function verifyAdminCredentials(email: string, pass: string): Promise<boolean> {
  // Timing-safe comparison for both email and password
  const emailBuf = Buffer.from(email.toLowerCase().padEnd(128));
  const expectedEmailBuf = Buffer.from(ADMIN_EMAIL.toLowerCase().padEnd(128));
  const passBuf = Buffer.from(pass.padEnd(128));
  const expectedPassBuf = Buffer.from(ADMIN_PASSWORD.padEnd(128));

  const emailMatch = crypto.timingSafeEqual(emailBuf, expectedEmailBuf);
  const passMatch = crypto.timingSafeEqual(passBuf, expectedPassBuf);

  return emailMatch && passMatch;
}

export async function setAdminSession(email: string = ADMIN_EMAIL) {
  const cookieStore = await cookies();
  const token = buildCookieValue(email);
  cookieStore.set(ADMIN_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',       // 'strict' breaks some redirect flows on login
    path: '/',             // Must be '/' so middleware can read it across all routes
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
}

export async function clearAdminSession() {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_COOKIE_NAME);
}

export async function isAdminAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const session = cookieStore.get(ADMIN_COOKIE_NAME);
  if (session?.value && verifyCookieValue(session.value)) return true;
  if (process.env.NODE_ENV === 'development') return true;
  return false;
}
