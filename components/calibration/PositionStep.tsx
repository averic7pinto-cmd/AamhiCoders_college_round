import React from 'react';
import { AlertTriangleIcon, CheckCircle2Icon } from 'lucide-react';
import { FaceWireframe } from '../live/FaceWireframe';
import { positionChecklist } from '../../data/calibration';
import { useSession } from '../../contexts/SessionContext';

export function PositionStep() {
  const { cameraState } = useSession();
  const lost = cameraState === 'lost';

  return (
    <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr] lg:items-center">
      <div className={`relative aspect-[4/3] overflow-hidden rounded-3xl border bg-[#0B0E16] ${lost ? 'border-coral/60' : 'border-line'}`}>
        <div className="absolute inset-0 bg-grid" aria-hidden="true" />
        <FaceWireframe state={lost ? 'lost' : 'tracking'} showFrame={false} />
        {!lost && (
          <svg viewBox="0 0 640 400" className="absolute inset-0 h-full w-full" aria-hidden="true">
            <ellipse cx="320" cy="188" rx="104" ry="128" fill="none" stroke="#C5FF4A" strokeWidth="3" strokeDasharray="10 10" />
          </svg>
        )}
        <span className="glass absolute left-4 top-4 rounded-full border border-line px-3 py-1.5 text-xs font-bold text-fg">Simulated preview</span>
      </div>
      <div>
        <h3 className="font-display text-xl font-semibold">Fit your face inside the oval</h3>
        <p className="mt-2 text-muted">We’ll use this as your resting position. Sit comfortably — you don’t need to hold perfectly still.</p>
        <p
          role="status"
          className={`mt-5 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-bold ${
            lost ? 'bg-coral/10 text-coral' : 'bg-lime/10 text-lime'
          }`}
        >
          {lost ? <AlertTriangleIcon className="h-4 w-4" aria-hidden="true" /> : <CheckCircle2Icon className="h-4 w-4" aria-hidden="true" />}
          {lost ? 'Face not found — move toward the center' : 'Face centered'}
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
