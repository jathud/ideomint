'use client';

import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const sections = [
  {
    title: 'Monthly Packages',
    items: [
      'Full monthly payment is required before work begins.',
      'Content planning starts after payment and approval.',
      'Paid advertising budgets are separate.',
      'Professional shoots, travel, studio rental, props, models, and external production costs are separate unless included in writing.',
      'Unused content does not automatically move to the next month unless agreed.',
    ],
  },
  {
    title: 'One-Time Projects',
    items: [
      '50% advance before work begins.',
      '30% after first major approval.',
      '20% before final delivery, launch, or handover.',
    ],
  },
  {
    title: 'Revisions',
    items: [
      'Each package includes only the listed number of revisions.',
      'Extra changes after approval may be charged separately.',
      'Major changes after concept approval may be treated as new work.',
    ],
  },
];

export default function WorkingTerms() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="flex flex-col gap-3">
      {sections.map((section, index) => (
        <div
          key={index}
          className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl overflow-hidden"
        >
          <button
            type="button"
            onClick={() => setOpenIndex(openIndex === index ? null : index)}
            className="w-full flex items-center justify-between px-6 py-5 cursor-pointer"
          >
            <span className="text-sm font-bold text-white">{section.title}</span>
            <ChevronDown
              className={`w-4 h-4 text-white/50 transition-transform duration-300 ${
                openIndex === index ? 'rotate-180' : ''
              }`}
            />
          </button>
          {openIndex === index && (
            <div className="px-6 pb-6 animate-[loadingFadeUp_0.2s_ease-out_forwards]">
              <ul className="flex flex-col gap-3">
                {section.items.map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-creative-flame shrink-0 mt-2" />
                    <span className="text-sm text-white/60 leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
