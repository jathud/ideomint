'use client';

import React from 'react';
import AnimatedSection from '@/components/ui/AnimatedSection';

const principles = [
  {
    id: '01',
    title: 'Build from zero',
    inspiration: 'Inspired by Zero to One',
    description: 'We don\'t copy what works for others. We dig to the root of your problem and build what\'s missing.',
    color: 'creative-flame'
  },
  {
    id: '02',
    title: 'Systems over goals',
    inspiration: 'Inspired by Atomic Habits',
    description: 'We don\'t chase one-time viral wins. We build repeatable brand systems that compound over time.',
    color: 'signal-lime'
  },
  {
    id: '03',
    title: 'Patience is strategy',
    inspiration: 'Inspired by Psychology of Money',
    description: 'The best brands aren\'t built in a week. We play the long game with you, making rational creative choices.',
    color: 'digital-pulse'
  },
  {
    id: '04',
    title: 'Clarity over complexity',
    inspiration: 'Ideomint Original',
    description: 'If your audience can\'t understand your value proposition in 3 seconds, the design isn\'t ready.',
    color: 'white'
  }
];

export default function Principles() {
  return (
    <section id="principles" className="section-spacing text-white relative">
      <div className="absolute top-1/2 left-1/4 w-[400px] h-[400px] bg-digital-pulse/5 rounded-full blur-[80px] -translate-x-1/2 pointer-events-none" />
      
      <div className="container-layout relative z-10">
        <AnimatedSection>
          <div className="max-w-4xl mb-16 md:mb-24">
            <div className="flex items-center gap-4 mb-6">
              <span className="text-creative-flame font-bold tracking-widest text-xs uppercase">05 / The Philosophy</span>
              <div className="h-px bg-white/20 w-12" />
            </div>
            
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black leading-[1.1] tracking-tight">
              A disciplined, <span className="text-white/50">monk-like</span> approach to <span className="text-creative-flame">brand building.</span>
            </h2>
          </div>
        </AnimatedSection>

        <div className="grid sm:grid-cols-2 gap-6 lg:gap-8">
          {principles.map((principle, idx) => (
            <AnimatedSection key={principle.id} className={`h-full delay-[${idx * 100}ms]`}>
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-8 md:p-10 h-full flex flex-col group hover:bg-white/10 hover:border-white/20 transition-colors">
                <div className="flex justify-between items-start mb-12">
                  <span className={`text-${principle.color} font-black text-xl`}>{principle.id}</span>
                  <span className="text-[10px] uppercase tracking-widest font-bold text-white/40 group-hover:text-white/60 transition-colors">
                    {principle.inspiration}
                  </span>
                </div>
                
                <h3 className="text-2xl md:text-3xl font-black tracking-tight mb-4 text-white">
                  {principle.title}
                </h3>
                <p className="text-white/70 font-medium leading-relaxed mt-auto">
                  {principle.description}
                </p>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
}
