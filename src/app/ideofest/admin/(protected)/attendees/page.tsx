'use client';

import { useState, useMemo, useEffect } from 'react';
import { Search, CheckCircle, Clock, Download, Loader2, Ticket, X, Printer, Eye, Share2, FileText, Check, Settings2, CheckSquare, Square, Trash2, AlertTriangle } from 'lucide-react';
import type { IBooking, IEvent } from '@/lib/ideofest/types';
import QRTicket from '@/components/ideofest/QRTicket';

// Column definitions for customizable CSV export
const ALL_EXPORT_COLUMNS = [
  { id: 'booking_ref', label: 'Booking Reference ID', defaultSelected: true },
  { id: 'pass_index', label: 'Pass Index (e.g. 1 of 3)', defaultSelected: true },
  { id: 'attendee_name', label: 'Attendee Name', defaultSelected: true },
  { id: 'attendee_email', label: 'Email Address', defaultSelected: true },
  { id: 'attendee_phone', label: 'Phone Number', defaultSelected: true },
  { id: 'attendee_nic', label: 'NIC / Passport Number', defaultSelected: true },
  { id: 'event_title', label: 'Event Title', defaultSelected: true },
  { id: 'tier_label', label: 'Pass Tier Name', defaultSelected: true },
  { id: 'quantity', label: 'Group Pass Quantity', defaultSelected: true },
  { id: 'total_amount', label: 'Total Amount (LKR)', defaultSelected: true },
  { id: 'payment_method', label: 'Payment Method', defaultSelected: true },
  { id: 'payment_status', label: 'Payment Status', defaultSelected: true },
  { id: 'booking_status', label: 'Booking / Gate Status', defaultSelected: true },
  { id: 'emergency_contact', label: 'Emergency Contact Details', defaultSelected: true },
  { id: 'city_district', label: 'City & District', defaultSelected: true },
  { id: 'postal_code', label: 'Postal Code', defaultSelected: true },
  { id: 'payment_slip_url', label: 'Payment Slip Receipt URL', defaultSelected: true },
  { id: 'created_at', label: 'Booking Creation Date', defaultSelected: true },
] as const;

type ExportColumnId = typeof ALL_EXPORT_COLUMNS[number]['id'];

