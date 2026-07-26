'use client';

import { useState, useEffect } from 'react';

interface CountdownTimerProps {
  targetDate: string;
  compact?: boolean;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function calcTimeLeft(target: string): TimeLeft {
  const diff = Math.max(0, new Date(target).getTime() - Date.now());
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / 1000 / 60) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

function pad(n: number) {
  return String(n).padStart(2, '0');
}

export default function CountdownTimer({ targetDate, compact = false }: CountdownTimerProps) {
  const [time, setTime] = useState<TimeLeft>(calcTimeLeft(targetDate));

  useEffect(() => {
    const id = setInterval(() => setTime(calcTimeLeft(targetDate)), 1000);
    return () => clearInterval(id);
  }, [targetDate]);

  if (compact) {
    return (
      <span className="font-black text-white tabular-nums">
        {pad(time.days)}d {pad(time.hours)}h {pad(time.minutes)}m
      </span>
    );
  }

  const units = [
    { value: time.days, label: 'Days' },
    { value: time.hours, label: 'Hours' },
    { value: time.minutes, label: 'Min' },
    { value: time.seconds, label: 'Sec' },
  ];

  return (
    <div className="flex items-end gap-3 md:gap-4">
      {units.map(({ value, label }, i) => (
        <div key={label} className="flex items-end gap-3 md:gap-4">
          <div className="flex flex-col items-center">
            <div className="relative bg-white/8 border border-white/12 rounded-xl w-16 h-16 md:w-20 md:h-20 flex items-center justify-center overflow-hidden">
              <span className="text-3xl md:text-4xl font-black text-white tabular-nums leading-none">
                {pad(value)}
              </span>
              {/* Flip line */}
              <div className="absolute left-0 right-0 top-1/2 h-px bg-black/30 pointer-events-none" />
            </div>
            <span className="text-[10px] font-bold text-white/40 tracking-widest uppercase mt-2">
              {label}
            </span>
          </div>
          {i < units.length - 1 && (
            <span className="text-2xl font-black text-white/30 mb-5">:</span>
          )}
        </div>
      ))}
    </div>
  );
}
