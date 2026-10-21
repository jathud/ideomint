import 'server-only';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export const portfolioCookie = { name: 'ideomint_portfolio_auth', httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax' as const, path: '/' };
export function portfolioConfigured() {
  return Boolean(process.env.PORTFOLIO_SUPABASE_URL && process.env.PORTFOLIO_SUPABASE_ANON_KEY);
}
export function publicPortfolioClient() {
  if (!portfolioConfigured()) throw new Error('Portfolio Supabase is not configured.');
  return createSupabaseClient(process.env.PORTFOLIO_SUPABASE_URL!, process.env.PORTFOLIO_SUPABASE_ANON_KEY!, { auth: { autoRefreshToken: false, persistSession: false }, global: { fetch: (input, init) => fetch(input, { ...init, cache: 'no-store' }) } });
}
export async function portfolioSessionClient() {
  if (!portfolioConfigured()) throw new Error('Portfolio Supabase is not configured.');
  const jar = await cookies();
  return createServerClient(process.env.PORTFOLIO_SUPABASE_URL!, process.env.PORTFOLIO_SUPABASE_ANON_KEY!, {
    cookieOptions: portfolioCookie,
    cookies: { getAll: () => jar.getAll(), setAll(values) { try { values.forEach(({ name, value, options }) => jar.set(name, value, options)); } catch { /* Server Component; proxy persists refreshed cookies. */ } } },
  });
}
export async function authorizedPortfolioClient() {
  const client = await portfolioSessionClient();
  const { data: { user }, error } = await client.auth.getUser();
  if (error || !user) throw new Error('Sign in to manage portfolios.');
  const { data: membership, error: permissionError } = await client.from('portfolio_admins').select('user_id').eq('user_id', user.id).eq('active', true).maybeSingle();
  if (permissionError || !membership) throw new Error('Portfolio administrator access is required.');
  return client;
}
export async function requirePortfolioAdmin() {
  if (!portfolioConfigured()) redirect('/admin/login');
  try { return await authorizedPortfolioClient(); } catch { redirect('/admin/login'); }
}
