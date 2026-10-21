import { Globe, Megaphone, Camera, ArrowRight } from 'lucide-react';
import Link from 'next/link';

const services = [
  { id: '01', title: 'Websites', href: '/services#websites', description: 'Professional, responsive websites that build trust and turn visitors into enquiries.', icon: Globe, iconColor: 'text-creative-flame' },
  { id: '02', title: 'Marketing', href: '/services#grow-presence', description: 'Social media, campaigns, and digital marketing that increase visibility and create business opportunities.', icon: Megaphone, iconColor: 'text-signal-lime' },
  { id: '03', title: 'Content & Creative', href: '/services#create-content', description: 'Reels, photography, videos, design, and creative campaigns that make brands memorable.', icon: Camera, iconColor: 'text-digital-pulse' },
];

export default function Services() {
  return (
    <section id="services" className="text-white section-spacing relative">
      {/* Background Glowing Orbs for Glassmorphism effect */}
      <div className="absolute top-1/2 left-0 w-[400px] h-[400px] bg-creative-flame/10 rounded-full blur-[80px] -translate-x-1/2 pointer-events-none" />
      <div aria-hidden="true" className="absolute bottom-0 -right-32 w-[500px] h-[500px] bg-[radial-gradient(ellipse_at_center,var(--color-digital-pulse)_0%,transparent_70%)] opacity-10 pointer-events-none" />

      <div className="container-layout relative z-10">
        {/* Header Area */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 mb-8 md:mb-12">
          <div className="flex flex-col gap-8 max-w-4xl">
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-6">
                <span className="text-creative-flame font-bold tracking-widest text-xs uppercase">What We Do</span>
                <div className="h-px bg-white/20 w-12" />
              </div>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-black leading-[1.1] tracking-tight mb-5 md:mb-8">
                We help you become{' '}
                <span className="text-creative-flame">clear, visible, and memorable.</span>
              </h2>
              <p className="text-lg text-white/70 leading-relaxed font-medium max-w-2xl">
                Explore our packages for websites, marketing, content, branding and personal branding.
              </p>
            </div>
          </div>
          
          <Link
            href="/services"
            className="hidden lg:flex items-center gap-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-creative-flame/50 text-white px-8 py-4 rounded-full text-sm font-bold tracking-widest uppercase transition-all duration-300 group cursor-pointer"
          >
            Explore Packages
            <ArrowRight className="w-4 h-4 text-creative-flame group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 md:mb-12">
          {services.map((service) => (
            <Link
              key={service.id}
              href={service.href}
              className="bg-white/5 backdrop-blur-md rounded-2xl p-5 md:p-8 flex flex-col md:min-h-[280px] group hover:bg-white/10 hover:border-white/20 hover:-translate-y-1 transition-all duration-500 border border-white/10 will-change-transform cursor-pointer"
            >
              <span className="text-sm font-bold text-white/70 mb-4 md:mb-6">{service.id}</span>
              <div className={`mb-4 md:mb-6 ${service.iconColor}`}>
                <service.icon className="w-8 h-8 stroke-[1.5]" />
              </div>
              <h3 className="text-xl font-bold leading-tight mb-3 pr-4 text-white">
                {service.title}
              </h3>
              <p className="text-sm text-white/70 leading-relaxed flex-grow">
                {service.description}
              </p>
            </Link>
          ))}
        </div>

        {/* Bottom CTA for Mobile and Extra Prominence */}
        <div className="flex lg:hidden justify-center mt-8">
          <Link
            href="/services"
            className="flex items-center justify-center gap-3 w-full bg-creative-flame hover:bg-[#E54D30] text-section-ink px-8 py-5 rounded-2xl text-base font-bold transition-all duration-300 group cursor-pointer shadow-[0_0_30px_rgba(255,90,60,0.15)]"
          >
            View All Pricing & Packages
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  );
}
