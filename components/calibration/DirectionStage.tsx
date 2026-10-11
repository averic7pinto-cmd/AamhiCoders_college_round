import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { CheckIcon, RotateCcwIcon, ScanFaceIcon, TargetIcon } from 'lucide-react';
import { Button } from '../ui/Button';
import { calibrationDirections } from '../../data/calibration';
import type { Direction } from '../../types/calibration';

export interface HeadPose {
  yaw: number;   // < 0 turned left, > 0 turned right
  pitch: number; // < 0 looking up, > 0 looking down
}

interface DirectionStageProps {
  done: Direction[];
  onCapture: (d: Direction, pose?: HeadPose) => void;
  onRetry: (d: Direction) => void;
  /** Live head pose from the Python tracker, or null if no face / no tracker. */
  pose?: HeadPose | null;
  /** The captured "center" pose, once available. */
  center?: HeadPose | null;
}

const HOLD_MS = 1200;
const YAW_TRIGGER = 0.1;
const PITCH_TRIGGER = 0.07;
const STILL_LIMIT = 0.04;

export function DirectionStage({ done, onCapture, onRetry, pose = null, center = null }: DirectionStageProps) {
  const firstOpen = calibrationDirections.find((d) => !done.includes(d.id))?.id ?? 'center';
  const [active, setActive] = useState<Direction>(firstOpen);
  const [capturing, setCapturing] = useState(false);

  const poseRef = useRef<HeadPose | null>(pose);
  poseRef.current = pose;
  const lastPose = useRef<HeadPose | null>(null);
  const wasTracked = useRef(false);

  const tracked = pose !== null;
  const isDone = done.includes(active);

  useEffect(() => {
    if (done.includes(active)) {
      const next = calibrationDirections.find((d) => !done.includes(d.id));
      if (next) setActive(next.id);
    }
  }, [done]); // eslint-disable-line react-hooks/exhaustive-deps

  // Automatic capture: the ring fills while the real head pose matches.
  useEffect(() => {
    if (!pose) {
      lastPose.current = null;
      if (wasTracked.current) {
        wasTracked.current = false;
        setCapturing(false); // face lost mid-hold
      }
      return;
    }

    wasTracked.current = true;

    if (isDone) {
      setCapturing(false);
      return;
    }

    let match = false;

    if (active === 'center') {
      const previous = lastPose.current;
      match =
        previous !== null &&
        Math.abs(pose.yaw - previous.yaw) < STILL_LIMIT &&
        Math.abs(pose.pitch - previous.pitch) < STILL_LIMIT;
      lastPose.current = pose;
    } else if (center) {
      const dy = pose.yaw - center.yaw;
      const dp = pose.pitch - center.pitch;
      match =
        active === 'left' ? dy < -YAW_TRIGGER
        : active === 'right' ? dy > YAW_TRIGGER
        : active === 'up' ? dp < -PITCH_TRIGGER
        : active === 'down' ? dp > PITCH_TRIGGER
        : false;
    }

    setCapturing(match);
  }, [pose, active, center, isDone]);

  // Finish the capture after the ring has been full for HOLD_MS.
  useEffect(() => {
    if (!capturing) return;
    const t = window.setTimeout(() => {
      setCapturing(false);
      onCapture(active, poseRef.current ?? undefined);
    }, HOLD_MS);
    return () => window.clearTimeout(t);
  }, [capturing, active, onCapture]);

  const dir = calibrationDirections.find((d) => d.id === active)!;
  const needsCenter = tracked && active !== 'center' && !center;

  const hint = !tracked
    ? 'Keep your shoulders still. Hold for a moment while the ring fills.'
    : needsCenter
      ? 'Capture the center position first.'
      : capturing
        ? 'Hold it…'
        : active === 'center'
          ? 'Look straight ahead and keep your head still.'
          : 'Move your head until the ring starts filling, then hold.';

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-bold text-cyan">
            {done.length} of {calibrationDirections.length} directions captured
          </p>
          <h3 className="mt-1 font-display text-2xl font-semibold">{dir.instruction}</h3>
          <p className="mt-1 text-muted">{hint}</p>
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
        ) : tracked ? (
          <p className="rounded-2xl bg-ink-3/70 px-4 py-3 text-sm text-muted">
            Capture is automatic. Hold the pose until the ring is full.
          </p>
        ) : (
          <Button size="xl" icon={TargetIcon} loading={capturing} onClick={() => setCapturing(true)}>
            {capturing ? 'Hold still…' : `Capture ${dir.label.toLowerCase()}`}
          </Button>
        )}
        {capturing && !tracked && (
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