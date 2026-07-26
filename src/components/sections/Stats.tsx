'use client';

import React from 'react';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

function Counter({ from, to, duration = 2 }: { from: number; to: number; duration?: number }) {
  const nodeRef = useRef<HTMLSpanElement>(null);
  const isInView = useInView(nodeRef, { once: true, margin: "-50px" });

  React.useEffect(() => {
    if (!isInView || !nodeRef.current) return;
    
    let startTimestamp: number;
    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / (duration * 1000), 1);
      
      // easeOutExpo
      const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      
      const current = Math.floor(easeProgress * (to - from) + from);
      if (nodeRef.current) {
        nodeRef.current.textContent = current.toString();
      }
      
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    window.requestAnimationFrame(step);
  }, [isInView, from, to, duration]);

  return <span ref={nodeRef}>{from}</span>;
}

export default function Stats() {
  return (
    <section className="py-20 border-y border-white/5 bg-white/[0.02]">
      <div className="container-layout">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4 divide-x-0 md:divide-x divide-white/10 text-center">
          
          <div className="flex flex-col items-center justify-center px-4">
            <h4 className="text-4xl md:text-5xl font-black text-white tracking-tighter mb-2">
              <Counter from={0} to={3} duration={1.5} />
            </h4>
            <p className="text-xs uppercase tracking-widest font-bold text-white/50">Founders</p>
          </div>
          
          <div className="flex flex-col items-center justify-center px-4">
            <h4 className="text-4xl md:text-5xl font-black text-white tracking-tighter mb-2">
              <Counter from={0} to={0} duration={1.5} />
            </h4>
            <p className="text-xs uppercase tracking-widest font-bold text-white/50">Layers of Mgt</p>
          </div>
          
          <div className="flex flex-col items-center justify-center px-4">
            <h4 className="text-4xl md:text-5xl font-black text-white tracking-tighter mb-2">
              <Counter from={0} to={100} duration={2} /><span className="text-creative-flame">%</span>
            </h4>
            <p className="text-xs uppercase tracking-widest font-bold text-white/50">Commitment</p>
          </div>
          
          <div className="flex flex-col items-center justify-center px-4">
            <h4 className="text-4xl md:text-5xl font-black text-white tracking-tighter mb-2">
              <Counter from={0} to={1} duration={1.5} />
            </h4>
            <p className="text-xs uppercase tracking-widest font-bold text-white/50">Mission</p>
          </div>

        </div>
      </div>
    </section>
  );
}
