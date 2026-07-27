'use client';

import { useState, useRef, useEffect } from 'react';
import QRTicket from '@/components/ideofest/QRTicket';
import Link from 'next/link';
import {
  Ticket, ArrowRight, Search, Phone, Upload, CheckCircle2,
  Clock, XCircle, Loader2, ImagePlus, RefreshCw, Printer, ShieldCheck, Share2
} from 'lucide-react';
import type { IBooking } from '@/lib/ideofest/types';

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  confirmed: {
    label: 'Payment Verified & Pass Active ✓',
    color: 'bg-[#c1e527]/15 text-[#c1e527] border border-[#c1e527]/30',
    icon: <CheckCircle2 className="w-3.5 h-3.5 text-[#c1e527]" />,
  },
  paid: {
    label: 'Payment Verified & Pass Active ✓',
    color: 'bg-[#c1e527]/15 text-[#c1e527] border border-[#c1e527]/30',
    icon: <CheckCircle2 className="w-3.5 h-3.5 text-[#c1e527]" />,
  },
  pending_verification: {
    label: 'Receipt Uploaded — Pending Review',
    color: 'bg-amber-500/15 text-amber-400 border border-amber-500/30',
    icon: <Clock className="w-3.5 h-3.5" />,
  },
  pending: {
    label: 'Awaiting Slip Upload',
    color: 'bg-yellow-500/15 text-yellow-400 border border-yellow-500/30',
    icon: <Upload className="w-3.5 h-3.5" />,
  },
  rejected: {
    label: 'Payment Slip Rejected',
    color: 'bg-red-500/15 text-red-400 border border-red-500/30',
    icon: <XCircle className="w-3.5 h-3.5" />,
  },
  cancelled: {
    label: 'Booking Cancelled',
    color: 'bg-white/10 text-white/40 border border-white/15',
    icon: <XCircle className="w-3.5 h-3.5" />,
  },
};

function SlipUploadPanel({ booking, onSuccess }: { booking: IBooking; onSuccess: () => void }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    setError(null);
    if (file.size > 10 * 1024 * 1024) {
      setError('File is too large. Max 10MB.');
      return;
    }
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('type', 'payment_slip');
      fd.append('booking_ref', booking.booking_ref);

      const upRes = await fetch('/api/ideofest/upload', { method: 'POST', body: fd });
      const upData = await upRes.json();
      if (!upData.success) throw new Error(upData.error || 'Upload failed');

      onSuccess();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="mt-4 rounded-2xl bg-white/5 border border-white/10 p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-bold text-white/70 uppercase tracking-widest">
          Upload Payment Slip
        </span>
        <span className="text-[10px] text-white/40">PNG, JPG, PDF · Max 10MB</span>
      </div>

      {booking.payment_method === 'payhere' && !booking.payment_slip_url && (
        <p className="text-[11px] text-blue-300 bg-blue-500/10 border border-blue-500/20 rounded-lg px-3 py-2 mb-3 font-semibold">
          Selected PayHere by mistake? You can switch to Bank Transfer by uploading your bank transfer receipt below.
        </p>
      )}

      {booking.payment_slip_url && (
        <p className="text-[11px] text-amber-300 bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2 mb-3 font-semibold">
          Receipt uploaded & waiting for admin approval. You can re-upload a new file below if needed.
        </p>
      )}

      {error && <p className="text-xs text-red-400 mb-3">{error}</p>}

      <input
        ref={inputRef}
        type="file"
        accept="image/*,.pdf"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFile(f);
        }}
      />

      <button
        type="button"
        disabled={uploading}
        onClick={() => inputRef.current?.click()}
        className="w-full flex items-center justify-center gap-2 border border-dashed border-white/20 hover:border-[#c1e527]/50 rounded-xl py-4 bg-white/2 hover:bg-white/5 transition-all text-xs font-bold text-white/80"
      >
        {uploading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin text-[#c1e527]" />
            Uploading receipt...
          </>
        ) : (
          <>
            <ImagePlus className="w-4 h-4 text-[#c1e527]" />
            Choose Slip File to Upload
          </>
        )}
      </button>
    </div>
  );
}

