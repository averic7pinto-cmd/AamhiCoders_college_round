import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRightIcon, MicIcon } from 'lucide-react';
import { cheatSheet } from '../../data/commands';

interface CommandCheatSheetProps {
  className?: string;
}

export function CommandCheatSheet({ className = '' }: CommandCheatSheetProps) {
  return (
    <section
      aria-labelledby="cheatsheet-heading"
      className={`flex flex-col rounded-4xl border border-violet/35 bg-ink-2 bg-[linear-gradient(200deg,rgba(155,92,255,0.18)_0%,rgba(25,30,43,0)_45%)] p-6 shadow-panel lg:p-8 ${className}`}
    >
      <div className="flex items-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-violet/15 text-violet-soft ring-1 ring-inset ring-violet/40">
          <MicIcon className="h-5 w-5" aria-hidden="true" />
        </span>
        <h2 id="cheatsheet-heading" className="font-display text-base font-semibold">
          Say it to do it
        </h2>
      </div>

      <ul className="mt-6 divide-y divide-line">
        {cheatSheet.map((c) => (
          <li key={c.phrase} className="flex items-center justify-between gap-4 py-3">
            <span className="whitespace-nowrap rounded-lg bg-cyan/10 px-2.5 py-1 text-sm font-bold text-cyan">“{c.phrase}”</span>
            <span className="text-right text-sm text-muted">{c.action}</span>
          </li>
        ))}
      </ul>

      <p className="mt-5 rounded-2xl bg-ink-3/70 p-4 text-sm leading-relaxed text-muted">
        Tip: say <span className="font-bold text-fg">“Show targets”</span> first — every link gets a number you can say out loud.
      </p>

      <Link
        to="/voice"
        className="mt-auto inline-flex items-center gap-2 self-start rounded-lg pt-6 text-sm font-bold text-violet-soft transition-[gap] duration-150 ease-out hover:gap-3"
      >
        All voice commands
        <ArrowRightIcon className="h-4 w-4" aria-hidden="true" />
      </Link>
    </section>
  );
}
