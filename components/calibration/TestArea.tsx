import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { testTargets } from '../../data/calibration';

interface TestAreaProps {
  hits: number[];
  onHit: (index: number) => void;
  dwellMs: number;
}

// One position per entry in testTargets (6).
const positions = [
  { x: '14%', y: '24%' },
  { x: '50%', y: '18%' },
  { x: '84%', y: '30%' },
  { x: '26%', y: '66%' },
  { x: '66%', y: '58%' },
  { x: '88%', y: '82%' },
];

export default function TestArea({ hits, onHit, dwellMs }: TestAreaProps) {
  const [activeTarget, setActiveTarget] = useState<number | null>(null);
  const timers = useRef<Record<number, number>>({});

  const startDwell = (index: number) => {
    setActiveTarget(index);
    window.clearTimeout(timers.current[index]);
    timers.current[index] = window.setTimeout(() => {
      setActiveTarget(null);
      onHit(index);
    }, dwellMs);
  };

  const stopDwell = (index: number) => {
    setActiveTarget((current) => (current === index ? null : current));
    window.clearTimeout(timers.current[index]);
  };

  useEffect(
    () => () => {
      Object.values(timers.current).forEach((id) => window.clearTimeout(id));
    },
    [],
  );

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-display text-2xl font-semibold">Test your hands-free pointer</h3>
        <p className="mt-2 text-muted">
          Move the pointer onto each target and hold it there until the ring fills. You can also click a target.
        </p>
      </div>

      <div className="flex items-center justify-between text-sm text-muted">
        <span>Targets completed</span>
        <span className="font-semibold text-cyan">
          {hits.length} / {testTargets.length}
        </span>
      </div>

      <div className="relative min-h-[340px] overflow-hidden rounded-3xl border border-line bg-[#0B0E16] bg-grid">
        {testTargets.map((label, index) => {
          const completed = hits.includes(index);
          const dwelling = activeTarget === index && !completed;
          const pos = positions[index % positions.length];

          return (
            <div
              key={label}
              className="absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1.5"
              style={{ left: pos.x, top: pos.y }}
            >
              <div className="relative">
                {dwelling && (
                  <svg viewBox="0 0 64 64" className="pointer-events-none absolute -inset-2 h-16 w-16 -rotate-90" aria-hidden="true">
                    <motion.circle
                      cx="32"
                      cy="32"
                      r="29"
                      fill="none"
                      stroke="#C5FF4A"
                      strokeWidth="4"
                      strokeLinecap="round"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: dwellMs / 1000, ease: 'linear' }}
                    />
                  </svg>
                )}
                <button
                  type="button"
                  aria-label={`${label}${completed ? ', completed' : ''}`}
                  disabled={completed}
                  onMouseEnter={() => startDwell(index)}
                  onMouseLeave={() => stopDwell(index)}
                  onClick={() => {
                    stopDwell(index);
                    onHit(index);
                  }}
                  className={`grid h-12 w-12 place-items-center rounded-full border-2 text-sm font-bold transition-all duration-200 ${
                    completed
                      ? 'border-lime bg-lime/20 text-lime'
                      : dwelling
                        ? 'scale-110 border-cyan bg-cyan/20 text-cyan'
                        : 'border-violet-soft bg-violet-soft/10 text-violet-soft hover:border-cyan hover:text-cyan'
                  }`}
                >
                  {completed ? '✓' : index + 1}
                </button>
              </div>
              <span className={`whitespace-nowrap text-[11px] font-semibold ${completed ? 'text-lime' : 'text-muted'}`}>
                {label}
              </span>
            </div>
          );
        })}
      </div>

      <p className="text-sm text-muted">
        Dwell setting: {dwellMs} ms. Use the targets to check your accuracy and comfort before continuing.
      </p>
    </div>
  );
}