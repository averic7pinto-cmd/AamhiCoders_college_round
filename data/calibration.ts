import type { Direction } from '../types/calibration';

export const calibrationSteps = [
  { id: 'permissions', label: 'Permissions', tip: 'HANDSFREE needs your camera to follow head movement and your microphone for voice commands. You can change this any time in Chrome.' },
  { id: 'position', label: 'Position', tip: 'Sit about an arm’s length from the screen with light in front of you, not behind.' },
  { id: 'calibrate', label: 'Calibrate', tip: 'Move slowly and only as far as feels comfortable. Small movements are enough — you can retry any direction.' },
  { id: 'sensitivity', label: 'Sensitivity', tip: 'Higher sensitivity means less head movement is needed. Start balanced and adjust after testing.' },
  { id: 'test', label: 'Test', tip: 'Rest the pointer on each target until its ring fills. Clicking also works while you test.' },
  { id: 'done', label: 'Complete', tip: 'You can recalibrate whenever posture or lighting changes — say “Recalibrate” or press Alt + C.' },
];

export const calibrationDirections: Array<{
  id: Direction;
  label: string;
  instruction: string;
  x: number;
  y: number;
}> = [
  { id: 'center', label: 'Center', instruction: 'Look straight at the screen', x: 50, y: 50 },
  { id: 'left', label: 'Left', instruction: 'Turn your head slightly left', x: 14, y: 50 },
  { id: 'right', label: 'Right', instruction: 'Turn your head slightly right', x: 86, y: 50 },
  { id: 'up', label: 'Up', instruction: 'Tilt your head slightly up', x: 50, y: 16 },
  { id: 'down', label: 'Down', instruction: 'Tilt your head slightly down', x: 50, y: 84 },
];

export const testTargets = ['Read more', 'Search', 'Next page', 'Play video', 'Subscribe', 'Open menu'];

export const positionChecklist = [
  'Face fully inside the oval',
  'About an arm’s length from the screen',
  'Light in front of you, not behind',
];
