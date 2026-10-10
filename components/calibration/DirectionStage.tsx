import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CheckIcon, RotateCcwIcon, ScanFaceIcon, TargetIcon } from 'lucide-react';
import { Button } from '../ui/Button';
import { calibrationDirections } from '../../data/calibration';
import type { Direction } from '../../types/calibration';

interface DirectionStageProps {
  done: Direction[];
  onCapture: (d: Direction) => void;
  onRetry: (d: Direction) => void;
}

const HOLD_MS = 1500;

export function DirectionStage({ done, onCapture, onRetry }: DirectionStageProps) {
  const firstOpen = calibrationDirections.find((d) => !done.includes(d.id))?.id ?? 'center';
  const [active, setActive] = useState<Direction>(firstOpen);
  const [capturing, setCapturing] = useState(false);

  useEffect(() => {
    if (done.includes(active)) {
      const next = calibrationDirections.find((d) => !done.includes(d.id));
      if (next) setActive(next.id);
    }
  }, [done]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!capturing) return;
    const t = window.setTimeout(() => {
      setCapturing(false);
      onCapture(active);
    }, HOLD_MS);
    return () => window.clearTimeout(t);
  }, [capturing, active, onCapture]);

  const dir = calibrationDirections.find((d) => d.id === active)!;
  const isDone = done.includes(active);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-bold text-cyan">
            {done.length} of {calibrationDirections.length} directions captured
          </p>
          <h3 className="mt-1 font-display text-2xl font-semibold">{dir.instruction}</h3>
          <p className="mt-1 text-muted">Keep your shoulders still. Hold for a moment while the ring fills.</p>
        </div>
      </div>

      <div className="relative aspect-[16/9] overflow-hidden rounded-3xl border border-line bg-[#0B0E16]">
        <div className="absolute inset-0 bg-grid" aria-hidden="true" />
        <svg className="absolute inset-0 h-full w-full" aria-hidden="true">
          <line x1="50%" y1="50%" x2={`${dir.x}%`} y2={`${dir.y}%`} stroke="#31D7FF" strokeOpacity=".5" strokeWidth="2" strokeDasharray="6 8" />
        </svg>

        {calibrationDirections
          .filter((d) => done.includes(d.id) && d.id !== active)
          .map((d) => (
            <span
              key={d.id}
              className="absolute grid h-7 w-7 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-lime text-ink"
              style={{ left: `${d.x}%`, top: `${d.y}%` }}
              aria-hidden="true"
            >
              <CheckIcon className="h-4 w-4" strokeWidth={3} />
            </span>
          ))}

        {active !== 'center' && (
          <span className="absolute left-1/2 top-1/2 grid h-14 w-14 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-line bg-ink-2" aria-hidden="true">
            <ScanFaceIcon className="h-6 w-6 text-muted" />
          </span>
        )}

        <div className="absolute -translate-x-1/2 -translate-y-1/2" style={{ left: `${dir.x}%`, top: `${dir.y}%` }}>
          <div className="relative grid h-24 w-24 place-items-center">
            {!isDone && <span className="absolute inset-2 animate-pulse-ring rounded-full border-2 border-cyan/50" aria-hidden="true" />}
            <svg viewBox="0 0 96 96" className="absolute inset-0 -rotate-90" aria-hidden="true">
              <circle cx="48" cy="48" r="40" fill="none" stroke="#2A3148" strokeWidth="6" />
              <motion.circle
                cx="48"
                cy="48"
                r="40"
                fill="none"
                stroke="#C5FF4A"
                strokeWidth="6"
                strokeLinecap="round"
                initial={false}
                animate={{ pathLength: isDone ? 1 : capturing ? 1 : 0 }}
                transition={{ duration: capturing ? HOLD_MS / 1000 : 0.2, ease: 'linear' }}
              />
            </svg>
            <span className={`grid h-12 w-12 place-items-center rounded-full ${isDone ? 'bg-lime text-ink' : 'bg-grad-cyan text-white shadow-glow-cyan'}`}>
              {isDone ? <CheckIcon className="h-6 w-6" strokeWidth={3} aria-hidden="true" /> : <TargetIcon className="h-6 w-6" aria-hidden="true" />}
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Choose a direction">
        {calibrationDirections.map((d) => {
          const complete = done.includes(d.id);
          const selected = d.id === active;
          return (
            <button
              key={d.id}
              type="button"
              aria-pressed={selected}
              onClick={() => {
                setCapturing(false);
                setActive(d.id);
              }}
              className={`inline-flex h-11 items-center gap-2 rounded-xl border px-4 text-sm font-bold transition-colors duration-150 ${
                selected ? 'border-cyan bg-cyan/10 text-fg' : 'border-line bg-ink-3 text-muted hover:text-fg'
              }`}
            >
              {complete ? <CheckIcon className="h-4 w-4 text-lime" strokeWidth={3} aria-hidden="true" /> : <span className="h-2 w-2 rounded-full bg-line" aria-hidden="true" />}
              {d.label}
              <span className="sr-only">{complete ? '(captured)' : '(not captured)'}</span>
            </button>
          );
        })}
      </div>

      <div className="flex flex-wrap gap-3">
        {isDone ? (
          <Button size="xl" variant="secondary" icon={RotateCcwIcon} onClick={() => onRetry(active)}>
            Retry {dir.label.toLowerCase()}
          </Button>
        ) : (
          <Button size="xl" icon={TargetIcon} loading={capturing} onClick={() => setCapturing(true)}>
            {capturing ? 'Hold still…' : `Capture ${dir.label.toLowerCase()}`}
          </Button>
        )}
        {capturing && (
          <Button size="xl" variant="ghost" onClick={() => setCapturing(false)}>
            Cancel
          </Button>
        )}
      </div>
      <p className="sr-only" aria-live="polite">
        {capturing ? `Capturing ${dir.label}. Hold still.` : isDone ? `${dir.label} captured.` : ''}
      </p>
    </div>
  );
}
