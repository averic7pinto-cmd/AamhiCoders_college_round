export const colorTokens = [
  { name: 'ink', hex: '#10131D', role: 'App background', swatch: 'bg-ink' },
  { name: 'ink-2', hex: '#191E2B', role: 'Elevated surface', swatch: 'bg-ink-2' },
  { name: 'ink-3', hex: '#20263A', role: 'Inset / control fill', swatch: 'bg-ink-3' },
  { name: 'line', hex: '#2C3550', role: 'Borders & dividers', swatch: 'bg-line' },
  { name: 'electric', hex: '#4263FF', role: 'Primary action', swatch: 'bg-electric' },
  { name: 'cyan', hex: '#31D7FF', role: 'Focus, data, live', swatch: 'bg-cyan' },
  { name: 'violet', hex: '#9B5CFF', role: 'Voice, secondary accent', swatch: 'bg-violet' },
  { name: 'lime', hex: '#C5FF4A', role: 'Success, tracking point', swatch: 'bg-lime' },
  { name: 'coral', hex: '#FF6B78', role: 'Errors, destructive', swatch: 'bg-coral' },
  { name: 'amber', hex: '#FFC24A', role: 'Warnings, sample data', swatch: 'bg-amber' },
  { name: 'fg', hex: '#F7F8FF', role: 'Primary text', swatch: 'bg-fg' },
  { name: 'muted', hex: '#A5ADC2', role: 'Secondary text', swatch: 'bg-muted' },
];

export const typeScale = [
  { name: 'Display', className: 'font-display text-5xl font-semibold', spec: 'Unbounded 600 · 48/52', sample: 'Browse Beyond' },
  { name: 'Heading 1', className: 'font-display text-2xl font-semibold', spec: 'Unbounded 600 · 24/32', sample: 'Live Control' },
  { name: 'Heading 2', className: 'font-display text-lg font-semibold', spec: 'Unbounded 600 · 18/28', sample: 'Tracking confidence' },
  { name: 'Body large', className: 'text-lg', spec: 'Manrope 400 · 18/28', sample: 'Steer the web with small head movements.' },
  { name: 'Body', className: 'text-base', spec: 'Manrope 400 · 16/24', sample: 'Say “Show targets” to number every link.' },
  { name: 'Label', className: 'text-sm font-semibold', spec: 'Manrope 600 · 14/20', sample: 'Cursor sensitivity' },
  { name: 'Data', className: 'font-mono text-sm', spec: 'JetBrains Mono 500 · 14/20', sample: '00:24:18 · 94%' },
];

export const spacingScale = [4, 8, 12, 16, 24, 32, 48];

export const radiusScale = [
  { name: 'lg', value: '8px', className: 'rounded-lg' },
  { name: 'xl', value: '12px', className: 'rounded-xl' },
  { name: '2xl', value: '16px', className: 'rounded-2xl' },
  { name: '3xl', value: '24px', className: 'rounded-3xl' },
  { name: '4xl', value: '32px', className: 'rounded-4xl' },
  { name: 'full', value: '999px', className: 'rounded-full' },
];

export const glowTokens = [
  { name: 'glow-blue', className: 'shadow-glow-blue', use: 'Primary buttons, active nav' },
  { name: 'glow-violet', className: 'shadow-glow-violet', use: 'Primary hover, voice' },
  { name: 'glow-lime', className: 'shadow-glow-lime', use: 'Success moments' },
  { name: 'glow-coral', className: 'shadow-glow-coral', use: 'Error emphasis' },
  { name: 'panel', className: 'shadow-panel', use: 'Elevated surfaces' },
];
