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
    const printWin = window.open('', '_blank', 'width=700,height=900');
    if (!printWin) {
      window.print();
      return;
    }

    const qrValue = (booking as any).qr_token || booking.booking_ref || `IDEOFEST:${booking.id}`;
    const dateFormatted = booking.event_date ? new Date(booking.event_date).toLocaleDateString('en-LK', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }) : 'Festival Date';
    const logoUrl = `${window.location.origin}/ideofest-logo.jpg`;

    // Grab vector SVG QR from DOM
    const qrWrapper = document.getElementById(`qr-wrapper-${booking.id || booking.booking_ref}`);
    let qrSvgHtml = '';
    if (qrWrapper) {
      const svg = qrWrapper.querySelector('svg');
      if (svg) {
        qrSvgHtml = svg.outerHTML;
      }
    }
    if (!qrSvgHtml) {
      qrSvgHtml = `<img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrValue)}" style="width:170px;height:170px;margin:0 auto;" />`;
    }

    printWin.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Ideofest Festival Pass - ${booking.booking_ref}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;600;700;800;900&display=swap');
            * { box-sizing: border-box; margin: 0; padding: 0; }
            body {
              font-family: 'Manrope', -apple-system, BlinkMacSystemFont, sans-serif;
              background-color: #05070D !important;
              color: #ffffff !important;
              padding: 24px;
              display: flex;
              justify-content: center;
              align-items: flex-start;
              min-height: 100vh;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            .pass-card {
              width: 100%;
              max-width: 480px;
              background: #0B0D14 !important;
              border: 1px solid rgba(255, 255, 255, 0.2);
              border-radius: 20px;
              overflow: hidden;
              box-shadow: 0 20px 40px rgba(0,0,0,0.5);
              color: #ffffff !important;
            }
            .pass-header {
              background: linear-gradient(135deg, #121624 0%, #1A2032 100%) !important;
              padding: 24px;
              border-bottom: 1px solid rgba(255,255,255,0.1);
            }
            .logo-bar {
              display: flex;
              align-items: center;
              justify-content: space-between;
              margin-bottom: 16px;
            }
            .badge {
              font-size: 10px;
              font-weight: 800;
              text-transform: uppercase;
              letter-spacing: 1px;
              padding: 4px 10px;
              border-radius: 20px;
              background: rgba(193, 229, 39, 0.15) !important;
              color: #c1e527 !important;
              border: 1px solid rgba(193, 229, 39, 0.4);
            }
            .event-title {
              font-size: 22px;
              font-weight: 900;
              color: #ffffff !important;
              line-height: 1.2;
            }
            .pass-body {
              padding: 24px;
            }
            .info-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 14px;
              margin-bottom: 16px;
            }
            .info-box {
              background: rgba(255, 255, 255, 0.05) !important;
              border: 1px solid rgba(255, 255, 255, 0.1);
              padding: 12px 14px;
              border-radius: 12px;
            }
            .info-label {
              font-size: 9px;
              font-weight: 800;
              color: rgba(255, 255, 255, 0.5) !important;
              text-transform: uppercase;
              letter-spacing: 1px;
              margin-bottom: 2px;
            }
            .info-val {
              font-size: 12px;
              font-weight: 800;
              color: #ffffff !important;
            }
            .info-val-highlight {
              color: #c1e527 !important;
              font-family: monospace;
              font-size: 14px;
            }
            .qr-box {
              background: #ffffff !important;
              padding: 20px;
              border-radius: 16px;
              text-align: center;
              margin-bottom: 20px;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
            }
            .qr-box svg {
              width: 170px !important;
              height: 170px !important;
            }
            .qr-text {
              font-size: 11px;
              font-weight: 800;
              color: #000000 !important;
              margin-top: 10px;
              letter-spacing: 1px;
              font-family: monospace;
            }
            .qr-subtext {
              font-size: 10px;
              color: #666666 !important;
              margin-top: 2px;
            }
            .footer-badge {
              display: flex;
              align-items: center;
              justify-content: space-between;
              font-size: 11px;
              color: rgba(255,255,255,0.5) !important;
              padding-top: 12px;
              border-top: 1px solid rgba(255,255,255,0.1);
            }
            .verified-tag {
              color: #c1e527 !important;
              font-weight: 800;
            }
            @media print {
              body { background-color: #05070D !important; padding: 0; }
              @page { size: portrait; margin: 5mm; }
            }
          </style>
        </head>
        <body>
          <div class="pass-card">
            <div class="pass-header">
              <div class="logo-bar">
                <img src="${logoUrl}" alt="Ideofest" style="height:36px; border-radius:6px;" />
                <span class="badge">Official Festival Pass</span>
              </div>
              <div class="event-title">${booking.event_title}</div>
            </div>
            <div class="pass-body">
              <div class="info-grid">
                <div class="info-box">
                  <div class="info-label">Date & Time</div>
                  <div class="info-val">${dateFormatted}</div>
                </div>
                <div class="info-box">
                  <div class="info-label">Location</div>
                  <div class="info-val">${booking.venue || 'Sri Lanka'}</div>
                </div>
              </div>

              <div class="info-grid">
                <div class="info-box">
                  <div class="info-label">Ticket Holder</div>
                  <div class="info-val">${booking.attendee_name}</div>
                  <div style="font-size:10px; color:rgba(255,255,255,0.5); font-family:monospace; margin-top:2px;">${booking.attendee_email}</div>
                  ${booking.attendee_nic ? `<div style="font-size:10px; color:rgba(255,255,255,0.4); font-family:monospace;">NIC: ${booking.attendee_nic}</div>` : ''}
                </div>
                <div class="info-box" style="text-align:right;">
                  <div class="info-label">Booking Ref</div>
                  <div class="info-val info-val-highlight">${booking.booking_ref}</div>
                  <div style="font-size:11px; font-weight:700; color:rgba(255,255,255,0.8); margin-top:2px;">
                    ${booking.tier_label || booking.tier_name} × ${booking.quantity}
                  </div>
                  <div style="font-size:11px; font-weight:700; color:rgba(255,255,255,0.5); margin-top:2px;">LKR ${booking.total_amount?.toLocaleString('en-LK')}</div>
                </div>
              </div>

              <div class="qr-box">
                ${qrSvgHtml}
                <div class="qr-text">SCAN AT ENTRANCE GATE</div>
                <div class="qr-subtext">Present this digital or printed pass for entry scan</div>
              </div>

              <div class="footer-badge">
                <span class="verified-tag">✓ Verified Ticket Pass</span>
                <span>Ideofest Encrypted Pass</span>
              </div>
            </div>
          </div>
          <script>
            window.onload = function() {
              setTimeout(function() {
                window.print();
              }, 400);
            };
          </script>
        </body>
      </html>
    `);
    printWin.document.close();
  };

  const qrValue = (booking as any).qr_token || booking.booking_ref || `IDEOFEST:${booking.id}`;
  const tagline = (booking as any).tagline || '';

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto print:p-0 print:bg-white print:static">
      <div 
        id={`ticket-modal-card-${booking.id || booking.booking_ref}`}
        className="printable-ticket-card print-modal-card relative w-full max-w-xl bg-[#0B0D14] border border-white/15 rounded-3xl overflow-hidden text-white shadow-2xl animate-in fade-in zoom-in-95 my-8"
      >
        
        {/* Close Button (Hidden on Print) */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2.5 bg-white/10 hover:bg-white/20 text-white/70 hover:text-white rounded-full transition-all print-hide"
        >
          <X className="w-5 h-5" />
        </button>

        {/* ── Ticket Header ── */}
        <div className="bg-gradient-to-r from-section-ink via-[#161B26] to-section-ink p-6 border-b border-white/10 relative overflow-hidden">
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
              <span className="text-[10px] font-black tracking-widest uppercase px-2.5 py-1 rounded-full bg-signal-lime/15 text-signal-lime border border-signal-lime/30">
                Official Festival Pass
              </span>
            </div>
          </div>

          <h2 className="text-2xl font-black text-white tracking-tight">{booking.event_title}</h2>
          {tagline && <p className="text-xs text-white/50 mt-0.5">{tagline}</p>}
        </div>

        {/* ── Ticket Body ── */}
        <div className="p-6 space-y-6">
          {/* Event & Venue Info */}
          <div className="grid grid-cols-2 gap-4 bg-white/5 border border-white/8 rounded-2xl p-4">
            <div className="flex items-start gap-3">
              <Calendar className="w-4 h-4 text-signal-lime mt-0.5 shrink-0" />
              <div>
                <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Date & Time</p>
                <p className="text-xs font-bold text-white mt-0.5">
                  {booking.event_date ? new Date(booking.event_date).toLocaleDateString('en-LK', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }) : 'Festival Date'}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <MapPin className="w-4 h-4 text-signal-lime mt-0.5 shrink-0" />
              <div>
                <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Location</p>
                <p className="text-xs font-bold text-white mt-0.5 truncate">{booking.venue || 'Sri Lanka'}</p>
              </div>
            </div>
          </div>

          {/* Attendee & Pass Details */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Ticket Holder</p>
              <p className="text-sm font-black text-white mt-0.5">{booking.attendee_name}</p>
              <p className="text-xs text-white/50 font-mono mt-0.5">{booking.attendee_email}</p>
              {booking.attendee_nic && <p className="text-[11px] text-white/40 font-mono mt-0.5">NIC: {booking.attendee_nic}</p>}
            </div>

            <div className="text-right">
              <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Booking Ref</p>
              <p className="text-sm font-mono font-black text-signal-lime mt-0.5">{booking.booking_ref}</p>
              <p className="text-xs text-white/60 font-bold mt-0.5">
                {booking.tier_label || booking.tier_name} × {booking.quantity}
              </p>
              <p className="text-xs font-bold text-white/40 mt-0.5">LKR {booking.total_amount?.toLocaleString('en-LK')}</p>
            </div>
          </div>

          {/* QR Code Section */}
          <div className="bg-white p-6 rounded-2xl flex flex-col items-center justify-center border border-white/20 text-center shadow-lg">
            <div id={`qr-wrapper-${booking.id || booking.booking_ref}`} className="bg-white p-3 rounded-xl border border-gray-200">
              <QRCode value={qrValue} size={160} />
            </div>
            <p className="text-[11px] font-mono font-bold text-gray-800 mt-3 tracking-widest uppercase">
              SCAN AT ENTRANCE GATE
            </p>
            <p className="text-[10px] text-gray-500 mt-0.5">Present this digital or printed pass for entry scan</p>
          </div>

          {/* Verification Badge */}
          <div className="flex items-center justify-between text-xs text-white/40 border-t border-white/10 pt-4">
            <div className="flex items-center gap-1.5 text-signal-lime font-bold">
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
        <div className="p-4 bg-white/5 border-t border-white/10 flex items-center justify-between gap-4 print-hide">
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
