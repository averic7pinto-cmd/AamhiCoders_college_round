import type { InteractionMode } from '../types/session';

export const recentActivity: Array<{
  id: string;
  day: string;
  time: string;
  label: string;
  site: string;
  durationMin: number;
  commands: number;
  selections: number;
  mode: Exclude<InteractionMode, 'off'>;
  note?: string;
}> = [
  { id: 'a1', day: 'Today', time: '09:12', label: 'Morning news & email', site: 'news.example.com', durationMin: 32, commands: 184, selections: 61, mode: 'head-voice' },
  { id: 'a2', day: 'Yesterday', time: '19:40', label: 'Recipe research', site: 'cooking.example.org', durationMin: 18, commands: 96, selections: 30, mode: 'voice' },
  { id: 'a3', day: 'Yesterday', time: '11:05', label: 'Online banking review', site: 'bank.example.com', durationMin: 12, commands: 41, selections: 17, mode: 'head', note: '2 confirmations requested' },
  { id: 'a4', day: 'Oct 7', time: '15:22', label: 'Course reading', site: 'learn.example.edu', durationMin: 46, commands: 233, selections: 72, mode: 'head-voice' },
];

export const sessionHistory = [
  { id: 'S1', date: 'Oct 1', label: 'First guided session', durationMin: 14, commands: 62, selections: 19, accuracy: 84, accidental: 9 },
  { id: 'S2', date: 'Oct 2', label: 'Email triage', durationMin: 21, commands: 98, selections: 31, accuracy: 86, accidental: 8 },
  { id: 'S3', date: 'Oct 3', label: 'Shopping list research', durationMin: 17, commands: 104, selections: 36, accuracy: 88, accidental: 7 },
  { id: 'S4', date: 'Oct 4', label: 'News reading', durationMin: 29, commands: 141, selections: 44, accuracy: 89, accidental: 7 },
  { id: 'S5', date: 'Oct 6', label: 'Video browsing', durationMin: 24, commands: 126, selections: 41, accuracy: 90, accidental: 6 },
  { id: 'S6', date: 'Oct 7', label: 'Course reading', durationMin: 46, commands: 233, selections: 72, accuracy: 91, accidental: 6 },
  { id: 'S7', date: 'Oct 8', label: 'Online banking review', durationMin: 12, commands: 41, selections: 17, accuracy: 92, accidental: 4 },
  { id: 'S8', date: 'Oct 9', label: 'Recipe research', durationMin: 18, commands: 96, selections: 30, accuracy: 91, accidental: 5 },
];

export const commandHistory = [
  { id: 'c1', time: '10:42:18', phrase: 'Show targets', result: 'Numbered 18 targets', status: 'executed' as const },
  { id: 'c2', time: '10:42:24', phrase: 'Click 7', result: 'Opened “Accessibility guidelines”', status: 'executed' as const },
  { id: 'c3', time: '10:43:02', phrase: 'Scroll down', result: 'Scrolled one screen', status: 'executed' as const },
  { id: 'c4', time: '10:43:40', phrase: 'Close tab', result: 'Waiting for your confirmation', status: 'confirm' as const },
  { id: 'c5', time: '10:44:11', phrase: '“clack seven”', result: 'Not understood — try “Click 7”', status: 'missed' as const },
];

export const transcriptScript: Array<{ text: string; kind: 'command' | 'dictation' | 'unrecognized' }> = [
  { text: 'show targets', kind: 'command' },
  { text: 'click seven', kind: 'command' },
  { text: 'scroll down', kind: 'command' },
  { text: 'hmm, wait a second', kind: 'unrecognized' },
  { text: 'go back', kind: 'command' },
  { text: 'start dictation', kind: 'command' },
  { text: 'meet you at the library at four', kind: 'dictation' },
];
