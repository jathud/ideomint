'use client';

import { useState } from 'react';
import IdeofestLogo from '@/components/ideofest/IdeofestLogo';
import { ShieldCheck, Lock, Mail, ArrowRight, Loader2 } from 'lucide-react';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/ideofest/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (!data.success) {
        setError(data.error || 'Authentication failed. Please check your credentials.');
        setLoading(false);
        return;
      }

      // Success — navigate to admin dashboard
      window.location.href = '/ideofest/admin';
    } catch {
      setError('Network connection error. Try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-section-ink text-white flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Ambient background glows */}
      <div className="absolute top-1/4 left-1/3 w-[500px] h-[500px] bg-signal-lime/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/3 w-[450px] h-[450px] bg-signal-lime/15 rounded-full blur-[140px] pointer-events-none" />

      {/* Main card */}
      <div className="relative z-10 w-full max-w-md bg-white/5 backdrop-blur-2xl border border-white/12 rounded-3xl p-8 shadow-2xl">
        {/* Brand logo & security header */}
        <div className="flex flex-col items-center text-center mb-8">
          <IdeofestLogo width={180} height={52} className="mb-4" />
          
          <div className="inline-flex items-center gap-2 bg-signal-lime/15 border border-signal-lime/30 px-3.5 py-1.5 rounded-full mt-2">
            <ShieldCheck className="w-4 h-4 text-signal-lime" />
            <span className="text-xs font-bold text-signal-lime tracking-widest uppercase">
              Secure Admin Portal
            </span>
          </div>
          <p className="text-xs text-white/50 mt-3">
            Authorized festival organizers and administrators only.
          </p>
        </div>

        {/* Login form */}
        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          {error && (
            <div className="bg-red-500/15 border border-red-500/30 rounded-xl p-3 text-xs font-medium text-red-300 text-center">
              {error}
            </div>
          )}

          <div>
            <label className="block text-[11px] font-bold text-white/50 uppercase tracking-widest mb-2">
              Admin Email
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your admin email"
                className="w-full bg-white/5 border border-white/12 focus:border-signal-lime rounded-xl pl-11 pr-4 py-3.5 text-sm text-white placeholder-white/30 focus:outline-none transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-white/50 uppercase tracking-widest mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full bg-white/5 border border-white/12 focus:border-signal-lime rounded-xl pl-11 pr-4 py-3.5 text-sm text-white placeholder-white/30 focus:outline-none transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-3 flex items-center justify-center gap-2 bg-signal-lime hover:bg-[#b0d420] disabled:opacity-50 text-section-ink font-black py-4 rounded-xl text-base transition-all shadow-lg shadow-signal-lime/10"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin text-section-ink" />
            ) : (
              <>
                Authenticate & Enter <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>

      {/* Footer return link */}
      <div className="mt-8 text-center">
        <a
          href="/ideofest"
          className="text-xs text-white/40 hover:text-white transition-colors underline underline-offset-4"
        >
          ← Return to Public Ideofest Site
        </a>
      </div>
    </div>
  );
}
