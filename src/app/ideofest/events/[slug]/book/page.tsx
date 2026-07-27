'use client';

import { use, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import BookingSteps from '@/components/ideofest/BookingSteps';
import QRTicket from '@/components/ideofest/QRTicket';
import type { ITicketTier, IBooking, IEvent } from '@/lib/ideofest/types';
import {
  ArrowLeft, ArrowRight, Loader2, ShieldCheck, Ticket, Upload,
  CreditCard, Landmark, ChevronDown, ChevronUp, Phone, User, MapPin,
  AlertTriangle, Building2, FileText,
} from 'lucide-react';

const STEPS = [
  { id: 1, label: 'Select Ticket' },
  { id: 2, label: 'Your Details' },
  { id: 3, label: 'Payment' },
  { id: 4, label: 'Confirmation' },
];

const SRI_LANKA_DISTRICTS = [
  'Colombo','Gampaha','Kalutara','Kandy','Matale','Nuwara Eliya',
  'Galle','Matara','Hambantota','Jaffna','Kilinochchi','Mannar',
  'Mullaitivu','Vavuniya','Trincomalee','Batticaloa','Ampara',
  'Kurunegala','Puttalam','Anuradhapura','Polonnaruwa','Badulla',
  'Moneragala','Ratnapura','Kegalle',
];

function FormField({
  id, label, required, error, children,
}: {
  id: string; label: string; required?: boolean; error?: string; children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-xs font-bold text-white/50 uppercase tracking-widest mb-2">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      {children}
      {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
    </div>
  );
}

function InputField({
  id, type = 'text', placeholder, value, onChange, error, ...rest
}: {
  id: string; type?: string; placeholder?: string; value: string;
  onChange: (v: string) => void; error?: string;
  [key: string]: unknown;
}) {
  return (
    <input
      id={id}
      type={type}
      value={value}
      onChange={(e) => onChange(e.currentTarget.value)}
      placeholder={placeholder}
      className={`w-full bg-white/5 border rounded-xl px-4 py-3.5 text-white placeholder-white/30 focus:outline-none transition-colors ${
        error ? 'border-red-500 focus:border-red-400' : 'border-white/12 focus:border-signal-lime'
      }`}
      {...rest}
    />
  );
}

export default function BookingPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const router = useRouter();

  const [event, setEvent] = useState<IEvent | null>(null);
  const [loadingEvent, setLoadingEvent] = useState(true);
  const [step, setStep] = useState(1);

  // Step 1
  const [selectedTier, setSelectedTier] = useState<ITicketTier | null>(null);
  const [quantity, setQuantity] = useState(1);

  // Step 2 — Full attendee form
  const [form, setForm] = useState({
    name: '', email: '', phone: '', nic: '',
    address1: '', address2: '', city: '', district: '', postal: '', country: 'Sri Lanka',
    emergencyName: '', emergencyPhone: '',
    company: '', jobTitle: '', notes: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showOptional, setShowOptional] = useState(false);

  // Step 3 — Payment
  const [booking, setBooking] = useState<IBooking | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'bank_transfer' | 'payhere' | null>(null);
  const [slipFile, setSlipFile] = useState<File | null>(null);
  const [uploadingSlip, setUploadingSlip] = useState(false);
  const [slipUploaded, setSlipUploaded] = useState(false);

  const [loading, setLoading] = useState(false);

  // Load event
  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const res = await fetch(`/api/ideofest/events?slug=${slug}`);
        const json = await res.json();
        if (active && json.success) {
          const ev = json.data as IEvent;
          setEvent(ev);
          // Auto-select if only one tier available
          const tiers: ITicketTier[] = ev.ticket_tiers || [];
          const available = tiers.filter(t => t.capacity - t.sold > 0);
          if (available.length === 1) {
            setSelectedTier(available[0]);
          }
        }
      } catch (err) {
        console.error('Failed to load event:', err);
      } finally {
        if (active) setLoadingEvent(false);
      }
    }
    load();
    return () => { active = false; };
  }, [slug]);

  if (loadingEvent) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 text-signal-lime animate-spin mb-4" />
        <p className="text-white/50 text-sm">Loading event...</p>
      </div>
    );
  }
  if (!event) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <p className="text-white/50">Event not found.</p>
        <button onClick={() => router.push('/ideofest/events')} className="mt-4 text-signal-lime hover:underline text-sm">
          Browse Events
        </button>
      </div>
    );
  }

  const tiers: ITicketTier[] = event.ticket_tiers || [];
  const totalAmount = selectedTier ? selectedTier.price * quantity : 0;
  const isFreeEvent = totalAmount === 0;
  const enabledMethods = ['bank_transfer', 'payhere'];

  // Format LKR
  const formatLKR = (n: number) =>
    n === 0 ? 'Free' : `LKR ${n.toLocaleString('en-LK', { minimumFractionDigits: 2 })}`;

  // ── Step 2 validation ─────────────────────────────────────
  function validateStep2() {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'Full name is required';
    if (!form.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) e.email = 'Valid email is required';
    if (!form.phone.trim()) e.phone = 'Phone number is required';
    if (!form.nic.trim()) e.nic = 'NIC number is required';
    if (!form.address1.trim()) e.address1 = 'Address is required';
    if (!form.city.trim()) e.city = 'City is required';
    if (!form.district) e.district = 'District is required';
    if (!form.emergencyName.trim()) e.emergencyName = 'Emergency contact name is required';
    if (!form.emergencyPhone.trim()) e.emergencyPhone = 'Emergency contact phone is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  // ── Create booking ─────────────────────────────────────────
  async function createBooking(method: 'bank_transfer' | 'payhere' | 'free') {
    if (!selectedTier || !event) return null;
    setLoading(true);
    try {
      const res = await fetch('/api/ideofest/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event_id: event.id,
          event_slug: event.slug,
          ticket_tier_id: selectedTier.id,
          payment_method: method,
          attendee_name: form.name,
          attendee_email: form.email,
          attendee_phone: form.phone,
          attendee_nic: form.nic,
          address_line_1: form.address1,
          address_line_2: form.address2,
          city: form.city,
          district: form.district,
          postal_code: form.postal,
          country: form.country,
          emergency_contact_name: form.emergencyName,
          emergency_contact_phone: form.emergencyPhone,
          company: form.company,
          job_title: form.jobTitle,
          special_notes: form.notes,
          quantity,
        }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Booking failed');
      return data.data as IBooking;
    } catch (err) {
      alert('Booking error: ' + (err as Error).message);
      return null;
    } finally {
      setLoading(false);
    }
  }

  // ── Step 2 → 3 ────────────────────────────────────────────
  async function handleDetailsNext() {
    if (!validateStep2()) return;
    if (isFreeEvent) {
      const bk = await createBooking('free');
      if (bk) { setBooking(bk); setStep(4); }
    } else {
      setStep(3);
    }
  }

  // ── PayHere payment ───────────────────────────────────────
  async function handlePayHere() {
    const bk = await createBooking('payhere');
    if (!bk) return;
    setBooking(bk);

    // Build PayHere form and submit
    const res = await fetch('/api/ideofest/payhere/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ booking_id: bk.id }),
    });
    const data = await res.json();
    if (!data.success) { alert(data.error); return; }

    // Create and submit hidden form to PayHere
    const payload = data.data;
    const form_ = document.createElement('form');
    form_.method = 'POST';
    form_.action = payload.action;
    Object.entries(payload.fields as Record<string, string>).forEach(([k, v]) => {
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = k;
      input.value = v;
      form_.appendChild(input);
    });
    document.body.appendChild(form_);
    form_.submit();
  }

  // ── Bank transfer + slip upload ───────────────────────────
  async function handleBankTransfer() {
    const bk = await createBooking('bank_transfer');
    if (!bk) return;
    setBooking(bk);
    setPaymentMethod('bank_transfer');
  }

  async function handleSlipUpload() {
    if (!booking || !slipFile) return;
    setUploadingSlip(true);
    try {
      const fd = new FormData();
      fd.append('file', slipFile);
      fd.append('type', 'payment_slip');
      fd.append('booking_ref', booking.booking_ref);

      const res = await fetch('/api/ideofest/upload', { method: 'POST', body: fd });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      setSlipUploaded(true);
      setStep(4);
    } catch (err) {
      alert('Upload error: ' + (err as Error).message);
    } finally {
      setUploadingSlip(false);
    }
  }

  const bankName = event.bank_name || process.env.NEXT_PUBLIC_BANK_NAME || 'Commercial Bank of Ceylon';
  const bankAccountName = event.bank_account_name || process.env.NEXT_PUBLIC_BANK_ACCOUNT_NAME || 'Ideomint (Pvt) Ltd';
  const bankAccountNo = event.bank_account_no || process.env.NEXT_PUBLIC_BANK_ACCOUNT_NO || '—';
  const bankBranch = event.bank_branch || process.env.NEXT_PUBLIC_BANK_BRANCH || 'Colombo 03';

  return (
    <div className="container-layout py-10 px-4 sm:px-6 max-w-2xl mx-auto">
      {/* Back */}
      <button
        onClick={() => step > 1 ? setStep(step - 1) : router.push(`/ideofest/events/${slug}`)}
        className="flex items-center gap-2 text-white/50 hover:text-white text-sm font-medium mb-8 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <div className="mb-10">
        <BookingSteps steps={STEPS} currentStep={step} />
      </div>

      <h1 className="text-2xl font-black mb-1">{event.title}</h1>
      <p className="text-white/50 text-sm mb-8">
        {new Date(event.date).toLocaleDateString('en-LK', {
          weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
        })} · {event.venue}
      </p>

      {/* ── Step 1: Select Tier ── */}
      {step === 1 && (
        <div>
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Ticket className="w-5 h-5 text-signal-lime" />
            <span>Select Ticket Tier</span>
          </h2>

          {tiers.length === 0 && (
            <p className="text-white/40 text-sm py-8 text-center">No ticket tiers found for this event.</p>
          )}

          <div className="flex flex-col gap-4 mb-8">
            {tiers.map((tier) => {
              const available = tier.capacity - tier.sold;
              const isSoldOut = available <= 0;
              const isSelected = selectedTier?.id === tier.id;
              return (
                <button
                  key={tier.id}
                  type="button"
                  disabled={isSoldOut}
                  onClick={() => { if (!isSoldOut) setSelectedTier(tier); }}
                  className={`w-full text-left p-5 rounded-2xl border transition-all ${
                    isSelected
                      ? 'bg-signal-lime/10 border-signal-lime'
                      : isSoldOut
                      ? 'bg-white/2 border-white/8 opacity-50 cursor-not-allowed'
                      : 'bg-white/5 border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="font-black text-white">{tier.label}</span>
                      {isSoldOut && (
                        <span className="ml-2 text-xs font-bold text-red-400 bg-red-400/10 px-2 py-0.5 rounded-full">
                          Sold Out
                        </span>
                      )}
                      {!isSoldOut && available <= 10 && (
                        <span className="ml-2 text-xs font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full">
                          Only {available} left
                        </span>
                      )}
                    </div>
                    <span className="font-black text-signal-lime text-lg">
                      {formatLKR(tier.price)}
                    </span>
                  </div>
                  {tier.perks?.length > 0 && (
                    <ul className="mt-3 flex flex-col gap-1">
                      {tier.perks.map((p) => (
                        <li key={p} className="text-xs text-white/50 flex items-center gap-2">
                          <span className="w-1 h-1 rounded-full bg-signal-lime inline-block" />
                          {p}
                        </li>
                      ))}
                    </ul>
                  )}
                </button>
              );
            })}
          </div>

          {/* Quantity */}
          {selectedTier && (
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 mb-8">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-white/70">Quantity</span>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-8 h-8 rounded-full border border-white/20 text-white hover:border-signal-lime transition-colors flex items-center justify-center font-bold"
                  >−</button>
                  <span className="font-black text-white w-6 text-center">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(10, quantity + 1))}
                    className="w-8 h-8 rounded-full border border-white/20 text-white hover:border-signal-lime transition-colors flex items-center justify-center font-bold"
                  >+</button>
                </div>
              </div>
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/8">
                <span className="text-sm text-white/50">Total</span>
                <span className="font-black text-xl text-white">{formatLKR(totalAmount)}</span>
              </div>
            </div>
          )}

          <button
            onClick={() => { if (selectedTier) setStep(2); }}
            disabled={!selectedTier}
            className="w-full flex items-center justify-center gap-2 bg-signal-lime hover:bg-[#b0d420] disabled:opacity-40 disabled:cursor-not-allowed text-section-ink font-black py-4 rounded-xl text-base transition-colors shadow-lg shadow-signal-lime/10"
          >
            Continue to Attendee Details <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ── Step 2: Attendee Details ── */}
      {step === 2 && (
        <div>
          <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
            <User className="w-5 h-5 text-signal-lime" />
            <span>Attendee Registration</span>
          </h2>

          <div className="flex flex-col gap-4 mb-4">
            {/* Personal Info */}
            <div className="bg-white/3 border border-white/8 rounded-2xl p-5">
              <p className="text-xs font-extrabold text-white/40 uppercase tracking-widest mb-4">Personal Information</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <FormField id="name" label="Full Name" required error={errors.name}>
                    <InputField id="name" placeholder="Your full legal name" value={form.name}
                      onChange={(v) => setForm({ ...form, name: v })} error={errors.name} />
                  </FormField>
                </div>
                <FormField id="nic" label="NIC Number" required error={errors.nic}>
                  <InputField id="nic" placeholder="200012345678 or 123456789V" value={form.nic}
                    onChange={(v) => setForm({ ...form, nic: v })} error={errors.nic} />
                </FormField>
                <FormField id="email" label="Email Address" required error={errors.email}>
                  <InputField id="email" type="email" placeholder="you@email.com" value={form.email}
                    onChange={(v) => setForm({ ...form, email: v })} error={errors.email} />
                </FormField>
                <FormField id="phone" label="Phone Number" required error={errors.phone}>
                  <InputField id="phone" type="tel" placeholder="+94 77 123 4567" value={form.phone}
                    onChange={(v) => setForm({ ...form, phone: v })} error={errors.phone} />
                </FormField>
              </div>
            </div>

            {/* Address */}
            <div className="bg-white/3 border border-white/8 rounded-2xl p-5">
              <p className="text-xs font-extrabold text-white/40 uppercase tracking-widest mb-4 flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5" /> Address
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <FormField id="address1" label="Address Line 1" required error={errors.address1}>
                    <InputField id="address1" placeholder="No, Street Name" value={form.address1}
                      onChange={(v) => setForm({ ...form, address1: v })} error={errors.address1} />
                  </FormField>
                </div>
                <div className="sm:col-span-2">
                  <FormField id="address2" label="Address Line 2">
                    <InputField id="address2" placeholder="Apartment, Area (optional)" value={form.address2}
                      onChange={(v) => setForm({ ...form, address2: v })} />
                  </FormField>
                </div>
                <FormField id="city" label="City" required error={errors.city}>
                  <InputField id="city" placeholder="Colombo" value={form.city}
                    onChange={(v) => setForm({ ...form, city: v })} error={errors.city} />
                </FormField>
                <FormField id="district" label="District" required error={errors.district}>
                  <select
                    id="district"
                    value={form.district}
                    onChange={(e) => setForm({ ...form, district: e.target.value })}
                    className={`w-full bg-white/5 border rounded-xl px-4 py-3.5 text-white focus:outline-none transition-colors ${
                      errors.district ? 'border-red-500' : 'border-white/12 focus:border-signal-lime'
                    }`}
                  >
                    <option value="" className="bg-zinc-900">Select district</option>
                    {SRI_LANKA_DISTRICTS.map((d) => (
                      <option key={d} value={d} className="bg-zinc-900">{d}</option>
                    ))}
                  </select>
                  {errors.district && <p className="text-red-400 text-xs mt-1">{errors.district}</p>}
                </FormField>
                <FormField id="postal" label="Postal Code">
                  <InputField id="postal" placeholder="00100" value={form.postal}
                    onChange={(v) => setForm({ ...form, postal: v })} />
                </FormField>
              </div>
            </div>

            {/* Emergency Contact */}
            <div className="bg-white/3 border border-white/8 rounded-2xl p-5">
              <p className="text-xs font-extrabold text-white/40 uppercase tracking-widest mb-4 flex items-center gap-2">
                <AlertTriangle className="w-3.5 h-3.5" /> Emergency Contact
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField id="emergencyName" label="Contact Name" required error={errors.emergencyName}>
                  <InputField id="emergencyName" placeholder="Full name" value={form.emergencyName}
                    onChange={(v) => setForm({ ...form, emergencyName: v })} error={errors.emergencyName} />
                </FormField>
                <FormField id="emergencyPhone" label="Contact Phone" required error={errors.emergencyPhone}>
                  <InputField id="emergencyPhone" type="tel" placeholder="+94 77 000 0000" value={form.emergencyPhone}
                    onChange={(v) => setForm({ ...form, emergencyPhone: v })} error={errors.emergencyPhone} />
                </FormField>
              </div>
            </div>

            {/* Optional */}
            <button
              type="button"
              onClick={() => setShowOptional(!showOptional)}
              className="flex items-center gap-2 text-sm text-white/40 hover:text-white/70 transition-colors font-medium"
            >
              {showOptional ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              {showOptional ? 'Hide optional fields' : 'Show optional fields (Company, Notes)'}
            </button>
            {showOptional && (
              <div className="bg-white/3 border border-white/8 rounded-2xl p-5">
                <p className="text-xs font-extrabold text-white/40 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <Building2 className="w-3.5 h-3.5" /> Optional Details
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField id="company" label="Company / Organisation">
                    <InputField id="company" placeholder="Your company" value={form.company}
                      onChange={(v) => setForm({ ...form, company: v })} />
                  </FormField>
                  <FormField id="jobTitle" label="Job Title">
                    <InputField id="jobTitle" placeholder="Your role" value={form.jobTitle}
                      onChange={(v) => setForm({ ...form, jobTitle: v })} />
                  </FormField>
                  <div className="sm:col-span-2">
                    <FormField id="notes" label="Special Notes / Dietary Requirements">
                      <textarea
                        id="notes"
                        value={form.notes}
                        onChange={(e) => setForm({ ...form, notes: e.target.value })}
                        placeholder="Any special requirements..."
                        rows={3}
                        className="w-full bg-white/5 border border-white/12 rounded-xl px-4 py-3.5 text-white placeholder-white/30 focus:outline-none focus:border-signal-lime transition-colors resize-none"
                      />
                    </FormField>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Order Summary */}
          {selectedTier && (
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 my-6 flex justify-between items-center">
              <div>
                <span className="text-[10px] font-extrabold text-signal-lime uppercase tracking-widest bg-signal-lime/10 px-2.5 py-0.5 rounded-full border border-signal-lime/30">
                  {selectedTier.label} × {quantity}
                </span>
                <p className="font-bold text-white text-base mt-2">{event.title}</p>
              </div>
              <div className="text-right">
                <span className="text-xs text-white/40 uppercase tracking-widest block">Total</span>
                <span className="font-black text-xl text-white">{formatLKR(totalAmount)}</span>
              </div>
            </div>
          )}

          <button
            onClick={handleDetailsNext}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-signal-lime hover:bg-[#b0d420] disabled:opacity-60 text-section-ink font-black py-4 rounded-xl text-base transition-colors shadow-lg shadow-signal-lime/10"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
              <>{isFreeEvent ? 'Confirm Free Booking' : 'Continue to Payment'} <ArrowRight className="w-4 h-4" /></>
            )}
          </button>
        </div>
      )}

      {/* ── Step 3: Payment ── */}
      {step === 3 && !booking && (
        <div>
          <h2 className="text-2xl font-black mb-2 text-center">Complete Payment</h2>
          <p className="text-white/50 text-sm text-center mb-8">
            Choose how you want to pay for your ticket.
          </p>

          {/* Amount summary */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 mb-8 flex justify-between items-center">
            <div>
              <p className="text-xs text-white/50">Amount Due</p>
              <p className="font-black text-2xl text-signal-lime mt-1">{formatLKR(totalAmount)}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-white/50">{selectedTier?.label} × {quantity}</p>
              <p className="font-bold text-white mt-1">{event.title}</p>
            </div>
          </div>

          {/* Payment method cards */}
          <div className="flex flex-col gap-4 mb-8">
            {enabledMethods.includes('payhere') && (
              <div
                onClick={() => setPaymentMethod('payhere')}
                className={`p-5 rounded-2xl border cursor-pointer transition-all ${
                  paymentMethod === 'payhere'
                    ? 'bg-signal-lime/10 border-signal-lime'
                    : 'bg-white/5 border-white/10 hover:border-white/20'
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className={`p-2.5 rounded-xl ${paymentMethod === 'payhere' ? 'bg-signal-lime text-section-ink' : 'bg-white/5'}`}>
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-black text-white">PayHere</span>
                    <span className="ml-2 text-xs text-white/40">Card, Net Banking, Wallet</span>
                  </div>
                </div>
                <p className="text-xs text-white/50 leading-relaxed ml-14">
                  Pay securely online. Booking confirmed immediately after payment.
                </p>
                {paymentMethod === 'payhere' && (
                  <button
                    onClick={handlePayHere}
                    disabled={loading}
                    className="mt-4 w-full flex items-center justify-center gap-2 bg-signal-lime hover:bg-[#b0d420] disabled:opacity-60 text-section-ink font-black py-3.5 rounded-xl text-sm transition-colors"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Pay {formatLKR(totalAmount)} via PayHere →</>}
                  </button>
                )}
              </div>
            )}

            {enabledMethods.includes('bank_transfer') && (
              <div
                onClick={() => setPaymentMethod('bank_transfer')}
                className={`p-5 rounded-2xl border cursor-pointer transition-all ${
                  paymentMethod === 'bank_transfer'
                    ? 'bg-signal-lime/10 border-signal-lime'
                    : 'bg-white/5 border-white/10 hover:border-white/20'
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className={`p-2.5 rounded-xl ${paymentMethod === 'bank_transfer' ? 'bg-signal-lime text-section-ink' : 'bg-white/5'}`}>
                    <Landmark className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-black text-white">Bank Transfer</span>
                    <span className="ml-2 text-xs text-white/40">Manual — 24hr Verification</span>
                  </div>
                </div>
                <p className="text-xs text-white/50 leading-relaxed ml-14">
                  Transfer to our bank account and upload the payment slip. Confirmed by admin within 24 hours.
                </p>
                {paymentMethod === 'bank_transfer' && (
                  <button
                    onClick={handleBankTransfer}
                    disabled={loading}
                    className="mt-4 w-full flex items-center justify-center gap-2 bg-white/10 hover:bg-white/15 disabled:opacity-60 text-white font-black py-3.5 rounded-xl text-sm transition-colors"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Reserve & View Bank Details →</>}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Step 3b: Bank Transfer details + slip upload */}
      {step === 3 && booking && paymentMethod === 'bank_transfer' && !slipUploaded && (
        <div>
          <h2 className="text-xl font-black mb-2 flex items-center gap-2">
            <Landmark className="w-5 h-5 text-signal-lime" /> Bank Transfer Details
          </h2>
          <p className="text-white/50 text-sm mb-6">
            Transfer the exact amount below and upload your receipt to complete your booking.
          </p>

          {/* Bank Details */}
          <div className="bg-black/40 border border-white/10 rounded-2xl p-6 mb-6">
            <p className="text-[10px] font-extrabold text-signal-lime uppercase tracking-widest mb-4">Transfer To</p>
            {[
              ['Bank', bankName],
              ['Account Name', bankAccountName],
              ['Account Number', bankAccountNo],
              ['Branch', bankBranch],
              ['Reference', booking.booking_ref],
              ['Amount', formatLKR(booking.total_amount)],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between items-center py-2.5 border-b border-white/5 last:border-0">
                <span className="text-xs text-white/40">{label}</span>
                <span className={`text-sm font-bold ${label === 'Reference' ? 'font-mono text-signal-lime' : label === 'Amount' ? 'text-signal-lime text-base' : 'text-white'}`}>
                  {value}
                </span>
              </div>
            ))}
          </div>

          <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 mb-6 text-xs text-amber-300 flex items-start gap-3">
            <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
            <p>Always use <strong>{booking.booking_ref}</strong> as the payment reference/remarks so we can identify your transfer.</p>
          </div>

          {/* Upload Slip */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6">
            <p className="text-xs font-bold text-white/50 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Upload className="w-3.5 h-3.5" /> Upload Payment Receipt
            </p>
            <div className="relative border-2 border-dashed border-white/10 hover:border-signal-lime/50 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition-colors bg-white/3">
              <input
                type="file"
                accept="image/*,.pdf"
                onChange={(e) => setSlipFile(e.target.files?.[0] || null)}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <Upload className="w-8 h-8 text-white/30 mb-3" />
              {slipFile ? (
                <>
                  <p className="text-sm font-bold text-signal-lime">{slipFile.name}</p>
                  <p className="text-xs text-white/40 mt-1">{(slipFile.size / 1024 / 1024).toFixed(2)} MB</p>
                </>
              ) : (
                <>
                  <p className="text-sm font-bold text-white">Click to upload receipt</p>
                  <p className="text-xs text-white/40 mt-1">PNG, JPG, PDF · Max 10MB</p>
                </>
              )}
            </div>
          </div>

          <button
            onClick={handleSlipUpload}
            disabled={!slipFile || uploadingSlip}
            className="w-full flex items-center justify-center gap-2 bg-signal-lime hover:bg-[#b0d420] disabled:opacity-40 disabled:cursor-not-allowed text-section-ink font-black py-4 rounded-xl text-base transition-colors"
          >
            {uploadingSlip ? <Loader2 className="w-5 h-5 animate-spin" /> : (
              <>Submit Payment Slip <ArrowRight className="w-4 h-4" /></>
            )}
          </button>

          <p className="text-center text-xs text-white/30 mt-4">
            Your booking is reserved. You can upload the slip later from "My Tickets".
          </p>
        </div>
      )}

      {/* ── Step 4: Confirmation ── */}
      {step === 4 && booking && (
        <div className="flex flex-col items-center text-center w-full">
          {booking.status === 'confirmed' ? (
            <>
              <div className="w-16 h-16 rounded-full bg-signal-lime/20 border border-signal-lime/40 flex items-center justify-center mb-6">
                <ShieldCheck className="w-8 h-8 text-signal-lime" />
              </div>
              <h2 className="text-3xl font-black mb-2">Booking Confirmed! 🎉</h2>
              <p className="text-white/60 text-sm mb-8">
                Your QR ticket is ready. Present it at the gate for check-in.
              </p>
              <QRTicket booking={booking} />
            </>
          ) : (
            <>
              <div className="w-16 h-16 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center mb-6">
                <FileText className="w-8 h-8 text-amber-400" />
              </div>
              <h2 className="text-3xl font-black mb-2">Booking Submitted ⏳</h2>
              <p className="text-white/60 text-sm mb-2">
                Your booking reference is <span className="font-mono text-signal-lime font-bold">{booking.booking_ref}</span>
              </p>
              <p className="text-white/50 text-sm mb-8 max-w-sm">
                {slipUploaded
                  ? 'Your payment slip has been received. Our team will verify and confirm your ticket within 24 hours.'
                  : 'Complete the bank transfer and upload your receipt to confirm your ticket.'}
              </p>
              {slipUploaded && (
                <div className="bg-signal-lime/10 border border-signal-lime/25 rounded-2xl p-4 mb-6 text-sm text-signal-lime font-semibold max-w-sm w-full">
                  ✓ Payment slip uploaded. You will receive a confirmation email once verified.
                </div>
              )}
            </>
          )}

          <div className="flex flex-col sm:flex-row gap-3 mt-6 w-full max-w-sm">
            <button
              onClick={() => router.push('/ideofest/my-tickets')}
              className="flex-1 py-3 px-6 bg-signal-lime text-section-ink font-black rounded-xl hover:bg-[#b0d420] transition-colors text-sm"
            >
              My Tickets
            </button>
            <button
              onClick={() => router.push('/ideofest/events')}
              className="flex-1 py-3 px-6 bg-white/10 text-white font-bold rounded-xl hover:bg-white/15 transition-colors text-sm"
            >
              Browse Events
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
