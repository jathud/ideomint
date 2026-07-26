'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import IdeofestLogo from './IdeofestLogo';
import { ShieldCheck, LogOut, ExternalLink, Lock } from 'lucide-react';
import { useState } from 'react';

export default function AdminHeader() {
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await fetch('/api/ideofest/admin/logout', { method: 'POST' });
      window.location.href = '/login';
    } catch {
      setLoggingOut(false);
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#070912]/95 backdrop-blur-xl border-b border-white/10 h-20 px-8 flex items-center justify-between">
      {/* Brand logo & portal title */}
      <div className="flex items-center gap-4">
        <Link href="/" className="hover:opacity-85 transition-opacity">
          <IdeofestLogo width={150} height={44} />
        </Link>
        <div className="h-6 w-px bg-white/15 hidden sm:block" />
        <div className="hidden sm:flex items-center gap-2 bg-signal-lime/15 border border-signal-lime/30 px-3 py-1 rounded-full">
          <ShieldCheck className="w-3.5 h-3.5 text-signal-lime" />
          <span className="text-[10px] font-extrabold text-signal-lime tracking-widest uppercase">
            Admin Portal
          </span>
        </div>
      </div>

      {/* Admin actions & user status */}
      <div className="flex items-center gap-4">
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-white/70">
          <Lock className="w-3.5 h-3.5 text-signal-lime" />
          <span>Session: <strong className="text-white">admin@ideomint.com</strong></span>
        </div>

        {/* Live Uptime Status Badge */}
        <a
          href="/api/ideofest/health"
          target="_blank"
          rel="noreferrer"
          title="Click to view live system health report"
          className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-xs text-emerald-400 font-semibold hover:bg-emerald-500/20 transition-all"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Systems 100% Operational</span>
        </a>

        <a
          href="http://localhost:3000/ideofest"
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1.5 text-xs font-semibold text-white/60 hover:text-white px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
        >
          <span>Live Site</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>

        <button
          onClick={handleLogout}
          disabled={loggingOut}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-red-400 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 transition-all disabled:opacity-50"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>{loggingOut ? 'Logging out...' : 'Sign Out'}</span>
        </button>
      </div>
    </header>
  );
}
