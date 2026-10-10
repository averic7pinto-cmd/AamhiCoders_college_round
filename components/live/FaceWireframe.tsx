import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

interface FaceWireframeProps {
  state: 'idle' | 'tracking' | 'lost';
  showFrame?: boolean;
}

const landmarks: Array<[number, number]> = [
  [290, 160], [350, 160], [292, 178], [348, 178], [320, 190], [300, 242], [320, 248], [340, 242], [320, 280], [262, 205], [378, 205],
];

export function FaceWireframe({ state, showFrame = true }: FaceWireframeProps) {
  const reduce = useReducedMotion();
  const tracking = state === 'tracking';
  const lost = state === 'lost';
  const stroke = lost ? '#FF6B78' : '#31D7FF';
  const moving = tracking && !reduce;

  return (
    <svg viewBox="0 0 640 400" preserveAspectRatio="xMidYMid meet" className="absolute inset-0 h-full w-full" aria-hidden="true">
      <defs>
        <radialGradient id="face-fill" cx="50%" cy="45%" r="60%">
          <stop offset="0%" stopColor={stroke} stopOpacity=".16" />
          <stop offset="100%" stopColor={stroke} stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Center reference (calibration point) */}
      <g>
        <circle cx="320" cy="212" r="24" fill="none" stroke="#F7F8FF" strokeOpacity=".35" strokeDasharray="4 5" />
        <path d="M320 180v14M320 230v14M288 212h14M338 212h14" stroke="#F7F8FF" strokeOpacity=".55" strokeWidth="1.5" />
      </g>

      <motion.g
        initial={false}
        animate={moving ? { x: [0, 16, -12, 6, 0], y: [0, -6, 5, -2, 0] } : { x: lost ? 180 : 0, y: lost ? 24 : 0 }}
        transition={moving ? { duration: 9, repeat: Infinity, ease: 'easeInOut' } : { duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
        style={{ opacity: lost ? 0.45 : tracking ? 1 : 0.55 }}
      >
        <path d="M150 400 C168 340 236 312 320 312 C404 312 472 340 490 400" fill="url(#face-fill)" stroke={stroke} strokeOpacity=".4" strokeWidth="1.5" />
        <path d="M296 278 L298 312 M344 278 L342 312" stroke={stroke} strokeOpacity=".4" strokeWidth="1.5" />
        <ellipse cx="320" cy="188" rx="74" ry="96" fill="url(#face-fill)" stroke={stroke} strokeOpacity=".7" strokeWidth="1.8" />
        <g stroke={stroke} strokeOpacity=".22" fill="none" strokeWidth="1">
          <path d="M320 92 V284" />
          <path d="M250 150 Q320 165 390 150" />
          <path d="M247 196 Q320 213 393 196" />
          <path d="M256 240 Q320 256 384 240" />
          <path d="M276 112 Q262 188 284 270" />
          <path d="M364 112 Q378 188 356 270" />
        </g>
        <path d="M292 178 L320 212 L348 178 M300 242 Q320 254 340 242" stroke={stroke} strokeOpacity=".5" fill="none" strokeWidth="1.2" />
        {landmarks.map(([x, y]) => (
          <circle key={`${x}-${y}`} cx={x} cy={y} r="3" fill={stroke} fillOpacity={tracking ? 0.95 : 0.5} />
        ))}

        {/* Nose-tip tracking point */}
        {tracking && (
          <g>
            <circle cx="320" cy="212" r="16" fill="none" stroke="#C5FF4A" strokeOpacity=".35" strokeWidth="2" />
            <circle cx="320" cy="212" r="6" fill="#C5FF4A" />
          </g>
        )}
        {!tracking && <circle cx="320" cy="212" r="4" fill={stroke} fillOpacity=".6" />}

        {/* Face lock frame */}
        {tracking && showFrame && (
          <path
            d="M236 104 V82 H258 M382 82 H404 V104 M404 278 V300 H382 M258 300 H236 V278"
            stroke="#4263FF"
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
          />
        )}
      </motion.g>

      {lost && (
        <rect x="236" y="82" width="168" height="218" rx="20" fill="none" stroke="#FF6B78" strokeWidth="2" strokeDasharray="8 8" />
      )}
    </svg>
  );
}
