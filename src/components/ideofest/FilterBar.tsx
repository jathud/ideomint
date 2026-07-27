'use client';

import { Search, ChevronDown, X } from 'lucide-react';
import { useState } from 'react';
import { CATEGORY_LABELS } from '@/lib/ideofest/mock-data';

export interface FilterState {
  search: string;
  category: string;
  sort: 'date' | 'popularity' | 'price';
}

interface FilterBarProps {
  filters: FilterState;
  onChange: (f: FilterState) => void;
}

const SORT_OPTIONS = [
  { value: 'date', label: 'Date (Soonest)' },
  { value: 'popularity', label: 'Most Popular' },
  { value: 'price', label: 'Price (Low → High)' },
] as const;

export default function FilterBar({ filters, onChange }: FilterBarProps) {
  const [catOpen, setCatOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);

  const categories = [
    { value: '', label: 'All Categories' },
    ...Object.entries(CATEGORY_LABELS).map(([k, v]) => ({ value: k, label: v })),
  ];

  const activeCategory = categories.find((c) => c.value === filters.category) || categories[0];
  const activeSort = SORT_OPTIONS.find((s) => s.value === filters.sort) || SORT_OPTIONS[0];

  return (
    <div className="flex flex-wrap gap-3 items-center">
      {/* Search */}
      <div className="relative flex-1 min-w-[220px]">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
        <input
          type="text"
          placeholder="Search events…"
          value={filters.search}
          onChange={(e) => onChange({ ...filters, search: e.target.value })}
          className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-signal-lime transition-colors"
        />
        {filters.search && (
          <button
            onClick={() => onChange({ ...filters, search: '' })}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Category */}
      <div className="relative">
        <button
          onClick={() => { setCatOpen(!catOpen); setSortOpen(false); }}
          className="flex items-center gap-2 bg-white/5 border border-white/10 hover:border-white/20 rounded-xl px-4 py-3 text-sm text-white font-medium transition-colors"
        >
          {activeCategory.label}
          <ChevronDown className={`w-4 h-4 text-white/40 transition-transform ${catOpen ? 'rotate-180' : ''}`} />
        </button>
        {catOpen && (
          <div className="absolute top-full left-0 mt-2 w-48 bg-[#1A1C23] border border-white/10 rounded-xl overflow-hidden shadow-2xl z-50">
            {categories.map((c) => (
              <button
                key={c.value}
                onClick={() => { onChange({ ...filters, category: c.value }); setCatOpen(false); }}
                className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${filters.category === c.value ? 'text-signal-lime bg-signal-lime/10' : 'text-white/70 hover:text-white hover:bg-white/8'}`}
              >
                {c.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Sort */}
      <div className="relative">
        <button
          onClick={() => { setSortOpen(!sortOpen); setCatOpen(false); }}
          className="flex items-center gap-2 bg-white/5 border border-white/10 hover:border-white/20 rounded-xl px-4 py-3 text-sm text-white font-medium transition-colors"
        >
          {activeSort.label}
          <ChevronDown className={`w-4 h-4 text-white/40 transition-transform ${sortOpen ? 'rotate-180' : ''}`} />
        </button>
        {sortOpen && (
          <div className="absolute top-full left-0 mt-2 w-52 bg-[#1A1C23] border border-white/10 rounded-xl overflow-hidden shadow-2xl z-50">
            {SORT_OPTIONS.map((s) => (
              <button
                key={s.value}
                onClick={() => { onChange({ ...filters, sort: s.value }); setSortOpen(false); }}
                className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${filters.sort === s.value ? 'text-signal-lime bg-signal-lime/10' : 'text-white/70 hover:text-white hover:bg-white/8'}`}
              >
                {s.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Clear */}
      {(filters.search || filters.category || filters.sort !== 'date') && (
        <button
          onClick={() => onChange({ search: '', category: '', sort: 'date' })}
          className="text-xs text-white/40 hover:text-creative-flame transition-colors font-medium underline underline-offset-2"
        >
          Clear filters
        </button>
      )}
    </div>
  );
}
