import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { MousePointer2Icon } from 'lucide-react';

interface PointerMinimapProps {
  active: boolean;
}

export function PointerMinimap({ active }: PointerMinimapProps) {
  const reduce = useReducedMotion();
  const moving = active && !reduce;

  return (
    <div className="glass w-48 rounded-2xl border border-line/80 p-3">
      <p className="flex items-center justify-between text-[11px] font-bold text-muted">
        <span>Pointer on page</span>
        <span className={active ? 'text-lime' : 'text-muted'}>{active ? 'Following' : 'Idle'}</span>
      </p>
      <div className="relative mt-2 h-24 overflow-hidden rounded-lg border border-line bg-ink/80 p-2" aria-hidden="true">
        <div className="h-1.5 w-1/2 rounded-full bg-line" />
        <div className="mt-2 h-1.5 w-4/5 rounded-full bg-line/70" />
        <div className="mt-1.5 h-1.5 w-3/5 rounded-full bg-line/70" />
        <div className="mt-3 flex gap-1.5">
          <div className="h-6 flex-1 rounded bg-electric/25" />
          <div className="h-6 flex-1 rounded bg-violet/20" />
          <div className="h-6 flex-1 rounded bg-line/70" />
        </div>
        <motion.span
          className="absolute"
          initial={false}
          animate={moving ? { left: ['48%', '64%', '30%', '55%', '48%'], top: ['40%', '30%', '58%', '46%', '40%'] } : { left: '48%', top: '40%' }}
          transition={moving ? { duration: 9, repeat: Infinity, ease: 'easeInOut' } : { duration: 0.3 }}
        >
          <MousePointer2Icon
            className={`h-4 w-4 ${active ? 'fill-lime text-lime drop-shadow-[0_0_6px_rgba(197,255,74,0.8)]' : 'fill-muted text-muted'}`}
          />
        </motion.span>
      </div>
    </div>
  );
}
