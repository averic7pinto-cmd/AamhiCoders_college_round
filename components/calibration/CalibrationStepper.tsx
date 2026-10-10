import React from 'react';
import { CheckIcon } from 'lucide-react';
import { calibrationSteps } from '../../data/calibration';

interface CalibrationStepperProps {
  current: number;
}

export function CalibrationStepper({ current }: CalibrationStepperProps) {
  return (
    <nav aria-label="Calibration progress" className="rounded-4xl border border-line bg-ink-2 p-5 shadow-panel sm:p-6">
      <ol className="grid grid-cols-3 gap-y-5 md:flex md:items-center md:gap-3">
        {calibrationSteps.map((s, i) => {
          const done = i < current;
          const active = i === current;
          return (
            <li key={s.id} aria-current={active ? 'step' : undefined} className="flex items-center gap-3 md:flex-1">
              <span
                className={`grid h-11 w-11 shrink-0 place-items-center rounded-full font-mono text-sm font-bold transition-[background-color,box-shadow,color] duration-200 ${
                  done ? 'bg-lime text-ink' : active ? 'bg-grad-primary text-white shadow-glow-blue' : 'border-2 border-line text-muted'
                }`}
              >
                {done ? <CheckIcon className="h-5 w-5" strokeWidth={3} aria-hidden="true" /> : i + 1}
              </span>
              <span className="min-w-0">
                <span className={`block whitespace-nowrap text-sm font-bold ${active || done ? 'text-fg' : 'text-muted'}`}>{s.label}</span>
                <span className="hidden text-xs text-muted sm:block">{done ? 'Done' : active ? 'In progress' : 'Up next'}</span>
              </span>
              {i < calibrationSteps.length - 1 && (
                <span className="hidden h-1 min-w-4 flex-1 overflow-hidden rounded-full bg-line md:block" aria-hidden="true">
                  <span
                    className="block h-full rounded-full bg-[linear-gradient(90deg,#C5FF4A,#31D7FF)] transition-[width] duration-300 ease-out"
                    style={{ width: done ? '100%' : '0%' }}
                  />
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
