'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { motion, useMotionValue, useSpring } from 'framer-motion';

export default function CustomCursor() {
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(false);
  const [isHovering, setIsHovering] = useState(false);

  const isIdeofest = pathname?.startsWith('/ideofest');

  // Use motion values for raw mouse position
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);

  // Apply a spring physics configuration for the smooth trailing effect
  const springConfig = { damping: 25, stiffness: 300, mass: 0.5 };
  const smoothX = useSpring(cursorX, springConfig);
  const smoothY = useSpring(cursorY, springConfig);

  useEffect(() => {
    // Only show on devices with a mouse (hover supported)
    const mediaQuery = window.matchMedia('(hover: hover) and (pointer: fine)');
    if (!mediaQuery.matches) return;

    setIsVisible(true);

    const handleMouseMove = (e: MouseEvent) => {
      cursorX.set(e.clientX - 16); // Center the 32px cursor
      cursorY.set(e.clientY - 16);
    };

    const handleMouseOver = (e: MouseEvent) => {
      // Check if hovering over interactive elements
      const target = e.target as HTMLElement;
      if (
        target.tagName.toLowerCase() === 'a' ||
        target.tagName.toLowerCase() === 'button' ||
        target.closest('a') ||
        target.closest('button') ||
        target.hasAttribute('data-cursor-hover')
      ) {
        setIsHovering(true);
      } else {
        setIsHovering(false);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseover', handleMouseOver);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseover', handleMouseOver);
    };
  }, [cursorX, cursorY]);

  if (!isVisible) return null;

  // Accent color depends on domain / page section
  const accentBorderClass = isIdeofest
    ? 'border-[#c1e527] shadow-[0_0_10px_rgba(193,229,39,0.5)]'
    : 'border-creative-flame shadow-[0_0_10px_rgba(255,90,60,0.5)]';

  return (
    <motion.div
      className="fixed top-0 left-0 z-[10000] pointer-events-none hidden md:flex items-center justify-center"
      style={{
        x: smoothX,
        y: smoothY,
        width: 32,
        height: 32,
      }}
    >
      <motion.div
        className="relative w-full h-full"
        animate={{
          scale: isHovering ? 1.5 : 1,
          rotate: isHovering ? 90 : 0,
        }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Top Left — Accent Color (Lime for Ideofest, Flame for Ideomint) */}
        <div className={`absolute top-0 left-0 w-[10px] h-[10px] border-t-[4px] border-l-[4px] ${accentBorderClass} transition-all duration-300`} />
        {/* Top Right — White */}
        <div className="absolute top-0 right-0 w-[10px] h-[10px] border-t-[4px] border-r-[4px] border-white transition-all duration-300" />
        {/* Bottom Left — White */}
        <div className="absolute bottom-0 left-0 w-[10px] h-[10px] border-b-[4px] border-l-[4px] border-white transition-all duration-300" />
        {/* Bottom Right — Accent Color */}
        <div className={`absolute bottom-0 right-0 w-[10px] h-[10px] border-b-[4px] border-r-[4px] ${accentBorderClass} transition-all duration-300`} />
      </motion.div>
    </motion.div>
  );
}
