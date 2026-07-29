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
    const printWin = window.open('', '_blank', 'width=700,height=900');
    if (!printWin) {
      window.print();
      return;
    }

    const qrValue = (booking as any).qr_token || booking.booking_ref || `IDEOFEST:${booking.id}`;
    const dateFormatted = formatDate(booking.event_date);
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
          <title>Ideofest Ticket Pass - ${booking.booking_ref}</title>
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
                <span class="badge">Official Ticket Bill</span>
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

  const isConfirmed = booking.status === 'confirmed' || booking.payment_status === 'paid';
  const qrPayload = (booking as any).qr_token || booking.booking_ref;

  return (
    <div 
      id={`qr-ticket-card-${booking.id || booking.booking_ref}`}
      className="printable-ticket-card bg-[#0B0D14] border border-white/15 rounded-3xl overflow-hidden max-w-sm w-full shadow-2xl relative"
    >
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

          {/* Group Pass Members Breakdown (for 2, 3, 4+ passes) */}
          {booking.quantity > 1 && (
            <div className="pt-2.5 border-t border-white/8 print:border-gray-200">
              <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest print:text-gray-500 mb-1.5">
                Group Pass Members ({booking.quantity} Total Passes)
              </p>
              <div className="space-y-1.5">
                {/* Attendee 1 (Lead Booker) */}
                <div className="flex items-center justify-between text-[11px] bg-white/5 print:bg-gray-100 px-2.5 py-1 rounded-lg">
                  <span className="font-bold text-white print:text-black">1. {booking.attendee_name} (Lead)</span>
                  <span className="font-mono text-white/50 print:text-gray-600 text-[10px]">{booking.attendee_nic || '—'}</span>
                </div>
                {/* Additional Attendees (Attendee 2, 3, 4...) */}
                {Array.isArray(booking.additional_attendees) && booking.additional_attendees.map((extra, idx) => (
                  <div key={idx} className="flex items-center justify-between text-[11px] bg-white/5 print:bg-gray-100 px-2.5 py-1 rounded-lg">
                    <span className="font-bold text-white/90 print:text-black">{idx + 2}. {extra.name || `Attendee ${idx + 2}`}</span>
                    <span className="font-mono text-white/50 print:text-gray-600 text-[10px]">{extra.nic || '—'}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
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
