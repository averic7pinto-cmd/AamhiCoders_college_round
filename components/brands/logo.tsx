import React from 'react';

interface LogoProps {
  size?: number;
  withWordmark?: boolean;
}

export function Logo({ size = 40, withWordmark = true }: LogoProps) {
  return (
    <span className="inline-flex items-center gap-3">
      <span
        className="relative grid shrink-0 place-items-center rounded-xl bg-grad-primary shadow-glow-blue"
        style={{ width: size, height: size }}
      >
        <svg viewBox="0 0 32 32" width={size * 0.66} height={size * 0.66} fill="none" aria-hidden="true">
          <circle cx="16" cy="16" r="11" stroke="white" strokeOpacity=".45" strokeWidth="1.5" strokeDasharray="3 3" />
          <path d="M16 3.5v5.5M16 23v5.5M3.5 16H9M23 16h5.5" stroke="#C5FF4A" strokeWidth="2.2" strokeLinecap="round" />
          <circle cx="16" cy="16" r="3.6" fill="white" />
        </svg>
      </span>
      {withWordmark && (
        <span className="font-display text-[15px] font-semibold tracking-[0.14em] text-fg">
          HANDS<span className="text-cyan">FREE</span>
        </span>
      )}
    </span>
  );
}
