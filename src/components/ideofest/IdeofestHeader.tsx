'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Ticket, CalendarDays, Menu, X, ArrowLeft, Sparkles } from 'lucide-react';
import { useState, useEffect } from 'react';
import CountdownTimer from './CountdownTimer';
import IdeofestLogo from './IdeofestLogo';
import type { IEvent } from '@/lib/ideofest/types';


export default function IdeofestHeader() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [nextEvent, setNextEvent] = useState<IEvent | null>(null);

  const navItems = [
    { href: '/ideofest/events', label: 'Events', icon: CalendarDays },
    { href: '/ideofest/my-tickets', label: 'My Tickets', icon: Ticket },
  ];

  const isAdminArea = pathname.startsWith('/ideofest/dashboard') || pathname.startsWith('/ideofest/admin');

  useEffect(() => {
    let active = true;
    async function loadNextEvent() {
      try {
        const res = await fetch('/api/ideofest/events');
        const json = await res.json();
        if (active && json.success && Array.isArray(json.data) && json.data.length > 0) {
          const now = new Date();
          const upcoming = (json.data as IEvent[])
            .filter((e) => new Date(e.date) >= new Date(now.getTime() - 86400000))
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
          setNextEvent(upcoming[0] || json.data[0]);
        }
      } catch (err) {
        console.error('Failed to load next event for banner:', err);
      }
    }
    loadNextEvent();
    return () => { active = false; };
  }, []);

  const eventTitle = nextEvent?.title || 'Ideofest Live Experiences';
  const eventDateFormatted = nextEvent?.date
    ? new Date(nextEvent.date).toLocaleDateString('en-LK', { month: 'short', day: 'numeric', year: 'numeric' })
    : '';
  const countdownTarget = nextEvent?.date || '2026-10-24T19:00:00+05:30';

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-section-ink/95 backdrop-blur-xl border-b border-white/8">

        {/* ── Dynamic Top Announcement Banner Strip ── */}
        <div className="bg-gradient-to-r from-[#c1e527]/15 via-white/5 to-[#c1e527]/15 border-b border-[#c1e527]/20 py-1.5 px-4 text-xs font-semibold backdrop-blur-md">
          <div className="container-layout flex items-center justify-between gap-4">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <span className="relative flex h-2 w-2 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#c1e527] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#c1e527]"></span>
              </span>
              <span className="text-[#c1e527] font-black tracking-wider uppercase text-[10px] shrink-0">
                Ideofest Live
              </span>
              <span className="text-white/40 hidden sm:inline">•</span>
              <span className="text-white/70 hidden sm:inline text-[10px] font-medium truncate">
                {eventTitle}{eventDateFormatted ? ` • ${eventDateFormatted}` : ''}
              </span>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <div className="hidden md:flex items-center gap-2 text-white/60 text-[10px] font-bold">
                <span>Starts in:</span>
                <CountdownTimer targetDate={countdownTarget} compact />
              </div>
            </div>
          </div>
        </div>

        {/* ── Main Nav Bar ── */}
        <div className="container-layout flex items-center justify-between py-3 gap-4">

          {/* Left: Solid Orange Ideomint Button (matches Get Tickets CTA style) */}
          <div className="flex items-center flex-shrink-0">
            <a
              href="/"
              className="flex items-center gap-2 bg-[#FF5A3C] hover:bg-[#e04529] text-white px-4 py-2 rounded-full text-sm font-black tracking-wide transition-all shadow-[0_0_20px_rgba(255,90,60,0.35)] hover:scale-[1.03] active:scale-95 group"
              title="Return to Ideomint Main Studio Website"
            >
              <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform shrink-0" />
              <span>Ideomint</span>
            </a>
          </div>

          {/* Center: Desktop nav */}
          <nav className="hidden md:flex items-center gap-1 flex-1 justify-center">
            {navItems.map(({ href, label, icon: Icon }) => {
              const active = pathname === href || pathname.startsWith(href + '/');
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-2 px-5 py-2 rounded-full text-sm font-semibold transition-all ${active
                    ? 'bg-white/10 text-white border border-white/15'
                    : 'text-white/60 hover:text-white hover:bg-white/8'
                    }`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </Link>
              );
            })}
          </nav>

          {/* Right: Action buttons */}
          <div className="flex items-center gap-2 flex-shrink-0">

            {/* Get Tickets CTA */}
            <Link
              href="/ideofest/events"
              className="flex items-center gap-2 bg-[#c1e527] text-section-ink px-4 py-2 rounded-full text-sm font-black tracking-wide hover:bg-[#b0d420] transition-all shadow-[0_0_20px_rgba(193,229,39,0.25)]"
            >
              <Ticket className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Get Tickets</span>
              <span className="sm:hidden">Tickets</span>
            </Link>

            {/* Mobile Hamburger */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-2 text-white/70 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
              aria-label="Toggle navigation menu"
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {menuOpen && (
        <div className="fixed inset-0 z-40 bg-section-ink/98 backdrop-blur-2xl md:hidden pt-28 px-6">
          <nav className="flex flex-col gap-1">
            {navItems.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 py-4 border-b border-white/8 text-lg font-bold text-white hover:text-[#c1e527] transition-colors"
              >
                <Icon className="w-5 h-5 text-[#c1e527]" />
                {label}
              </Link>
            ))}
          </nav>

          <div className="flex flex-col gap-3 mt-8">
            <Link
              href="/ideofest/events"
              onClick={() => setMenuOpen(false)}
              className="w-full text-center bg-[#c1e527] text-section-ink py-4 rounded-xl font-black text-base"
            >
              Get Tickets Now
            </Link>
            <a
              href="/"
              onClick={() => setMenuOpen(false)}
              className="w-full text-center bg-white/8 text-white py-4 rounded-xl font-bold text-base flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4 text-[#FF5A3C]" />
              Back to Ideomint
            </a>
          </div>
        </div>
      )}
    </>
  );
}
