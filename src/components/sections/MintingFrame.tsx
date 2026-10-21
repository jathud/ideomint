'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import { motion, useMotionValue, useReducedMotion, useSpring } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';

export default function MintingFrame() {
  const stage = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const imageX = useMotionValue(0);
  const imageY = useMotionValue(0);
  const x = useSpring(imageX, { stiffness: 120, damping: 30 });
  const y = useSpring(imageY, { stiffness: 120, damping: 30 });

  useEffect(() => {
    if (reduceMotion !== false || !stage.current) return;
    const animations: Animation[] = [];
    const mobile = window.matchMedia('(max-width: 1023px)').matches;
    const start = document.getElementById('hero-idea-seed')?.getBoundingClientRect();
    const frame = stage.current.querySelector('[data-mint-frame]')?.getBoundingClientRect();
    if (!start || !frame) return;
    const sourceX = mobile ? frame.left + frame.width / 2 : start.left + start.width / 2;
    const sourceY = mobile ? frame.top + frame.height / 2 : start.top + start.height / 2;

    stage.current.querySelectorAll<HTMLElement>('[data-mint-corner]').forEach((corner, index) => {
      const box = corner.getBoundingClientRect();
      const dx = mobile ? (index % 2 === 0 ? 8 : -8) : sourceX - (box.left + box.width / 2);
      const dy = mobile ? (index < 2 ? 8 : -8) : sourceY - (box.top + box.height / 2);
      animations.push(corner.animate([
        { transform: `translate(${dx}px, ${dy}px) scale(${mobile ? 0.8 : 0.18})`, opacity: mobile ? 0.5 : 0 },
        { transform: 'translate(0, 0) scale(1)', opacity: 1 },
      ], { duration: mobile ? 550 : 1050, delay: mobile ? index * 25 : 80 + index * 35, easing: 'cubic-bezier(0.22, 1, 0.36, 1)', fill: 'backwards' }));
    });

    if (!mobile) {
      stage.current.querySelectorAll<HTMLElement>('[data-mint-shutter]').forEach(shutter => {
        animations.push(shutter.animate([{ transform: 'scaleY(1)' }, { transform: 'scaleY(0)' }], { duration: 700, delay: 300, easing: 'cubic-bezier(0.22, 1, 0.36, 1)', fill: 'backwards' }));
      });
      const word = document.getElementById('hero-minted-word');
      if (word) animations.push(word.animate([{ transform: 'translateY(6px) rotate(-1deg)' }, { transform: 'none' }], { duration: 450, delay: 850, easing: 'cubic-bezier(0.22, 1, 0.36, 1)', fill: 'backwards' }));
      const secondary = stage.current.querySelector<HTMLElement>('[data-mint-secondary]');
      if (secondary) animations.push(secondary.animate([{ transform: 'translateY(18px) rotate(3deg)' }, { transform: 'none' }], { duration: 600, delay: 650, easing: 'cubic-bezier(0.22, 1, 0.36, 1)', fill: 'backwards' }));
    }
    return () => animations.forEach(animation => animation.cancel());
  }, [reduceMotion]);

  return (
    <div ref={stage} className="relative mx-auto w-full max-w-xl lg:max-w-none lg:aspect-[4/5]">
      <figure className="relative lg:absolute lg:top-6 lg:right-0 w-full">
        <a href="#work" data-mint-frame aria-label="Explore our work, featuring IdeoFest"
          className="relative block group focus-visible:outline-2 focus-visible:outline-offset-8 focus-visible:outline-creative-flame"
          onPointerMove={event => {
            if (reduceMotion !== false || event.pointerType !== 'mouse' || !window.matchMedia('(min-width: 1024px) and (hover: hover) and (pointer: fine)').matches) return;
            const box = event.currentTarget.getBoundingClientRect();
            imageX.set(((event.clientX - box.left) / box.width - 0.5) * 8);
            imageY.set(((event.clientY - box.top) / box.height - 0.5) * 8);
          }}
          onPointerLeave={() => { imageX.set(0); imageY.set(0); }}>
          <div className="relative aspect-[4/3] overflow-hidden bg-white/[0.04]">
            <motion.div className="absolute inset-0" style={{ x: reduceMotion ? 0 : x, y: reduceMotion ? 0 : y, scale: reduceMotion ? 1 : 1.035 }}>
              <Image src="/portfolio/ideofest/IMG_0889.WEBP" alt="IdeoFest organizing crew collaborating in official event gear" fill loading="eager" fetchPriority="high" sizes="(max-width: 1023px) 90vw, 40vw" className="object-cover" />
            </motion.div>
            <span data-mint-shutter aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-[18%] origin-top bg-section-ink/75 [transform:scaleY(0)]" />
            <span data-mint-shutter aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-[18%] origin-bottom bg-section-ink/75 [transform:scaleY(0)]" />
            <span aria-hidden="true" className="absolute bottom-4 right-4 w-10 h-10 rounded-full bg-section-ink/80 border border-white/20 flex items-center justify-center text-white group-hover:bg-creative-flame group-hover:text-section-ink transition-colors"><ArrowUpRight className="w-4 h-4" /></span>
          </div>
          <span data-mint-corner aria-hidden="true" className="pointer-events-none absolute -top-2 -left-2 lg:-top-4 lg:-left-4 w-8 h-8 lg:w-12 lg:h-12 border-t-[6px] lg:border-t-[8px] border-l-[6px] lg:border-l-[8px] border-creative-flame" />
          <span data-mint-corner aria-hidden="true" className="pointer-events-none absolute -top-2 -right-2 lg:-top-4 lg:-right-4 w-8 h-8 lg:w-12 lg:h-12 border-t-[6px] lg:border-t-[8px] border-r-[6px] lg:border-r-[8px] border-white" />
          <span data-mint-corner aria-hidden="true" className="pointer-events-none absolute -bottom-2 -left-2 lg:-bottom-4 lg:-left-4 w-8 h-8 lg:w-12 lg:h-12 border-b-[6px] lg:border-b-[8px] border-l-[6px] lg:border-l-[8px] border-white" />
          <span data-mint-corner aria-hidden="true" className="pointer-events-none absolute -bottom-2 -right-2 lg:-bottom-4 lg:-right-4 w-8 h-8 lg:w-12 lg:h-12 border-b-[6px] lg:border-b-[8px] border-r-[6px] lg:border-r-[8px] border-creative-flame" />
        </a>
        <figcaption className="flex flex-col items-end gap-1 mt-6 text-xs font-bold uppercase tracking-wider text-white/70"><span>IdeoFest</span><span>Our own initiative</span></figcaption>
      </figure>
      <figure data-mint-secondary className="hidden lg:block absolute bottom-0 -left-12 w-[58%] -rotate-[4deg] bg-section-ink p-2 border border-white/10">
        <a href="#work" aria-label="Explore our work, featuring Choice to Lead" className="relative block aspect-[3/2] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-creative-flame">
          <Image src="/portfolio/choice-to-lead/JK_D9461.JPG" alt="Three women entrepreneurs holding the Choice to Lead frame" fill sizes="24vw" className="object-cover" />
        </a>
        <figcaption className="flex justify-between gap-2 py-3 px-1 text-xs font-bold uppercase tracking-wider text-white/70"><span>Choice to Lead</span><span>WUSC / GRIT</span></figcaption>
      </figure>
    </div>
  );
}