export default function AdminAttendeesPage() {
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'confirmed' | 'pending_verification'>('all');
  const [selectedEvent, setSelectedEvent] = useState('');
  const [filterTier, setFilterTier] = useState<string>('all');
  const [bookings, setBookings] = useState<any[]>([]);
  const [events, setEvents] = useState<IEvent[]>([]);
  const [loading, setLoading] = useState(true);

  // Selected attendee for "Get Ticket" pass modal & Full Details Modal
  const [activeTicketAttendee, setActiveTicketAttendee] = useState<any | null>(null);
  const [activeDetailsAttendee, setActiveDetailsAttendee] = useState<any | null>(null);
  const [deleteConfirmTarget, setDeleteConfirmTarget] = useState<any | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Column Selector Modal State
  const [showColumnModal, setShowColumnModal] = useState(false);
  const [selectedColumns, setSelectedColumns] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    ALL_EXPORT_COLUMNS.forEach((col) => {
      initial[col.id] = col.defaultSelected;
    });
    return initial;
  });

  // Lock ALL scrollable ancestors when any modal popup is open
  useEffect(() => {
    const isOpen = !!(activeTicketAttendee || showColumnModal || activeDetailsAttendee || deleteConfirmTarget);
    // Lock body
    document.body.style.overflow = isOpen ? 'hidden' : '';
    // Also lock the nearest <main> and any scrollable sibling (sidebar nav)
    const scrollables = document.querySelectorAll<HTMLElement>('main, nav, aside');
    scrollables.forEach((el) => {
      el.style.overflow = isOpen ? 'hidden' : '';
    });
    return () => {
      document.body.style.overflow = '';
      scrollables.forEach((el) => {
        el.style.overflow = '';
      });
    };
  }, [activeTicketAttendee, showColumnModal]);

  // Fetch real events and expanded attendees from Supabase
  useEffect(() => {
    let active = true;
    async function loadData() {
      setLoading(true);
      try {
        const [evtRes, attRes] = await Promise.all([
          fetch('/api/ideofest/events?status=all'),
          fetch('/api/ideofest/attendees'),
        ]);

        const [evtData, attData] = await Promise.all([evtRes.json(), attRes.json()]);

        if (active) {
          if (evtData.success && Array.isArray(evtData.data)) setEvents(evtData.data);
          if (attData.success && Array.isArray(attData.data)) setBookings(attData.data);
        }
      } catch (err) {
        console.error('Failed to load attendee data:', err);
      } finally {
        if (active) setLoading(false);
      }
    }
    loadData();
    return () => { active = false; };
  }, []);

  // Handle Delete Ticket & Attendee Record
  const handleDeleteTicket = async () => {
    if (!deleteConfirmTarget) return;
    setDeleting(true);
    try {
      const bId = deleteConfirmTarget.booking_id || deleteConfirmTarget.id || '';
      const bRef = deleteConfirmTarget.booking_ref || '';
      const aId = deleteConfirmTarget.id || '';
      const res = await fetch(
        `/api/ideofest/attendees?booking_id=${encodeURIComponent(bId)}&booking_ref=${encodeURIComponent(bRef)}&attendee_id=${encodeURIComponent(aId)}`,
        { method: 'DELETE' }
      );
      const data = await res.json();
      if (data.success) {
        setActionSuccess(`Ticket pass ${deleteConfirmTarget.booking_ref || deleteConfirmTarget.attendee_name || ''} deleted successfully`);
        setTimeout(() => setActionSuccess(null), 4000);

        // Re-fetch fresh attendee records from backend
        try {
          const attRes = await fetch('/api/ideofest/attendees');
          const attData = await attRes.json();
          if (attData.success && Array.isArray(attData.data)) {
            setBookings(attData.data);
          } else {
            setBookings((prev) => prev.filter((b) => b.id !== deleteConfirmTarget.id && b.booking_id !== bId));
          }
        } catch {
          setBookings((prev) => prev.filter((b) => b.id !== deleteConfirmTarget.id && b.booking_id !== bId));
        }
      } else {
        alert(`Failed to delete ticket: ${data.error || 'Unknown error'}`);
      }
    } catch {
      alert('Network error deleting ticket');
    } finally {
      setDeleting(false);
      setDeleteConfirmTarget(null);
    }
  };

  // Filter logic across Search, Event, Status, and Pass Tier
  const filtered = useMemo(() => {
    let list = bookings;

    if (selectedEvent) {
      list = list.filter((b: any) => b.event_id === selectedEvent);
    }

    if (filterTier !== 'all') {
      list = list.filter((b: any) => (b.tier_name || b.tier_label || '').toLowerCase().includes(filterTier.toLowerCase()));
    }

    if (search) {
      const q = search.toLowerCase().trim();
      list = list.filter(
        (b: any) =>
          (b.attendee_name || b.name || '').toLowerCase().includes(q) ||
          (b.attendee_email || b.email || '').toLowerCase().includes(q) ||
          (b.attendee_phone || b.phone || '').toLowerCase().includes(q) ||
          (b.attendee_nic || b.nic_number || '').toLowerCase().includes(q) ||
          (b.booking_ref || '').toLowerCase().includes(q)
      );
    }

    if (filterStatus === 'confirmed') {
      list = list.filter((b: any) => b.status === 'confirmed' || b.payment_status === 'paid' || b.booking_status === 'confirmed');
    } else if (filterStatus === 'pending_verification') {
      list = list.filter((b: any) => b.status === 'pending_verification' || b.payment_status === 'pending_verification' || b.booking_status === 'pending_verification');
    }

    return list;
  }, [search, filterStatus, selectedEvent, filterTier, bookings]);

  // Toggle single column selection
  const toggleColumn = (colId: string) => {
    setSelectedColumns((prev) => ({ ...prev, [colId]: !prev[colId] }));
  };

  // Select / Deselect All
  const setAllColumns = (val: boolean) => {
    const next: Record<string, boolean> = {};
    ALL_EXPORT_COLUMNS.forEach((c) => {
      next[c.id] = val;
    });
    setSelectedColumns(next);
  };

  // Client-side CSV Exporter based on Selected Columns and Active UI Filters
  const handleDownloadCustomCsv = () => {
    if (filtered.length === 0) {
      alert('No attendees match your current filters to export.');
      return;
    }

    const activeCols = ALL_EXPORT_COLUMNS.filter((c) => selectedColumns[c.id]);
    if (activeCols.length === 0) {
      alert('Please select at least 1 column to include in the CSV report.');
      return;
    }

    const escapeCsv = (val: unknown): string => {
      if (val === null || val === undefined) return '""';
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    };

    // Header row
    const headers = activeCols.map((c) => c.label);
    const csvRows = [headers.join(',')];

    // Data rows
    filtered.forEach((a: any) => {
      const row: string[] = [];
      activeCols.forEach((col) => {
        let val = '';
        switch (col.id) {
          case 'booking_ref': val = a.booking_ref || ''; break;
          case 'pass_index': val = a.tier_label?.includes('Pass') ? a.tier_label : '1 of 1'; break;
          case 'attendee_name': val = a.attendee_name || a.name || ''; break;
          case 'attendee_email': val = a.attendee_email || a.email || ''; break;
          case 'attendee_phone': val = a.attendee_phone || a.phone || ''; break;
          case 'attendee_nic': val = a.attendee_nic || a.nic_number || ''; break;
          case 'event_title': val = a.event_title || 'Ideofest Event'; break;
          case 'tier_label': val = a.tier_label || a.tier_name || 'Standard'; break;
          case 'quantity': val = a.quantity || 1; break;
          case 'total_amount': val = a.total_amount || 0; break;
          case 'payment_method': val = a.payment_method || 'bank_transfer'; break;
          case 'payment_status': val = a.payment_status || 'pending_verification'; break;
          case 'booking_status': val = a.status || a.booking_status || 'pending_verification'; break;
          case 'emergency_contact':
            val = [a.emergency_contact_name, a.emergency_contact_phone].filter(Boolean).join(' - ') || '—';
            break;
          case 'city_district':
            val = [a.city, a.district].filter(Boolean).join(', ') || '—';
            break;
          case 'postal_code': val = a.postal_code || ''; break;
          case 'payment_slip_url': val = a.payment_slip_url || ''; break;
          case 'created_at': val = a.created_at || ''; break;
        }
        row.push(escapeCsv(val));
      });
      csvRows.push(row.join(','));
    });

    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ideofest-custom-report-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setShowColumnModal(false);
  };

  // Helper to approve payment directly from Get Ticket Modal
  const handleApproveFromModal = async (bookingId: string) => {
    setVerifying(true);
    try {
      const res = await fetch('/api/ideofest/admin/verifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ booking_id: bookingId, action: 'approve' }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'Verification failed');

      setActionSuccess('Payment approved and ticket issued successfully!');
      setTimeout(() => setActionSuccess(null), 4000);

      // Update local state
      setBookings((prev) =>
        prev.map((b) =>
          b.id === bookingId || b.booking_ref === activeTicketAttendee?.booking_ref
            ? { ...b, status: 'confirmed', payment_status: 'paid', booking_status: 'confirmed' }
            : b
        )
      );

      if (activeTicketAttendee) {
        setActiveTicketAttendee({
          ...activeTicketAttendee,
          status: 'confirmed',
          payment_status: 'paid',
          booking_status: 'confirmed',
        });
      }
    } catch (err) {
      alert('Error approving payment: ' + (err as Error).message);
    } finally {
      setVerifying(false);
    }
  };

  const TIER_BADGE: Record<string, string> = {
    free: 'bg-[#c1e527]/15 text-[#c1e527] border border-[#c1e527]/30',
    early_bird: 'bg-indigo-500/15 text-indigo-300',
    standard: 'bg-white/10 text-white/70',
    vip: 'bg-amber-500/15 text-amber-400 border border-amber-500/30',
  };

  const totalTickets = useMemo(() => bookings.reduce((sum, b) => sum + (b.quantity || 1), 0), [bookings]);
  const confirmedBookings = useMemo(() => bookings.filter((b) => b.status === 'confirmed' || b.payment_status === 'paid' || b.booking_status === 'confirmed'), [bookings]);
  const pendingBookings = useMemo(() => bookings.filter((b) => b.status === 'pending_verification' || b.payment_status === 'pending_verification' || b.booking_status === 'pending_verification'), [bookings]);

  // Convert attendee item to full IBooking format for QRTicket component rendering
  const ticketBookingModalData: IBooking | null = useMemo(() => {
    if (!activeTicketAttendee) return null;
    return {
      id: activeTicketAttendee.id || activeTicketAttendee.booking_id,
      booking_ref: activeTicketAttendee.booking_ref,
      event_id: activeTicketAttendee.event_id || 'evt_1',
      ticket_tier_id: activeTicketAttendee.ticket_tier_id || 'tier_1',
      event_title: activeTicketAttendee.event_title || 'Ideofest Main Stage 2026',
      event_date: activeTicketAttendee.created_at || new Date().toISOString(),
      event_slug: 'ideofest-2026',
      venue: activeTicketAttendee.venue || 'Lotus Tower Exhibition Complex, Colombo 03',
      attendee_name: activeTicketAttendee.attendee_name || activeTicketAttendee.name,
      attendee_email: activeTicketAttendee.attendee_email || activeTicketAttendee.email,
      attendee_phone: activeTicketAttendee.attendee_phone || activeTicketAttendee.phone || '—',
      attendee_nic: activeTicketAttendee.attendee_nic || activeTicketAttendee.nic_number || '—',
      tier_name: activeTicketAttendee.tier_name || 'standard',
      tier_label: activeTicketAttendee.tier_label || 'Standard Pass',
      quantity: activeTicketAttendee.quantity || 1,
      unit_price: activeTicketAttendee.unit_price || activeTicketAttendee.total_amount || 0,
      total_amount: activeTicketAttendee.total_amount || 0,
      currency: 'LKR',
      payment_method: activeTicketAttendee.payment_method || 'bank_transfer',
      payment_status: activeTicketAttendee.payment_status || 'pending_verification',
      status: activeTicketAttendee.status || activeTicketAttendee.booking_status || 'pending_verification',
      payment_slip_url: activeTicketAttendee.payment_slip_url,
      created_at: activeTicketAttendee.created_at || new Date().toISOString(),
    };
  }, [activeTicketAttendee]);

  const selectedColCount = Object.values(selectedColumns).filter(Boolean).length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2">
            <Ticket className="w-7 h-7 text-[#c1e527]" /> Attendee & Ticket Management
          </h1>
          <p className="text-white/40 text-xs sm:text-sm mt-1">
            {filtered.length} attendees displayed ({totalTickets} total tickets in database)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowColumnModal(true)}
            className="flex items-center justify-center gap-2 bg-[#c1e527] hover:bg-[#b0d420] text-section-ink px-4 py-2.5 rounded-xl font-black text-xs sm:text-sm transition-all shadow-lg shadow-[#c1e527]/15 hover:scale-105"
          >
            <Download className="w-4 h-4" /> Export CSV Report ({filtered.length})
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white/4 border border-white/8 rounded-2xl p-5 backdrop-blur-md">
          <p className="text-xs font-bold text-white/40 uppercase tracking-widest">Total Booked Tickets</p>
          <p className="text-2xl sm:text-3xl font-black text-white mt-1">{totalTickets}</p>
          <p className="text-xs text-white/40 mt-1">{bookings.length} pass records</p>
        </div>

        <div className="bg-[#c1e527]/10 border border-[#c1e527]/30 rounded-2xl p-5 backdrop-blur-md">
          <p className="text-xs font-bold text-[#c1e527] uppercase tracking-widest">Confirmed & Active Passes</p>
          <p className="text-2xl sm:text-3xl font-black text-[#c1e527] mt-1">{confirmedBookings.reduce((s, b) => s + (b.quantity || 1), 0)}</p>
          <p className="text-xs text-[#c1e527]/70 mt-1">{confirmedBookings.length} confirmed records</p>
        </div>

        <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-5 backdrop-blur-md">
          <p className="text-xs font-bold text-amber-400 uppercase tracking-widest">Pending Verification</p>
          <p className="text-2xl sm:text-3xl font-black text-amber-400 mt-1">{pendingBookings.reduce((s, b) => s + (b.quantity || 1), 0)}</p>
          <p className="text-xs text-amber-400/70 mt-1">{pendingBookings.length} pending review</p>
        </div>
      </div>

      {/* Interactive Filters Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-white/4 border border-white/10 rounded-2xl p-4 backdrop-blur-xl">
        {/* Search */}
        <div className="relative sm:col-span-2">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, email, phone, NIC, Ref..."
            className="w-full bg-white/5 border border-white/12 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#c1e527] transition-colors"
          />
        </div>

        {/* Event Selector */}
        <select
          value={selectedEvent}
          onChange={(e) => setSelectedEvent(e.target.value)}
          className="bg-neutral-900 border border-white/12 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-[#c1e527]"
        >
          <option value="">All Festival Events</option>
          {events.map((e) => (
            <option key={e.id || e.slug} value={e.id}>
              {e.title}
            </option>
          ))}
        </select>

        {/* Status Filter */}
        <div className="flex rounded-xl border border-white/12 overflow-hidden bg-white/5">
          {(['all', 'confirmed', 'pending_verification'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilterStatus(f)}
              className={`flex-1 py-2 text-xs font-bold capitalize transition-colors ${
                filterStatus === f ? 'bg-[#c1e527] text-section-ink' : 'text-white/50 hover:text-white hover:bg-white/8'
              }`}
            >
              {f === 'all' ? 'All' : f === 'confirmed' ? 'Paid' : 'Pending'}
            </button>
          ))}
        </div>
      </div>

      {/* Attendees Table */}
      <div className="bg-white/4 border border-white/8 rounded-2xl overflow-hidden backdrop-blur-md">
        {loading ? (
          <div className="py-20 text-center text-white/40">
            <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-[#c1e527]" />
            <p className="text-sm">Loading attendee records...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[780px]">
              <thead>
                <tr className="text-left text-white/30 text-xs uppercase tracking-widest border-b border-white/8 bg-white/3">
                  <th className="px-5 py-4">Attendee Details</th>
                  <th className="px-5 py-4">Booking Ref</th>
                  <th className="px-5 py-4">Event Title</th>
                  <th className="px-5 py-4">Pass Tier</th>
                  <th className="px-5 py-4">Amount</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4 text-right">Get Ticket</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-16 text-center text-white/30">
                      No matching attendees found.
                    </td>
                  </tr>
                ) : (
                  filtered.map((a: any, idx: number) => {
                    const isConfirmed = a.status === 'confirmed' || a.payment_status === 'paid' || a.booking_status === 'confirmed';
                    return (
                      <tr key={a.id || a.booking_ref || idx} className="border-b border-white/5 hover:bg-white/3 transition-colors">
                        <td className="px-5 py-4">
                          <p className="font-bold text-white">{a.attendee_name || a.name}</p>
                          <p className="text-xs text-white/50 mt-0.5">{a.attendee_email || a.email}</p>
                          <div className="flex items-center gap-3 mt-1 text-[11px] text-white/40 font-mono">
                            {(a.nic_number || a.attendee_nic) && <span>NIC: {a.nic_number || a.attendee_nic}</span>}
                            {(a.phone || a.attendee_phone) && <span>Tel: {a.phone || a.attendee_phone}</span>}
                          </div>
                        </td>
                        <td className="px-5 py-4 font-mono text-xs text-[#c1e527] font-bold">{a.booking_ref}</td>
                        <td className="px-5 py-4 text-white/80 max-w-[180px] truncate">{a.event_title || 'Ideofest Event'}</td>
                        <td className="px-5 py-4">
                          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${TIER_BADGE[a.tier_name] || 'bg-white/10 text-white/70'}`}>
                            {a.tier_label || a.tier_name || 'Standard'}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-white font-bold whitespace-nowrap">
                          LKR {(a.total_amount || 0).toLocaleString('en-LK', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full capitalize ${
                              isConfirmed
                                ? 'bg-[#c1e527]/15 text-[#c1e527] border border-[#c1e527]/30'
                                : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                            }`}
                          >
                            {isConfirmed ? <CheckCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                            {isConfirmed ? 'Paid & Confirmed' : 'Pending Review'}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => setActiveDetailsAttendee(a)}
                              className="inline-flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-xl font-bold text-xs transition-all border border-white/15 shadow-sm"
                              title="View All Attendee & Registration Details"
                            >
                              <Eye className="w-3.5 h-3.5 text-[#c1e527]" /> View Details
                            </button>
                            <button
                              onClick={() => setActiveTicketAttendee(a)}
                              className="inline-flex items-center gap-1.5 bg-[#c1e527] hover:bg-[#b0d420] text-section-ink px-3 py-1.5 rounded-xl font-extrabold text-xs transition-all shadow-md hover:scale-105"
                            >
                              <Ticket className="w-3.5 h-3.5" /> Get Ticket
                            </button>
                            <button
                              onClick={() => setDeleteConfirmTarget(a)}
                              className="inline-flex items-center gap-1 bg-red-500/15 hover:bg-red-500 text-red-400 hover:text-white border border-red-500/30 px-2.5 py-1.5 rounded-xl font-bold text-xs transition-all shadow-sm"
                              title="Delete Ticket Pass & Attendee Record"
                            >
                              <Trash2 className="w-3.5 h-3.5" /> Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── SELECT COLUMNS TO EXPORT MODAL ── */}
      {showColumnModal && (
        <div
          className="fixed inset-0 z-[9999] overflow-y-auto bg-black/80 backdrop-blur-xl p-4 sm:p-6"
          onClick={() => setShowColumnModal(false)}
          onWheel={(e) => e.stopPropagation()}
          onTouchMove={(e) => e.stopPropagation()}
        >
          <div className="min-h-full flex items-center justify-center py-6">
            <div
              className="bg-[#0e121e] border border-white/15 rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl relative space-y-6 text-left my-auto animate-in fade-in"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-2 text-white">
                  <Settings2 className="w-5 h-5 text-[#c1e527]" />
                  <div>
                    <h3 className="font-extrabold text-base sm:text-lg">Select CSV Report Columns</h3>
                    <p className="text-xs text-white/50">Choose which data fields to include in your exported report</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowColumnModal(false)}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Select All / Deselect All Controls */}
              <div className="flex items-center justify-between bg-white/5 p-3 rounded-2xl border border-white/10">
                <span className="text-xs text-white/70 font-semibold">
                  Selected: <strong className="text-[#c1e527] font-mono">{selectedColCount}</strong> of {ALL_EXPORT_COLUMNS.length} columns
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setAllColumns(true)}
                    className="text-xs font-bold text-[#c1e527] hover:underline"
                  >
                    Select All
                  </button>
                  <span className="text-white/20">|</span>
                  <button
                    type="button"
                    onClick={() => setAllColumns(false)}
                    className="text-xs font-bold text-white/50 hover:text-white hover:underline"
                  >
                    Deselect All
                  </button>
                </div>
              </div>

              {/* Checkbox Column Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[340px] overflow-y-auto pr-1">
                {ALL_EXPORT_COLUMNS.map((col) => {
                  const isSelected = !!selectedColumns[col.id];
                  return (
                    <label
                      key={col.id}
                      onClick={() => toggleColumn(col.id)}
                      className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all select-none ${
                        isSelected
                          ? 'bg-[#c1e527]/12 border-[#c1e527]/50 text-white'
                          : 'bg-white/4 border-white/8 text-white/50 hover:border-white/20 hover:text-white/80'
                      }`}
                    >
                      {isSelected ? (
                        <CheckSquare className="w-4 h-4 text-[#c1e527] shrink-0" />
                      ) : (
                        <Square className="w-4 h-4 text-white/30 shrink-0" />
                      )}
                      <span className="text-xs font-bold">{col.label}</span>
                    </label>
                  );
                })}
              </div>

              {/* Download CTA */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-white/10">
                <button
                  onClick={handleDownloadCustomCsv}
                  disabled={selectedColCount === 0}
                  className="flex-1 flex items-center justify-center gap-2 bg-[#c1e527] hover:bg-[#b0d420] disabled:opacity-40 text-section-ink font-black py-3.5 rounded-xl text-xs sm:text-sm transition-all shadow-lg"
                >
                  <Download className="w-4 h-4" /> Download CSV ({filtered.length} Rows)
                </button>

                <button
                  onClick={() => setShowColumnModal(false)}
                  className="bg-white/10 hover:bg-white/15 text-white font-bold py-3.5 px-6 rounded-xl text-xs sm:text-sm transition-colors border border-white/15"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── GET TICKET MODAL ── */}
      {activeTicketAttendee && ticketBookingModalData && (
        <div
          className="fixed inset-0 z-[9999] overflow-y-auto bg-black/80 backdrop-blur-xl p-4 sm:p-6"
          onClick={() => setActiveTicketAttendee(null)}
          onWheel={(e) => e.stopPropagation()}
          onTouchMove={(e) => e.stopPropagation()}
        >
          <div className="min-h-full flex items-center justify-center py-6">
            <div
              className="bg-[#0e121e] border border-white/15 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl relative space-y-6 text-left my-auto animate-in fade-in"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-2 text-white">
                  <Ticket className="w-5 h-5 text-[#c1e527]" />
                  <h3 className="font-extrabold text-base sm:text-lg">Official Pass & QR Ticket</h3>
                </div>
                <button
                  onClick={() => setActiveTicketAttendee(null)}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {actionSuccess && (
                <div className="bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs p-3 rounded-xl flex items-center gap-2">
                  <Check className="w-4 h-4" /> {actionSuccess}
                </div>
              )}

              {/* QRTicket Pass View */}
              <div className="flex justify-center">
                <QRTicket booking={ticketBookingModalData} />
              </div>

              {/* Additional Admin Actions */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-3 text-xs">
                <div className="flex justify-between items-center text-white/70">
                  <span>Attendee Name:</span>
                  <strong className="text-white font-mono">{activeTicketAttendee.attendee_name || activeTicketAttendee.name}</strong>
                </div>
                <div className="flex justify-between items-center text-white/70">
                  <span>NIC / Passport:</span>
                  <strong className="text-white font-mono">{activeTicketAttendee.attendee_nic || activeTicketAttendee.nic_number || '—'}</strong>
                </div>
                <div className="flex justify-between items-center text-white/70">
                  <span>Phone Contact:</span>
                  <strong className="text-white font-mono">{activeTicketAttendee.attendee_phone || activeTicketAttendee.phone || '—'}</strong>
                </div>
                {activeTicketAttendee.payment_slip_url && (
                  <div className="flex justify-between items-center pt-2 border-t border-white/8">
                    <span className="text-amber-400 font-bold flex items-center gap-1">
                      <FileText className="w-3.5 h-3.5" /> Payment Slip:
                    </span>
                    <a
                      href={activeTicketAttendee.payment_slip_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#c1e527] underline font-bold hover:text-white"
                    >
                      View Transfer Receipt →
                    </a>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                {activeTicketAttendee.status === 'pending_verification' && (
                  <button
                    onClick={() => handleApproveFromModal(activeTicketAttendee.id || activeTicketAttendee.booking_id)}
                    disabled={verifying}
                    className="flex-1 flex items-center justify-center gap-2 bg-[#c1e527] hover:bg-[#b0d420] text-section-ink font-black py-3 rounded-xl text-xs transition-all shadow-lg"
                  >
                    {verifying ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Approve & Issue Ticket ✓</>}
                  </button>
                )}

                <button
                  onClick={() => setActiveTicketAttendee(null)}
                  className="flex-1 bg-white/10 hover:bg-white/15 text-white font-bold py-3 rounded-xl text-xs transition-colors border border-white/15"
                >
                  Close Pass Preview
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── DELETE CONFIRMATION MODAL ── */}
      {deleteConfirmTarget && (
        <div
          className="fixed inset-0 z-[99999] overflow-y-auto bg-black/85 backdrop-blur-xl p-4 sm:p-6 flex items-center justify-center animate-in fade-in"
          onClick={() => !deleting && setDeleteConfirmTarget(null)}
        >
          <div
            className="bg-[#121624] border border-red-500/30 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative space-y-5 text-left my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 border-b border-white/10 pb-4">
              <div className="w-10 h-10 rounded-2xl bg-red-500/20 text-red-400 flex items-center justify-center border border-red-500/30">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-base sm:text-lg text-white">Delete Ticket & Attendee</h3>
                <p className="text-xs text-white/50">This action cannot be undone</p>
              </div>
            </div>

            <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 space-y-2">
              <p className="text-xs text-white/90">
                Are you sure you want to permanently delete ticket pass{' '}
                <strong className="text-signal-lime font-mono">{deleteConfirmTarget.booking_ref}</strong> for{' '}
                <strong className="text-white">{deleteConfirmTarget.name || deleteConfirmTarget.attendee_name}</strong>?
              </p>
              <p className="text-[11px] text-white/50">
                This will purge all booking records, issued passes, gate scan history, and attendee data from Supabase.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmTarget(null)}
                disabled={deleting}
                className="flex-1 bg-white/10 hover:bg-white/15 text-white font-bold py-3 rounded-xl text-xs transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteTicket}
                disabled={deleting}
                className="flex-1 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-500 text-white font-black py-3 rounded-xl text-xs transition-all shadow-lg hover:shadow-red-500/30"
              >
                {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Trash2 className="w-4 h-4" /> Delete Permanently</>}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* ── USER ALL DETAILS MODAL ── */}
      {activeDetailsAttendee && (
        <div
          className="fixed inset-0 z-[9999] overflow-y-auto bg-black/85 backdrop-blur-xl p-4 sm:p-6"
          onClick={() => setActiveDetailsAttendee(null)}
          onWheel={(e) => e.stopPropagation()}
          onTouchMove={(e) => e.stopPropagation()}
        >
          <div className="min-h-full flex items-center justify-center py-6">
            <div
              className="bg-[#0e121e] border border-white/15 rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl relative space-y-6 text-left my-auto animate-in fade-in"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-3 text-white">
                  <div className="w-10 h-10 rounded-2xl bg-[#c1e527]/15 border border-[#c1e527]/30 text-[#c1e527] flex items-center justify-center font-black">
                    <Eye className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-black text-lg text-white">Attendee Complete Profile</h3>
                      <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-md bg-[#c1e527]/15 text-[#c1e527] border border-[#c1e527]/30">
                        {activeDetailsAttendee.booking_ref}
                      </span>
                    </div>
                    <p className="text-xs text-white/50">Full registration details & booking audit record</p>
                  </div>
                </div>
                <button
                  onClick={() => setActiveDetailsAttendee(null)}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Grid Sections */}
              <div className="space-y-4 max-h-[65vh] overflow-y-auto pr-1 text-xs">
                {/* 1. Personal & Contact Info */}
                <div className="bg-white/4 border border-white/10 rounded-2xl p-4 space-y-3">
                  <p className="text-[10px] font-black text-[#c1e527] uppercase tracking-widest flex items-center gap-1.5">
                    👤 Attendee Personal Information
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <span className="text-white/40 block text-[11px]">Full Legal Name</span>
                      <strong className="text-white text-sm">{activeDetailsAttendee.attendee_name || activeDetailsAttendee.name}</strong>
                    </div>
                    <div>
                      <span className="text-white/40 block text-[11px]">Email Address</span>
                      <strong className="text-white font-mono">{activeDetailsAttendee.attendee_email || activeDetailsAttendee.email || '—'}</strong>
                    </div>
                    <div>
                      <span className="text-white/40 block text-[11px]">Phone Number</span>
                      <strong className="text-white font-mono">{activeDetailsAttendee.attendee_phone || activeDetailsAttendee.phone || '—'}</strong>
                    </div>
                    <div>
                      <span className="text-white/40 block text-[11px]">NIC / Passport Number</span>
                      <strong className="text-white font-mono">{activeDetailsAttendee.attendee_nic || activeDetailsAttendee.nic_number || '—'}</strong>
                    </div>
                  </div>
                </div>

                {/* 2. Event & Booking Tier */}
                <div className="bg-white/4 border border-white/10 rounded-2xl p-4 space-y-3">
                  <p className="text-[10px] font-black text-[#c1e527] uppercase tracking-widest flex items-center gap-1.5">
                    🎟️ Event & Pass Details
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <span className="text-white/40 block text-[11px]">Event Title</span>
                      <strong className="text-white">{activeDetailsAttendee.event_title || 'Ideofest Event'}</strong>
                    </div>
                    <div>
                      <span className="text-white/40 block text-[11px]">Pass Tier & Index</span>
                      <span className="inline-block px-2.5 py-0.5 rounded-full bg-[#c1e527]/15 text-[#c1e527] font-bold border border-[#c1e527]/30 text-[11px] mt-0.5">
                        {activeDetailsAttendee.tier_label || activeDetailsAttendee.tier_name || 'Standard'} (Pass {activeDetailsAttendee.pass_index || 1} of {activeDetailsAttendee.quantity || 1})
                      </span>
                    </div>
                    <div>
                      <span className="text-white/40 block text-[11px]">Total Paid Amount</span>
                      <strong className="text-[#c1e527] font-mono text-sm">
                        LKR {(activeDetailsAttendee.total_amount || 0).toLocaleString('en-LK', { minimumFractionDigits: 2 })}
                      </strong>
                    </div>
                    <div>
                      <span className="text-white/40 block text-[11px]">Registration Date</span>
                      <strong className="text-white/80 font-mono">
                        {activeDetailsAttendee.created_at ? new Date(activeDetailsAttendee.created_at).toLocaleString('en-LK') : '—'}
                      </strong>
                    </div>
                  </div>
                </div>

                {/* 3. Address & Location */}
                <div className="bg-white/4 border border-white/10 rounded-2xl p-4 space-y-3">
                  <p className="text-[10px] font-black text-white/50 uppercase tracking-widest flex items-center gap-1.5">
                    📍 Address Information
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="sm:col-span-2">
                      <span className="text-white/40 block text-[11px]">Street Address</span>
                      <strong className="text-white">
                        {[activeDetailsAttendee.address_line_1, activeDetailsAttendee.address_line_2].filter(Boolean).join(', ') || '—'}
                      </strong>
                    </div>
                    <div>
                      <span className="text-white/40 block text-[11px]">City & District</span>
                      <strong className="text-white">
                        {[activeDetailsAttendee.city, activeDetailsAttendee.district].filter(Boolean).join(', ') || '—'}
                      </strong>
                    </div>
                    <div>
                      <span className="text-white/40 block text-[11px]">Country</span>
                      <strong className="text-white">{activeDetailsAttendee.country || 'Sri Lanka'}</strong>
                    </div>
                  </div>
                </div>

                {/* 4. Payment Method & Slip */}
                <div className="bg-white/4 border border-white/10 rounded-2xl p-4 space-y-3">
                  <p className="text-[10px] font-black text-white/50 uppercase tracking-widest flex items-center gap-1.5">
                    💳 Payment Status & Verification
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <span className="text-white/40 block text-[11px]">Payment Gateway</span>
                      <strong className="text-white capitalize">
                        {activeDetailsAttendee.payment_method === 'bank_transfer' ? 'Direct Bank Transfer' : activeDetailsAttendee.payment_method || 'Online'}
                      </strong>
                    </div>
                    <div>
                      <span className="text-white/40 block text-[11px]">Verification Status</span>
                      <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full capitalize mt-0.5 ${
                        activeDetailsAttendee.status === 'confirmed' || activeDetailsAttendee.payment_status === 'paid'
                          ? 'bg-[#c1e527]/15 text-[#c1e527] border border-[#c1e527]/30'
                          : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                      }`}>
                        {activeDetailsAttendee.status === 'confirmed' || activeDetailsAttendee.payment_status === 'paid' ? 'Paid & Confirmed' : 'Pending Verification'}
                      </span>
                    </div>
                    {activeDetailsAttendee.payment_slip_url && (
                      <div className="sm:col-span-2 pt-2 border-t border-white/8">
                        <span className="text-amber-400 font-bold block mb-1">Transfer Receipt / Payment Slip:</span>
                        <a
                          href={activeDetailsAttendee.payment_slip_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 bg-[#c1e527]/15 hover:bg-[#c1e527] text-[#c1e527] hover:text-section-ink border border-[#c1e527]/30 px-3 py-1.5 rounded-xl font-bold transition-all"
                        >
                          <FileText className="w-4 h-4" /> Open High-Res Slip Image ↗
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                {/* 5. Special Celebration Request */}
                {(activeDetailsAttendee.special_event_request?.enabled || activeDetailsAttendee.special_event_request?.type || activeDetailsAttendee.special_notes) && (
                  <div className="bg-gradient-to-r from-amber-500/15 to-purple-500/15 border border-amber-500/30 rounded-2xl p-4 space-y-2">
                    <p className="text-[10px] font-black text-amber-300 uppercase tracking-widest flex items-center gap-1.5">
                      ✨ Special Celebration Request
                    </p>
                    {activeDetailsAttendee.special_event_request?.type && (
                      <div>
                        <span className="text-white/40 block text-[11px]">Celebration Type</span>
                        <strong className="text-amber-300 text-xs font-bold">
                          {activeDetailsAttendee.special_event_request.type}
                        </strong>
                      </div>
                    )}
                    {(activeDetailsAttendee.special_event_request?.details || activeDetailsAttendee.special_notes) && (
                      <div>
                        <span className="text-white/40 block text-[11px]">Surprise Instructions & Details</span>
                        <p className="text-white/90 whitespace-pre-wrap leading-relaxed text-xs">
                          {activeDetailsAttendee.special_event_request?.details || activeDetailsAttendee.special_notes}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* 6. Group Attendees & Guests List */}
                {Array.isArray(activeDetailsAttendee.additional_attendees) && activeDetailsAttendee.additional_attendees.length > 0 && (
                  <div className="bg-white/4 border border-white/10 rounded-2xl p-4 space-y-3">
                    <p className="text-[10px] font-black text-white/50 uppercase tracking-widest flex items-center gap-1.5">
                      👥 Additional Group Attendees ({activeDetailsAttendee.additional_attendees.length})
                    </p>
                    <div className="divide-y divide-white/8 space-y-2">
                      {activeDetailsAttendee.additional_attendees.map((guest: { name?: string; nic?: string; phone?: string }, idx: number) => (
                        <div key={idx} className="pt-2 first:pt-0 flex items-center justify-between text-xs">
                          <div>
                            <span className="text-white font-bold block">{guest.name || `Guest ${idx + 2}`}</span>
                            <span className="text-white/40 text-[11px]">NIC: {guest.nic || '—'}</span>
                          </div>
                          <span className="text-[#c1e527] font-mono text-[11px]">{guest.phone || '—'}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer Actions */}
              <div className="flex flex-col sm:flex-row gap-3 pt-3 border-t border-white/10">
                <button
                  onClick={() => {
                    const att = activeDetailsAttendee;
                    setActiveDetailsAttendee(null);
                    setActiveTicketAttendee(att);
                  }}
                  className="flex-1 flex items-center justify-center gap-2 bg-[#c1e527] hover:bg-[#b0d420] text-section-ink font-black py-3 rounded-xl text-xs transition-all shadow-lg"
                >
                  <Ticket className="w-4 h-4" /> View QR Pass Ticket
                </button>
                <button
                  onClick={() => setActiveDetailsAttendee(null)}
                  className="flex-1 bg-white/10 hover:bg-white/15 text-white font-bold py-3 rounded-xl text-xs transition-colors border border-white/15"
                >
                  Close Details
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
