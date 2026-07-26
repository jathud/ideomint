import React from 'react';

export default function About() {
  return (
    <section id="about" className="section-spacing text-white relative">
      {/* Background Ambient Glow */}
      <div className="absolute top-1/4 -left-1/4 w-[400px] h-[400px] bg-digital-pulse/8 rounded-full blur-[80px] pointer-events-none" />
      <div className="absolute bottom-1/4 -right-[10%] w-[400px] h-[400px] bg-creative-flame/5 rounded-full blur-[80px] pointer-events-none" />

      <div className="container-layout">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
          
          {/* Left Column */}
          <div className="flex flex-col gap-6 lg:gap-8 relative z-10">
            <div className="flex items-center gap-4">
              <span className="text-creative-flame font-bold tracking-widest text-xs uppercase">01 / About Us</span>
              <div className="h-px bg-white/20 w-12" />
            </div>
            
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black leading-[1.1] tracking-tight">
              We don't just build brands. <span className="text-white/50">We mint</span> <span className="text-creative-flame">experiences.</span>
            </h2>
            
            <p className="text-base lg:text-lg text-white/70 max-w-xl leading-relaxed">
              At Ideomint, we bridge the gap between raw imagination and flawless execution. Our team of strategists, designers, and visionaries work in unison to forge ideas into brands and moments that endure.
            </p>
            
            <a href="#services" className="flex items-center gap-3 w-max group mt-2 lg:mt-4 underline underline-offset-8 decoration-creative-flame font-bold text-sm tracking-widest uppercase">
              Explore the Studio
            </a>
          </div>
          
          {/* Right Column (Values Grid) */}
          <div className="grid sm:grid-cols-2 gap-6 relative mt-8 lg:mt-0">
            {/* Background Accent */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-creative-flame/5 blur-3xl rounded-full z-0 pointer-events-none" />
            
            {/* Cards */}
            <div className="bg-white/[0.02] border border-white/5 p-6 lg:p-8 rounded-2xl relative z-10">
              <div className="w-10 h-10 border-t-[3px] border-l-[3px] border-creative-flame mb-6" />
              <h3 className="text-xl font-bold mb-3">Strategic Depth</h3>
              <p className="text-sm text-white/60 leading-relaxed">Research-backed positioning that ensures every creative decision serves a clear, measurable purpose.</p>
            </div>
            <div className="bg-white/[0.02] border border-white/5 p-6 lg:p-8 rounded-2xl relative z-10 sm:translate-y-8">
              <div className="w-10 h-10 border-t-[3px] border-r-[3px] border-signal-lime mb-6 ml-auto" />
              <h3 className="text-xl font-bold mb-3 text-right">Creative Agility</h3>
              <p className="text-sm text-white/60 leading-relaxed text-right">Adapting to cultural shifts and technological advancements to keep your brand relevant and striking.</p>
            </div>
            <div className="bg-white/[0.02] border border-white/5 p-6 lg:p-8 rounded-2xl relative z-10">
              <div className="w-10 h-10 border-b-[3px] border-l-[3px] border-digital-pulse mb-6" />
              <h3 className="text-xl font-bold mb-3">Flawless Execution</h3>
              <p className="text-sm text-white/60 leading-relaxed">From digital interfaces to physical activations, we deliver uncompromising quality at every touchpoint.</p>
            </div>
            <div className="bg-white/[0.02] border border-white/5 p-6 lg:p-8 rounded-2xl relative z-10 sm:translate-y-8">
              <div className="w-10 h-10 border-b-[3px] border-r-[3px] border-creative-flame mb-6 ml-auto" />
              <h3 className="text-xl font-bold mb-3 text-right">Lasting Impact</h3>
              <p className="text-sm text-white/60 leading-relaxed text-right">Building communities and fostering loyalty through genuine, memorable human experiences.</p>
            </div>
          </div>
          
        </div>
      </div>
    </section>
  );
}
