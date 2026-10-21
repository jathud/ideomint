'use client';

import React, { useState } from 'react';
import { Check } from 'lucide-react';

const serviceOptions = [
  'Brand identity',
  'Social media',
  'Reels and video content',
  'Photography',
  'Website',
  'Personal branding',
  'YouTube content',
  'Campaign',
  'Not sure yet',
];

export default function CustomPlanForm() {
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [selectedServices, setSelectedServices] = useState<string[]>([]);

  const toggleService = (service: string) => {
    setSelectedServices((prev) =>
      prev.includes(service)
        ? prev.filter((s) => s !== service)
        : [...prev, service]
    );
  };

  if (submitted) {
    return (
      <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8 md:p-12 text-center">
        <div className="w-16 h-16 rounded-full bg-creative-flame/20 flex items-center justify-center mx-auto mb-6">
          <Check className="w-8 h-8 text-creative-flame" />
        </div>
        <h3 role="status" className="text-2xl font-bold text-white mb-4">Request sent. Thank you.</h3>
        <p className="text-white/70 leading-relaxed max-w-md mx-auto">
          We have received your request. Our team will review it and get back to you.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 md:p-10">
      <form
        className="flex flex-col gap-6"
        onSubmit={async (e) => {
          e.preventDefault();
          const form = new FormData(e.currentTarget);
          if (!selectedServices.length) { setError('Please choose at least one service.'); return; }
          setSending(true); setError('');
          try {
            const response = await fetch('/api/contact', {
              method: 'POST', headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ name: form.get('name'), email: form.get('email'), service: selectedServices.join(', '), company_url: form.get('company_url') || '', message: ['business', 'phone', 'link', 'budget', 'timeline', 'goals'].map(key => `${key}: ${form.get(key) || 'Not provided'}`).join('\n') }),
            });
            const result = await response.json();
            if (!response.ok || !result.ok) throw new Error(result.error || 'Unable to send. Please email hello@ideomint.com.');
            setSubmitted(true);
          } catch (failure) { setError(failure instanceof Error ? failure.message : 'Unable to send. Please email hello@ideomint.com.'); }
          finally { setSending(false); }
        }}
      >
        {/* Row 1: Name + Business */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="flex flex-col gap-2">
            <label htmlFor="plan-name" className="text-xs font-bold text-white/75 uppercase tracking-widest">
              Your Name *
            </label>
            <input
            id="plan-name" name="name" maxLength={120}
              type="text"
              required
              autoComplete="name"
              className="bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-white focus:outline-none focus:border-creative-flame transition-colors"
              placeholder="Your full name"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="plan-business" className="text-xs font-bold text-white/75 uppercase tracking-widest">
              Business Name
            </label>
            <input
            id="plan-business" name="business" maxLength={254}
              type="text"
              autoComplete="organization"
              className="bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-white focus:outline-none focus:border-creative-flame transition-colors"
              placeholder="Your business or brand"
            />
          </div>
        </div>

        {/* Row 2: Phone + Email */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="flex flex-col gap-2">
            <label htmlFor="plan-phone" className="text-xs font-bold text-white/75 uppercase tracking-widest">
              Phone Number *
            </label>
            <input
            id="plan-phone" name="phone" maxLength={254}
              type="tel"
              required
              autoComplete="tel"
              className="bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-white focus:outline-none focus:border-creative-flame transition-colors"
              placeholder="+94 7X XXX XXXX"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="plan-email" className="text-xs font-bold text-white/75 uppercase tracking-widest">
              Email Address *
            </label>
            <input
            id="plan-email" name="email" maxLength={254}
              type="email"
              required
              autoComplete="email"
              className="bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-white focus:outline-none focus:border-creative-flame transition-colors"
              placeholder="hello@company.com"
            />
          </div>
        </div>

        {/* Row 3: Link */}
        <div className="flex flex-col gap-2">
          <label htmlFor="plan-link" className="text-xs font-bold text-white/75 uppercase tracking-widest">
            Instagram, Facebook, or Website Link
          </label>
          <input
            id="plan-link" name="link" maxLength={254}
            type="url"
            className="bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-white focus:outline-none focus:border-creative-flame transition-colors"
            placeholder="https://..."
          />
        </div>

        {/* Service Checkboxes */}
        <div className="flex flex-col gap-3">
          <label className="text-xs font-bold text-white/75 uppercase tracking-widest">
            What do you need help with? *
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {serviceOptions.map((service) => (
              <button
                key={service}
                type="button"
                aria-pressed={selectedServices.includes(service)}
                onClick={() => toggleService(service)}
                className={`text-left px-4 py-3 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                  selectedServices.includes(service)
                    ? 'bg-creative-flame/20 border border-creative-flame/40 text-white'
                    : 'bg-white/5 border border-white/10 text-white/60 hover:bg-white/10 hover:text-white'
                }`}
              >
                {service}
              </button>
            ))}
          </div>
        </div>

        {/* Budget + Timeline */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="flex flex-col gap-2">
            <label htmlFor="plan-budget" className="text-xs font-bold text-white/75 uppercase tracking-widest">
              Approximate Budget
            </label>
            <input
            id="plan-budget" name="budget" maxLength={254}
              type="text"
              className="bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-white focus:outline-none focus:border-creative-flame transition-colors"
              placeholder="e.g. LKR 50,000 – 100,000"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="plan-timeline" className="text-xs font-bold text-white/75 uppercase tracking-widest">
              When do you want to begin?
            </label>
            <input
            id="plan-timeline" name="timeline" maxLength={254}
              type="text"
              className="bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-white focus:outline-none focus:border-creative-flame transition-colors"
              placeholder="e.g. This month, Next month"
            />
          </div>
        </div>

        {/* Goals */}
        <div className="flex flex-col gap-2">
          <label htmlFor="plan-goals" className="text-xs font-bold text-white/75 uppercase tracking-widest">
            What do you want to achieve?
          </label>
          <textarea
            id="plan-goals" name="goals" maxLength={4000}
            rows={3}
            className="bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-white focus:outline-none focus:border-creative-flame transition-colors resize-none"
            placeholder="Tell us about your goals and what success looks like for you..."
          />
        </div>

        <div hidden aria-hidden="true"><label htmlFor="plan-company-url">Company URL</label><input id="plan-company-url" name="company_url" tabIndex={-1} autoComplete="off" /></div>
        {error && <p role="alert" className="text-red-300 text-sm">{error} <a className="underline" href="mailto:hello@ideomint.com">Email us directly</a>.</p>}
        <p className="text-xs text-white/75">We use your details to respond to this enquiry. <a className="underline" href="/privacy">Privacy policy</a></p>
        {/* Submit */}
        <button
          type="submit"
          disabled={sending}
          className="w-full bg-creative-flame hover:bg-[#E54D30] text-section-ink font-bold py-4 disabled:opacity-60 rounded-xl flex items-center justify-center transition-colors min-h-[56px] cursor-pointer"
        >
          {sending ? 'Sending…' : 'Build My Custom Plan'}
        </button>
      </form>
    </div>
  );
}
