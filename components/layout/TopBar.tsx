import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ChevronRightIcon, CrosshairIcon, MenuIcon, PauseIcon, PlayIcon } from 'lucide-react';
import { Button } from '../ui/Button';
import { Kbd } from '../ui/Kbd';
import { StatusBadge } from '../ui/StatusBadge';
import { Tooltip } from '../ui/Tooltip';
import { routeTitles } from '../../data/navigation';
import { useSession } from '../../contexts/SessionContext';
import { getSessionLabel, getSystemStatus } from '../../utils/status';
import { formatDuration } from '../../utils/time';

interface TopBarProps {
  onOpenNav: () => void;
}

export function TopBar({ onOpenNav }: TopBarProps) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const meta = routeTitles[pathname] ?? routeTitles['/'];
  const { status, elapsed, cameraState, micState, toggle, canStart } = useSession();
  const system = getSystemStatus(cameraState, micState);
  const session = getSessionLabel(status);
  const actionLabel = status === 'running' ? 'Pause' : status === 'paused' ? 'Resume' : 'Start';

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-ink/85 backdrop-blur-xl">
      <div className="flex h-[76px] items-center gap-3 px-4 sm:px-6 lg:px-10">
        <button
          type="button"
          onClick={onOpenNav}
          aria-label="Open navigation"
          className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-line bg-ink-2 text-fg transition-colors duration-150 hover:border-cyan/50 lg:hidden"
        >
          <MenuIcon className="h-5 w-5" aria-hidden="true" />
        </button>

        <div className="min-w-0 flex-1">
          <nav aria-label="Breadcrumb">
            <ol className="flex items-center gap-1 text-xs font-semibold text-muted">
              <li>
                <Link to="/" className="rounded transition-colors duration-150 hover:text-fg">
                  HANDSFREE
                </Link>
              </li>
              <li aria-hidden="true">
                <ChevronRightIcon className="h-3 w-3" />
              </li>
              <li aria-current="page">{meta.section}</li>
            </ol>
          </nav>
          <h1 className="truncate font-display text-lg font-semibold sm:text-xl">{meta.title}</h1>
        </div>

        <div className="hidden md:block">
          <StatusBadge tone={system.tone}>{system.label}</StatusBadge>
        </div>

        <div className="hidden items-center gap-2 rounded-full border border-line bg-ink-2 py-1 pl-1.5 pr-3 sm:flex">
          <span aria-live="polite">
            <StatusBadge tone={session.tone} size="sm">
              {session.label}
            </StatusBadge>
          </span>
          <span className="font-mono text-sm tabular-nums text-fg" aria-label="Session time">
            {formatDuration(elapsed)}
          </span>
        </div>

        <Button
          size="sm"
          variant={status === 'running' ? 'secondary' : 'primary'}
          icon={status === 'running' ? PauseIcon : PlayIcon}
          onClick={toggle}
          disabled={!canStart && status !== 'running'}
          aria-keyshortcuts="Alt+S"
        >
          {actionLabel}
          <Kbd onAccent={status !== 'running'} className="ml-1 hidden xl:inline-flex">
            Alt S
          </Kbd>
        </Button>

        <Tooltip content="Quick calibration · Alt C" side="bottom">
          <button
            type="button"
            onClick={() => navigate('/calibration')}
            aria-label="Quick calibration"
            aria-keyshortcuts="Alt+C"
            className="hidden h-10 w-10 place-items-center rounded-xl border border-line bg-ink-2 text-muted transition-colors duration-150 hover:border-cyan/50 hover:text-fg sm:grid"
          >
            <CrosshairIcon className="h-[18px] w-[18px]" aria-hidden="true" />
          </button>
        </Tooltip>

        <Link
          to="/settings"
          aria-label="Profile and settings for Avery Ruiz"
          className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-grad-cyan text-sm font-extrabold text-ink ring-2 ring-line transition-shadow duration-150 hover:ring-cyan"
        >
          AR
        </Link>
      </div>
    </header>
  );
}
