'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

export default function Header() {
  const pathname = usePathname();
  const isHome = pathname === '/';
  const [activeSection, setActiveSection] = useState('home');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const navItems = [
    { label: 'Home', id: 'home' },
    { label: 'Services', id: 'services' },
    { label: 'Work', id: 'work' },
    { label: 'The Lab', id: 'sandbox' },
    { label: 'About', id: 'about' },
    { label: 'IdeoFest', href: '/ideofest' },
  ];

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY < 200) {
        setActiveSection('home');
        return;
      }

      const sections = document.querySelectorAll('section[id]');
      let current = '';
      sections.forEach((section) => {
        const rect = section.getBoundingClientRect();
        if (rect.top <= window.innerHeight / 2 && rect.bottom >= window.innerHeight / 3) {
          current = section.id;
        }
      });

      if (current) {
        setActiveSection(current);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  useEffect(() => {
    if (!isMobileMenuOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    menuRef.current?.querySelector<HTMLAnchorElement>('a')?.focus();
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsMobileMenuOpen(false);
        menuButtonRef.current?.focus();
      }
      if (event.key === 'Tab') {
        const links = Array.from(menuRef.current?.querySelectorAll<HTMLAnchorElement>('a') ?? []);
        const first = links[0];
        const last = links[links.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          menuButtonRef.current?.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          menuButtonRef.current?.focus();
        } else if (document.activeElement === menuButtonRef.current) {
          event.preventDefault();
          (event.shiftKey ? last : first)?.focus();
        }
      }
    };
    const desktop = window.matchMedia('(min-width: 1280px)');
    const closeOnDesktop = () => { if (desktop.matches) setIsMobileMenuOpen(false); };
    desktop.addEventListener('change', closeOnDesktop);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKeyDown);
      desktop.removeEventListener('change', closeOnDesktop);
    };
  }, [isMobileMenuOpen]);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-section-ink/90 backdrop-blur-xl border-b border-white/5 py-4 transition-all">
        <div className="container-layout flex items-center justify-between">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 min-[360px]:gap-3 group relative z-50"
            onClick={(e) => {
              setIsMobileMenuOpen(false);
              if (isHome) {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }
            }}
          >
            <div className="relative w-8 h-8 flex items-center justify-center">
              <div className="absolute top-0 left-0 w-[14px] h-[14px] border-t-[4px] border-l-[4px] border-creative-flame transition-colors" />
              <div className="absolute top-0 right-0 w-[14px] h-[14px] border-t-[4px] border-r-[4px] border-white transition-colors" />
              <div className="absolute bottom-0 left-0 w-[14px] h-[14px] border-b-[4px] border-l-[4px] border-white transition-colors" />
              <div className="absolute bottom-0 right-0 w-[14px] h-[14px] border-b-[4px] border-r-[4px] border-creative-flame transition-colors" />
            </div>
            <span className="text-base min-[360px]:text-[22px] font-black text-white tracking-widest uppercase">
              Ideo<span className="text-creative-flame">Mint</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav aria-label="Main navigation" className="hidden xl:flex items-center gap-6">
            {navItems.map((item) => {
              if (item.href) {
                const isActive = pathname.startsWith('/ideofest');
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    className={`text-sm font-extrabold transition-all relative pb-1 flex items-center gap-1.5 ${isActive
                      ? 'text-[#c1e527] before:absolute before:bottom-0 before:left-0 before:w-full before:h-0.5 before:bg-[#c1e527]'
                      : 'text-white/90 hover:text-[#c1e527]'
                      }`}
                  >

                    <span>{item.label}</span>

                  </Link>
                );
              }

              const hash = `#${item.id}`;
              const href = isHome ? hash : `/${hash}`;
              return (
                <Link
                  key={item.id}
                  href={href}
                  className={`text-sm font-semibold transition-colors relative pb-1 ${(isHome && activeSection === item.id) || (!isHome && pathname === href)
                    ? 'text-creative-flame before:absolute before:bottom-0 before:left-0 before:w-full before:h-0.5 before:bg-creative-flame'
                    : 'text-white/80 hover:text-white'
                    }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2 sm:gap-3 relative z-50">
            <Link
              href={isHome ? '#contact' : '/#contact'}
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-2 bg-creative-flame hover:bg-[#E54D30] text-section-ink px-3 sm:px-5 py-2.5 min-h-11 rounded-full text-xs font-black transition-all shadow-md whitespace-nowrap"
            >
              Start a Project
            </Link>

            {/* Mobile Menu Toggle */}
            <button
              ref={menuButtonRef}
              className="xl:hidden flex items-center gap-1.5 text-white hover:text-creative-flame transition-colors p-2.5 -mr-1"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-menu"
              aria-label="Toggle navigation"
            >
              <span className="hidden sm:inline text-xs font-bold tracking-widest uppercase">{isMobileMenuOpen ? 'Close' : 'Menu'}</span>
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <div
        id="mobile-menu"
        ref={menuRef}
        inert={!isMobileMenuOpen}
        aria-hidden={!isMobileMenuOpen}
        className={`fixed inset-0 bg-section-ink z-40 transition-all duration-500 ease-in-out xl:hidden flex flex-col justify-start px-8 overflow-y-auto pt-24 pb-8 ${isMobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          }`}
      >
        <nav aria-label="Mobile navigation" className="flex flex-col gap-6 mt-12 pl-2">
          {navItems.map((item) => {
            if (item.href) {
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => { setIsMobileMenuOpen(false); menuButtonRef.current?.focus(); }}
                  className="text-2xl sm:text-3xl font-semibold tracking-wider uppercase transition-colors text-white/80 hover:text-white"
                >
                  <span>{item.label}</span>
                </Link>
              );
            }

            const hash = `#${item.id}`;
            const href = isHome ? hash : `/${hash}`;
            return (
              <Link
                key={item.id}
                href={href}
                onClick={(e) => {
                  setIsMobileMenuOpen(false);
                  menuButtonRef.current?.focus();
                  if (isHome) {
                    e.preventDefault();
                    setTimeout(() => {
                      const element = document.getElementById(item.id!);
                      if (element) {
                        element.tabIndex = -1;
                        element.focus({ preventScroll: true });
                        element.scrollIntoView({ behavior: 'smooth' });
                      }
                    }, 50);
                  }
                }}
                className={`text-2xl sm:text-3xl font-semibold tracking-wider uppercase transition-colors ${activeSection === item.id ? 'text-creative-flame' : 'text-white/80 hover:text-white'
                  }`}
              >
                {item.label}
              </Link>
            );
          })}

          <div className="mt-8 pt-8 border-t border-white/10 flex flex-col gap-4">
            <Link
              href={isHome ? '#contact' : '/#contact'}
              onClick={(e) => {
                setIsMobileMenuOpen(false);
                menuButtonRef.current?.focus();
                if (isHome) {
                  e.preventDefault();
                  setTimeout(() => {
                    const element = document.getElementById('contact');
                    if (element) {
                      element.tabIndex = -1;
                      element.focus({ preventScroll: true });
                      element.scrollIntoView({ behavior: 'smooth' });
                    }
                  }, 50);
                }
              }}
              className="inline-flex items-center justify-center gap-2 bg-creative-flame text-section-ink px-8 py-4 rounded-full text-base font-bold w-full"
            >
              Start a Project
            </Link>
          </div>
        </nav>
      </div>
    </>
  );
}
