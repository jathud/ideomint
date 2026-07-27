import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// NOTE: middleware runs in Edge Runtime — no Node.js modules allowed.
// We use the Web Crypto API (available in all Edge environments) for HMAC.

const ADMIN_COOKIE_NAME = 'ideofest_admin_session';

/** HMAC-SHA256 verification using Web Crypto API (Edge-compatible) */
async function verifyAdminCookie(value: string): Promise<boolean> {
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret || !value) return false;

  const parts = value.split('.');
  if (parts.length !== 2) return false;
  const [b64, receivedSig] = parts;

  try {
    const payload = atob(b64.replace(/-/g, '+').replace(/_/g, '/'));
    const enc = new TextEncoder();

    const key = await globalThis.crypto.subtle.importKey(
      'raw',
      enc.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );

    const sigBuf = await globalThis.crypto.subtle.sign('HMAC', key, enc.encode(payload));
    const expectedSig = Array.from(new Uint8Array(sigBuf))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    if (expectedSig.length !== receivedSig.length) return false;

    // Constant-time compare
    let diff = 0;
    for (let i = 0; i < expectedSig.length; i++) {
      diff |= expectedSig.charCodeAt(i) ^ receivedSig.charCodeAt(i);
    }
    return diff === 0;
  } catch {
    return false;
  }
}

/** Returns true when the request is coming from an admin subdomain (e.g. ideofest.localhost, ideofest.ideomint.com) */
function isIdeofestSubdomain(host: string): boolean {
  const hostname = host.split(':')[0].toLowerCase();
  return hostname === 'ideofest.localhost' || hostname.startsWith('ideofest.');
}

/** True only on plain localhost / 127.0.0.1 */
function isLocalhostMain(host: string): boolean {
  const hostname = host.split(':')[0].toLowerCase();
  return hostname === 'localhost' || hostname === '127.0.0.1';
}

export async function proxy(request: NextRequest) {
  const url = request.nextUrl.clone();
  const host = request.headers.get('host') || '';
  const pathname = url.pathname;

  // Pass through static assets and API routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/') ||
    pathname.match(/\.(png|jpg|jpeg|gif|svg|webp|ico|css|js|woff2?|ttf)$/)
  ) {
    return NextResponse.next();
  }

  const sessionCookie = request.cookies.get(ADMIN_COOKIE_NAME);
  const isAuthenticated = sessionCookie
    ? await verifyAdminCookie(sessionCookie.value)
    : false;

  // ════════════════════════════════════════════════════════════
  // CASE A: Admin Subdomain (ideofest.ideomint.com / ideofest.localhost)
  // Every request on this subdomain is mapped strictly to the Admin Portal ONLY.
  // ════════════════════════════════════════════════════════════
  if (isIdeofestSubdomain(host)) {
    let subPath = pathname;
    if (subPath.startsWith('/ideofest/admin')) {
      subPath = subPath.replace(/^\/ideofest\/admin/, '') || '/';
    }
    const isLoginPath = subPath === '/login';

    if (!isAuthenticated && !isLoginPath) {
      url.pathname = '/ideofest/admin/login';
      return NextResponse.rewrite(url);
    }
    if (isAuthenticated && isLoginPath) {
      url.pathname = '/ideofest/admin';
      return NextResponse.rewrite(url);
    }
    url.pathname = (subPath === '/' || subPath === '')
      ? '/ideofest/admin'
      : `/ideofest/admin${subPath}`;
    return NextResponse.rewrite(url);
  }

  // ════════════════════════════════════════════════════════════
  // CASE B: localhost main (dev) — redirect admin path to subdomain
  // ════════════════════════════════════════════════════════════
  if (isLocalhostMain(host) && pathname.startsWith('/ideofest/admin')) {
    const port = host.includes(':') ? `:${host.split(':')[1]}` : '';
    const cleanPath = pathname.replace(/^\/ideofest\/admin/, '') || '/';
    return NextResponse.redirect(`http://ideofest.localhost${port}${cleanPath}`);
  }

  // ════════════════════════════════════════════════════════════
  // CASE C: Production (ideomint.com, *.vercel.app, any other host)
  // No wildcard subdomain — guard /ideofest/admin via path-based auth.
  // ════════════════════════════════════════════════════════════
  if (pathname.startsWith('/ideofest/admin')) {
    const isLoginPath = pathname === '/ideofest/admin/login';

    if (!isAuthenticated && !isLoginPath) {
      url.pathname = '/ideofest/admin/login';
      return NextResponse.rewrite(url);
    }
    if (isAuthenticated && isLoginPath) {
      url.pathname = '/ideofest/admin';
      return NextResponse.rewrite(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|svg|webp|ico|woff2?|ttf)).*)',
  ],
};
