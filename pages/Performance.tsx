import React, { useState } from 'react';
import { FlaskConicalIcon } from 'lucide-react';
import { SegmentedControl } from '../components/ui/SegmentedControl';
import { DemoTag } from '../components/ui/DemoTag';
import { ProgressRing } from '../components/ui/ProgressRing';
import { TrendChart } from '../components/performance/TrendChart';
import { ComparisonPanel } from '../components/performance/ComparisonPanel';
import { SessionHistoryTable } from '../components/performance/SessionHistoryTable';
import { MeasuredEmptyState } from '../components/performance/MeasuredEmptyState';
import { sessionHistory } from '../data/sessions';
import { useScreenInit } from '../useScreenInit.js';

type DataMode = 'sample' | 'measured';

export function Performance() {
  const screenInit = useScreenInit() as { performanceMode?: DataMode };
  const [mode, setMode] = useState<DataMode>(screenInit.performanceMode ?? 'sample');
  const maxAccidental = Math.max(...sessionHistory.map((s) => s.accidental));

  return (
    <div className="mx-auto max-w-[1440px] space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <SegmentedControl
          label="Data source"
          value={mode}
          onChange={setMode}
          options={[
            { value: 'sample', label: 'Sample data' },
            { value: 'measured', label: 'Measured' },
          ]}
        />
        {mode === 'sample' && (
          <p className="flex items-center gap-2 rounded-2xl border border-amber/35 bg-amber/10 px-4 py-2.5 text-sm font-semibold text-amber">
            <FlaskConicalIcon className="h-4 w-4 shrink-0" aria-hidden="true" />
            These numbers illustrate the layout. They are not measurements.
          </p>
        )}
      </div>

      {mode === 'measured' ? (
        <MeasuredEmptyState />
      ) : (
        <>
          <div className="grid gap-6 xl:grid-cols-12">
            <section aria-labelledby="trend-heading" className="luminous relative rounded-4xl bg-ink-2 p-6 shadow-panel sm:p-8 xl:col-span-8">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h2 id="trend-heading" className="text-sm font-bold text-muted">
                    Commands executed
                  </h2>
                  <p className="mt-1 font-display text-5xl font-semibold tabular-nums">901</p>
                  <p className="mt-1 text-sm text-muted">Over 8 sessions · 181 minutes</p>
                </div>
                <div className="flex flex-wrap items-center gap-4 text-sm font-bold">
                  <span className="flex items-center gap-2 text-fg">
                    <span className="h-2.5 w-2.5 rounded-full bg-electric" aria-hidden="true" /> Commands
                  </span>
                  <span className="flex items-center gap-2 text-fg">
                    <span className="h-2.5 w-2.5 rounded-full bg-lime" aria-hidden="true" /> Successful selections
                  </span>
                  <DemoTag />
                </div>
              </div>
              <div className="mt-6">
                <TrendChart />
              </div>
            </section>

            <div className="grid gap-6 sm:grid-cols-2 xl:col-span-4 xl:grid-cols-1">
              <section aria-labelledby="accuracy-heading" className="rounded-4xl border border-violet/35 bg-ink-2 p-6 shadow-panel">
                <div className="flex items-center justify-between gap-3">
                  <h2 id="accuracy-heading" className="text-sm font-bold text-muted">
                    Recognition accuracy
                  </h2>
                  <DemoTag />
                </div>
                <div className="mt-4 flex items-center gap-5">
                  <ProgressRing value={91} size={112} from="#9B5CFF" to="#31D7FF">
                    <p className="font-mono text-2xl font-semibold">91%</p>
                  </ProgressRing>
                  <p className="text-sm text-muted">Share of spoken phrases matched to the intended command in sample sessions.</p>
                </div>
              </section>

              <section aria-labelledby="accidental-heading" className="rounded-4xl border border-line bg-ink-2 p-6 shadow-panel">
                <div className="flex items-center justify-between gap-3">
                  <h2 id="accidental-heading" className="text-sm font-bold text-muted">
                    Accidental activations
                  </h2>
                  <DemoTag />
                </div>
                <p className="mt-2 font-display text-3xl font-semibold text-coral">5 <span className="text-base text-muted">last session</span></p>
                <div className="mt-4 flex h-12 items-end gap-1.5" aria-hidden="true">
                  {sessionHistory.map((s) => (
                    <span key={s.id} className="flex-1 rounded-t bg-coral/70" style={{ height: `${(s.accidental / maxAccidental) * 100}%` }} />
                  ))}
                </div>
                <div className="mt-4 flex items-center justify-between border-t border-line pt-4 text-sm">
                  <span className="text-muted">Avg. session duration</span>
                  <span className="font-mono font-semibold text-fg">23 min</span>
                </div>
              </section>
            </div>
          </div>

          <div className="grid gap-6 xl:grid-cols-12">
            <div className="xl:col-span-8">
              <SessionHistoryTable />
            </div>
            <div className="xl:col-span-4">
              <ComparisonPanel />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
