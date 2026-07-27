'use client';

import { use, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import BookingSteps from '@/components/ideofest/BookingSteps';
import QRTicket from '@/components/ideofest/QRTicket';
import type { ITicketTier, IBooking, IEvent } from '@/lib/ideofest/types';
import {
  ArrowLeft, ArrowRight, Loader2, ShieldCheck, Ticket, Upload,
  CreditCard, Landmark, ChevronDown, ChevronUp, MapPin,
  AlertTriangle, Building2, FileText, Copy, Check, Download, Mail, Share2,
  Sparkles, CheckCircle2, Phone, Calendar, Clock, Lock
} from 'lucide-react';

const STEPS = [
  { id: 1, label: 'Select Tier' },
  { id: 2, label: 'Attendees' },
  { id: 3, label: 'Payment' },
  { id: 4, label: 'Pass Issued' },
];

const SRI_LANKA_DISTRICTS = [
  'Colombo', 'Gampaha', 'Kalutara', 'Kandy', 'Matale', 'Nuwara Eliya',
  'Galle', 'Matara', 'Hambantota', 'Jaffna', 'Kilinochchi', 'Mannar',
  'Mullaitivu', 'Vavuniya', 'Trincomalee', 'Batticaloa', 'Ampara',
  'Kurunegala', 'Puttalam', 'Anuradhapura', 'Polonnaruwa', 'Badulla',
  'Moneragala', 'Ratnapura', 'Kegalle',
];

function FormField({
  id, label, required, error, children,
}: {
  id: string; label: string; required?: boolean; error?: string; children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-xs font-extrabold text-white/60 uppercase tracking-wider mb-2">
        {label} {required && <span className="text-[#c1e527]">*</span>}
      </label>
      {children}
      {error && <p className="text-red-400 text-xs mt-1 font-semibold flex items-center gap-1">⚠️ {error}</p>}
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
      className={`w-full bg-white/5 border rounded-xl px-4 py-3.5 text-white placeholder-white/30 focus:outline-none transition-all ${error ? 'border-red-500/80 focus:border-red-400 bg-red-500/5' : 'border-white/12 focus:border-[#c1e527] focus:bg-white/8'
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

  // Step 2 — Lead booker
  const [form, setForm] = useState({
    name: '', email: '', phone: '', nic: '',
    address1: '', address2: '', city: '', district: '', postal: '', country: 'Sri Lanka',
    emergencyName: '', emergencyPhone: '',
    company: '', jobTitle: '', notes: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showOptional, setShowOptional] = useState(false);

  // Additional attendees (attendee 2, 3, … quantity)
  type ExtraAttendee = { name: string; nic: string; phone: string };
  const [additionalAttendees, setAdditionalAttendees] = useState<ExtraAttendee[]>([]);

  // Special Celebration Request state
  const [specialEvent, setSpecialEvent] = useState({
    enabled: false,
    type: 'Birthday / Cake Cutting',
    details: '',
  });

  // Copy feedback state
  const [copiedRef, setCopiedRef] = useState(false);

  // Sync additional attendees array length when quantity changes
  useEffect(() => {
    setAdditionalAttendees((prev) => {
      const needed = quantity - 1;
      if (needed <= 0) return [];
      const next = [...prev];
      while (next.length < needed) next.push({ name: '', nic: '', phone: '' });
      return next.slice(0, needed);
    });
  }, [quantity]);

  // Step 3 — Payment
  const [booking, setBooking] = useState<IBooking | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'bank_transfer' | 'payhere' | null>(null);
  const [slipFile, setSlipFile] = useState<File | null>(null);
  const [uploadingSlip, setUploadingSlip] = useState(false);
  const [slipUploaded, setSlipUploaded] = useState(false);
  const [payLater, setPayLater] = useState(false);

  const [loading, setLoading] = useState(false);

  // WhatsApp environment number (defaults to +94771234567 if not set in env)
  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || process.env.NEXT_PUBLIC_ORGANIZER_WHATSAPP || '+94786892649';
  const cleanWhatsapp = whatsappNumber.replace(/[^\d]/g, '');

  const getWhatsAppUrl = (b: IBooking) => {
    const text = `Hi Ideofest Team 👋\n\nI have reserved a ticket for *${b.event_title}*.\n\n📌 *Booking Ref:* ${b.booking_ref}\n👤 *Lead Attendee:* ${b.attendee_name}\n🎟️ *Pass Tier:* ${b.tier_label} × ${b.quantity}\n💰 *Total Amount:* LKR ${b.total_amount.toLocaleString('en-LK')}\n\nHere is my payment transfer receipt attached:`;
    return `https://wa.me/${cleanWhatsapp}?text=${encodeURIComponent(text)}`;
  };

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
          // Auto-select tier if only one available
          const tiers: ITicketTier[] = ev.ticket_tiers || [];
          const available = tiers.filter(t => (t.capacity - (t.sold || 0)) > 0);
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
      <div className="min-h-[70vh] flex flex-col items-center justify-center">
        <Loader2 className="w-10 h-10 text-[#c1e527] animate-spin mb-4" />
        <p className="text-white/60 text-sm font-semibold tracking-wide">Preparing ticket checkout...</p>
      </div>
    );
  }
  if (!event) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
        <p className="text-white/60 text-base mb-4">Event details unavailable or removed.</p>
        <button onClick={() => router.push('/ideofest/events')} className="bg-[#c1e527] text-section-ink px-6 py-3 rounded-full font-black text-sm hover:bg-[#b0d420] transition-all">
          Browse Active Events
        </button>
      </div>
    );
  }

  const tiers: ITicketTier[] = event.ticket_tiers || [];
  const totalAmount = selectedTier ? selectedTier.price * quantity : 0;
  const isFreeEvent = totalAmount === 0;
  const enabledMethods = event.payment_methods || ['bank_transfer', 'payhere'];

  // Format LKR
  const formatLKR = (n: number) =>
    n === 0 ? 'Free' : `LKR ${n.toLocaleString('en-LK', { minimumFractionDigits: 2 })}`;

  // Copy Ticket Ref
  const copyTicketRef = (refText: string) => {
    navigator.clipboard.writeText(refText);
    setCopiedRef(true);
    setTimeout(() => setCopiedRef(false), 3000);
  };

  // Save Ticket Details as file (.txt)
  const downloadTicketRef = (b: IBooking) => {
    const text = `IDEOFEST OFFICIAL TICKET CONFIRMATION PASS
=====================================================
Booking Reference: ${b.booking_ref}
Event Title:       ${b.event_title}
Event Date:        ${new Date(b.event_date).toLocaleDateString('en-LK', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
Venue:             ${b.venue}
Lead Attendee:     ${b.attendee_name} (${b.attendee_email})
Ticket Tier:       ${b.tier_label} × ${b.quantity}
Total Amount:      LKR ${b.total_amount}
Status:            ${b.status.toUpperCase()}
=====================================================
Present this reference number or QR pass at gate entry.
Ideomint — Perfectly Minted Events.
`;
    const element = document.createElement('a');
    const file = new Blob([text], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `Ideofest-Ticket-${b.booking_ref}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

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

    additionalAttendees.forEach((a, i) => {
      if (!a.name.trim()) e[`extra_name_${i}`] = 'Name is required';
      if (!a.nic.trim()) e[`extra_nic_${i}`] = 'NIC is required';
      if (!a.phone.trim()) e[`extra_phone_${i}`] = 'Phone is required';
    });
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
          additional_attendees: additionalAttendees,
          special_event_request: specialEvent,
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

    const res = await fetch('/api/ideofest/payhere/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ booking_id: bk.id }),
    });
    const data = await res.json();
    if (!data.success) { alert(data.error); return; }

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
    <div className="container-layout py-12 px-4 sm:px-6 max-w-3xl mx-auto min-h-screen">
      {/* Navigation Top */}
      <button
        onClick={() => step > 1 ? setStep(step - 1) : router.push(`/ideofest/events/${slug}`)}
        className="inline-flex items-center gap-2 text-white/60 hover:text-white text-xs font-extrabold uppercase tracking-widest mb-8 transition-colors bg-white/5 hover:bg-white/10 px-4 py-2 rounded-full border border-white/10"
      >
        <ArrowLeft className="w-4 h-4 text-[#c1e527]" /> Back to Event Details
      </button>

      {/* Progress Steps Header */}
      <div className="mb-10 bg-white/3 border border-white/8 rounded-2xl p-6 backdrop-blur-xl">
        <BookingSteps steps={STEPS} currentStep={step} />
      </div>

      {/* Hero Event Card Snapshot */}
      <div className="mb-8 relative overflow-hidden rounded-3xl border border-white/12 bg-gradient-to-r from-white/6 via-white/3 to-white/6 p-6 backdrop-blur-xl shadow-2xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {event.image_url && (
              <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden shrink-0 border border-white/15 shadow-lg">
                <Image src={event.image_url} alt={event.title} fill className="object-cover" />
              </div>
            )}
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-[10px] font-black text-[#c1e527] uppercase tracking-widest bg-[#c1e527]/15 px-2.5 py-0.5 rounded-full border border-[#c1e527]/30">
                  {event.category || 'Event'}
                </span>
                <span className="text-[10px] text-white/50 uppercase font-bold">Checkout</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-white leading-tight">{event.title}</h1>
              <p className="text-white/60 text-xs mt-1 flex flex-wrap items-center gap-x-4 gap-y-1">
                <span>📅 {new Date(event.date).toLocaleDateString('en-LK', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}</span>
                <span>📍 {event.venue}, {event.city}</span>
              </p>
            </div>
          </div>

          {selectedTier && (
            <div className="text-left sm:text-right bg-white/5 border border-white/10 px-4 py-2.5 rounded-2xl shrink-0">
              <span className="text-[10px] font-bold text-white/50 uppercase tracking-widest block">Selected Tier</span>
              <span className="font-extrabold text-[#c1e527] text-sm">{selectedTier.label} × {quantity}</span>
            </div>
          )}
        </div>
      </div>

      {/* ── STEP 1: SELECT TICKET TIER ── */}
      {step === 1 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black flex items-center gap-2 text-white">
              <Ticket className="w-5 h-5 text-[#c1e527]" />
              <span>Choose Ticket Tier</span>
            </h2>
            <span className="text-xs text-white/50 font-medium">Select your preferred entry pass</span>
          </div>

          {tiers.length === 0 && (
            <div className="bg-white/4 border border-white/10 rounded-2xl p-10 text-center text-white/50 text-sm">
              No active ticket passes available right now.
            </div>
          )}

          <div className="grid grid-cols-1 gap-4">
            {tiers.map((tier) => {
              const available = tier.capacity - (tier.sold || 0);
              const isSoldOut = available <= 0;
              const isSelected = selectedTier?.id === tier.id;
              return (
                <div
                  key={tier.id}
                  onClick={() => { if (!isSoldOut) setSelectedTier(tier); }}
                  className={`relative p-6 rounded-3xl border transition-all cursor-pointer overflow-hidden ${isSelected
                      ? 'bg-gradient-to-r from-[#c1e527]/15 via-white/5 to-[#c1e527]/10 border-[#c1e527] shadow-[0_0_30px_rgba(193,229,39,0.2)]'
                      : isSoldOut
                        ? 'bg-white/2 border-white/8 opacity-45 cursor-not-allowed'
                        : 'bg-white/4 border-white/10 hover:border-white/25 hover:bg-white/6'
                    }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3.5">
                      {/* Selection Radio Circle */}
                      <div className={`mt-1 w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${isSelected ? 'border-[#c1e527] bg-[#c1e527]' : 'border-white/30'
                        }`}>
                        {isSelected && <Check className="w-3.5 h-3.5 text-section-ink stroke-[3]" />}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-black text-white text-lg">{tier.label}</span>
                          {isSoldOut && (
                            <span className="text-[10px] font-extrabold text-red-400 bg-red-400/10 px-2.5 py-0.5 rounded-full border border-red-400/20">
                              Sold Out
                            </span>
                          )}
                        </div>

                        {tier.perks?.length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-2">
                            {tier.perks.map((perk) => (
                              <span key={perk} className="inline-flex items-center gap-1.5 text-xs text-white/70 bg-white/5 border border-white/10 px-3 py-1 rounded-full">
                                <CheckCircle2 className="w-3.5 h-3.5 text-[#c1e527]" />
                                {perk}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="font-black text-2xl text-[#c1e527] block">{formatLKR(tier.price)}</span>
                      <span className="text-[10px] text-white/40 font-bold uppercase tracking-wider block mt-0.5">Per Pass</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quantity Controls */}
          {selectedTier && (
            <div className="bg-white/4 border border-white/10 rounded-3xl p-6 backdrop-blur-xl">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-bold text-white text-sm block">Pass Quantity</span>
                  <span className="text-xs text-white/40">Select up to 10 passes per booking</span>
                </div>
                <div className="flex items-center gap-4 bg-black/40 border border-white/15 p-1.5 rounded-2xl">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 rounded-xl bg-white/8 hover:bg-white/15 text-white transition-colors flex items-center justify-center font-black text-lg"
                  >−</button>
                  <span className="font-black text-white text-xl w-6 text-center">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(10, quantity + 1))}
                    className="w-10 h-10 rounded-xl bg-white/8 hover:bg-white/15 text-white transition-colors flex items-center justify-center font-black text-lg"
                  >+</button>
                </div>
              </div>

              <div className="flex items-center justify-between mt-6 pt-5 border-t border-white/10">
                <div>
                  <span className="text-xs text-white/50 uppercase tracking-widest font-extrabold block">Total Checkout Amount</span>
                  <span className="text-xs text-white/40">{selectedTier.label} × {quantity} Pass{quantity > 1 ? 'es' : ''}</span>
                </div>
                <span className="font-black text-3xl text-[#c1e527]">{formatLKR(totalAmount)}</span>
              </div>
            </div>
          )}

          <button
            onClick={() => { if (selectedTier) setStep(2); }}
            disabled={!selectedTier}
            className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-[#c1e527] to-[#d4ff33] hover:from-[#b0d420] hover:to-[#c1e527] disabled:opacity-40 disabled:cursor-not-allowed text-section-ink font-black py-4.5 rounded-2xl text-base transition-all shadow-[0_0_25px_rgba(193,229,39,0.25)] hover:scale-[1.02]"
          >
            <span>Proceed to Attendee Registration</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* ── STEP 2: ATTENDEE DETAILS ── */}
      {step === 2 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black flex items-center gap-2 text-white">
              <ShieldCheck className="w-5 h-5 text-[#c1e527]" />
              <span>Attendee Details</span>
            </h2>
            {quantity > 1 && (
              <span className="text-xs font-black text-[#c1e527] bg-[#c1e527]/15 px-3 py-1 rounded-full border border-[#c1e527]/30">
                {quantity} Passes Included
              </span>
            )}
          </div>

          {/* Lead Booker */}
          <div className="bg-white/4 border border-white/10 rounded-3xl p-6 backdrop-blur-xl">
            <p className="text-xs font-black text-[#c1e527] uppercase tracking-widest mb-4 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#c1e527] text-section-ink text-xs font-black flex items-center justify-center">1</span>
              {quantity > 1 ? 'Lead Booker — Personal Details' : 'Personal Details'}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <FormField id="name" label="Full Legal Name" required error={errors.name}>
                  <InputField id="name" placeholder="Full name as per NIC / Passport" value={form.name}
                    onChange={(v) => setForm({ ...form, name: v })} error={errors.name} />
                </FormField>
              </div>
              <FormField id="nic" label="NIC / Passport Number" required error={errors.nic}>
                <InputField id="nic" placeholder="200012345678 or 123456789V" value={form.nic}
                  onChange={(v) => setForm({ ...form, nic: v })} error={errors.nic} />
              </FormField>
              <FormField id="email" label="Email Address (Pass Delivery)" required error={errors.email}>
                <InputField id="email" type="email" placeholder="your@email.com" value={form.email}
                  onChange={(v) => setForm({ ...form, email: v })} error={errors.email} />
              </FormField>
              <FormField id="phone" label="Phone Number" required error={errors.phone}>
                <InputField id="phone" type="tel" placeholder="+94 77 123 4567" value={form.phone}
                  onChange={(v) => setForm({ ...form, phone: v })} error={errors.phone} />
              </FormField>
            </div>
          </div>

          {/* Additional Attendees */}
          {additionalAttendees.map((attendee, idx) => (
            <div key={idx} className="bg-white/4 border border-white/10 rounded-3xl p-6 backdrop-blur-xl">
              <p className="text-xs font-black text-[#c1e527] uppercase tracking-widest mb-4 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#c1e527]/20 border border-[#c1e527]/40 text-[#c1e527] text-xs font-black flex items-center justify-center">{idx + 2}</span>
                Attendee {idx + 2} Details
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <FormField id={`extra_name_${idx}`} label="Full Name" required error={errors[`extra_name_${idx}`]}>
                    <InputField
                      id={`extra_name_${idx}`}
                      placeholder="Full legal name"
                      value={attendee.name}
                      onChange={(v) => {
                        const next = [...additionalAttendees];
                        next[idx] = { ...next[idx], name: v };
                        setAdditionalAttendees(next);
                      }}
                      error={errors[`extra_name_${idx}`]}
                    />
                  </FormField>
                </div>
                <FormField id={`extra_nic_${idx}`} label="NIC Number" required error={errors[`extra_nic_${idx}`]}>
                  <InputField
                    id={`extra_nic_${idx}`}
                    placeholder="200012345678 or 123456789V"
                    value={attendee.nic}
                    onChange={(v) => {
                      const next = [...additionalAttendees];
                      next[idx] = { ...next[idx], nic: v };
                      setAdditionalAttendees(next);
                    }}
                    error={errors[`extra_nic_${idx}`]}
                  />
                </FormField>
                <FormField id={`extra_phone_${idx}`} label="Phone Number" required error={errors[`extra_phone_${idx}`]}>
                  <InputField
                    id={`extra_phone_${idx}`}
                    type="tel"
                    placeholder="+94 77 123 4567"
                    value={attendee.phone}
                    onChange={(v) => {
                      const next = [...additionalAttendees];
                      next[idx] = { ...next[idx], phone: v };
                      setAdditionalAttendees(next);
                    }}
                    error={errors[`extra_phone_${idx}`]}
                  />
                </FormField>
              </div>
            </div>
          ))}

          {/* Special Celebration Request Card */}
          <div className="bg-gradient-to-r from-[#c1e527]/12 via-white/5 to-[#c1e527]/12 border border-[#c1e527]/35 rounded-3xl p-6 backdrop-blur-xl shadow-lg">
            <div
              className="flex items-center justify-between cursor-pointer select-none"
              onClick={() => setSpecialEvent({ ...specialEvent, enabled: !specialEvent.enabled })}
            >
              <div className="flex items-center gap-3.5">
                <div className="p-3 rounded-2xl bg-[#c1e527]/20 border border-[#c1e527]/40 text-[#c1e527]">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-extrabold text-white text-base">Planning a Special Celebration?</p>
                  <p className="text-xs text-white/60">Cake cutting, Birthday surprise, Anniversary, VIP arrangement</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={specialEvent.enabled}
                onChange={(e) => setSpecialEvent({ ...specialEvent, enabled: e.target.checked })}
                className="w-5 h-5 accent-[#c1e527] rounded cursor-pointer"
              />
            </div>

            {specialEvent.enabled && (
              <div className="mt-6 border-t border-white/10 pt-5 flex flex-col gap-4">
                <FormField id="specialType" label="Celebration Type">
                  <select
                    id="specialType"
                    value={specialEvent.type}
                    onChange={(e) => setSpecialEvent({ ...specialEvent, type: e.target.value })}
                    className="w-full bg-white/5 border border-white/12 rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-[#c1e527]"
                  >
                    <option value="Birthday / Cake Cutting" className="bg-zinc-900">🎂 Birthday & Cake Cutting</option>
                    <option value="Birthday Surprise" className="bg-zinc-900">🎁 Special Birthday Surprise</option>
                    <option value="Anniversary Celebration" className="bg-zinc-900">🥂 Anniversary Celebration</option>
                    <option value="VIP Proposal" className="bg-zinc-900">💍 VIP Proposal / Special Moment</option>
                    <option value="Custom Surprise" className="bg-zinc-900">✨ Custom Surprise Request</option>
                  </select>
                </FormField>

                <FormField id="specialDetails" label="Celebration Details & Instructions">
                  <textarea
                    id="specialDetails"
                    value={specialEvent.details}
                    onChange={(e) => setSpecialEvent({ ...specialEvent, details: e.target.value })}
                    placeholder="Mention cake timing, person's name, song preference, or any special surprise instructions..."
                    rows={3}
                    className="w-full bg-white/5 border border-white/12 rounded-xl px-4 py-3.5 text-white placeholder-white/30 focus:outline-none focus:border-[#c1e527] resize-none"
                  />
                </FormField>

                <div className="bg-[#c1e527]/10 border border-[#c1e527]/30 rounded-xl p-3.5 text-xs text-[#c1e527] font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>Our Ideofest Event Concierge Team will contact you directly to organize your special surprise!</span>
                </div>
              </div>
            )}
          </div>

          {/* Address Card */}
          <div className="bg-white/4 border border-white/10 rounded-3xl p-6 backdrop-blur-xl">
            <p className="text-xs font-black text-white/40 uppercase tracking-widest mb-4 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#c1e527]" /> Address Information
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
                  className={`w-full bg-white/5 border rounded-xl px-4 py-3.5 text-white focus:outline-none transition-colors ${errors.district ? 'border-red-500' : 'border-white/12 focus:border-[#c1e527]'
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
          <div className="bg-white/4 border border-white/10 rounded-3xl p-6 backdrop-blur-xl">
            <p className="text-xs font-black text-white/40 uppercase tracking-widest mb-4 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" /> Emergency Contact
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

          {/* Optional Toggle */}
          <button
            type="button"
            onClick={() => setShowOptional(!showOptional)}
            className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white/40 hover:text-white transition-colors"
          >
            {showOptional ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            {showOptional ? 'Hide optional fields' : 'Show optional fields (Company, Notes)'}
          </button>
          {showOptional && (
            <div className="bg-white/4 border border-white/10 rounded-3xl p-6 backdrop-blur-xl">
              <p className="text-xs font-black text-white/40 uppercase tracking-widest mb-4 flex items-center gap-2">
                <Building2 className="w-4 h-4" /> Optional Details
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
                  <FormField id="notes" label="Special Notes">
                    <textarea
                      id="notes"
                      value={form.notes}
                      onChange={(e) => setForm({ ...form, notes: e.target.value })}
                      placeholder="Any special requirements..."
                      rows={3}
                      className="w-full bg-white/5 border border-white/12 rounded-xl px-4 py-3.5 text-white placeholder-white/30 focus:outline-none focus:border-[#c1e527] resize-none"
                    />
                  </FormField>
                </div>
              </div>
            </div>
          )}

          {/* Total Bar */}
          {selectedTier && (
            <div className="bg-white/5 border border-white/10 rounded-3xl p-6 flex justify-between items-center backdrop-blur-xl">
              <div>
                <span className="text-[10px] font-black text-[#c1e527] uppercase tracking-widest bg-[#c1e527]/10 px-3 py-1 rounded-full border border-[#c1e527]/30">
                  {selectedTier.label} × {quantity}
                </span>
                <p className="font-extrabold text-white text-base mt-2">{event.title}</p>
              </div>
              <div className="text-right">
                <span className="text-xs text-white/40 uppercase tracking-widest block font-bold">Total Amount</span>
                <span className="font-black text-2xl text-[#c1e527]">{formatLKR(totalAmount)}</span>
              </div>
            </div>
          )}

          <button
            onClick={handleDetailsNext}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-[#c1e527] to-[#d4ff33] hover:from-[#b0d420] hover:to-[#c1e527] disabled:opacity-60 text-section-ink font-black py-4.5 rounded-2xl text-base transition-all shadow-[0_0_25px_rgba(193,229,39,0.25)] hover:scale-[1.02]"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
              <>{isFreeEvent ? 'Confirm Free Booking' : 'Continue to Payment Method'} <ArrowRight className="w-5 h-5" /></>
            )}
          </button>
        </div>
      )}

      {/* ── STEP 3: PAYMENT METHOD ── */}
      {step === 3 && !booking && (
        <div className="space-y-6">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-black text-white mb-1">Select Payment Gateway</h2>
            <p className="text-white/50 text-xs">Choose your preferred payment method</p>
          </div>

          <div className="bg-white/4 border border-white/10 rounded-3xl p-6 flex justify-between items-center backdrop-blur-xl">
            <div>
              <p className="text-xs text-white/40 uppercase tracking-widest font-black">Amount Due</p>
              <p className="font-black text-3xl text-[#c1e527] mt-1">{formatLKR(totalAmount)}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-white/50 font-bold">{selectedTier?.label} × {quantity}</p>
              <p className="font-extrabold text-white text-sm mt-0.5">{event.title}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {enabledMethods.includes('payhere') && (
              <div
                onClick={() => setPaymentMethod('payhere')}
                className={`p-6 rounded-3xl border cursor-pointer transition-all ${paymentMethod === 'payhere'
                    ? 'bg-[#c1e527]/10 border-[#c1e527] shadow-[0_0_30px_rgba(193,229,39,0.2)]'
                    : 'bg-white/4 border-white/10 hover:border-white/20'
                  }`}
              >
                <div className="flex items-center gap-4 mb-2">
                  <div className={`p-3 rounded-2xl ${paymentMethod === 'payhere' ? 'bg-[#c1e527] text-section-ink' : 'bg-white/8'}`}>
                    <CreditCard className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="font-black text-white text-base">PayHere Instant Online Payment</span>
                    <span className="ml-2 text-xs text-white/50 block">Visa, MasterCard, Genie, eZ Cash</span>
                  </div>
                </div>
                <p className="text-xs text-white/60 leading-relaxed ml-16">
                  Pay securely online using credit/debit card. Your QR pass is issued instantly.
                </p>
                {paymentMethod === 'payhere' && (
                  <button
                    onClick={handlePayHere}
                    disabled={loading}
                    className="mt-5 w-full flex items-center justify-center gap-2 bg-[#c1e527] hover:bg-[#b0d420] disabled:opacity-60 text-section-ink font-black py-4 rounded-xl text-sm transition-all"
                  >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Pay {formatLKR(totalAmount)} via PayHere →</>}
                  </button>
                )}
              </div>
            )}

            {enabledMethods.includes('bank_transfer') && (
              <div
                onClick={() => setPaymentMethod('bank_transfer')}
                className={`p-6 rounded-3xl border cursor-pointer transition-all ${paymentMethod === 'bank_transfer'
                    ? 'bg-[#c1e527]/10 border-[#c1e527] shadow-[0_0_30px_rgba(193,229,39,0.2)]'
                    : 'bg-white/4 border-white/10 hover:border-white/20'
                  }`}
              >
                <div className="flex items-center gap-4 mb-2">
                  <div className={`p-3 rounded-2xl ${paymentMethod === 'bank_transfer' ? 'bg-[#c1e527] text-section-ink' : 'bg-white/8'}`}>
                    <Landmark className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="font-black text-white text-base">Direct Bank Transfer</span>
                    <span className="ml-2 text-xs text-white/50 block">Commercial Bank / Online Transfer</span>
                  </div>
                </div>
                <p className="text-xs text-white/60 leading-relaxed ml-16">
                  Transfer to our official bank account and upload your payment slip for 24-hour verification.
                </p>
                {paymentMethod === 'bank_transfer' && (
                  <button
                    onClick={handleBankTransfer}
                    disabled={loading}
                    className="mt-5 w-full flex items-center justify-center gap-2 bg-white/10 hover:bg-white/15 disabled:opacity-60 text-white font-black py-4 rounded-xl text-sm transition-all border border-white/15"
                  >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Reserve & View Bank Transfer Details →</>}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Step 3b: Bank Details + Slip Upload */}
      {step === 3 && booking && paymentMethod === 'bank_transfer' && !slipUploaded && (
        <div className="space-y-6">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-black text-white flex items-center justify-center gap-2">
              <Landmark className="w-6 h-6 text-[#c1e527]" /> Bank Transfer Instructions
            </h2>
            <p className="text-white/60 text-xs mt-1">
              Transfer the exact total amount and upload your payment receipt.
            </p>
          </div>

          <div className="bg-black/50 border border-white/12 rounded-3xl p-6 backdrop-blur-xl">
            <p className="text-[10px] font-black text-[#c1e527] uppercase tracking-widest mb-4">Official Bank Account</p>
            {[
              ['Bank Name', bankName],
              ['Account Name', bankAccountName],
              ['Account Number', bankAccountNo],
              ['Branch', bankBranch],
              ['Payment Reference', booking.booking_ref],
              ['Exact Amount', formatLKR(booking.total_amount)],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between items-center py-3 border-b border-white/8 last:border-0">
                <span className="text-xs text-white/50 font-semibold">{label}</span>
                <span className={`text-sm font-black ${label === 'Payment Reference' ? 'font-mono text-[#c1e527]' : label === 'Exact Amount' ? 'text-[#c1e527] text-base' : 'text-white'}`}>
                  {value}
                </span>
              </div>
            ))}
          </div>

          <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 text-xs text-amber-300 flex items-start gap-3">
            <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
            <p>Always enter <strong>{booking.booking_ref}</strong> as the payment reference/remarks so our verification team can identify your payment.</p>
          </div>

          <div className="bg-white/4 border border-white/10 rounded-3xl p-6 backdrop-blur-xl">
            <p className="text-xs font-black text-white/60 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Upload className="w-4 h-4 text-[#c1e527]" /> Upload Transfer Receipt / Slip
            </p>
            <div className="relative border-2 border-dashed border-white/15 hover:border-[#c1e527] rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer transition-colors bg-white/3 hover:bg-white/5">
              <input
                type="file"
                accept="image/*,.pdf"
                onChange={(e) => setSlipFile(e.target.files?.[0] || null)}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <Upload className="w-10 h-10 text-[#c1e527] mb-3 opacity-80" />
              {slipFile ? (
                <>
                  <p className="text-sm font-black text-[#c1e527]">{slipFile.name}</p>
                  <p className="text-xs text-white/50 mt-1">{(slipFile.size / 1024 / 1024).toFixed(2)} MB</p>
                </>
              ) : (
                <>
                  <p className="text-sm font-bold text-white">Click or drop your transfer receipt here</p>
                  <p className="text-xs text-white/40 mt-1">PNG, JPG, PDF up to 10MB</p>
                </>
              )}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleSlipUpload}
              disabled={!slipFile || uploadingSlip}
              className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-[#c1e527] to-[#d4ff33] hover:from-[#b0d420] hover:to-[#c1e527] disabled:opacity-40 disabled:cursor-not-allowed text-section-ink font-black py-4 rounded-2xl text-sm sm:text-base transition-all shadow-[0_0_25px_rgba(193,229,39,0.25)]"
            >
              {uploadingSlip ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                <>Submit Payment Receipt <ArrowRight className="w-5 h-5" /></>
              )}
            </button>

            <button
              type="button"
              onClick={() => { setPayLater(true); setStep(4); }}
              className="flex-1 flex items-center justify-center gap-2 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-300 font-extrabold py-4 rounded-2xl text-sm sm:text-base transition-all hover:scale-[1.01]"
            >
              <Clock className="w-5 h-5 text-amber-400 shrink-0" />
              <span>Pay Later / Reserve Seat →</span>
            </button>
          </div>

          {/* Pay Later / Send via WhatsApp Informational Message Card */}
          <div className="bg-gradient-to-r from-emerald-500/12 via-white/5 to-amber-500/12 border border-emerald-500/30 rounded-2xl p-5 text-left text-xs text-white/80 space-y-2 backdrop-blur-xl">
            <div className="flex items-center gap-2 text-[#c1e527] font-black uppercase tracking-wider text-[11px]">
              <Mail className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Booking Issued — Not Confirmed (Email Sent)</span>
            </div>
            <p className="leading-relaxed text-white/80">
              Your booking reference <strong className="font-mono text-[#c1e527]">{booking.booking_ref}</strong> is reserved, but <strong>not confirmed</strong> until your payment transfer slip is verified. A confirmation email with bank details has been sent to <strong>{booking.attendee_email}</strong>.
            </p>
            <p className="text-white/60 leading-relaxed pt-2 border-t border-white/8 flex items-center flex-wrap gap-1">
              <span>📱 <strong>Prefer to send your payment slip via WhatsApp?</strong> Send your transfer receipt directly to</span>
              <a
                href={getWhatsAppUrl(booking)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#25D366] font-bold underline hover:text-emerald-300 transition-colors inline-flex items-center gap-1"
              >
                <span>{whatsappNumber}</span>
                <Share2 className="w-3.5 h-3.5 shrink-0" />
              </a>
            </p>
          </div>
        </div>
      )}

      {/* ── STEP 4: CONFIRMATION & TICKET PASS ── */}
      {step === 4 && booking && (
        <div className="flex flex-col items-center text-center w-full space-y-6">
          {booking.status === 'confirmed' ? (
            <>
              <div className="w-20 h-20 rounded-full bg-[#c1e527]/20 border-2 border-[#c1e527] flex items-center justify-center shadow-[0_0_40px_rgba(193,229,39,0.4)] animate-bounce">
                <ShieldCheck className="w-10 h-10 text-[#c1e527]" />
              </div>
              <div>
                <h2 className="text-3xl sm:text-4xl font-black text-white">Booking Confirmed! 🎉</h2>
                <p className="text-white/60 text-sm mt-2 max-w-md mx-auto">
                  Your encrypted QR pass is issued and active. Present this pass at gate entry.
                </p>
              </div>
              <QRTicket booking={booking} />
            </>
          ) : (
            <>
              <div className="w-20 h-20 rounded-full bg-amber-500/20 border-2 border-amber-500/50 flex items-center justify-center shadow-[0_0_30px_rgba(245,158,11,0.35)]">
                <Clock className="w-10 h-10 text-amber-400" />
              </div>
              <div>
                <span className="inline-block text-[11px] font-black text-amber-400 bg-amber-500/15 border border-amber-500/30 px-3 py-1 rounded-full uppercase tracking-widest mb-2">
                  Booking Issued — Not Confirmed ⏳
                </span>
                <h2 className="text-3xl font-black text-white">Payment Verification Pending</h2>
                <p className="text-white/60 text-xs sm:text-sm mt-2 max-w-md mx-auto">
                  Your booking reference is <span className="font-mono text-[#c1e527] font-extrabold text-base">{booking.booking_ref}</span>. Your seat is reserved for 24 hours while payment is being processed.
                </p>
              </div>

              {/* ── WHATSAPP SLIP SUBMISSION CARD ── */}
              <div className="w-full bg-gradient-to-r from-emerald-500/15 via-white/5 to-emerald-500/10 border border-emerald-500/35 rounded-3xl p-6 text-left backdrop-blur-xl shadow-xl space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-emerald-500/20 rounded-2xl border border-emerald-500/40 text-emerald-400">
                    <Phone className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-white text-base">Send Payment Receipt via WhatsApp</h3>
                    <p className="text-xs text-white/60">Fastest verification — send your transfer slip directly to our team on WhatsApp</p>
                  </div>
                </div>

                <a
                  href={getWhatsAppUrl(booking)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2.5 bg-[#25D366] hover:bg-[#20bd5a] text-black font-black py-4 px-6 rounded-2xl text-sm sm:text-base transition-all shadow-[0_0_25px_rgba(37,211,102,0.3)] hover:scale-[1.02]"
                >
                  <Share2 className="w-5 h-5 shrink-0" />
                  <span>Send Slip via WhatsApp ({whatsappNumber})</span>
                </a>
              </div>

              {/* ── INLINE PAYMENT SLIP UPLOAD (IF NOT YET UPLOADED) ── */}
              {!slipUploaded && (
                <div className="w-full bg-white/4 border border-white/10 rounded-3xl p-6 text-left backdrop-blur-xl space-y-4">
                  <p className="text-xs font-black text-white/70 uppercase tracking-wider flex items-center gap-2">
                    <Upload className="w-4 h-4 text-[#c1e527]" /> Or Upload Transfer Receipt Here
                  </p>
                  <div className="relative border-2 border-dashed border-white/15 hover:border-[#c1e527] rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer transition-colors bg-white/3 hover:bg-white/5">
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={(e) => setSlipFile(e.target.files?.[0] || null)}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <Upload className="w-8 h-8 text-[#c1e527] mb-2 opacity-80" />
                    {slipFile ? (
                      <p className="text-xs font-black text-[#c1e527]">{slipFile.name}</p>
                    ) : (
                      <p className="text-xs text-white/50">Click or drop transfer receipt here (PNG, JPG, PDF)</p>
                    )}
                  </div>
                  <button
                    onClick={handleSlipUpload}
                    disabled={!slipFile || uploadingSlip}
                    className="w-full flex items-center justify-center gap-2 bg-[#c1e527] hover:bg-[#b0d420] disabled:opacity-40 text-section-ink font-black py-3.5 rounded-xl text-xs sm:text-sm transition-all"
                  >
                    {uploadingSlip ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Upload Payment Receipt →</>}
                  </button>
                </div>
              )}
            </>
          )}

          {/* ── TICKET ID COPY & SAVE CARD ── */}
          <div className="w-full bg-white/4 border border-white/10 rounded-3xl p-6 text-left backdrop-blur-xl shadow-xl">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-white/10 pb-5 mb-5 gap-4">
              <div>
                <span className="text-[10px] font-black text-[#c1e527] uppercase tracking-widest block">Official Pass Reference ID</span>
                <p className="text-xl font-mono font-black text-white mt-0.5">{booking.booking_ref}</p>
              </div>

              {/* Copy Ticket ID Button */}
              <button
                onClick={() => copyTicketRef(booking.booking_ref)}
                className="flex items-center gap-2 bg-[#c1e527]/15 hover:bg-[#c1e527]/25 border border-[#c1e527]/40 text-[#c1e527] px-4 py-2.5 rounded-xl text-xs font-black transition-all hover:scale-105"
              >
                {copiedRef ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copiedRef ? 'Copied!' : 'Copy Ticket ID'}</span>
              </button>
            </div>

            {/* Email Notification Notice */}
            <div className="flex items-start gap-3 bg-amber-500/10 border border-amber-500/25 rounded-2xl p-4 mb-4 text-xs text-amber-200">
              <Mail className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span>
                A confirmation email with your booking reference ID (<strong>{booking.booking_ref}</strong>) and bank details has been sent to <strong>{booking.attendee_email}</strong>.
              </span>
            </div>

            {/* Save / Download Ticket Reference Button */}
            <button
              onClick={() => downloadTicketRef(booking)}
              className="w-full flex items-center justify-center gap-2.5 bg-white/8 hover:bg-white/15 border border-white/15 text-white py-3.5 rounded-2xl text-xs font-extrabold transition-all"
            >
              <Download className="w-4 h-4 text-[#c1e527]" />
              <span>Save Ticket Pass Details (.TXT File)</span>
            </button>
          </div>

          {/* Navigation Actions */}
          <div className="flex flex-col sm:flex-row gap-3 w-full max-w-md">
            <button
              onClick={() => router.push('/ideofest/my-tickets')}
              className="flex-1 py-4 px-6 bg-gradient-to-r from-[#c1e527] to-[#d4ff33] text-section-ink font-black rounded-2xl hover:scale-105 transition-all text-sm shadow-lg shadow-[#c1e527]/15"
            >
              View In My Tickets
            </button>
            <button
              onClick={() => router.push('/ideofest/events')}
              className="flex-1 py-4 px-6 bg-white/10 text-white font-bold rounded-2xl hover:bg-white/15 transition-all text-sm border border-white/15"
            >
              Browse More Events
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
