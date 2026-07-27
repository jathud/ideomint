'use client';

import React, { useState } from 'react';
import { Mail, MapPin, ChevronDown, Check } from 'lucide-react';

export default function Contact() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedService, setSelectedService] = useState('Select a service');

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [honeypot, setHoneypot] = useState('');
  const [message, setMessage] = useState('');

  const [errors, setErrors] = useState<{ name?: string; email?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const serviceOptions = [
    'Brand Strategy & Identity',
    'Web & Digital Design',
    'Live Events & Experiences',
    'Content Production',
    'Other'
  ];

  const validateEmail = (value: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Honeypot check — if filled, silently reject
    if (honeypot) return;

    const newErrors: { name?: string; email?: string } = {};
    if (!name.trim()) newErrors.name = 'Name is required.';
    if (!email.trim()) {
      newErrors.email = 'Email is required.';
    } else if (!validateEmail(email)) {
      newErrors.email = 'Please enter a valid email address.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    // Fake submit — simulate network delay
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      setName('');
      setEmail('');
      setMessage('');
      setSelectedService('Select a service');
    }, 1500);
  };

  return (
    <section id="contact" className="section-spacing text-white relative">
      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-creative-flame/10 blur-[80px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-digital-pulse/10 blur-[80px] rounded-full pointer-events-none" />
      
      <div className="container-layout relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-24">
          
          {/* Left Column - Content */}
          <div className="flex flex-col">
            <div className="flex items-center gap-4 mb-8">
              <span className="text-creative-flame font-bold tracking-widest text-xs uppercase">07 / Connect</span>
              <div className="h-px bg-white/20 w-12" />
            </div>
            
            <h2 className="text-5xl md:text-6xl lg:text-7xl font-black leading-[1.05] tracking-tight mb-8">
              Let's mint something <span className="text-creative-flame">exceptional.</span>
            </h2>
            
            <p className="text-lg text-white/90 max-w-md leading-relaxed mb-12">
              Whether you're looking to build a brand from scratch, launch a campaign, or design an unforgettable physical experience—we're ready.
            </p>
            
            <div className="flex flex-col gap-8 mt-auto">
              <a href="mailto:ideomint@gmail.com" className="flex items-start gap-4 group">
                <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-section-ink transition-colors shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm text-white/70 font-bold mb-1 uppercase tracking-wider">Email Us</p>
                  <p className="text-xl font-medium group-hover:text-creative-flame transition-colors">ideomint@gmail.com</p>
                </div>
              </a>
              
              <div className="flex items-start gap-4 group">
                <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-section-ink transition-colors shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm text-white/70 font-bold mb-1 uppercase tracking-wider">Visit Studio</p>
                  <p className="text-xl font-medium group-hover:text-creative-flame transition-colors">
                    Jaffna,<br />Sri Lanka
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Form */}
          <div className="bg-white/5 backdrop-blur-md border border-white/10 p-8 md:p-12 rounded-[2rem] relative">
            
            <h3 className="text-2xl font-bold mb-8">Start a project</h3>

            {isSubmitted ? (
              <div className="flex flex-col items-center justify-center text-center py-16 animate-[loadingFadeUp_0.4s_ease-out_forwards]">
                <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mb-6">
                  <Check className="w-8 h-8 text-green-400" />
                </div>
                <h4 className="text-xl font-bold mb-2">Request Sent!</h4>
                <p className="text-white/60 max-w-sm">Thank you for reaching out. We'll get back to you within 24 hours.</p>
                <button
                  type="button"
                  onClick={() => setIsSubmitted(false)}
                  className="mt-8 text-sm text-creative-flame hover:underline cursor-pointer"
                >
                  Send another request
                </button>
              </div>
            ) : (
              <form className="flex flex-col gap-6" onSubmit={handleSubmit} noValidate>

                {/* Honeypot — invisible to real users, attracts bots */}
                <div aria-hidden="true" className="absolute overflow-hidden" style={{ position: 'absolute', left: '-9999px', top: '-9999px', width: 0, height: 0 }}>
                  <label htmlFor="company_url">Company URL</label>
                  <input
                    type="text"
                    id="company_url"
                    name="company_url"
                    value={honeypot}
                    onChange={(e) => setHoneypot(e.target.value)}
                    tabIndex={-1}
                    autoComplete="off"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label htmlFor="name" className="text-xs font-bold text-white/50 uppercase tracking-widest">Your Name *</label>
                  <input 
                    type="text" 
                    id="name"
                    required
                    autoComplete="name"
                    value={name}
                    onChange={(e) => { setName(e.target.value); if (errors.name) setErrors((prev) => ({ ...prev, name: undefined })); }}
                    className={`bg-white/5 border rounded-xl px-4 py-4 text-white focus:outline-none transition-colors ${errors.name ? 'border-red-500 focus:border-red-400' : 'border-white/10 focus:border-creative-flame'}`}
                    placeholder="Your full name"
                  />
                  {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
                </div>
                
                <div className="flex flex-col gap-2">
                  <label htmlFor="email" className="text-xs font-bold text-white/50 uppercase tracking-widest">Email Address *</label>
                  <input 
                    type="email" 
                    id="email"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); if (errors.email) setErrors((prev) => ({ ...prev, email: undefined })); }}
                    className={`bg-white/5 border rounded-xl px-4 py-4 text-white focus:outline-none transition-colors ${errors.email ? 'border-red-500 focus:border-red-400' : 'border-white/10 focus:border-creative-flame'}`}
                    placeholder="hello@company.com"
                  />
                  {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
                </div>
                
                <div className="flex flex-col gap-2 relative z-20">
                  <label className="text-xs font-bold text-white/50 uppercase tracking-widest">I'm interested in...</label>
                  <div className="relative">
                    <button 
                      type="button"
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-white focus:outline-none focus:border-creative-flame transition-colors flex justify-between items-center"
                    >
                      <span className={selectedService === 'Select a service' ? 'text-white/50' : 'text-white'}>{selectedService}</span>
                      <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>
                    
                    {isDropdownOpen && (
                      <ul className="absolute top-full left-0 w-full mt-2 bg-[#1A1C23] border border-white/10 rounded-xl overflow-hidden shadow-2xl z-50 animate-[loadingFadeUp_0.2s_ease-out_forwards]">
                        {serviceOptions.map((opt) => (
                          <li key={opt}>
                            <button
                              type="button"
                              onClick={() => { setSelectedService(opt); setIsDropdownOpen(false); }}
                              className="w-full text-left px-4 py-3 text-white/80 hover:text-white hover:bg-white/10 transition-colors"
                            >
                              {opt}
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-2 mb-4">
                  <label htmlFor="message" className="text-xs font-bold text-white/50 uppercase tracking-widest">Project Details</label>
                  <textarea 
                    id="message"
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-white focus:outline-none focus:border-creative-flame transition-colors resize-none"
                    placeholder="Tell us about your goals, timeline, and budget..."
                  />
                </div>

                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-creative-flame hover:bg-[#E54D30] disabled:opacity-70 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-colors min-h-[56px] cursor-pointer"
                >
                  {isSubmitting ? (
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  ) : (
                    'Send Request'
                  )}
                </button>
              </form>
            )}
          </div>
          
        </div>
      </div>
    </section>
  );
}
