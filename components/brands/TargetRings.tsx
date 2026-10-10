import React from 'react';

interface TargetRingsProps {
  className?: string;
}

export function TargetRings({ className = '' }: TargetRingsProps) {
  return (
    <svg viewBox="0 0 400 400" className={className} fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="tr-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#31D7FF" />
          <stop offset="1" stopColor="#9B5CFF" />
        </linearGradient>
      </defs>
      <circle cx="200" cy="200" r="190" stroke="#31D7FF" strokeOpacity=".1" />
      <circle cx="200" cy="200" r="150" stroke="url(#tr-grad)" strokeOpacity=".5" strokeWidth="1.5" />
      <g className="animate-spin-slow" style={{ transformBox: 'fill-box', transformOrigin: 'center' }}>
        <circle cx="200" cy="200" r="118" stroke="#31D7FF" strokeOpacity=".55" strokeWidth="2.5" strokeDasharray="2 14" strokeLinecap="round" />
      </g>
      <circle cx="200" cy="200" r="80" stroke="#9B5CFF" strokeOpacity=".4" />
      <path d="M200 16v52M200 332v52M16 200h52M332 200h52" stroke="#31D7FF" strokeOpacity=".45" strokeWidth="1.5" />
      <circle cx="200" cy="200" r="34" stroke="#C5FF4A" strokeOpacity=".7" strokeWidth="2" />
      <circle cx="200" cy="200" r="7" fill="#C5FF4A" />
    </svg>
  );
}
