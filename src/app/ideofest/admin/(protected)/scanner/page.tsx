'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import jsQR from 'jsqr';
import {
  QrCode, Camera, CameraOff, CheckCircle, XCircle, Loader2, ShieldCheck,
  Users, Ticket, RefreshCw, UserCheck, Phone, FileText, Search, Download, Calendar, Clock, Filter, RotateCcw
} from 'lucide-react';
import type { IEvent } from '@/lib/ideofest/types';

type AttendeeItem = {
  index: number;
  role: string;
  name: string;
  nic: string;
  phone: string;
};

type TicketInspection = {
  bookingId?: string;
  ticketId?: string;
  ticket_number?: string;
  booking_ref?: string;
  attendee_name?: string;
  attendee_email?: string;
  attendee_nic?: string;
  attendee_phone?: string;
  event_title?: string;
  event_id?: string;
  tier_label?: string;
  totalQty?: number;
  checkedIn?: number;
  remaining?: number;
  status?: string;
  all_attendees?: AttendeeItem[];
};

type ScanResult = {
  success: boolean;
  message?: string;
  result?: string;
  data?: TicketInspection & {
    quantity_checked_in?: number;
    scanned_at?: string;
    gate?: string;
  };
  error?: string;
};

export default function AdminScannerPage() {
  const [activeTab, setActiveTab] = useState<'scanner' | 'attended'>('scanner');

  // Scanner state
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
  const [inspecting, setInspecting] = useState(false);
  const [inspection, setInspection] = useState<TicketInspection | null>(null);
  const [result, setResult] = useState<ScanResult | null>(null);

  // Attended List State
  const [events, setEvents] = useState<IEvent[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>('all');
  const [attendedLogs, setAttendedLogs] = useState<any[]>([]);
  const [loadingAttended, setLoadingAttended] = useState<boolean>(false);
  const [attendedSearch, setAttendedSearch] = useState<string>('');

  // Fetch events on mount
  useEffect(() => {
    async function loadEvents() {
      try {
        const res = await fetch('/api/ideofest/events?status=all');
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          setEvents(json.data);
        }
      } catch (err) {
        console.error('Failed to load events:', err);
      }
    }
    loadEvents();
  }, []);

  // Fetch Attended List logs on mount and when eventId changes
  useEffect(() => {
    let active = true;

    async function fetchAttendedLogs() {
      setLoadingAttended(true);
      try {
        const url = `/api/ideofest/scan?action=attended_list&event_id=${encodeURIComponent(selectedEventId)}`;
        const res = await fetch(url);
        const json = await res.json();
        if (active && json.success && Array.isArray(json.data)) {
          setAttendedLogs(json.data);
        }
      } catch (err) {
        console.error('Failed to load attended logs:', err);
      } finally {
        if (active) setLoadingAttended(false);
      }
    }

    fetchAttendedLogs();
    return () => { active = false; };
  }, [activeTab, selectedEventId]);

  // Lookup & Inspect pass details without consuming
  const handleLookup = async (codeToLookup: string) => {
    if (!codeToLookup.trim() || inspecting) return;
    setInspecting(true);
    setResult(null);
    setInspection(null);

    try {
      const res = await fetch(`/api/ideofest/scan?action=lookup&code=${encodeURIComponent(codeToLookup.trim())}`);
      const json = await res.json();
      if (json.success && json.data) {
        setInspection(json.data);
        setCheckInQty(Math.max(1, json.data.remaining || 1));
      } else {
        setResult({ success: false, error: json.error || 'Pass not found' });
      }
    } catch {
      setResult({ success: false, error: 'Network error performing lookup.' });
    } finally {
      setInspecting(false);
    }
  };

  const [unvalidating, setUnvalidating] = useState(false);

  // Un-validate pass and reset gate entry
  const handleUnvalidatePass = async (bookingOrTicketId: string) => {
    if (!bookingOrTicketId || unvalidating) return;
    if (!confirm('Are you sure you want to un-validate this pass? This will reset gate entry and allow the pass to be scanned again.')) {
      return;
    }
    setUnvalidating(true);
    try {
      const res = await fetch(`/api/ideofest/scan?booking_id=${encodeURIComponent(bookingOrTicketId)}&log_id=${encodeURIComponent(bookingOrTicketId)}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        setResult({ success: true, message: 'Pass un-validated successfully. Ticket is now active for re-entry.' });
        setInspection(null);
        // Refresh attended logs
        const refRes = await fetch(`/api/ideofest/scan?action=attended_list&event_id=${encodeURIComponent(selectedEventId)}`);
        const refJson = await refRes.json();
        if (refJson.success && Array.isArray(refJson.data)) {
          setAttendedLogs(refJson.data);
        }
      } else {
        alert(`Failed to un-validate: ${data.error || 'Unknown error'}`);
      }
    } catch {
      alert('Network error un-validating pass');
    } finally {
      setUnvalidating(false);
    }
  };

  // Perform actual gate check-in & pass validation
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
      setInspection(null);
      // Refresh attended logs list
      try {
        const refreshUrl = `/api/ideofest/scan?action=attended_list&event_id=${encodeURIComponent(selectedEventId)}`;
        const refRes = await fetch(refreshUrl);
        const refJson = await refRes.json();
        if (refJson.success && Array.isArray(refJson.data)) {
          setAttendedLogs(refJson.data);
        }
      } catch {
        /* ignore */
      }
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
          console.log('[QR Code Detected]:', code.data);
          handleLookup(code.data);
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

  const handleManualSearch = (e: React.FormEvent) => {
    e.preventDefault();
    handleLookup(manualCode);
  };

  const resetResult = () => {
    setResult(null);
    setInspection(null);
    setManualCode('');
    cooldownRef.current = false;
  };

  // Filtered Attended Logs for "Who Are Attending" Tab
  const filteredAttended = useMemo(() => {
    let list = attendedLogs;
    if (attendedSearch.trim()) {
      const q = attendedSearch.toLowerCase().trim();
      list = list.filter((log) => {
        const b = log.booking || {};
        return (
          (b.attendee_name || '').toLowerCase().includes(q) ||
          (b.attendee_email || '').toLowerCase().includes(q) ||
          (b.attendee_phone || '').toLowerCase().includes(q) ||
          (b.attendee_nic || '').toLowerCase().includes(q) ||
          (b.booking_ref || '').toLowerCase().includes(q) ||
          (b.event_title || '').toLowerCase().includes(q)
        );
      });
    }
    return list;
  }, [attendedLogs, attendedSearch]);

  // Export Attended List as CSV
  const exportAttendedCsv = () => {
    if (filteredAttended.length === 0) return;

    const headers = [
      'Booking Ref', 'Attendee Name', 'Email', 'Phone', 'NIC / Passport',
      'Event Title', 'Pass Tier', 'Group Qty', 'Admitted In Scan', 'Gate', 'Scanned By', 'Scan Timestamp'
    ];

    const rows = filteredAttended.map((log) => {
      const b = log.booking || {};
      return [
        `"${b.booking_ref || '—'}"`,
        `"${b.attendee_name || '—'}"`,
        `"${b.attendee_email || '—'}"`,
        `"${b.attendee_phone || '—'}"`,
        `"${b.attendee_nic || '—'}"`,
        `"${b.event_title || '—'}"`,
        `"${b.tier_label || '—'}"`,
        b.quantity || 1,
        log.quantity_checked_in || 1,
        `"${log.gate || 'Main Gate'}"`,
        `"${log.scanned_by || 'Gate Staff'}"`,
        `"${new Date(log.scanned_at).toLocaleString()}"`,
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Event_Attended_List_${selectedEventId || 'All'}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* Top Main Mode Header & Navigation Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <div className="inline-flex items-center gap-2 bg-[#c1e527]/15 border border-[#c1e527]/30 px-3.5 py-1 rounded-full mb-2">
            <ShieldCheck className="w-3.5 h-3.5 text-[#c1e527]" />
            <span className="text-[10px] font-extrabold text-[#c1e527] tracking-widest uppercase">
              Gate Control Terminal
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">QR Scanning & Gate Attendance</h1>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center bg-white/5 border border-white/10 p-1.5 rounded-2xl shrink-0">
          <button
            onClick={() => setActiveTab('scanner')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all ${
              activeTab === 'scanner'
                ? 'bg-[#c1e527] text-section-ink shadow-lg font-black'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <QrCode className="w-4 h-4" /> QR Scanner & Validation
          </button>
          <button
            onClick={() => setActiveTab('attended')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all ${
              activeTab === 'attended'
                ? 'bg-[#c1e527] text-section-ink shadow-lg font-black'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <UserCheck className="w-4 h-4" /> Who Are Attending ({attendedLogs.length})
          </button>
        </div>
      </div>

      {/* ── TAB 1: QR SCANNER & MANUAL PASS VALIDATION ── */}
      {activeTab === 'scanner' && (
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Manual Ticket / Ref Code Search Bar */}
          <form onSubmit={handleManualSearch} className="bg-white/4 border border-white/10 rounded-3xl p-4 sm:p-5 backdrop-blur-md space-y-3">
            <div className="flex items-center justify-between">
              <label htmlFor="manualCodeInput" className="text-xs font-black text-[#c1e527] uppercase tracking-wider flex items-center gap-2">
                <Search className="w-4 h-4" /> Search or Scan Booking Reference / Ticket Code
              </label>
              <span className="text-[10px] text-white/40">Step 1: Inspect pass group size</span>
            </div>

            <div className="flex gap-2">
              <input
                id="manualCodeInput"
                type="text"
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                placeholder="Enter IDF-XXXXXXXX or Scan QR Code..."
                className="flex-1 bg-white/5 border border-white/12 rounded-xl px-4 py-3 text-white placeholder-white/30 text-xs sm:text-sm font-mono focus:outline-none focus:border-[#c1e527]"
              />
              <button
                type="submit"
                disabled={!manualCode.trim() || inspecting}
                className="bg-[#c1e527] hover:bg-[#b0d420] disabled:opacity-40 text-section-ink font-black px-5 py-3 rounded-xl text-xs sm:text-sm transition-all shrink-0 flex items-center gap-2"
              >
                {inspecting ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Search className="w-4 h-4" /> Lookup Pass</>}
              </button>
            </div>
          </form>

          {/* Inspection Card: Displays total passes, validated count, remaining count & check-in selector */}
          {inspection && (
            <div className="bg-white/6 border border-[#c1e527]/40 rounded-3xl p-5 sm:p-6 space-y-5 backdrop-blur-xl animate-in fade-in duration-200">
              <div className="flex items-start justify-between border-b border-white/10 pb-4">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-[#c1e527]/20 text-[#c1e527] border border-[#c1e527]/30">
                    PASS INSPECTION — {inspection.booking_ref}
                  </span>
                  <h2 className="text-xl font-black text-white mt-1.5">{inspection.attendee_name}</h2>
                  <p className="text-xs text-white/50">{inspection.attendee_email} • {inspection.event_title}</p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-mono font-bold text-[#c1e527]">{inspection.tier_label}</span>
                </div>
              </div>

              {/* Group Pass Breakdown KPI Cards */}
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="bg-white/5 border border-white/10 p-3 rounded-2xl">
                  <span className="text-[10px] text-white/40 block uppercase font-bold">Total Purchased</span>
                  <span className="font-black text-white text-base sm:text-lg">{inspection.totalQty || 1} Pass(es)</span>
                </div>

                <div className="bg-emerald-500/15 border border-emerald-500/30 p-3 rounded-2xl">
                  <span className="text-[10px] text-emerald-400 block uppercase font-bold">Already Admitted</span>
                  <span className="font-black text-emerald-300 text-base sm:text-lg">{inspection.checkedIn || 0} Checked In</span>
                </div>

                <div className="bg-amber-500/15 border border-amber-500/30 p-3 rounded-2xl">
                  <span className="text-[10px] text-amber-400 block uppercase font-bold">Remaining</span>
                  <span className="font-black text-amber-300 text-base sm:text-lg">{inspection.remaining || 0} Unused</span>
                </div>
              </div>

              {/* Group Members List */}
              {inspection.all_attendees && inspection.all_attendees.length > 0 && (
                <div className="bg-black/40 border border-white/10 rounded-2xl p-4 space-y-2">
                  <span className="text-xs font-bold text-white/70 block mb-2">Group Attendees:</span>
                  {inspection.all_attendees.map((att) => (
                    <div key={att.index} className="flex items-center justify-between text-xs py-1.5 border-b border-white/5 last:border-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono text-[#c1e527]">{att.role}</span>
                        <span className="font-semibold text-white">{att.name}</span>
                      </div>
                      <span className="text-white/40 text-[11px]">{att.nic}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Select Check-In Quantity & Validate Action */}
              {(inspection.remaining || 0) > 0 ? (
                <div className="bg-[#c1e527]/10 border border-[#c1e527]/30 rounded-2xl p-4 space-y-3">
                  <label className="text-xs font-extrabold text-white block uppercase tracking-wider">
                    Select how many attendees to admit right now:
                  </label>

                  <div className="flex flex-wrap items-center gap-2">
                    {Array.from({ length: Math.min(6, inspection.remaining || 1) }, (_, i) => i + 1).map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setCheckInQty(num)}
                        className={`py-2 px-4 rounded-xl font-black text-xs transition-all border ${
                          checkInQty === num
                            ? 'bg-[#c1e527] text-section-ink border-[#c1e527] shadow-lg'
                            : 'bg-white/5 text-white/70 border-white/10 hover:border-white/25 hover:text-white'
                        }`}
                      >
                        {num} {num === 1 ? 'Person' : 'People'}
                      </button>
                    ))}

                    <button
                      type="button"
                      onClick={() => setCheckInQty(inspection.remaining || 1)}
                      className={`py-2 px-4 rounded-xl font-black text-xs transition-all border ${
                        checkInQty === inspection.remaining
                          ? 'bg-[#c1e527] text-section-ink border-[#c1e527] shadow-lg'
                          : 'bg-amber-400/15 text-amber-300 border-amber-400/30'
                      }`}
                    >
                      Admit All {inspection.remaining}
                    </button>
                  </div>

                  <button
                    onClick={() => processPayload(inspection.ticket_number || inspection.booking_ref || '', checkInQty)}
                    disabled={scanning}
                    className="w-full bg-[#c1e527] hover:bg-[#b0d420] disabled:opacity-40 text-section-ink font-black py-3.5 rounded-xl text-sm transition-all shadow-xl flex items-center justify-center gap-2"
                  >
                    {scanning ? <Loader2 className="w-4 h-4 animate-spin" /> : <><CheckCircle className="w-5 h-5" /> Validate & Admit {checkInQty} Person(s) Now</>}
                  </button>
                </div>
              ) : (
                <div className="bg-amber-500/15 border border-amber-500/30 p-4 rounded-2xl text-center space-y-3">
                  <p className="text-amber-300 font-bold text-xs">
                    All {inspection.totalQty} pass(es) for this booking have already entered the venue.
                  </p>
                  <button
                    onClick={() => handleUnvalidatePass(inspection.bookingId || inspection.ticketId || '')}
                    disabled={unvalidating}
                    className="inline-flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-section-ink px-4 py-2 rounded-xl font-extrabold text-xs transition-all shadow-md"
                  >
                    {unvalidating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RotateCcw className="w-3.5 h-3.5" />} Un-validate / Reset Gate Entry
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Hidden Canvas */}
          <canvas ref={canvasRef} className="hidden" />

          {/* Camera Viewfinder */}
          <div className="relative w-full aspect-square max-h-[340px] rounded-3xl bg-black/60 border border-white/15 overflow-hidden flex items-center justify-center shadow-2xl">
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
                <p className="text-xs text-white/50">Click "Start Camera Scanner" below to scan live QR passes</p>
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
                <p className="text-xs font-extrabold text-[#c1e527] tracking-widest uppercase">Validating Pass...</p>
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

          {/* Validation Scan Result Result Card */}
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
                    {result.data?.attendee_name || 'Gate Result'}
                  </h3>

                  <p className="text-xs text-white/80 mt-1 leading-relaxed">
                    {result.message || result.error}
                  </p>
                </div>
              </div>

              <button
                onClick={resetResult}
                className="w-full flex items-center justify-center gap-2 bg-white/10 hover:bg-white/15 text-white py-3 rounded-xl text-xs font-extrabold transition-all"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Scan Next Pass
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── TAB 2: WHO ARE ATTENDING (EVENT GATE LOGS & VALIDATED ATTENDEES) ── */}
      {activeTab === 'attended' && (
        <div className="space-y-5">
          {/* Filters Bar: Select Specific Event & Search Input */}
          <div className="bg-white/4 border border-white/10 rounded-2xl p-4 backdrop-blur-md flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
              <div className="flex items-center gap-2 text-xs font-bold text-white/70 shrink-0">
                <Filter className="w-4 h-4 text-[#c1e527]" /> Select Event:
              </div>
              <select
                value={selectedEventId}
                onChange={(e) => setSelectedEventId(e.target.value)}
                className="w-full sm:w-64 bg-white/5 border border-white/12 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-[#c1e527]"
              >
                <option value="all" className="bg-slate-900 text-white">All Events</option>
                {events.map((evt) => (
                  <option key={evt.id} value={evt.id} className="bg-slate-900 text-white">
                    {evt.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={attendedSearch}
                  onChange={(e) => setAttendedSearch(e.target.value)}
                  placeholder="Search validated attendees..."
                  className="w-full bg-white/5 border border-white/12 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-white/30 focus:outline-none focus:border-[#c1e527]"
                />
              </div>

              <button
                onClick={exportAttendedCsv}
                disabled={filteredAttended.length === 0}
                className="bg-[#c1e527] hover:bg-[#b0d420] disabled:opacity-40 text-section-ink font-black px-4 py-2 rounded-xl text-xs transition-all shrink-0 flex items-center gap-1.5 shadow-md"
              >
                <Download className="w-3.5 h-3.5" /> Download CSV
              </button>
            </div>
          </div>

          {/* Attended Count Header */}
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold text-white/50 uppercase tracking-widest">
              Validated Attendees Entry Logs ({filteredAttended.length})
            </span>
            <span className="text-xs font-mono font-bold text-[#c1e527]">
              Real-time Gate Sync
            </span>
          </div>

          {/* Attended List Table */}
          <div className="bg-white/4 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-md">
            {loadingAttended ? (
              <div className="py-12 text-center text-white/40 text-xs flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-[#c1e527]" /> Loading validated attendance records...
              </div>
            ) : filteredAttended.length === 0 ? (
              <div className="py-12 text-center text-white/40 text-xs space-y-1">
                <p className="font-bold text-white/70">No validated attendees found for this event yet.</p>
                <p>Scan QR passes at the gate terminal to see live entry records here.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left min-w-[700px]">
                  <thead>
                    <tr className="border-b border-white/10 bg-white/2 text-white/40 uppercase tracking-widest text-[10px]">
                      <th className="py-3 px-4">Attendee Name & Email</th>
                      <th className="py-3 px-4">Booking Ref</th>
                      <th className="py-3 px-4">Event Title</th>
                      <th className="py-3 px-4">Pass Tier</th>
                      <th className="py-3 px-4">Admitted Qty</th>
                      <th className="py-3 px-4">Gate</th>
                      <th className="py-3 px-4">Scan Time</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAttended.map((log) => {
                      const b = log.booking || {};
                      return (
                        <tr key={log.id} className="border-b border-white/5 hover:bg-white/3 transition-colors">
                          <td className="py-3 px-4">
                            <div>
                              <p className="font-bold text-white text-sm">{b.attendee_name || 'Attendee'}</p>
                              <p className="text-[11px] text-white/40">{b.attendee_email || '—'}</p>
                              {b.attendee_nic && <p className="text-[10px] text-white/30 font-mono">NIC: {b.attendee_nic}</p>}
                            </div>
                          </td>
                          <td className="py-3 px-4 font-mono font-bold text-[#c1e527]">{b.booking_ref || '—'}</td>
                          <td className="py-3 px-4 text-white/70 max-w-[140px] truncate">{b.event_title || 'Ideofest Event'}</td>
                          <td className="py-3 px-4">
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#c1e527]/15 text-[#c1e527] border border-[#c1e527]/30">
                              {b.tier_label || 'Standard'}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-bold text-emerald-400">
                            +{log.quantity_checked_in || 1} Admitted
                          </td>
                          <td className="py-3 px-4 text-white/50 font-mono">{log.gate || 'Main Gate'}</td>
                          <td className="py-3 px-4 text-white/60 font-mono whitespace-nowrap">
                            {new Date(log.scanned_at).toLocaleString('en-LK', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                              second: '2-digit',
                            })}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <button
                              onClick={() => handleUnvalidatePass(log.booking_id || log.id)}
                              disabled={unvalidating}
                              className="inline-flex items-center gap-1.5 bg-amber-500/15 hover:bg-amber-500 text-amber-300 hover:text-section-ink border border-amber-500/30 px-2.5 py-1.5 rounded-xl font-bold text-[11px] transition-all shadow-sm"
                              title="Un-validate pass and reset gate entry"
                            >
                              <RotateCcw className="w-3.5 h-3.5" /> Un-validate
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
