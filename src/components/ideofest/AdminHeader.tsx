'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import IdeofestLogo from './IdeofestLogo';
import {
  ShieldCheck, LogOut, ExternalLink, Lock, Menu, X,
  LayoutDashboard, CalendarDays, PlusCircle, Users, FileCheck, QrCode, BarChart2
} from 'lucide-react';
import { useState } from 'react';

const mobileNavItems = [
  { href: '/ideofest/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/ideofest/admin/events', label: 'My Events', icon: CalendarDays },
  { href: '/ideofest/admin/events/create', label: 'Create Event', icon: PlusCircle },
  { href: '/ideofest/admin/attendees', label: 'User Details & CSV', icon: Users },
  { href: '/ideofest/admin/verifications', label: 'Payment Slips', icon: FileCheck },
  { href: '/ideofest/admin/scanner', label: 'QR Scanner', icon: QrCode },
  { href: '/ideofest/admin/reports', label: 'Analytics', icon: BarChart2 },
];

export default function AdminHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const [loggingOut, setLoggingOut] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await fetch('/api/ideofest/admin/logout', { method: 'POST' });
      window.location.href = '/ideofest/admin/login';
    } catch {
      setLoggingOut(false);
    }
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#070912]/95 backdrop-blur-xl border-b border-white/10 h-20 px-4 sm:px-8 flex items-center justify-between">
        {/* Brand logo & portal title */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-white/70 hover:text-white bg-white/5 border border-white/10 rounded-xl"
            aria-label="Toggle mobile menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5 text-[#c1e527]" /> : <Menu className="w-5 h-5" />}
          </button>

          <Link href="/ideofest/admin" className="hover:opacity-85 transition-opacity">
            <IdeofestLogo width={130} height={38} />
          </Link>
          <div className="h-6 w-px bg-white/15 hidden sm:block" />
          <div className="hidden sm:flex items-center gap-2 bg-[#c1e527]/15 border border-[#c1e527]/30 px-3 py-1 rounded-full">
            <ShieldCheck className="w-3.5 h-3.5 text-[#c1e527]" />
            <span className="text-[10px] font-extrabold text-[#c1e527] tracking-widest uppercase">
              Admin Portal
            </span>
          </div>
        </div>

        {/* Admin actions & user status */}
        <div className="flex items-center gap-3">
          <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-white/70">
            <Lock className="w-3.5 h-3.5 text-[#c1e527]" />
            <span>Session: <strong className="text-white">admin@ideomint.com</strong></span>
          </div>

          <a
            href="https://ideomint.com/ideofest"
            target="_blank"
            rel="noreferrer"
            className="hidden md:flex items-center gap-1.5 text-xs font-semibold text-white/60 hover:text-white px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 transition-all"
          >
            <span>Live Site</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs font-bold text-red-400 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 transition-all disabled:opacity-50"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{loggingOut ? 'Logging out...' : 'Sign Out'}</span>
          </button>
        </div>
      </header>

      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md" onClick={() => setMobileMenuOpen(false)} />
          <aside className="fixed top-20 left-0 bottom-0 w-72 bg-[#080A12] border-r border-white/10 p-4 overflow-y-auto z-50 animate-in slide-in-from-left duration-200">
            <div className="mb-4 pb-3 border-b border-white/10 flex items-center justify-between">
              <span className="text-xs font-black text-[#c1e527] uppercase tracking-widest">Admin Navigation</span>
            </div>

            <nav className="flex flex-col gap-1">
              {mobileNavItems.map(({ href, label, icon: Icon }) => {
                const active = pathname === href || (href !== '/ideofest/admin' && pathname.startsWith(href));
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                      active
                        ? 'bg-[#c1e527]/15 text-[#c1e527] border border-[#c1e527]/30'
                        : 'text-white/70 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${active ? 'text-[#c1e527]' : 'text-white/40'}`} />
                    <span>{label}</span>
                  </Link>
                );
              })}
            </nav>
          </aside>
        </div>
      )}
    </>
  );
}
