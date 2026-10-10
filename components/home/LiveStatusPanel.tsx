import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRightIcon, CheckIcon, MinusIcon } from 'lucide-react';
import { Button } from '../ui/Button';
import { StatusBadge } from '../ui/StatusBadge';
import { SessionOrb } from '../session/SessionOrb';
import { DeviceReadiness } from '../session/DeviceReadiness';
import { useSession } from '../../contexts/SessionContext';
import { getSessionLabel } from '../../utils/status';

interface LiveStatusPanelProps {
  className?: string;
}

export function LiveStatusPanel({ className = '' }: LiveStatusPanelProps) {
  const navigate = useNavigate();
  const { status, elapsed, headTracking, voiceEnabled } = useSession();
  const session = getSessionLabel(status);
  const caption =
    status === 'running' ? 'Tracking and listening' : status === 'paused' ? 'On hold — nothing is tracked' : 'Ready when you are';

  const modes = [
    { label: 'Head tracking', on: headTracking },
    { label: 'Voice commands', on: voiceEnabled },
  ];

  return (
    <section
      aria-labelledby="live-status-heading"
      className={`flex flex-col rounded-4xl border border-line bg-ink-2 p-6 shadow-panel lg:p-8 ${className}`}
    >
      <div className="flex items-center justify-between gap-3">
        <h2 id="live-status-heading" className="font-display text-base font-semibold">
          Live session
        </h2>
        <StatusBadge tone={session.tone}>{session.label}</StatusBadge>
      </div>

      <div className="mt-6 flex flex-col items-center gap-6 sm:flex-row">
        <SessionOrb status={status} elapsed={elapsed} />
        <div className="w-full flex-1">
          <p className="text-lg font-bold text-fg">{caption}</p>
          <dl className="mt-4 grid grid-cols-2 gap-2.5">
            {modes.map((m) => (
              <div key={m.label} className="rounded-xl bg-ink-3 px-3 py-2.5">
                <dt className="text-xs font-semibold text-muted">{m.label}</dt>
                <dd className={`mt-0.5 flex items-center gap-1 text-sm font-bold ${m.on ? 'text-cyan' : 'text-muted'}`}>
                  {m.on ? <CheckIcon className="h-4 w-4" aria-hidden="true" /> : <MinusIcon className="h-4 w-4" aria-hidden="true" />}
                  {m.on ? 'On' : 'Off'}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      <div className="mt-6">
        <DeviceReadiness />
      </div>

      <div className="mt-auto pt-6">
        <Button variant="secondary" fullWidth iconRight={ArrowRightIcon} onClick={() => navigate('/live')}>
          Open Live Control
        </Button>
      </div>
    </section>
  );
}
