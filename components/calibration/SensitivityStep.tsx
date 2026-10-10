import React from 'react';
import { Slider } from '../ui/Slider';
import { SegmentedControl } from '../ui/SegmentedControl';
import { useSession } from '../../contexts/SessionContext';

const presets = [
  { value: '3', label: 'Gentle' },
  { value: '6', label: 'Balanced' },
  { value: '9', label: 'Fast' },
];

export function SensitivityStep() {
  const { sensitivity, setSensitivity, smoothing, setSmoothing } = useSession();
  const travel = sensitivity * 10;
  const presetValue = presets.some((p) => p.value === String(sensitivity)) ? String(sensitivity) : null;

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <div className="space-y-7">
        <div>
          <h3 className="font-display text-xl font-semibold">How far should the pointer travel?</h3>
          <p className="mt-2 text-muted">Pick a starting point, then fine-tune. You’ll try it in the next step.</p>
        </div>
        <SegmentedControl label="Sensitivity preset" options={presets} value={presetValue} onChange={(v) => setSensitivity(Number(v))} fullWidth />
        <Slider label="Cursor sensitivity" value={sensitivity} onChange={setSensitivity} min={1} max={10} format={(v) => `${v} / 10`} minLabel="Less travel" maxLabel="More travel" />
        <Slider label="Smoothing" value={smoothing} onChange={setSmoothing} min={0} max={100} step={5} format={(v) => `${v}%`} minLabel="Responsive" maxLabel="Steady" description="More smoothing reduces jitter from tremor but adds a little lag." />
      </div>

      <div className="rounded-3xl border border-line bg-ink-3/50 p-6">
        <p className="text-sm font-bold text-muted">Pointer travel for a 10° head turn</p>
        <p className="mt-1 font-display text-4xl font-semibold tabular-nums text-cyan">≈ {travel}% <span className="text-lg text-muted">of screen</span></p>
        <div className="relative mt-6 h-28 rounded-2xl border border-line bg-[#0B0E16] bg-grid" aria-hidden="true">
          <span className="absolute left-4 top-1/2 h-3 w-3 -translate-y-1/2 rounded-full bg-muted" />
          <span
            className="absolute left-4 top-1/2 h-1 -translate-y-1/2 rounded-full bg-[linear-gradient(90deg,#31D7FF,#9B5CFF)] transition-[width] duration-200 ease-out"
            style={{ width: `calc((100% - 2rem) * ${travel / 100})` }}
          />
          <span
            className="absolute top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-lime shadow-glow-lime transition-[left] duration-200 ease-out"
            style={{ left: `calc(1rem + (100% - 2rem) * ${travel / 100})` }}
          />
        </div>
        <p className="mt-4 text-sm text-muted">Balanced (6) suits most people. Choose Gentle if small movements are tiring or hard to control.</p>
      </div>
    </div>
  );
}
