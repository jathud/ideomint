'use client';

import React from 'react';
import { Network, Cpu, Rocket } from 'lucide-react';
import AnimatedSection from '@/components/ui/AnimatedSection';

export default function Process() {
  const steps = [
    {
      id: '01',
      title: 'Discover',
      subtitle: 'Strategy & Discovery',
      icon: Network,
      textColor: 'text-creative-flame',
      borderColor: 'border-creative-flame/50',
      glowColor: 'bg-creative-flame/20',
      description: 'We listen to your goals, understand your audience, and agree on a clear brief, scope, and creative direction.',
    },
    {
      id: '02',
      title: 'Create & Refine',
      subtitle: 'Creative Development',
      icon: Cpu,
      textColor: 'text-digital-pulse',
      borderColor: 'border-digital-pulse/50',
      glowColor: 'bg-digital-pulse/20',
      description: 'We develop the work, share it at agreed milestones, and refine it with your feedback. Strategy and craft guide each decision.',
    },
    {
      id: '03',
      title: 'Launch & Support',
      subtitle: 'Launch & Scale',
      icon: Rocket,
      textColor: 'text-signal-lime',
      borderColor: 'border-signal-lime/50',
      glowColor: 'bg-signal-lime/20',
      description: 'We prepare the final assets, check the details, and support a clear handover. Any ongoing support is agreed as part of your project.',
    }
  ];

  return (
    <section id="process" className="section-spacing text-white relative overflow-hidden">
      {/* Ambient Side Lights */}
      <div className="absolute top-1/2 -left-[10%] w-[400px] h-[400px] bg-creative-flame/5 rounded-full blur-[80px] -translate-y-1/2 pointer-events-none" />
      <div className="absolute top-1/2 -right-[10%] w-[400px] h-[400px] bg-digital-pulse/5 rounded-full blur-[80px] -translate-y-1/2 pointer-events-none" />

      <div className="container-layout relative z-10">
        
        {/* Section Header */}
        <AnimatedSection>
          <div className="max-w-5xl mb-8 md:mb-12 mx-auto text-center">
            <div className="flex items-center justify-center gap-4 mb-6">
              <div className="h-px bg-white/20 w-12" />
              <span className="text-creative-flame font-bold tracking-widest text-xs uppercase">Our Process</span>
              <div className="h-px bg-white/20 w-12" />
            </div>
            
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black leading-[1.1] tracking-tight text-white ">
              From first conversation <span className="text-creative-flame">to final delivery.</span>
            </h2>
          </div>
        </AnimatedSection>

        <ol className="grid md:grid-cols-3 gap-4 md:gap-6">
          {steps.map(step => {
            const Icon = step.icon;
            return (
              <li key={step.id} className="rounded-2xl border border-white/10 bg-white/5 p-5 md:p-7">
                <div className="flex items-center justify-between mb-4 md:mb-6">
                  <Icon aria-hidden="true" className={`h-7 w-7 ${step.textColor}`} strokeWidth={1.5} />
                  <span className="text-sm font-bold text-white/60">{step.id}</span>
                </div>
                <h3 className="text-xl md:text-2xl font-black tracking-tight mb-3">{step.title}</h3>
                <p className="text-sm md:text-base text-white/75 leading-relaxed">{step.description}</p>
              </li>
            );
          })}
        </ol>

      </div>
    </section>
  );
}
