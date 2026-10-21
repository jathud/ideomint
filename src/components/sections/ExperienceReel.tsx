'use client';

import React, { useState, useCallback, useRef, useSyncExternalStore } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import AnimatedSection from '@/components/ui/AnimatedSection';

/* ─── Data ─────────────────────────────────────────────────────── */

interface ProjectPhoto {
  src: string;
  alt: string;
  theme: string;
}

interface Project {
  id: string;
  index: string;
  title: string;
  subtitle: string;
  description: string;
  role: string;
  location: string;
  label: string;
  themes: string[];
  photos: ProjectPhoto[];
}

const projects: Project[] = [
  {
    id: 'ideofest',
    index: '01',
    title: 'IdeoFest',
    subtitle: 'Sing-Along Jaffna',
    description:
      'A live music and cultural experience built from the ground up — concept, visual identity, ticketing platform, and event production, all under one roof.',
    role: 'Concept / Branding / Event Production / Platform',
    location: 'Jaffna, Sri Lanka',
    label: 'An IdeoMint Initiative',
    themes: ['The Energy', 'The Experience', 'The Details'],
    photos: [
      { src: '/portfolio/ideofest/IMG_0889.WEBP', alt: 'IdeoFest organizing crew collaborating in official event gear', theme: 'The Energy' },
      { src: '/portfolio/ideofest/IMG_0887.WEBP', alt: 'Full amphitheater crowd gathered at IdeoFest with stage illumination', theme: 'The Energy' },
      { src: '/portfolio/ideofest/IMG_0885.WEBP', alt: 'Audience members cheering and clapping during live performances', theme: 'The Experience' },
      { src: '/portfolio/ideofest/IMG_0888.WEBP', alt: 'Attendees engaged in the live atmosphere and showcase sessions', theme: 'The Experience' },
      { src: '/portfolio/ideofest/IMG_0886.WEBP', alt: 'Host presenting on stage with the IdeoFest backdrop visual', theme: 'The Details' },
      { src: '/portfolio/ideofest/IMG_0884.WEBP', alt: 'Keynote speaker addressing the audience during the event', theme: 'The Details' },
    ],
  },
  {
    id: 'choice-to-lead',
    index: '02',
    title: 'Choice to Lead',
    subtitle: 'WUSC / GRIT',
    description:
      'Visual storytelling, media production, and experiential engagement for youth and women entrepreneurship initiatives across Sri Lanka.',
    role: 'Media Production / Visual Storytelling / Event Coverage',
    location: 'Sri Lanka',
    label: 'In partnership with WUSC & GRIT',
    themes: ['The Voices', 'The Commitments', 'The Interaction'],
    photos: [
      { src: '/portfolio/choice-to-lead/JK_D9587.JPG', alt: 'Production team capturing participant stories with professional camera rig', theme: 'The Voices' },
      { src: '/portfolio/choice-to-lead/JK_D9461.JPG', alt: 'Young women entrepreneurs holding Choice to Lead future founder frame', theme: 'The Voices' },
      { src: '/portfolio/choice-to-lead/JK_D9694.JPG', alt: 'Participant writing personal pledge on the Choice to Lead commitment board', theme: 'The Commitments' },
      { src: '/portfolio/choice-to-lead/JK_D9497.JPG', alt: 'Women founders celebrating entrepreneurship milestones with project frame', theme: 'The Commitments' },
      { src: '/portfolio/choice-to-lead/JK_D9420.JPG', alt: 'Event coordinators networking and discussing youth empowerment at the exhibition', theme: 'The Interaction' },
      { src: '/portfolio/choice-to-lead/JK_D9568.JPG', alt: 'Media crew and field directors coordinating video interviews and coverage', theme: 'The Interaction' },
      { src: '/portfolio/choice-to-lead/JK_D9582.JPG', alt: 'On-ground video production setup and interviews with aspiring founders', theme: 'The Interaction' },
    ],
  },
];

/* ─── Reduced-motion hook (useSyncExternalStore) ───────────────── */

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

