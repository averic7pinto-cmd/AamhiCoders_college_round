import React from 'react';
import { Slider } from '../ui/Slider';
import { SegmentedControl } from '../ui/SegmentedControl';
import { useSession } from '../../contexts/SessionContext';

const presets = [
  { value: '3', label: 'Gentle' },
  { value: '6', label: 'Balanced' },
  { value: '9', label: 'Fast' },
];

// Same formula as mouse_control_copy.py.
function handSpan(sensitivity: number): number {
  return Math.round(Math.max(0.25, Math.min(1, 1.06 - sensitivity * 0.077)) * 100);
}

export function SensitivityStep() {
  const { sensitivity, setSensitivity, smoothing, setSmoothing } = useSession();
  const span = handSpan(sensitivity);
  const presetValue = presets.some((p) => p.value === String(sensitivity)) ? String(sensitivity) : null;

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <div className="space-y-7">
        <div>
          <h3 className="font-display text-xl font-semibold">How far should the pointer travel?</h3>
          <p className="mt-2 text-muted">
            Raise your index finger and move it. The real pointer follows these settings, so you can feel the difference as you adjust.
          </p>
        </div>
        <SegmentedControl label="Sensitivity preset" options={presets} value={presetValue} onChange={(v) => setSensitivity(Number(v))} fullWidth />
        <Slider label="Cursor sensitivity" value={sensitivity} onChange={setSensitivity} min={1} max={10} format={(v) => `${v} / 10`} minLabel="Less travel" maxLabel="More travel" />
        <Slider label="Smoothing" value={smoothing} onChange={setSmoothing} min={0} max={100} step={5} format={(v) => `${v}%`} minLabel="Responsive" maxLabel="Steady" description="More smoothing reduces jitter from tremor but adds a little lag." />
      </div>

      <div className="rounded-3xl border border-line bg-ink-3/50 p-6">
        <p className="text-sm font-bold text-muted">Hand movement needed to cross the whole screen</p>
        <p className="mt-1 font-display text-4xl font-semibold tabular-nums text-cyan">
          ≈ {span}% <span className="text-lg text-muted">of the camera view</span>
        </p>

        <div className="relative mt-6 aspect-[4/3] w-full rounded-2xl border border-line bg-[#0B0E16] bg-grid" aria-hidden="true">
          <span
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-xl border-2 border-dashed border-lime bg-lime/10 transition-[width,height] duration-200 ease-out"
            style={{ width: `${span}%`, height: `${span}%` }}
          />
          <span className="absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-lime shadow-glow-lime" />
        </div>

        <p className="mt-4 text-sm text-muted">
          Your fingertip only has to stay inside the dashed box. A smaller box means less movement. Balanced (6) suits most people. Choose Gentle if small movements are hard to control.
        </p>
      </div>
    </div>
  );
}