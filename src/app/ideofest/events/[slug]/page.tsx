import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Calendar, MapPin, Clock, Tag, ArrowRight, Users, CreditCard, Landmark, ArrowLeft } from 'lucide-react';
import { CATEGORY_LABELS } from '@/lib/ideofest/mock-data';
import type { Metadata } from 'next';
import { createAdminClient } from '@/lib/ideofest/supabase/server';
import type { IEvent } from '@/lib/ideofest/types';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface Props {
  params: Promise<{ slug: string }>;
}

async function fetchEvent(slug: string): Promise<IEvent | null> {
  try {
    const supabase = createAdminClient();
    const cleanSlug = decodeURIComponent(slug).toLowerCase().trim();
    
    // 1. Match by slug (case-insensitive)
    const { data, error } = await supabase
      .from('events')
      .select('*, ticket_tiers(*)')
      .ilike('slug', cleanSlug)
      .maybeSingle();
    if (!error && data) return data as IEvent;

    // 2. Match by UUID if slug is an ID
    const { data: byId } = await supabase
      .from('events')
      .select('*, ticket_tiers(*)')
      .eq('id', slug)
      .maybeSingle();
    if (byId) return byId as IEvent;

    return null;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const event = await fetchEvent(slug);
  if (!event) return { title: 'Event Not Found' };
  const canonicalUrl = `https://ideomint.com/ideofest/events/${event.slug}`;
  return {
    title: `${event.title} | Ideofest`,
    description: event.tagline || event.description?.slice(0, 160),
    alternates: { canonical: canonicalUrl },
    openGraph: {
      title: `${event.title} | Ideofest`,
      description: event.tagline,
      url: canonicalUrl,
      siteName: 'Ideofest by Ideomint',
      type: 'article',
      images: [{ url: event.image_url, width: 1200, height: 630, alt: event.title }],
    },
    twitter: {
      card: 'summary_large_image',
      title: event.title,
      description: event.tagline,
      images: [event.image_url],
    },
  };
}

function formatDate(d: string | Date) {
  return new Date(d).toLocaleDateString('en-LK', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });
}
function formatTime(d: string | Date) {
  return new Date(d).toLocaleTimeString('en-LK', { hour: '2-digit', minute: '2-digit' });
}

const TIER_BADGE: Record<string, string> = {
  free: 'bg-signal-lime text-section-ink',
  early_bird: 'bg-digital-pulse text-white',
  standard: 'bg-white/20 text-white',
  vip: 'bg-[#c1e527] text-section-ink',
};

