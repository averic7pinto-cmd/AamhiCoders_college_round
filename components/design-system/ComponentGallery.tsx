import React, { useState } from 'react';
import { CrosshairIcon, InboxIcon, MicIcon, PlayIcon, Trash2Icon } from 'lucide-react';
import { Button } from '../ui/Button';
import { StatusBadge } from '../ui/StatusBadge';
import { DemoTag } from '../ui/DemoTag';
import { Toggle } from '../ui/Toggle';
import { Slider } from '../ui/Slider';
import { SegmentedControl } from '../ui/SegmentedControl';
import { Tooltip } from '../ui/Tooltip';
import { Modal } from '../ui/Modal';
import { Kbd } from '../ui/Kbd';
import { ProgressRing } from '../ui/ProgressRing';
import { Waveform } from '../voice/WaveForm';

export function ComponentGallery() {
  const [toggle, setToggle] = useState(true);
  const [slider, setSlider] = useState(60);
  const [seg, setSeg] = useState<'a' | 'b' | 'c'>('a');
  const [modal, setModal] = useState(false);

  const card = 'rounded-4xl border border-line bg-ink-2 p-6 shadow-panel sm:p-8';

  return (
    <div className="space-y-6">
      <section aria-labelledby="ds-buttons" className={card}>
        <h2 id="ds-buttons" className="font-display text-lg font-semibold">Buttons</h2>
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Button icon={PlayIcon}>Primary</Button>
          <Button variant="secondary" icon={CrosshairIcon}>Secondary</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="success">Success</Button>
          <Button variant="danger" icon={Trash2Icon}>Destructive</Button>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <Button loading>Loading</Button>
          <Button disabled>Disabled</Button>
          <Button size="sm">Small</Button>
          <Button size="lg">Large</Button>
          <Button size="xl" icon={MicIcon}>Extra large</Button>
        </div>
        <p className="mt-4 text-sm text-muted">Minimum target 44 px. Large and extra-large sizes are used for primary hands-free actions.</p>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section aria-labelledby="ds-status" className={card}>
          <h2 id="ds-status" className="font-display text-lg font-semibold">Status badges</h2>
          <div className="mt-6 flex flex-wrap gap-2">
            <StatusBadge tone="live">Live</StatusBadge>
            <StatusBadge tone="success">Ready</StatusBadge>
            <StatusBadge tone="warning">Permission needed</StatusBadge>
            <StatusBadge tone="error">Tracking lost</StatusBadge>
            <StatusBadge tone="info">Calibrating</StatusBadge>
            <StatusBadge tone="neutral">Idle</StatusBadge>
            <DemoTag />
          </div>
          <div className="mt-6 flex items-center gap-2 text-sm text-muted">
            Keyboard hint <Kbd>Alt</Kbd> <Kbd>S</Kbd>
          </div>
        </section>

        <section aria-labelledby="ds-controls" className={`${card} space-y-6`}>
          <h2 id="ds-controls" className="font-display text-lg font-semibold">Controls</h2>
          <Toggle label="Toggle" description="Switch with on/off icon, not colour alone." checked={toggle} onChange={setToggle} />
          <Toggle label="Disabled toggle" checked={false} onChange={() => undefined} disabled />
          <Slider label="Slider" value={slider} onChange={setSlider} format={(v) => `${v}%`} />
          <SegmentedControl label="Segmented control" value={seg} onChange={setSeg} options={[{ value: 'a', label: 'Option A' }, { value: 'b', label: 'Option B' }, { value: 'c', label: 'Option C' }]} />
        </section>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <section aria-labelledby="ds-overlays" className={card}>
          <h2 id="ds-overlays" className="font-display text-lg font-semibold">Tooltips & modals</h2>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Tooltip content="Quick calibration · Alt C">
              <button type="button" aria-label="Quick calibration" className="grid h-11 w-11 place-items-center rounded-xl border border-line bg-ink-3 text-fg hover:border-cyan/50">
                <CrosshairIcon className="h-5 w-5" aria-hidden="true" />
              </button>
            </Tooltip>
            <Button variant="secondary" onClick={() => setModal(true)}>Open modal</Button>
          </div>
          <p className="mt-4 text-sm text-muted">Tooltips appear on hover and focus. Modals trap focus and close with Esc.</p>
        </section>

        <section aria-labelledby="ds-loading" className={card}>
          <h2 id="ds-loading" className="font-display text-lg font-semibold">Loading & empty</h2>
          <div className="mt-6 space-y-2.5" aria-hidden="true">
            <div className="h-4 w-3/4 animate-pulse rounded bg-ink-4" />
            <div className="h-4 w-full animate-pulse rounded bg-ink-4" />
            <div className="h-4 w-1/2 animate-pulse rounded bg-ink-4" />
          </div>
          <div className="mt-5 flex items-center gap-3 rounded-2xl border border-dashed border-line p-4">
            <InboxIcon className="h-5 w-5 text-muted" aria-hidden="true" />
            <p className="text-sm text-muted">Nothing here yet.</p>
          </div>
        </section>

        <section aria-labelledby="ds-charts" className={card}>
          <h2 id="ds-charts" className="font-display text-lg font-semibold">Data visuals</h2>
          <div className="mt-6 flex items-center gap-5">
            <ProgressRing value={72} size={88} stroke={8}>
              <span className="font-mono text-sm font-semibold">72%</span>
            </ProgressRing>
            <Waveform active bars={18} className="h-12 flex-1" />
          </div>
          <p className="mt-4 text-sm text-muted">Charts use electric, violet and lime. Sample data is always tagged.</p>
        </section>
      </div>

      <Modal
        open={modal}
        onClose={() => setModal(false)}
        title="Example modal"
        description="Used for confirmations before sensitive actions."
        footer={
          <>
            <Button variant="secondary" onClick={() => setModal(false)}>Cancel</Button>
            <Button onClick={() => setModal(false)}>Confirm</Button>
          </>
        }
      />
    </div>
  );
}
