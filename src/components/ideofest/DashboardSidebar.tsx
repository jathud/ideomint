'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  CalendarDays,
  Users,
  QrCode,
  BarChart2,
  Settings,
  LogOut,
  PlusCircle,
  FileCheck,
  type LucideIcon,
  ShieldCheck,
} from 'lucide-react';
import IdeofestLogo from './IdeofestLogo';

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  exact?: boolean;
}

interface NavSection {
  label: string;
  items: NavItem[];
}

const navSections: NavSection[] = [
  {
    label: 'Overview',
    items: [
      { href: '/', label: 'Dashboard', icon: LayoutDashboard, exact: true },
    ],
  },
  {
    label: 'Events',
    items: [
      { href: '/events', label: 'My Events', icon: CalendarDays },
      { href: '/events/create', label: 'Create Event', icon: PlusCircle },
    ],
  },
  {
    label: 'Attendees',
    items: [
      { href: '/attendees', label: 'Attendee List', icon: Users },
      { href: '/verifications', label: 'Payment Slips', icon: FileCheck },
      { href: '/scanner', label: 'QR Scanner', icon: QrCode },
    ],
  },
  {
    label: 'Reports',
    items: [
      { href: '/reports', label: 'Analytics', icon: BarChart2 },
    ],
  },
];

export default function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 shrink-0 flex flex-col bg-[#080A12] border-r border-white/8 min-h-[calc(100vh-5rem)]">
      {/* Brand Header */}
      <div className="px-5 py-4 border-b border-white/8 bg-white/2">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-signal-lime shrink-0" />
          <span className="text-xs font-black text-signal-lime tracking-[0.15em] uppercase truncate">
            Admin Controls
          </span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        {navSections.map((section) => (
          <div key={section.label} className="mb-6">
            <p className="px-3 mb-2 text-[10px] font-bold text-white/30 tracking-[0.15em] uppercase">
              {section.label}
            </p>
            {section.items.map(({ href, label, icon: Icon, exact }) => {
              const active = exact
                ? (pathname === href || pathname === '/ideofest/admin' || (pathname === '/' && href === '/'))
                : (pathname === href || pathname.startsWith(href + '/') || pathname === `/ideofest/admin${href}` || pathname.startsWith(`/ideofest/admin${href}/`));
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl mb-0.5 text-sm font-semibold transition-all ${
                    active
                      ? 'bg-signal-lime/15 text-signal-lime border border-signal-lime/30 font-bold'
                      : 'text-white/60 hover:text-white hover:bg-white/6'
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-signal-lime' : 'text-white/40'}`} />
                  {label}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Sidebar Footer */}
      <div className="px-3 py-4 border-t border-white/8">
        <Link
          href="/settings"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-white/50 hover:text-white hover:bg-white/6 transition-colors mb-1"
        >
          <Settings className="w-4 h-4" />
          Settings
        </Link>
        <a
          href="http://localhost:3000/ideofest"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-white/50 hover:text-signal-lime hover:bg-signal-lime/10 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Exit to Main Site
        </a>
      </div>
    </aside>
  );
}
