'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Upload, X, Loader2, Check, CreditCard, Building2, Ticket, Sparkles } from 'lucide-react';
import { CATEGORY_LABELS } from '@/lib/ideofest/mock-data';

interface TierForm {
  name: string;
  label: string;
  price: string;
  capacity: string;
  perks: string;
}

const TIERS_DEFAULT: TierForm[] = [
  { name: 'standard', label: 'Standard Pass', price: '1500', capacity: '200', perks: 'General admission\nFestival lanyard' },
];

export default function AdminCreateEventPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageUrlInput, setImageUrlInput] = useState<string>('');
  const [tiers, setTiers] = useState<TierForm[]>(TIERS_DEFAULT);

  const [form, setForm] = useState({
    title: '',
    tagline: '',
    description: '',
    category: 'music',
    date: '',
    endDate: '',
    venue: '',
    city: '',
    country: 'Sri Lanka',
    guestBookingAllowed: true,
    featured: false,
  });

  const [paymentMethods, setPaymentMethods] = useState<{ bank_transfer: boolean; payhere: boolean; free: boolean }>({
    bank_transfer: true,
    payhere: true,
    free: false,
  });

  const [bankDetails, setBankDetails] = useState({
    bankName: 'Commercial Bank of Ceylon',
    bankAccountName: 'Ideomint Entertainment Ltd',
    bankAccountNo: '1000984721',
    bankBranch: 'Colombo Main Branch',
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const addTier = () =>
    setTiers([...tiers, { name: 'vip', label: 'VIP Pass', price: '4500', capacity: '50', perks: 'VIP Lounge access\nFree drinks' }]);

  const removeTier = (i: number) => setTiers(tiers.filter((_, idx) => idx !== i));

  const togglePaymentMethod = (method: 'bank_transfer' | 'payhere' | 'free') => {
    setPaymentMethods((prev) => ({ ...prev, [method]: !prev[method] }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      let finalImageUrl = imageUrlInput.trim();

      // If user selected a file, upload it to /api/ideofest/upload first
      if (imageFile) {
        const uploadFd = new FormData();
        uploadFd.append('file', imageFile);
        uploadFd.append('type', 'event_image');

        const uploadRes = await fetch('/api/ideofest/upload', {
          method: 'POST',
          body: uploadFd,
        });

        const uploadData = await uploadRes.json();
        if (uploadData.success && uploadData.data?.publicUrl) {
          finalImageUrl = uploadData.data.publicUrl;
        }
      }

      const activePaymentMethods = (Object.keys(paymentMethods) as ('bank_transfer' | 'payhere' | 'free')[]).filter(
        (m) => paymentMethods[m]
      );

      const slug = form.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

      const payload = {
        title: form.title,
        slug: slug || `event-${Date.now()}`,
        tagline: form.tagline,
        description: form.description,
        category: form.category,
        date: form.date,
        end_date: form.endDate || null,
        venue: form.venue,
        city: form.city,
        country: form.country,
        image_url: finalImageUrl || 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?auto=format&fit=crop&q=80&w=1200',
        guest_booking_allowed: form.guestBookingAllowed,
        featured: form.featured,
        payment_methods: activePaymentMethods.length > 0 ? activePaymentMethods : ['bank_transfer'],
        bank_name: bankDetails.bankName,
        bank_account_name: bankDetails.bankAccountName,
        bank_account_no: bankDetails.bankAccountNo,
        bank_branch: bankDetails.bankBranch,
        organizer_id: 'admin',
        organizer_name: 'Ideomint Admin',
        status: 'published',
        ticket_tiers: tiers.map((t) => ({
          name: t.name,
          label: t.label,
          price: Number(t.price) || 0,
          capacity: Number(t.capacity) || 100,
          currency: 'LKR',
          perks: t.perks.split('\n').filter(Boolean),
        })),
      };

      const res = await fetch('/api/ideofest/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      if (!result.success) throw new Error(result.error || 'Failed to create event');
      setDone(true);
      setTimeout(() => router.push('/ideofest/admin/events'), 1800);
    } catch (e) {
      console.error(e);
      alert('Error: ' + (e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-center">
        <div className="w-16 h-16 rounded-full bg-signal-lime/20 flex items-center justify-center mb-4 border border-signal-lime/40">
          <Check className="w-8 h-8 text-signal-lime" />
        </div>
        <h2 className="text-2xl font-black">Event Published Successfully!</h2>
        <p className="text-white/50 mt-2">Redirecting to admin events manager…</p>
      </div>
    );
  }

  const inputClass =
    'w-full bg-white/5 border border-white/12 focus:border-signal-lime rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none transition-colors';
  const labelClass = 'block text-xs font-bold text-white/50 uppercase tracking-widest mb-2';

  return (
    <div className="max-w-3xl">
      <div className="mb-8">
        <h1 className="text-3xl font-black">Create New Festival Event</h1>
        <p className="text-white/40 text-sm mt-1">Step {step} of 3 — Configure event details, ticket tiers, payment options, and banner media</p>
      </div>

      {/* Progress Bar */}
      <div className="flex gap-2 mb-8">
        {[1, 2, 3].map((s) => (
          <div key={s} className={`h-1.5 flex-1 rounded-full transition-all ${step >= s ? 'bg-signal-lime' : 'bg-white/10'}`} />
        ))}
      </div>

      {/* Step 1 — Basic Event Details */}
      {step === 1 && (
        <div className="flex flex-col gap-5">
          <div>
            <label className={labelClass}>Event Title *</label>
            <input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className={inputClass}
              placeholder="e.g. Ideomint Music Fest 2026"
            />
          </div>
          <div>
            <label className={labelClass}>Tagline</label>
            <input
              value={form.tagline}
              onChange={(e) => setForm({ ...form, tagline: e.target.value })}
              className={inputClass}
              placeholder="Short punchy subtitle"
            />
          </div>
          <div>
            <label className={labelClass}>Description *</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={4}
              className={inputClass + ' resize-none'}
              placeholder="What can attendees expect? Details about artists, schedule, experience..."
            />
          </div>
          <div>
            <label className={labelClass}>Category *</label>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className={inputClass}
            >
              {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
                <option key={k} value={k} className="bg-neutral-900 text-white">
                  {v}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Start Date & Time *</label>
              <input
                type="datetime-local"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>End Date & Time</label>
              <input
                type="datetime-local"
                value={form.endDate}
                onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                className={inputClass}
              />
            </div>
          </div>
          <div>
            <label className={labelClass}>Venue Location *</label>
            <input
              value={form.venue}
              onChange={(e) => setForm({ ...form, venue: e.target.value })}
              className={inputClass}
              placeholder="e.g. Lotus Tower Arena, Colombo 10"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>City *</label>
              <input
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                className={inputClass}
                placeholder="e.g. Colombo"
              />
            </div>
            <div>
              <label className={labelClass}>Country</label>
              <input
                value={form.country}
                onChange={(e) => setForm({ ...form, country: e.target.value })}
                className={inputClass}
              />
            </div>
          </div>

          <div className="flex items-center gap-3 bg-white/5 border border-white/10 p-4 rounded-xl">
            <input
              type="checkbox"
              id="guestBooking"
              checked={form.guestBookingAllowed}
              onChange={(e) => setForm({ ...form, guestBookingAllowed: e.target.checked })}
              className="w-4 h-4 accent-signal-lime"
            />
            <label htmlFor="guestBooking" className="text-sm font-semibold cursor-pointer">
              Allow guest bookings without requiring an account login
            </label>
          </div>

          <button
            onClick={() => setStep(2)}
            disabled={!form.title || !form.description || !form.date || !form.venue || !form.city}
            className="w-full mt-2 py-4 bg-signal-lime hover:bg-[#b8e85a] disabled:opacity-40 text-section-ink font-black rounded-xl transition-colors"
          >
            Next: Ticket Tiers & Payment Options →
          </button>
        </div>
      )}

      {/* Step 2 — Ticket Tiers & Payment Methods */}
      {step === 2 && (
        <div className="flex flex-col gap-6">
          {/* Ticket Tiers Section */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Ticket className="w-5 h-5 text-signal-lime" />
              <h3 className="text-lg font-black">Ticket Pricing Tiers</h3>
            </div>

            <div className="flex flex-col gap-4 mb-4">
              {tiers.map((t, i) => (
                <div key={i} className="bg-white/5 border border-white/12 rounded-2xl p-5 relative">
                  {tiers.length > 1 && (
                    <button
                      onClick={() => removeTier(i)}
                      className="absolute top-4 right-4 text-white/30 hover:text-red-400 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                    <div>
                      <label className={labelClass}>Tier Category</label>
                      <select
                        value={t.name}
                        onChange={(e) => setTiers(tiers.map((x, xi) => (xi === i ? { ...x, name: e.target.value } : x)))}
                        className={inputClass + ' text-sm'}
                      >
                        {['free', 'early_bird', 'standard', 'vip'].map((n) => (
                          <option key={n} value={n} className="bg-neutral-900 text-white">
                            {n.toUpperCase().replace('_', ' ')}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className={labelClass}>Tier Label / Display Name</label>
                      <input
                        value={t.label}
                        onChange={(e) => setTiers(tiers.map((x, xi) => (xi === i ? { ...x, label: e.target.value } : x)))}
                        className={inputClass + ' text-sm'}
                        placeholder="e.g. VIP Access Pass"
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Price (LKR - Rs.)</label>
                      <input
                        type="number"
                        min="0"
                        value={t.price}
                        onChange={(e) => setTiers(tiers.map((x, xi) => (xi === i ? { ...x, price: e.target.value } : x)))}
                        className={inputClass + ' text-sm'}
                        placeholder="0 for free"
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Total Capacity</label>
                      <input
                        type="number"
                        min="1"
                        value={t.capacity}
                        onChange={(e) => setTiers(tiers.map((x, xi) => (xi === i ? { ...x, capacity: e.target.value } : x)))}
                        className={inputClass + ' text-sm'}
                        placeholder="100"
                      />
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>Perks (one per line)</label>
                    <textarea
                      value={t.perks}
                      onChange={(e) => setTiers(tiers.map((x, xi) => (xi === i ? { ...x, perks: e.target.value } : x)))}
                      rows={3}
                      className={inputClass + ' resize-none text-sm'}
                      placeholder={'General admission\nWelcome beverage'}
                    />
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={addTier}
              className="w-full py-3 border border-dashed border-white/20 rounded-xl text-white/60 hover:text-white hover:border-signal-lime/50 transition-colors text-sm font-bold flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-signal-lime" /> + Add Another Ticket Tier
            </button>
          </div>

          <hr className="border-white/10" />

          {/* Payment Methods Section */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <CreditCard className="w-5 h-5 text-signal-lime" />
              <h3 className="text-lg font-black">Supported Payment Methods</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
              <label
                className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                  paymentMethods.bank_transfer
                    ? 'bg-signal-lime/10 border-signal-lime text-white'
                    : 'bg-white/5 border-white/10 text-white/50'
                }`}
              >
                <input
                  type="checkbox"
                  checked={paymentMethods.bank_transfer}
                  onChange={() => togglePaymentMethod('bank_transfer')}
                  className="w-4 h-4 accent-signal-lime"
                />
                <div>
                  <p className="font-bold text-sm">Bank Transfer</p>
                  <p className="text-xs text-white/40">Slip upload & manual approval</p>
                </div>
              </label>

              <label
                className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                  paymentMethods.payhere
                    ? 'bg-signal-lime/10 border-signal-lime text-white'
                    : 'bg-white/5 border-white/10 text-white/50'
                }`}
              >
                <input
                  type="checkbox"
                  checked={paymentMethods.payhere}
                  onChange={() => togglePaymentMethod('payhere')}
                  className="w-4 h-4 accent-signal-lime"
                />
                <div>
                  <p className="font-bold text-sm">PayHere Online</p>
                  <p className="text-xs text-white/40">Credit / Debit card gateway</p>
                </div>
              </label>

              <label
                className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                  paymentMethods.free
                    ? 'bg-signal-lime/10 border-signal-lime text-white'
                    : 'bg-white/5 border-white/10 text-white/50'
                }`}
              >
                <input
                  type="checkbox"
                  checked={paymentMethods.free}
                  onChange={() => togglePaymentMethod('free')}
                  className="w-4 h-4 accent-signal-lime"
                />
                <div>
                  <p className="font-bold text-sm">Free Ticket</p>
                  <p className="text-xs text-white/40">Instant pass issuance</p>
                </div>
              </label>
            </div>

            {/* Bank Account Details Override */}
            {paymentMethods.bank_transfer && (
              <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-3 text-white/70 text-sm font-bold">
                  <Building2 className="w-4 h-4 text-signal-lime" /> Bank Details for Slip Transfer
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className={labelClass}>Bank Name</label>
                    <input
                      value={bankDetails.bankName}
                      onChange={(e) => setBankDetails({ ...bankDetails, bankName: e.target.value })}
                      className={inputClass + ' text-sm'}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Account Name</label>
                    <input
                      value={bankDetails.bankAccountName}
                      onChange={(e) => setBankDetails({ ...bankDetails, bankAccountName: e.target.value })}
                      className={inputClass + ' text-sm'}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Account Number</label>
                    <input
                      value={bankDetails.bankAccountNo}
                      onChange={(e) => setBankDetails({ ...bankDetails, bankAccountNo: e.target.value })}
                      className={inputClass + ' text-sm'}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Branch</label>
                    <input
                      value={bankDetails.bankBranch}
                      onChange={(e) => setBankDetails({ ...bankDetails, bankBranch: e.target.value })}
                      className={inputClass + ' text-sm'}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-3 mt-4">
            <button
              onClick={() => setStep(1)}
              className="flex-1 py-4 bg-white/8 hover:bg-white/12 text-white font-bold rounded-xl transition-colors"
            >
              ← Back
            </button>
            <button
              onClick={() => setStep(3)}
              className="flex-1 py-4 bg-signal-lime hover:bg-[#b8e85a] text-section-ink font-black rounded-xl transition-colors"
            >
              Next: Banner Media →
            </button>
          </div>
        </div>
      )}

      {/* Step 3 — Banner Image Media */}
      {step === 3 && (
        <div className="flex flex-col gap-6">
          <div>
            <label className={labelClass}>Event Banner Image Upload</label>
            <label className="block cursor-pointer">
              <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
              {imagePreview ? (
                <div className="relative w-full aspect-video rounded-2xl overflow-hidden border border-white/12">
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    <p className="text-white font-semibold text-sm">Click to replace image file</p>
                  </div>
                </div>
              ) : (
                <div className="w-full aspect-video rounded-2xl border-2 border-dashed border-white/20 hover:border-signal-lime/50 bg-white/3 flex flex-col items-center justify-center gap-3 transition-colors">
                  <Upload className="w-8 h-8 text-white/30" />
                  <p className="text-sm text-white/50">Click to choose image file</p>
                  <p className="text-xs text-white/30">PNG, JPG, WebP · Max 10MB</p>
                </div>
              )}
            </label>
          </div>

          <div className="flex flex-col gap-2">
            <label className={labelClass}>Or Enter Image URL directly</label>
            <input
              type="url"
              value={imageUrlInput}
              onChange={(e) => setImageUrlInput(e.target.value)}
              className={inputClass}
              placeholder="https://images.unsplash.com/..."
            />
          </div>

          <div className="flex gap-3 mt-6">
            <button
              onClick={() => setStep(2)}
              className="flex-1 py-4 bg-white/8 hover:bg-white/12 text-white font-bold rounded-xl transition-colors"
            >
              ← Back
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1 py-4 bg-signal-lime hover:bg-[#b8e85a] disabled:opacity-60 text-section-ink font-black rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" /> Publishing Event...
                </>
              ) : (
                'Publish Event'
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
