import React from 'react';
import { AlertTriangleIcon, CheckCircle2Icon } from 'lucide-react';
import { positionChecklist } from '../../data/calibration';
import type { Tracker } from '../../hooks/useTracker';
import { TrackerVideo } from './TrackerVideo';

export function PositionStep({ tracker }: { tracker: Tracker }) {
  const found = tracker.active && Boolean(tracker.live?.face_detected);

  return (
    <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr] lg:items-center">
      <div className={`relative aspect-[4/3] overflow-hidden rounded-3xl border bg-[#0B0E16] ${found ? 'border-lime/50' : 'border-line'}`}>
        <div className="absolute inset-0 bg-grid" aria-hidden="true" />

        <TrackerVideo tracker={tracker} />

        <svg viewBox="0 0 640 480" preserveAspectRatio="xMidYMid slice" className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden="true">
          <ellipse
            cx="320"
            cy="215"
            rx="112"
            ry="146"
            fill="none"
            stroke={found ? '#C5FF4A' : '#FFB347'}
            strokeWidth="3"
            strokeDasharray="10 10"
          />
        </svg>

        <span className="glass absolute left-4 top-4 rounded-full border border-line px-3 py-1.5 text-xs font-bold text-fg">
          {tracker.active ? 'Live camera' : 'Waiting for camera'}
        </span>
      </div>

      <div>
        <h3 className="font-display text-xl font-semibold">Fit your face inside the oval</h3>
        <p className="mt-2 text-muted">We’ll use this as your resting position. Sit comfortably — you don’t need to hold perfectly still.</p>
        <p
          role="status"
          className={`mt-5 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-bold ${
            found ? 'bg-lime/10 text-lime' : 'bg-coral/10 text-coral'
          }`}
        >
          {found ? <CheckCircle2Icon className="h-4 w-4" aria-hidden="true" /> : <AlertTriangleIcon className="h-4 w-4" aria-hidden="true" />}
          {found ? 'Face found' : tracker.active ? 'Face not found — move toward the center' : 'Waiting for the camera'}
        </p>
        <ul className="mt-6 space-y-3">
          {positionChecklist.map((item) => (
            <li key={item} className="flex items-center gap-3 text-sm text-fg">
              <CheckCircle2Icon className="h-5 w-5 shrink-0 text-lime" aria-hidden="true" />
              {item}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}