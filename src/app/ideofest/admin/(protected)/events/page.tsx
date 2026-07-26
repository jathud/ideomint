import Link from 'next/link';
import { PlusCircle } from 'lucide-react';
import type { IEvent } from '@/lib/ideofest/types';
import { createAdminClient } from '@/lib/ideofest/supabase/server';
import AdminEventsTable from '@/components/ideofest/AdminEventsTable';

export default async function AdminEventsPage() {
  let events: IEvent[] = [];
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('events')
      .select('*, ticket_tiers(*)')
      .order('date', { ascending: true });

    if (!error && data) {
      events = data as IEvent[];
    }
  } catch (err) {
    console.error('Failed to fetch admin events from Supabase:', err);
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black">Event Management</h1>
          <p className="text-white/40 text-sm mt-1">{events.length} events managed in festival catalog</p>
        </div>
        <Link
          href="/ideofest/admin/events/create"
          className="flex items-center justify-center gap-2 bg-signal-lime hover:bg-[#b8e85a] text-section-ink px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-lg shadow-signal-lime/10 w-full sm:w-auto"
        >
          <PlusCircle className="w-4 h-4" /> Create Event
        </Link>
      </div>

      <AdminEventsTable initialEvents={events} />
    </div>
  );
}
