'use client';

import React, { useState } from 'react';
import { ChevronDown, Mail, MapPin, Phone, Globe, Check } from 'lucide-react';

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
        <h3 className="text-2xl font-bold text-white mb-4">Thank you.</h3>
        <p className="text-white/70 leading-relaxed max-w-md mx-auto">
          We have received your request. Our team will review it and contact you within 1–2 working days.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 md:p-10">
      <form
        className="flex flex-col gap-6"
        onSubmit={(e) => {
          e.preventDefault();
          setSubmitted(true);
        }}
      >
        {/* Row 1: Name + Business */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-white/50 uppercase tracking-widest">
              Your Name *
            </label>
            <input
              type="text"
              required
              autoComplete="name"
              className="bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-white focus:outline-none focus:border-creative-flame transition-colors"
              placeholder="Your full name"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-white/50 uppercase tracking-widest">
              Business Name
            </label>
            <input
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
            <label className="text-xs font-bold text-white/50 uppercase tracking-widest">
              Phone Number *
            </label>
            <input
              type="tel"
              required
              autoComplete="tel"
              className="bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-white focus:outline-none focus:border-creative-flame transition-colors"
              placeholder="+94 7X XXX XXXX"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-white/50 uppercase tracking-widest">
              Email Address *
            </label>
            <input
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
          <label className="text-xs font-bold text-white/50 uppercase tracking-widest">
            Instagram, Facebook, or Website Link
          </label>
          <input
            type="url"
            className="bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-white focus:outline-none focus:border-creative-flame transition-colors"
            placeholder="https://..."
          />
        </div>

        {/* Service Checkboxes */}
        <div className="flex flex-col gap-3">
          <label className="text-xs font-bold text-white/50 uppercase tracking-widest">
            What do you need help with? *
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {serviceOptions.map((service) => (
              <button
                key={service}
                type="button"
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
            <label className="text-xs font-bold text-white/50 uppercase tracking-widest">
              Approximate Budget
            </label>
            <input
              type="text"
              className="bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-white focus:outline-none focus:border-creative-flame transition-colors"
              placeholder="e.g. LKR 50,000 – 100,000"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-white/50 uppercase tracking-widest">
              When do you want to begin?
            </label>
            <input
              type="text"
              className="bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-white focus:outline-none focus:border-creative-flame transition-colors"
              placeholder="e.g. This month, Next month"
            />
          </div>
        </div>

        {/* Goals */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold text-white/50 uppercase tracking-widest">
            What do you want to achieve?
          </label>
          <textarea
            rows={3}
            className="bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-white focus:outline-none focus:border-creative-flame transition-colors resize-none"
            placeholder="Tell us about your goals and what success looks like for you..."
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="w-full bg-creative-flame hover:bg-[#E54D30] text-white font-bold py-4 rounded-xl flex items-center justify-center transition-colors min-h-[56px] cursor-pointer"
        >
          Build My Custom Plan
        </button>
      </form>
    </div>
  );
}
