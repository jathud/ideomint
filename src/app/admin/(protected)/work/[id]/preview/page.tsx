import Link from 'next/link';
import { notFound } from 'next/navigation';
import { z } from 'zod';
import { requirePortfolioAdmin } from '@/lib/portfolio/supabase';
import { contentSchema, toGalleryProject } from '@/lib/portfolio/validation';
import ExperienceReel from '@/components/sections/ExperienceReel';

export default async function PreviewPortfolio({ params }: { params: Promise<{ id: string }> }) {
  const client = await requirePortfolioAdmin();
  const { id } = await params;
  if (!z.uuid().safeParse(id).success) notFound();
  const { data } = await client.from('portfolio_projects').select('draft').eq('id', id).maybeSingle();
  if (!data) notFound();
  const content = contentSchema.safeParse(data.draft);
  return <><Link href={`/admin/work/${id}`} className="text-sm text-creative-flame">← Back to editor</Link><p className="my-6 text-sm text-white/60">Private saved-draft preview. Nothing here is published automatically.</p>{content.success ? <div className="-mx-[clamp(20px,5vw,80px)]"><ExperienceReel projects={[toGalleryProject(id, content.data, 0)]} /></div> : <p role="alert" className="text-creative-flame">Complete the required project details, image descriptions, and photo groups to preview this draft.</p>}</>;
}
