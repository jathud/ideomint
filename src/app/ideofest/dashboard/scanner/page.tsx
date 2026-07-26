'use client';

import { useState, useEffect, useRef } from 'react';
import { QrCode, Camera, CameraOff, CheckCircle, XCircle, Loader2 } from 'lucide-react';

type ScanResult = {
  success: boolean;
  message?: string;
  data?: { bookingId: string; attendeeName: string; eventTitle: string; ticketTierLabel: string; quantity: number };
  error?: string;
};

export default function ScannerPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [manualCode, setManualCode] = useState('');
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
      alert('Camera access denied. Use manual entry below.');
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
        body: JSON.stringify({ qrPayload: payload }),
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
      <div className="mb-8">
        <h1 className="text-3xl font-black">QR Scanner</h1>
        <p className="text-white/40 text-sm mt-1">Scan attendee tickets at entry gates</p>
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
            <QrCode className="w-16 h-16" />
            <p className="text-sm font-medium">Camera not active</p>
          </div>
        )}
        {/* Corner brackets */}
        {cameraActive && (
          <>
            <div className="absolute top-8 left-8 w-12 h-12 border-t-4 border-l-4 border-creative-flame rounded-tl-xl" />
            <div className="absolute top-8 right-8 w-12 h-12 border-t-4 border-r-4 border-creative-flame rounded-tr-xl" />
            <div className="absolute bottom-8 left-8 w-12 h-12 border-b-4 border-l-4 border-creative-flame rounded-bl-xl" />
            <div className="absolute bottom-8 right-8 w-12 h-12 border-b-4 border-r-4 border-creative-flame rounded-br-xl" />
            <div className="absolute top-1/2 left-8 right-8 h-0.5 bg-creative-flame/60 animate-pulse" />
          </>
        )}
      </div>

      {/* Camera toggle */}
      <button
        onClick={cameraActive ? stopCamera : startCamera}
        className={`w-full flex items-center justify-center gap-3 py-4 rounded-2xl font-bold text-base transition-all mb-6 ${
          cameraActive
            ? 'bg-red-500/15 border border-red-500/30 text-red-400 hover:bg-red-500/25'
            : 'bg-creative-flame hover:bg-[#E54D30] text-white'
        }`}
      >
        {cameraActive ? <><CameraOff className="w-5 h-5" /> Stop Camera</> : <><Camera className="w-5 h-5" /> Start Camera</>}
      </button>

      {/* Manual entry */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6">
        <h2 className="text-base font-bold mb-4">Manual Entry</h2>
        <form onSubmit={handleManual} className="flex gap-3">
          <input
            value={manualCode}
            onChange={(e) => setManualCode(e.target.value)}
            placeholder="IDEOFEST:IDF-XXXXXXXX:slug:tier"
            className="flex-1 bg-white/5 border border-white/12 rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-creative-flame transition-colors font-mono"
          />
          <button
            type="submit"
            disabled={scanning || !manualCode.trim()}
            className="px-5 py-3 bg-creative-flame hover:bg-[#E54D30] disabled:opacity-40 text-white font-bold rounded-xl transition-colors flex items-center gap-2"
          >
            {scanning ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Scan'}
          </button>
        </form>
      </div>

      {/* Result */}
      {result && (
        <div className={`rounded-2xl p-6 border ${result.success ? 'bg-signal-lime/10 border-signal-lime/30' : 'bg-red-500/10 border-red-500/30'}`}>
          <div className="flex items-center gap-3 mb-4">
            {result.success ? (
              <CheckCircle className="w-8 h-8 text-signal-lime" />
            ) : (
              <XCircle className="w-8 h-8 text-red-400" />
            )}
            <div>
              <p className={`font-black text-lg ${result.success ? 'text-signal-lime' : 'text-red-400'}`}>
                {result.success ? 'Check-in Successful!' : 'Check-in Failed'}
              </p>
              <p className="text-white/50 text-sm">{result.message || result.error}</p>
            </div>
          </div>
          {result.success && result.data && (
            <div className="grid grid-cols-2 gap-3 text-sm">
              {[
                ['Attendee', result.data.attendeeName],
                ['Event', result.data.eventTitle],
                ['Ticket', result.data.ticketTierLabel],
                ['Quantity', String(result.data.quantity)],
              ].map(([k, v]) => (
                <div key={k}>
                  <p className="text-white/40 text-xs uppercase tracking-widest">{k}</p>
                  <p className="text-white font-semibold">{v}</p>
                </div>
              ))}
            </div>
          )}
          <button onClick={resetResult} className="w-full mt-4 py-2.5 border border-white/15 rounded-xl text-sm font-semibold text-white/60 hover:text-white transition-colors">
            Scan Next
          </button>
        </div>
      )}
    </div>
  );
}
