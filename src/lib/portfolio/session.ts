import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

/** Only called on /admin routes; never shares IdeoFest's admin session. */
export async function refreshPortfolioSession(request: NextRequest) {
  let response = NextResponse.next({ request });
  if (!process.env.PORTFOLIO_SUPABASE_URL || !process.env.PORTFOLIO_SUPABASE_ANON_KEY) return response;
  const client = createServerClient(process.env.PORTFOLIO_SUPABASE_URL, process.env.PORTFOLIO_SUPABASE_ANON_KEY, {
    cookieOptions: { name: 'ideomint_portfolio_auth', httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/' },
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll(values) {
        values.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        values.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });
  await client.auth.getUser();
  response.headers.set('Cache-Control', 'private, no-store');
  return response;
}
