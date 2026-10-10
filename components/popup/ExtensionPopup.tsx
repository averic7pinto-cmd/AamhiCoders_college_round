import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CrosshairIcon, ExternalLinkIcon, LockIcon, PauseIcon, PlayIcon } from 'lucide-react';
import { StatusBadge } from '../ui/StatusBadge';
import { SegmentedControl } from '../ui/SegmentedControl';
import { Button } from '../ui/Button';
import { DeviceReadiness } from '../session/DeviceReadiness';
import { useSession } from '../../contexts/SessionContext';
import { getSessionLabel, getSystemStatus } from '../../utils/status';
import { formatDuration } from '../../utils/time';

export function ExtensionPopup() {
  const navigate = useNavigate();
  const { status, elapsed, toggle, canStart, mode, setMode, cameraState, micState } = useSession();
  const session = getSessionLabel(status);
  const system = getSystemStatus(cameraState, micState);
  const running = status === 'running';

  return (
    <div role="dialog" aria-label="HANDSFREE extension" className="luminous relative w-[360px] max-w-full overflow-hidden rounded-3xl bg-ink-2 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.85)]">
      <header className="flex items-center justify-between gap-3 px-5 pt-5">
        <div className="flex items-center gap-2" aria-label="HANDSFREE">
          <span className="grid h-8 w-8 place-items-center rounded-xl bg-grad-primary text-white">
            <CrosshairIcon className="h-5 w-5" aria-hidden="true" />
          </span>
          <span className="text-sm font-extrabold tracking-wide text-white">HANDSFREE</span>
        </div>
        <StatusBadge tone={session.tone} size="sm">
          {session.label}
        </StatusBadge>
      </header>

      <div className="px-5 pt-3">
        <StatusBadge tone={system.tone} size="sm">
          {system.label}
        </StatusBadge>
      </div>

      <div className="px-5 pt-4">
        <button
          type="button"
          onClick={toggle}
          disabled={!canStart && !running}
          aria-keyshortcuts="Alt+S"
          className={`flex h-20 w-full items-center gap-4 rounded-2xl px-4 text-left transition-[filter,box-shadow,transform] duration-150 ease-out active:scale-[0.98] disabled:opacity-40 ${
            running ? 'border border-line bg-ink-3 hover:border-amber/60' : 'bg-grad-primary shadow-glow-blue hover:shadow-glow-violet hover:brightness-110'
          }`}
        >
          <span className={`grid h-12 w-12 shrink-0 place-items-center rounded-full ${running ? 'bg-amber text-ink' : 'bg-white text-electric'}`}>
            {running ? <PauseIcon className="h-6 w-6" aria-hidden="true" /> : <PlayIcon className="ml-0.5 h-6 w-6" aria-hidden="true" />}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-base font-extrabold text-white">
              {running ? 'Pause session' : status === 'paused' ? 'Resume session' : 'Start session'}
            </span>
            <span className={`block text-xs font-semibold ${running ? 'text-muted' : 'text-white/80'}`}>
              {status === 'idle' ? 'Alt + S from any tab' : `${formatDuration(elapsed)} elapsed`}
            </span>
          </span>
        </button>
      </div>

      <div className="px-5 pt-4">
        <DeviceReadiness showDetail={false} />
      </div>

      <div className="px-5 pt-4">
        <p className="mb-2 text-xs font-bold text-muted">Interaction mode</p>
        <SegmentedControl
          label="Interaction mode"
          size="sm"
          fullWidth
          value={mode === 'off' ? null : mode}
          onChange={setMode}
          options={[
            { value: 'head-voice', label: 'Head + Voice' },
            { value: 'head', label: 'Head' },
            { value: 'voice', label: 'Voice' },
          ]}
        />
      </div>

      <div className="grid grid-cols-2 gap-2 px-5 pt-4">
        <Button variant="secondary" icon={CrosshairIcon} onClick={() => navigate('/calibration')}>
          Calibrate
        </Button>
        <Button variant="secondary" icon={ExternalLinkIcon} onClick={() => navigate('/')}>
          Dashboard
        </Button>
      </div>

      <p className="mt-4 flex items-center gap-2 border-t border-line px-5 py-3 text-[11px] font-semibold text-muted">
        <LockIcon className="h-3 w-3" aria-hidden="true" />
        Camera frames stay on this device
      </p>
    </div>
  );
}
