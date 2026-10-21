import { z } from 'zod';
import { authorizedPortfolioClient, publicPortfolioClient } from '@/lib/portfolio/supabase';
import { contentSchema } from '@/lib/portfolio/validation';

export const dynamic = 'force-dynamic';
export async function GET(_request: Request, { params }: { params: Promise<{ project: string; asset: string }> }) {
  const { project, asset } = await params;
  if (!z.uuid().safeParse(project).success || !/^[0-9a-f-]{36}\.(jpg|png|webp)$/.test(asset)) return new Response(null, { status: 404 });
  const src = `/api/portfolio/media/${project}/${asset}`;
  try {
    let client = publicPortfolioClient();
    const { data } = await client.from('portfolio_publications').select('content').eq('project_id', project).maybeSingle();
    const published = contentSchema.safeParse(data?.content);
    if (!published.success || !published.data.photos.some(photo => photo.src === src)) {
      client = await authorizedPortfolioClient();
      const { data: draft } = await client.from('portfolio_projects').select('id').eq('id', project).maybeSingle();
      if (!draft) return new Response(null, { status: 404 });
    }
    const { data: image, error } = await client.storage.from('portfolio-media').download(`${project}/${asset}`);
    if (error || !image) return new Response(null, { status: 404 });
    return new Response(image.stream(), { headers: { 'Content-Type': image.type, 'Cache-Control': 'private, no-store', 'X-Content-Type-Options': 'nosniff' } });
  } catch { return new Response(null, { status: 404, headers: { 'Cache-Control': 'private, no-store' } }); }
}
