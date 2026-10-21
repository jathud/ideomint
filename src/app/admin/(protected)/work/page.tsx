import Link from 'next/link';
import { requirePortfolioAdmin } from '@/lib/portfolio/supabase';
import LegacyImport from '@/components/admin/LegacyImport';
import type { PortfolioRecord } from '@/lib/portfolio/validation';

export default async function PortfolioWorkPage() {
  const client = await requirePortfolioAdmin();
  const { data, error } = await client.from('portfolio_projects').select().order('sort_order').order('created_at');
  if (error) return <div><h1 className="text-3xl font-black mb-4">Portfolio database not ready</h1><p className="text-white/60">Have the database owner apply the reviewed portfolio migration. Existing work has not been changed.</p></div>;
  const projects = (data ?? []) as PortfolioRecord[];
  return <>
    <div className="flex flex-wrap items-end justify-between gap-6 mb-8"><div><h1 className="text-4xl font-black tracking-tight">Selected Work</h1><p className="mt-3 text-white/60 text-sm">Save privately, preview, then publish when the details are right.</p></div><Link href="/admin/work/new" className="bg-creative-flame text-section-ink px-6 py-3 rounded-full text-sm font-bold">New project</Link></div>
    <div className="rounded-xl border border-white/10 p-5 mb-8 text-sm text-white/60">Homepage source: <strong className="text-white">{process.env.PORTFOLIO_CMS_ENABLED === 'true' ? 'Published featured projects' : 'Preserved local portfolio'}</strong>. {process.env.PORTFOLIO_CMS_ENABLED !== 'true' && 'CMS publishing can be tested here without switching the homepage. Activate it only after reviewing both imported projects.'}</div>
    <div className="space-y-3 mb-8">{projects.length ? projects.map(project => <Link key={project.id} href={`/admin/work/${project.id}`} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border border-white/15 rounded-xl px-6 py-5 hover:border-creative-flame/50 transition-colors"><div className="min-w-0"><h2 className="text-xl font-bold break-words">{project.draft.title || 'Untitled project'}</h2><p className="text-xs text-white/50 mt-2 break-words">{project.draft.services.join(' · ')} · {project.draft.photos.length} images</p></div><span className="text-xs uppercase tracking-widest text-creative-flame shrink-0">{project.status} · Order {project.sort_order}</span></Link>) : <p className="text-white/60 py-8">No projects yet. Import the existing work or create your first draft.</p>}</div>
    <LegacyImport />
  </>;
}
