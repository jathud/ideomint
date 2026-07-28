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
            </div>
          </div>

          {/* Links Group 1 */}
          <div className="lg:col-span-2 lg:col-start-6">
            <h4 className="text-sm font-bold tracking-widest text-white/40 uppercase mb-6">Studio</h4>
            <ul className="flex flex-col gap-4">
              <li><Link href={isHome ? '#manifesto' : '/#manifesto'} className="hover:text-creative-flame transition-colors font-medium p-2 -ml-2 w-max inline-block">About Us</Link></li>
              <li><Link href={isHome ? '#services' : '/#services'} className="hover:text-creative-flame transition-colors font-medium p-2 -ml-2 w-max inline-block">Capabilities</Link></li>
              <li><Link href={isHome ? '#teardown' : '/#teardown'} className="hover:text-creative-flame transition-colors font-medium p-2 -ml-2 w-max inline-block">Case Studies</Link></li>
              <li><Link href={isHome ? '#sandbox' : '/#sandbox'} className="hover:text-creative-flame transition-colors font-medium p-2 -ml-2 w-max inline-block">The Lab</Link></li>
              <li><Link href="#" className="hover:text-creative-flame transition-colors font-medium flex items-center gap-1 p-2 -ml-2 w-max">Careers <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="7" x2="17" y1="17" y2="7"/><polyline points="7 7 17 7 17 17"/></svg></Link></li>
            </ul>
          </div>

          {/* Links Group 2 */}
          <div className="lg:col-span-2">
            <h4 className="text-sm font-bold tracking-widest text-white/40 uppercase mb-6">Connect</h4>
            <ul className="flex flex-col gap-4">
              <li><Link href={isHome ? '#contact' : '/#contact'} className="hover:text-creative-flame transition-colors font-medium p-2 -ml-2 w-max inline-block">Contact</Link></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="lg:col-span-3">
            <h4 className="text-sm font-bold tracking-widest text-white/40 uppercase mb-6">The Mint</h4>
            <p className="text-sm text-white/60 mb-4">Subscribe to our newsletter for brand strategy insights and studio updates.</p>
            <form className="flex flex-col gap-3" onSubmit={(e) => e.preventDefault()}>
              <div className="relative">
                <input 
                  type="email" 
                  placeholder="Email Address" 
                  className="w-full bg-white/5 border border-white/10 rounded-full px-5 py-3.5 text-sm focus:outline-none focus:border-creative-flame transition-colors"
                  required
                />
                <button type="submit" className="absolute right-1 top-1 bottom-1 px-4 bg-white text-section-ink rounded-full text-xs font-bold hover:bg-creative-flame hover:text-white transition-colors min-w-[80px]">
                  Join
                </button>
              </div>
              <label className="flex items-start gap-2 cursor-pointer mt-2 group py-2">
                <div className="relative flex items-center justify-center mt-0.5">
                  <input type="checkbox" className="peer sr-only" required />
                  <div className="w-4 h-4 border border-white/30 rounded-sm peer-checked:bg-creative-flame peer-checked:border-creative-flame transition-colors flex items-center justify-center">
                    <svg className="w-3 h-3 text-white opacity-0 peer-checked:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
                <span className="text-xs text-white/50 group-hover:text-white/80 transition-colors">I agree to receive marketing communications.</span>
              </label>
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t border-white/10 text-xs text-white/40 gap-4">
          <p>© {new Date().getFullYear()} Ideomint. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link href="#" className="hover:text-white transition-colors p-2 -m-2">Privacy Policy</Link>
            <Link href="#" className="hover:text-white transition-colors p-2 -m-2">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
