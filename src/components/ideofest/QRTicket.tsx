'use client';

import { useRef } from 'react';
import Image from 'next/image';
import QRCode from 'react-qr-code';
import { Download, Calendar, MapPin, Printer, CheckCircle2, ShieldCheck, FileText } from 'lucide-react';
import type { IBooking } from '@/lib/ideofest/types';

interface QRTicketProps {
  booking: IBooking;
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-LK', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });
}

export default function QRTicket({ booking }: QRTicketProps) {
  const qrRef = useRef<HTMLDivElement>(null);

  const handleDownloadImage = () => {
    if (!qrRef.current) return;
    const svg = qrRef.current.querySelector('svg');
    if (!svg) return;

    const canvas = document.createElement('canvas');
    const size = 320;
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, size, size);

    const svgData = new XMLSerializer().serializeToString(svg);
    const img = new window.Image();
    img.onload = () => {
      ctx.drawImage(img, 0, 0, size, size);
      const a = document.createElement('a');
      a.download = `ideofest-ticket-bill-${booking.booking_ref}.png`;
      a.href = canvas.toDataURL('image/png');
      a.click();
    };
    img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgData);
  };

  const handlePrintPdf = () => {
    window.print();
  };

  const isConfirmed = booking.status === 'confirmed' || booking.payment_status === 'paid';
  const qrPayload = (booking as any).qr_token || booking.booking_ref;

  return (
    <div className="printable-ticket-card bg-[#0B0D14] border border-white/15 rounded-3xl overflow-hidden max-w-sm w-full shadow-2xl relative">
      {/* ── Bill Header Banner ── */}
      <div className="bg-gradient-to-r from-[#121624] via-[#1A2032] to-[#121624] px-6 py-5 border-b border-white/12 print:bg-white print:border-gray-300">
        <div className="flex items-center justify-between gap-3 mb-3">
          {/* Official Logo */}
          <Image
            src="/ideofest-logo.jpg"
            alt="Ideofest Logo"
            width={130}
            height={40}
            className="object-contain rounded-lg"
          />
          <span className="text-[10px] font-black tracking-widest uppercase px-3 py-1 rounded-full bg-signal-lime/15 text-signal-lime border border-signal-lime/30 print:border-black print:text-black">
            Official Ticket Bill
          </span>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-white/8 print:border-gray-200">
          <div>
            <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest print:text-gray-500">Booking Ref</p>
            <p className="text-sm font-mono font-black text-signal-lime mt-0.5 print:text-black">{booking.booking_ref}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest print:text-gray-500">Payment Status</p>
            <span className={`inline-flex items-center gap-1 text-[11px] font-black px-2.5 py-0.5 rounded-full mt-0.5 ${isConfirmed ? 'bg-signal-lime/20 text-signal-lime print:text-black' : 'bg-amber-500/20 text-amber-400 print:text-gray-700'}`}>
              <CheckCircle2 className="w-3 h-3" />
              {isConfirmed ? 'Paid & Verified' : 'Pending Verification'}
            </span>
          </div>
        </div>
      </div>

      {/* ── Event Details ── */}
      <div className="px-6 pt-5 pb-3">
        <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest print:text-gray-500">Event</p>
        <h3 className="text-xl font-black text-white leading-tight mt-0.5 print:text-black">{booking.event_title}</h3>
      </div>

      {/* ── Itemized Bill Table ── */}
      <div className="px-6">
        <div className="bg-white/4 border border-white/8 rounded-2xl p-4 text-xs space-y-2.5 print:bg-gray-50 print:border-gray-300">
          <div className="flex items-start gap-2 text-white/80 print:text-black">
            <Calendar className="w-4 h-4 text-signal-lime shrink-0 mt-0.5 print:text-black" />
            <div>
              <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest print:text-gray-500">Date & Time</p>
              <p className="font-bold text-white mt-0.5 print:text-black">{formatDate(booking.event_date)}</p>
            </div>
          </div>

          <div className="flex items-start gap-2 text-white/80 print:text-black pt-2 border-t border-white/8 print:border-gray-200">
            <MapPin className="w-4 h-4 text-signal-lime shrink-0 mt-0.5 print:text-black" />
            <div>
              <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest print:text-gray-500">Venue</p>
              <p className="font-bold text-white mt-0.5 print:text-black">{booking.venue}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2.5 border-t border-white/8 print:border-gray-200">
            <div>
              <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest print:text-gray-500">Ticket Holder</p>
              <p className="font-bold text-white mt-0.5 print:text-black">{booking.attendee_name}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest print:text-gray-500">Ticket Tier</p>
              <p className="font-bold text-white mt-0.5 print:text-black">{booking.tier_label || booking.tier_name} × {booking.quantity}</p>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2.5 border-t border-white/8 print:border-gray-200">
            <span className="text-white/50 font-bold print:text-gray-600">Total Amount Paid</span>
            <span className="font-black text-sm text-signal-lime print:text-black">
              LKR {booking.total_amount?.toLocaleString('en-LK', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      </div>

      {/* ── QR Gate Pass Section ── */}
      <div className="px-6 py-4">
        <div ref={qrRef} className="flex flex-col items-center justify-center p-4 bg-white rounded-2xl border border-white/20 shadow-inner print:border-gray-300">
          {isConfirmed ? (
            <>
              <QRCode value={qrPayload} size={150} />
              <p className="text-[10px] font-mono font-bold text-gray-800 mt-2.5 tracking-widest uppercase">
                PRESENT QR PASS AT GATE ENTRANCE
              </p>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center text-center p-4">
              <div className="w-10 h-10 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mb-2">
                <span className="text-lg font-bold text-amber-500">🔒</span>
              </div>
              <p className="text-xs font-black text-slate-800 uppercase tracking-wider">QR Code Locked</p>
              <p className="text-[10px] text-slate-500 mt-1 max-w-[180px] leading-normal">
                Activates automatically upon payment approval.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ── Print / Save PDF Actions (Hidden on Print) ── */}
      <div className="px-6 pb-6 pt-1 flex flex-col gap-2.5 print-hide">
        <button
          onClick={handlePrintPdf}
          disabled={!isConfirmed}
          className="w-full flex items-center justify-center gap-2 bg-signal-lime hover:bg-[#b0d420] disabled:opacity-40 disabled:cursor-not-allowed text-section-ink font-black py-3 rounded-xl transition-all text-xs shadow-lg shadow-signal-lime/10"
        >
          <Printer className="w-4 h-4" />
          {isConfirmed ? 'Print / Save PDF Bill Pass' : 'Awaiting Approval'}
        </button>

        <button
          onClick={handleDownloadImage}
          disabled={!isConfirmed}
          className="w-full flex items-center justify-center gap-2 bg-white/8 hover:bg-white/15 disabled:opacity-40 disabled:cursor-not-allowed border border-white/12 text-white/80 font-bold py-2.5 rounded-xl transition-colors text-xs"
        >
          <Download className="w-3.5 h-3.5 text-signal-lime" />
          Download PNG QR Image
        </button>
      </div>

      {/* ── Footer ── */}
      <div className="px-6 py-3 bg-white/3 border-t border-white/8 flex items-center justify-between text-[10px] text-white/40 print:border-gray-300 print:text-gray-600">
        <span className="flex items-center gap-1 font-bold text-signal-lime print:text-black">
          <CheckCircle2 className="w-3 h-3" /> Ideofest Validated Pass
        </span>
        <span className="flex items-center gap-1 font-mono">
          <ShieldCheck className="w-3 h-3" /> Ideomint Secure
        </span>
      </div>
    </div>
  );
}
