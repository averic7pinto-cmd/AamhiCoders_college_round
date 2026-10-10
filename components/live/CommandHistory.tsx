import React from 'react';
import { CheckCircle2Icon, HelpCircleIcon, ShieldAlertIcon } from 'lucide-react';
import { DemoTag } from '../ui/DemoTag';
import { commandHistory } from '../../data/sessions';

const statusMeta = {
  executed: { icon: CheckCircle2Icon, cls: 'text-lime', label: 'Done' },
  confirm: { icon: ShieldAlertIcon, cls: 'text-amber', label: 'Confirm' },
  missed: { icon: HelpCircleIcon, cls: 'text-coral', label: 'Missed' },
};

export function CommandHistory() {
  return (
    <section aria-labelledby="history-heading" className="flex min-h-[300px] flex-col rounded-4xl border border-line bg-ink-2 p-6 shadow-panel">
      <div className="flex items-center justify-between gap-3">
        <h2 id="history-heading" className="font-display text-base font-semibold">
          Recognised commands
        </h2>
        <DemoTag />
      </div>
      <ol className="mt-4 divide-y divide-line">
        {commandHistory.map((c) => {
          const m = statusMeta[c.status];
          return (
            <li key={c.id} className="flex items-start gap-3 py-3">
              <m.icon className={`mt-0.5 h-5 w-5 shrink-0 ${m.cls}`} aria-label={m.label} />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-fg">{c.phrase}</p>
                <p className="truncate text-sm text-muted">{c.result}</p>
              </div>
              <span className="font-mono text-xs text-muted">{c.time}</span>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
