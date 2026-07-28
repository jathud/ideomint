'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import EventCard from '@/components/ideofest/EventCard';
import FilterBar, { type FilterState } from '@/components/ideofest/FilterBar';
import { MOCK_EVENTS } from '@/lib/ideofest/mock-data';
import type { IEvent } from '@/lib/ideofest/types';

export default function EventsPage() {
  const [filters, setFilters] = useState<FilterState>({ search: '', category: '', sort: 'date' });
  const [events, setEvents] = useState<IEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const res = await fetch('/api/ideofest/events');
        const json = await res.json();
        if (active && json.success && Array.isArray(json.data)) {
          // filter to only public statuses (event_status enum: published, sold_out)
          setEvents(json.data.filter((e: IEvent) => {
            const s = (e.status || '').toLowerCase();
            return s === 'published' || s === 'sold_out';
          }));
        }
      } catch (err) {
        console.error('Failed to fetch events:', err);
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => { active = false; };
  }, []);

  const filtered = useMemo(() => {
    let evts = [...events];

    if (filters.search) {
      const q = filters.search.toLowerCase();
      evts = evts.filter(
        (e) =>
          e.title.toLowerCase().includes(q) ||
          e.city.toLowerCase().includes(q) ||
          (e.tagline || '').toLowerCase().includes(q) ||
          (e.tags || []).some((t) => t.toLowerCase().includes(q))
      );
    }

    if (filters.category) {
      evts = evts.filter((e) => e.category === filters.category);
    }

    evts = [...evts].sort((a, b) => {
      if (filters.sort === 'date') return new Date(a.date).getTime() - new Date(b.date).getTime();
      if (filters.sort === 'price') {
        const minA = Math.min(...(a.ticket_tiers || []).map((t: { price: number }) => t.price || 0));
        const minB = Math.min(...(b.ticket_tiers || []).map((t: { price: number }) => t.price || 0));
        return minA - minB;
      }
      if (filters.sort === 'popularity') {
        const soldA = (a.ticket_tiers || []).reduce((s: number, t: { sold: number }) => s + (t.sold || 0), 0);
        const soldB = (b.ticket_tiers || []).reduce((s: number, t: { sold: number }) => s + (t.sold || 0), 0);
        return soldB - soldA;
      }
      return 0;
    });

    return evts;
  }, [filters, events]);

  return (
    <div className="container-layout pt-32 sm:pt-36 pb-16 px-4 sm:px-6 lg:px-8">
      {/* Back Button */}
      <div className="mb-6">
        <Link
          href="/ideofest"
          className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-widest text-white/70 hover:text-white bg-white/5 hover:bg-white/10 px-4 py-2 rounded-full border border-white/10 transition-all hover:scale-105 group"
        >
          <ArrowLeft className="w-4 h-4 text-[#c1e527] group-hover:-translate-x-1 transition-transform" />
          <span>Back</span>
        </Link>
      </div>

      {/* Header */}
      <div className="mb-10">
        <span className="text-xs font-bold text-[#c1e527] tracking-widest uppercase">Live Festival Catalog</span>
        <h1 className="text-4xl md:text-5xl font-black mt-2 mb-2">
          Find your next <span className="text-[#c1e527]">experience.</span>
        </h1>
        <p className="text-white/50 text-base">
          {events.length} event{events.length !== 1 ? 's' : ''} available · Sri Lanka & beyond
        </p>
      </div>

      {/* Filter bar */}
      <div className="mb-8">
        <FilterBar filters={filters} onChange={setFilters} />
      </div>

      {/* Results */}
      {loading ? (
        <div className="py-24 text-center">
          <div className="animate-spin w-8 h-8 border-4 border-[#c1e527] border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-white/50 text-sm">Loading live events from Supabase...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-24 text-center bg-white/3 border border-white/5 rounded-2xl">
          <p className="text-4xl mb-4">🎪</p>
          <h3 className="text-xl font-bold text-white mb-2">No events found</h3>
          <p className="text-white/50 text-sm">No live events match your search. Try clearing filters or check back soon!</p>
        </div>
      ) : (
        <>
          <p className="text-sm text-white/40 mb-6">{filtered.length} live event{filtered.length !== 1 ? 's' : ''} found</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filtered.map((event) => (
              <EventCard key={event.id || event.slug} event={event} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
