'use client';

import { useState, useMemo, useEffect } from 'react';
import { Search, CheckCircle, Clock, Download, Loader2 } from 'lucide-react';
import type { IBooking, IEvent } from '@/lib/ideofest/types';

export default function AdminAttendeesPage() {
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'confirmed' | 'pending_verification'>('all');
  const [selectedEvent, setSelectedEvent] = useState('');
  const [bookings, setBookings] = useState<IBooking[]>([]);
  const [events, setEvents] = useState<IEvent[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch real events and real attendees from Supabase
  useEffect(() => {
    let active = true;
    async function loadData() {
      setLoading(true);
      try {
        const [evtRes, bkgRes] = await Promise.all([
          fetch('/api/ideofest/events?status=all'),
          fetch('/api/ideofest/bookings?limit=200'),
        ]);

        const [evtData, bkgData] = await Promise.all([evtRes.json(), bkgRes.json()]);

        if (active) {
          if (evtData.success && Array.isArray(evtData.data)) setEvents(evtData.data);
          if (bkgData.success && Array.isArray(bkgData.data)) setBookings(bkgData.data);
        }
      } catch (err) {
        console.error('Failed to load attendee data:', err);
      } finally {
        if (active) setLoading(false);
      }
    }
    loadData();
    return () => { active = false; };
  }, []);

  const filtered = useMemo(() => {
    let list = bookings;

    if (selectedEvent) {
      list = list.filter((b) => b.event_id === selectedEvent);
    }

    if (search) {
      const q = search.toLowerCase().trim();
      list = list.filter(
        (b) =>
          b.attendee_name?.toLowerCase().includes(q) ||
          b.attendee_email?.toLowerCase().includes(q) ||
          (b.attendee_phone || '').toLowerCase().includes(q) ||
          (b.attendee_nic || '').toLowerCase().includes(q) ||
          b.booking_ref.toLowerCase().includes(q)
      );
    }

    if (filterStatus === 'confirmed') {
      list = list.filter((b) => b.status === 'confirmed' || b.payment_status === 'paid');
    } else if (filterStatus === 'pending_verification') {
      list = list.filter((b) => b.status === 'pending_verification' || b.payment_status === 'pending_verification');
    }

    return list;
  }, [search, filterStatus, selectedEvent, bookings]);

  const handleExportCsv = () => {
    let url = '/api/ideofest/admin/export-tickets';
    if (selectedEvent) {
      url += `?event_id=${encodeURIComponent(selectedEvent)}`;
    }
    window.open(url, '_blank');
  };

  const TIER_BADGE: Record<string, string> = {
    free: 'bg-signal-lime/15 text-signal-lime border border-signal-lime/30',
    early_bird: 'bg-digital-pulse/15 text-digital-pulse',
    standard: 'bg-white/10 text-white/60',
    vip: 'bg-creative-flame/15 text-creative-flame border border-creative-flame/30',
  };

  const totalTickets = useMemo(() => bookings.reduce((sum, b) => sum + (b.quantity || 1), 0), [bookings]);
  const confirmedBookings = useMemo(() => bookings.filter((b) => b.status === 'confirmed' || b.payment_status === 'paid'), [bookings]);
  const pendingBookings = useMemo(() => bookings.filter((b) => b.status === 'pending_verification' || b.payment_status === 'pending_verification'), [bookings]);

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black">Attendee Management</h1>
          <p className="text-white/40 text-sm mt-1">{totalTickets} total tickets across {bookings.length} bookings in database</p>
        </div>

        <button
          onClick={handleExportCsv}
          className="flex items-center justify-center gap-2 bg-signal-lime hover:bg-[#b8e85a] text-section-ink px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-lg shadow-signal-lime/10"
        >
          <Download className="w-4 h-4" /> Export CSV Report
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
          <p className="text-xs font-bold text-white/40 uppercase tracking-widest">Total Booked Tickets</p>
          <p className="text-3xl font-black text-white mt-1">{totalTickets}</p>
          <p className="text-xs text-white/40 mt-1">{bookings.length} customer bookings</p>
        </div>

        <div className="bg-signal-lime/10 border border-signal-lime/30 rounded-2xl p-5">
          <p className="text-xs font-bold text-signal-lime uppercase tracking-widest">Confirmed & Checked In</p>
          <p className="text-3xl font-black text-signal-lime mt-1">{confirmedBookings.reduce((s, b) => s + (b.quantity || 1), 0)}</p>
          <p className="text-xs text-signal-lime/70 mt-1">{confirmedBookings.length} confirmed bookings</p>
        </div>

        <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-5">
          <p className="text-xs font-bold text-amber-400 uppercase tracking-widest">Pending Payment / Review</p>
          <p className="text-3xl font-black text-amber-400 mt-1">{pendingBookings.reduce((s, b) => s + (b.quantity || 1), 0)}</p>
          <p className="text-xs text-amber-400/70 mt-1">{pendingBookings.length} pending verification</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search attendee name, email, phone, NIC or booking ref..."
            className="w-full bg-white/5 border border-white/12 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-signal-lime transition-colors"
          />
        </div>

        <select
          value={selectedEvent}
          onChange={(e) => setSelectedEvent(e.target.value)}
          className="bg-neutral-900 border border-white/12 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-signal-lime transition-colors"
        >
          <option value="">All Festival Events</option>
          {events.map((e) => (
            <option key={e.id || e.slug} value={e.id}>
              {e.title}
            </option>
          ))}
        </select>

        <div className="flex rounded-xl border border-white/12 overflow-hidden bg-white/5">
          {(['all', 'confirmed', 'pending_verification'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilterStatus(f)}
              className={`px-4 py-2.5 text-xs font-bold capitalize transition-colors ${
                filterStatus === f ? 'bg-signal-lime text-section-ink' : 'text-white/50 hover:text-white hover:bg-white/8'
              }`}
            >
              {f === 'all' ? 'All' : f === 'confirmed' ? 'Confirmed' : 'Pending Review'}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white/5 border border-white/8 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="py-20 text-center text-white/40">
            <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-signal-lime" />
            <p className="text-sm">Loading attendees from Supabase...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-white/30 text-xs uppercase tracking-widest border-b border-white/8 bg-white/3">
                  <th className="px-5 py-4">Attendee</th>
                  <th className="px-5 py-4">Booking Ref</th>
                  <th className="px-5 py-4">Event</th>
                  <th className="px-5 py-4">Ticket Tier</th>
                  <th className="px-5 py-4">Qty</th>
                  <th className="px-5 py-4">Total</th>
                  <th className="px-5 py-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-16 text-center text-white/30">
                      No matching attendees found.
                    </td>
                  </tr>
                ) : (
                  filtered.map((a) => (
                    <tr key={a.id || a.booking_ref} className="border-b border-white/5 hover:bg-white/3 transition-colors">
                      <td className="px-5 py-4">
                        <p className="font-semibold text-white">{a.attendee_name}</p>
                        <p className="text-xs text-white/40 mt-0.5">{a.attendee_email}</p>
                        {a.attendee_phone && <p className="text-[11px] text-white/30 font-mono">{a.attendee_phone}</p>}
                      </td>
                      <td className="px-5 py-4 font-mono text-xs text-signal-lime font-bold">{a.booking_ref}</td>
                      <td className="px-5 py-4 text-white/80 max-w-[180px] truncate">{a.event_title}</td>
                      <td className="px-5 py-4">
                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${TIER_BADGE[a.tier_name] || 'bg-white/10 text-white/60'}`}>
                          {a.tier_label || a.tier_name}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-white font-bold">{a.quantity}</td>
                      <td className="px-5 py-4 text-white font-bold whitespace-nowrap">
                        LKR {a.total_amount?.toLocaleString('en-LK', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full capitalize ${
                            a.status === 'confirmed' || a.payment_status === 'paid'
                              ? 'bg-signal-lime/15 text-signal-lime border border-signal-lime/30'
                              : a.status === 'pending_verification'
                              ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                              : 'bg-white/10 text-white/50'
                          }`}
                        >
                          {a.status === 'confirmed' || a.payment_status === 'paid' ? (
                            <CheckCircle className="w-3 h-3" />
                          ) : (
                            <Clock className="w-3 h-3" />
                          )}
                          {(a.status || a.payment_status).replace('_', ' ')}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
