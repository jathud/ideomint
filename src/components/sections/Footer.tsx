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
            <div className="flex flex-wrap items-center gap-2 mt-auto">
              <a href="#" rel="noopener noreferrer" target="_blank" className="w-11 h-11 rounded-full border border-white/20 flex items-center justify-center hover:bg-creative-flame hover:border-creative-flame transition-colors" aria-label="Instagram">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
              </a>
              <a href="#" rel="noopener noreferrer" target="_blank" className="w-11 h-11 rounded-full border border-white/20 flex items-center justify-center hover:bg-creative-flame hover:border-creative-flame transition-colors" aria-label="Twitter">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>
              </a>
              <a href="#" rel="noopener noreferrer" target="_blank" className="w-11 h-11 rounded-full border border-white/20 flex items-center justify-center hover:bg-creative-flame hover:border-creative-flame transition-colors" aria-label="LinkedIn">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></svg>
              </a>
              <a href="#" rel="noopener noreferrer" target="_blank" className="w-11 h-11 rounded-full border border-white/20 flex items-center justify-center hover:bg-creative-flame hover:border-creative-flame transition-colors" aria-label="Behance">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M7.5 11c1.38 0 2.5-.9 2.5-2s-1.12-2-2.5-2H3v4h4.5zm1 2H3v4h5.5c1.38 0 2.5-.9 2.5-2s-1.12-2-2.5-2zm7-5h5v1.5h-5V8zm2.5 3c-2.49 0-4.5 1.79-4.5 4s2.01 4 4.5 4c1.77 0 3.3-.95 4.03-2.33h-2.05c-.42.63-1.13 1.03-1.98 1.03-1.38 0-2.5-.9-2.5-2h7c.03-.22.05-.44.05-.67 0-2.24-2.01-4.03-4.5-4.03zm-2.42 3c.24-1.03 1.25-1.75 2.42-1.75s2.18.72 2.42 1.75h-4.84z"/>
                </svg>
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
