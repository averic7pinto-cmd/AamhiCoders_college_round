/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './*.{ts,tsx}',
    './{components,pages,contexts,hooks,utils,data,types}/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: '#10131D',
          2: '#191E2B',
          3: '#20263A',
          4: '#2A3148',
        },
        line: '#2C3550',
        fg: '#F7F8FF',
        muted: '#A5ADC2',
        electric: { DEFAULT: '#4263FF', soft: '#8A9CFF' },
        cyan: { DEFAULT: '#31D7FF' },
        violet: { DEFAULT: '#9B5CFF', soft: '#BB91FF' },
        lime: { DEFAULT: '#C5FF4A' },
        coral: { DEFAULT: '#FF6B78' },
        amber: { DEFAULT: '#FFC24A' },
      },
      fontFamily: {
        display: ['Unbounded', 'Manrope', 'sans-serif'],
        sans: ['Manrope', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      borderRadius: {
        '4xl': '2rem',
      },
      boxShadow: {
        panel: 'inset 0 1px 0 0 rgba(255,255,255,0.04), 0 24px 48px -28px rgba(0,0,0,0.7)',
        'glow-blue': '0 0 0 1px rgba(66,99,255,0.55), 0 10px 32px -10px rgba(66,99,255,0.75)',
        'glow-violet': '0 0 0 1px rgba(155,92,255,0.6), 0 12px 36px -10px rgba(155,92,255,0.8)',
        'glow-cyan': '0 0 18px 0 rgba(49,215,255,0.55)',
        'glow-lime': '0 0 0 1px rgba(197,255,74,0.5), 0 8px 28px -10px rgba(197,255,74,0.6)',
        'glow-coral': '0 0 0 1px rgba(255,107,120,0.5), 0 8px 28px -10px rgba(255,107,120,0.6)',
      },
      backgroundImage: {
        'grad-primary': 'linear-gradient(135deg, #4263FF 0%, #9B5CFF 100%)',
        'grad-cyan': 'linear-gradient(135deg, #31D7FF 0%, #4263FF 100%)',
        'grad-lime': 'linear-gradient(135deg, #C5FF4A 0%, #31D7FF 100%)',
        'grad-text': 'linear-gradient(90deg, #31D7FF 0%, #6A86FF 45%, #B07BFF 100%)',
      },
      keyframes: {
        'pulse-ring': {
          '0%': { transform: 'scale(0.92)', opacity: '0.7' },
          '100%': { transform: 'scale(1.55)', opacity: '0' },
        },
        scan: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(300%)' },
        },
        blink: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0' },
        },
      },
      animation: {
        'pulse-ring': 'pulse-ring 2.2s cubic-bezier(0.23, 1, 0.32, 1) infinite',
        scan: 'scan 5s linear infinite',
        'spin-slow': 'spin 18s linear infinite',
        blink: 'blink 1s steps(1) infinite',
      },
    },
  },
  plugins: [],
};
