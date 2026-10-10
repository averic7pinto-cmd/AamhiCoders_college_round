import React, { useId, useState } from 'react';
import { PlusIcon, XIcon } from 'lucide-react';
import { Button } from '../ui/Button';

interface PhraseChipsProps {
  phrases: string[];
  onChange: (phrases: string[]) => void;
}

export function PhraseChips({ phrases, onChange }: PhraseChipsProps) {
  const id = useId();
  const [draft, setDraft] = useState('');

  const add = (e: React.FormEvent) => {
    e.preventDefault();
    const v = draft.trim();
    if (!v || phrases.some((p) => p.toLowerCase() === v.toLowerCase())) return;
    onChange([...phrases, v]);
    setDraft('');
  };

  return (
    <div>
      <p className="text-sm font-semibold text-fg">Activation phrases</p>
      <p className="mt-1 text-sm text-muted">Say one of these to wake HANDSFREE when wake-phrase mode is on.</p>
      <ul className="mt-3 flex flex-wrap gap-2">
        {phrases.map((p) => (
          <li key={p} className="inline-flex h-10 items-center gap-1 rounded-xl bg-violet/15 pl-3 pr-1 text-sm font-bold text-violet-soft ring-1 ring-inset ring-violet/40">
            “{p}”
            <button
              type="button"
              onClick={() => onChange(phrases.filter((x) => x !== p))}
              disabled={phrases.length === 1}
              aria-label={`Remove ${p}`}
              className="grid h-8 w-8 place-items-center rounded-lg transition-colors duration-150 hover:bg-violet/25 disabled:opacity-40"
            >
              <XIcon className="h-4 w-4" aria-hidden="true" />
            </button>
          </li>
        ))}
      </ul>
      <form onSubmit={add} className="mt-3 flex gap-2">
        <label htmlFor={id} className="sr-only">
          New activation phrase
        </label>
        <input
          id={id}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Add a phrase"
          className="h-11 min-w-0 flex-1 rounded-xl border border-line bg-ink px-3 text-sm text-fg placeholder:text-muted hover:border-violet/50 focus:border-violet focus:outline-none"
        />
        <Button type="submit" variant="secondary" icon={PlusIcon} disabled={!draft.trim()}>
          Add
        </Button>
      </form>
    </div>
  );
}
