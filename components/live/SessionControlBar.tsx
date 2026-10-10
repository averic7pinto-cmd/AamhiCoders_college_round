import React from 'react';
import { PauseIcon, PlayIcon, SquareIcon } from 'lucide-react';
import { Button } from '../ui/Button';
import { Toggle } from '../ui/Toggle';
import { useSession } from '../../contexts/SessionContext';
import { formatDuration } from '../../utils/time';

export function SessionControlBar() {
  const { status, elapsed, start, pause, stop, canStart, headTracking, voiceEnabled, setHeadTracking, setVoiceEnabled } = useSession();

  return (
    <section aria-label="Session controls" className="flex flex-wrap items-center gap-x-6 gap-y-4 rounded-3xl border border-line bg-ink-2 p-4 shadow-panel sm:p-5">
      <div className="flex gap-3">
        {status === 'running' ? (
          <Button size="lg" variant="secondary" icon={PauseIcon} onClick={pause} aria-keyshortcuts="Alt+S">
            Pause
          </Button>
        ) : (
          <Button size="lg" icon={PlayIcon} onClick={start} disabled={!canStart} aria-keyshortcuts="Alt+S">
            {status === 'paused' ? 'Resume' : 'Start'}
          </Button>
        )}
        <Button size="lg" variant="danger" icon={SquareIcon} onClick={stop} disabled={status === 'idle'}>
          Stop
        </Button>
      </div>

      <div className="hidden h-10 w-px bg-line md:block" aria-hidden="true" />

      <div className="flex flex-wrap gap-x-8 gap-y-3">
        <Toggle label="Head tracking" checked={headTracking} onChange={setHeadTracking} />
        <Toggle label="Voice commands" checked={voiceEnabled} onChange={setVoiceEnabled} />
      </div>

      <div className="ml-auto text-right">
        <p className="text-xs font-semibold text-muted">Session time</p>
        <p className="font-mono text-2xl font-semibold tabular-nums text-fg">{formatDuration(elapsed)}</p>
      </div>
    </section>
  );
}
