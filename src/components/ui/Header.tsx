'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function Header() {
  const pathname = usePathname();
  const isHome = pathname === '/';
  const [activeSection, setActiveSection] = useState('home');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { label: 'About', id: 'manifesto' },
    { label: 'Services', id: 'services' },
    { label: 'Case Studies', id: 'teardown' },
    { label: 'The Lab', id: 'sandbox' },

    { label: 'Contact', id: 'contact' },

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
        // A section is considered active if it occupies the middle of the viewport
        if (rect.top <= window.innerHeight / 2 && rect.bottom >= window.innerHeight / 3) {
          current = section.id;
        }
      });

      if (current) {
        setActiveSection(current);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    // Call once to set initial state
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Prevent scrolling when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }, [isMobileMenuOpen]);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-section-ink/90 backdrop-blur-xl border-b border-white/5 py-4 transition-all">
        <div className="container-layout flex items-center justify-between">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-3 group relative z-50"
            onClick={(e) => {
              setIsMobileMenuOpen(false);
              if (isHome) {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }
            }}
          >
            <div className="relative w-8 h-8 flex items-center justify-center">
              {/* Geometric Open Frame Icon */}
              <div className="absolute top-0 left-0 w-[14px] h-[14px] border-t-[4px] border-l-[4px] border-creative-flame transition-colors" />
              <div className="absolute top-0 right-0 w-[14px] h-[14px] border-t-[4px] border-r-[4px] border-white transition-colors" />
              <div className="absolute bottom-0 left-0 w-[14px] h-[14px] border-b-[4px] border-l-[4px] border-white transition-colors" />
              <div className="absolute bottom-0 right-0 w-[14px] h-[14px] border-b-[4px] border-r-[4px] border-creative-flame transition-colors" />
            </div>
            <span className="text-[22px] font-black text-white tracking-widest uppercase">
              Ideo<span className="text-creative-flame">Mint</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav aria-label="Main navigation" className="hidden lg:flex items-center gap-6">
            {navItems.map(({ label, id }) => {
              const hash = `#${id}`;
              const href = isHome ? hash : `/${hash}`;
              return (
                <Link
                  key={id}
                  href={href}
                  className={`text-sm font-semibold transition-colors relative pb-1 ${(isHome && activeSection === id) || (!isHome && pathname === href)
                    ? 'text-creative-flame before:absolute before:bottom-0 before:left-0 before:w-full before:h-0.5 before:bg-creative-flame'
                    : 'text-white hover:text-creative-flame'
                    }`}
                >
                  {label}
                </Link>
              );
            })}
          </nav>


          <div className="flex items-center gap-4 relative z-50">
            <Link
              href={isHome ? '#contact' : '/#contact'}
              className="hidden md:flex items-center gap-2 bg-creative-flame hover:bg-[#E54D30] text-white px-6 py-3 rounded-full text-sm font-bold transition-all"
            >
              Let's work together
            </Link>

            {/* Mobile Menu Toggle */}
            <button
              className="lg:hidden flex items-center gap-2 text-white hover:text-creative-flame transition-colors p-2 -mr-2"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-menu"
              aria-label="Toggle navigation"
            >
              <span className="text-sm font-bold tracking-widest uppercase">{isMobileMenuOpen ? 'Close' : 'Menu'}</span>
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <div
        id="mobile-menu"
        className={`fixed inset-0 bg-section-ink z-40 transition-all duration-500 ease-in-out lg:hidden flex flex-col justify-start px-8 overflow-y-auto pt-24 pb-8 ${isMobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          }`}
      >
        <nav aria-label="Mobile navigation" className="flex flex-col gap-6 mt-12 pl-2">
          {navItems.map(({ label, id }) => {
            const hash = `#${id}`;
            const href = isHome ? hash : `/${hash}`;
            return (
              <Link
                key={id}
                href={href}
                onClick={(e) => {
                  setIsMobileMenuOpen(false);
                  if (isHome) {
                    e.preventDefault();
                    setTimeout(() => {
                      const element = document.getElementById(id);
                      if (element) element.scrollIntoView({ behavior: 'smooth' });
                    }, 50);
                  }
                }}
                className={`text-2xl sm:text-3xl font-semibold tracking-wider uppercase transition-colors ${activeSection === id ? 'text-creative-flame' : 'text-white/80 hover:text-white'
                  }`}
              >
                {label}
              </Link>
            );
          })}

          <div className="mt-8 pt-8 border-t border-white/10">
            <Link
              href={isHome ? '#contact' : '/#contact'}
              onClick={(e) => {
                setIsMobileMenuOpen(false);
                if (isHome) {
                  e.preventDefault();
                  setTimeout(() => {
                    const element = document.getElementById('contact');
                    if (element) element.scrollIntoView({ behavior: 'smooth' });
                  }, 50);
                }
              }}
              className="inline-flex items-center justify-center gap-2 bg-creative-flame text-white px-8 py-4 rounded-full text-base font-bold w-full md:w-auto"
            >
              Let's work together
            </Link>
          </div>
        </nav>
      </div>
    </>
  );
}
