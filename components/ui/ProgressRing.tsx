import React, { useId } from 'react';

interface ProgressRingProps {
  value: number | null;
  size?: number;
  stroke?: number;
  from?: string;
  to?: string;
  children?: React.ReactNode;
}

export function ProgressRing({ value, size = 140, stroke = 10, from = '#31D7FF', to = '#9B5CFF', children }: ProgressRingProps) {
  const id = useId();
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - (value ?? 0) / 100);

  return (
    <div className="relative grid place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90" aria-hidden="true">
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={from} />
            <stop offset="100%" stopColor={to} />
          </linearGradient>
        </defs>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#2A3148" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={`url(#${id})`}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 300ms cubic-bezier(0.23,1,0.32,1)' }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">{children}</div>
    </div>
  );
}
