import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRightIcon } from 'lucide-react';
import { Waveform } from '../voice/WaveForm';
import { features } from '../../data/features';

function HeadTrackingVisual() {
  return (
    <div aria-hidden="true" className="flex h-full items-center justify-center rounded-2xl border border-electric/30 bg-ink/55">
      <div className="relative flex h-16 w-16 items-center justify-center rounded-full border border-electric/50">
        <div className="h-8 w-8 rounded-full border border-electric-soft/70 bg-electric/15" />
        <span className="absolute -right-1 top-2 h-2 w-2 rounded-full bg-electric-soft shadow-[0_0_12px_rgba(120,150,255,0.9)]" />
      </div>
    </div>
  );
}

function SelectionVisual() {
  return (
    <div aria-hidden="true" className="flex h-full items-center justify-center rounded-2xl border border-lime/30 bg-ink/55">
      <div className="flex items-center gap-2 rounded-lg border border-lime/40 bg-lime/10 px-4 py-3">
        <span className="h-2 w-2 rounded-full bg-lime" />
        <span className="h-2 w-12 rounded-full bg-lime/50" />
      </div>
    </div>
  );
}

const styles: Record<string, { card: string; link: string; span: string; visual: React.ReactNode }> = {
  head: {
    card: 'border-electric/40 bg-[linear-gradient(160deg,rgba(66,99,255,0.34)_0%,rgba(25,30,43,0)_62%)]',
    link: 'text-electric-soft',
    span: 'md:col-span-2 xl:col-span-5',
    visual: <HeadTrackingVisual />,
  },
  voice: {
    card: 'border-violet/40 bg-[linear-gradient(160deg,rgba(155,92,255,0.32)_0%,rgba(25,30,43,0)_62%)]',
    link: 'text-violet-soft',
    span: 'xl:col-span-4',
    visual: (
      <div className="flex h-full items-center rounded-2xl border border-violet/30 bg-ink/55 px-4">
        <Waveform active bars={26} className="h-14 w-full" />
      </div>
    ),
  },
  select: {
    card: 'border-lime/30 bg-[linear-gradient(160deg,rgba(197,255,74,0.16)_0%,rgba(25,30,43,0)_62%)]',
    link: 'text-lime',
    span: 'xl:col-span-3',
    visual: <SelectionVisual />,
  },
};

export function FeatureCards() {
  return (
    <section aria-label="Ways to browse" className="grid gap-6 md:grid-cols-2 xl:grid-cols-12">
      {features.map((f) => {
        const s = styles[f.id];
        return (
          <article key={f.id} className={`flex flex-col rounded-4xl border bg-ink-2 p-6 ${s.card} ${s.span}`}>
            <div className="h-28">{s.visual}</div>
            <h3 className="mt-6 font-display text-lg font-semibold">{f.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted">{f.description}</p>
            <Link
              to={f.to}
              className={`mt-auto inline-flex items-center gap-2 self-start rounded-lg pt-5 text-sm font-bold transition-[gap] duration-150 ease-out hover:gap-3 ${s.link}`}
            >
              {f.cta}
              <ArrowRightIcon className="h-4 w-4" aria-hidden="true" />
            </Link>
          </article>
        );
      })}
    </section>
  );
}
