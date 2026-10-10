import React from 'react';
import { PauseIcon, PlayIcon, ScanFaceIcon } from 'lucide-react';
import type { SessionStatus } from '../../types/session';
import { formatDuration } from '../../utils/time';

interface SessionOrbProps {
  status: SessionStatus;
  elapsed: number;
}

export function SessionOrb({ status, elapsed }: SessionOrbProps) {
  const Icon = status === 'running' ? ScanFaceIcon : status === 'paused' ? PauseIcon : PlayIcon;
  const ring = status === 'running' ? 'bg-grad-primary' : status === 'paused' ? 'bg-amber/70' : 'bg-line';
  const iconColor = status === 'running' ? 'text-lime' : status === 'paused' ? 'text-amber' : 'text-muted';

  return (
    <div className="relative grid h-40 w-40 shrink-0 place-items-center">
      {status === 'running' && (
        <>
          <span className="absolute inset-0 animate-pulse-ring rounded-full border-2 border-cyan/50" aria-hidden="true" />
          <span className="absolute inset-0 animate-pulse-ring rounded-full border-2 border-violet/40 [animation-delay:1.1s]" aria-hidden="true" />
        </>
      )}
      <span className={`absolute inset-0 rounded-full p-[3px] ${ring} ${status === 'running' ? 'shadow-glow-blue' : ''}`} aria-hidden="true">
        <span className="block h-full w-full rounded-full bg-ink-2" />
      </span>
      <span className="absolute inset-3 rounded-full border border-dashed border-line" aria-hidden="true" />
      <div className="relative text-center">
        <Icon className={`mx-auto h-6 w-6 ${iconColor}`} aria-hidden="true" />
        <p className="mt-1.5 font-mono text-2xl font-semibold tabular-nums text-fg">{formatDuration(elapsed)}</p>
        <p className="text-xs font-semibold text-muted">session time</p>
      </div>
    </div>
  );
}
