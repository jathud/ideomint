'use client';

import { useEffect } from 'react';
import Image from 'next/image';
import QRCode from 'react-qr-code';
import { X, Printer, ShieldCheck, Ticket as TicketIcon, Calendar, MapPin, User, CheckCircle2 } from 'lucide-react';
import type { IBooking } from '@/lib/ideofest/types';

interface TicketPrintModalProps {
  booking: IBooking;
  onClose: () => void;
}

export default function TicketPrintModal({ booking, onClose }: TicketPrintModalProps) {
  // Prevent background scrolling while modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const qrValue = (booking as any).qr_token || booking.booking_ref || `IDEOFEST:${booking.id}`;
  const tagline = (booking as any).tagline || '';

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto print:p-0 print:bg-white print:static">
      <div className="relative w-full max-w-xl bg-[#0B0D14] border border-white/15 rounded-3xl overflow-hidden text-white shadow-2xl animate-in fade-in zoom-in-95 my-8 print:border-none print:shadow-none print:bg-white print:text-black print:my-0">
        
        {/* Close Button (Hidden on Print) */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2.5 bg-white/10 hover:bg-white/20 text-white/70 hover:text-white rounded-full transition-all print:hidden"
        >
          <X className="w-5 h-5" />
        </button>

        {/* ── Ticket Header ── */}
        <div className="bg-gradient-to-r from-section-ink via-[#161B26] to-section-ink p-6 border-b border-white/10 relative overflow-hidden print:bg-gray-100 print:border-gray-300">
          <div className="absolute top-0 right-0 w-48 h-48 bg-signal-lime/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex items-center justify-between gap-4 mb-4">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <Image
                src="/ideofest-logo.jpg"
                alt="Ideofest Logo"
                width={130}
                height={40}
                className="object-contain rounded-lg"
              />
              <span className="text-[10px] font-black tracking-widest uppercase px-2.5 py-1 rounded-full bg-signal-lime/15 text-signal-lime border border-signal-lime/30 print:border-black print:text-black">
                Official Festival Pass
              </span>
            </div>
          </div>

          <h2 className="text-2xl font-black text-white tracking-tight print:text-black">{booking.event_title}</h2>
          {tagline && <p className="text-xs text-white/50 mt-0.5 print:text-gray-600">{tagline}</p>}
        </div>

        {/* ── Ticket Body ── */}
        <div className="p-6 space-y-6 print:p-4">
          {/* Event & Venue Info */}
          <div className="grid grid-cols-2 gap-4 bg-white/5 border border-white/8 rounded-2xl p-4 print:bg-gray-50 print:border-gray-200">
            <div className="flex items-start gap-3">
              <Calendar className="w-4 h-4 text-signal-lime mt-0.5 shrink-0 print:text-black" />
              <div>
                <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest print:text-gray-500">Date & Time</p>
                <p className="text-xs font-bold text-white mt-0.5 print:text-black">
                  {booking.event_date ? new Date(booking.event_date).toLocaleDateString('en-LK', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }) : 'Festival Date'}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <MapPin className="w-4 h-4 text-signal-lime mt-0.5 shrink-0 print:text-black" />
              <div>
                <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest print:text-gray-500">Location</p>
                <p className="text-xs font-bold text-white mt-0.5 truncate print:text-black">{booking.venue || 'Sri Lanka'}</p>
              </div>
            </div>
          </div>

          {/* Attendee & Pass Details */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest print:text-gray-500">Ticket Holder</p>
              <p className="text-sm font-black text-white mt-0.5 print:text-black">{booking.attendee_name}</p>
              <p className="text-xs text-white/50 font-mono mt-0.5 print:text-gray-600">{booking.attendee_email}</p>
              {booking.attendee_nic && <p className="text-[11px] text-white/40 font-mono mt-0.5 print:text-gray-600">NIC: {booking.attendee_nic}</p>}
            </div>

            <div className="text-right">
              <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest print:text-gray-500">Booking Ref</p>
              <p className="text-sm font-mono font-black text-signal-lime mt-0.5 print:text-black">{booking.booking_ref}</p>
              <p className="text-xs text-white/60 font-bold mt-0.5 print:text-black">
                {booking.tier_label || booking.tier_name} × {booking.quantity}
              </p>
              <p className="text-xs font-bold text-white/40 mt-0.5 print:text-gray-600">LKR {booking.total_amount?.toLocaleString('en-LK')}</p>
            </div>
          </div>

          {/* QR Code Section */}
          <div className="bg-white p-6 rounded-2xl flex flex-col items-center justify-center border border-white/20 text-center shadow-lg print:border-gray-300">
            <div className="bg-white p-3 rounded-xl border border-gray-200">
              <QRCode value={qrValue} size={160} />
            </div>
            <p className="text-[11px] font-mono font-bold text-gray-800 mt-3 tracking-widest uppercase">
              SCAN AT ENTRANCE GATE
            </p>
            <p className="text-[10px] text-gray-500 mt-0.5">Present this digital or printed pass for entry scan</p>
          </div>

          {/* Verification Badge */}
          <div className="flex items-center justify-between text-xs text-white/40 border-t border-white/10 pt-4 print:border-gray-300 print:text-gray-600">
            <div className="flex items-center gap-1.5 text-signal-lime print:text-black font-bold">
              <CheckCircle2 className="w-4 h-4" />
              <span>Verified Ticket Pass</span>
            </div>
            <div className="flex items-center gap-1 font-mono text-[11px]">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Ideofest Encrypted Pass</span>
            </div>
          </div>
        </div>

        {/* ── Footer Actions (Hidden on Print) ── */}
        <div className="p-4 bg-white/5 border-t border-white/10 flex items-center justify-between gap-4 print:hidden">
          <p className="text-xs text-white/50">Save as PDF or print pass</p>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 bg-signal-lime hover:bg-[#b0d420] text-section-ink px-6 py-2.5 rounded-xl font-black text-sm transition-all shadow-lg shadow-signal-lime/10"
          >
            <Printer className="w-4 h-4" /> Print / Save PDF Pass
          </button>
        </div>

      </div>
    </div>
  );
}
