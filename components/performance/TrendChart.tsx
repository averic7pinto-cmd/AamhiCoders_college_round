import React from 'react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { TooltipProps } from 'recharts';
import { sessionHistory } from '../../data/sessions';

function ChartTooltip({ active, payload, label }: TooltipProps<number, string>) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-line bg-ink-4 px-3 py-2 shadow-panel">
      <p className="text-xs font-bold text-muted">{label}</p>
      {payload.map((p) => (
        <p key={p.dataKey as string} className="mt-1 flex items-center gap-2 text-sm font-bold text-fg">
          <span className="h-2 w-2 rounded-full" style={{ background: p.color }} aria-hidden="true" />
          {p.name}: <span className="font-mono">{p.value}</span>
        </p>
      ))}
    </div>
  );
}

export function TrendChart() {
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={sessionHistory} margin={{ top: 10, right: 8, left: -12, bottom: 0 }}>
          <defs>
            <linearGradient id="g-commands" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#4263FF" stopOpacity={0.55} />
              <stop offset="100%" stopColor="#4263FF" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="g-selections" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#C5FF4A" stopOpacity={0.35} />
              <stop offset="100%" stopColor="#C5FF4A" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="#2C3550" strokeDasharray="3 6" vertical={false} />
          <XAxis dataKey="date" tick={{ fill: '#A5ADC2', fontSize: 12 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: '#A5ADC2', fontSize: 12 }} axisLine={false} tickLine={false} width={44} />
          <Tooltip content={<ChartTooltip />} cursor={{ stroke: '#31D7FF', strokeOpacity: 0.4 }} />
          <Area type="monotone" name="Commands" dataKey="commands" stroke="#6A86FF" strokeWidth={2.5} fill="url(#g-commands)" animationDuration={600} />
          <Area type="monotone" name="Selections" dataKey="selections" stroke="#C5FF4A" strokeWidth={2.5} fill="url(#g-selections)" animationDuration={600} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
