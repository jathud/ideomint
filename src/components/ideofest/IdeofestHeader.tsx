'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Ticket, LayoutDashboard, CalendarDays, Menu, X, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import CountdownTimer from './CountdownTimer';
import IdeofestLogo from './IdeofestLogo';

const NEXT_EVENT_DATE = new Date('2026-10-24T19:00:00+05:30').toISOString();

function getAdminUrl(path = '') {
  if (typeof window === 'undefined') return `/ideofest/admin${path}`;
  const { hostname, protocol, port } = window.location;
  const portSuffix = port ? `:${port}` : '';

  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return `${protocol}//ideofest.localhost${portSuffix}${path}`;
  }

  if (hostname.startsWith('ideofest.')) {
    return path || '/';
  }

  if (hostname.endsWith('ideomint.com')) {
    return `${protocol}//ideofest.ideomint.com${path}`;
  }

  return `/ideofest/admin${path}`;
}

export default function IdeofestHeader() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const navItems = [
    { href: '/ideofest/events', label: 'Events', icon: CalendarDays },
    { href: '/ideofest/my-tickets', label: 'My Tickets', icon: Ticket },
  ];

  const isAdminArea = pathname.startsWith('/ideofest/dashboard') || pathname.startsWith('/ideofest/admin');

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-section-ink/95 backdrop-blur-xl border-b border-white/8">

        {/* ── Countdown strip ── */}
        <div className="bg-signal-lime/10 border-b border-signal-lime/20 py-2 px-6">
          <div className="container-layout flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-signal-lime animate-pulse inline-block" />
              <span className="text-[10px] text-white/50 tracking-widest uppercase font-bold hidden sm:inline">
                Next event in
              </span>
            </div>
            <div className="hidden md:flex items-center gap-2 text-white/50 text-[11px] font-medium">
              Next event in:&nbsp;
              <CountdownTimer targetDate={NEXT_EVENT_DATE} compact />
            </div>
            {/* Admin shortcut in strip */}
            <a
              href={getAdminUrl()}
              className={`flex items-center gap-1.5 text-[10px] font-bold tracking-widest uppercase transition-colors ${
                isAdminArea
                  ? 'text-signal-lime'
                  : 'text-white/40 hover:text-signal-lime'
              }`}
            >
              <ShieldCheck className="w-3 h-3" />
              {isAdminArea ? 'Admin Panel' : 'Organizer Gateway'}
            </a>
          </div>
        </div>

        {/* ── Main nav ── */}
        <div className="container-layout flex items-center justify-between py-3 gap-6">

          {/* Logo */}
          <Link href="/ideofest" className="flex-shrink-0 hover:opacity-85 transition-opacity">
            <IdeofestLogo width={160} height={48} />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1 flex-1 justify-center">
            {navItems.map(({ href, label, icon: Icon }) => {
              const active = pathname === href || pathname.startsWith(href + '/');
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all ${
                    active
                      ? 'bg-white/10 text-white border border-white/15'
                      : 'text-white/60 hover:text-white hover:bg-white/6'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </Link>
              );
            })}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-3 flex-shrink-0">
            {/* My Tickets Button */}
            <Link
              href="/ideofest/my-tickets"
              className="flex items-center gap-1.5 bg-white/10 hover:bg-white/15 border border-white/20 text-white px-4 py-2 rounded-full text-xs font-bold transition-all"
            >
              <Ticket className="w-3.5 h-3.5 text-signal-lime" />
              <span>My Tickets</span>
            </Link>

            {/* Admin Portal button */}
            <a
              href={getAdminUrl()}
              className={`hidden md:flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all ${
                isAdminArea
                  ? 'bg-signal-lime text-section-ink'
                  : 'bg-white/5 border border-white/12 text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-signal-lime" />
              <span>Organizer Portal</span>
            </a>

            {/* Get Tickets CTA */}
            <Link
              href="/ideofest/events"
              className="hidden sm:flex items-center gap-2 bg-[#c1e527] text-section-ink px-5 py-2 rounded-full text-sm font-black tracking-wide hover:bg-[#b0d420] transition-all"
            >
              Get Tickets
            </Link>

            {/* Mobile toggle */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-2 text-white/70 hover:text-white transition-colors"
              aria-label="Toggle menu"
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* ── Mobile menu ── */}
      <div className={`fixed inset-0 z-40 bg-section-ink flex flex-col pt-28 px-6 pb-8 transition-all duration-300 md:hidden ${menuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        {/* Logo in mobile menu */}
        <div className="mb-8">
          <IdeofestLogo width={140} height={42} />
        </div>

        <nav className="flex flex-col gap-2">
          {navItems.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-3 py-4 border-b border-white/10 text-xl font-bold text-white/80 hover:text-white transition-colors"
            >
              <Icon className="w-5 h-5 text-[#c1e527]" />
              {label}
            </Link>
          ))}

          {/* Admin link in mobile */}
          <a
            href={getAdminUrl()}
            onClick={() => setMenuOpen(false)}
            className="flex items-center gap-3 py-4 border-b border-white/10 text-xl font-bold text-[#c1e527]"
          >
            <ShieldCheck className="w-5 h-5 text-[#c1e527]" />
            Organizer Portal
          </a>
        </nav>

        <div className="flex flex-col gap-3 mt-6">
          <Link
            href="/ideofest/events"
            onClick={() => setMenuOpen(false)}
            className="flex items-center justify-center bg-[#c1e527] text-section-ink px-6 py-4 rounded-2xl font-black text-base"
          >
            Get Tickets
          </Link>
          <a
            href={getAdminUrl('/login')}
            onClick={() => setMenuOpen(false)}
            className="flex items-center justify-center bg-white/8 border border-white/15 text-white px-6 py-4 rounded-2xl font-bold text-base gap-2"
          >
            <ShieldCheck className="w-5 h-5 text-signal-lime" /> Admin Security Portal
          </a>
        </div>
      </div>
    </>
  );
}
