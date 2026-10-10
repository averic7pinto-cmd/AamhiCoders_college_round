import React from 'react';
import { DemoTag } from '../ui/DemoTag';
import { sessionHistory } from '../../data/sessions';

export function SessionStats() {
  const max = Math.max(...sessionHistory.map((s) => s.commands));

  return (
    <section aria-labelledby="stats-heading" className="rounded-4xl border border-line bg-ink-2 p-6 shadow-panel lg:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id="stats-heading" className="font-display text-base font-semibold">
          Your hands-free week
        </h2>
        <DemoTag label="Sample data · not measured yet" />
      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-[1.5fr_1fr_1fr] md:gap-0">
        <div className="md:pr-8">
          <p className="text-sm font-semibold text-muted">Commands executed</p>
          <p className="mt-1 font-display text-5xl font-semibold tabular-nums text-fg">1,284</p>
          <div className="mt-5 flex h-14 items-end gap-1.5" aria-hidden="true">
            {sessionHistory.map((s) => (
              <span
                key={s.id}
                className="flex-1 rounded-t-md bg-[linear-gradient(180deg,#31D7FF,#4263FF)]"
                style={{ height: `${(s.commands / max) * 100}%` }}
              />
            ))}
          </div>
          <p className="mt-2 text-xs text-muted">Across 8 sample sessions</p>
        </div>

        <div className="border-line md:border-l md:px-8">
          <p className="text-sm font-semibold text-muted">Successful selections</p>
          <p className="mt-1 font-display text-3xl font-semibold tabular-nums text-lime">412</p>
          <p className="mt-2 text-sm text-muted">of 451 attempts</p>
        </div>

        <div className="border-line md:border-l md:pl-8">
          <p className="text-sm font-semibold text-muted">Time saved</p>
          <p className="mt-1 font-display text-3xl font-semibold tabular-nums text-cyan">≈ 3.6 h</p>
          <p className="mt-2 text-sm text-muted">Estimate — needs a comparison run to verify</p>
        </div>
      </div>
    </section>
  );
}
