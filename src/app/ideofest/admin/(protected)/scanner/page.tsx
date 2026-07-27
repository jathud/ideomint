'use client';

import { useState, useEffect, useRef } from 'react';
import jsQR from 'jsqr';
import { QrCode, Camera, CameraOff, CheckCircle, XCircle, Loader2, ShieldCheck, Users, Ticket, RefreshCw, Zap } from 'lucide-react';

type ScanResult = {
  success: boolean;
  message?: string;
  result?: string;
  data?: {
    bookingId?: string;
    attendeeName?: string;
    attendee_name?: string;
    eventTitle?: string;
    event_title?: string;
    ticketTierLabel?: string;
    tier_label?: string;
    quantity?: number;
    checkInCount?: number;
    newTotalCheckedIn?: number;
    remainingAfterScan?: number;
    ticket_number?: string;
    booking_ref?: string;
    pass_index?: number;
    attendee_nic?: string;
    attendee_phone?: string;
  };
  error?: string;
};

export default function AdminScannerPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameIdRef = useRef<number | null>(null);
  const isScanningRef = useRef<boolean>(false);
  const cooldownRef = useRef<boolean>(false);
  const cameraActiveRef = useRef<boolean>(false); // ref so tick() never captures stale closure

  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [manualCode, setManualCode] = useState('');
  const [checkInQty, setCheckInQty] = useState<number>(1);
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);

  // Process scanned or manual payload
  const processPayload = async (payload: string) => {
    if (!payload.trim() || cooldownRef.current || isScanningRef.current) return;

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
          check_in_qty: checkInQty,
        }),
      });
      const data = await res.json();
      setResult(data);
    } catch {
      setResult({ success: false, error: 'Network error. Please try again.' });
    } finally {
      setScanning(false);
      isScanningRef.current = false;
      // 2.5s cooldown before next auto scan
      setTimeout(() => {
        cooldownRef.current = false;
      }, 2500);
    }
  };

  // Continuous QR Code Frame Reader Loop using jsQR
  const tick = () => {
    if (!cameraActiveRef.current) return; // stop if camera was deactivated

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
        setCameraError('Camera API not available. Make sure this page is loaded over HTTPS or localhost.');
        return;
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        // play() can throw NotAllowedError if browser blocks autoplay — catch separately
        try {
          await videoRef.current.play();
        } catch (playErr: any) {
          // Some browsers need a user gesture to play; stream is fine, just try muted play
          videoRef.current.muted = true;
          await videoRef.current.play();
        }
        cameraActiveRef.current = true;
        setCameraActive(true);
        animFrameIdRef.current = requestAnimationFrame(tick);
      }
    } catch (err: any) {
      const name = err?.name || '';
      if (name === 'NotAllowedError' || name === 'PermissionDeniedError') {
        setCameraError(
          'Camera permission was denied. Please click the camera icon in your browser\'s address bar, allow camera access, then try again.'
        );
      } else if (name === 'NotFoundError' || name === 'DevicesNotFoundError') {
        setCameraError('No camera found on this device. Use manual ticket entry below.');
      } else if (name === 'NotReadableError' || name === 'TrackStartError') {
        setCameraError('Camera is already in use by another app. Close other apps using the camera and try again.');
      } else if (name === 'OverconstrainedError') {
        // Retry with relaxed constraints
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true });
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.muted = true;
            await videoRef.current.play();
            cameraActiveRef.current = true;
            setCameraActive(true);
            animFrameIdRef.current = requestAnimationFrame(tick);
          }
          return;
        } catch {
          setCameraError('Camera constraints not supported. Try a different browser or device.');
        }
      } else {
        setCameraError(`Camera error: ${err?.message || 'Unknown error'}. Use manual ticket entry below.`);
      }
      console.error('[Camera Error]', err);
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

  // cameraActive state just drives the UI; actual loop control is via cameraActiveRef
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
        <p className="text-white/40 text-xs sm:text-sm mt-1">Scan or validate attendee QR tickets at entrance gates</p>
      </div>

      {/* Attendees Count Selector */}
      <div className="bg-white/4 border border-white/10 rounded-2xl p-4 sm:p-5 backdrop-blur-md">
        <div className="flex items-center justify-between gap-2 mb-3">
          <label className="text-xs font-extrabold text-white/70 uppercase tracking-widest flex items-center gap-2">
            <Users className="w-4 h-4 text-[#c1e527]" />
            Attendees Arriving Now
          </label>
          <span className="text-xs font-mono font-bold text-[#c1e527] bg-[#c1e527]/10 px-2.5 py-0.5 rounded-full border border-[#c1e527]/20">
            {checkInQty} Person{checkInQty > 1 ? 's' : ''}
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

      {/* Hidden Canvas for QR Frame Processing */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Camera Viewfinder Box */}
      <div className="relative w-full aspect-square max-h-[380px] rounded-3xl bg-black/60 border border-white/15 overflow-hidden flex items-center justify-center shadow-2xl">
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

        {/* Scanning laser animation */}
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
        {cameraActive ? (
          <><CameraOff className="w-5 h-5" /> Stop Camera</>
        ) : (
          <><Camera className="w-5 h-5" /> Start Live Camera Scanner</>
        )}
      </button>

      {/* Camera Permission Error Card */}
      {cameraError && !cameraActive && (
        <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/30 rounded-2xl p-4">
          <div className="p-2 bg-red-500/20 rounded-xl shrink-0 mt-0.5">
            <CameraOff className="w-4 h-4 text-red-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-red-400 mb-1">Camera Unavailable</p>
            <p className="text-xs text-white/60 leading-relaxed">{cameraError}</p>
            {cameraError.includes('permission') && (
              <ol className="mt-2 text-[10px] text-white/40 space-y-0.5 list-decimal list-inside">
                <li>Click the 🔒 lock / camera icon in your browser address bar</li>
                <li>Set Camera to <strong className="text-white/60">Allow</strong></li>
                <li>Refresh the page and try again</li>
              </ol>
            )}
            <button
              onClick={startCamera}
              className="mt-3 flex items-center gap-1.5 bg-white/10 hover:bg-white/15 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg transition-all"
            >
              <RefreshCw className="w-3 h-3" /> Retry Camera
            </button>
          </div>
        </div>
      )}

      {/* Scan Result Feedback Card */}
      {result && (
        <div className={`p-6 rounded-3xl border transition-all ${
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
                {result.result === 'valid' ? 'VALID TICKET' : result.result === 'duplicate' ? 'DUPLICATE SCAN' : 'ACCESS DENIED'}
              </span>

              <h3 className="text-lg font-black text-white mt-1">
                {result.data?.attendee_name || result.data?.attendeeName || 'Gate Scanner Result'}
              </h3>

              <p className="text-xs text-white/80 mt-1 leading-relaxed">
                {result.message || result.error}
              </p>

              {result.data && (
                <div className="mt-4 pt-3 border-t border-white/10 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-white/40 block text-[10px]">Pass Reference</span>
                    <span className="font-mono text-white font-bold">{result.data.ticket_number || result.data.booking_ref || '—'}</span>
                  </div>
                  <div>
                    <span className="text-white/40 block text-[10px]">Pass Tier</span>
                    <span className="text-white font-bold">{result.data.tier_label || 'Standard'}</span>
                  </div>
                  <div>
                    <span className="text-white/40 block text-[10px]">NIC Number</span>
                    <span className="text-white font-bold">{result.data.attendee_nic || '—'}</span>
                  </div>
                  <div>
                    <span className="text-white/40 block text-[10px]">Gate Status</span>
                    <span className="text-[#c1e527] font-bold">Passed Gate ✓</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          <button
            onClick={resetResult}
            className="mt-4 w-full flex items-center justify-center gap-2 bg-white/10 hover:bg-white/15 text-white py-2.5 rounded-xl text-xs font-extrabold transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Next Scan
          </button>
        </div>
      )}

      {/* Manual Ticket Ref Input */}
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
            placeholder="e.g. IDF-TKT-XXXXXX or IDF-1B5534C5"
            className="flex-1 bg-white/5 border border-white/12 rounded-xl px-4 py-3 text-white placeholder-white/30 text-xs sm:text-sm font-mono focus:outline-none focus:border-[#c1e527]"
          />
          <button
            type="submit"
            disabled={!manualCode.trim() || scanning}
            className="bg-[#c1e527] hover:bg-[#b0d420] disabled:opacity-40 text-section-ink font-black px-5 py-3 rounded-xl text-xs sm:text-sm transition-all shrink-0"
          >
            {scanning ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Scan'}
          </button>
        </div>
      </form>
    </div>
  );
}
