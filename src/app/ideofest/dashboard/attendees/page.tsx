'use client';

import { useState, useMemo } from 'react';
import { MOCK_ATTENDEES, MOCK_EVENTS } from '@/lib/ideofest/mock-data';
import { Search, CheckCircle, Circle, Filter } from 'lucide-react';

export default function AttendeesPage() {
  const [search, setSearch] = useState('');
  const [filterCheckedIn, setFilterCheckedIn] = useState<'all' | 'checked' | 'pending'>('all');
  const [selectedEvent, setSelectedEvent] = useState('');

  const filtered = useMemo(() => {
    let list = MOCK_ATTENDEES;
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((a) => a.name.toLowerCase().includes(q) || a.email.toLowerCase().includes(q) || a.booking_ref.toLowerCase().includes(q));
    }
    if (filterCheckedIn === 'checked') list = list.filter((a) => a.checked_in);
    if (filterCheckedIn === 'pending') list = list.filter((a) => !a.checked_in);
    return list;
  }, [search, filterCheckedIn]);

  const TIER_BADGE: Record<string, string> = {
    free: 'bg-signal-lime/15 text-signal-lime',
    early_bird: 'bg-digital-pulse/15 text-digital-pulse',
    standard: 'bg-white/10 text-white/60',
    vip: 'bg-creative-flame/15 text-creative-flame',
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-black">Attendees</h1>
        <p className="text-white/40 text-sm mt-1">{MOCK_ATTENDEES.length} attendees across all events</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, email, booking ID…"
            className="w-full bg-white/5 border border-white/12 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-creative-flame transition-colors"
          />
        </div>
        <select
          value={selectedEvent}
          onChange={(e) => setSelectedEvent(e.target.value)}
          className="bg-white/5 border border-white/12 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-creative-flame transition-colors"
        >
          <option value="">All Events</option>
          {MOCK_EVENTS.map((e) => <option key={e.id || e.slug} value={e.id}>{e.title}</option>)}
        </select>
        <div className="flex rounded-xl border border-white/12 overflow-hidden">
          {(['all', 'checked', 'pending'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilterCheckedIn(f)}
              className={`px-4 py-2.5 text-xs font-bold capitalize transition-colors ${filterCheckedIn === f ? 'bg-creative-flame text-white' : 'text-white/50 hover:text-white hover:bg-white/8'}`}
            >
              {f === 'all' ? 'All' : f === 'checked' ? 'Checked In' : 'Pending'}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white/5 border border-white/8 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-white/30 text-xs uppercase tracking-widest border-b border-white/8 bg-white/3">
                <th className="px-5 py-4">Attendee</th>
                <th className="px-5 py-4">Booking ID</th>
                <th className="px-5 py-4">Tier</th>
                <th className="px-5 py-4">Qty</th>
                <th className="px-5 py-4">Payment</th>
                <th className="px-5 py-4">Check-in</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((a) => (
                <tr key={a.booking_ref} className="border-b border-white/5 hover:bg-white/3 transition-colors">
                  <td className="px-5 py-4">
                    <p className="font-semibold text-white">{a.name}</p>
                    <p className="text-xs text-white/40">{a.email}</p>
                  </td>
                  <td className="px-5 py-4 font-mono text-xs text-white/50">{a.booking_ref}</td>
                  <td className="px-5 py-4">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${TIER_BADGE[a.tier_name] || 'bg-white/10 text-white/50'}`}>
                      {a.tier_label}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-white/70">{a.quantity}</td>
                  <td className="px-5 py-4">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${a.payment_status === 'paid' ? 'bg-signal-lime/15 text-signal-lime' : 'bg-white/10 text-white/50'}`}>
                      {a.payment_status}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    {a.checked_in ? (
                      <div className="flex items-center gap-1.5 text-signal-lime">
                        <CheckCircle className="w-4 h-4" />
                        <span className="text-xs font-semibold">Checked In</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 text-white/30">
                        <Circle className="w-4 h-4" />
                        <span className="text-xs">Pending</span>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="py-16 text-center text-white/30">No attendees found.</div>
        )}
      </div>
    </div>
  );
}
