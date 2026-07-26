import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import crypto from 'crypto';

const ADMIN_COOKIE_NAME = 'ideofest_admin_session';

/** HMAC token verification for admin cookie */
function verifyAdminCookie(value: string): boolean {
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret || !value) return false;

  const parts = value.split('.');
  if (parts.length !== 2) return false;
  const [b64, receivedSig] = parts;

  try {
    const payload = Buffer.from(b64, 'base64url').toString('utf8');
    const expectedSig = crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex');

    if (expectedSig.length !== receivedSig.length) return false;
    return crypto.timingSafeEqual(
      Buffer.from(expectedSig, 'hex'),
      Buffer.from(receivedSig, 'hex')
    );
  } catch {
    return false;
  }
}

/** Check if host header matches ideofest subdomain */
function isIdeofestSubdomain(host: string): boolean {
  const hostname = host.split(':')[0].toLowerCase();
  return hostname === 'ideofest.localhost' || hostname.startsWith('ideofest.');
}

export function proxy(request: NextRequest) {
  const url = request.nextUrl.clone();
  const host = request.headers.get('host') || '';
  const pathname = url.pathname;
  const port = host.includes(':') ? `:${host.split(':')[1]}` : '';

  const isSubdomain = isIdeofestSubdomain(host);

  // Allow static assets, images, and next internal files
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/') ||
    pathname.match(/\.(png|jpg|jpeg|gif|svg|webp|ico|css|js)$/)
  ) {
    return NextResponse.next();
  }

  // Check admin auth status
  const sessionCookie = request.cookies.get(ADMIN_COOKIE_NAME);
  const isAuthenticated = Boolean(sessionCookie && verifyAdminCookie(sessionCookie.value));

  // ════════════════════════════════════════════════════════════
  // CASE A: Accessing via MAIN DOMAIN (e.g. localhost:3000)
  //
  // Admin panel is NOT allowed directly on localhost:3000/ideofest/admin/...
  // It redirects to the ideofest subdomain (ideofest.localhost:3000/...)
  // ════════════════════════════════════════════════════════════
  if (!isSubdomain) {
    if (pathname.startsWith('/ideofest/admin')) {
      const cleanPath = pathname.replace(/^\/ideofest\/admin/, '') || '/';
      const protocol = request.nextUrl.protocol || 'http:';
      const targetHost = `ideofest.localhost${port}`;
      return NextResponse.redirect(`${protocol}//${targetHost}${cleanPath}`);
    }

    return NextResponse.next();
  }

  // ════════════════════════════════════════════════════════════
  // CASE B: Accessing via IDEOFEST SUBDOMAIN (ideofest.localhost:3000)
  // All pages on this subdomain ARE the Admin Portal.
  // Clean URLs:
  //   http://ideofest.localhost:3000/          → Dashboard
  //   http://ideofest.localhost:3000/events    → My Events
  //   http://ideofest.localhost:3000/attendees → Attendees
  //   http://ideofest.localhost:3000/login     → Admin Login
  // ════════════════════════════════════════════════════════════

  // Normalize path if accessed with /ideofest/admin prefix
  let subPath = pathname;
  if (subPath.startsWith('/ideofest/admin')) {
    subPath = subPath.replace(/^\/ideofest\/admin/, '') || '/';
  }

  const isLoginPath = subPath === '/login';

  // ── Auth Guard ──────────────────────────────────────────────
  if (!isAuthenticated && !isLoginPath) {
    url.pathname = '/ideofest/admin/login';
    return NextResponse.rewrite(url);
  }

  if (isAuthenticated && isLoginPath) {
    url.pathname = '/ideofest/admin';
    return NextResponse.rewrite(url);
  }

  // ── Rewrite to internal admin route ─────────────────────────
  if (subPath === '/' || subPath === '') {
    url.pathname = '/ideofest/admin';
  } else {
    url.pathname = `/ideofest/admin${subPath}`;
  }

  return NextResponse.rewrite(url);
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|svg|webp|ico|woff2?|ttf)).*)',
  ],
};
