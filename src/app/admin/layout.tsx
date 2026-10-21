import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = { title: 'Portfolio Admin | IdeoMint', robots: { index: false, follow: false }, alternates: { canonical: null } };
export const dynamic = 'force-dynamic';

export default function PortfolioAdminLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-section-ink text-white">
    <header className="border-b border-white/10"><div className="container-layout py-6 flex flex-wrap gap-4 justify-between items-center">
      <Link href="/admin/work" className="font-black tracking-widest uppercase">Ideo<span className="text-creative-flame">Mint</span> <span className="text-xs text-white/50 ml-3">Portfolio</span></Link>
      <Link href="/" className="text-sm text-white/70 hover:text-white">View website ↗</Link>
    </div></header>
    <main className="container-layout py-10 md:py-14">{children}</main>
  </div>;
}
