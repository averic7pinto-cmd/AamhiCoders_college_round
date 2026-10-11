import React from 'react';
import { TrackerVideo } from './TrackerVideo';

type Tracker = React.ComponentProps<typeof TrackerVideo>['tracker'];

export function TrackerFeed({ tracker }: { tracker: Tracker }) {
  const { live, active } = tracker;

  return (
    <section
      aria-label="Live camera from the hand tracker"
      className="overflow-hidden rounded-4xl border border-line bg-ink-2 shadow-panel"
    >
      <div className="relative aspect-[4/3] w-full bg-[#0B0E16]">
        <TrackerVideo tracker={tracker} />
      </div>

      <dl className="grid grid-cols-3 gap-2 p-4 text-xs">
        <div className="rounded-xl bg-ink-3/70 p-3">
          <dt className="text-muted">Face</dt>
          <dd className={`mt-1 font-bold ${active && live?.face_detected ? 'text-lime' : 'text-amber'}`}>
            {active && live?.face_detected ? 'Found' : 'Not found'}
          </dd>
        </div>
        <div className="rounded-xl bg-ink-3/70 p-3">
          <dt className="text-muted">Head</dt>
          <dd className="mt-1 font-bold text-fg">{active ? live?.head_direction ?? '—' : '—'}</dd>
        </div>
        <div className="rounded-xl bg-ink-3/70 p-3">
          <dt className="text-muted">Hand</dt>
          <dd className="mt-1 font-bold text-fg">
            {active && live?.hand_detected ? live?.gesture : 'None'}
          </dd>
        </div>
      </dl>
    </section>
  );
}