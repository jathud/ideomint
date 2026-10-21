'use client';

import React from 'react';
import { XCircle, CheckCircle2 } from 'lucide-react';

const comparisons = [
  {
    old: "Unclear ownership and too many handovers.",
    new: "A connected team with clear responsibility.",
  },
  {
    old: "Creative work without a clear brief.",
    new: "A shared direction shaped around your goals.",
  },
  {
    old: "Unclear scope and unexpected extras.",
    new: "Clear packages and an agreed scope before we begin.",
  },
  {
    old: "Delivery without context or a clear handover.",
    new: "Thoughtful delivery with guidance on what comes next.",
  }
];

export default function Comparison() {
  return (
    <section id="comparison" className="section-spacing text-white relative">
      <div className="container-layout">
        
        <div className="max-w-5xl mb-16 mx-auto text-center">
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="h-px bg-white/20 w-12" />
            <span className="text-creative-flame font-bold tracking-widest text-xs uppercase">Why IdeoMint</span>
            <div className="h-px bg-white/20 w-12" />
          </div>
          
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black leading-[1.1] tracking-tight">
            Clear thinking. <span className="text-creative-flame">Connected delivery.</span>
          </h2>
          <p className="text-lg text-white/70 mt-6 font-medium tracking-wide max-w-2xl mx-auto">
            What you can expect when we work together.
          </p>
        </div>

        <div className="max-w-5xl mx-auto relative z-10">
          {/* Ambient Side Lights */}
          <div className="absolute top-1/2 -left-[20%] w-[400px] h-[400px] bg-creative-flame/5 rounded-full blur-[80px] -translate-y-1/2 pointer-events-none" />
          <div className="absolute top-1/2 -right-[20%] w-[400px] h-[400px] bg-digital-pulse/5 rounded-full blur-[80px] -translate-y-1/2 pointer-events-none" />

          {/* Table Header (Hidden on small mobile, visible on sm+) */}
          <div className="hidden sm:grid grid-cols-2 gap-4 md:gap-8 mb-6 px-4 md:px-8 relative z-20">
            <div className="text-white/60 font-bold tracking-widest text-sm uppercase">Common frustrations</div>
            <div className="text-creative-flame font-bold tracking-widest text-sm uppercase">Ideomint</div>
          </div>

          <div className="flex flex-col gap-4 relative z-20">
            {comparisons.map((row, i) => (
              <div 
                key={i} 
                className="grid grid-cols-1 sm:grid-cols-2 gap-0 sm:gap-4 md:gap-8 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden hover:bg-white/10 transition-colors"
              >
                {/* Old Way */}
                <div className="p-6 md:p-8 flex items-start gap-4 border-b sm:border-b-0 sm:border-r border-white/10 opacity-70">
                  <XCircle className="w-6 h-6 text-white/30 shrink-0 mt-0.5" strokeWidth={2} />
                  <div>
                    <span className="sm:hidden text-white/60 font-bold tracking-widest text-xs uppercase mb-2 block">The challenge</span>
                    <p className="text-base md:text-lg font-medium leading-relaxed">{row.old}</p>
                  </div>
                </div>

                {/* New Way */}
                <div className="p-6 md:p-8 flex items-start gap-4 bg-creative-flame/[0.02]">
                  <CheckCircle2 className="w-6 h-6 text-creative-flame shrink-0 mt-0.5" strokeWidth={2} />
                  <div>
                    <span className="sm:hidden text-creative-flame font-bold tracking-widest text-xs uppercase mb-2 block">Ideomint</span>
                    <p className="text-base md:text-lg font-bold text-white leading-relaxed">{row.new}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-16 text-center max-w-5xl mx-auto relative z-20">
          <div className="w-12 h-px bg-white/20 mx-auto mb-8" />
          <h3 className="text-2xl font-black tracking-wide text-white">
            Clear thinking. Honest work. Better progress.
          </h3>
        </div>

      </div>
    </section>
  );
}
