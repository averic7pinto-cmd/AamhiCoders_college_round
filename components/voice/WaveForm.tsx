import React, { useMemo } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

interface WaveformProps {
  active: boolean;
  bars?: number;
  className?: string;
}

export function Waveform({ active, bars = 40, className = '' }: WaveformProps) {
  const reduce = useReducedMotion();
  const heights = useMemo(
    () => Array.from({ length: bars }, (_, i) => 0.25 + 0.75 * Math.abs(Math.sin(i * 0.7) * Math.cos(i * 0.23))),
    [bars],
  );
  const animate = active && !reduce;

  return (
    <div aria-hidden="true" className={`flex items-center gap-[3px] ${className}`}>
      {heights.map((h, i) => (
        <motion.span
          key={i}
          className="h-full min-w-[3px] flex-1 rounded-full bg-[linear-gradient(180deg,#31D7FF,#9B5CFF)]"
          initial={false}
          animate={animate ? { scaleY: [h * 0.35, h, h * 0.55, h * 0.9, h * 0.35] } : { scaleY: active ? h : 0.08 }}
          transition={
            animate
              ? { duration: 1.1 + (i % 5) * 0.12, repeat: Infinity, ease: 'easeInOut', delay: (i % 7) * 0.05 }
              : { duration: 0.25, ease: 'easeOut' }
          }
        />
      ))}
    </div>
  );
}
