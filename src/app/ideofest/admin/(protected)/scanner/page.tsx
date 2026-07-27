'use client';

import { useState, useEffect, useRef } from 'react';
import { QrCode, Camera, CameraOff, CheckCircle, XCircle, Loader2, ShieldCheck, Users, Ticket } from 'lucide-react';

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
  };
  error?: string;
};

export default function AdminScannerPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [manualCode, setManualCode] = useState('');
  const [checkInQty, setCheckInQty] = useState<number>(1);
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setCameraActive(true);
      }
    } catch {
      alert('Camera access denied or unavailable. Use manual entry below.');
    }
  };

  const stopCamera = () => {
    const stream = videoRef.current?.srcObject as MediaStream;
    stream?.getTracks().forEach((t) => t.stop());
    if (videoRef.current) videoRef.current.srcObject = null;
    setCameraActive(false);
  };

  useEffect(() => () => stopCamera(), []);

  const processPayload = async (payload: string) => {
    if (!payload.trim()) return;
    setScanning(true);
    setResult(null);
    try {
      const res = await fetch('/api/ideofest/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          qrPayload: payload,
          check_in_qty: checkInQty,
        }),
      });
      const data = await res.json();
      setResult(data);
    } catch {
      setResult({ success: false, error: 'Network error. Try again.' });
    } finally {
      setScanning(false);
    }
  };

  const handleManual = (e: React.FormEvent) => {
    e.preventDefault();
    processPayload(manualCode);
  };

  const resetResult = () => {
    setResult(null);
    setManualCode('');
  };

  return (
    <div className="max-w-lg mx-auto">
      <div className="mb-8 text-center">
        <div className="inline-flex items-center gap-2 bg-signal-lime/15 border border-signal-lime/30 px-3.5 py-1 rounded-full mb-3">
          <ShieldCheck className="w-3.5 h-3.5 text-signal-lime" />
          <span className="text-[10px] font-bold text-signal-lime tracking-widest uppercase">
            Official Gate Terminal
          </span>
        </div>
        <h1 className="text-3xl font-black">Gate QR Scanner</h1>
        <p className="text-white/40 text-sm mt-1">Scan or validate attendee QR tickets at entrance gates</p>
      </div>

      {/* ── Attendees Count Selector ── */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-5 mb-6">
        <div className="flex items-center justify-between gap-2 mb-3">
          <label className="text-xs font-bold text-white/70 uppercase tracking-widest flex items-center gap-2">
            <Users className="w-4 h-4 text-signal-lime" />
            Attendees Arriving Now
          </label>
          <span className="text-xs font-mono font-bold text-signal-lime bg-signal-lime/10 px-2.5 py-0.5 rounded-full border border-signal-lime/20">
            {checkInQty} Person{checkInQty > 1 ? 's' : ''}
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Preset buttons */}
          <div className="grid grid-cols-4 gap-2 flex-1">
            {[1, 2, 3, 4].map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => setCheckInQty(num)}
                className={`py-2.5 rounded-xl font-black text-xs transition-all border ${
                  checkInQty === num
                    ? 'bg-signal-lime text-section-ink border-signal-lime shadow-lg shadow-signal-lime/10'
                    : 'bg-white/5 text-white/70 border-white/10 hover:border-white/25 hover:text-white'
                }`}
              >
                {num} {num === 1 ? 'Person' : 'People'}
              </button>
            ))}
          </div>

          {/* Number input for custom count */}
          <div className="w-20">
            <input
              type="number"
              min={1}
              max={50}
              value={checkInQty}
              onChange={(e) => setCheckInQty(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-full bg-white/5 border border-white/12 rounded-xl px-3 py-2 text-center text-sm font-bold text-white focus:outline-none focus:border-signal-lime"
              title="Custom check-in quantity"
            />
          </div>
        </div>
      </div>

      {/* Camera viewfinder */}
      <div className="relative w-full aspect-square rounded-3xl bg-white/5 border border-white/12 overflow-hidden mb-6 flex items-center justify-center">
        <video
          ref={videoRef}
          className={`absolute inset-0 w-full h-full object-cover ${cameraActive ? 'opacity-100' : 'opacity-0'}`}
          playsInline
          muted
        />
        {!cameraActive && (
          <div className="flex flex-col items-center gap-4 text-white/40">
            <QrCode className="w-16 h-16 text-signal-lime/60" />
            <p className="text-sm font-medium">Camera terminal inactive</p>
          </div>
        )}
        {/* Corner brackets */}
        {cameraActive && (
          <>
            <div className="absolute top-8 left-8 w-12 h-12 border-t-4 border-l-4 border-signal-lime rounded-tl-xl" />
            <div className="absolute top-8 right-8 w-12 h-12 border-t-4 border-r-4 border-signal-lime rounded-tr-xl" />
            <div className="absolute bottom-8 left-8 w-12 h-12 border-b-4 border-l-4 border-signal-lime rounded-bl-xl" />
            <div className="absolute bottom-8 right-8 w-12 h-12 border-b-4 border-r-4 border-signal-lime rounded-br-xl" />
            <div className="absolute top-1/2 left-8 right-8 h-0.5 bg-signal-lime/60 animate-pulse" />
          </>
        )}
      </div>

      {/* Camera toggle */}
      <button
        onClick={cameraActive ? stopCamera : startCamera}
        className={`w-full flex items-center justify-center gap-3 py-4 rounded-2xl font-black text-base transition-all mb-6 ${
          cameraActive
            ? 'bg-red-500/15 border border-red-500/30 text-red-400 hover:bg-red-500/25'
            : 'bg-signal-lime hover:bg-[#b0d420] text-section-ink'
        }`}
      >
        {cameraActive ? <><CameraOff className="w-5 h-5" /> Stop Terminal Camera</> : <><Camera className="w-5 h-5" /> Start Gate Camera</>}
      </button>

      {/* Manual entry */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6">
        <h2 className="text-base font-bold mb-4">Manual Ticket / Ref Verification</h2>
        <form onSubmit={handleManual} className="flex gap-3">
          <input
            value={manualCode}
            onChange={(e) => setManualCode(e.target.value)}
            placeholder="IDF-XXXXXXXX or IDF-TKT-XXXXXXXX"
            className="flex-1 bg-white/5 border border-white/12 rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-signal-lime transition-colors font-mono"
          />
          <button
            type="submit"
            disabled={scanning || !manualCode.trim()}
            className="px-5 py-3 bg-signal-lime hover:bg-[#b0d420] disabled:opacity-40 text-section-ink font-black rounded-xl transition-colors flex items-center gap-2"
          >
            {scanning ? <Loader2 className="w-4 h-4 animate-spin text-section-ink" /> : 'Validate'}
          </button>
        </form>
      </div>

      {/* Result */}
      {result && (
        <div className={`rounded-2xl p-6 border ${result.success ? 'bg-signal-lime/15 border-signal-lime/40' : 'bg-red-500/15 border-red-500/40'}`}>
          <div className="flex items-center gap-3 mb-4">
            {result.success ? (
              <CheckCircle className="w-8 h-8 text-signal-lime shrink-0" />
            ) : (
              <XCircle className="w-8 h-8 text-red-400 shrink-0" />
            )}
            <div>
              <p className={`font-black text-lg ${result.success ? 'text-signal-lime' : 'text-red-400'}`}>
                {result.success ? 'Gate Access Granted! 🎉' : 'Access Denied'}
              </p>
              <p className="text-white/80 text-sm font-bold mt-0.5">{result.message || result.error}</p>
            </div>
          </div>

          {result.success && result.data && (
            <div className="grid grid-cols-2 gap-3 text-sm bg-black/30 p-4 rounded-xl border border-white/10">
              {[
                ['Attendee', result.data.attendeeName || result.data.attendee_name || 'Attendee'],
                ['Event', result.data.eventTitle || result.data.event_title || 'Ideofest Event'],
                ['Ticket Tier', result.data.ticketTierLabel || result.data.tier_label || 'Standard'],
                ['Checked In Batch', `${result.data.checkInCount || checkInQty} Person(s)`],
                ['Total Checked In', `${result.data.newTotalCheckedIn || result.data.quantity} / ${result.data.quantity}`],
                ['Remaining', `${result.data.remainingAfterScan ?? 0} Ticket(s)`],
              ].map(([k, v]) => (
                <div key={k}>
                  <p className="text-white/40 text-[10px] uppercase tracking-widest">{k}</p>
                  <p className="text-white font-bold">{v}</p>
                </div>
              ))}
            </div>
          )}

          <button onClick={resetResult} className="w-full mt-4 py-3 bg-white/10 hover:bg-white/20 border border-white/15 rounded-xl text-sm font-bold text-white transition-colors">
            Scan Next Attendee
          </button>
        </div>
      )}
    </div>
  );
}
