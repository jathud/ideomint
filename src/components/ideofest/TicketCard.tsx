'use client';

import { Check } from 'lucide-react';
import type { ITicketTier } from '@/lib/ideofest/types';

interface TicketCardProps {
  tier: ITicketTier;
  selected: boolean;
  quantity: number;
  onSelect: (tier: ITicketTier) => void;
  onQuantityChange: (q: number) => void;
}

const TIER_ACCENT: Record<string, string> = {
  free: 'border-signal-lime bg-signal-lime/10',
  early_bird: 'border-digital-pulse bg-digital-pulse/10',
  standard: 'border-white/30 bg-white/5',
  vip: 'border-creative-flame bg-creative-flame/10',
};

const TIER_BADGE: Record<string, string> = {
  free: 'bg-signal-lime text-section-ink',
  early_bird: 'bg-digital-pulse text-white',
  standard: 'bg-white/20 text-white',
  vip: 'bg-creative-flame text-white',
};

export default function TicketCard({ tier, selected, quantity, onSelect, onQuantityChange }: TicketCardProps) {
  const available = tier.capacity - tier.sold;
  const isSoldOut = available <= 0;

  return (
    <div
      onClick={() => !isSoldOut && onSelect(tier)}
      className={`relative rounded-2xl border-2 p-6 transition-all duration-300 cursor-pointer select-none
        ${isSoldOut ? 'opacity-50 cursor-not-allowed border-white/10 bg-white/3' : selected ? TIER_ACCENT[tier.name] + ' ring-2 ring-offset-2 ring-offset-section-ink ring-creative-flame' : TIER_ACCENT[tier.name] + ' hover:opacity-90'}`}
    >
      {/* Selected check */}
      {selected && (
        <div className="absolute top-4 right-4 w-6 h-6 rounded-full bg-creative-flame flex items-center justify-center">
          <Check className="w-4 h-4 text-white" />
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${TIER_BADGE[tier.name]}`}>
            {tier.label}
          </span>
          <div className="mt-3">
            {tier.price === 0 ? (
              <span className="text-3xl font-black text-signal-lime">Free</span>
            ) : (
              <span className="text-3xl font-black text-white">
                ₹{tier.price.toLocaleString('en-IN')}
              </span>
            )}
            {tier.price > 0 && <span className="text-sm text-white/50 ml-1">/ person</span>}
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-white/40 font-medium">{available} left</p>
        </div>
      </div>

      {/* Perks */}
      <ul className="flex flex-col gap-2 mb-5">
        {tier.perks.map((perk) => (
          <li key={perk} className="flex items-start gap-2">
            <Check className="w-3.5 h-3.5 text-signal-lime mt-0.5 shrink-0" />
            <span className="text-sm text-white/70">{perk}</span>
          </li>
        ))}
      </ul>

      {/* Quantity selector (only when selected) */}
      {selected && !isSoldOut && (
        <div className="flex items-center gap-4 mt-4 pt-4 border-t border-white/15">
          <span className="text-sm text-white/60 font-medium">Qty</span>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onQuantityChange(Math.max(1, quantity - 1)); }}
              className="w-8 h-8 rounded-full border border-white/20 text-white hover:bg-white/10 transition-colors flex items-center justify-center font-bold"
            >
              −
            </button>
            <span className="text-lg font-black text-white w-6 text-center">{quantity}</span>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onQuantityChange(Math.min(Math.min(10, available), quantity + 1)); }}
              className="w-8 h-8 rounded-full border border-white/20 text-white hover:bg-white/10 transition-colors flex items-center justify-center font-bold"
            >
              +
            </button>
          </div>
          {tier.price > 0 && (
            <span className="ml-auto text-sm font-black text-white">
              ₹{(tier.price * quantity).toLocaleString('en-IN')}
            </span>
          )}
        </div>
      )}

      {isSoldOut && (
        <div className="mt-3 text-center text-sm text-white/40 font-semibold">Sold Out</div>
      )}
    </div>
  );
}
