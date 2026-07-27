import AnalyticsChart from '@/components/ideofest/AnalyticsChart';
import { TrendingUp, Users, CalendarDays, PlusCircle, ShieldCheck, Landmark, CreditCard, Clock } from 'lucide-react';
import Link from 'next/link';
import { createAdminClient } from '@/lib/ideofest/supabase/server';

function generateRevenueData() {
  const days = 14;
  return Array.from({ length: days }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (days - 1 - i));
    return {
      date: d.toISOString().split('T')[0],
      revenue: Math.floor(Math.random() * 120000 + 15000),
    };
  });
}

const revenueData = generateRevenueData();

function formatLKR(n: number) {
  if (n >= 1_000_000) return `LKR ${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1000) return `LKR ${(n / 1000).toFixed(0)}K`;
  return `LKR ${n.toLocaleString('en-LK')}`;
}

export default async function AdminDashboardPage() {
  const supabase = createAdminClient();

  // Fetch live stats
  const [eventsRes, bookingsRes, pendingRes] = await Promise.all([
    supabase.from('events').select('id, status').eq('status', 'published'),
    supabase.from('bookings').select('id, total_amount, payment_status, status, tier_label, quantity, attendee_name, attendee_email, booking_ref, event_title, payment_method, created_at'),
    supabase.from('bookings').select('id', { count: 'exact' }).eq('payment_status', 'pending_verification'),
  ]);

  const bookings = bookingsRes.data || [];
  const confirmedBookings = bookings.filter((b: any) => b.status === 'confirmed');
  const totalRevenue = bookings.filter((b: any) => b.payment_status === 'paid').reduce((s: number, b: any) => s + (b.total_amount || 0), 0);
  const totalTicketsSold = bookings.filter((b: any) => b.payment_status === 'paid').reduce((s: number, b: any) => s + (b.quantity || 0), 0);
  const activeEvents = eventsRes.data?.length || 0;
  const pendingCount = pendingRes.count || 0;

  const kpis = [
    { label: 'Total Revenue', value: formatLKR(totalRevenue), icon: TrendingUp, color: 'text-signal-lime', bg: 'bg-signal-lime/10' },
    { label: 'Tickets Sold', value: totalTicketsSold.toString(), icon: TrendingUp, color: 'text-creative-flame', bg: 'bg-creative-flame/10' },
    { label: 'Pending Reviews', value: pendingCount.toString(), icon: Clock, color: 'text-amber-400', bg: 'bg-amber-400/10' },
    { label: 'Active Events', value: activeEvents.toString(), icon: CalendarDays, color: 'text-white', bg: 'bg-white/10' },
  ];

  const recentBookings = confirmedBookings.slice(0, 10);

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck className="w-5 h-5 text-signal-lime" />
            <h1 className="text-3xl font-black text-white">Admin Overview</h1>
          </div>
          <p className="text-white/40 text-sm">Live metrics, revenue & ticket control — LKR</p>
        </div>
        <div className="flex gap-3">
          {pendingCount > 0 && (
            <Link
              href="/verifications"
              className="inline-flex items-center gap-2 bg-amber-500/15 hover:bg-amber-500/25 text-amber-400 px-4 py-3 rounded-xl font-black text-sm transition-all border border-amber-500/30"
            >
              <Clock className="w-4 h-4" /> {pendingCount} Pending
            </Link>
          )}
          <Link
            href="/ideofest/admin/events/create"
            className="inline-flex items-center justify-center gap-2 bg-signal-lime hover:bg-[#b0d420] text-section-ink px-5 py-3 rounded-xl font-black text-sm transition-all shadow-lg shadow-signal-lime/10"
          >
            <PlusCircle className="w-4 h-4" /> Create Event
          </Link>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        {kpis.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="bg-white/5 border border-white/8 rounded-2xl p-5 hover:border-white/15 transition-all">
            <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center mb-3`}>
              <Icon className={`w-5 h-5 ${color}`} />
            </div>
            <p className="text-2xl font-black text-white">{value}</p>
            <p className="text-xs text-white/40 font-medium mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Revenue chart */}
      <div className="bg-white/5 border border-white/8 rounded-2xl p-6 mb-8">
        <h2 className="text-lg font-bold mb-4 flex items-center justify-between">
          <span>Revenue Analytics — LKR (Last 14 Days)</span>
          <span className="text-xs font-semibold text-signal-lime bg-signal-lime/10 px-3 py-1 rounded-full border border-signal-lime/20">
            Live
          </span>
        </h2>
        <AnalyticsChart data={revenueData} />
      </div>

      {/* Recent bookings */}
      <div className="bg-white/5 border border-white/8 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold">Recent Confirmed Bookings</h2>
          <Link href="/attendees" className="text-xs text-signal-lime hover:underline font-semibold">
            View all attendees →
          </Link>
        </div>
        {recentBookings.length === 0 ? (
          <p className="text-white/30 text-sm text-center py-8">No confirmed bookings yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-white/30 text-xs uppercase tracking-widest border-b border-white/8">
                  <th className="pb-3 pr-4">Reference</th>
                  <th className="pb-3 pr-4">Attendee</th>
                  <th className="pb-3 pr-4">Event</th>
                  <th className="pb-3 pr-4">Tier</th>
                  <th className="pb-3 pr-4">Amount</th>
                  <th className="pb-3">Method</th>
                </tr>
              </thead>
              <tbody>
                {recentBookings.map((b: any) => (
                  <tr key={b.booking_ref} className="border-b border-white/5 hover:bg-white/3 transition-colors">
                    <td className="py-3 pr-4 font-mono text-xs text-signal-lime">{b.booking_ref}</td>
                    <td className="py-3 pr-4">
                      <div>
                        <p className="font-semibold text-white">{b.attendee_name}</p>
                        <p className="text-xs text-white/40">{b.attendee_email}</p>
                      </div>
                    </td>
                    <td className="py-3 pr-4 text-white/70 max-w-[140px] truncate">{b.event_title}</td>
                    <td className="py-3 pr-4">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-signal-lime/15 text-signal-lime border border-signal-lime/30">
                        {b.tier_label}
                      </span>
                    </td>
                    <td className="py-3 pr-4 font-bold text-white">
                      {b.total_amount === 0 ? 'Free' : `LKR ${b.total_amount?.toLocaleString('en-LK', { minimumFractionDigits: 2 })}`}
                    </td>
                    <td className="py-3">
                      {b.payment_method === 'payhere' ? (
                        <span className="flex items-center gap-1 text-xs text-blue-400 font-bold">
                          <CreditCard className="w-3 h-3" /> PayHere
                        </span>
                      ) : b.payment_method === 'bank_transfer' ? (
                        <span className="flex items-center gap-1 text-xs text-purple-400 font-bold">
                          <Landmark className="w-3 h-3" /> Bank
                        </span>
                      ) : (
                        <span className="text-xs text-white/40">Free</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
