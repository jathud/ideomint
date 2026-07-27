'use client';

import { useEffect, useRef, useState } from 'react';
import { Users, Ticket, Globe, TrendingUp } from 'lucide-react';

const stats = [
  { value: 24, label: 'Events Hosted', suffix: '+', icon: Globe },
  { value: 12800, label: 'Tickets Sold', suffix: '+', icon: Ticket },
  { value: 8, label: 'Cities', suffix: '', icon: Globe },
  { value: 96, label: 'Check-in Rate', suffix: '%', icon: TrendingUp },
];

function useCountUp(target: number, active: boolean, duration = 1800) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!active) return;
    let start = 0;
    const step = target / (duration / 16);
    const id = setInterval(() => {
      start = Math.min(start + step, target);
      setCount(Math.floor(start));
      if (start >= target) clearInterval(id);
    }, 16);
    return () => clearInterval(id);
  }, [target, active, duration]);
  return count;
}

function StatItem({ value, label, suffix, icon: Icon, active }: (typeof stats)[0] & { active: boolean }) {
  const count = useCountUp(value, active);
  return (
    <div className="flex flex-col items-center gap-2 p-6 rounded-2xl bg-white/5 border border-white/8 hover:bg-white/8 transition-colors">
      <div className="w-10 h-10 rounded-full bg-signal-lime/15 flex items-center justify-center mb-1">
        <Icon className="w-5 h-5 text-signal-lime" />
      </div>
      <span className="text-4xl font-black text-white tabular-nums">
        {count.toLocaleString('en-IN')}{suffix}
      </span>
      <span className="text-sm text-white/50 font-medium">{label}</span>
    </div>
  );
}

export default function StatsBar() {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setActive(true); obs.disconnect(); }
    }, { threshold: 0.3 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return (
    <div ref={ref} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((s) => (
        <StatItem key={s.label} {...s} icon={s.icon as typeof Users} active={active} />
      ))}
    </div>
  );
}
