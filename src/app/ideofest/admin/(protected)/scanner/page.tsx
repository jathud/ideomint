'use client';

import { useState, useEffect, useRef } from 'react';
import jsQR from 'jsqr';
import { QrCode, Camera, CameraOff, CheckCircle, XCircle, Loader2, ShieldCheck, Users, Ticket, RefreshCw, UserCheck, Phone, FileText } from 'lucide-react';

type AttendeeItem = {
  index: number;
  role: string;
  name: string;
  nic: string;
  phone: string;
};

type ScanResult = {
  success: boolean;
  message?: string;
  result?: string;
  data?: {
    bookingId?: string;
    attendeeName?: string;
    attendee_name?: string;
    attendee_email?: string;
    attendee_nic?: string;
    attendee_phone?: string;
    eventTitle?: string;
    event_title?: string;
    ticketTierLabel?: string;
    tier_label?: string;
    quantity?: number;
    totalQty?: number;
    checkedIn?: number;
    remaining?: number;
    quantity_checked_in?: number;
    ticket_number?: string;
    booking_ref?: string;
    pass_index?: number;
    all_attendees?: AttendeeItem[];
  };
  error?: string;
};

export default function AdminScannerPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameIdRef = useRef<number | null>(null);
  const isScanningRef = useRef<boolean>(false);
  const cooldownRef = useRef<boolean>(false);
  const cameraActiveRef = useRef<boolean>(false);

  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [manualCode, setManualCode] = useState('');
  const [checkInQty, setCheckInQty] = useState<number>(1);
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);

  // Process scanned or manual payload
  const processPayload = async (payload: string, overrideQty?: number) => {
    if (!payload.trim() || (cooldownRef.current && !overrideQty) || isScanningRef.current) return;

    isScanningRef.current = true;
    cooldownRef.current = true;
    setScanning(true);
    setResult(null);

    // Beep / haptic vibration if supported
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      try { navigator.vibrate(100); } catch { /* ignore */ }
    }

    try {
      const res = await fetch('/api/ideofest/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          qr_token: payload,
          check_in_qty: overrideQty || checkInQty,
        }),
      });
      const data = await res.json();
      setResult(data);
    } catch {
      setResult({ success: false, error: 'Network error. Please try again.' });
    } finally {
      setScanning(false);
      isScanningRef.current = false;
      setTimeout(() => {
        cooldownRef.current = false;
      }, 2500);
    }
  };

  // Continuous QR Code Frame Reader Loop using jsQR
  const tick = () => {
    if (!cameraActiveRef.current) return;

    if (videoRef.current && videoRef.current.readyState >= videoRef.current.HAVE_ENOUGH_DATA) {
      const canvas = canvasRef.current;
      if (!canvas) {
        animFrameIdRef.current = requestAnimationFrame(tick);
        return;
      }
      const ctx = canvas.getContext('2d', { willReadFrequently: true });

      if (ctx) {
        canvas.height = videoRef.current.videoHeight;
        canvas.width = videoRef.current.videoWidth;
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: 'dontInvert',
        });

        if (code && code.data && !cooldownRef.current && !isScanningRef.current) {
          console.log('[QR Detected]:', code.data);
          processPayload(code.data);
        }
      }
    }

    animFrameIdRef.current = requestAnimationFrame(tick);
  };

  const startCamera = async () => {
    setCameraError(null);
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        setCameraError('Camera API not available. Load over HTTPS or localhost.');
        return;
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        try {
          await videoRef.current.play();
        } catch {
          videoRef.current.muted = true;
          await videoRef.current.play();
        }
        cameraActiveRef.current = true;
        setCameraActive(true);
        animFrameIdRef.current = requestAnimationFrame(tick);
      }
    } catch (err: any) {
      setCameraError(`Camera error: ${err?.message || 'Access denied'}. Enter ticket ID below.`);
    }
  };

  const stopCamera = () => {
    cameraActiveRef.current = false;
    setCameraActive(false);
    if (animFrameIdRef.current) {
      cancelAnimationFrame(animFrameIdRef.current);
      animFrameIdRef.current = null;
    }
    const stream = videoRef.current?.srcObject as MediaStream;
    stream?.getTracks().forEach((t) => t.stop());
    if (videoRef.current) videoRef.current.srcObject = null;
  };

  useEffect(() => {
    return () => {
      cameraActiveRef.current = false;
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
    };
  }, []);

  const handleManual = (e: React.FormEvent) => {
    e.preventDefault();
    processPayload(manualCode);
  };

  const resetResult = () => {
    setResult(null);
    setManualCode('');
    cooldownRef.current = false;
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center gap-2 bg-[#c1e527]/15 border border-[#c1e527]/30 px-3.5 py-1 rounded-full mb-3">
          <ShieldCheck className="w-3.5 h-3.5 text-[#c1e527]" />
          <span className="text-[10px] font-extrabold text-[#c1e527] tracking-widest uppercase">
            Official Gate Terminal
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black">Gate QR Scanner</h1>
        <p className="text-white/40 text-xs sm:text-sm mt-1">Scan QR codes and manage group attendee gate entry</p>
      </div>

      {/* Attendees Arriving Now Selector */}
      <div className="bg-white/4 border border-white/10 rounded-2xl p-4 sm:p-5 backdrop-blur-md">
        <div className="flex items-center justify-between gap-2 mb-3">
          <label className="text-xs font-extrabold text-white/70 uppercase tracking-widest flex items-center gap-2">
            <Users className="w-4 h-4 text-[#c1e527]" />
            How many attendees arriving now?
          </label>
          <span className="text-xs font-mono font-bold text-[#c1e527] bg-[#c1e527]/10 px-2.5 py-0.5 rounded-full border border-[#c1e527]/20">
            Admit {checkInQty} Person{checkInQty > 1 ? 's' : ''}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div className="grid grid-cols-4 gap-2 flex-1">
            {[1, 2, 3, 4].map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => setCheckInQty(num)}
                className={`py-2.5 rounded-xl font-black text-xs transition-all border ${
                  checkInQty === num
                    ? 'bg-[#c1e527] text-section-ink border-[#c1e527] shadow-lg'
                    : 'bg-white/5 text-white/70 border-white/10 hover:border-white/25 hover:text-white'
                }`}
              >
                {num} {num === 1 ? 'Person' : 'People'}
              </button>
            ))}
          </div>

          <div className="w-16 sm:w-20">
            <input
              type="number"
              min={1}
              max={50}
              value={checkInQty}
              onChange={(e) => setCheckInQty(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-full bg-white/5 border border-white/12 rounded-xl px-2 py-2 text-center text-xs sm:text-sm font-bold text-white focus:outline-none focus:border-[#c1e527]"
            />
          </div>
        </div>
      </div>

      {/* Hidden Canvas */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Camera Viewfinder */}
      <div className="relative w-full aspect-square max-h-[360px] rounded-3xl bg-black/60 border border-white/15 overflow-hidden flex items-center justify-center shadow-2xl">
        <video
          ref={videoRef}
          className={`absolute inset-0 w-full h-full object-cover ${cameraActive ? 'opacity-100' : 'opacity-0'}`}
          playsInline
          muted
        />

        {!cameraActive && (
          <div className="flex flex-col items-center gap-3 text-white/40 p-6 text-center">
            <QrCode className="w-16 h-16 text-[#c1e527]/60" />
            <p className="text-sm font-bold text-white">Camera Scanner Terminal Inactive</p>
            <p className="text-xs text-white/50">Click "Start Camera Scanner" below or enter ticket ID manually</p>
          </div>
        )}

        {cameraActive && (
          <>
            <div className="absolute top-6 left-6 w-10 h-10 border-t-4 border-l-4 border-[#c1e527] rounded-tl-xl" />
            <div className="absolute top-6 right-6 w-10 h-10 border-t-4 border-r-4 border-[#c1e527] rounded-tr-xl" />
            <div className="absolute bottom-6 left-6 w-10 h-10 border-b-4 border-l-4 border-[#c1e527] rounded-bl-xl" />
            <div className="absolute bottom-6 right-6 w-10 h-10 border-b-4 border-r-4 border-[#c1e527] rounded-br-xl" />
            <div className="absolute top-1/2 left-6 right-6 h-0.5 bg-[#c1e527] shadow-[0_0_15px_#c1e527] animate-pulse" />
          </>
        )}

        {scanning && (
          <div className="absolute inset-0 bg-black/75 backdrop-blur-sm flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-10 h-10 text-[#c1e527] animate-spin" />
            <p className="text-xs font-extrabold text-[#c1e527] tracking-widest uppercase">Validating Ticket...</p>
          </div>
        )}
      </div>

      <button
        onClick={cameraActive ? stopCamera : startCamera}
        className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-black text-sm transition-all shadow-lg ${
          cameraActive
            ? 'bg-red-500/15 border border-red-500/30 text-red-400 hover:bg-red-500/25'
            : 'bg-gradient-to-r from-[#c1e527] to-[#d4ff33] hover:from-[#b0d420] hover:to-[#c1e527] text-section-ink'
        }`}
      >
        {cameraActive ? <><CameraOff className="w-5 h-5" /> Stop Camera</> : <><Camera className="w-5 h-5" /> Start Live Camera Scanner</>}
      </button>

      {cameraError && !cameraActive && (
        <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/30 rounded-2xl p-4">
          <CameraOff className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
          <div className="text-xs text-white/70">{cameraError}</div>
        </div>
      )}

      {/* Scan Result Feedback Card with All Attendees Breakdown */}
      {result && (
        <div className={`p-6 rounded-3xl border space-y-4 backdrop-blur-xl transition-all ${
          result.success
            ? 'bg-[#c1e527]/15 border-[#c1e527] shadow-[0_0_30px_rgba(193,229,39,0.2)]'
            : result.result === 'duplicate'
            ? 'bg-amber-500/15 border-amber-500/40'
            : 'bg-red-500/15 border-red-500/40'
        }`}>
          <div className="flex items-start gap-4">
            <div className={`p-3 rounded-2xl shrink-0 ${
              result.success ? 'bg-[#c1e527] text-section-ink' : result.result === 'duplicate' ? 'bg-amber-500 text-black' : 'bg-red-500 text-white'
            }`}>
              {result.success ? <CheckCircle className="w-6 h-6" /> : <XCircle className="w-6 h-6" />}
            </div>

            <div className="flex-1">
              <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full ${
                result.success ? 'bg-[#c1e527]/20 text-[#c1e527]' : result.result === 'duplicate' ? 'bg-amber-500/20 text-amber-400' : 'bg-red-500/20 text-red-400'
              }`}>
                {result.result === 'valid' ? 'VALID PASS — GATE PASSED ✓' : result.result === 'duplicate' ? 'DUPLICATE / FULLY ADMITTED' : 'ACCESS DENIED'}
              </span>

              <h3 className="text-lg font-black text-white mt-1">
                {result.data?.attendee_name || result.data?.attendeeName || 'Gate Terminal Result'}
              </h3>

              <p className="text-xs text-white/80 mt-1 leading-relaxed">
                {result.message || result.error}
              </p>

              {/* Group Check-in Summary Stats */}
              {result.data && (
                <div className="mt-3 pt-3 border-t border-white/10 grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="bg-white/5 p-2 rounded-xl">
                    <span className="text-[10px] text-white/40 block uppercase font-bold">Total Group</span>
                    <span className="font-extrabold text-white text-sm">{result.data.totalQty || 1} Pass(es)</span>
                  </div>
                  <div className="bg-emerald-500/15 border border-emerald-500/30 p-2 rounded-xl">
                    <span className="text-[10px] text-emerald-400 block uppercase font-bold">Admitted</span>
                    <span className="font-extrabold text-emerald-300 text-sm">{result.data.checkedIn || 1} Checked In</span>
                  </div>
                  <div className="bg-amber-500/15 border border-amber-500/30 p-2 rounded-xl">
                    <span className="text-[10px] text-amber-400 block uppercase font-bold">Remaining</span>
                    <span className="font-extrabold text-amber-300 text-sm">{result.data.remaining || 0} Left</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ALL ATTENDEES FULL DETAILS BREAKDOWN */}
          {result.data?.all_attendees && result.data.all_attendees.length > 0 && (
            <div className="bg-black/40 border border-white/12 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <span className="text-xs font-black text-[#c1e527] uppercase tracking-wider flex items-center gap-1.5">
                  <Users className="w-4 h-4" /> All Attendee Details ({result.data.all_attendees.length})
                </span>
                <span className="text-[10px] text-white/40">Group Pass breakdown</span>
              </div>

              <div className="space-y-2.5">
                {result.data.all_attendees.map((att) => (
                  <div key={att.index} className="bg-white/5 border border-white/8 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono font-bold text-[#c1e527] bg-[#c1e527]/10 px-2 py-0.5 rounded-full border border-[#c1e527]/20">
                          {att.role}
                        </span>
                        <strong className="text-white text-sm">{att.name}</strong>
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-[11px] text-white/50 font-mono">
                        {att.nic && att.nic !== '—' && <span>NIC: {att.nic}</span>}
                        {att.phone && att.phone !== '—' && <span>Tel: {att.phone}</span>}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {att.index <= (result.data?.checkedIn || 0) ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-1 rounded-full">
                          <UserCheck className="w-3 h-3" /> Admitted ✓
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-400 bg-amber-500/15 border border-amber-500/30 px-2.5 py-1 rounded-full">
                          Pending Entry ⏳
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Incremental Check-In Action for Remaining Attendees */}
          {result.data?.remaining && result.data.remaining > 0 && result.data.booking_ref && (
            <div className="bg-white/5 border border-white/12 rounded-2xl p-4 space-y-3">
              <span className="text-xs font-bold text-white/80 block">
                Arriving with more group members right now? Select count to admit:
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => processPayload(result.data?.ticket_number || result.data?.booking_ref || '', result.data?.remaining)}
                  className="flex-1 bg-[#c1e527] hover:bg-[#b0d420] text-section-ink font-black py-3 rounded-xl text-xs transition-all shadow-md"
                >
                  Admit All Remaining {result.data.remaining} Person(s) Now →
                </button>
              </div>
            </div>
          )}

          <button
            onClick={resetResult}
            className="w-full flex items-center justify-center gap-2 bg-white/10 hover:bg-white/15 text-white py-3 rounded-xl text-xs font-extrabold transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Scan Next Ticket
          </button>
        </div>
      )}

      {/* Manual Ticket Entry */}
      <form onSubmit={handleManual} className="bg-white/4 border border-white/10 rounded-3xl p-5 backdrop-blur-md space-y-3">
        <label htmlFor="manualCodeInput" className="block text-xs font-black text-white/60 uppercase tracking-wider">
          Or Enter Ticket ID / Booking Reference
        </label>
        <div className="flex gap-2">
          <input
            id="manualCodeInput"
            type="text"
            value={manualCode}
            onChange={(e) => setManualCode(e.target.value)}
            placeholder="e.g. IDF-TKT-XXXXXX or IDF-XXXXXXXX"
            className="flex-1 bg-white/5 border border-white/12 rounded-xl px-4 py-3 text-white placeholder-white/30 text-xs sm:text-sm font-mono focus:outline-none focus:border-[#c1e527]"
          />
          <button
            type="submit"
            disabled={!manualCode.trim() || scanning}
            className="bg-[#c1e527] hover:bg-[#b0d420] disabled:opacity-40 text-section-ink font-black px-5 py-3 rounded-xl text-xs sm:text-sm transition-all shrink-0"
          >
            {scanning ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Scan Pass'}
          </button>
        </div>
      </form>
    </div>
  );
}
