'use client';

import React from 'react';
import { Network, Cpu, Rocket } from 'lucide-react';
import AnimatedSection from '@/components/ui/AnimatedSection';

export default function Process() {
  const steps = [
    {
      id: '01',
      title: 'The Download',
      subtitle: 'Strategy & Discovery',
      icon: Network,
      textColor: 'text-creative-flame',
      borderColor: 'border-creative-flame/50',
      glowColor: 'bg-creative-flame/20',
      description: 'We sit with you to extract your vision. We define your exact target audience, brand voice, and visual direction. No guesswork—just deep, human understanding of your goals.',
    },
    {
      id: '02',
      title: 'The Generation',
      subtitle: 'AI-Powered Execution',
      icon: Cpu,
      textColor: 'text-digital-pulse',
      borderColor: 'border-digital-pulse/50',
      glowColor: 'bg-digital-pulse/20',
      description: 'Our human experts use advanced AI workflows to instantly generate, test, and iterate on designs, copy, and campaigns. What takes traditional agencies weeks, we build in days.',
    },
    {
      id: '03',
      title: 'The Deployment',
      subtitle: 'Launch & Scale',
      icon: Rocket,
      textColor: 'text-signal-lime',
      borderColor: 'border-signal-lime/50',
      glowColor: 'bg-signal-lime/20',
      description: 'We deliver polished, market-ready assets. You launch faster, look more professional, and grow your brand without the bloated costs or endless waiting periods.',
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
          <div className="max-w-5xl mb-24 mx-auto text-center">
            <div className="flex items-center justify-center gap-4 mb-6">
              <div className="h-px bg-white/20 w-12" />
              <span className="text-creative-flame font-bold tracking-widest text-xs uppercase">06 / The Process</span>
              <div className="h-px bg-white/20 w-12" />
            </div>
            
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black leading-[1.1] tracking-tight text-white lg:whitespace-nowrap">
              How we build <span className="text-creative-flame">faster than anyone else.</span>
            </h2>
          </div>
        </AnimatedSection>

        {/* Vertical Flow Diagram */}
        <div className="relative max-w-4xl mx-auto">
          
          {/* Vertical Connecting Line */}
          <div className="absolute left-[39px] md:left-1/2 md:-translate-x-1/2 top-[50px] bottom-[50px] w-0.5 bg-white/10 z-0">
            {/* Animated Pulse Line */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/50 to-transparent w-full h-1/3 animate-[pulse_3s_ease-in-out_infinite]" />
          </div>

          <div className="flex flex-col gap-12 relative z-10">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isEven = index % 2 === 1;
              
              return (
                <AnimatedSection key={step.id}>
                  <div className={`flex flex-col md:flex-row items-start md:items-center gap-8 md:gap-16 group ${isEven ? 'md:flex-row-reverse' : ''}`}>
                    
                    {/* The Node (Mobile: Left aligned | Desktop: Center aligned) */}
                    <div className="relative shrink-0 flex items-center justify-center w-20 h-20 md:absolute md:left-1/2 md:-translate-x-1/2 md:w-24 md:h-24">
                      <div className={`absolute inset-0 ${step.glowColor} rounded-full blur-[30px] opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none`} />
                      <div className={`w-20 h-20 md:w-24 md:h-24 rounded-full bg-section-ink border-2 ${step.borderColor} flex items-center justify-center relative z-10 shadow-[0_0_30px_rgba(0,0,0,0.5)]`}>
                        <Icon className={`w-8 h-8 md:w-10 md:h-10 ${step.textColor}`} strokeWidth={1.5} />
                        <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-white text-section-ink font-black text-sm flex items-center justify-center shadow-lg">
                          {step.id}
                        </div>
                      </div>
                    </div>

                    {/* Content Card */}
                    <div className={`bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-8 w-full md:w-[calc(50%-4rem)] ${isEven ? 'md:text-right md:ml-auto' : 'md:text-left md:mr-auto'}`}>
                      <h3 className="text-2xl font-black mb-2 text-white">{step.title}</h3>
                      <p className={`${step.textColor} font-bold tracking-widest text-xs uppercase mb-4`}>{step.subtitle}</p>
                      <p className="text-base text-white/70 leading-relaxed font-medium">
                        {step.description}
                      </p>
                    </div>

                  </div>
                </AnimatedSection>
              );
            })}
          </div>

        </div>

      </div>
    </section>
  );
}
