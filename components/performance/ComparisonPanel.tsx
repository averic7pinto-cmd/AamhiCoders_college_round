import React, { useState } from 'react';
import { KeyboardIcon, ScaleIcon, ScanFaceIcon } from 'lucide-react';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';

const tasks = ['Open a news article', 'Search for a recipe', 'Fill a 3-field form', 'Switch between two tabs', 'Scroll to a page footer'];

export function ComparisonPanel() {
  const [open, setOpen] = useState(false);
  return (
    <section aria-labelledby="comparison-heading" className="flex flex-col rounded-4xl border border-line bg-ink-2 p-6 shadow-panel sm:p-8">
      <h2 id="comparison-heading" className="font-display text-base font-semibold">
        Mouse & keyboard vs hands-free
      </h2>
      <div className="mt-6 grid grid-cols-2 gap-3" aria-hidden="true">
        <div className="rounded-2xl border border-dashed border-line p-4">
          <KeyboardIcon className="h-5 w-5 text-muted" />
          <p className="mt-3 text-xs font-bold text-muted">Conventional input</p>
          <p className="mt-1 font-mono text-xl text-muted">— s</p>
        </div>
        <div className="rounded-2xl border border-dashed border-cyan/40 p-4">
          <ScanFaceIcon className="h-5 w-5 text-cyan" />
          <p className="mt-3 text-xs font-bold text-muted">Hands-free</p>
          <p className="mt-1 font-mono text-xl text-muted">— s</p>
        </div>
      </div>
      <p className="mt-5 text-sm leading-relaxed text-muted">
        No comparison yet. Results appear here only after the same five tasks are completed with each input method — we never estimate this for you.
      </p>
      <div className="mt-auto pt-6">
        <Button variant="secondary" icon={ScaleIcon} onClick={() => setOpen(true)}>
          Set up an evaluation
        </Button>
      </div>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Evaluation run"
        description="Complete these five tasks twice — once with mouse and keyboard (or with help), once hands-free. HANDSFREE times each one."
        footer={<Button onClick={() => setOpen(false)}>Got it</Button>}
      >
        <ol className="space-y-2">
          {tasks.map((t, i) => (
            <li key={t} className="flex items-center gap-3 rounded-xl bg-ink-3/60 px-4 py-3 text-sm text-fg">
              <span className="grid h-7 w-7 place-items-center rounded-full bg-electric/20 font-mono text-xs font-bold text-electric-soft">{i + 1}</span>
              {t}
            </li>
          ))}
        </ol>
      </Modal>
    </section>
  );
}
