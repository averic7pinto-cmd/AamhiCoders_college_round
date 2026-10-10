import React from 'react';
import { DownloadIcon } from 'lucide-react';
import { Button } from '../ui/Button';
import { DemoTag } from '../ui/DemoTag';
import { sessionHistory } from '../../data/sessions';
import { downloadCsv } from '../../utils/csv';

export function SessionHistoryTable() {
  const exportCsv = () =>
    downloadCsv(
      'handsfree-sample-sessions.csv',
      sessionHistory.map((s) => ({
        data_type: 'sample',
        date: s.date,
        session: s.label,
        duration_min: s.durationMin,
        commands: s.commands,
        selections: s.selections,
        accuracy_pct: s.accuracy,
        accidental_activations: s.accidental,
      })),
    );

  return (
    <section aria-labelledby="history-table-heading" className="rounded-4xl border border-line bg-ink-2 p-6 shadow-panel sm:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h2 id="history-table-heading" className="font-display text-base font-semibold">
            Session history
          </h2>
          <DemoTag />
        </div>
        <Button size="sm" variant="secondary" icon={DownloadIcon} onClick={exportCsv}>
          Export CSV
        </Button>
      </div>
      <div className="mt-5 overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr className="border-b border-line text-xs text-muted">
              <th scope="col" className="pb-3 pr-4 font-bold">Date</th>
              <th scope="col" className="pb-3 pr-4 font-bold">Session</th>
              <th scope="col" className="pb-3 pr-4 text-right font-bold">Duration</th>
              <th scope="col" className="pb-3 pr-4 text-right font-bold">Commands</th>
              <th scope="col" className="pb-3 pr-4 text-right font-bold">Selections</th>
              <th scope="col" className="pb-3 pr-4 text-right font-bold">Accuracy</th>
              <th scope="col" className="pb-3 text-right font-bold">Accidental</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {[...sessionHistory].reverse().map((s) => (
              <tr key={s.id}>
                <td className="py-3 pr-4 font-mono text-muted">{s.date}</td>
                <td className="py-3 pr-4 font-semibold text-fg">{s.label}</td>
                <td className="py-3 pr-4 text-right font-mono text-fg">{s.durationMin}m</td>
                <td className="py-3 pr-4 text-right font-mono text-fg">{s.commands}</td>
                <td className="py-3 pr-4 text-right font-mono text-lime">{s.selections}</td>
                <td className="py-3 pr-4 text-right font-mono text-violet-soft">{s.accuracy}%</td>
                <td className="py-3 text-right font-mono text-coral">{s.accidental}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
