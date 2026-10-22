import type { Metadata } from 'next';
import { createAdminClient } from '@/lib/ideofest/supabase/server';
import type { IEvent } from '@/lib/ideofest/types';
import EventsCatalog from './EventsCatalog';

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const query = await searchParams;
  const filtered = ['category', 'search', 'sort', 'page'].some(key => Boolean(query[key]));
  return { robots: { index: !filtered, follow: true } };
}

export default async function EventsPage({ searchParams }: Props) {
  const query = await searchParams;
  const category = typeof query.category === 'string' ? query.category : '';
  let events: IEvent[] = [];
  let unavailable = false;
  try {
    // Read only published catalog data; never serialize private event records.
    const { data, error } = await createAdminClient()
      .from('events')
      .select('id,slug,title,tagline,category,date,city,venue,image_url,status,featured,tags,ticket_tiers(*)')
      .in('status', ['published', 'sold_out'])
      .order('date', { ascending: true });
    if (error) throw error;
    events = (data || []) as IEvent[];
  } catch {
    unavailable = true;
    console.error('[Public events] Catalog could not be loaded');
  }
  return <EventsCatalog key={category} events={events} initialCategory={category} unavailable={unavailable} />;
}
