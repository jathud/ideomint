import { requirePortfolioAdmin } from '@/lib/portfolio/supabase';
import { logoutPortfolio } from '../actions';
export default async function ProtectedPortfolioLayout({ children }: { children: React.ReactNode }) {
  await requirePortfolioAdmin();
  return <><div className="flex flex-wrap gap-4 items-center justify-between mb-8 text-xs text-white/50"><span>Private portfolio workspace</span><form action={logoutPortfolio}><button className="min-h-11 hover:text-white">Sign out</button></form></div>{children}</>;
}