export default function MyTicketsPage() {
  const [printBooking, setPrintBooking] = useState<IBooking | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [mode, setMode] = useState<'ref' | 'phone'>('ref');
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bookings, setBookings] = useState<IBooking[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<IBooking | null>(null);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (printBooking) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [printBooking]);

  // Check URL params for ref
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get('ref');
    if (ref) {
      setSearchQuery(ref);
      lookupBooking(ref, 'ref');
    }
  }, []);

  const lookupBooking = async (queryStr?: string, queryMode?: 'ref' | 'phone') => {
    const q = queryStr !== undefined ? queryStr : searchQuery;
    const m = queryMode !== undefined ? queryMode : mode;
    if (!q.trim()) return;

    setLoading(true);
    setError(null);
    setSearched(true);
    setBookings([]);
    setSelectedBooking(null);

    try {
      const cleanQ = q.trim();
      const endpoint = m === 'ref'
        ? `/api/ideofest/bookings?ref=${encodeURIComponent(cleanQ)}`
        : `/api/ideofest/bookings?q=${encodeURIComponent(cleanQ)}`;
      const res = await fetch(endpoint);
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Failed to find bookings');

      const list: IBooking[] = Array.isArray(data.data) ? data.data : data.data ? [data.data] : [];
      setBookings(list);
      if (list.length === 1) setSelectedBooking(list[0]);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    lookupBooking();
  };

  return (
    <div className="container-layout py-10 px-4 sm:px-6 max-w-4xl mx-auto min-h-[70vh]">
      {/* Header */}
      <div className="mb-10 text-center">
        <span className="text-xs font-bold text-[#c1e527] uppercase tracking-widest">Digital Ticket Portal</span>
        <h1 className="text-3xl md:text-4xl font-black text-white mt-2 mb-3">Find My Tickets</h1>
        <p className="text-white/50 text-sm max-w-md mx-auto">
          Enter your Booking Reference (IDF-XXXXXXXX) or Email to view your active QR pass or upload a payment slip.
        </p>
      </div>

      {/* Lookup Card */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-10 shadow-xl max-w-xl mx-auto backdrop-blur-xl">
        <div className="flex rounded-xl bg-white/5 p-1 mb-5">
          <button
            type="button"
            onClick={() => { setMode('ref'); setSearchQuery(''); setSearched(false); setBookings([]); }}
            aria-pressed={mode === 'ref'}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              mode === 'ref' ? 'bg-[#c1e527] text-section-ink' : 'text-white/50 hover:text-white'
            }`}
          >
            <Ticket className="w-3.5 h-3.5" /> Booking Reference
          </button>
          <button
            type="button"
            onClick={() => { setMode('phone'); setSearchQuery(''); setSearched(false); setBookings([]); }}
            aria-pressed={mode === 'phone'}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              mode === 'phone' ? 'bg-[#c1e527] text-section-ink' : 'text-white/50 hover:text-white'
            }`}
          >
            <Phone className="w-3.5 h-3.5" /> Email Address
          </button>
        </div>

        <form onSubmit={handleFormSubmit} className="flex gap-3">
          <div className="relative flex-grow">
            <Search className="w-4 h-4 text-white/30 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={mode === 'ref' ? 'IDF-XXXXXXXX' : 'you@example.com'}
              className="w-full bg-white/5 border border-white/12 rounded-xl pl-11 pr-4 py-3.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#c1e527] transition-colors font-mono uppercase"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !searchQuery.trim()}
            className="bg-[#c1e527] hover:bg-[#b0d420] disabled:opacity-40 text-section-ink font-black px-6 rounded-xl transition-colors flex items-center gap-2 text-sm shrink-0"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Search'}
          </button>
        </form>

        {error && <p className="text-xs text-red-400 mt-3 text-center font-semibold">{error}</p>}
      </div>

      {/* Results */}
      {searched && !loading && bookings.length === 0 && (
        <div className="text-center py-12 bg-white/3 border border-white/5 rounded-2xl max-w-xl mx-auto">
          <Ticket className="w-10 h-10 text-white/20 mx-auto mb-3" />
          <p className="text-white font-bold mb-1">No bookings found</p>
          <p className="text-xs text-white/40 max-w-xs mx-auto mb-6">
            We couldn't find any tickets matching "{searchQuery}". Please check your booking reference or email.
          </p>
          <Link
            href="/ideofest/events"
            className="inline-flex items-center gap-2 bg-[#c1e527] text-section-ink font-black px-5 py-2.5 rounded-xl text-xs"
          >
            Browse Events <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* List if multiple */}
      {bookings.length > 1 && (
        <div className="mb-8">
          <p className="text-xs text-white/40 uppercase tracking-widest font-bold mb-3">
            Found {bookings.length} Bookings — Select one to view
          </p>
          <div className="grid gap-3">
            {bookings.map((b) => (
              <div
                key={b.booking_ref}
                onClick={() => setSelectedBooking(b)}
                className={`p-4 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                  selectedBooking?.booking_ref === b.booking_ref
                    ? 'bg-[#c1e527]/10 border-[#c1e527]'
                    : 'bg-white/5 border-white/8 hover:border-white/20'
                }`}
              >
                <div>
                  <span className="font-mono text-xs font-bold text-[#c1e527]">{b.booking_ref}</span>
                  <p className="font-bold text-white text-sm mt-0.5">{b.event_title}</p>
                  <p className="text-xs text-white/40">{b.tier_label} × {b.quantity}</p>
                </div>
                <div className="text-right">
                  <span className="font-black text-white text-sm">
                    LKR {b.total_amount?.toLocaleString('en-LK', { minimumFractionDigits: 2 })}
                  </span>
                  <p className="text-xs text-white/40 capitalize mt-0.5">{b.payment_status}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Detail view */}
      {selectedBooking && (
        <div className="flex flex-col items-center gap-8">
          {/* Status banner */}
          {(() => {
            const isConfirmed = selectedBooking.status === 'confirmed' || selectedBooking.payment_status === 'paid';
            const statusKey = isConfirmed ? 'confirmed' : (selectedBooking.payment_status || selectedBooking.status);
            const cfg = STATUS_CONFIG[statusKey] || STATUS_CONFIG.pending;
            return (
              <div className={`w-full max-w-sm flex items-center justify-between p-4 rounded-2xl ${cfg.color}`}>
                <div className="flex items-center gap-2 text-sm font-black">
                  {cfg.icon}
                  <span>{cfg.label}</span>
                </div>
                <span className="text-xs font-mono opacity-70">{selectedBooking.booking_ref}</span>
              </div>
            );
          })()}

          {/* QR Ticket Pass */}
          <QRTicket booking={selectedBooking} />

          {/* Slip upload & WhatsApp panel (ONLY shown if payment NOT confirmed/paid) */}
          {selectedBooking.status !== 'confirmed' && selectedBooking.payment_status !== 'paid' && selectedBooking.status !== 'cancelled' && (
            <div className="w-full max-w-sm space-y-4">
              {/* WhatsApp Direct Slip Submission Card */}
              <div className="w-full bg-gradient-to-r from-emerald-500/15 via-white/5 to-emerald-500/10 border border-emerald-500/35 rounded-2xl p-5 text-left backdrop-blur-xl space-y-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-emerald-500/20 rounded-xl border border-emerald-500/30 text-emerald-400 shrink-0">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-white text-xs">Send Slip via WhatsApp</h4>
                    <p className="text-[10px] text-white/60">Fastest verification — send your transfer receipt directly to our team on WhatsApp</p>
                  </div>
                </div>

                {(() => {
                  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || process.env.NEXT_PUBLIC_ORGANIZER_WHATSAPP || '+94786892649';
                  const cleanWhatsapp = whatsappNumber.replace(/[^\d]/g, '');
                  const waText = `Hi Ideofest Team 👋\n\nI have a booking for *${selectedBooking.event_title}*.\n\n📌 *Booking Ref:* ${selectedBooking.booking_ref}\n👤 *Name:* ${selectedBooking.attendee_name}\n🎟️ *Pass Tier:* ${selectedBooking.tier_label} × ${selectedBooking.quantity}\n💰 *Total Amount:* LKR ${(selectedBooking.total_amount || 0).toLocaleString('en-LK')}\n\nHere is my payment transfer receipt attached:`;
                  const waUrl = `https://wa.me/${cleanWhatsapp}?text=${encodeURIComponent(waText)}`;

                  return (
                    <a
                      href={waUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20bd5a] text-black font-black py-3 px-4 rounded-xl text-xs transition-all shadow-[0_0_20px_rgba(37,211,102,0.25)] hover:scale-[1.01]"
                    >
                      <Share2 className="w-4 h-4 shrink-0" />
                      <span>Send Slip via WhatsApp ({whatsappNumber})</span>
                    </a>
                  );
                })()}
              </div>

              <SlipUploadPanel
                booking={selectedBooking}
                onSuccess={() => {
                  const updated: IBooking = {
                    ...selectedBooking,
                    payment_status: 'pending_verification',
                    status: 'pending_verification',
                    payment_slip_url: 'uploaded',
                  };
                  setSelectedBooking(updated);
                  setBookings((prev) => prev.map((b) => (b.booking_ref === selectedBooking.booking_ref ? updated : b)));
                }}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
