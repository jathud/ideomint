import Image from 'next/image';
import Link from 'next/link';
import { MapPin, Calendar, Tag } from 'lucide-react';
import type { IEvent, ITicketTier } from '@/lib/ideofest/types';
import { CATEGORY_LABELS } from '@/lib/ideofest/mock-data';

interface EventCardProps {
  event: IEvent;
}

const TIER_COLORS: Record<string, string> = {
  free: 'bg-signal-lime text-section-ink',
  early_bird: 'bg-digital-pulse text-white',
  standard: 'bg-white/20 text-white',
  vip: 'bg-creative-flame text-white',
};

function getLowestPrice(event: IEvent): ITicketTier | null {
  const tiers = event.ticket_tiers || [];
  const availableTiers = tiers.filter((t) => t.capacity - t.sold > 0);
  if (availableTiers.length === 0) return null;
  return availableTiers.reduce((a, b) => (a.price < b.price ? a : b));
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-LK', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export default function EventCard({ event }: EventCardProps) {
  const lowestTier = getLowestPrice(event);
  const isSoldOut = event.status === 'sold_out' || !lowestTier;
  const isCompleted = event.status === 'completed';

  return (
    <Link
      href={`/ideofest/events/${event.slug}`}
      className="group flex flex-col bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 overflow-hidden hover:bg-white/8 hover:border-white/20 hover:-translate-y-1 transition-all duration-500 will-change-transform"
    >
      {/* Image */}
      <div className="relative w-full aspect-[4/3] overflow-hidden">
        <Image
          src={event.image_url}
          alt={event.title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
          className="object-cover object-center group-hover:scale-105 transition-transform duration-700"
        />
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-section-ink/60 to-transparent" />

        {/* Category badge */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-section-ink/80 backdrop-blur-sm px-2.5 py-1 rounded-full">
          <Tag className="w-3 h-3 text-creative-flame" />
          <span className="text-[10px] font-bold text-white/80 tracking-widest uppercase">
            {CATEGORY_LABELS[event.category] || event.category}
          </span>
        </div>

        {/* Status badge */}
        {(isSoldOut || isCompleted) && (
          <div className="absolute top-3 right-3 bg-white/10 backdrop-blur-sm border border-white/20 px-2.5 py-1 rounded-full text-[10px] font-bold text-white/60 tracking-widest uppercase">
            {isCompleted ? 'Ended' : 'Sold Out'}
          </div>
        )}

        {/* Featured badge */}
        {event.featured && !isSoldOut && !isCompleted && (
          <div className="absolute top-3 right-3 bg-creative-flame px-2.5 py-1 rounded-full text-[10px] font-bold text-white tracking-widest uppercase">
            Featured
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-grow">
        {/* Date */}
        <div className="flex items-center gap-1.5 mb-3">
          <Calendar className="w-3.5 h-3.5 text-creative-flame shrink-0" />
          <span className="text-xs text-white/50 font-medium">{formatDate(event.date)}</span>
        </div>

        <h3 className="text-base font-bold text-white leading-snug mb-1.5 group-hover:text-creative-flame transition-colors">
          {event.title}
        </h3>
        <p className="text-xs text-white/50 mb-4 line-clamp-2 leading-relaxed">{event.tagline}</p>

        {/* Location */}
        <div className="flex items-center gap-1.5 mt-auto">
          <MapPin className="w-3.5 h-3.5 text-white/40 shrink-0" />
          <span className="text-xs text-white/50 truncate">{event.venue}, {event.city}</span>
        </div>

        {/* Price footer */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/8">
          {isSoldOut ? (
            <span className="text-sm text-white/40 font-semibold">Sold Out</span>
          ) : lowestTier && lowestTier.price === 0 ? (
            <span className="text-sm font-black text-signal-lime">Free</span>
          ) : lowestTier ? (
            <div>
              <span className="text-[10px] text-white/40 uppercase tracking-widest block">From</span>
              <span className="text-sm font-black text-white">LKR {lowestTier.price.toLocaleString('en-LK')}</span>
            </div>
          ) : null}

          {lowestTier && (
            <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${TIER_COLORS[lowestTier.name]}`}>
              {lowestTier.label}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
