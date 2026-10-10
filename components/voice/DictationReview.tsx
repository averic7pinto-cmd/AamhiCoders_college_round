import React, { useEffect, useId, useState } from 'react';
import { CheckCircle2Icon, EraserIcon, MicIcon, SendIcon, WandIcon } from 'lucide-react';
import { Button } from '../ui/Button';
import { dictationSample } from '../../data/commands';

type State = 'editing' | 'inserting' | 'inserted';

export function DictationReview() {
  const id = useId();
  const [text, setText] = useState(dictationSample.text);
  const [state, setState] = useState<State>('editing');
  const hasSuggestion = text.includes(dictationSample.suggestion.from);

  useEffect(() => {
    if (state !== 'inserting') return;
    const t = window.setTimeout(() => setState('inserted'), 900);
    return () => window.clearTimeout(t);
  }, [state]);

  return (
    <section aria-labelledby="dictation-heading" className="rounded-4xl border border-violet/35 bg-ink-2 p-6 shadow-panel sm:p-8">
      <h2 id="dictation-heading" className="font-display text-base font-semibold">
        Review dictation
      </h2>
      <p className="mt-1 text-sm text-muted">
        Nothing is typed until you approve it. Inserting into <span className="font-bold text-fg">{dictationSample.field}</span> on {dictationSample.site}.
      </p>

      <label htmlFor={id} className="sr-only">
        Dictated text
      </label>
      <textarea
        id={id}
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          setState('editing');
        }}
        rows={3}
        className="mt-4 w-full resize-none rounded-2xl border border-line bg-ink p-4 text-base leading-relaxed text-fg transition-colors duration-150 placeholder:text-muted hover:border-violet/50 focus:border-violet focus:outline-none"
        placeholder="Dictated text appears here"
      />
      <div className="mt-2 flex items-center justify-between text-xs text-muted">
        <span>{text.length} characters</span>
        {hasSuggestion && (
          <button
            type="button"
            onClick={() => setText((t) => t.replace(dictationSample.suggestion.from, dictationSample.suggestion.to))}
            className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-violet/15 px-2.5 font-bold text-violet-soft transition-colors duration-150 hover:bg-violet/25"
          >
            <WandIcon className="h-3.5 w-3.5" aria-hidden="true" />
            “{dictationSample.suggestion.from}” → “{dictationSample.suggestion.to}”
          </button>
        )}
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <Button icon={SendIcon} loading={state === 'inserting'} disabled={!text.trim() || state === 'inserted'} onClick={() => setState('inserting')}>
          {state === 'inserting' ? 'Inserting…' : 'Insert text'}
        </Button>
        <Button variant="secondary" icon={MicIcon} onClick={() => setState('editing')}>
          Re-dictate
        </Button>
        <Button
          variant="ghost"
          icon={EraserIcon}
          onClick={() => {
            setText('');
            setState('editing');
          }}
        >
          Clear
        </Button>
      </div>
      <div aria-live="polite">
        {state === 'inserted' && (
          <p className="mt-4 inline-flex items-center gap-2 rounded-xl bg-lime/10 px-3 py-2 text-sm font-bold text-lime">
            <CheckCircle2Icon className="h-4 w-4" aria-hidden="true" />
            Inserted into “{dictationSample.field}”
          </p>
        )}
      </div>
    </section>
  );
}
