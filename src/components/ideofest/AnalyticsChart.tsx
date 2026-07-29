'use client';

import { useEffect, useRef } from 'react';

interface DataPoint {
  date: string;
  revenue: number;
}

interface AnalyticsChartProps {
  data: DataPoint[];
  label?: string;
}

export default function AnalyticsChart({ data, label = 'Revenue' }: AnalyticsChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || data.length === 0) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = canvas.width;
    const H = canvas.height;
    const padL = 50, padR = 20, padT = 20, padB = 40;
    const chartW = W - padL - padR;
    const chartH = H - padT - padB;

    ctx.clearRect(0, 0, W, H);

    const maxVal = Math.max(...data.map((d) => d.revenue), 1);

    const toX = (i: number) => padL + (i / (data.length - 1)) * chartW;
    const toY = (v: number) => padT + chartH - (v / maxVal) * chartH;

    // Grid lines
    for (let i = 0; i <= 4; i++) {
      const y = padT + (i / 4) * chartH;
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(255,255,255,0.06)';
      ctx.lineWidth = 1;
      ctx.moveTo(padL, y);
      ctx.lineTo(W - padR, y);
      ctx.stroke();
      const val = Math.round(maxVal - (maxVal / 4) * i);
      ctx.fillStyle = 'rgba(255,255,255,0.3)';
      ctx.font = '10px system-ui';
      ctx.textAlign = 'right';
      ctx.fillText(`${val >= 1000 ? (val / 1000).toFixed(0) + 'k' : val}`, padL - 6, y + 4);
    }

    // Gradient fill
    const grad = ctx.createLinearGradient(0, padT, 0, padT + chartH);
    grad.addColorStop(0, 'rgba(255, 90, 60, 0.3)');
    grad.addColorStop(1, 'rgba(255, 90, 60, 0)');

    ctx.beginPath();
    data.forEach((d, i) => {
      const x = toX(i), y = toY(d.revenue);
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.lineTo(toX(data.length - 1), padT + chartH);
    ctx.lineTo(toX(0), padT + chartH);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();

    // Line
    ctx.beginPath();
    data.forEach((d, i) => {
      const x = toX(i), y = toY(d.revenue);
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.strokeStyle = '#FF5A3C';
    ctx.lineWidth = 2.5;
    ctx.lineJoin = 'round';
    ctx.stroke();

    // Dots
    data.forEach((d, i) => {
      const x = toX(i), y = toY(d.revenue);
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fillStyle = '#FF5A3C';
      ctx.fill();
      ctx.strokeStyle = '#05070D';
      ctx.lineWidth = 2;
      ctx.stroke();
    });

    // X labels
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.font = '9px system-ui';
    ctx.textAlign = 'center';
    data.forEach((d, i) => {
      if (i % Math.ceil(data.length / 6) === 0 || i === data.length - 1) {
        const label = new Date(d.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
        ctx.fillText(label, toX(i), H - 6);
      }
    });
  }, [data]);

  return (
    <div className="w-full">
      {label && <p className="text-xs font-bold text-white/40 uppercase tracking-widest mb-3">{label}</p>}
      <canvas
        ref={canvasRef}
        width={700}
        height={220}
        className="w-full h-auto"
        style={{ imageRendering: 'crisp-edges' }}
      />
    </div>
  );
}
