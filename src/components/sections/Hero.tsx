import Image from 'next/image';
import { Play } from 'lucide-react';

export default function Hero() {
  return (
    <section id="home" className="relative min-h-screen text-white pt-24 lg:pt-32 pb-20 flex flex-col justify-center">
      <div className="container-layout w-full grid lg:grid-cols-[1.2fr_1fr_auto] gap-8 lg:gap-12 items-center">
        {/* Left Column */}
        <div className="flex-1 relative z-10 flex flex-col justify-center max-w-2xl lg:max-w-3xl">
          <p className="text-xs font-bold tracking-[0.1em] text-creative-flame uppercase mb-6">
            Strategic Branding Agency
          </p>
          <h1 className="hero-title text-white mb-8">
            <span>Exceptional Ideas.</span><br />
            <span>Flawlessly <span className="text-creative-flame">Minted.</span></span>
          </h1>
          <p className="text-base md:text-lg text-white/80 max-w-xl leading-relaxed mt-2">
            We take raw, exceptional ideas and forge them into pristine, highly valuable brands and experiences that people trust.
          </p>
          <div className="flex flex-wrap items-center gap-6 mt-8">
            <a href="#work" className="bg-creative-flame hover:bg-[#E54D30] text-white px-8 py-5 rounded-full font-bold transition-all flex items-center justify-center group">
              Explore Our Work
            </a>
            <a href="#services" className="flex items-center gap-3 group px-4 py-2 hover:bg-white/5 rounded-full transition-colors">
              <div className="w-14 h-14 rounded-full border border-white/20 flex items-center justify-center group-hover:border-creative-flame/50 transition-colors bg-white/[0.02]">
                <Play className="w-5 h-5 ml-1" />
              </div>
              <span className="font-bold text-sm tracking-widest uppercase">Watch Showreel</span>
            </a>
          </div>
        </div>

        {/* Right Column (Collage) */}
        <div className="relative w-[calc(100%-2rem)] max-w-[400px] lg:w-full lg:max-w-[560px] aspect-square lg:aspect-[1.1] xl:aspect-[4/3] flex items-center justify-center mx-auto lg:mr-0 mt-12 lg:mt-0">
          {/* Geometric Corner Frames */}
          <div className="absolute -top-3 -left-3 lg:-top-12 lg:-left-12 w-10 h-10 lg:w-24 lg:h-24 border-t-[4px] lg:border-t-[6px] border-l-[4px] lg:border-l-[6px] border-creative-flame z-20 pointer-events-none" />
          <div className="absolute -top-3 -right-3 lg:-top-12 lg:-right-12 w-10 h-10 lg:w-24 lg:h-24 border-t-[4px] lg:border-t-[6px] border-r-[4px] lg:border-r-[6px] border-white z-20 pointer-events-none" />
          <div className="absolute -bottom-3 -left-3 lg:-bottom-12 lg:-left-12 w-10 h-10 lg:w-24 lg:h-24 border-b-[4px] lg:border-b-[6px] border-l-[4px] lg:border-l-[6px] border-white z-20 pointer-events-none" />
          <div className="absolute -bottom-3 -right-3 lg:-bottom-12 lg:-right-12 w-10 h-10 lg:w-24 lg:h-24 border-b-[4px] lg:border-b-[6px] border-r-[4px] lg:border-r-[6px] border-creative-flame z-20 pointer-events-none" />
          
          {/* Center Logo Icon */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 w-[60px] h-[60px] lg:w-[80px] lg:h-[80px] bg-section-ink flex items-center justify-center pointer-events-none">
            <div className="relative w-8 h-8 lg:w-10 lg:h-10">
              {/* Geometric Frame Icon */}
              <div className="absolute top-0 left-0 w-[12px] lg:w-[16px] h-[12px] lg:h-[16px] border-t-[4px] lg:border-t-[5px] border-l-[4px] lg:border-l-[5px] border-creative-flame" />
              <div className="absolute top-0 right-0 w-[12px] lg:w-[16px] h-[12px] lg:h-[16px] border-t-[4px] lg:border-t-[5px] border-r-[4px] lg:border-r-[5px] border-white" />
              <div className="absolute bottom-0 left-0 w-[12px] lg:w-[16px] h-[12px] lg:h-[16px] border-b-[4px] lg:border-b-[5px] border-l-[4px] lg:border-l-[5px] border-white" />
              <div className="absolute bottom-0 right-0 w-[12px] lg:w-[16px] h-[12px] lg:h-[16px] border-b-[4px] lg:border-b-[5px] border-r-[4px] lg:border-r-[5px] border-creative-flame" />
            </div>
          </div>

          {/* Image Grid */}
          <div className="grid grid-cols-2 grid-rows-2 gap-3 w-full h-full relative z-10">
            <div className="relative w-full h-full overflow-hidden group">
              <Image src="/hero_concert.png" alt="Concert crowd" fill priority sizes="(max-width: 768px) 50vw, 25vw" className="object-cover object-center group-hover:scale-105 transition-transform duration-700" />
            </div>
            <div className="relative w-full h-full overflow-hidden group">
              <Image src="/hero_stationery.png" alt="Brand stationery" fill priority sizes="(max-width: 768px) 50vw, 25vw" className="object-cover object-center group-hover:scale-105 transition-transform duration-700" />
            </div>
            <div className="relative w-full h-full overflow-hidden group">
              <Image src="/hero_camera.png" alt="Video camera" fill priority sizes="(max-width: 768px) 50vw, 25vw" className="object-cover object-center group-hover:scale-105 transition-transform duration-700" />
            </div>
            <div className="relative w-full h-full overflow-hidden group">
              <Image src="/hero_performer.png" alt="Live performer" fill priority sizes="(max-width: 768px) 50vw, 25vw" className="object-cover object-center group-hover:scale-105 transition-transform duration-700" />
            </div>
          </div>
        </div>

        {/* Vertical Indicator */}
        <div className="hidden lg:flex flex-col text-[11px] font-bold text-white/40 ml-12 relative">
          {/* Continuous Line */}
          <div className="absolute top-3 bottom-3 left-[5px] w-px bg-white/20 z-0" />
          
          <div className="flex items-center gap-6 py-4 relative z-10 w-full group">
            <span className="text-creative-flame bg-section-ink py-1 relative">
              01
            </span>
            <span className="text-white transition-colors">Strategy</span>
          </div>
          <div className="flex items-center gap-6 py-4 relative z-10 w-full group">
            <span className="bg-section-ink py-1">02</span>
            <span className="group-hover:text-white transition-colors">Design</span>
          </div>
          <div className="flex items-center gap-6 py-4 relative z-10 w-full group">
            <span className="bg-section-ink py-1">03</span>
            <span className="group-hover:text-white transition-colors">Marketing</span>
          </div>
          <div className="flex items-center gap-6 py-4 relative z-10 w-full group">
            <span className="bg-section-ink py-1">04</span>
            <span className="group-hover:text-white transition-colors">Events</span>
          </div>
          <div className="flex items-center gap-6 py-4 relative z-10 w-full group">
            <span className="bg-section-ink py-1">05</span>
            <span className="group-hover:text-white transition-colors">Community</span>
          </div>
        </div>
      </div>
    </section>
  );
}
