import { notFound } from 'next/navigation';
import { z } from 'zod';
import PortfolioEditor from '@/components/admin/PortfolioEditor';
import { requirePortfolioAdmin } from '@/lib/portfolio/supabase';
import type { PortfolioRecord } from '@/lib/portfolio/validation';
export default async function EditPortfolioProject({ params }: { params: Promise<{ id: string }> }) {
  const client = await requirePortfolioAdmin();
  const { id } = await params;
  if (!z.uuid().safeParse(id).success) notFound();
  const { data, error } = await client.from('portfolio_projects').select().eq('id', id).maybeSingle();
  if (error || !data) notFound();
  return <PortfolioEditor initial={data as PortfolioRecord} />;
}
