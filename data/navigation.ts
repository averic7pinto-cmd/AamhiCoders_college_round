import {
  ActivityIcon,
  CrosshairIcon,
  HomeIcon,
  MicIcon,
  PuzzleIcon,
  ScanFaceIcon,
  SlidersHorizontalIcon,
  SwatchBookIcon,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
}

export const primaryNav: NavItem[] = [
  { to: '/', label: 'Home', icon: HomeIcon },
  { to: '/live', label: 'Live Control', icon: ScanFaceIcon },
  { to: '/calibration', label: 'Calibration', icon: CrosshairIcon },
  { to: '/voice', label: 'Voice Commands', icon: MicIcon },
  { to: '/settings', label: 'Settings', icon: SlidersHorizontalIcon },
  { to: '/performance', label: 'Performance', icon: ActivityIcon },
];

export const secondaryNav: NavItem[] = [
  { to: '/popup', label: 'Extension popup', icon: PuzzleIcon },
  { to: '/design-system', label: 'Design system', icon: SwatchBookIcon },
];

export const routeTitles: Record<string, { title: string; section: string }> = {
  '/': { title: 'Home', section: 'Dashboard' },
  '/live': { title: 'Live Control', section: 'Session' },
  '/calibration': { title: 'Calibration', section: 'Setup' },
  '/voice': { title: 'Voice Commands', section: 'Input' },
  '/settings': { title: 'Settings', section: 'Preferences' },
  '/performance': { title: 'Performance', section: 'Insights' },
  '/design-system': { title: 'Design System', section: 'Reference' },
};

export const keyboardShortcuts = [
  { keys: ['Alt', 'S'], action: 'Start or pause a session' },
  { keys: ['Alt', 'C'], action: 'Open calibration' },
  { keys: ['Alt', 'L'], action: 'Open Live Control' },
  { keys: ['Tab'], action: 'Move between controls' },
  { keys: ['Esc'], action: 'Close dialogs and menus' },
];
