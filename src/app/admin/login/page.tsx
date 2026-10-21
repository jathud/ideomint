import PortfolioLogin from '@/components/admin/PortfolioLogin';
import { portfolioConfigured } from '@/lib/portfolio/supabase';

export default function PortfolioLoginPage() {
  const configured = portfolioConfigured();
  return <div className="max-w-lg mx-auto">
    <p className="text-xs uppercase tracking-widest text-creative-flame font-bold mb-4">Portfolio administration</p>
    <h1 className="text-3xl md:text-4xl font-black tracking-tight mb-4">Your work. Ready to share.</h1>
    <p className="text-sm text-white/60 leading-relaxed mb-8">Manage projects, service categories, photo groups, and publishing.</p>
    {configured ? <PortfolioLogin /> : <section className="rounded-2xl border border-white/15 bg-white/5 p-6 space-y-5">
      <h2 className="text-xl font-bold">Database connection needed</h2>
      <p className="text-sm text-white/70 leading-relaxed">The portfolio editor is installed, but it cannot securely sign you in until a development Supabase project is connected.</p>
      <ol className="list-decimal pl-5 space-y-3 text-sm text-white/70 leading-relaxed">
        <li>Ask the database owner for a development project URL and its publishable/anon API key.</li>
        <li>Set <code className="break-all">PORTFOLIO_SUPABASE_URL</code> and <code className="break-all">PORTFOLIO_SUPABASE_ANON_KEY</code> in the local <code>.env.local</code> file, then restart the server.</li>
        <li>Have the owner review/apply the new portfolio-only migration and grant your Auth account portfolio-admin membership.</li>
      </ol>
      <p className="text-xs text-white/50 leading-relaxed">No shared password or authentication bypass is provided. See docs/portfolio-admin.md for the exact setup and verification steps.</p>
    </section>}
  </div>;
}
