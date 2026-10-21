'use client';

import { portfolioServices, type PortfolioService } from '@/lib/portfolio/categories';

export default function ServiceFilters({ selected, onSelect }: {
  selected: PortfolioService | null;
  onSelect: (service: PortfolioService | null) => void;
}) {
  return (
    <div data-service-controls role="group" aria-label="Portfolio services" className="flex flex-wrap items-center gap-2 mb-6 md:mb-8">
      {[null, ...portfolioServices].map(service => (
        <button
          type="button"
          key={service ?? 'all'}
          aria-pressed={selected === service}
          aria-controls="work-gallery"
          onClick={() => onSelect(service)}
          className={`min-h-11 px-4 md:px-5 py-2.5 rounded-full text-xs font-bold tracking-wider uppercase border transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-creative-flame ${selected === service
            ? 'bg-creative-flame/15 border-creative-flame/40 text-creative-flame'
            : 'bg-transparent border-white/10 text-white/70 hover:text-white hover:border-white/30'}`}
        >
          {service ?? 'All'}
        </button>
      ))}
    </div>
  );
}
