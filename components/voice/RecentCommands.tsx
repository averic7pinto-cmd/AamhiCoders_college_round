import React, { useState } from 'react';
import { CheckCircle2Icon, HelpCircleIcon, ShieldAlertIcon } from 'lucide-react';
import { DemoTag } from '../ui/DemoTag';
import { recentVoiceCommands } from '../../data/commands';

type Item = (typeof recentVoiceCommands)[number] & { resolved?: string };

export function RecentCommands() {
  const [items, setItems] = useState<Item[]>(recentVoiceCommands);

  const resolve = (id: string, phrase: string) =>
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, resolved: phrase } : it)));

  return (
    <section aria-labelledby="recent-voice-heading" className="flex flex-col rounded-4xl border border-line bg-ink-2 p-6 shadow-panel sm:p-8">
      <div className="flex items-center justify-between gap-3">
        <h2 id="recent-voice-heading" className="font-display text-base font-semibold">
          Recently recognised
        </h2>
        <DemoTag />
      </div>

      <ol className="mt-5 space-y-3">
        {items.map((it) => {
          const missed = it.status === 'missed' && !it.resolved;
          return (
            <li
              key={it.id}
              className={`rounded-2xl border p-4 ${missed ? 'border-coral/40 bg-coral/[0.06]' : 'border-line bg-ink-3/50'}`}
            >
              <div className="flex items-start gap-3">
                {missed ? (
                  <HelpCircleIcon className="mt-0.5 h-5 w-5 shrink-0 text-coral" aria-label="Not understood" />
                ) : it.status === 'confirm' ? (
                  <ShieldAlertIcon className="mt-0.5 h-5 w-5 shrink-0 text-amber" aria-label="Needs confirmation" />
                ) : (
                  <CheckCircle2Icon className="mt-0.5 h-5 w-5 shrink-0 text-lime" aria-label="Executed" />
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-muted">
                    Heard <span className="font-semibold text-fg">“{it.heard}”</span>
                  </p>
                  <p className={`mt-0.5 text-sm font-bold ${missed ? 'text-coral' : it.status === 'confirm' ? 'text-amber' : 'text-fg'}`}>
                    {missed
                      ? 'Not understood'
                      : it.resolved
                        ? `Corrected to “${it.resolved}”`
                        : it.status === 'confirm'
                          ? `${it.match} — waiting for “Yes, confirm”`
                          : it.match}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-mono text-xs text-muted">{it.time}</p>
                  <p className="mt-0.5 font-mono text-xs text-muted">{Math.round(it.confidence * 100)}%</p>
                </div>
              </div>
              {missed && (
                <div className="mt-3 flex flex-wrap items-center gap-2 pl-8">
                  <span className="text-xs font-bold text-muted">Did you mean</span>
                  {it.suggestions.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => resolve(it.id, s)}
                      className="h-9 rounded-lg border border-cyan/40 bg-cyan/10 px-3 text-sm font-bold text-cyan transition-colors duration-150 hover:bg-cyan/20"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </li>
          );
        })}
      </ol>
    </section>
  );
}
