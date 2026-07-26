'use client';

import React, { useState } from 'react';
import { Check, Minus, ChevronDown } from 'lucide-react';

interface PricingCardProps {
  name: string;
  price: string;
  period?: string;
  description: string;
  features: string[];
  exclusions?: string[];
  isFeatured?: boolean;
  featuredLabel?: string;
}

export default function PricingCard({
  name,
  price,
  period,
  description,
  features,
  exclusions,
  isFeatured = false,
  featuredLabel = 'Most Chosen',
}: PricingCardProps) {
  const [showExclusions, setShowExclusions] = useState(false);

  return (
    <div
      className={`relative flex flex-col rounded-2xl p-6 md:p-8 transition-all duration-500 will-change-transform ${
        isFeatured
          ? 'bg-white/[0.08] backdrop-blur-md border-2 border-signal-lime/40 shadow-[0_0_40px_rgba(199,243,107,0.08)]'
          : 'bg-white/5 backdrop-blur-md border border-white/10 hover:bg-white/[0.08] hover:border-white/20'
      }`}
    >
      {/* Featured Badge */}
      {isFeatured && (
        <div className="absolute -top-3 left-6">
          <span className="bg-signal-lime text-section-ink text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full">
            {featuredLabel}
          </span>
        </div>
      )}

      {/* Package Name */}
      <h3 className="text-lg font-bold text-white mb-2 mt-1">{name}</h3>

      {/* Price */}
      <div className="mb-4">
        <span className="text-3xl md:text-4xl font-black text-creative-flame">{price}</span>
        {period && (
          <span className="text-sm text-white/50 font-medium ml-2">{period}</span>
        )}
      </div>

      {/* Description */}
      <p className="text-sm text-white/60 leading-relaxed mb-6">{description}</p>

      {/* Divider */}
      <div className="h-px bg-white/10 mb-6" />

      {/* Features */}
      <ul className="flex flex-col gap-3 mb-6 flex-grow">
        {features.map((feature, i) => (
          <li key={i} className="flex items-start gap-3">
            <Check className="w-4 h-4 text-creative-flame shrink-0 mt-0.5" />
            <span className="text-sm text-white/80 leading-relaxed">{feature}</span>
          </li>
        ))}
      </ul>

      {/* Exclusions (collapsible) */}
      {exclusions && exclusions.length > 0 && (
        <div className="mb-6">
          <button
            type="button"
            onClick={() => setShowExclusions(!showExclusions)}
            className="flex items-center gap-2 text-xs font-bold text-white/40 uppercase tracking-widest hover:text-white/60 transition-colors cursor-pointer"
          >
            What's not included
            <ChevronDown
              className={`w-3 h-3 transition-transform duration-300 ${
                showExclusions ? 'rotate-180' : ''
              }`}
            />
          </button>
          {showExclusions && (
            <ul className="flex flex-col gap-2 mt-4 animate-[loadingFadeUp_0.2s_ease-out_forwards]">
              {exclusions.map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <Minus className="w-4 h-4 text-white/20 shrink-0 mt-0.5" />
                  <span className="text-sm text-white/40 leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* CTA */}
      <a
        href="#custom-plan"
        className={`w-full py-4 rounded-xl font-bold text-center transition-colors cursor-pointer block ${
          isFeatured
            ? 'bg-creative-flame hover:bg-[#E54D30] text-white'
            : 'bg-white/10 hover:bg-white/20 text-white border border-white/10'
        }`}
      >
        Get Started
      </a>
    </div>
  );
}
