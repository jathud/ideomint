'use client';

import { useEffect, useRef, type ReactNode } from 'react';

export default function AnimatedSection({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const element = ref.current;
    if (!element || !('IntersectionObserver' in window)) return;
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    let animation: Animation | undefined;
    const observer = new IntersectionObserver(entries => {
      if (!entries.some(entry => entry.isIntersecting)) return;
      observer.disconnect();
      if (!preference.matches) animation = element.animate([
        { opacity: 0.65, transform: 'translateY(12px)' },
        { opacity: 1, transform: 'translateY(0)' },
      ], { duration: 450, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' });
    }, { rootMargin: '0px 0px -30px 0px' });
    const stop = () => { if (preference.matches) animation?.cancel(); };
    preference.addEventListener('change', stop);
    observer.observe(element);
    return () => { observer.disconnect(); animation?.cancel(); preference.removeEventListener('change', stop); };
  }, []);
  // Content is visible before hydration and when JavaScript is unavailable.
  return <div ref={ref} className={className}>{children}</div>;
}
