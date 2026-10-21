'use client';

import { ReactLenis } from 'lenis/react';
import React from 'react';
import { MotionConfig, useReducedMotion } from 'framer-motion';

export default function SmoothScroll({ children }: { children: React.ReactNode }) {
  const reducedMotion = useReducedMotion();
  return (
    <MotionConfig reducedMotion="user">
    <ReactLenis root options={{ lerp: 0.1, duration: 1.5, smoothWheel: !reducedMotion }}>
      {children}
    </ReactLenis>
    </MotionConfig>
  );
}
