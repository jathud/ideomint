'use client';
import { useActionState } from 'react';
import { loginPortfolio } from '@/app/admin/actions';

export default function PortfolioLogin() {
  const [state, action, pending] = useActionState(loginPortfolio, { error: '' });
  return <form action={action} className="flex flex-col gap-5">
    <label className="text-sm font-bold">Email<input name="email" type="email" autoComplete="username" required maxLength={254} className="block w-full mt-2 rounded-xl border border-white/20 bg-white/5 p-4 text-white focus:outline-creative-flame" /></label>
    <label className="text-sm font-bold">Password<input name="password" type="password" autoComplete="current-password" required maxLength={256} className="block w-full mt-2 rounded-xl border border-white/20 bg-white/5 p-4 text-white focus:outline-creative-flame" /></label>
    {state.error && <p role="alert" className="text-sm text-creative-flame">{state.error}</p>}
    <button disabled={pending} className="rounded-full bg-creative-flame text-section-ink font-bold py-4 disabled:opacity-50">{pending ? 'Signing in…' : 'Sign in'}</button>
  </form>;
}
