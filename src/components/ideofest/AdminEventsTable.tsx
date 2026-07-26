'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Eye, Edit, Trash2, Loader2, CheckCircle2, AlertCircle, X, Save, Ticket, ImagePlus } from 'lucide-react';
import type { IEvent, EventCategory, EventStatus, PaymentMethod } from '@/lib/ideofest/types';

const STATUS_BADGE: Record<string, string> = {
  published: 'bg-signal-lime/15 text-signal-lime border border-signal-lime/30',
  draft: 'bg-white/10 text-white/50 border border-white/20',
  sold_out: 'bg-creative-flame/15 text-creative-flame border border-creative-flame/30',
  cancelled: 'bg-red-500/15 text-red-400 border border-red-500/30',
  completed: 'bg-digital-pulse/15 text-digital-pulse border border-digital-pulse/30',
};

export default function AdminEventsTable({ initialEvents }: { initialEvents: IEvent[] }) {
  const [events, setEvents] = useState<IEvent[]>(initialEvents);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingEvent, setEditingEvent] = useState<IEvent | null>(null);
  const [savingEdit, setSavingEdit] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Edit form state
  const [editTitle, setEditTitle] = useState('');
  const [editTagline, setEditTagline] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editCategory, setEditCategory] = useState<EventCategory>('music');
  const [editVenue, setEditVenue] = useState('');
  const [editCity, setEditCity] = useState('');
  const [editStatus, setEditStatus] = useState<EventStatus>('published');
  const [editFeatured, setEditFeatured] = useState(false);
  const [editImageUrl, setEditImageUrl] = useState('');
  const [editPaymentMethods, setEditPaymentMethods] = useState<PaymentMethod[]>(['bank_transfer', 'payhere']);
  const [editBankName, setEditBankName] = useState('');
  const [editBankAccountName, setEditBankAccountName] = useState('');
  const [editBankAccountNo, setEditBankAccountNo] = useState('');
  const [editBankBranch, setEditBankBranch] = useState('');

  // Lock background scrolling while edit modal is open
  useEffect(() => {
    if (editingEvent) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [editingEvent]);

  function showNotification(message: string, type: 'success' | 'error' = 'success') {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  }

  function openEditModal(event: IEvent) {
    setEditingEvent(event);
    setEditTitle(event.title || '');
    setEditTagline(event.tagline || '');
    setEditDescription(event.description || '');
    setEditCategory(event.category || 'music');
    setEditVenue(event.venue || '');
    setEditCity(event.city || '');
    setEditStatus(event.status || 'published');
    setEditFeatured(event.featured || false);
    setEditImageUrl(event.image_url || '');
    setEditPaymentMethods(event.payment_methods || ['bank_transfer', 'payhere']);
    setEditBankName(event.bank_name || '');
    setEditBankAccountName(event.bank_account_name || '');
    setEditBankAccountNo(event.bank_account_no || '');
    setEditBankBranch(event.bank_branch || '');
  }

  async function handleImageUpload(file: File) {
    setUploadingImage(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('type', 'event_image');

      const res = await fetch('/api/ideofest/upload', { method: 'POST', body: fd });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'Upload failed');

      setEditImageUrl(json.data.url);
      showNotification('Banner image uploaded to Cloudinary successfully');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Upload failed';
      showNotification(msg, 'error');
    } finally {
      setUploadingImage(false);
    }
  }

  async function handleStatusChange(eventId: string, newStatus: string) {
    setUpdatingId(eventId);
    try {
      const res = await fetch('/api/ideofest/events', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: eventId, status: newStatus }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'Failed to update status');

      setEvents((prev) =>
        prev.map((evt) => (evt.id === eventId ? { ...evt, status: newStatus as any } : evt))
      );
      showNotification(`Event status updated to "${newStatus.replace('_', ' ')}"`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Status update failed';
      showNotification(msg, 'error');
    } finally {
      setUpdatingId(null);
    }
  }

  async function handleSaveEdit() {
    if (!editingEvent?.id) return;
    setSavingEdit(true);
    try {
      const res = await fetch('/api/ideofest/events', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingEvent.id,
          title: editTitle,
          tagline: editTagline,
          description: editDescription,
          category: editCategory,
          venue: editVenue,
          city: editCity,
          status: editStatus,
          featured: editFeatured,
          image_url: editImageUrl,
          payment_methods: editPaymentMethods,
          bank_name: editBankName,
          bank_account_name: editBankAccountName,
          bank_account_no: editBankAccountNo,
          bank_branch: editBankBranch,
        }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'Failed to update event');

      setEvents((prev) =>
        prev.map((evt) =>
          evt.id === editingEvent.id
            ? {
                ...evt,
                title: editTitle,
                tagline: editTagline,
                description: editDescription,
                category: editCategory,
                venue: editVenue,
                city: editCity,
                status: editStatus,
                featured: editFeatured,
                image_url: editImageUrl,
                payment_methods: editPaymentMethods,
                bank_name: editBankName,
                bank_account_name: editBankAccountName,
                bank_account_no: editBankAccountNo,
                bank_branch: editBankBranch,
              }
            : evt
        )
      );

      showNotification(`Event "${editTitle}" updated successfully`);
      setEditingEvent(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Update failed';
      showNotification(msg, 'error');
    } finally {
      setSavingEdit(false);
    }
  }

  async function handleDelete(eventId: string, title: string) {
    if (!confirm(`Are you sure you want to delete "${title}"? This action cannot be undone.`)) {
      return;
    }
    setDeletingId(eventId);
    try {
      const res = await fetch(`/api/ideofest/events?id=${encodeURIComponent(eventId)}`, {
        method: 'DELETE',
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'Failed to delete event');

      setEvents((prev) => prev.filter((evt) => evt.id !== eventId));
      showNotification(`Event "${title}" deleted successfully`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Delete failed';
      showNotification(msg, 'error');
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="bg-white/5 border border-white/8 rounded-2xl overflow-hidden relative">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 border backdrop-blur-md text-sm font-semibold animate-in fade-in slide-in-from-bottom-5 ${
            toast.type === 'success' ? 'bg-signal-lime/20 border-signal-lime/40 text-signal-lime' : 'bg-red-500/20 border-red-500/40 text-red-400'
          }`}
        >
          {toast.type === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Edit Event Modal */}
      {editingEvent && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#121216] border border-white/10 rounded-2xl p-6 sm:p-8 max-w-xl w-full text-white shadow-2xl relative animate-in fade-in zoom-in-95 my-8">
            <button
              onClick={() => setEditingEvent(null)}
              className="absolute top-4 right-4 p-2 text-white/50 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-xl font-black mb-1">Edit Event Details</h2>
            <p className="text-xs text-white/40 mb-6">Re-upload banner, update payment methods, category, or status.</p>

            <div className="space-y-4 text-sm">
              {/* Event Banner Image Upload */}
              <div>
                <label className="block text-xs font-semibold text-white/50 mb-1">Event Banner Image</label>
                {editImageUrl && (
                  <div className="relative w-full h-36 rounded-xl overflow-hidden mb-3 border border-white/10 group">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={editImageUrl} alt="Banner Preview" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="text-xs font-bold text-white bg-black/60 px-3 py-1.5 rounded-lg border border-white/20">Current Banner</span>
                    </div>
                  </div>
                )}
                <div className="flex gap-2">
                  <label className="flex-1 flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/12 rounded-xl px-4 py-2.5 cursor-pointer text-xs font-bold transition-all text-white/80 hover:text-white">
                    {uploadingImage ? <Loader2 className="w-4 h-4 animate-spin text-signal-lime" /> : <ImagePlus className="w-4 h-4 text-signal-lime" />}
                    <span>{uploadingImage ? 'Uploading to Cloudinary...' : 'Upload New Banner Image'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleImageUpload(file);
                      }}
                    />
                  </label>
                </div>
                <input
                  type="text"
                  value={editImageUrl}
                  onChange={(e) => setEditImageUrl(e.target.value)}
                  placeholder="Or enter direct Image URL (https://...)"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs text-white/70 focus:outline-none focus:border-signal-lime mt-2"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/50 mb-1">Title</label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-signal-lime"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/50 mb-1">Tagline</label>
                <input
                  type="text"
                  value={editTagline}
                  onChange={(e) => setEditTagline(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-signal-lime"
                />
              </div>

              {/* Editable Payment Methods */}
              <div className="bg-white/3 border border-white/8 rounded-xl p-4">
                <label className="block text-xs font-semibold text-white/70 uppercase tracking-widest mb-3">
                  Allowed Payment Methods
                </label>
                <div className="flex flex-wrap gap-4 text-xs font-bold">
                  <label className="flex items-center gap-2 cursor-pointer text-white">
                    <input
                      type="checkbox"
                      checked={editPaymentMethods.includes('bank_transfer')}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setEditPaymentMethods((prev) => [...prev.filter((m) => m !== 'bank_transfer'), 'bank_transfer']);
                        } else {
                          setEditPaymentMethods((prev) => prev.filter((m) => m !== 'bank_transfer'));
                        }
                      }}
                      className="w-4 h-4 rounded border-white/20 bg-white/5 text-signal-lime focus:ring-0"
                    />
                    <span>🏦 Bank Transfer (Receipt Upload)</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer text-white">
                    <input
                      type="checkbox"
                      checked={editPaymentMethods.includes('payhere')}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setEditPaymentMethods((prev) => [...prev.filter((m) => m !== 'payhere'), 'payhere']);
                        } else {
                          setEditPaymentMethods((prev) => prev.filter((m) => m !== 'payhere'));
                        }
                      }}
                      className="w-4 h-4 rounded border-white/20 bg-white/5 text-signal-lime focus:ring-0"
                    />
                    <span>💳 PayHere (Online Card / NetBanking)</span>
                  </label>
                </div>

                {/* Editable Bank Details */}
                {editPaymentMethods.includes('bank_transfer') && (
                  <div className="grid grid-cols-2 gap-3 mt-4 pt-3 border-t border-white/8">
                    <div>
                      <label className="block text-[10px] font-semibold text-white/40 mb-1">Bank Name</label>
                      <input
                        type="text"
                        value={editBankName}
                        onChange={(e) => setEditBankName(e.target.value)}
                        placeholder="Commercial Bank"
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-white/40 mb-1">Account Name</label>
                      <input
                        type="text"
                        value={editBankAccountName}
                        onChange={(e) => setEditBankAccountName(e.target.value)}
                        placeholder="Ideomint Ltd"
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-white/40 mb-1">Account Number</label>
                      <input
                        type="text"
                        value={editBankAccountNo}
                        onChange={(e) => setEditBankAccountNo(e.target.value)}
                        placeholder="1000984721"
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-white/40 mb-1">Branch</label>
                      <input
                        type="text"
                        value={editBankBranch}
                        onChange={(e) => setEditBankBranch(e.target.value)}
                        placeholder="Colombo Main"
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-white/50 mb-1">Category</label>
                  <select
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value as EventCategory)}
                    className="w-full bg-neutral-900 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-signal-lime"
                  >
                    <option value="music">Music</option>
                    <option value="tech">Tech</option>
                    <option value="art">Art</option>
                    <option value="wellness">Wellness</option>
                    <option value="film">Film</option>
                    <option value="gaming">Gaming</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-white/50 mb-1">Status</label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as EventStatus)}
                    className="w-full bg-neutral-900 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-signal-lime"
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                    <option value="sold_out">Sold Out</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-white/50 mb-1">Venue</label>
                  <input
                    type="text"
                    value={editVenue}
                    onChange={(e) => setEditVenue(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-signal-lime"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-white/50 mb-1">City</label>
                  <input
                    type="text"
                    value={editCity}
                    onChange={(e) => setEditCity(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-signal-lime"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/50 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-signal-lime resize-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="editFeatured"
                  checked={editFeatured}
                  onChange={(e) => setEditFeatured(e.target.checked)}
                  className="w-4 h-4 rounded border-white/20 bg-white/5 text-signal-lime focus:ring-0"
                />
                <label htmlFor="editFeatured" className="text-xs font-semibold text-white/80 cursor-pointer">
                  Feature on Landing Page Header
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 mt-8">
              <button
                type="button"
                onClick={() => setEditingEvent(null)}
                className="px-5 py-2.5 rounded-xl border border-white/10 text-white/70 hover:text-white hover:bg-white/5 text-sm font-bold transition-all"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveEdit}
                disabled={savingEdit || uploadingImage}
                className="flex items-center gap-2 bg-signal-lime hover:bg-[#b8e85a] text-section-ink px-6 py-2.5 rounded-xl font-bold text-sm transition-all shadow-lg shadow-signal-lime/10 disabled:opacity-50"
              >
                {savingEdit ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-white/30 text-xs uppercase tracking-widest border-b border-white/8 bg-white/3">
              <th className="px-5 py-4">Event</th>
              <th className="px-5 py-4">Date</th>
              <th className="px-5 py-4">Status & Control</th>
              <th className="px-5 py-4">Tickets Sold</th>
              <th className="px-5 py-4">Revenue</th>
              <th className="px-5 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {events.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-12 text-white/30">
                  No events found in festival catalog.
                </td>
              </tr>
            ) : (
              events.map((event) => {
                const tiers = event.ticket_tiers || [];
                const sold = tiers.reduce((s, t) => s + (t.sold || 0), 0);
                const cap = tiers.reduce((s, t) => s + (t.capacity || 0), 0);
                const rev = tiers.reduce((s, t) => s + (t.price || 0) * (t.sold || 0), 0);
                const isUpdating = updatingId === event.id;
                const isDeleting = deletingId === event.id;

                return (
                  <tr key={event.id || event.slug} className="border-b border-white/5 hover:bg-white/3 transition-colors">
                    {/* Title & Location */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        {event.image_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={event.image_url} alt={event.title} className="w-10 h-10 rounded-lg object-cover border border-white/10 shrink-0" />
                        ) : null}
                        <div>
                          <p className="font-semibold text-white truncate max-w-[200px]">{event.title}</p>
                          <p className="text-xs text-white/40 mt-0.5">{event.venue}, {event.city}</p>
                        </div>
                      </div>
                    </td>

                    {/* Date */}
                    <td className="px-5 py-4 text-white/60 whitespace-nowrap">
                      {new Date(event.date).toLocaleDateString('en-LK', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>

                    {/* Status Dropdown Control */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        {isUpdating ? <Loader2 className="w-4 h-4 animate-spin text-signal-lime shrink-0" /> : null}
                        <select
                          value={event.status}
                          onChange={(e) => handleStatusChange(String(event.id || ''), e.target.value)}
                          disabled={isUpdating || isDeleting}
                          className={`text-xs font-bold px-3 py-1.5 rounded-xl border bg-black/60 capitalize cursor-pointer focus:outline-none focus:ring-2 focus:ring-signal-lime/50 transition-all ${
                            STATUS_BADGE[event.status] || 'bg-white/10 text-white'
                          }`}
                        >
                          <option value="draft" className="bg-neutral-900 text-white/70">Draft</option>
                          <option value="published" className="bg-neutral-900 text-signal-lime">Published</option>
                          <option value="sold_out" className="bg-neutral-900 text-creative-flame">Sold Out</option>
                          <option value="completed" className="bg-neutral-900 text-digital-pulse">Completed</option>
                          <option value="cancelled" className="bg-neutral-900 text-red-400">Cancelled</option>
                        </select>
                      </div>
                    </td>

                    {/* Tickets Sold */}
                    <td className="px-5 py-4">
                      <div>
                        <span className="font-semibold text-white">{sold}</span>
                        <span className="text-white/30"> / {cap}</span>
                      </div>
                      <div className="w-20 h-1 bg-white/10 rounded-full mt-1.5 overflow-hidden">
                        <div className="h-full bg-signal-lime rounded-full" style={{ width: cap > 0 ? `${(sold / cap) * 100}%` : '0%' }} />
                      </div>
                    </td>

                    {/* Revenue */}
                    <td className="px-5 py-4 font-bold text-white whitespace-nowrap">LKR {rev.toLocaleString('en-LK')}</td>

                    {/* Actions */}
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Booked Tickets Link */}
                        <Link
                          href={`/ideofest/admin/verifications?event_id=${event.id}`}
                          title="View Booked Tickets for this Event"
                          className="px-2.5 py-1.5 bg-signal-lime/10 hover:bg-signal-lime/20 border border-signal-lime/30 rounded-xl transition-all text-signal-lime flex items-center gap-1.5 text-xs font-bold"
                        >
                          <Ticket className="w-3.5 h-3.5" />
                          <span>Booked</span>
                        </Link>
                        {/* Eye Link: Open public event page */}
                        <Link
                          href={`/ideofest/events/${event.slug}`}
                          target="_blank"
                          title="View Public Page"
                          className="p-2 hover:bg-white/10 rounded-xl transition-colors text-white/50 hover:text-white"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        {/* Edit Button */}
                        <button
                          onClick={() => openEditModal(event)}
                          title="Edit Event Details"
                          className="p-2 hover:bg-white/10 rounded-xl transition-colors text-white/50 hover:text-signal-lime"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        {/* Delete Button */}
                        <button
                          onClick={() => handleDelete(String(event.id || ''), event.title)}
                          disabled={isDeleting || isUpdating}
                          title="Delete Event"
                          className="p-2 hover:bg-red-500/20 text-white/40 hover:text-red-400 rounded-xl transition-colors disabled:opacity-30"
                        >
                          {isDeleting ? <Loader2 className="w-4 h-4 animate-spin text-red-400" /> : <Trash2 className="w-4 h-4" />}
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
    </div>
  );
}
