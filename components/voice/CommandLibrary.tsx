import React, { useId, useState } from "react";
import { ArrowDownUpIcon, CompassIcon, MousePointerClickIcon, PanelsTopLeftIcon, SearchIcon, ShieldAlertIcon, TypeIcon, BoxIcon } from "lucide-react";
import { commandCategories, voiceCommands, CommandCategory } from "../../data/commands";
const categoryMeta: Record<CommandCategory, {
  icon: typeof BoxIcon;
  active: string;
}> = {
  Navigation: {
    icon: CompassIcon,
    active: 'bg-electric/20 text-fg ring-electric/60'
  },
  Scrolling: {
    icon: ArrowDownUpIcon,
    active: 'bg-cyan/15 text-fg ring-cyan/60'
  },
  Selection: {
    icon: MousePointerClickIcon,
    active: 'bg-lime/15 text-fg ring-lime/60'
  },
  Tabs: {
    icon: PanelsTopLeftIcon,
    active: 'bg-violet/20 text-fg ring-violet/60'
  },
  'Text Input': {
    icon: TypeIcon,
    active: 'bg-coral/15 text-fg ring-coral/60'
  }
};
export function CommandLibrary() {
  const [category, setCategory] = useState<CommandCategory>('Navigation');
  const [query, setQuery] = useState('');
  const searchId = useId();
  const q = query.trim().toLowerCase();
  const rows = voiceCommands.filter(c => q ? c.phrase.toLowerCase().includes(q) || c.action.toLowerCase().includes(q) : c.category === category);
  const onTabKey = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    const i = commandCategories.indexOf(category);
    const next = commandCategories[(i + (e.key === 'ArrowRight' ? 1 : -1) + commandCategories.length) % commandCategories.length];
    setCategory(next);
    e.currentTarget.querySelector<HTMLButtonElement>(`[data-cat="${next}"]`)?.focus();
  };
  return <section aria-labelledby="library-heading" className="rounded-4xl border border-line bg-ink-2 p-6 shadow-panel sm:p-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 id="library-heading" className="font-display text-lg font-semibold">
          Command library
        </h2>
        <div className="relative w-full sm:w-72">
          <label htmlFor={searchId} className="sr-only">
            Search commands
          </label>
          <SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" aria-hidden="true" />
          <input id={searchId} type="search" value={query} onChange={e => setQuery(e.target.value)} placeholder="Search all commands" className="h-11 w-full rounded-xl border border-line bg-ink pl-10 pr-3 text-sm text-fg placeholder:text-muted hover:border-cyan/40 focus:border-cyan focus:outline-none" />
        </div>
      </div>

      {!q && <div role="tablist" aria-label="Command categories" onKeyDown={onTabKey} className="mt-6 flex flex-wrap gap-2">
          {commandCategories.map(c => {
        const meta = categoryMeta[c];
        const active = c === category;
        return <button key={c} type="button" role="tab" data-cat={c} aria-selected={active} tabIndex={active ? 0 : -1} onClick={() => setCategory(c)} className={`inline-flex h-11 items-center gap-2 rounded-xl px-4 text-sm font-bold ring-1 ring-inset transition-colors duration-150 ${active ? meta.active : 'text-muted ring-line hover:text-fg'}`}>
                <meta.icon className="h-4 w-4" aria-hidden="true" />
                {c}
                <span className="font-mono text-xs opacity-70">{voiceCommands.filter(v => v.category === c).length}</span>
              </button>;
      })}
        </div>}

      <div role={q ? undefined : 'tabpanel'} className="mt-6 overflow-x-auto">
        {rows.length === 0 ? <p className="rounded-2xl border border-dashed border-line p-8 text-center text-sm text-muted">No commands match “{query}”.</p> : <table className="w-full min-w-[560px] text-left">
            <thead>
              <tr className="border-b border-line text-xs font-bold text-muted">
                <th scope="col" className="pb-3 pr-4 font-bold">Say</th>
                <th scope="col" className="pb-3 pr-4 font-bold">What happens</th>
                <th scope="col" className="pb-3 font-bold">Example</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {rows.map(c => <tr key={c.phrase}>
                  <td className="py-3.5 pr-4">
                    <span className="whitespace-nowrap rounded-lg bg-cyan/10 px-2.5 py-1 text-sm font-bold text-cyan">“{c.phrase}”</span>
                  </td>
                  <td className="py-3.5 pr-4 text-sm text-fg">
                    {c.action}
                    {c.confirm && <span className="ml-2 inline-flex items-center gap-1 whitespace-nowrap rounded-full bg-amber/10 px-2 py-0.5 text-[11px] font-bold text-amber">
                        <ShieldAlertIcon className="h-3 w-3" aria-hidden="true" />
                        Asks to confirm
                      </span>}
                  </td>
                  <td className="py-3.5 font-mono text-sm text-muted">{c.example ?? '—'}</td>
                </tr>)}
            </tbody>
          </table>}
      </div>
    </section>;
}