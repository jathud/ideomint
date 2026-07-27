import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Ticket, Zap, ShieldCheck, Sparkles, Calendar, MapPin, CheckCircle2, Clock } from 'lucide-react';
import { MOCK_EVENTS, getEventStats, CATEGORY_LABELS } from '@/lib/ideofest/mock-data';
import EventCard from '@/components/ideofest/EventCard';
import StatsBar from '@/components/ideofest/StatsBar';
import CountdownTimer from '@/components/ideofest/CountdownTimer';
import type { Metadata } from 'next';
import { createAdminClient } from '@/lib/ideofest/supabase/server';
import type { IEvent } from '@/lib/ideofest/types';

export const metadata: Metadata = {
  title: 'Ideofest — Live Events & Experiences',
  description: "Discover Sri Lanka's most vibrant live events: music, tech, art, wellness, and more — curated by Ideomint.",
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

  const totalCount = events.length;

  return (
    <div className="relative overflow-hidden bg-section-ink text-white">
      {/* ── HERO SECTION ── */}
      <section className="relative min-h-[92vh] flex items-center justify-center overflow-hidden pt-20">
        {/* Background Image Layer */}
        <div className="absolute inset-0 z-0">
          <Image
            src={nextEvent?.image_url || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1600'}
            alt="Hero Background"
            fill
            priority
            className="object-cover object-center opacity-20 scale-105 transition-transform duration-1000"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-section-ink/60 via-section-ink/80 to-section-ink" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-section-ink/40 to-section-ink" />
        </div>

        {/* Ambient Glow Orbs */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-[#c1e527]/12 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-[450px] h-[450px] bg-digital-pulse/15 rounded-full blur-[120px] pointer-events-none" />

        <div className="container-layout relative z-10 text-center py-20 px-4 sm:px-6 lg:px-8">
          {/* Live Badge */}
          <div className="inline-flex items-center gap-2.5 bg-[#c1e527]/10 border border-[#c1e527]/25 backdrop-blur-md px-4 py-2 rounded-full mb-8 shadow-[0_0_20px_rgba(193,229,39,0.15)]">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#c1e527] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#c1e527]"></span>
            </span>
            <span className="text-xs font-extrabold text-[#c1e527] tracking-widest uppercase">
              Sri Lanka's Premier Creative Festival Platform
            </span>
          </div>

          {/* Main Title */}
          <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black tracking-tight text-white leading-[1.08] mb-6">
            Live Experiences, <br />
            <span className="bg-gradient-to-r from-[#c1e527] via-[#d4ff33] to-[#99cc00] bg-clip-text text-transparent">
              Perfectly Minted.
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-lg sm:text-xl text-white/70 font-normal leading-relaxed mb-10">
            Music. Tech. Art. Culture. Curated live events across Sri Lanka with instant encrypted QR pass delivery and verified Sri Lankan payment gateways.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/ideofest/events"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 bg-gradient-to-r from-[#c1e527] to-[#d4ff33] text-section-ink px-8 py-4 rounded-full font-black text-base transition-all transform hover:scale-105 shadow-[0_0_25px_rgba(193,229,39,0.3)] hover:shadow-[0_0_35px_rgba(193,229,39,0.5)]"
            >
              <Ticket className="w-5 h-5" />
              <span>Explore All Events</span>
              <ArrowRight className="w-5 h-5" />
            </Link>

            <Link
              href="/ideofest/my-tickets"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white/8 hover:bg-white/14 border border-white/18 text-white px-8 py-4 rounded-full font-bold text-base transition-all backdrop-blur-md hover:border-white/30"
            >
              <ShieldCheck className="w-5 h-5 text-[#c1e527]" />
              <span>My Passes & Slip Upload</span>
            </Link>
          </div>

          {/* Feature Highlights Pill */}
          <div className="mt-16 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs font-semibold text-white/60 border-t border-white/8 pt-8 max-w-3xl mx-auto">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#c1e527]" />
              <span>Instant QR Pass</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#c1e527]" />
              <span>Bank Transfer & PayHere</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#c1e527]" />
              <span>100% Guaranteed Admission</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── COUNTDOWN BANNER (if nextEvent exists) ── */}
      {nextEvent && (
        <section className="relative z-20 bg-gradient-to-r from-[#c1e527]/10 via-white/5 to-[#c1e527]/10 border-y border-[#c1e527]/20 py-10 backdrop-blur-lg">
          <div className="container-layout px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-extrabold text-[#c1e527] uppercase tracking-widest mb-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Next Upcoming Event</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white">{nextEvent.title}</h2>
              <p className="text-xs text-white/50 mt-1 flex items-center justify-center md:justify-start gap-3">
                <span>📍 {nextEvent.venue}, {nextEvent.city}</span>
                <span>📅 {new Date(nextEvent.date).toLocaleDateString('en-LK', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <CountdownTimer targetDate={nextEvent.date} />
              <Link
                href={`/ideofest/events/${nextEvent.slug}/book`}
                className="inline-flex items-center gap-2 bg-[#c1e527] hover:bg-[#b0d420] text-section-ink px-6 py-3.5 rounded-xl font-black text-sm transition-all shadow-lg shadow-[#c1e527]/20 shrink-0 hover:scale-105"
              >
                <span>Book Pass</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ── STATS BAR ── */}
      <section className="py-12 border-b border-white/8 bg-black/20">
        <div className="container-layout px-4 sm:px-6 lg:px-8">
          <StatsBar />
        </div>
      </section>

      {/* ── FEATURED EVENTS ── */}
      <section className="section-spacing">
        <div className="container-layout px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-12">
            <div>
              <span className="text-xs font-extrabold text-[#c1e527] tracking-widest uppercase block mb-2">Curated Experiences</span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black">
                Featured <span className="text-[#c1e527]">Events</span>
              </h2>
            </div>
            <Link href="/ideofest/events" className="hidden sm:flex items-center gap-2 text-sm font-bold text-white/60 hover:text-white transition-colors">
              <span>View All Events ({totalCount})</span>
              <ArrowRight className="w-4 h-4 text-[#c1e527]" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayFeatured.map((event) => (
              <EventCard key={event.id || event.slug} event={event} />
            ))}
          </div>
        </div>
      </section>

      {/* ── CATEGORIES ── */}
      <section className="section-spacing border-t border-white/8 bg-white/2">
        <div className="container-layout px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <span className="text-xs font-extrabold text-[#c1e527] tracking-widest uppercase block mb-2">Discover by Interest</span>
            <h2 className="text-3xl font-black">Explore <span className="text-[#c1e527]">Categories</span></h2>
          </div>
          <div className="flex flex-wrap gap-3">
            {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
              <Link
                key={key}
                href={`/ideofest/events?category=${key}`}
                className="group px-6 py-3 rounded-full bg-white/5 border border-white/10 hover:bg-[#c1e527]/15 hover:border-[#c1e527]/50 text-sm font-bold text-white/80 hover:text-white transition-all flex items-center gap-2"
              >
                <span>{label}</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#c1e527] opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── ALL UPCOMING ── */}
      <section className="section-spacing">
        <div className="container-layout px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-10">
            <div>
              <span className="text-xs font-extrabold text-[#c1e527] tracking-widest uppercase block mb-2">Calendar</span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black">
                Upcoming <span className="text-[#c1e527]">Lineup</span>
              </h2>
            </div>
            <Link href="/ideofest/events" className="hidden md:flex items-center gap-2 text-sm font-bold text-white/60 hover:text-white transition-colors">
              <span>Full Schedule</span>
              <ArrowRight className="w-4 h-4 text-[#c1e527]" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {upcomingEvents.map((e) => (
              <EventCard key={e.id || e.slug} event={e} />
            ))}
          </div>
          <div className="mt-12 flex justify-center">
            <Link
              href="/ideofest/events"
              className="flex items-center gap-2 bg-[#c1e527] hover:bg-[#b0d420] text-section-ink px-8 py-4 rounded-full font-black text-sm transition-all transform hover:scale-105 shadow-lg shadow-[#c1e527]/20 w-full sm:w-auto justify-center"
            >
              <span>Explore All {totalCount} Events</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
