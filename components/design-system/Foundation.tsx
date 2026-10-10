import React from 'react';
import { colorTokens, glowTokens, radiusScale, spacingScale, typeScale } from '../../data/designTokens';

export function Foundations() {
  return (
    <div className="space-y-6">
      <section aria-labelledby="ds-color" className="rounded-4xl border border-line bg-ink-2 p-6 shadow-panel sm:p-8">
        <h2 id="ds-color" className="font-display text-lg font-semibold">Colour tokens</h2>
        <p className="mt-1 text-sm text-muted">Vivid accents sit on a charcoal base. Status always pairs colour with an icon or text.</p>
        <ul className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {colorTokens.map((c) => (
            <li key={c.name}>
              <span className={`block h-20 rounded-2xl border border-white/10 ${c.swatch}`} aria-hidden="true" />
              <p className="mt-2 text-sm font-bold text-fg">{c.name}</p>
              <p className="font-mono text-xs text-muted">{c.hex}</p>
              <p className="mt-0.5 text-xs text-muted">{c.role}</p>
            </li>
          ))}
        </ul>
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <div className="h-14 rounded-2xl bg-grad-primary" aria-hidden="true" />
          <div className="h-14 rounded-2xl bg-grad-cyan" aria-hidden="true" />
          <div className="h-14 rounded-2xl bg-grad-lime" aria-hidden="true" />
        </div>
        <p className="mt-2 text-xs text-muted">Gradients: primary (electric → violet), cyan (cyan → electric), lime (lime → cyan). Reserved for primary actions and active states.</p>
      </section>

      <section aria-labelledby="ds-type" className="rounded-4xl border border-line bg-ink-2 p-6 shadow-panel sm:p-8">
        <h2 id="ds-type" className="font-display text-lg font-semibold">Typography</h2>
        <ul className="mt-6 divide-y divide-line">
          {typeScale.map((t) => (
            <li key={t.name} className="grid gap-2 py-4 md:grid-cols-[160px_1fr_220px] md:items-baseline">
              <span className="text-sm font-bold text-muted">{t.name}</span>
              <span className={`${t.className} truncate text-fg`}>{t.sample}</span>
              <span className="font-mono text-xs text-muted">{t.spec}</span>
            </li>
          ))}
        </ul>
      </section>

      <div className="grid gap-6 lg:grid-cols-3">
        <section aria-labelledby="ds-space" className="rounded-4xl border border-line bg-ink-2 p-6 shadow-panel">
          <h2 id="ds-space" className="font-display text-base font-semibold">Spacing</h2>
          <ul className="mt-5 space-y-2.5">
            {spacingScale.map((s) => (
              <li key={s} className="flex items-center gap-3">
                <span className="w-10 font-mono text-xs text-muted">{s}px</span>
                <span className="h-3 rounded-full bg-cyan" style={{ width: s * 3 }} aria-hidden="true" />
              </li>
            ))}
          </ul>
        </section>
        <section aria-labelledby="ds-radius" className="rounded-4xl border border-line bg-ink-2 p-6 shadow-panel">
          <h2 id="ds-radius" className="font-display text-base font-semibold">Radii</h2>
          <ul className="mt-5 grid grid-cols-3 gap-3">
            {radiusScale.map((r) => (
              <li key={r.name} className="text-center">
                <span className={`mx-auto block h-14 w-14 border-2 border-violet bg-violet/15 ${r.className}`} aria-hidden="true" />
                <p className="mt-1.5 font-mono text-xs text-muted">{r.name} · {r.value}</p>
              </li>
            ))}
          </ul>
        </section>
        <section aria-labelledby="ds-glow" className="rounded-4xl border border-line bg-ink-2 p-6 shadow-panel">
          <h2 id="ds-glow" className="font-display text-base font-semibold">Shadows & glows</h2>
          <ul className="mt-5 space-y-4">
            {glowTokens.map((g) => (
              <li key={g.name} className="flex items-center gap-4">
                <span className={`h-10 w-10 shrink-0 rounded-xl bg-ink-3 ${g.className}`} aria-hidden="true" />
                <span>
                  <span className="block font-mono text-xs text-fg">{g.name}</span>
                  <span className="block text-xs text-muted">{g.use}</span>
                </span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
