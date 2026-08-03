'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import type { IBooking } from '@/lib/ideofest/types';
import TicketPrintModal from '@/components/ideofest/TicketPrintModal';
import {
  CheckCircle2, XCircle, Search, ExternalLink, ShieldCheck,
  Loader2, RefreshCw, Eye, Landmark, CreditCard, AlertCircle,
  Clock, Check, X, Printer, FileText, Trash2, AlertTriangle,
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
  const [deleteConfirmTarget, setDeleteConfirmTarget] = useState<IBooking | null>(null);
  const [deleting, setDeleting] = useState(false);

  const handleDeleteBooking = async () => {
    if (!deleteConfirmTarget?.id && !deleteConfirmTarget?.booking_ref) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/ideofest/attendees?booking_id=${encodeURIComponent(deleteConfirmTarget.id || '')}&booking_ref=${encodeURIComponent(deleteConfirmTarget.booking_ref)}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        setBookings((prev) => prev.filter((b) => b.id !== deleteConfirmTarget.id && b.booking_ref !== deleteConfirmTarget.booking_ref));
        if (selectedBooking?.id === deleteConfirmTarget.id) setSelectedBooking(null);
      } else {
        alert(`Failed to delete booking: ${data.error || 'Unknown error'}`);
      }
    } catch {
      alert('Network error deleting booking');
    } finally {
      setDeleting(false);
      setDeleteConfirmTarget(null);
    }
  };

  // Lock ALL scrollable ancestors when modal is open
  useEffect(() => {
    const isOpen = !!(selectedBooking || printBooking);
    document.body.style.overflow = isOpen ? 'hidden' : '';
    const scrollables = document.querySelectorAll<HTMLElement>('main, nav, aside');
    scrollables.forEach((el) => { el.style.overflow = isOpen ? 'hidden' : ''; });
    return () => {
      document.body.style.overflow = '';
      scrollables.forEach((el) => { el.style.overflow = ''; });
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
                  <button
                    onClick={() => setDeleteConfirmTarget(booking)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white text-sm font-bold transition-all border border-red-500/20"
                    title="Delete Booking & Passes"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span className="hidden md:inline">Delete</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Detail Modal ── */}
      {selectedBooking && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[9999] overflow-y-auto p-4 sm:p-6"
          onClick={(e) => { if (e.target === e.currentTarget) setSelectedBooking(null); }}
          onWheel={(e) => e.stopPropagation()}
          onTouchMove={(e) => e.stopPropagation()}
        >
          <div className="min-h-full flex items-center justify-center py-6">
          <div className="bg-[#111] border border-white/12 rounded-2xl max-w-xl w-full" onClick={(e) => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-black">Review Booking</h2>
                <button
                  onClick={() => setSelectedBooking(null)}
                  className="text-white/40 hover:text-white transition-colors"
                >✕</button>
              </div>

              {/* Details grid */}
              <div className="bg-white/4 rounded-xl p-4 mb-5 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3">
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

              {/* Special Notes & Celebration Requests */}
              {selectedBooking.special_notes && (
                <div className="bg-white/4 border border-white/10 rounded-xl p-4 mb-5">
                  <p className="text-[10px] font-black text-[#c1e527] uppercase tracking-wider mb-2">
                    📋 Special Notes & Celebration Requests
                  </p>
                  <pre className="text-xs text-white/90 whitespace-pre-wrap font-sans leading-relaxed">
                    {selectedBooking.special_notes}
                  </pre>
                </div>
              )}

              {/* Payment slip */}
              <div className="mb-5">
                <p className="text-xs font-bold text-white/40 uppercase tracking-widest mb-3">Payment Receipt</p>
                {loadingSlip ? (
                  <div className="flex items-center gap-2 text-sm text-white/40">
                    <Loader2 className="w-4 h-4 animate-spin" /> Loading receipt...
                  </div>
                ) : slipSignedUrl ? (
                  <div className="rounded-xl overflow-hidden border border-white/10 bg-white/4 p-3">
                    {(() => {
                      const url = slipSignedUrl || selectedBooking.payment_slip_url || '';
                      const isPdf = url.toLowerCase().includes('.pdf') || url.toLowerCase().includes('/pdf');
                      const refName = selectedBooking.booking_ref || 'Receipt';
                      const isCloudinary = url.includes('res.cloudinary.com');

                      const downloadUrl = (isCloudinary && isPdf)
                        ? url.replace('/upload/', `/upload/fl_attachment:${refName}_slip/`)
                        : url;

                      if (isPdf) {
                        const page1Preview = isCloudinary
                          ? url.replace('/upload/', '/upload/pg_1,f_jpg/').replace(/\.pdf$/i, '.jpg')
                          : null;

                        return (
                          <div className="flex flex-col gap-3">
                            <div className="flex items-center justify-between px-1">
                              <span className="text-xs font-black text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                                <FileText className="w-4 h-4 text-red-400" /> PDF Payment Receipt ({refName})
                              </span>
                              <span className="text-[10px] text-white/40 font-mono">PDF Document</span>
                            </div>

                            {page1Preview ? (
                              <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-black/40 max-h-80 flex items-center justify-center p-2">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  src={page1Preview}
                                  alt="PDF Receipt Page 1 Preview"
                                  className="w-full h-auto max-h-72 object-contain rounded-xl hover:scale-[1.02] transition-transform"
                                  onError={(e) => {
                                    (e.target as HTMLElement).style.display = 'none';
                                  }}
                                />
                              </div>
                            ) : (
                              <div className="p-6 text-center border border-white/10 rounded-2xl bg-black/40">
                                <FileText className="w-10 h-10 text-red-400 mx-auto mb-2" />
                                <p className="text-xs text-white/80 font-bold">PDF Payment Receipt Attached ({refName})</p>
                              </div>
                            )}

                            <a
                              href={downloadUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center justify-center gap-2 text-xs text-section-ink bg-signal-lime hover:bg-[#b0d420] font-black py-3 px-4 rounded-xl transition-all shadow-md shadow-signal-lime/10"
                            >
                              <ExternalLink className="w-4 h-4" /> Open / Download Receipt PDF →
                            </a>
                          </div>
                        );
                      }

                      /* ── Image Receipt Preview ── */
                      return (
                        <div className="flex flex-col items-center gap-3">
                          <div className="w-full rounded-xl overflow-hidden border border-white/10 bg-black/40 p-2 flex items-center justify-center">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={url}
                              alt="Payment slip"
                              className="max-h-80 w-auto object-contain rounded-lg"
                              onError={(e) => {
                                (e.target as HTMLElement).style.display = 'none';
                              }}
                            />
                          </div>
                          <a
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 text-xs text-signal-lime hover:underline font-bold py-1"
                          >
                            <ExternalLink className="w-3.5 h-3.5" /> Open Full Resolution Image
                          </a>
                        </div>
                      );
                    })()}
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
                className="w-full mt-4 flex items-center justify-center gap-2 bg-signal-lime hover:bg-[#b0d420] text-section-ink py-3 rounded-xl font-black text-sm transition-all shadow-lg shadow-signal-lime/10"
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
        </div>
      )}

      {/* Ticket Printable PDF Pass Modal */}
      {printBooking && (
        <TicketPrintModal
          booking={printBooking}
          onClose={() => setPrintBooking(null)}
        />
      )}

      {/* ── DELETE CONFIRMATION MODAL ── */}
      {deleteConfirmTarget && (
        <div
          className="fixed inset-0 z-[99999] overflow-y-auto bg-black/85 backdrop-blur-xl p-4 sm:p-6 flex items-center justify-center animate-in fade-in"
          onClick={() => !deleting && setDeleteConfirmTarget(null)}
        >
          <div
            className="bg-[#121624] border border-red-500/30 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative space-y-5 text-left my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 border-b border-white/10 pb-4">
              <div className="w-10 h-10 rounded-2xl bg-red-500/20 text-red-400 flex items-center justify-center border border-red-500/30">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-base sm:text-lg text-white">Delete Booking & Tickets</h3>
                <p className="text-xs text-white/50">This action cannot be undone</p>
              </div>
            </div>

            <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 space-y-2">
              <p className="text-xs text-white/90">
                Are you sure you want to permanently delete booking{' '}
                <strong className="text-signal-lime font-mono">{deleteConfirmTarget.booking_ref}</strong> for{' '}
                <strong className="text-white">{deleteConfirmTarget.attendee_name}</strong>?
              </p>
              <p className="text-[11px] text-white/50">
                This will purge all booking records, issued passes, gate scan history, and attendee data from Supabase.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmTarget(null)}
                disabled={deleting}
                className="flex-1 bg-white/10 hover:bg-white/15 text-white font-bold py-3 rounded-xl text-xs transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteBooking}
                disabled={deleting}
                className="flex-1 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-500 text-white font-black py-3 rounded-xl text-xs transition-all shadow-lg hover:shadow-red-500/30"
              >
                {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Trash2 className="w-4 h-4" /> Delete Permanently</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
