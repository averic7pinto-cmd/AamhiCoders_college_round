import React, { useId, useState } from 'react';
import { PlusIcon, Trash2Icon, WandIcon } from 'lucide-react';
import { Button } from '../ui/Button';

interface CustomCommand {
  id: number;
  phrase: string;
  action: string;
}

const actions = ['Open a website', 'Scroll to a section', 'Click a saved element', 'Type saved text'];

export function CustomCommands() {
  const phraseId = useId();
  const actionId = useId();
  const [phrase, setPhrase] = useState('');
  const [action, setAction] = useState(actions[0]);
  const [items, setItems] = useState<CustomCommand[]>([]);

  const add = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phrase.trim()) return;
    setItems((prev) => [...prev, { id: Date.now(), phrase: phrase.trim(), action }]);
    setPhrase('');
  };

  return (
    <section aria-labelledby="custom-heading" className="rounded-4xl border border-line bg-ink-2 p-6 shadow-panel sm:p-8">
      <div className="flex items-center gap-3">
        <h2 id="custom-heading" className="font-display text-base font-semibold">
          Custom commands
        </h2>
        <span className="rounded-full bg-violet/15 px-2.5 py-0.5 text-[11px] font-bold text-violet-soft">Preview</span>
      </div>
      <p className="mt-1 text-sm text-muted">Create your own phrases for things you do often.</p>

      <form onSubmit={add} className="mt-5 grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
        <div>
          <label htmlFor={phraseId} className="text-xs font-bold text-muted">
            When I say
          </label>
          <input
            id={phraseId}
            value={phrase}
            onChange={(e) => setPhrase(e.target.value)}
            placeholder="e.g. Open my email"
            className="mt-1.5 h-11 w-full rounded-xl border border-line bg-ink px-3 text-sm text-fg placeholder:text-muted hover:border-cyan/40 focus:border-cyan focus:outline-none"
          />
        </div>
        <div>
          <label htmlFor={actionId} className="text-xs font-bold text-muted">
            Do this
          </label>
          <select
            id={actionId}
            value={action}
            onChange={(e) => setAction(e.target.value)}
            className="mt-1.5 h-11 w-full rounded-xl border border-line bg-ink px-3 text-sm text-fg hover:border-cyan/40 focus:border-cyan focus:outline-none"
          >
            {actions.map((a) => (
              <option key={a}>{a}</option>
            ))}
          </select>
        </div>
        <Button type="submit" icon={PlusIcon} disabled={!phrase.trim()}>
          Add
        </Button>
      </form>

      {items.length === 0 ? (
        <div className="mt-5 flex items-center gap-4 rounded-2xl border border-dashed border-line p-5">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-violet/15 text-violet-soft">
            <WandIcon className="h-5 w-5" aria-hidden="true" />
          </span>
          <p className="text-sm text-muted">No custom commands yet. Phrases you add here work alongside the built-in library.</p>
        </div>
      ) : (
        <ul className="mt-5 divide-y divide-line">
          {items.map((it) => (
            <li key={it.id} className="flex items-center gap-3 py-3">
              <span className="rounded-lg bg-violet/15 px-2.5 py-1 text-sm font-bold text-violet-soft">“{it.phrase}”</span>
              <span className="flex-1 text-sm text-muted">{it.action}</span>
              <button
                type="button"
                onClick={() => setItems((prev) => prev.filter((p) => p.id !== it.id))}
                aria-label={`Remove “${it.phrase}”`}
                className="grid h-10 w-10 place-items-center rounded-xl text-muted transition-colors duration-150 hover:bg-coral/10 hover:text-coral"
              >
                <Trash2Icon className="h-4 w-4" aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
