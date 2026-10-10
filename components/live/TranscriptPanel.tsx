import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { MicOffIcon, RefreshCwIcon } from 'lucide-react';
import { Button } from '../ui/Button';
import { DemoTag } from '../ui/DemoTag';
import { Waveform } from '../voice/WaveForm';
import { transcriptScript } from '../../data/sessions';
import { useSession } from '../../contexts/SessionContext';

interface Line {
  id: number;
  text: string;
  kind: 'command' | 'dictation' | 'unrecognized';
}

const kindMeta = {
  command: { label: 'Command', cls: 'bg-cyan/10 text-cyan' },
  dictation: { label: 'Dictation', cls: 'bg-violet/15 text-violet-soft' },
  unrecognized: { label: 'Not understood', cls: 'bg-coral/10 text-coral' },
};

export function TranscriptPanel() {
  const { status, voiceEnabled, micState, retryMic } = useSession();
  const [lines, setLines] = useState<Line[]>([]);
  const counter = useRef(0);
  const active = status === 'running' && voiceEnabled && micState === 'ready';

  useEffect(() => {
    if (status === 'idle') {
      setLines([]);
      counter.current = 0;
    }
  }, [status]);

  useEffect(() => {
    if (!active) return;
    const push = () => {
      const item = transcriptScript[counter.current % transcriptScript.length];
      const id = counter.current++;
      setLines((prev) => [...prev, { id, ...item }].slice(-4));
    };
    if (counter.current === 0) push();
    const t = window.setInterval(push, 2600);
    return () => window.clearInterval(t);
  }, [active]);

  return (
    <section aria-labelledby="transcript-heading" className="flex min-h-[300px] flex-col rounded-4xl border border-line bg-ink-2 p-6 shadow-panel">
      <div className="flex items-center justify-between gap-3">
        <h2 id="transcript-heading" className="font-display text-base font-semibold">
          Live transcript
        </h2>
        <DemoTag label="Simulated" />
      </div>

      {micState === 'unavailable' ? (
        <div role="alert" className="mt-5 flex flex-1 flex-col items-center justify-center rounded-3xl border border-coral/40 bg-coral/[0.06] p-6 text-center">
          <MicOffIcon className="h-8 w-8 text-coral" aria-hidden="true" />
          <p className="mt-3 font-bold text-fg">Microphone unavailable</p>
          <p className="mt-1 text-sm text-muted">Check that a mic is connected and Chrome is allowed to use it.</p>
          <Button className="mt-4" size="sm" variant="danger" icon={RefreshCwIcon} onClick={retryMic}>
            Try again
          </Button>
        </div>
      ) : !voiceEnabled ? (
        <div className="mt-5 flex flex-1 items-center justify-center rounded-3xl border border-dashed border-line p-6 text-center text-sm text-muted">
          Voice commands are off. Turn them on in the controls above.
        </div>
      ) : status === 'idle' ? (
        <div className="mt-5 flex flex-1 items-center justify-center rounded-3xl border border-dashed border-line p-6 text-center text-sm text-muted">
          What you say appears here once the session starts.
        </div>
      ) : (
        <>
          <div className="mt-4 flex items-center gap-3 rounded-2xl bg-ink-3/70 px-4 py-3">
            <span className={`text-xs font-bold ${active ? 'text-cyan' : 'text-amber'}`}>{active ? 'Listening' : 'Paused'}</span>
            <Waveform active={active} bars={32} className="h-6 flex-1" />
          </div>
          <ul aria-live="polite" className="mt-3 flex-1 space-y-2">
            <AnimatePresence initial={false}>
              {lines.map((l, i) => (
                <motion.li
                  key={l.id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: i === lines.length - 1 ? 1 : 0.6, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
                  className="flex items-center gap-3"
                >
                  <span className={`whitespace-nowrap rounded-md px-2 py-0.5 text-[11px] font-bold ${kindMeta[l.kind].cls}`}>{kindMeta[l.kind].label}</span>
                  <span className="truncate text-base text-fg">“{l.text}”</span>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        </>
      )}
    </section>
  );
}
