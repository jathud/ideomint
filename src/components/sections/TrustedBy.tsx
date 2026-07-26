import { Disc, Cloud, CircleDashed, SquareSquare } from 'lucide-react';

export default function TrustedBy() {
  return (
    <section className="bg-section-ink border-t border-white/10 py-8 md:py-12" aria-labelledby="trusted-by-heading">
      <div className="container-layout flex flex-col md:flex-row items-center gap-8 justify-between">
        <h2 id="trusted-by-heading" className="text-xs font-bold tracking-widest text-white/40 uppercase whitespace-nowrap">
          Trusted By
        </h2>
        
        <ul className="w-full flex items-center justify-between gap-12 md:gap-8 overflow-x-auto opacity-100 md:opacity-50 grayscale-0 md:grayscale md:hover:grayscale-0 transition-all duration-500 hide-scrollbar py-4 px-2">
          <li className="flex items-center gap-2 min-w-max">
            <Disc className="w-6 h-6 text-white" />
            <span className="font-bold text-white text-lg tracking-tight">newtone<span className="text-xs font-normal tracking-widest ml-1">RECORDS</span></span>
          </li>
          
          <li className="flex items-center gap-2 min-w-max">
            <Cloud className="w-6 h-6 text-white" />
            <div className="flex flex-col">
              <span className="font-bold text-white text-sm tracking-widest uppercase">Cloud 9</span>
              <span className="text-[10px] text-white/70 tracking-widest uppercase">Experiences</span>
            </div>
          </li>
          
          <li className="flex items-center gap-2 min-w-max">
            <span className="font-black text-white text-xl tracking-tighter lowercase">urban monkey<sup className="text-[10px] font-normal">®</sup></span>
          </li>
          
          <li className="flex flex-col items-center min-w-max">
            <span className="font-normal text-white text-xl tracking-[0.2em] uppercase">Ayra</span>
            <span className="text-[9px] text-white/70 tracking-[0.3em] uppercase">Events</span>
          </li>
          
          <li className="flex items-center gap-2 min-w-max">
            <SquareSquare className="w-5 h-5 text-white" />
            <span className="font-bold text-white text-lg tracking-tight">pixel<span className="text-[10px] font-normal tracking-widest ml-1 uppercase">Studios</span></span>
          </li>
        </ul>
      </div>
    </section>
  );
}
