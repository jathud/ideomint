'use client';

import React from 'react';
import { Target, Sparkles, Rocket } from 'lucide-react';

export default function Team() {
  return (
    <section id="team" className="section-spacing text-white relative">
      {/* Ambient Side Lights */}
      <div className="absolute top-1/4 -left-[10%] w-[400px] h-[400px] bg-creative-flame/5 rounded-full blur-[80px] pointer-events-none" />
      <div className="absolute top-1/2 -right-[10%] w-[400px] h-[400px] bg-digital-pulse/5 rounded-full blur-[80px] pointer-events-none" />

      <div className="container-layout relative z-10">
        
        <div className="max-w-5xl mb-16 mx-auto text-center">
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="h-px bg-white/20 w-12" />
            <span className="text-creative-flame font-bold tracking-widest text-xs uppercase">04 / The Engine</span>
            <div className="h-px bg-white/20 w-12" />
          </div>
          
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black leading-[1.1] tracking-tight">
            The core pillars of <span className="text-creative-flame">Ideomint.</span>
          </h2>
        </div>

        {/* The 3-Column Horizontal Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 max-w-7xl mx-auto">
          
          {/* Pillar 1: Strategy */}
          <div className="bg-white/5 border border-white/10 rounded-3xl p-6 lg:p-8 relative overflow-hidden group hover:bg-white/10 transition-colors">
            <div className="relative z-10 flex flex-col h-full items-center text-center">
              
              <div className="w-32 h-32 rounded-full mb-6 relative">
                <div className="absolute inset-0 rounded-full border-2 border-creative-flame z-20 pointer-events-none" />
                <div className="absolute inset-[6px] rounded-full border border-white/60 z-20 transition-all duration-500 ease-out group-hover:inset-0 group-hover:opacity-0 pointer-events-none" />
                
                <div className="absolute inset-0 rounded-full overflow-hidden z-10 bg-section-ink flex items-center justify-center">
                  <Target className="w-12 h-12 text-creative-flame opacity-80 group-hover:scale-110 transition-transform duration-700" />
                </div>
              </div>
              
              <h3 className="text-creative-flame font-black tracking-widest text-sm uppercase mt-2 mb-6">Strategic Clarity</h3>
              
              <div className="flex-grow flex flex-col justify-center">
                <p className="text-base font-medium leading-relaxed text-white/90 italic mb-4">
                  "Vision demands absolute focus."
                </p>
                <p className="text-sm font-bold text-white/50 uppercase tracking-widest">
                  The Foundation
                </p>
              </div>
            </div>
          </div>

          {/* Pillar 2: Creativity */}
          <div className="bg-white/5 border border-white/10 rounded-3xl p-6 lg:p-8 relative overflow-hidden group hover:bg-white/10 transition-colors">
            <div className="relative z-10 flex flex-col h-full items-center text-center">
              
              <div className="w-32 h-32 rounded-full mb-6 relative">
                <div className="absolute inset-0 rounded-full border-2 border-signal-lime z-20 pointer-events-none" />
                <div className="absolute inset-[6px] rounded-full border border-white/60 z-20 transition-all duration-500 ease-out group-hover:inset-0 group-hover:opacity-0 pointer-events-none" />
                
                <div className="absolute inset-0 rounded-full overflow-hidden z-10 bg-section-ink flex items-center justify-center">
                  <Sparkles className="w-12 h-12 text-signal-lime opacity-80 group-hover:scale-110 transition-transform duration-700" />
                </div>
              </div>
              
              <h3 className="text-signal-lime font-black tracking-widest text-sm uppercase mt-2 mb-6">Radical Creativity</h3>
              
              <div className="flex-grow flex flex-col justify-center">
                <p className="text-base font-medium leading-relaxed text-white/90 italic mb-4">
                  "Design is power, not decoration."
                </p>
                <p className="text-sm font-bold text-white/50 uppercase tracking-widest">
                  The Spark
                </p>
              </div>
            </div>
          </div>

          {/* Pillar 3: Execution */}
          <div className="bg-white/5 border border-white/10 rounded-3xl p-6 lg:p-8 relative overflow-hidden group hover:bg-white/10 transition-colors">
            <div className="relative z-10 flex flex-col h-full items-center text-center">
              
              <div className="w-32 h-32 rounded-full mb-6 relative">
                <div className="absolute inset-0 rounded-full border-2 border-digital-pulse z-20 pointer-events-none" />
                <div className="absolute inset-[6px] rounded-full border border-white/60 z-20 transition-all duration-500 ease-out group-hover:inset-0 group-hover:opacity-0 pointer-events-none" />
                
                <div className="absolute inset-0 rounded-full overflow-hidden z-10 bg-section-ink flex items-center justify-center">
                  <Rocket className="w-12 h-12 text-digital-pulse opacity-80 group-hover:scale-110 transition-transform duration-700" />
                </div>
              </div>
              
              <h3 className="text-digital-pulse font-black tracking-widest text-sm uppercase mt-2 mb-6">Flawless Execution</h3>
              
              <div className="flex-grow flex flex-col justify-center">
                <p className="text-base font-medium leading-relaxed text-white/90 italic mb-4">
                  "Execution builds empires."
                </p>
                <p className="text-sm font-bold text-white/50 uppercase tracking-widest">
                  The Catalyst
                </p>
              </div>
            </div>
          </div>

        </div>

        {/* The Human + Machine Strategy (Interactive Typography) */}
        <div className="max-w-6xl mx-auto mt-20 mb-10 text-center group cursor-default px-4">
          <div className="flex flex-col items-center justify-center">
            <h3 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black tracking-tight text-white/30 transition-all duration-700 group-hover:text-white leading-tight">
              Brilliant human <span className="text-white group-hover:text-creative-flame transition-colors duration-500">strategy.</span> Accelerated by <span className="text-white group-hover:text-digital-pulse transition-colors duration-500">AI.</span>
            </h3>
            <p className="mt-6 text-base md:text-lg font-medium text-white/40 max-w-3xl mx-auto leading-relaxed transition-colors duration-700 group-hover:text-white/80">
              We don't use AI to replace creativity. We use it to execute your vision 10x faster and eliminate the bloated costs of traditional agencies.
            </p>
          </div>
        </div>

      </div>
    </section>
  );
}
