import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LifeBuoyIcon, PlugZapIcon, SettingsIcon } from 'lucide-react';
import { Tooltip } from '../ui/Tooltip';
import { DeviceReadiness } from '../session/DeviceReadiness';
import { HelpModal } from './HelpModal';
import { primaryNav, secondaryNav } from '../../data/navigation';
import { useSession } from '../../contexts/SessionContext';

function Logo() {
  return (
    <span className="flex items-center gap-2 text-sm font-extrabold tracking-wide text-fg">
      <span className="grid h-8 w-8 place-items-center rounded-xl bg-grad-primary text-white" aria-hidden="true">
        H
      </span>
      HANDSFREE
    </span>
  );
}

interface SidebarProps {
  idPrefix: string;
  onNavigate?: () => void;
}

export function Sidebar({ idPrefix, onNavigate }: SidebarProps) {
  const { status } = useSession();
  const [helpOpen, setHelpOpen] = useState(false);

  return (
    <div className="flex h-full w-full flex-col overflow-y-auto border-r border-line bg-ink-2 px-4 py-6">
      <Link to="/" onClick={onNavigate} aria-label="HANDSFREE home" className="self-start rounded-xl px-2">
        <Logo />
      </Link>

      <nav aria-label="Primary" className="mt-10">
        <p className="px-3 text-xs font-bold text-muted">Workspace</p>
        <ul className="mt-3 space-y-1">
          {primaryNav.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                end={item.to === '/'}
                onClick={onNavigate}
                className={({ isActive }) =>
                  `group relative flex h-12 items-center gap-3 rounded-xl px-3 text-sm font-bold transition-colors duration-150 ease-out ${
                    isActive ? 'bg-electric/15 text-fg' : 'text-muted hover:bg-white/[0.04] hover:text-fg'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <motion.span
                        layoutId={`${idPrefix}-nav-indicator`}
                        className="absolute -left-4 bottom-2 top-2 w-1 rounded-r-full bg-gradient-to-b from-cyan to-violet shadow-glow-cyan"
                        transition={{ type: 'spring', duration: 0.35, bounce: 0.15 }}
                      />
                    )}
                    <span
                      className={`grid h-8 w-8 place-items-center rounded-lg transition-colors duration-150 ${
                        isActive ? 'bg-grad-primary text-white shadow-glow-blue' : 'bg-ink-3 text-muted group-hover:text-fg'
                      }`}
                    >
                      <item.icon className="h-4 w-4" aria-hidden="true" />
                    </span>
                    <span className="flex-1">{item.label}</span>
                    {item.to === '/live' && status === 'running' && (
                      <span className="flex items-center gap-1.5 rounded-full bg-lime/10 px-2 py-0.5 text-[11px] font-bold text-lime">
                        <span className="h-1.5 w-1.5 rounded-full bg-lime" aria-hidden="true" />
                        Live
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>

        <p className="mt-8 px-3 text-xs font-bold text-muted">Extension</p>
        <ul className="mt-3 space-y-1">
          {secondaryNav.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                onClick={onNavigate}
                className={({ isActive }) =>
                  `flex h-11 items-center gap-3 rounded-xl px-3 text-sm font-semibold transition-colors duration-150 ${
                    isActive ? 'bg-white/[0.06] text-fg' : 'text-muted hover:bg-white/[0.04] hover:text-fg'
                  }`
                }
              >
                <item.icon className="ml-2 h-4 w-4" aria-hidden="true" />
                <span className="ml-1">{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="mt-auto space-y-3 pt-8">
        <div className="rounded-2xl border border-line bg-ink-3/60 p-4">
          <p className="text-xs font-bold text-muted">Connection</p>
          <DeviceReadiness variant="compact" />
          <p className="mt-3 flex items-center gap-2 border-t border-line pt-3 text-xs font-medium text-muted">
            <PlugZapIcon className="h-3.5 w-3.5 text-lime" aria-hidden="true" />
            Linked to the active tab
          </p>
        </div>

        <div className="flex items-center gap-3 rounded-2xl p-2">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-grad-cyan text-sm font-extrabold text-ink" aria-hidden="true">
            AR
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold text-fg">Avery Ruiz</p>
            <p className="truncate text-xs text-muted">Personal profile</p>
          </div>
          <Tooltip content="Help & shortcuts">
            <button
              type="button"
              onClick={() => setHelpOpen(true)}
              aria-label="Help and shortcuts"
              className="grid h-10 w-10 place-items-center rounded-xl text-muted transition-colors duration-150 hover:bg-white/[0.06] hover:text-fg"
            >
              <LifeBuoyIcon className="h-5 w-5" aria-hidden="true" />
            </button>
          </Tooltip>
          <Tooltip content="Settings">
            <Link
              to="/settings"
              onClick={onNavigate}
              aria-label="Profile settings"
              className="grid h-10 w-10 place-items-center rounded-xl text-muted transition-colors duration-150 hover:bg-white/[0.06] hover:text-fg"
            >
              <SettingsIcon className="h-5 w-5" aria-hidden="true" />
            </Link>
          </Tooltip>
        </div>
      </div>

      <HelpModal open={helpOpen} onClose={() => setHelpOpen(false)} />
    </div>
  );
}
