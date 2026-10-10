import React from 'react';
import { motion } from 'framer-motion';
import { CheckIcon, PlayIcon, RotateCcwIcon } from 'lucide-react';
import { Button } from '../ui/Button';

interface CompleteStepProps {
  summary: Array<{ label: string; value: string }>;
  onStart: () => void;
  onRestart: () => void;
}

export function CompleteStep({ summary, onStart, onRestart }: CompleteStepProps) {
  return (
    <div className="py-6 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
        className="relative mx-auto grid h-28 w-28 place-items-center"
      >
        <span className="absolute inset-0 animate-pulse-ring rounded-full border-2 border-lime/50" aria-hidden="true" />
        <span className="grid h-24 w-24 place-items-center rounded-full bg-lime text-ink shadow-glow-lime">
          <CheckIcon className="h-11 w-11" strokeWidth={3} aria-hidden="true" />
        </span>
      </motion.div>
      <h3 className="mt-7 font-display text-2xl font-semibold sm:text-3xl">You’re calibrated</h3>
      <p className="mx-auto mt-2 max-w-md text-muted">HANDSFREE now knows your comfortable range of movement. You can fine-tune any time in Settings.</p>

      <dl className="mx-auto mt-8 grid max-w-xl grid-cols-1 gap-3 sm:grid-cols-3">
        {summary.map((s) => (
          <div key={s.label} className="rounded-2xl border border-line bg-ink-3/60 p-4">
            <dt className="text-xs font-bold text-muted">{s.label}</dt>
            <dd className="mt-1 font-mono text-lg font-semibold text-fg">{s.value}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button size="xl" icon={PlayIcon} onClick={onStart}>
          Start hands-free session
        </Button>
        <Button size="xl" variant="secondary" icon={RotateCcwIcon} onClick={onRestart}>
          Recalibrate
        </Button>
      </div>
    </div>
  );
}
