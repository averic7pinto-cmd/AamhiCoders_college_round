import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftIcon, LockIcon, PuzzleIcon, RotateCwIcon } from 'lucide-react';
import { MotionConfig } from 'framer-motion';
import { Button } from '../components/ui/Button';
import { ExtensionPopup } from '../components/popup/ExtensionPopup';

export function Popup() {
  const navigate = useNavigate();
  return (
    <MotionConfig reducedMotion="user">
      <main className="min-h-screen w-full bg-ink p-4 sm:p-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-muted">Chrome toolbar popup · 360 px wide</p>
              <h1 className="font-display text-2xl font-semibold">Extension popup</h1>
            </div>
            <Button variant="secondary" icon={ArrowLeftIcon} onClick={() => navigate('/')}>
              Back to dashboard
            </Button>
          </div>

          <div className="overflow-hidden rounded-3xl border border-line bg-[#0B0E16] shadow-panel">
            <div className="flex items-center gap-3 border-b border-line bg-ink-2 px-4 py-3" aria-hidden="true">
              <span className="flex gap-1.5">
                <span className="h-3 w-3 rounded-full bg-coral/70" />
                <span className="h-3 w-3 rounded-full bg-amber/70" />
                <span className="h-3 w-3 rounded-full bg-lime/70" />
              </span>
              <RotateCwIcon className="ml-2 h-4 w-4 text-muted" />
              <div className="flex h-9 flex-1 items-center gap-2 rounded-full bg-ink px-4 text-sm text-muted">
                <LockIcon className="h-3.5 w-3.5" />
                news.example.com/world
              </div>
              <span className="rounded-lg p-1 ring-2 ring-cyan">
                <span className="flex h-6 w-6 items-center justify-center rounded-md bg-cyan text-xs font-bold text-ink">HF</span>
              </span>
              <PuzzleIcon className="h-5 w-5 text-muted" />
            </div>

            <div className="relative min-h-[680px] bg-grid p-6 sm:p-10">
              <div className="max-w-xl space-y-4 opacity-40" aria-hidden="true">
                <div className="h-8 w-3/4 rounded-lg bg-line" />
                <div className="h-4 w-full rounded bg-line/70" />
                <div className="h-4 w-11/12 rounded bg-line/70" />
                <div className="h-44 w-full rounded-2xl bg-line/50" />
                <div className="h-4 w-full rounded bg-line/70" />
                <div className="h-4 w-4/5 rounded bg-line/70" />
              </div>
              <div className="mt-8 flex justify-center md:absolute md:right-6 md:top-2 md:mt-0">
                <ExtensionPopup />
              </div>
            </div>
          </div>
        </div>
      </main>
    </MotionConfig>
  );
}
