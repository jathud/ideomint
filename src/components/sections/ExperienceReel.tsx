'use client';

import React, { useState, useCallback, useRef, useSyncExternalStore } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import AnimatedSection from '@/components/ui/AnimatedSection';
import ServiceFilters from '@/components/work/ServiceFilters';
import type { PortfolioService } from '@/lib/portfolio/categories';
import { legacyProjects, type Project } from '@/lib/portfolio/legacy-projects';

/* â”€â”€â”€ Data â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

// Project content is separate from the gallery presentation.
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

/* â”€â”€â”€ Component â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

export default function ExperienceReel({ projects = legacyProjects }: { projects?: Project[] }) {
  if (!projects.length) return <section id="work" className="section-spacing text-white"><div className="container-layout"><h2 className="text-4xl font-black tracking-tight">Selected Work</h2><p className="text-white/60 mt-5">Our portfolio is being updated. Please check back shortly.</p></div></section>;
  return <ExperienceReelContent key={projects.map(project => `${project.id}:${project.revision ?? ''}`).join(',')} projects={projects} />;
}

function ExperienceReelContent({ projects }: { projects: Project[] }) {
  const [selectedService, setSelectedService] = useState<PortfolioService | null>(null);
  const [activeProjectIdx, setActiveProjectIdx] = useState(0);
  const [activeTheme, setActiveTheme] = useState<string | null>(null); // null = all photos
  const [photoIdx, setPhotoIdx] = useState(0);
  const [direction, setDirection] = useState(0); // -1 = prev, 1 = next
  const prefersReducedMotion = usePrefersReducedMotion();

  const project = projects[activeProjectIdx];
  const visibleProjectIndices = projects.map((item, index) => ({ item, index })).filter(({ item }) => selectedService === null || item.services.includes(selectedService)).map(({ index }) => index);

  // Filtered photos by active theme
  const visiblePhotos =
    activeTheme === null
      ? project.photos
      : project.photos.filter((p) => p.theme === activeTheme);

  const totalPhotos = visiblePhotos.length;

  // visiblePhotos is derived from activeTheme â€” photoIdx/direction reset
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
      if (!visibleProjectIndices.length || (e.target as HTMLElement).closest('[data-service-controls]')) return;
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        goNext();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        goPrev();
      }
    },
    [goNext, goPrev, visibleProjectIndices.length],
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
      aria-label="Portfolio â€” The Experience Reel"
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
                Selected projects. <span className="text-creative-flame">Thoughtfully delivered.</span>
              </h2>
            </div>
            <p className="text-white/70 max-w-sm md:text-right pb-2 text-sm leading-relaxed">
              A closer look at our work, our role, and the creative thinking behind each project.
            </p>
          </div>
        </AnimatedSection>

        {/* Experience Reel frame */}
        <ServiceFilters selected={selectedService} onSelect={service => {
          setSelectedService(service);
          const nextIndex = projects.findIndex(item => service === null || item.services.includes(service));
          if (nextIndex !== -1) switchProject(nextIndex);
        }} />
        <p role="status" className="sr-only">{visibleProjectIndices.length} projects in {selectedService ?? 'All Work'}</p>
        <div id="work-gallery">
        {!visibleProjectIndices.length && <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 md:p-12">
          <p className="text-xs uppercase tracking-widest text-creative-flame font-bold mb-4">{selectedService}</p>
          <h3 className="text-3xl md:text-4xl font-black tracking-tight mb-4">Work coming soon.</h3>
          <p className="text-sm text-white/60 max-w-md leading-relaxed">We will share verified projects here when they are ready. In the meantime, explore our existing work.</p>
          <button type="button" onClick={() => { setSelectedService(null); switchProject(0); sectionRef.current?.querySelector<HTMLButtonElement>('[data-service-controls] button')?.focus(); }} className="min-h-11 mt-6 text-sm font-bold text-creative-flame hover:text-white transition-colors">View All Work</button>
        </div>}
        <div hidden={!visibleProjectIndices.length}>
        <AnimatedSection>
          <div className="relative bg-white/[0.03] backdrop-blur-sm border border-white/10 rounded-2xl lg:rounded-3xl overflow-hidden">
            {/* â”€â”€ Project selector tabs â”€â”€ */}
            <div className="flex overflow-x-auto border-b border-white/10" aria-label="Choose a project">
              {visibleProjectIndices.map(idx => {
                const p = projects[idx];
                return (
                <button
                  key={p.id}
                  onClick={() => switchProject(idx)}
                  className={`flex-1 shrink-0 min-w-[160px] px-6 py-5 text-left transition-all duration-300 group relative ${
                    activeProjectIdx === idx
                      ? 'bg-white/[0.04]'
                      : 'hover:bg-white/[0.02]'
                  }`}
                  aria-pressed={activeProjectIdx === idx}
                  aria-label={`View project: ${p.title} â€” ${p.subtitle}`}
                >
                  <div className="flex items-baseline gap-3">
                    <span
                      className={`text-xs font-bold tracking-widest transition-colors ${
                        activeProjectIdx === idx ? 'text-creative-flame' : 'text-white/65'
                      }`}
                    >
                      {p.index}
                    </span>
                    <span
                      className={`text-sm md:text-base font-bold transition-colors ${
                        activeProjectIdx === idx ? 'text-white' : 'text-white/70 group-hover:text-white/70'
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
                );
              })}
            </div>

            {/* â”€â”€ Main content area â”€â”€ */}
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
                        unoptimized={currentPhoto.src.startsWith('/api/portfolio/media/')}
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

                {/* Photo counter â€” bottom-right */}
                <div className="absolute bottom-4 right-4 md:bottom-6 md:right-6 bg-section-ink/60 backdrop-blur-md rounded-full px-4 py-1.5 border border-white/10 z-20">
                  <span className="text-xs font-bold tracking-widest text-white/80">
                    {String(photoIdx + 1).padStart(2, '0')}{' '}
                    <span className="text-white/65">/</span>{' '}
                    {String(totalPhotos).padStart(2, '0')}
                  </span>
                </div>
              </div>

              {/* Info panel (right side) */}
              <div className="flex-1 p-6 md:p-8 lg:p-10 flex flex-col justify-between min-h-[280px] lg:min-h-0">
                <div>
                  {/* Theme tabs */}
                  <div className="flex flex-wrap gap-2 mb-5 md:mb-8">
                    <button
                      onClick={() => { setActiveTheme(null); setPhotoIdx(0); setDirection(0); }}
                      className={`min-h-11 px-3.5 py-2 rounded-full text-xs font-bold tracking-wider uppercase transition-all duration-300 border ${
                        activeTheme === null
                          ? 'bg-creative-flame/15 border-creative-flame/40 text-creative-flame'
                          : 'bg-transparent border-white/10 text-white/60 hover:text-white/60 hover:border-white/20'
                      }`}
                      aria-pressed={activeTheme === null}
                    >
                      All
                    </button>
                    {project.themes.map((theme) => (
                      <button
                        key={theme}
                        onClick={() => { setActiveTheme(theme); setPhotoIdx(0); setDirection(0); }}
                        className={`min-h-11 px-3.5 py-2 rounded-full text-xs font-bold tracking-wider uppercase transition-all duration-300 border ${
                          activeTheme === theme
                            ? 'bg-creative-flame/15 border-creative-flame/40 text-creative-flame'
                            : 'bg-transparent border-white/10 text-white/60 hover:text-white/60 hover:border-white/20'
                        }`}
                        aria-pressed={activeTheme === theme}
                      >
                        {theme}
                      </button>
                    ))}
                  </div>

                  {/* Project info with crossfade */}
                  <AnimatePresence initial={false} mode="wait">
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
                      <p className="text-xs font-bold uppercase tracking-wider text-white/65 mt-5 mb-2">Project overview</p>
                      <p className="text-white/75 text-sm leading-relaxed mb-6">
                        {project.description}
                      </p>
                    </motion.div>
                  </AnimatePresence>
                </div>

                {/* Info strip â€” bottom */}
                <AnimatePresence initial={false} mode="wait">
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
                      <div className="flex flex-col items-start gap-1">
                        <span className="text-xs font-bold tracking-widest uppercase text-white/65">
                          Our role
                        </span>
                        <span className="text-xs text-white/60 font-medium">
                          {project.role}
                        </span>
                      </div>
                      <div className="flex flex-col items-start gap-1">
                        <span className="text-xs font-bold tracking-widest uppercase text-white/65">
                          Location
                        </span>
                        <span className="text-xs text-white/60 font-medium">
                          {project.location}
                        </span>
                      </div>
                      <div className="mt-1">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-creative-flame/10 border border-creative-flame/20 text-xs font-bold tracking-wider uppercase text-creative-flame">
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
        </div>
        <noscript>
          <div className="mt-8 space-y-6">
            <p className="text-white/75">Project galleries use JavaScript. You can read every project overview below.</p>
            {projects.map(item => <article key={item.id} className="border-t border-white/15 pt-5">
              <h3 className="text-xl font-bold">{item.title}</h3>
              <p className="text-creative-flame mt-1">{item.subtitle}</p>
              <p className="text-white/75 mt-3">{item.description}</p>
              <p className="text-sm text-white/70 mt-3">Our role: {item.role}. Location: {item.location}. {item.label}.</p>
            </article>)}
          </div>
        </noscript>
      </div>
    </section>
  );
}
