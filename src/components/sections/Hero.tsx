import { ArrowDown, ArrowRight } from 'lucide-react';
import MintingFrame from './MintingFrame';

export default function Hero() {
  return (
    <section id="home" className="relative isolate overflow-hidden bg-section-ink text-white min-h-[100svh] flex items-center pt-28 pb-12 lg:pt-36 lg:pb-20">
      <div className="container-layout w-full">
        <div className="flex items-center justify-between gap-5 mb-8 lg:mb-10">
          <p className="text-xs font-bold uppercase tracking-[0.15em] text-white/60">Creative & Digital Studio / Jaffna</p>
          <p className="hidden lg:block text-xs font-bold uppercase tracking-[0.18em] text-white/65">From idea to impact</p>
        </div>
        <div className="grid lg:grid-cols-12 gap-y-12 gap-x-10 items-center">
          <div className="relative z-10 lg:col-span-7 min-w-0">
            <h1 aria-label="Exceptional Ideas. Flawlessly Minted." className="font-black tracking-[-0.045em]">
              <span className="block text-[clamp(1.625rem,5.5vw,5.25rem)] leading-[1.08]">Exceptional <span id="hero-idea-seed">Ideas.</span></span>
              <span className="block text-[clamp(1.875rem,5.5vw,5.25rem)] leading-[1.08] mt-1">Flawlessly</span>
              <span id="hero-minted-word" className="inline-block origin-bottom-left text-[clamp(4rem,19vw,5rem)] lg:text-[clamp(5rem,10.5vw,10rem)] leading-[0.98] text-creative-flame mt-1">Minted.</span>
            </h1>
            <p className="text-base md:text-lg text-white/70 leading-relaxed max-w-md mt-6 lg:mt-8">Websites, marketing and creative experiences that help businesses stand out and grow.</p>
            <div className="flex flex-wrap items-center gap-4 sm:gap-6 mt-7 lg:mt-9">
              <a href="#work" className="inline-flex min-h-14 items-center justify-center gap-3 bg-creative-flame hover:bg-[#E54D30] text-section-ink px-6 sm:px-7 py-4 rounded-full font-black text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white group">
                Explore Our Work <ArrowRight aria-hidden="true" className="w-4 h-4 group-hover:translate-x-1 transition-transform motion-reduce:transform-none" />
              </a>
              <a href="https://wa.me/94786892649" target="_blank" rel="noopener noreferrer" aria-label="Chat on WhatsApp (opens in a new tab)" className="inline-flex min-h-14 items-center justify-center gap-3 rounded-full border border-[#25D366] px-6 sm:px-7 py-4 text-sm font-bold text-[#25D366] hover:bg-[#25D366]/10 transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#25D366]">
                <svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5 shrink-0"><path d="M20.52 3.48A11.9 11.9 0 0 0 12.04 0C5.44 0 .07 5.37.06 11.97c0 2.11.55 4.17 1.6 5.99L0 24l6.18-1.62a11.97 11.97 0 0 0 5.85 1.49h.01c6.6 0 11.97-5.37 11.98-11.97a11.9 11.9 0 0 0-3.5-8.42ZM12.04 21.85a9.94 9.94 0 0 1-5.07-1.39l-.36-.21-3.67.96.98-3.58-.23-.37a9.92 9.92 0 0 1-1.52-5.29c0-5.48 4.46-9.94 9.95-9.94a9.88 9.88 0 0 1 7.03 2.92 9.88 9.88 0 0 1 2.91 7.04c0 5.48-4.46 9.86-9.94 9.86Zm5.45-7.43c-.3-.15-1.77-.87-2.04-.97-.28-.1-.48-.15-.68.15-.2.3-.77.97-.95 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.18-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.18.2-.3.3-.5.1-.2.05-.37-.03-.52-.07-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.49s1.07 2.89 1.22 3.09c.15.2 2.11 3.22 5.12 4.52.72.31 1.28.5 1.72.64.72.23 1.38.2 1.9.12.58-.09 1.77-.72 2.02-1.42.25-.7.25-1.3.17-1.42-.07-.13-.27-.2-.57-.35Z" /></svg>
                Chat on WhatsApp
              </a>
            </div>
          </div>
          <div className="lg:col-span-5 min-w-0 px-2 lg:px-0"><MintingFrame /></div>
        </div>
        <div className="flex items-center justify-between gap-6 border-t border-white/10 mt-10 lg:mt-12 pt-5">
          <p className="text-[9px] sm:text-xs font-bold uppercase tracking-[0.1em] text-white/65">Websites <span className="mx-1.5 text-creative-flame">/</span> Marketing <span className="mx-1.5 text-creative-flame">/</span> Content & Creative</p>
          <a href="#services" className="hidden sm:inline-flex shrink-0 items-center gap-3 text-xs font-bold uppercase tracking-widest text-white/70 hover:text-white transition-colors">Explore <ArrowDown aria-hidden="true" className="w-3 h-3" /></a>
        </div>
      </div>
    </section>
  );
}
