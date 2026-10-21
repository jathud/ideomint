import { ArrowUpRight } from 'lucide-react';
import Link from 'next/link';

const capabilities = [
  { name: 'Websites', href: '/services#websites' },
  { name: 'Marketing', href: '/services#grow-presence' },
  { name: 'Content & Creative', href: '/services#create-content' },
];

export default function AgencyAbout() {
  return (
    <section id="about" className="section-spacing text-white">
      <div className="container-layout">
        <div className="flex items-center gap-4 mb-9 md:mb-12">
          <span aria-hidden="true" className="h-2 w-2 bg-creative-flame" />
          <p className="text-creative-flame text-xs font-bold uppercase tracking-widest">About IdeoMint</p>
          <span aria-hidden="true" className="h-px flex-1 bg-white/10" />
          <span className="hidden sm:block text-xs text-white/60">Jaffna, Sri Lanka</span>
        </div>
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-16">
          <div className="lg:col-span-5">
            <h2 className="max-w-lg text-[clamp(2.25rem,4.2vw,4rem)] font-black tracking-[-0.045em] leading-[1.06]">
              Big ideas deserve to become <span className="text-creative-flame">something real.</span>
            </h2>
            <p className="mt-6 max-w-sm text-base leading-relaxed text-white/65">
              Every business starts with an idea. We help give it clarity, character, and a place in the world.
            </p>
          </div>
          <div className="lg:col-span-7 lg:pt-1">
            <p className="text-xs font-bold uppercase tracking-widest text-white/60 mb-4">The studio behind the ideas</p>
            <p className="text-2xl md:text-3xl font-semibold leading-[1.35] tracking-tight max-w-2xl">
              A creative and digital agency <span className="text-white/60">based in Jaffna, Sri Lanka.</span>
            </p>
            <p className="mt-5 text-base md:text-lg text-white/75 leading-relaxed max-w-2xl">
              We bring creativity and strategy together for ambitious businesses, emerging brands, and bold thinkers. From digital experiences and brand identities to meaningful content and campaigns, we help ideas become work people notice, remember, and believe in.
            </p>
            <div className="mt-7 border-y border-white/15 divide-y divide-white/10 sm:divide-y-0 sm:divide-x sm:flex">
              {capabilities.map(capability => (
                <Link key={capability.name} href={capability.href}
                  className="group flex items-center justify-between gap-3 py-4 sm:px-4 first:pl-0 sm:flex-1 text-sm font-bold text-white/85 hover:text-creative-flame transition-colors">
                  {capability.name}
                  <ArrowUpRight aria-hidden="true" className="h-4 w-4 shrink-0 text-creative-flame group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform motion-reduce:transform-none" />
                </Link>
              ))}
            </div>
            <p className="mt-6 text-sm md:text-base text-white/65 leading-relaxed max-w-xl">
              Great creative work should be within reach of growing businesses. Every promising idea deserves the opportunity to grow.
            </p>
          </div>
        </div>
        <div className="relative mt-10 md:mt-14 border border-creative-flame/20 bg-creative-flame/[0.035] px-6 py-8 md:p-10 text-center">
          <span aria-hidden="true" className="pointer-events-none absolute -top-px -left-px h-5 w-5 border-t-[3px] border-l-[3px] border-creative-flame" />
          <span aria-hidden="true" className="pointer-events-none absolute -bottom-px -right-px h-5 w-5 border-b-[3px] border-r-[3px] border-creative-flame" />
          <p className="text-xs font-bold uppercase tracking-widest text-creative-flame mb-5">Our vision</p>
          <div className="mx-auto max-w-3xl">
            <p className="text-xl md:text-2xl lg:text-3xl font-semibold tracking-tight leading-snug [text-wrap:balance]">
              Turn ambitious ideas into brands that make a <span className="inline-block text-creative-flame">lasting impact.</span>
            </p>
            <p className="mt-4 text-sm text-white/65">We are here to make ideas matter.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
