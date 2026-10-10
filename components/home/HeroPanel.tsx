import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRightIcon, CrosshairIcon, PlayIcon } from 'lucide-react';
import { Button } from '../ui/Button';
import { Kbd } from '../ui/Kbd';
import { useSession } from '../../contexts/SessionContext';

interface HeroPanelProps {
  className?: string;
}

export function HeroPanel({ className = '' }: HeroPanelProps) {
  const navigate = useNavigate();
  const { status, start, canStart } = useSession();
  const live = status !== 'idle';

  const startSession = () => {
    start();
    navigate('/live');
  };

  return (
    <section
      aria-labelledby="hero-heading"
      className={`luminous relative overflow-hidden rounded-4xl bg-ink-2 p-7 shadow-panel sm:p-10 xl:p-12 ${className}`}
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-grid opacity-70 [mask-image:radial-gradient(ellipse_at_85%_45%,black_10%,transparent_65%)]"
      />
      <div aria-hidden="true" className="absolute -right-10 top-1/2 h-[520px] w-[520px] -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(66,99,255,0.28),transparent_60%)]" />
      <div aria-hidden="true" className="absolute -right-24 top-1/2 hidden h-[400px] w-[400px] -translate-y-1/2 md:block">
        <div className="absolute inset-0 rounded-full border border-white/10" />
        <div className="absolute inset-[12%] rounded-full border border-white/10" />
        <div className="absolute inset-[24%] rounded-full border border-white/10" />
        <div className="absolute inset-[36%] rounded-full border border-white/10" />
      </div>

      <div className="relative max-w-[34rem]">
        <h2 id="hero-heading" className="font-display text-[40px] font-semibold leading-[1.04] tracking-tight sm:text-5xl xl:text-[54px]">
          <span className="block">Browse</span>
          <span className="block bg-grad-text bg-clip-text text-transparent">Beyond</span>
          <span className="block bg-grad-text bg-clip-text text-transparent">Boundaries.</span>
        </h2>
        <p className="mt-6 max-w-md text-lg leading-relaxed text-muted">
          Steer the web with small head movements, speak commands like “scroll down” or “click 2”, and select anything — no mouse or keyboard needed.
        </p>

        <div className="mt-9 flex flex-wrap gap-3">
          {live ? (
            <Button size="lg" icon={ArrowRightIcon} onClick={() => navigate('/live')}>
              Open Live Control
            </Button>
          ) : (
            <Button size="lg" icon={PlayIcon} onClick={startSession} disabled={!canStart}>
              Start Hands-Free Session
            </Button>
          )}
          <Button size="lg" variant="secondary" icon={CrosshairIcon} onClick={() => navigate('/calibration')}>
            Quick Calibration
          </Button>
        </div>

        <p className="mt-5 flex flex-wrap items-center gap-1.5 text-sm text-muted">
          Start or pause from any page with <Kbd>Alt</Kbd> + <Kbd>S</Kbd>
        </p>
      </div>
    </section>
  );
}
