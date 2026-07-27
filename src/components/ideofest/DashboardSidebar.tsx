'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  CalendarDays,
  Users,
  QrCode,
  BarChart2,
  PlusCircle,
  FileCheck,
  type LucideIcon,
  ShieldCheck,
} from 'lucide-react';

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
      { href: '/ideofest/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
    ],
  },
  {
    label: 'Events',
    items: [
      { href: '/ideofest/admin/events', label: 'My Events', icon: CalendarDays },
      { href: '/ideofest/admin/events/create', label: 'Create Event', icon: PlusCircle },
    ],
  },
  {
    label: 'Attendees',
    items: [
      { href: '/ideofest/admin/attendees', label: 'Attendee List', icon: Users },
      { href: '/ideofest/admin/verifications', label: 'Payment Slips', icon: FileCheck },
      { href: '/ideofest/admin/scanner', label: 'QR Scanner', icon: QrCode },
    ],
  },
  {
    label: 'Reports',
    items: [
      { href: '/ideofest/admin/reports', label: 'Analytics', icon: BarChart2 },
    ],
  },
];

export default function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex w-64 shrink-0 flex-col bg-[#080A12] border-r border-white/8 min-h-[calc(100vh-5rem)]">
      {/* Brand Header */}
      <div className="px-5 py-4 border-b border-white/8 bg-white/2">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#c1e527] shrink-0" />
          <span className="text-xs font-black text-[#c1e527] tracking-[0.15em] uppercase truncate">
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
                ? pathname === href
                : (pathname === href || pathname.startsWith(href + '/'));
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl mb-0.5 text-sm font-semibold transition-all ${
                    active
                      ? 'bg-[#c1e527]/15 text-[#c1e527] border border-[#c1e527]/30 font-bold'
                      : 'text-white/60 hover:text-white hover:bg-white/6'
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-[#c1e527]' : 'text-white/40'}`} />
                  {label}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>
    </aside>
  );
}
