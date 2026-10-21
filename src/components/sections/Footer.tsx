'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Footer() {
  const pathname = usePathname();
  const isHome = pathname === '/';

  return (
    <footer className="text-white pt-20 pb-8 border-t border-white/10">
      <div className="container-layout">
        <div aria-label="Contact IdeoMint" className="flex flex-col items-center text-center gap-4 sm:gap-6 pb-12 md:pb-20 mb-16 md:mb-20 border-b border-white/10">
          <a
            href="mailto:hello@ideomint.com"
            className="block w-fit max-w-full whitespace-nowrap text-[clamp(1.75rem,7.5vw,6.875rem)] leading-[1.08] font-black tracking-tighter text-white hover:text-creative-flame hover:translate-x-1 transition-[color,transform] duration-300 motion-reduce:transform-none focus-visible:outline-2 focus-visible:outline-offset-8 focus-visible:outline-creative-flame"
          >
            hello@ideomint.com
          </a>
          <a
            href="tel:+94786892649"
            className="block w-fit max-w-full whitespace-nowrap text-[clamp(1.375rem,5vw,4.5rem)] leading-[1.08] font-black tracking-tighter text-creative-flame hover:text-white hover:translate-x-1 transition-[color,transform] duration-300 motion-reduce:transform-none focus-visible:outline-2 focus-visible:outline-offset-8 focus-visible:outline-creative-flame"
          >
            +94 78 689 2649
          </a>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8 mb-20">
          
          {/* Brand Info (Takes up 4 cols on large) */}
          <div className="lg:col-span-4 flex flex-col">
            <Link href="/" className="flex items-center gap-3 mb-6 w-max p-2 -ml-2">
              <div className="relative w-8 h-8 flex items-center justify-center">
                <div className="absolute top-0 left-0 w-[14px] h-[14px] border-t-[4px] border-l-[4px] border-creative-flame" />
                <div className="absolute top-0 right-0 w-[14px] h-[14px] border-t-[4px] border-r-[4px] border-white" />
                <div className="absolute bottom-0 left-0 w-[14px] h-[14px] border-b-[4px] border-l-[4px] border-white" />
                <div className="absolute bottom-0 right-0 w-[14px] h-[14px] border-b-[4px] border-r-[4px] border-creative-flame" />
              </div>
              <span className="text-[22px] font-black text-white tracking-widest uppercase">
                Ideo<span className="text-creative-flame">Mint</span>
              </span>
            </Link>
            <p className="text-white/60 max-w-sm mb-8 leading-relaxed">
              We mint ideas into powerful stories. A creative experience company bridging the gap between imagination and execution.
            </p>
            
            {/* Social Links */}
            <div className="flex flex-wrap items-center gap-3 mt-auto">
              <a
                href="https://www.instagram.com/ideomint/?utm_source=ig_web_button_share_sheet"
                rel="noopener noreferrer"
                target="_blank"
                className="w-11 h-11 rounded-full border border-white/20 flex items-center justify-center hover:bg-creative-flame hover:border-creative-flame transition-colors group"
                aria-label="Instagram"
                title="Follow Ideomint on Instagram"
              >
                <svg className="w-4 h-4 text-white group-hover:scale-110 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
              </a>
              <a
                href="https://web.facebook.com/profile.php?id=61591030654944"
                rel="noopener noreferrer"
                target="_blank"
                className="w-11 h-11 rounded-full border border-white/20 flex items-center justify-center hover:bg-creative-flame hover:border-creative-flame transition-colors group"
                aria-label="Facebook"
                title="Follow Ideomint on Facebook"
              >
                <svg className="w-4 h-4 text-white group-hover:scale-110 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
              </a>
              <a
                href="https://www.linkedin.com/company/ideomint/"
                rel="noopener noreferrer"
                target="_blank"
                className="w-11 h-11 rounded-full border border-white/20 flex items-center justify-center hover:bg-creative-flame hover:border-creative-flame transition-colors group"
                aria-label="IdeoMint on LinkedIn (opens in a new tab)"
                title="Follow IdeoMint on LinkedIn"
              >
                <svg aria-hidden="true" className="w-4 h-4 text-white group-hover:scale-110 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4V9h4v2a6 6 0 0 1 2-3z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>
              </a>
            </div>
          </div>

          {/* Links Group 1 */}
          <div className="lg:col-span-2 lg:col-start-6">
            <h4 className="text-sm font-bold tracking-widest text-white/80 uppercase mb-6">Studio</h4>
            <ul className="flex flex-col gap-4">
              <li><Link href={isHome ? '#about' : '/#about'} className="hover:text-creative-flame transition-colors font-medium p-2 -ml-2 w-max inline-block">About Us</Link></li>
              <li><Link href={isHome ? '#services' : '/#services'} className="hover:text-creative-flame transition-colors font-medium p-2 -ml-2 w-max inline-block">Capabilities</Link></li>
              <li><Link href={isHome ? '#work' : '/#work'} className="hover:text-creative-flame transition-colors font-medium p-2 -ml-2 w-max inline-block">Work</Link></li>
              <li><Link href={isHome ? '#sandbox' : '/#sandbox'} className="hover:text-creative-flame transition-colors font-medium p-2 -ml-2 w-max inline-block">The Lab</Link></li>
              <li><Link href="/careers" className="hover:text-creative-flame transition-colors font-medium p-2 -ml-2 inline-block">Careers</Link></li>
            </ul>
          </div>

          {/* Links Group 2 */}
          <div className="lg:col-span-2">
            <h4 className="text-sm font-bold tracking-widest text-white/80 uppercase mb-6">Connect</h4>
            <ul className="flex flex-col gap-4">
              <li><Link href={isHome ? '#contact' : '/#contact'} className="hover:text-creative-flame transition-colors font-medium p-2 -ml-2 w-max inline-block">Contact</Link></li>
            </ul>
          </div>

          <div className="lg:col-span-3">
            <h4 className="text-sm font-bold tracking-widest text-white/80 uppercase mb-6">Have an idea?</h4>
            <p className="text-sm text-white/70 mb-5 leading-relaxed">Tell us what you have in mind. We’ll help you find the right starting point.</p>
            <a href="mailto:hello@ideomint.com" className="inline-flex min-h-11 items-center text-sm font-bold text-creative-flame hover:text-white">Email the studio →</a>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t border-white/10 text-xs text-white/75 gap-4">
          <p>© {new Date().getFullYear()} Ideomint. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="hover:text-white font-medium transition-colors p-2 -m-2">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-white font-medium transition-colors p-2 -m-2">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
