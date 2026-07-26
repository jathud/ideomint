import { MOCK_EVENTS, getEventStats } from '@/lib/ideofest/mock-data';
import AnalyticsChart from '@/components/ideofest/AnalyticsChart';
import { IndianRupee, TrendingUp, Ticket, ArrowUpRight } from 'lucide-react';

function generateDetailedRevenue() {
  const days = 30;
  return Array.from({ length: days }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (days - 1 - i));
    return {
      date: d.toISOString().split('T')[0],
      revenue: Math.floor(Math.random() * 25000 + 4000),
    };
  });
}

const detailedData = generateDetailedRevenue();

export default function AdminReportsPage() {
  const { totalRevenue, totalTicketsSold, totalCapacity } = getEventStats(MOCK_EVENTS);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-black">Financial Reports & Analytics</h1>
        <p className="text-white/40 text-sm mt-1">Festival performance breakdown and revenue forecasting</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
        <div className="bg-white/5 border border-white/8 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-white/40 uppercase tracking-widest">Gross Revenue</span>
            <div className="w-9 h-9 rounded-xl bg-signal-lime/10 flex items-center justify-center">
              <IndianRupee className="w-5 h-5 text-signal-lime" />
            </div>
          </div>
          <p className="text-3xl font-black text-white">₹{totalRevenue.toLocaleString('en-IN')}</p>
          <div className="flex items-center gap-1.5 text-xs text-signal-lime mt-2 font-semibold">
            <ArrowUpRight className="w-4 h-4" />
            <span>+18.4% from last month</span>
          </div>
        </div>

        <div className="bg-white/5 border border-white/8 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-white/40 uppercase tracking-widest">Total Tickets Sold</span>
            <div className="w-9 h-9 rounded-xl bg-creative-flame/10 flex items-center justify-center">
              <Ticket className="w-5 h-5 text-creative-flame" />
            </div>
          </div>
          <p className="text-3xl font-black text-white">{totalTicketsSold.toLocaleString('en-IN')}</p>
          <div className="flex items-center gap-1.5 text-xs text-signal-lime mt-2 font-semibold">
            <ArrowUpRight className="w-4 h-4" />
            <span>{Math.round((totalTicketsSold / totalCapacity) * 100)}% sell-through rate</span>
          </div>
        </div>

        <div className="bg-white/5 border border-white/8 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-white/40 uppercase tracking-widest">Avg Ticket Yield</span>
            <div className="w-9 h-9 rounded-xl bg-digital-pulse/10 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-digital-pulse" />
            </div>
          </div>
          <p className="text-3xl font-black text-white">₹{Math.round(totalRevenue / totalTicketsSold).toLocaleString('en-IN')}</p>
          <div className="flex items-center gap-1.5 text-xs text-white/50 mt-2">
            <span>Across all active categories</span>
          </div>
        </div>
      </div>

      {/* 30-day Chart */}
      <div className="bg-white/5 border border-white/8 rounded-2xl p-6 mb-8">
        <h2 className="text-lg font-bold mb-4">30-Day Revenue Stream</h2>
        <AnalyticsChart data={detailedData} label="Daily Revenue (INR)" />
      </div>

      {/* Revenue by Event Breakdown Table */}
      <div className="bg-white/5 border border-white/8 rounded-2xl p-6">
        <h2 className="text-lg font-bold mb-4">Revenue Breakdown by Event</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-white/30 text-xs uppercase tracking-widest border-b border-white/8">
                <th className="pb-3 pr-4">Event Title</th>
                <th className="pb-3 pr-4">Category</th>
                <th className="pb-3 pr-4">Tickets Sold</th>
                <th className="pb-3 pr-4">Sell-Through</th>
                <th className="pb-3">Gross Revenue</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_EVENTS.map((evt) => {
                const tiers = evt.ticket_tiers || [];
                const sold = tiers.reduce((s, t) => s + (t.sold || 0), 0);
                const cap = tiers.reduce((s, t) => s + (t.capacity || 0), 0);
                const rev = tiers.reduce((s, t) => s + (t.price || 0) * (t.sold || 0), 0);
                const pct = cap > 0 ? Math.round((sold / cap) * 100) : 0;
                return (
                  <tr key={evt.id || evt.slug} className="border-b border-white/5 hover:bg-white/3 transition-colors">
                    <td className="py-3.5 pr-4 font-bold text-white">{evt.title}</td>
                    <td className="py-3.5 pr-4 text-white/60 capitalize">{evt.category}</td>
                    <td className="py-3.5 pr-4 text-white/80">{sold} / {cap}</td>
                    <td className="py-3.5 pr-4">
                      <span className="text-xs font-bold text-signal-lime bg-signal-lime/10 px-2 py-0.5 rounded-full border border-signal-lime/20">
                        {pct}%
                      </span>
                    </td>
                    <td className="py-3.5 font-bold text-white">LKR {rev.toLocaleString('en-LK')}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
