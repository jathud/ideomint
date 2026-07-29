'use client';

import React from 'react';
import { motion } from 'framer-motion';

export default function Manifesto() {
  const lines = [
    "Most agencies sell you decoration.",
    "We sell you clarity.",
    "We don't chase trends.",
    "We build systems that compound.",
    "Zero fluff.",
    "No layers. No politics.",
    "Just work."
  ];

  return (
    <section id="manifesto" className="section-spacing relative">
      <div className="container-layout flex flex-col items-center text-center relative z-10 px-4">
        <div className="flex items-center gap-4 mb-16 md:mb-24">
          <div className="h-px bg-white/20 w-8 md:w-12" />
          <span className="text-creative-flame font-bold tracking-widest text-[10px] md:text-xs uppercase">
            The Ideomint Standard
          </span>
          <div className="h-px bg-white/20 w-8 md:w-12" />
        </div>
        
        <div className="max-w-4xl mx-auto flex flex-col gap-8 md:gap-12">
          {lines.map((line, i) => (
            <motion.h2 
              key={i}
              initial={{ opacity: 0.6, y: 20, filter: 'blur(4px)' }}
              whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              viewport={{ once: false, margin: "-10% 0px -10% 0px" }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight leading-[1.1] text-white"
            >
              {line}
            </motion.h2>
          ))}
        </div>
      </div>
    </section>
  );
}