export default async function EventDetailPage({ params }: Props) {
  const { slug } = await params;
  const event = await fetchEvent(slug);
  if (!event) notFound();

  const tiers = event.ticket_tiers || [];
  const totalSold = tiers.reduce((s, t) => s + (t.sold || 0), 0);
  const totalCap = tiers.reduce((s, t) => s + (t.capacity || 0), 0);
  const soldPct = totalCap > 0 ? Math.round((totalSold / totalCap) * 100) : 0;

  const paymentMethods = event.payment_methods || ['bank_transfer'];

  // Schema.org Event JSON-LD for Google Rich Results & AEO
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: event.title,
    description: event.description || event.tagline,
    startDate: event.date,
    endDate: event.end_date || event.date,
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    location: {
      '@type': 'Place',
      name: event.venue,
      address: {
        '@type': 'PostalAddress',
        addressLocality: event.city,
        addressCountry: 'LK',
      },
    },
    image: [event.image_url],
    organizer: {
      '@type': 'Organization',
      name: 'Ideomint',
      url: 'https://ideomint.com',
    },
    offers: tiers.map((t) => ({
      '@type': 'Offer',
      name: t.label,
      price: t.price,
      priceCurrency: 'LKR',
      availability: (t.capacity - (t.sold || 0)) > 0 ? 'https://schema.org/InStock' : 'https://schema.org/SoldOut',
      url: `https://ideomint.com/ideofest/events/${event.slug}/book`,
    })),
  };

  return (
    <div className="relative">
      {/* Schema.org Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Hero */}
      <div className="relative h-[55vh] min-h-[360px] overflow-hidden">
        <Image
          src={event.image_url}
          alt={event.title}
          fill
          priority
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-section-ink via-section-ink/60 to-transparent" />
        
        {/* Floating Back Button */}
        <div className="absolute top-6 left-0 right-0 z-10 container-layout px-4 sm:px-6">
          <Link
            href="/ideofest/events"
            className="inline-flex items-center gap-2 text-xs font-bold text-white hover:text-signal-lime bg-black/60 hover:bg-black/80 border border-white/20 px-4 py-2 rounded-full transition-all backdrop-blur-md shadow-lg"
          >
            <ArrowLeft className="w-4 h-4 text-signal-lime" />
            <span>Back to All Events</span>
          </Link>
        </div>

        <div className="absolute bottom-0 left-0 right-0 container-layout pb-10">
          <div className="flex items-center gap-2 mb-4">
            <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${event.featured ? 'bg-[#c1e527] text-section-ink' : 'bg-white/15 text-white'}`}>
              {event.featured ? 'Featured' : CATEGORY_LABELS[event.category]}
            </span>
            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-white/10 text-white/60">
              {CATEGORY_LABELS[event.category]}
            </span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-white leading-tight mb-2">{event.title}</h1>
          <p className="text-white/70 text-lg">{event.tagline}</p>
        </div>
      </div>

      {/* Body */}
      <div className="container-layout py-12 grid lg:grid-cols-[1fr_380px] gap-12">

        {/* Left — Details */}
        <div>
          {/* Meta */}
          <div className="grid sm:grid-cols-2 gap-4 mb-10">
            {[
              { icon: Calendar, label: 'Date', value: formatDate(event.date) },
              {
                icon: Clock, label: 'Time',
                value: `${formatTime(event.date)}${event.end_date ? ' — ' + formatTime(event.end_date) : ''}`,
              },
              { icon: MapPin, label: 'Venue', value: `${event.venue}, ${event.city}` },
              { icon: Tag, label: 'Category', value: CATEGORY_LABELS[event.category] },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-start gap-3 p-4 bg-white/5 rounded-xl border border-white/8">
                <Icon className="w-5 h-5 text-[#c1e527] shrink-0 mt-0.5" />
                <div>
                  <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">{label}</p>
                  <p className="text-sm font-semibold text-white mt-0.5">{value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Description */}
          <div className="mb-10">
            <h2 className="text-2xl font-black mb-4">About the Event</h2>
            <p className="text-white/70 leading-relaxed text-base">{event.description}</p>
          </div>

          {/* Payment Methods */}
          <div className="mb-10">
            <h3 className="text-sm font-bold text-white/40 uppercase tracking-widest mb-3">Payment Options</h3>
            <div className="flex flex-wrap gap-2">
              {paymentMethods.includes('payhere') && (
                <span className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-full text-xs text-blue-400 font-bold">
                  <CreditCard className="w-3 h-3" /> PayHere (Cards / Wallets)
                </span>
              )}
              {paymentMethods.includes('bank_transfer') && (
                <span className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-500/10 border border-purple-500/20 rounded-full text-xs text-purple-400 font-bold">
                  <Landmark className="w-3 h-3" /> Bank Transfer
                </span>
              )}
              {paymentMethods.includes('free') && (
                <span className="flex items-center gap-1.5 px-3 py-1.5 bg-signal-lime/10 border border-signal-lime/20 rounded-full text-xs text-signal-lime font-bold">
                  Free Entry
                </span>
              )}
            </div>
          </div>

          {/* Tags */}
          {event.tags?.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {event.tags.map((tag) => (
                <span key={tag} className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs text-white/50 font-medium">
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Right — Tickets */}
        <div>
          <div className="sticky top-32">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <h3 className="text-xl font-black mb-2">Get Tickets</h3>

              {/* Sold progress */}
              {totalCap > 0 && (
                <div className="mb-5">
                  <div className="flex items-center justify-between text-xs text-white/40 mb-2">
                    <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {totalSold} attending</span>
                    <span>{soldPct}% sold</span>
                  </div>
                  <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#c1e527] rounded-full transition-all"
                      style={{ width: `${soldPct}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Tiers */}
              <div className="flex flex-col gap-3 mb-6">
                {tiers.length === 0 ? (
                  <p className="text-white/30 text-sm">No ticket tiers available.</p>
                ) : tiers.map((tier) => {
                  const avail = (tier.capacity || 0) - (tier.sold || 0);
                  const soldOut = avail <= 0;
                  return (
                    <div key={tier.id} className={`flex items-center justify-between p-4 rounded-xl border ${soldOut ? 'border-white/5 opacity-50' : 'border-white/12 bg-white/3'}`}>
                      <div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${TIER_BADGE[tier.name]}`}>
                          {tier.label}
                        </span>
                        {soldOut && <p className="text-xs text-red-400 mt-1.5 font-bold">Sold out</p>}
                      </div>
                      <span className="font-black text-white">
                        {tier.price === 0 ? 'Free' : `LKR ${tier.price.toLocaleString('en-LK')}`}
                      </span>
                    </div>
                  );
                })}
              </div>

              <Link
                href={`/ideofest/events/${event.slug}/book`}
                className="w-full flex items-center justify-center gap-2 bg-[#c1e527] hover:bg-[#b0d420] text-section-ink font-black py-4 rounded-xl transition-colors"
              >
                Book Tickets <ArrowRight className="w-4 h-4" />
              </Link>

              <p className="text-xs text-white/30 text-center mt-3">
                Secure booking · LKR pricing · Instant QR ticket
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
