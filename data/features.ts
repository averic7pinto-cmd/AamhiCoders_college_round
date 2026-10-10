export const features = [
  {
    id: 'head',
    title: 'Head Tracking',
    description: 'Small, comfortable head movements steer the pointer. Smoothing filters out tremor and fatigue drift.',
    cta: 'Tune tracking',
    to: '/calibration',
  },
  {
    id: 'voice',
    title: 'Voice Navigation',
    description: 'Speak natural commands to scroll, go back, switch tabs, or dictate text you review first.',
    cta: 'Browse commands',
    to: '/voice',
  },
  {
    id: 'select',
    title: 'Smart Selection',
    description: 'Say “Show targets” to number every link, then pick one by voice or by dwelling.',
    cta: 'Selection settings',
    to: '/settings',
  },
] as const;
