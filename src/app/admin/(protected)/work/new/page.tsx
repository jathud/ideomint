import PortfolioEditor from '@/components/admin/PortfolioEditor';
import { requirePortfolioAdmin } from '@/lib/portfolio/supabase';
export default async function NewPortfolioProject() {
  await requirePortfolioAdmin();
  return <PortfolioEditor initial={{ id: crypto.randomUUID(), slug: '', version: 0, sort_order: 0, featured: true, status: 'draft', updated_at: '', draft: { title: '', subtitle: '', description: '', role: '', location: '', label: '', services: [], photos: [] } }} />;
}
