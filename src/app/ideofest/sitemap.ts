import type { MetadataRoute } from 'next';
import { createAdminClient } from '@/lib/ideofest/supabase/server';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://ideomint.com';
  const now = new Date();

  // Ideofest core pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/ideofest`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/ideofest/events`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.9,
    },
  ];

  // Fetch published events from Supabase
  let eventPages: MetadataRoute.Sitemap = [];
  try {
    const supabase = createAdminClient();
    const { data: events } = await supabase
      .from('events')
      .select('slug, updated_at, created_at')
      .eq('status', 'published');

    if (events && events.length > 0) {
      eventPages = events.map((ev: { slug: string; updated_at?: string; created_at?: string }) => ({
        url: `${baseUrl}/ideofest/events/${ev.slug}`,
        lastModified: new Date(ev.updated_at || ev.created_at || Date.now()),
        changeFrequency: 'daily' as const,
        priority: 0.85,
      }));
    }
  } catch (err) {
    console.error('Failed to fetch events for ideofest sitemap:', err);
  }

  return [...staticPages, ...eventPages];
}
