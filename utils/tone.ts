import type { AccentTone } from '../types/ui';

export const accentTile: Record<AccentTone, string> = {
  electric: 'bg-electric/15 text-electric-soft ring-1 ring-inset ring-electric/40',
  cyan: 'bg-cyan/10 text-cyan ring-1 ring-inset ring-cyan/30',
  violet: 'bg-violet/15 text-violet-soft ring-1 ring-inset ring-violet/40',
  lime: 'bg-lime/10 text-lime ring-1 ring-inset ring-lime/30',
  coral: 'bg-coral/10 text-coral ring-1 ring-inset ring-coral/30',
  amber: 'bg-amber/10 text-amber ring-1 ring-inset ring-amber/30',
};

export const accentText: Record<AccentTone, string> = {
  electric: 'text-electric-soft',
  cyan: 'text-cyan',
  violet: 'text-violet-soft',
  lime: 'text-lime',
  coral: 'text-coral',
  amber: 'text-amber',
};
