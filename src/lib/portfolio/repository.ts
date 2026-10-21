import 'server-only';
import { legacyProjects } from './legacy-projects';
import { contentSchema, toGalleryProject } from './validation';
import { publicPortfolioClient } from './supabase';

export async function homepagePortfolio() {
  if (process.env.PORTFOLIO_CMS_ENABLED !== 'true') return legacyProjects;
  try {
    const { data, error } = await publicPortfolioClient().from('portfolio_publications').select('project_id, content, published_at').eq('featured', true).order('sort_order').order('published_at');
    if (error) throw error;
    return (data ?? []).flatMap((item, index) => {
      const content = contentSchema.safeParse(item.content);
      return content.success ? [{ ...toGalleryProject(item.project_id, content.data, index), revision: item.published_at }] : [];
    });
  } catch {
    console.error('Published portfolio unavailable. No private or archived content was served.');
    return [];
  }
}