function subscribeReducedMotion(callback: () => void) {
  const mq = window.matchMedia(REDUCED_MOTION_QUERY);
  mq.addEventListener('change', callback);
  return () => mq.removeEventListener('change', callback);
}

function getReducedMotionSnapshot() {
  return window.matchMedia(REDUCED_MOTION_QUERY).matches;
}

function getReducedMotionServerSnapshot() {
  return false;
}

function usePrefersReducedMotion() {
  return useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotionSnapshot,
    getReducedMotionServerSnapshot,
  );
}

/* ─── Component ────────────────────────────────────────────────── */

export default function ExperienceReel() {
  const [activeProjectIdx, setActiveProjectIdx] = useState(0);
  const [activeTheme, setActiveTheme] = useState<string | null>(null); // null = all photos
  const [photoIdx, setPhotoIdx] = useState(0);
  const [direction, setDirection] = useState(0); // -1 = prev, 1 = next
  const prefersReducedMotion = usePrefersReducedMotion();

  const project = projects[activeProjectIdx];

  // Filtered photos by active theme
  const visiblePhotos =
    activeTheme === null
      ? project.photos
      : project.photos.filter((p) => p.theme === activeTheme);

  const totalPhotos = visiblePhotos.length;

  // visiblePhotos is derived from activeTheme — photoIdx/direction reset
  // is handled inline in the theme and project switch handlers below.

  /* Navigation */
  const goNext = useCallback(() => {
    if (totalPhotos <= 1) return;
    setDirection(1);
    setPhotoIdx((i) => (i + 1) % totalPhotos);
  }, [totalPhotos]);

  const goPrev = useCallback(() => {
    if (totalPhotos <= 1) return;
    setDirection(-1);
    setPhotoIdx((i) => (i - 1 + totalPhotos) % totalPhotos);
  }, [totalPhotos]);

  /* Keyboard navigation */
  const sectionRef = useRef<HTMLElement>(null);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        goNext();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        goPrev();
      }
    },
    [goNext, goPrev],
  );

  /* Touch / swipe support */
  const touchStart = useRef<{ x: number; y: number } | null>(null);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  }, []);

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (!touchStart.current) return;
      const dx = e.changedTouches[0].clientX - touchStart.current.x;
      const dy = e.changedTouches[0].clientY - touchStart.current.y;
      // Only horizontal swipes (threshold 50px, must be more horizontal than vertical)
      if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) {
        if (dx < 0) goNext();
        else goPrev();
      }
      touchStart.current = null;
    },
    [goNext, goPrev],
  );

  /* Project switching */
  const switchProject = useCallback((idx: number) => {
    setActiveProjectIdx(idx);
    setActiveTheme(null);
    setPhotoIdx(0);
    setDirection(0);
  }, []);

  /* Animation variants */
  const imageVariants = prefersReducedMotion
    ? { enter: {}, center: {}, exit: {} }
    : {
        enter: (d: number) => ({ opacity: 0, x: d > 0 ? 60 : -60 }),
        center: { opacity: 1, x: 0 },
        exit: (d: number) => ({ opacity: 0, x: d > 0 ? -60 : 60 }),
      };

  const fadeVariants = prefersReducedMotion
    ? { initial: {}, animate: {}, exit: {} }
    : {
        initial: { opacity: 0, y: 8 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -8 },
      };

  const currentPhoto = visiblePhotos[photoIdx] ?? visiblePhotos[0];

  return (
    <section
      ref={sectionRef}
      id="work"
      className="section-spacing relative text-white"
      onKeyDown={handleKeyDown}
      tabIndex={-1}
      aria-label="Portfolio — The Experience Reel"
    >
      {/* Background ambience */}
      <div className="absolute top-1/3 left-0 w-[500px] h-[500px] bg-creative-flame/5 rounded-full blur-[120px] -translate-x-1/3 pointer-events-none" />
      <div className="absolute bottom-1/4 right-0 w-[400px] h-[400px] bg-digital-pulse/5 rounded-full blur-[100px] translate-x-1/4 pointer-events-none" />

      <div className="container-layout relative z-10">
        {/* Section header */}
        <AnimatedSection>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12 md:mb-16">
            <div className="max-w-2xl">
              <div className="flex items-center gap-4 mb-6">
                <span className="text-creative-flame font-bold tracking-widest text-xs uppercase">
                  03 / Selected Work
                </span>
                <div className="h-px bg-white/20 w-12" />
              </div>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-black leading-[1.1] tracking-tight">
                Real projects. <span className="text-creative-flame">Real impact.</span>
              </h2>
            </div>
            <p className="text-white/50 max-w-sm md:text-right pb-2 text-sm leading-relaxed">
              From concept to execution — a look inside two signature projects that define how we work.
            </p>
          </div>
        </AnimatedSection>

        {/* Experience Reel frame */}
        <AnimatedSection>
          <div className="relative bg-white/[0.03] backdrop-blur-sm border border-white/10 rounded-2xl lg:rounded-3xl overflow-hidden">
            {/* ── Project selector tabs ── */}
            <div className="flex border-b border-white/10">
              {projects.map((p, idx) => (
                <button
                  key={p.id}
                  onClick={() => switchProject(idx)}
                  className={`flex-1 px-6 py-5 text-left transition-all duration-300 group relative ${
                    activeProjectIdx === idx
                      ? 'bg-white/[0.04]'
                      : 'hover:bg-white/[0.02]'
                  }`}
                  aria-pressed={activeProjectIdx === idx}
                  aria-label={`View project: ${p.title} — ${p.subtitle}`}
                >
                  <div className="flex items-baseline gap-3">
                    <span
                      className={`text-xs font-bold tracking-widest transition-colors ${
                        activeProjectIdx === idx ? 'text-creative-flame' : 'text-white/30'
                      }`}
                    >
                      {p.index}
                    </span>
                    <span
                      className={`text-sm md:text-base font-bold transition-colors ${
                        activeProjectIdx === idx ? 'text-white' : 'text-white/50 group-hover:text-white/70'
                      }`}
                    >
                      {p.title}
                    </span>
                  </div>
                  {/* Active indicator line */}
                  {activeProjectIdx === idx && (
                    <motion.div
                      layoutId="project-indicator"
                      className="absolute bottom-0 left-0 right-0 h-[2px] bg-creative-flame"
                      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                    />
                  )}
                </button>
              ))}
            </div>

            {/* ── Main content area ── */}
            <div className="flex flex-col lg:flex-row">
              {/* Image viewer */}
              <div
                className="relative w-full lg:w-[65%] xl:w-[68%] aspect-[4/3] md:aspect-[16/10] lg:aspect-auto lg:min-h-[500px] xl:min-h-[560px] overflow-hidden bg-section-ink/50"
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
                role="region"
                aria-label={`Photo ${photoIdx + 1} of ${totalPhotos}: ${currentPhoto?.alt ?? ''}`}
                aria-roledescription="carousel"
              >
                <AnimatePresence initial={false} custom={direction} mode="wait">
                  <motion.div
                    key={`${project.id}-${currentPhoto?.src}`}
                    custom={direction}
                    variants={imageVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                    className="absolute inset-0"
                  >
                    {currentPhoto && (
                      <Image
                        src={currentPhoto.src}
                        alt={currentPhoto.alt}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 100vw, 65vw"
                        className="object-cover object-center"
                        priority={photoIdx === 0 && activeProjectIdx === 0}
                      />
                    )}
                    {/* Subtle vignette */}
                    <div className="absolute inset-0 bg-gradient-to-t from-section-ink/60 via-transparent to-section-ink/20 pointer-events-none" />
                  </motion.div>
                </AnimatePresence>

                {/* Navigation arrows */}
                {totalPhotos > 1 && (
                  <>
                    <button
                      onClick={goPrev}
                      className="absolute left-3 md:left-5 top-1/2 -translate-y-1/2 w-10 h-10 md:w-11 md:h-11 rounded-full bg-section-ink/60 backdrop-blur-md border border-white/10 flex items-center justify-center text-white/70 hover:text-white hover:bg-section-ink/80 hover:border-white/20 transition-all z-20 focus:outline-none focus-visible:ring-2 focus-visible:ring-creative-flame focus-visible:ring-offset-2 focus-visible:ring-offset-section-ink"
                      aria-label="Previous photo"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={goNext}
                      className="absolute right-3 md:right-5 top-1/2 -translate-y-1/2 w-10 h-10 md:w-11 md:h-11 rounded-full bg-section-ink/60 backdrop-blur-md border border-white/10 flex items-center justify-center text-white/70 hover:text-white hover:bg-section-ink/80 hover:border-white/20 transition-all z-20 focus:outline-none focus-visible:ring-2 focus-visible:ring-creative-flame focus-visible:ring-offset-2 focus-visible:ring-offset-section-ink"
                      aria-label="Next photo"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </>
                )}

                {/* Photo counter — bottom-right */}
                <div className="absolute bottom-4 right-4 md:bottom-6 md:right-6 bg-section-ink/60 backdrop-blur-md rounded-full px-4 py-1.5 border border-white/10 z-20">
                  <span className="text-xs font-bold tracking-widest text-white/80">
                    {String(photoIdx + 1).padStart(2, '0')}{' '}
                    <span className="text-white/30">/</span>{' '}
                    {String(totalPhotos).padStart(2, '0')}
                  </span>
                </div>
              </div>

              {/* Info panel (right side) */}
              <div className="flex-1 p-6 md:p-8 lg:p-10 flex flex-col justify-between min-h-[280px] lg:min-h-0">
                <div>
                  {/* Theme tabs */}
                  <div className="flex flex-wrap gap-2 mb-8">
                    <button
                      onClick={() => { setActiveTheme(null); setPhotoIdx(0); setDirection(0); }}
                      className={`px-3.5 py-1.5 rounded-full text-[11px] font-bold tracking-wider uppercase transition-all duration-300 border ${
                        activeTheme === null
                          ? 'bg-creative-flame/15 border-creative-flame/40 text-creative-flame'
                          : 'bg-transparent border-white/10 text-white/40 hover:text-white/60 hover:border-white/20'
                      }`}
                      aria-pressed={activeTheme === null}
                    >
                      All
                    </button>
                    {project.themes.map((theme) => (
                      <button
                        key={theme}
                        onClick={() => { setActiveTheme(theme); setPhotoIdx(0); setDirection(0); }}
                        className={`px-3.5 py-1.5 rounded-full text-[11px] font-bold tracking-wider uppercase transition-all duration-300 border ${
                          activeTheme === theme
                            ? 'bg-creative-flame/15 border-creative-flame/40 text-creative-flame'
                            : 'bg-transparent border-white/10 text-white/40 hover:text-white/60 hover:border-white/20'
                        }`}
                        aria-pressed={activeTheme === theme}
                      >
                        {theme}
                      </button>
                    ))}
                  </div>

                  {/* Project info with crossfade */}
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={project.id}
                      variants={fadeVariants}
                      initial="initial"
                      animate="animate"
                      exit="exit"
                      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                    >
                      <h3 className="text-2xl md:text-3xl font-black tracking-tight mb-1">
                        {project.title}
                      </h3>
                      <p className="text-creative-flame font-bold text-sm mb-4">
                        {project.subtitle}
                      </p>
                      <p className="text-white/60 text-sm leading-relaxed mb-6">
                        {project.description}
                      </p>
                    </motion.div>
                  </AnimatePresence>
                </div>

                {/* Info strip — bottom */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={project.id + '-strip'}
                    variants={fadeVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                    className="border-t border-white/10 pt-5 mt-auto"
                  >
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold tracking-widest uppercase text-white/30">
                          Role
                        </span>
                        <span className="text-xs text-white/60 font-medium">
                          {project.role}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold tracking-widest uppercase text-white/30">
                          Location
                        </span>
                        <span className="text-xs text-white/60 font-medium">
                          {project.location}
                        </span>
                      </div>
                      <div className="mt-1">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-creative-flame/10 border border-creative-flame/20 text-[10px] font-bold tracking-wider uppercase text-creative-flame/80">
                          {project.label}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}
