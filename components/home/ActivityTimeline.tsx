import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRightIcon, MicIcon, ScanFaceIcon, ShieldCheckIcon } from 'lucide-react';
import { DemoTag } from '../ui/DemoTag';
import { recentActivity } from '../../data/sessions';

const modeMeta = {
  'head-voice': { label: 'Head + voice', dot: 'bg-cyan', ring: 'ring-cyan/30' },
  head: { label: 'Head only', dot: 'bg-electric', ring: 'ring-electric/40' },
  voice: { label: 'Voice only', dot: 'bg-violet', ring: 'ring-violet/40' },
};

export function ActivityTimeline() {
  return (
    <section aria-labelledby="activity-heading" className="rounded-4xl border border-line bg-ink-2 p-6 shadow-panel lg:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id="activity-heading" className="font-display text-base font-semibold">
          Recent sessions
        </h2>
        <div className="flex items-center gap-3">
          <DemoTag />
          <Link to="/performance" className="inline-flex items-center gap-1.5 rounded-lg text-sm font-bold text-cyan hover:underline">
            All history
            <ArrowRightIcon className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </div>

      <ol className="relative mt-6 space-y-1">
        <span className="absolute bottom-4 left-[7px] top-4 w-px bg-line" aria-hidden="true" />
        {recentActivity.map((a) => {
          const m = modeMeta[a.mode];
          return (
            <li key={a.id} className="relative grid grid-cols-[16px_1fr] gap-4 rounded-2xl py-3">
              <span className={`relative mt-1.5 h-[15px] w-[15px] rounded-full ring-4 ring-ink-2 ${m.dot}`} aria-hidden="true" />
              <div className="grid gap-2 sm:grid-cols-[1fr_auto] sm:items-center">
                <div className="min-w-0">
                  <p className="text-sm font-bold text-fg">{a.label}</p>
                  <p className="mt-0.5 text-sm text-muted">
                    {a.day} · {a.time} · {a.site}
                  </p>
                  {a.note && (
                    <p className="mt-1.5 inline-flex items-center gap-1.5 text-xs font-bold text-amber">
                      <ShieldCheckIcon className="h-3.5 w-3.5" aria-hidden="true" />
                      {a.note}
                    </p>
                  )}
                </div>
                <dl className="flex items-center gap-4 text-sm">
                  <div>
                    <dt className="sr-only">Duration</dt>
                    <dd className="font-mono text-fg">{a.durationMin} min</dd>
                  </div>
                  <div>
                    <dt className="sr-only">Commands</dt>
                    <dd className="font-mono text-muted">{a.commands} cmds</dd>
                  </div>
                  <div>
                    <dt className="sr-only">Mode</dt>
                    <dd className="inline-flex items-center gap-1.5 rounded-full bg-ink-3 px-2.5 py-1 text-xs font-bold text-fg">
                      {a.mode !== 'voice' && <ScanFaceIcon className="h-3.5 w-3.5 text-cyan" aria-hidden="true" />}
                      {a.mode !== 'head' && <MicIcon className="h-3.5 w-3.5 text-violet-soft" aria-hidden="true" />}
                      {m.label}
                    </dd>
                  </div>
                </dl>
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
