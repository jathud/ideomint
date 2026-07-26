'use client';

import React, { useState } from 'react';
import AnimatedSection from '@/components/ui/AnimatedSection';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Terminal, Diamond } from 'lucide-react';

type Theme = 'minimalist' | 'cyberpunk' | 'luxury';

export default function Sandbox() {
  const [activeTheme, setActiveTheme] = useState<Theme>('minimalist');

  const themes = [
    { id: 'minimalist', label: 'Modern Minimal', icon: Sparkles },
    { id: 'cyberpunk', label: 'Neon Cyberpunk', icon: Terminal },
    { id: 'luxury', label: 'Classic Luxury', icon: Diamond },
  ] as const;

  // Define the dynamic classes for each theme
  const themeStyles = {
    minimalist: {
      container: 'bg-white text-zinc-900 rounded-3xl border border-zinc-200 shadow-xl font-sans',
      header: 'border-b border-zinc-100',
      badge: 'bg-zinc-100 text-zinc-600 rounded-full',
      title: 'font-bold tracking-tight',
      card: 'bg-zinc-50 rounded-2xl p-6 border border-zinc-100',
      button: 'bg-zinc-900 text-white rounded-full hover:bg-zinc-800 transition-colors',
    },
    cyberpunk: {
      container: 'bg-zinc-950 text-[#39ff14] rounded-none border-2 border-[#39ff14] shadow-[0_0_30px_rgba(57,255,20,0.2)] font-mono',
      header: 'border-b-2 border-[#39ff14]/30',
      badge: 'bg-[#39ff14]/10 text-[#39ff14] border border-[#39ff14] rounded-none',
      title: 'font-bold tracking-widest uppercase',
      card: 'bg-zinc-900 rounded-none p-6 border border-[#39ff14]/50 relative overflow-hidden before:absolute before:inset-0 before:bg-[linear-gradient(transparent_50%,rgba(57,255,20,0.05)_50%)] before:bg-[length:100%_4px]',
      button: 'bg-transparent text-[#39ff14] rounded-none border-2 border-[#39ff14] hover:bg-[#39ff14] hover:text-zinc-950 transition-colors uppercase tracking-widest',
    },
    luxury: {
      container: 'bg-[#fdfbf7] text-[#4a3f35] rounded-sm border border-[#d4c3a3] shadow-2xl font-serif',
      header: 'border-b border-[#d4c3a3]/50',
      badge: 'bg-transparent text-[#9e8c6c] border border-[#d4c3a3] rounded-sm italic',
      title: 'font-normal tracking-wide',
      card: 'bg-transparent rounded-sm p-6 border border-[#d4c3a3] shadow-inner',
      button: 'bg-[#4a3f35] text-[#fdfbf7] rounded-sm hover:bg-[#2d2620] transition-colors tracking-widest uppercase text-sm',
    }
  };

  const currentStyle = themeStyles[activeTheme];

  return (
    <section id="sandbox" className="section-spacing relative overflow-hidden">
      {/* Background Ambient Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-creative-flame/5 rounded-full blur-[100px] pointer-events-none" />
      
      <div className="container-layout relative z-10">
        <AnimatedSection>
          <div className="max-w-3xl mb-16">
            <div className="flex items-center gap-4 mb-6">
              <span className="text-creative-flame font-bold tracking-widest text-xs uppercase">06 / The Lab</span>
              <div className="h-px bg-white/20 w-12" />
            </div>
            
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black leading-[1.1] tracking-tight text-white mb-6">
              Don't tell them. <span className="text-creative-flame">Show them.</span>
            </h2>
            <p className="text-lg text-white/60 leading-relaxed mb-6">
              We build adaptive brand systems. The aesthetics of a product completely change how a user feels about it.
            </p>
            
            <div className="flex items-center gap-3 text-creative-flame font-bold text-sm tracking-widest uppercase">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-creative-flame opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-creative-flame"></span>
              </span>
              <span>Tap the buttons below to change the vibe</span>
            </div>
          </div>
        </AnimatedSection>

        <AnimatedSection className="delay-100">
          {/* Theme Toggles */}
          <div className="flex flex-wrap items-center gap-3 mb-8">
            {themes.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTheme(id as Theme)}
                className={`flex items-center gap-2 px-6 py-3 rounded-full text-sm font-bold transition-all duration-300 ${
                  activeTheme === id 
                    ? 'bg-creative-flame text-white shadow-[0_0_20px_rgba(255,90,60,0.3)]' 
                    : 'bg-white/5 text-white/50 hover:bg-white/10 hover:text-white border border-white/10'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>

          {/* Interactive Playground Window */}
          <div className="relative w-full min-h-[550px] md:min-h-0 md:aspect-video rounded-[2rem] bg-white/5 border border-white/10 backdrop-blur-md py-16 px-4 md:p-8 flex items-center justify-center overflow-hidden">
            {/* Window Controls */}
            <div className="absolute top-4 left-4 flex gap-2">
              <div className="w-3 h-3 rounded-full bg-white/20" />
              <div className="w-3 h-3 rounded-full bg-white/20" />
              <div className="w-3 h-3 rounded-full bg-white/20" />
            </div>

            {/* Dynamic Content Frame */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTheme}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className={`w-full max-w-2xl mx-auto transition-all duration-500 ${currentStyle.container}`}
              >
                {/* Header */}
                <div className={`p-6 md:p-8 flex items-center justify-between ${currentStyle.header}`}>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-current opacity-10 flex items-center justify-center">
                      <span className="opacity-100 font-bold text-xl">I</span>
                    </div>
                    <div>
                      <h3 className={`text-xl md:text-2xl ${currentStyle.title}`}>Ideomint Engine</h3>
                      <p className="opacity-60 text-sm mt-1">Campaign optimized for maximum disruption.</p>
                    </div>
                  </div>
                  <span className={`px-4 py-1.5 text-xs ${currentStyle.badge}`}>Live</span>
                </div>

                {/* Body */}
                <div className="p-6 md:p-8 grid sm:grid-cols-2 gap-6">
                  {/* Card 1 */}
                  <div className={`flex flex-col ${currentStyle.card}`}>
                    <span className="opacity-60 text-sm mb-2 uppercase tracking-wider">Brand Resonance</span>
                    <span className={`text-4xl mb-6 ${currentStyle.title}`}>99.8%</span>
                    <button className={`w-full py-3 font-bold mt-auto ${currentStyle.button}`}>
                      Deploy Strategy
                    </button>
                  </div>

                  {/* Card 2 */}
                  <div className={`flex flex-col ${currentStyle.card}`}>
                    <span className="opacity-60 text-sm mb-2 uppercase tracking-wider">Market Attention</span>
                    <span className={`text-4xl mb-6 ${currentStyle.title}`}>Captured</span>
                    <div className="flex items-center gap-2 mt-auto">
                      <div className="h-2 w-full bg-current opacity-10 rounded-full overflow-hidden">
                        <div className="h-full w-[70%] bg-current opacity-50" />
                      </div>
                      <span className="text-xs font-bold opacity-60">+14%</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}
