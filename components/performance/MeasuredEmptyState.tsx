import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ActivityIcon, PlayIcon } from 'lucide-react';
import { Button } from '../ui/Button';

const measures = ['Commands executed', 'Successful selections', 'Recognition accuracy', 'Accidental activations', 'Session duration'];

export function MeasuredEmptyState() {
  const navigate = useNavigate();
  return (
    <section className="rounded-4xl border border-dashed border-line bg-ink-2 px-6 py-16 text-center">
      <span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-cyan/10 text-cyan ring-1 ring-inset ring-cyan/30">
        <ActivityIcon className="h-8 w-8" aria-hidden="true" />
      </span>
      <h2 className="mt-6 font-display text-xl font-semibold">No measured sessions yet</h2>
      <p className="mx-auto mt-2 max-w-md text-muted">
        Real numbers appear here after your first hands-free session. Until then, nothing on this tab is estimated.
      </p>
      <ul className="mx-auto mt-6 flex max-w-xl flex-wrap justify-center gap-2">
        {measures.map((m) => (
          <li key={m} className="rounded-full border border-line px-3 py-1.5 text-xs font-bold text-muted">
            {m}
          </li>
        ))}
      </ul>
      <Button className="mt-8" size="lg" icon={PlayIcon} onClick={() => navigate('/live')}>
        Start a session
      </Button>
    </section>
  );
}
