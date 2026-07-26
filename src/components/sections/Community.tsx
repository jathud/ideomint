import React from 'react';
import Image from 'next/image';

export default function Community() {
  return (
    <section id="community" className="text-white section-spacing relative">
      <div className="container-layout">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 lg:gap-8 mb-12 lg:mb-16">
          <div className="max-w-2xl">
            <div className="flex items-center gap-4 mb-6">
              <span className="text-creative-flame font-bold tracking-widest text-xs uppercase">05 / The Collective</span>
              <div className="h-px bg-white/20 w-12" />
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black leading-[1.1] tracking-tight mb-8">
              Join the <span className="text-creative-flame">movement.</span>
            </h2>
            <p className="text-lg text-white/70 leading-relaxed font-medium">
              We're building a global network of creators, strategists, and visionaries. Get exclusive access to our events, resources, and collaborative projects.
            </p>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
          
          {/* Large Image Card */}
          <div className="lg:col-span-2 relative aspect-[4/3] md:aspect-video lg:aspect-auto min-h-[400px] bg-white/5 rounded-3xl overflow-hidden group border border-white/10 backdrop-blur-sm">
            <Image 
              src="https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=2070&auto=format&fit=crop" 
              alt="Community Event" 
              fill 
              sizes="(max-width: 1024px) 100vw, 66vw"
              className="object-cover opacity-40 group-hover:opacity-60 transition-opacity duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-section-ink via-section-ink/40 to-transparent opacity-90" />
            
            <div className="absolute bottom-0 left-0 p-6 md:p-8 lg:p-12">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-creative-flame/20 border border-creative-flame/30 rounded-full text-creative-flame text-xs font-bold uppercase tracking-wider mb-4">
                <span className="w-2 h-2 rounded-full bg-creative-flame animate-pulse" />
                Live Activations
              </div>
              <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-3">The Annual Creator Summit</h3>
              <p className="text-white/70 max-w-md text-sm leading-relaxed">A three-day immersive experience connecting over 5,000 digital creators across music, art, and technology.</p>
            </div>
          </div>

          {/* Metrics Column */}
          <div className="flex flex-col gap-6 lg:gap-8">
            <div className="bg-white/5 backdrop-blur-md border border-white/10 p-8 rounded-3xl flex-1 flex flex-col justify-center relative overflow-hidden group hover:border-creative-flame/30 transition-colors">
              <div className="absolute top-0 right-0 w-24 h-24 bg-creative-flame/20 blur-2xl group-hover:bg-creative-flame/30 transition-colors" />
              <h4 className="text-5xl font-black text-creative-flame mb-2">50+</h4>
              <p className="text-lg font-bold text-white mb-1">Global Events</p>
              <p className="text-sm text-white/50">Hosted across 12 countries in the last year alone.</p>
            </div>
            
            <div className="bg-white/5 backdrop-blur-md border border-white/10 p-8 rounded-3xl flex-1 flex flex-col justify-center relative overflow-hidden group hover:border-digital-pulse/30 transition-colors">
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-digital-pulse/20 blur-2xl group-hover:bg-digital-pulse/30 transition-colors" />
              <h4 className="text-5xl font-black text-digital-pulse mb-2">1M+</h4>
              <p className="text-lg font-bold text-white mb-1">Community Members</p>
              <p className="text-sm text-white/50">Active participants in our digital spaces and forums.</p>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
