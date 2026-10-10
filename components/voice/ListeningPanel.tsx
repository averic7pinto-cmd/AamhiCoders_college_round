import React, { useEffect, useState } from 'react';
import { CheckCircle2Icon, HelpCircleIcon, MicIcon, MicOffIcon, RefreshCwIcon, SquareIcon } from 'lucide-react';
import { Button } from '../ui/Button';
import { DemoTag } from '../ui/DemoTag';
import { Waveform } from './WaveForm';
import { voiceDemoPhrases } from '../../data/commands';
import { useSession } from '../../contexts/SessionContext';

export function ListeningPanel() {
  const { micState, retryMic } = useSession();
  const [listening, setListening] = useState(false);
  const [idx, setIdx] = useState(0);
  const [chars, setChars] = useState(0);
  const unavailable = micState === 'unavailable';
  const phrase = voiceDemoPhrases[idx];
  const complete = chars >= phrase.heard.length;

  useEffect(() => {
    if (unavailable) setListening(false);
  }, [unavailable]);

  useEffect(() => {
    if (!listening) return;
    const t = complete
      ? window.setTimeout(() => {
          setIdx((i) => (i + 1) % voiceDemoPhrases.length);
          setChars(0);
        }, 1800)
      : window.setTimeout(() => setChars((c) => c + 1), 55);
    return () => window.clearTimeout(t);
  }, [listening, complete, chars]);

  const toggle = () => {
    if (listening) {
      setListening(false);
    } else {
      setChars(0);
      setListening(true);
    }
  };

  return (
    <section
      aria-labelledby="listening-heading"
      className="luminous relative overflow-hidden rounded-4xl bg-ink-2 p-6 shadow-panel sm:p-8"
    >
      <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(ellipse_at_15%_0%,rgba(155,92,255,0.22),transparent_55%)]" />
      <div className="relative">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
          <div className="relative grid h-32 w-32 shrink-0 place-items-center">
            {listening && (
              <>
                <span className="absolute inset-0 animate-pulse-ring rounded-full border-2 border-cyan/50" aria-hidden="true" />
                <span className="absolute inset-0 animate-pulse-ring rounded-full border-2 border-violet/50 [animation-delay:1.1s]" aria-hidden="true" />
              </>
            )}
            <span
              className={`grid h-28 w-28 place-items-center rounded-full transition-[background-color,box-shadow] duration-200 ${
                unavailable
                  ? 'bg-coral/15 text-coral ring-2 ring-coral/50'
                  : listening
                    ? 'bg-[linear-gradient(135deg,#31D7FF,#9B5CFF)] text-white shadow-glow-violet'
                    : 'bg-ink-3 text-muted ring-1 ring-line'
              }`}
            >
              {unavailable ? <MicOffIcon className="h-11 w-11" aria-hidden="true" /> : <MicIcon className="h-11 w-11" aria-hidden="true" />}
            </span>
          </div>

          <div className="flex-1">
            <h2 id="listening-heading" className="font-display text-2xl font-semibold">
              {unavailable ? 'Microphone unavailable' : listening ? 'Listening…' : 'Microphone is ready'}
            </h2>
            <p className="mt-1.5 text-muted" role="status">
              {unavailable
                ? 'Connect a microphone or allow access in Chrome, then try again.'
                : listening
                  ? 'Speak a command. Say “Stop listening” or press the button to end.'
                  : 'Press start, then speak naturally — no wake word needed here.'}
            </p>
            <div className="mt-5">
              {unavailable ? (
                <Button size="xl" variant="danger" icon={RefreshCwIcon} onClick={retryMic}>
                  Retry microphone
                </Button>
              ) : listening ? (
                <Button size="xl" variant="secondary" icon={SquareIcon} onClick={toggle}>
                  Stop listening
                </Button>
              ) : (
                <Button size="xl" icon={MicIcon} onClick={toggle}>
                  Start Listening
                </Button>
              )}
            </div>
          </div>
        </div>

        <Waveform active={listening} bars={56} className="mt-8 h-20" />

        <div className="mt-6 rounded-3xl border border-line bg-ink/60 p-5">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-bold text-muted">Live transcript</p>
            <DemoTag label="Simulated input" />
          </div>
          <p className="mt-3 min-h-[2.5rem] font-display text-2xl font-medium text-fg" aria-live="off">
            {listening || chars > 0 ? (
              <>
                “{phrase.heard.slice(0, chars)}
                {listening && !complete && <span className="ml-0.5 inline-block h-6 w-0.5 animate-blink bg-cyan align-middle" aria-hidden="true" />}
                {complete && '”'}
              </>
            ) : (
              <span className="text-muted">Your words appear here.</span>
            )}
          </p>
          <div aria-live="polite" className="min-h-[2rem]">
            {complete &&
              (phrase.match ? (
                <p className="mt-3 inline-flex items-center gap-2 rounded-xl bg-lime/10 px-3 py-1.5 text-sm font-bold text-lime">
                  <CheckCircle2Icon className="h-4 w-4" aria-hidden="true" />
                  Matched “{phrase.match}” — {phrase.result}
                </p>
              ) : (
                <p className="mt-3 inline-flex flex-wrap items-center gap-2 rounded-xl bg-coral/10 px-3 py-1.5 text-sm font-bold text-coral">
                  <HelpCircleIcon className="h-4 w-4" aria-hidden="true" />
                  Didn’t catch that. Try “Click 3”, or say “Show targets” first.
                </p>
              ))}
          </div>
        </div>
      </div>
    </section>
  );
}
