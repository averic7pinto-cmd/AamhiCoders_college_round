import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CrosshairIcon } from 'lucide-react';
import { Slider } from '../ui/Slider';
import { SegmentedControl } from '../ui/SegmentedControl';
import { Button } from '../ui/Button';
import { useSession } from '../../contexts/SessionContext';

const dwellOptions = [
  { value: '600', label: '0.6 s' },
  { value: '1000', label: '1 s' },
  { value: '1500', label: '1.5 s' },
  { value: '2000', label: '2 s' },
];

export function MovementPanel() {
  const navigate = useNavigate();
  const { sensitivity, setSensitivity, smoothing, setSmoothing, dwellMs, setDwellMs } = useSession();
  const dwellValue = dwellOptions.some((o) => o.value === String(dwellMs)) ? String(dwellMs) : null;

  return (
    <section aria-labelledby="movement-heading" className="space-y-6 rounded-4xl border border-line bg-ink-2 p-6 shadow-panel">
      <h2 id="movement-heading" className="font-display text-base font-semibold">
        Movement
      </h2>
      <Slider
        label="Cursor sensitivity"
        value={sensitivity}
        onChange={setSensitivity}
        min={1}
        max={10}
        format={(v) => `${v} / 10`}
        minLabel="Less travel"
        maxLabel="More travel"
      />
      <Slider
        label="Smoothing"
        value={smoothing}
        onChange={setSmoothing}
        min={0}
        max={100}
        step={5}
        format={(v) => `${v}%`}
        minLabel="Responsive"
        maxLabel="Steady"
      />
      <div>
        <p className="text-sm font-semibold text-fg" id="dwell-label">
          Dwell to select
        </p>
        <p className="mt-1 text-sm text-muted">How long the pointer rests before clicking.</p>
        <div className="mt-3">
          <SegmentedControl label="Dwell to select" options={dwellOptions} value={dwellValue} onChange={(v) => setDwellMs(Number(v))} size="sm" fullWidth />
        </div>
      </div>
      <Button variant="secondary" fullWidth icon={CrosshairIcon} onClick={() => navigate('/calibration')}>
        Run full calibration
      </Button>
    </section>
  );
}
