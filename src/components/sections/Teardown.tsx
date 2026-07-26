'use client';

import React from 'react';
import AnimatedSection from '@/components/ui/AnimatedSection';

const audits = [
  {
    id: 'apple',
    brand: 'APPLE',
    title: 'The Masterclass in Restraint',
    points: [
      'Negative Space as Luxury: By removing visual clutter, they force focus onto the product silhouette.',
      'Emotional Naming: They don\'t sell a "Portable Music Player," they sell an "iPod." Identity over utility.',
      'Packaging as Theater: The unboxing experience is meticulously engineered to release dopamine.'
    ],
    accentColor: 'border-white/20'
  },
  {
    id: 'nike',
    brand: 'NIKE',
    title: 'Selling a Feeling, Not a Shoe',
    points: [
      'The Hero Archetype: Every ad positions the customer as an underdog overcoming an obstacle.',
      'Abstract Positioning: The swoosh represents motion and sound, completely divorced from footwear.',
      'Cultural Integration: They don\'t sponsor athletes; they co-author cultural moments with them.'
    ],
    accentColor: 'border-creative-flame/50'
  },
  {
    id: 'tesla',
    brand: 'TESLA',
    title: 'The Anti-Marketing Machine',
    points: [
      'Zero-Dollar Ad Spend: By polarizing public opinion, they generate billions in free earned media.',
      'Brutalist Product Naming: S, 3, X, Y. Stripped down, memorable, and cheekily interwoven.',
      'The Mascot Strategy: The CEO functions as the primary marketing channel, centralizing brand loyalty.'
    ],
    accentColor: 'border-digital-pulse/50'
  }
];

export default function Teardown() {
  return (
    <section id="teardown" className="section-spacing relative text-white">
      {/* Background Ambience */}
      <div className="absolute top-1/2 right-0 w-[500px] h-[500px] bg-creative-flame/5 rounded-full blur-[120px] -translate-y-1/2 pointer-events-none" />
      
      <div className="container-layout relative z-10">
        <AnimatedSection>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16 md:mb-24">
            <div className="max-w-2xl">
              <div className="flex items-center gap-4 mb-6">
                <span className="text-creative-flame font-bold tracking-widest text-xs uppercase">05 / Brand Case Studies</span>
                <div className="h-px bg-white/20 w-12" />
              </div>
              
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-black leading-[1.1] tracking-tight">
                We don't just admire great brands. <span className="text-creative-flame">We decode them.</span>
              </h2>
            </div>
            
            <p className="text-white/50 max-w-sm md:text-right pb-2">
              A look inside our strategic engine. Here is how we break down the architecture of category-defining brands.
            </p>
          </div>
        </AnimatedSection>

        <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
          {audits.map((audit, idx) => (
            <AnimatedSection key={audit.id} className={`h-full delay-[${idx * 150}ms]`}>
              <div className={`relative bg-white/5 backdrop-blur-md border-t-[3px] border-x border-b border-x-white/10 border-b-white/10 p-8 md:p-10 rounded-2xl h-full flex flex-col overflow-hidden group hover:bg-white/10 transition-colors ${audit.accentColor}`}>
                
                {/* Background Typography Watermark */}
                <div className="absolute -right-8 -top-8 text-[120px] font-black text-white/[0.03] tracking-tighter leading-none select-none group-hover:text-white/[0.06] transition-colors duration-500">
                  {audit.brand}
                </div>
                
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-8">
                    <span className="text-xs font-bold tracking-widest uppercase text-white/40 group-hover:text-creative-flame transition-colors">
                      Case Study {idx + 1}
                    </span>
                  </div>
                  
                  <h3 className="text-2xl font-black tracking-tight mb-8">
                    {audit.title}
                  </h3>
                  
                  <ul className="flex flex-col gap-6 mt-auto">
                    {audit.points.map((point, pIdx) => (
                      <li key={pIdx} className="flex gap-4">
                        <span className="text-creative-flame font-bold text-sm mt-0.5">0{pIdx + 1}</span>
                        <p className="text-white/70 text-sm leading-relaxed">{point}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
}
