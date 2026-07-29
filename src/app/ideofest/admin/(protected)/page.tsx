import AnalyticsChart from '@/components/ideofest/AnalyticsChart';
import { TrendingUp, Users, CalendarDays, PlusCircle, ShieldCheck, Download, FileCheck, QrCode, Clock, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { createAdminClient } from '@/lib/ideofest/supabase/server';

function formatLKR(n: number) {
  if (n >= 1_000_000) return `LKR ${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1000) return `LKR ${(n / 1000).toFixed(0)}K`;
  return `LKR ${n.toLocaleString('en-LK')}`;
}

export default async function AdminDashboardPage() {
  const supabase = createAdminClient();

  // Fetch live stats from Supabase
  const [eventsRes, bookingsRes, pendingRes] = await Promise.all([
    supabase.from('events').select('id, status').eq('status', 'published'),
    supabase.from('bookings').select('id, total_amount, payment_status, status, tier_label, quantity, attendee_name, attendee_email, attendee_phone, booking_ref, event_title, payment_method, created_at'),
    supabase.from('bookings').select('id', { count: 'exact' }).eq('payment_status', 'pending_verification'),
  ]);

  const bookings = bookingsRes.data || [];
  const confirmedBookings = bookings.filter((b: any) => b.status === 'confirmed' || b.payment_status === 'paid');
  const totalRevenue = confirmedBookings.reduce((s: number, b: any) => s + (Number(b.total_amount) || 0), 0);
  const totalTicketsSold = confirmedBookings.reduce((s: number, b: any) => s + (Number(b.quantity) || 1), 0);
  const activeEvents = eventsRes.data?.length || 0;
  const pendingCount = pendingRes.count || 0;

  // Calculate real daily revenue for the past 14 days from Supabase
  const days = 14;
  const revenueMap: Record<string, number> = {};
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    revenueMap[dateStr] = 0;
  }

  bookings.forEach((b: any) => {
    const isPaid = b.payment_status === 'paid' || b.status === 'confirmed';
    if (isPaid && b.created_at) {
      const dateStr = new Date(b.created_at).toISOString().split('T')[0];
      if (revenueMap[dateStr] !== undefined) {
        revenueMap[dateStr] += Number(b.total_amount || 0);
      }
    }
  });

  const revenueData = Object.entries(revenueMap).map(([date, revenue]) => ({
    date,
    revenue,
  }));

  const kpis = [
    { label: 'Total Revenue', value: formatLKR(totalRevenue), icon: TrendingUp, color: 'text-[#c1e527]', bg: 'bg-[#c1e527]/10' },
    { label: 'Tickets Sold', value: totalTicketsSold.toString(), icon: Users, color: 'text-amber-400', bg: 'bg-amber-400/10' },
    { label: 'Pending Reviews', value: pendingCount.toString(), icon: Clock, color: 'text-amber-400', bg: 'bg-amber-400/10' },
    { label: 'Active Events', value: activeEvents.toString(), icon: CalendarDays, color: 'text-white', bg: 'bg-white/10' },
  ];

  const recentBookings = bookings.slice(0, 10);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* Page Title & Main Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck className="w-6 h-6 text-[#c1e527]" />
            <h1 className="text-2xl sm:text-3xl font-black text-white">Admin Management Dashboard</h1>
          </div>
          <p className="text-white/40 text-xs sm:text-sm">Manage users, download reports, review slips & monitor live event analytics</p>
        </div>

        {/* Primary Action Buttons */}
        <div className="flex flex-wrap gap-2.5">
          <Link
            href="/ideofest/admin/attendees"
            className="inline-flex items-center gap-2 bg-[#c1e527] hover:bg-[#b0d420] text-section-ink px-4 py-2.5 rounded-xl font-black text-xs sm:text-sm transition-all shadow-lg"
          >
            <Download className="w-4 h-4" /> Download User Details CSV
          </Link>

          {pendingCount > 0 && (
            <Link
              href="/ideofest/admin/verifications"
              className="inline-flex items-center gap-2 bg-amber-500/15 hover:bg-amber-500/25 text-amber-400 px-4 py-2.5 rounded-xl font-black text-xs sm:text-sm transition-all border border-amber-500/30"
            >
              <Clock className="w-4 h-4" /> {pendingCount} Pending Slips
            </Link>
          )}

          <Link
            href="/ideofest/admin/events/create"
            className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all border border-white/10"
          >
            <PlusCircle className="w-4 h-4 text-[#c1e527]" /> Create Event
          </Link>
        </div>
      </div>

      {/* Quick Admin Management Controls Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link
          href="/ideofest/admin/attendees"
          className="bg-white/4 border border-white/8 rounded-2xl p-4 hover:border-[#c1e527]/40 hover:bg-white/6 transition-all group backdrop-blur-md"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="w-9 h-9 rounded-xl bg-[#c1e527]/10 flex items-center justify-center">
              <Users className="w-4 h-4 text-[#c1e527]" />
            </div>
            <ArrowRight className="w-4 h-4 text-white/30 group-hover:text-[#c1e527] transition-colors" />
          </div>
          <p className="text-sm font-bold text-white mb-0.5">User Details & CSV</p>
          <p className="text-xs text-white/40">View, filter & download all attendee records</p>
        </Link>

        <Link
          href="/ideofest/admin/verifications"
          className="bg-white/4 border border-white/8 rounded-2xl p-4 hover:border-amber-400/40 hover:bg-white/6 transition-all group backdrop-blur-md"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="w-9 h-9 rounded-xl bg-amber-400/10 flex items-center justify-center">
              <FileCheck className="w-4 h-4 text-amber-400" />
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300">
              {pendingCount} Pending
            </span>
          </div>
          <p className="text-sm font-bold text-white mb-0.5">Verify Payment Slips</p>
          <p className="text-xs text-white/40">Approve or reject bank transfer receipts</p>
        </Link>

        <Link
          href="/ideofest/admin/scanner"
          className="bg-white/4 border border-white/8 rounded-2xl p-4 hover:border-emerald-400/40 hover:bg-white/6 transition-all group backdrop-blur-md"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="w-9 h-9 rounded-xl bg-emerald-400/10 flex items-center justify-center">
              <QrCode className="w-4 h-4 text-emerald-400" />
            </div>
            <ArrowRight className="w-4 h-4 text-white/30 group-hover:text-emerald-400 transition-colors" />
          </div>
          <p className="text-sm font-bold text-white mb-0.5">QR Ticket Gate Scanner</p>
          <p className="text-xs text-white/40">Scan attendee QR passes at venue entry</p>
        </Link>

        <Link
          href="/ideofest/admin/events"
          className="bg-white/4 border border-white/8 rounded-2xl p-4 hover:border-sky-400/40 hover:bg-white/6 transition-all group backdrop-blur-md"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="w-9 h-9 rounded-xl bg-sky-400/10 flex items-center justify-center">
              <CalendarDays className="w-4 h-4 text-sky-400" />
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-400/20 text-sky-300">
              {activeEvents} Active
            </span>
          </div>
          <p className="text-sm font-bold text-white mb-0.5">Event Management</p>
          <p className="text-xs text-white/40">Edit schedules, ticket tiers & banners</p>
        </Link>
      </div>

      {/* Real-time KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {kpis.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="bg-white/4 border border-white/8 rounded-2xl p-5 hover:border-white/15 transition-all backdrop-blur-md">
            <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center mb-3`}>
              <Icon className={`w-5 h-5 ${color}`} />
            </div>
            <p className="text-2xl font-black text-white">{value}</p>
            <p className="text-xs text-white/40 font-semibold mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Revenue Analytics Chart */}
      <div className="bg-white/4 border border-white/8 rounded-2xl p-5 sm:p-6 backdrop-blur-md">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white">Live Revenue Analytics (Last 14 Days)</h2>
            <p className="text-xs text-white/40">Real-time daily income generated from confirmed bookings</p>
          </div>
          <span className="text-[10px] font-extrabold text-[#c1e527] bg-[#c1e527]/10 px-2.5 py-0.5 rounded-full border border-[#c1e527]/20 uppercase tracking-wider">
            Supabase Live Sync
          </span>
        </div>
        <div className="overflow-x-auto">
          <AnalyticsChart data={revenueData} />
        </div>
      </div>

      {/* Recent Bookings & User Management Table */}
      <div className="bg-white/4 border border-white/8 rounded-2xl p-5 sm:p-6 backdrop-blur-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-5">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white">Recent Bookings & User Activity</h2>
            <p className="text-xs text-white/40">Latest registration entries across all active events</p>
          </div>
          <Link href="/ideofest/admin/attendees" className="inline-flex items-center gap-1.5 text-xs text-[#c1e527] hover:underline font-black">
            <span>Manage All User Details & Download CSV</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentBookings.length === 0 ? (
          <p className="text-white/30 text-sm text-center py-8">No booking records found in database.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[650px]">
              <thead>
                <tr className="text-left text-white/30 text-xs uppercase tracking-widest border-b border-white/8">
                  <th className="pb-3 pr-4">Ref ID</th>
                  <th className="pb-3 pr-4">Attendee Name & Email</th>
                  <th className="pb-3 pr-4">Event Title</th>
                  <th className="pb-3 pr-4">Pass Tier</th>
                  <th className="pb-3 pr-4">Total Amount</th>
                  <th className="pb-3 pr-4">Status</th>
                  <th className="pb-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {recentBookings.map((b: any) => {
                  const isConfirmed = b.status === 'confirmed' || b.payment_status === 'paid';
                  const isPending = b.payment_status === 'pending_verification';

                  return (
                    <tr key={b.id || b.booking_ref} className="border-b border-white/5 hover:bg-white/3 transition-colors">
                      <td className="py-3 pr-4 font-mono text-xs text-[#c1e527] font-bold">{b.booking_ref}</td>
                      <td className="py-3 pr-4">
                        <div>
                          <p className="font-bold text-white">{b.attendee_name || 'N/A'}</p>
                          <p className="text-xs text-white/40">{b.attendee_email || 'N/A'}</p>
                        </div>
                      </td>
                      <td className="py-3 pr-4 text-white/70 max-w-[140px] truncate">{b.event_title || 'Ideofest Event'}</td>
                      <td className="py-3 pr-4">
                        <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-[#c1e527]/15 text-[#c1e527] border border-[#c1e527]/30">
                          {b.tier_label || 'Standard'} × {b.quantity || 1}
                        </span>
                      </td>
                      <td className="py-3 pr-4 text-white font-bold whitespace-nowrap">
                        LKR {(Number(b.total_amount) || 0).toLocaleString('en-LK', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 pr-4">
                        {isConfirmed ? (
                          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                            Confirmed
                          </span>
                        ) : isPending ? (
                          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30">
                            Pending Review
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-white/10 text-white/50 border border-white/10">
                            {b.status || 'Pending'}
                          </span>
                        )}
                      </td>
                      <td className="py-3">
                        <Link
                          href="/ideofest/admin/attendees"
                          className="text-xs text-[#c1e527] hover:underline font-semibold"
                        >
                          View Details
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
