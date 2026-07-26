import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Ticket, Zap } from 'lucide-react';
import { MOCK_EVENTS, getEventStats, CATEGORY_LABELS, getAllEventsStore } from '@/lib/ideofest/mock-data';
import EventCard from '@/components/ideofest/EventCard';
import StatsBar from '@/components/ideofest/StatsBar';
import CountdownTimer from '@/components/ideofest/CountdownTimer';
import type { Metadata } from 'next';
import { createAdminClient } from '@/lib/ideofest/supabase/server';
import type { IEvent } from '@/lib/ideofest/types';

export const metadata: Metadata = {
  title: 'Ideofest — Live Events & Experiences',
  description: 'Discover Sri Lanka\'s most vibrant live events: music, tech, art, wellness, and more — curated by Ideomint.',
};

export default async function IdeofestPage() {
  let events: IEvent[] = [];
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('events')
      .select('*, ticket_tiers(*)')
      .eq('status', 'published')
      .order('date', { ascending: true });

    if (!error && data) {
      events = data as IEvent[];
    }
  } catch (err) {
    console.error('Failed to fetch events for landing page from Supabase:', err);
  }

  const featuredEvents = events.filter((e) => e.featured && e.status === 'published');
  const displayFeatured = featuredEvents.length > 0 ? featuredEvents : events.slice(0, 3);
  const upcomingEvents = events.filter((e) => e.status === 'published').slice(0, 4);

  // Find nearest upcoming future event
  const now = new Date();
  const futureEvents = events
    .filter((e) => e.status === 'published' && new Date(e.date) > now)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const nextEvent = futureEvents[0] || displayFeatured[0];

  const stats = getEventStats(events);
  const totalCount = events.length;

  return (
    <div className="relative overflow-hidden">
      {/* === HERO === */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 z-0">
          <Image
            src={nextEvent?.image_url || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1600'}
            alt="Hero"
            fill
            priority
            className="object-cover object-center opacity-25"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-section-ink/50 via-section-ink/60 to-section-ink" />
        </div>

        {/* Glow orbs */}
        <div className="absolute top-1/3 left-1/4 w-[600px] h-[600px] bg-creative-flame/15 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-digital-pulse/15 rounded-full blur-[100px] pointer-events-none" />

        <div className="container-layout relative z-10 text-center py-24 px-4 sm:px-6 lg:px-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-creative-flame/15 border border-creative-flame/30 px-4 py-2 rounded-full mb-8">
            <Zap className="w-3.5 h-3.5 text-creative-flame" />
            <span className="text-xs font-bold text-creative-flame tracking-widest uppercase">
              Sri Lanka's Premier Creative Festival Series
            </span>
          </div>

          {/* Heading */}
          <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black text-white leading-tight tracking-tight mb-6">
            Live Experiences <br />
            <span className="text-creative-flame">Perfectly Minted.</span>
          </h1>

          <p className="max-w-2xl mx-auto text-lg sm:text-xl text-white/70 font-normal leading-relaxed mb-10">
            Music. Tech. Art. Wellness. Curated events across Sri Lanka that leave an impression. Book your tickets before they're gone.
          </p>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/ideofest/events"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-creative-flame hover:bg-[#E54D30] text-white px-8 py-4 rounded-full font-black text-base transition-all transform hover:scale-105 shadow-lg shadow-creative-flame/20"
            >
              Browse All Events <ArrowRight className="w-5 h-5" />
            </Link>

            <Link
              href="/ideofest/my-tickets"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/15 border border-white/20 text-white px-8 py-4 rounded-full font-bold text-base transition-all backdrop-blur-md"
            >
              <Ticket className="w-5 h-5 text-signal-lime" /> Find My Tickets & Upload Slip
            </Link>

            {nextEvent && (
              <Link
                href={`/ideofest/events/${nextEvent.slug}`}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/15 text-white/80 px-6 py-4 rounded-full font-bold text-base transition-all backdrop-blur-md"
              >
                Featured: {nextEvent.title}
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* === COUNTDOWN BANNER (if nextEvent exists) === */}
      {nextEvent && (
        <section className="bg-white/3 border-y border-white/8 py-10">
          <div className="container-layout px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
            <div>
              <span className="text-xs font-bold text-creative-flame uppercase tracking-widest">Next event — {nextEvent.title}</span>
              <h2 className="text-2xl font-black text-white mt-1">{nextEvent.tagline}</h2>
              <p className="text-xs text-white/40 mt-1">{nextEvent.venue}, {nextEvent.city}</p>
            </div>
            <div className="flex items-center gap-6">
              <CountdownTimer targetDate={nextEvent.date} />
              <Link
                href={`/ideofest/events/${nextEvent.slug}/book`}
                className="hidden sm:inline-flex items-center gap-2 bg-signal-lime hover:bg-[#b8e85a] text-section-ink px-6 py-3 rounded-xl font-black text-sm transition-colors shadow-lg shadow-signal-lime/10 shrink-0"
              >
                Get Pass <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* === STATS BAR === */}
      <section className="py-12 border-b border-white/8">
        <div className="container-layout px-4 sm:px-6 lg:px-8">
          <StatsBar />
        </div>
      </section>

      {/* === FEATURED EVENTS === */}
      <section className="section-spacing">
        <div className="container-layout px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-12">
            <div>
              <span className="text-xs font-bold text-creative-flame tracking-widest uppercase block mb-3">Curated Selection</span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black">
                Featured <span className="text-creative-flame">Events</span>
              </h2>
            </div>
            <Link href="/ideofest/events" className="hidden sm:flex items-center gap-2 text-sm font-bold text-white/60 hover:text-white transition-colors">
              Browse All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {displayFeatured.map((event) => (
              <EventCard key={event.id || event.slug} event={event} />
            ))}
          </div>
        </div>
      </section>

      {/* === CATEGORIES === */}
      <section className="section-spacing border-t border-white/8">
        <div className="container-layout px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-black mb-8">Browse by <span className="text-creative-flame">Category</span></h2>
          <div className="flex flex-wrap gap-3">
            {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
              <Link
                key={key}
                href={`/ideofest/events?category=${key}`}
                className="px-5 py-2.5 rounded-full bg-white/5 border border-white/10 hover:bg-creative-flame/10 hover:border-creative-flame/40 text-sm font-semibold text-white/70 hover:text-white transition-all"
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* === ALL UPCOMING === */}
      <section className="section-spacing">
        <div className="container-layout px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-10">
            <div>
              <span className="text-xs font-bold text-signal-lime tracking-widest uppercase block mb-3">Upcoming</span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black">
                What's <span className="text-creative-flame">next.</span>
              </h2>
            </div>
            <Link href="/ideofest/events" className="hidden md:flex items-center gap-2 text-sm font-bold text-white/60 hover:text-white transition-colors">
              See all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {upcomingEvents.map((e) => (
              <EventCard key={e.id || e.slug} event={e} />
            ))}
          </div>
          <div className="mt-10 flex justify-center">
            <Link
              href="/ideofest/events"
              className="flex items-center gap-2 bg-white/6 hover:bg-white/10 border border-white/12 text-white px-8 py-4 rounded-full font-bold transition-all w-full sm:w-auto justify-center"
            >
              View All {totalCount} Events <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
