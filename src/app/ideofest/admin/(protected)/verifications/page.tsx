'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import type { IBooking } from '@/lib/ideofest/types';
import TicketPrintModal from '@/components/ideofest/TicketPrintModal';
import {
  CheckCircle2, XCircle, Search, ExternalLink, ShieldCheck,
  Loader2, RefreshCw, Eye, Landmark, CreditCard, AlertCircle,
  Clock, Check, X, Printer,
} from 'lucide-react';

type FilterTab = 'pending_verification' | 'all' | 'confirmed' | 'rejected';

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    confirmed: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    pending_verification: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    pending: 'bg-zinc-500/15 text-zinc-400 border-zinc-500/30',
    rejected: 'bg-red-500/15 text-red-400 border-red-500/30',
    cancelled: 'bg-red-500/10 text-red-300 border-red-500/20',
  };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border capitalize ${map[status] ?? 'bg-white/10 text-white/60 border-white/10'}`}>
      {status === 'confirmed' && <Check className="w-3 h-3" />}
      {status === 'pending_verification' && <Clock className="w-3 h-3" />}
      {status === 'rejected' && <X className="w-3 h-3" />}
      {status.replace('_', ' ')}
    </span>
  );
}

function PaymentMethodBadge({ method }: { method: string }) {
  if (method === 'payhere') return (
    <span className="inline-flex items-center gap-1 text-xs text-blue-400 font-bold">
      <CreditCard className="w-3 h-3" /> PayHere
    </span>
  );
  if (method === 'bank_transfer') return (
    <span className="inline-flex items-center gap-1 text-xs text-purple-400 font-bold">
      <Landmark className="w-3 h-3" /> Bank Transfer
    </span>
  );
  return <span className="text-xs text-white/40">{method}</span>;
}

export default function AdminVerificationsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const eventIdParam = searchParams.get('event_id') || '';

  const [bookings, setBookings] = useState<IBooking[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [selectedBooking, setSelectedBooking] = useState<IBooking | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [filterTab, setFilterTab] = useState<FilterTab>('all');
  const [adminNotes, setAdminNotes] = useState('');
  const [slipSignedUrl, setSlipSignedUrl] = useState<string | null>(null);
  const [loadingSlip, setLoadingSlip] = useState(false);

  const [printBooking, setPrintBooking] = useState<IBooking | null>(null);

  // Lock background scroll when modal is open
  useEffect(() => {
    if (selectedBooking || printBooking) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [selectedBooking, printBooking]);

  const fetchBookings = useCallback(async (tab: FilterTab = filterTab) => {
    setLoadingData(true);
    setFetchError(null);
    try {
      const params = new URLSearchParams();
      if (tab !== 'all') params.set('payment_status', tab);
      if (eventIdParam) params.set('event_id', eventIdParam);
      params.set('limit', '100');
      const res = await fetch(`/api/ideofest/bookings?${params.toString()}`);
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Failed to load bookings');
      setBookings(data.data as IBooking[]);
    } catch (err) {
      setFetchError((err as Error).message);
    } finally {
      setLoadingData(false);
    }
  }, [filterTab, eventIdParam]);

  useEffect(() => { fetchBookings(); }, [fetchBookings]);

  const handleTabChange = (tab: FilterTab) => {
    setFilterTab(tab);
    fetchBookings(tab);
  };

  const filtered = useMemo(() => {
    if (!search) return bookings;
    const q = search.toLowerCase();
    return bookings.filter(
      (b) =>
        b.booking_ref?.toLowerCase().includes(q) ||
        b.attendee_name?.toLowerCase().includes(q) ||
        b.attendee_email?.toLowerCase().includes(q) ||
        b.event_title?.toLowerCase().includes(q)
    );
  }, [bookings, search]);

  // Fetch signed or direct URL for payment slip
  async function loadSlipUrl(booking: IBooking) {
    const rawPath = booking.payment_slip_url || booking.payment_slip_path || '';
    if (!rawPath) {
      setSlipSignedUrl(null);
      return;
    }

    if (rawPath.startsWith('http://') || rawPath.startsWith('https://')) {
      setSlipSignedUrl(rawPath);
      return;
    }

    setLoadingSlip(true);
    try {
      const res = await fetch(`/api/ideofest/admin/slip-url?path=${encodeURIComponent(rawPath)}`);
      const json = await res.json();
      const resolvedUrl = json.data?.url || json.url || rawPath;
      setSlipSignedUrl(resolvedUrl);
    } catch {
      setSlipSignedUrl(rawPath);
    } finally {
      setLoadingSlip(false);
    }
  }

  function openBooking(booking: IBooking) {
    setSelectedBooking(booking);
    setAdminNotes('');
    setSlipSignedUrl(null);
    loadSlipUrl(booking);
  }

  async function handleVerification(action: 'approve' | 'reject') {
    if (!selectedBooking?.id) return;
    setProcessingId(selectedBooking.id);
    try {
      const res = await fetch('/api/ideofest/bookings/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          booking_id: selectedBooking.id,
          action,
          admin_notes: adminNotes,
        }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Verification failed');
      setSelectedBooking(null);
      fetchBookings();
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setProcessingId(null);
    }
  }

  const tabs: { key: FilterTab; label: string }[] = [
    { key: 'pending_verification', label: 'Pending' },
    { key: 'confirmed', label: 'Approved' },
    { key: 'rejected', label: 'Rejected' },
    { key: 'all', label: 'All' },
  ];

  const pendingCount = bookings.filter((b) => b.payment_status === 'pending_verification').length;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-black flex items-center gap-3">
            <ShieldCheck className="w-6 h-6 text-signal-lime" />
            Payment Verifications
          </h1>
          <p className="text-white/40 text-sm mt-1">
            Review bank transfer receipts and approve or reject bookings.
          </p>
        </div>
        <button
          onClick={() => fetchBookings()}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/8 hover:bg-white/12 text-white/70 text-sm font-bold transition-colors"
        >
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        {tabs.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => handleTabChange(key)}
            className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-bold transition-colors ${
              filterTab === key
                ? 'bg-signal-lime text-section-ink'
                : 'bg-white/8 text-white/60 hover:bg-white/12'
            }`}
          >
            {label}
            {key === 'pending_verification' && pendingCount > 0 && (
              <span className="ml-2 bg-amber-500 text-black text-xs font-black px-2 py-0.5 rounded-full">
                {pendingCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
        <input
          type="text"
          placeholder="Search by reference, name, email, or event..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-signal-lime transition-colors"
        />
      </div>

      {/* States */}
      {loadingData ? (
        <div className="flex flex-col items-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-signal-lime mb-3" />
          <p className="text-white/40 text-sm">Loading bookings...</p>
        </div>
      ) : fetchError ? (
        <div className="flex flex-col items-center py-20">
          <AlertCircle className="w-8 h-8 text-red-400 mb-3" />
          <p className="text-red-400 font-bold mb-2">Failed to load</p>
          <p className="text-white/40 text-sm mb-4">{fetchError}</p>
          <button onClick={() => fetchBookings()} className="text-signal-lime hover:underline text-sm font-bold">Retry</button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center py-20">
          <Check className="w-8 h-8 text-signal-lime mb-3" />
          <p className="text-white/60 font-bold">No bookings to show</p>
          <p className="text-white/30 text-sm mt-1">All clear in this category.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((booking) => (
            <div
              key={booking.id}
              className="bg-white/4 border border-white/8 rounded-2xl p-4 sm:p-5 hover:bg-white/6 hover:border-white/12 transition-all"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                {/* Left info */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="font-mono text-sm font-bold text-signal-lime">{booking.booking_ref}</span>
                    <StatusBadge status={booking.payment_status || booking.status} />
                    <PaymentMethodBadge method={booking.payment_method} />
                  </div>
                  <p className="font-bold text-white truncate">{booking.attendee_name}</p>
                  <p className="text-xs text-white/40 mt-0.5">{booking.attendee_email}</p>
                  <p className="text-xs text-white/40 mt-1">
                    {booking.event_title} ·{' '}
                    <span className="text-signal-lime font-bold">
                      LKR {booking.total_amount?.toLocaleString('en-LK', { minimumFractionDigits: 2 })}
                    </span>{' '}
                    · {booking.tier_label} × {booking.quantity}
                  </p>
                  <p className="text-[10px] text-white/30 mt-1">
                    {booking.created_at ? new Date(booking.created_at).toLocaleString('en-LK') : ''}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openBooking(booking)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/8 hover:bg-white/14 text-white text-sm font-bold transition-colors"
                  >
                    <Eye className="w-4 h-4" /> Review
                  </button>
                  {(booking.payment_status === 'pending_verification' || booking.status === 'pending_verification') && (
                    <>
                      <button
                        onClick={() => { setSelectedBooking(booking); handleVerification('approve'); }}
                        disabled={processingId === booking.id}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 text-sm font-bold transition-colors border border-emerald-500/30"
                      >
                        {processingId === booking.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                        <span className="hidden sm:inline">Approve</span>
                      </button>
                      <button
                        onClick={() => { setSelectedBooking(booking); handleVerification('reject'); }}
                        disabled={processingId === booking.id}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-500/15 hover:bg-red-500/25 text-red-400 text-sm font-bold transition-colors border border-red-500/30"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Reject</span>
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Detail Modal ── */}
      {selectedBooking && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={(e) => { if (e.target === e.currentTarget) setSelectedBooking(null); }}
        >
          <div className="bg-[#111] border border-white/12 rounded-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-black">Review Booking</h2>
                <button
                  onClick={() => setSelectedBooking(null)}
                  className="text-white/40 hover:text-white transition-colors"
                >✕</button>
              </div>

              {/* Details grid */}
              <div className="bg-white/4 rounded-xl p-4 mb-5 grid grid-cols-2 gap-x-4 gap-y-3">
                {[
                  ['Reference', selectedBooking.booking_ref],
                  ['Status', selectedBooking.payment_status || selectedBooking.status],
                  ['Event', selectedBooking.event_title],
                  ['Date', selectedBooking.event_date ? new Date(selectedBooking.event_date).toLocaleDateString('en-LK') : '—'],
                  ['Attendee', selectedBooking.attendee_name],
                  ['Email', selectedBooking.attendee_email],
                  ['NIC', selectedBooking.attendee_nic || '—'],
                  ['Phone', selectedBooking.attendee_phone || '—'],
                  ['Tier', `${selectedBooking.tier_label} × ${selectedBooking.quantity}`],
                  ['Amount', `LKR ${selectedBooking.total_amount?.toLocaleString('en-LK', { minimumFractionDigits: 2 })}`],
                  ['Payment', selectedBooking.payment_method?.replace('_', ' ')],
                  ['Booked', selectedBooking.created_at ? new Date(selectedBooking.created_at).toLocaleString('en-LK') : '—'],
                ].map(([label, value]) => (
                  <div key={label}>
                    <p className="text-[10px] font-bold text-white/30 uppercase tracking-wider">{label}</p>
                    <p className="text-sm font-semibold text-white mt-0.5 break-all">{value}</p>
                  </div>
                ))}
              </div>

              {/* Payment slip */}
              <div className="mb-5">
                <p className="text-xs font-bold text-white/40 uppercase tracking-widest mb-3">Payment Receipt</p>
                {loadingSlip ? (
                  <div className="flex items-center gap-2 text-sm text-white/40">
                    <Loader2 className="w-4 h-4 animate-spin" /> Loading receipt...
                  </div>
                ) : slipSignedUrl ? (
                  <div className="rounded-xl overflow-hidden border border-white/10 bg-white/4 p-2">
                    {!slipSignedUrl.toLowerCase().endsWith('.pdf') ? (
                      <div className="flex flex-col items-center gap-2">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={slipSignedUrl} alt="Payment slip" className="w-full max-h-72 object-contain rounded-lg border border-white/10" />
                        <a
                          href={slipSignedUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 text-xs text-signal-lime hover:underline font-bold py-1"
                        >
                          <ExternalLink className="w-3.5 h-3.5" /> Open Full Resolution Image
                        </a>
                      </div>
                    ) : (
                      <div className="p-4 flex items-center gap-3">
                        <ExternalLink className="w-5 h-5 text-signal-lime" />
                        <a href={slipSignedUrl} target="_blank" rel="noopener noreferrer"
                          className="text-signal-lime text-sm font-bold hover:underline">
                          Open PDF Receipt
                        </a>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 text-amber-400 text-sm font-bold">
                    No payment slip uploaded yet.
                  </div>
                )}
              </div>

              {/* Admin notes */}
              <div className="mb-6">
                <label className="block text-xs font-bold text-white/40 uppercase tracking-widest mb-2">
                  Admin Notes (optional)
                </label>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Add notes for the customer (will be emailed on rejection)..."
                  rows={3}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-signal-lime transition-colors resize-none"
                />
              </div>

              {/* Action buttons */}
              {(selectedBooking.payment_status === 'pending_verification' || selectedBooking.status === 'pending_verification') && (
                <div className="flex gap-3">
                  <button
                    onClick={() => handleVerification('approve')}
                    disabled={!!processingId}
                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 font-black text-sm border border-emerald-500/30 transition-colors disabled:opacity-50"
                  >
                    {processingId ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                    Approve Booking
                  </button>
                  <button
                    onClick={() => handleVerification('reject')}
                    disabled={!!processingId}
                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-400 font-black text-sm border border-red-500/30 transition-colors disabled:opacity-50"
                  >
                    <XCircle className="w-4 h-4" />
                    Reject
                  </button>
                </div>
              )}

              {/* Print Ticket Pass Button */}
              <button
                type="button"
                onClick={() => setPrintBooking(selectedBooking)}
                className="w-full mt-4 flex items-center justify-center gap-2 bg-signal-lime hover:bg-[#b8e85a] text-section-ink py-3 rounded-xl font-black text-sm transition-all shadow-lg shadow-signal-lime/10"
              >
                <Printer className="w-4 h-4" /> Download / Print Ticket Pass
              </button>

              {selectedBooking.admin_notes && (
                <p className="mt-4 text-xs text-white/40 bg-white/4 rounded-lg p-3">
                  <span className="font-bold">Admin note:</span> {selectedBooking.admin_notes}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Ticket Printable PDF Pass Modal */}
      {printBooking && (
        <TicketPrintModal
          booking={printBooking}
          onClose={() => setPrintBooking(null)}
        />
      )}
    </div>
  );
}
