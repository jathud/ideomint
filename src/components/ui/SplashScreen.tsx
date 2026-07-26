'use client';

import { useState, useEffect } from 'react';

export default function SplashScreen({ children }: { children: React.ReactNode }) {
  const [phase, setPhase] = useState<'loading' | 'exiting' | 'done'>('loading');

  useEffect(() => {
    // Start exit animation after logo + bar have played
    const exitTimer = setTimeout(() => setPhase('exiting'), 1800);
    // Remove splash completely after exit transition
    const removeTimer = setTimeout(() => setPhase('done'), 2500);

    return () => {
      clearTimeout(exitTimer);
      clearTimeout(removeTimer);
    };
  }, []);

  return (
    <>
      {/* Splash Overlay */}
      {phase !== 'done' && (
        <div
          className={`fixed inset-0 z-[9999] flex items-center justify-center bg-section-ink transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
            phase === 'exiting' ? 'opacity-0 scale-[1.02] pointer-events-none' : 'opacity-100 scale-100'
          }`}
          style={{ willChange: 'opacity, transform' }}
        >
          <div className="flex flex-col items-center gap-10">
            {/* Logo Assembly */}
            <div className="flex items-center gap-4 animate-[loadingFadeUp_0.6s_cubic-bezier(0.16,1,0.3,1)_0.1s_both]">
              {/* Geometric Frame Icon */}
              <div className="relative w-12 h-12 flex items-center justify-center">
                <div className="absolute top-0 left-0 w-[20px] h-[20px] border-t-[5px] border-l-[5px] border-creative-flame" />
                <div className="absolute top-0 right-0 w-[20px] h-[20px] border-t-[5px] border-r-[5px] border-white" />
                <div className="absolute bottom-0 left-0 w-[20px] h-[20px] border-b-[5px] border-l-[5px] border-white" />
                <div className="absolute bottom-0 right-0 w-[20px] h-[20px] border-b-[5px] border-r-[5px] border-creative-flame" />
              </div>
              {/* Brand Name */}
              <div className="flex gap-[1px]">
                <span className="text-4xl sm:text-5xl font-black text-white tracking-widest uppercase">Ideo</span>
                <span className="text-4xl sm:text-5xl font-black text-creative-flame tracking-widest uppercase">Mint</span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-48 sm:w-64 h-[3px] bg-white/10 rounded-full overflow-hidden animate-[loadingFadeUp_0.5s_cubic-bezier(0.16,1,0.3,1)_0.4s_both]">
              <div className="h-full bg-creative-flame rounded-full animate-[loadingProgress_1s_cubic-bezier(0.16,1,0.3,1)_0.5s_both]" />
            </div>
          </div>
        </div>
      )}

      {/* Content always rendered, visible immediately once splash is done */}
      <div className={phase === 'done' ? '' : 'opacity-0 pointer-events-none'}>
        {children}
      </div>
    </>
  );
}
