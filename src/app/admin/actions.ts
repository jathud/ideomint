'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { authorizedPortfolioClient, portfolioConfigured, portfolioSessionClient } from '@/lib/portfolio/supabase';
import { contentSchema, draftSchema, validateImage, type PortfolioRecord } from '@/lib/portfolio/validation';
import { legacyProjects } from '@/lib/portfolio/legacy-projects';

export async function loginPortfolio(_previous: { error: string }, form: FormData) {
  if (!portfolioConfigured()) return { error: 'Connect a development Supabase project first. See the setup instructions below.' };
  const credentials = z.object({ email: z.email().max(254), password: z.string().min(1).max(256) }).safeParse({ email: form.get('email'), password: form.get('password') });
  if (!credentials.success) return { error: 'Enter a valid email and password.' };
  try {
    const client = await portfolioSessionClient();
    const { error } = await client.auth.signInWithPassword(credentials.data);
    if (error) return { error: 'Unable to sign in. Check your credentials or try again later.' };
    try { await authorizedPortfolioClient(); } catch {
      await client.auth.signOut({ scope: 'local' });
      return { error: 'This account does not have portfolio administrator access. Ask the project owner to grant access.' };
    }
  } catch { return { error: 'The portfolio service is unavailable. Check the development connection.' }; }
  redirect('/admin/work');
}
export async function logoutPortfolio() {
  const client = await portfolioSessionClient();
  await client.auth.signOut({ scope: 'local' });
  redirect('/admin/login');
}
export async function savePortfolio(input: unknown): Promise<{ record?: PortfolioRecord; error?: string }> {
  try {
    const client = await authorizedPortfolioClient();
    const parsed = draftSchema.safeParse(input);
    if (!parsed.success) return { error: parsed.error.issues.map(issue => `${issue.path.join('.')}: ${issue.message}`).slice(0, 4).join(' ') };
    const item = parsed.data;
    const values = { slug: item.slug, draft: item.content, sort_order: item.sort_order, featured: item.featured, version: item.version + 1, updated_at: new Date().toISOString() };
    const result = item.version === 0
      ? await client.from('portfolio_projects').insert({ id: item.id, ...values }).select().single()
      : await client.from('portfolio_projects').update(values).eq('id', item.id).eq('version', item.version).select().maybeSingle();
    if (result.error?.code === '23505') return { error: 'That slug already exists. Choose a different slug.' };
    if (result.error) return { error: 'Unable to save. Check the database setup and your permissions.' };
    if (!result.data) return { error: 'Another edit changed this project. Reload to avoid overwriting it.' };
    revalidatePath('/admin/work');
    return { record: result.data as PortfolioRecord };
  } catch { return { error: 'Sign in with an authorized portfolio administrator account.' }; }
}
export async function publishPortfolio(id: string, version: number): Promise<{ error?: string }> {
  try {
    const client = await authorizedPortfolioClient();
    if (!z.uuid().safeParse(id).success || !Number.isSafeInteger(version) || version < 1) return { error: 'Invalid project.' };
    const { data, error } = await client.from('portfolio_projects').select().eq('id', id).eq('version', version).single();
    if (error || !data) return { error: 'Project changed. Reload before publishing.' };
    const checked = draftSchema.safeParse({ id, version, slug: data.slug, content: data.draft, sort_order: data.sort_order, featured: data.featured });
    if (!checked.success || !contentSchema.safeParse(data.draft).success) return { error: 'Complete the title, description, capabilities, and all image descriptions/groups before publishing.' };
    const { error: publishError } = await client.rpc('portfolio_publish', { target_id: id, expected_version: version });
    if (publishError) return { error: 'Publishing failed or another edit changed the project. Reload and try again.' };
    revalidatePath('/'); revalidatePath('/admin/work');
    return {};
  } catch { return { error: 'Your administrator session expired. Sign in again.' }; }
}
export async function archivePortfolio(id: string, version: number): Promise<{ error?: string }> {
  try {
    const client = await authorizedPortfolioClient();
    if (!z.uuid().safeParse(id).success || !Number.isSafeInteger(version) || version < 1) return { error: 'Invalid project.' };
    const { error } = await client.rpc('portfolio_archive', { target_id: id, expected_version: version });
    if (error) return { error: 'Archiving failed or the project changed. Reload and try again.' };
    revalidatePath('/'); revalidatePath('/admin/work');
    return {};
  } catch { return { error: 'Your administrator session expired. Sign in again.' }; }
}
export async function preparePortfolioUpload(id: string, mime: string, size: number): Promise<{ key?: string; signedUrl?: string; error?: string }> {
  try {
    const client = await authorizedPortfolioClient();
    const extension = ({ 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' } as Record<string, string>)[mime];
    if (!z.uuid().safeParse(id).success || !extension || !Number.isSafeInteger(size) || size < 1 || size > 10 * 1024 * 1024) return { error: 'Choose a JPEG, PNG, or WebP image up to 10 MB.' };
    const { data: project } = await client.from('portfolio_projects').select('id').eq('id', id).maybeSingle();
    if (!project) return { error: 'Save the project before uploading images.' };
    const key = `${id}/${crypto.randomUUID()}.${extension}`;
    const { data, error } = await client.storage.from('portfolio-media').createSignedUploadUrl(key, { upsert: false });
    if (error || !data) return { error: 'Upload unavailable. Check the private storage bucket and policies.' };
    return { key, signedUrl: data.signedUrl };
  } catch { return { error: 'Upload unavailable. Sign in again or check the connection.' }; }
}
export async function completePortfolioUpload(id: string, key: string): Promise<{ src?: string; error?: string }> {
  try {
    const client = await authorizedPortfolioClient();
    if (!z.uuid().safeParse(id).success || !key.startsWith(`${id}/`) || !/^[0-9a-f-]{36}\/[0-9a-f-]{36}\.(jpg|png|webp)$/.test(key)) return { error: 'Invalid upload.' };
    const { data: project } = await client.from('portfolio_projects').select('id').eq('id', id).maybeSingle();
    if (!project) return { error: 'Project unavailable.' };
    const { data: file, error } = await client.storage.from('portfolio-media').download(key);
    if (error || !file || file.size > 10 * 1024 * 1024) return { error: 'Upload verification failed. Choose an image up to 10 MB.' };
    const extension = validateImage(new Uint8Array(await file.arrayBuffer()), file.type);
    if (!extension || !key.endsWith(`.${extension}`)) return { error: 'The file content is not a supported JPEG, PNG, or WebP image.' };
    return { src: `/api/portfolio/media/${key}` };
  } catch { return { error: 'Upload verification unavailable. Sign in again or check the connection.' }; }
}
export async function importLegacyPortfolio(): Promise<{ error?: string; count?: number }> {
  try {
    const client = await authorizedPortfolioClient();
    const { data: existing, error } = await client.from('portfolio_projects').select('slug');
    if (error) return { error: 'Create the portfolio tables before importing.' };
    const slugs = new Set((existing ?? []).map(item => item.slug));
    const items = legacyProjects.filter(project => !slugs.has(project.id)).map((project, index) => ({ id: crypto.randomUUID(), slug: project.id, draft: contentSchema.parse(project), sort_order: index, featured: true }));
    if (items.length) {
      const { error: importError } = await client.from('portfolio_projects').insert(items);
      if (importError) return { error: 'Import failed. Existing projects and images were left unchanged.' };
    }
    revalidatePath('/admin/work');
    return { count: items.length };
  } catch { return { error: 'Sign in as a portfolio administrator before importing.' }; }
}
