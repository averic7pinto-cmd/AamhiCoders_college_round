import React from 'react';

interface KbdProps {
  children: React.ReactNode;
  onAccent?: boolean;
  className?: string;
}

export function Kbd({ children, onAccent = false, className = '' }: KbdProps) {
  return (
    <kbd
      className={`inline-flex h-6 min-w-6 items-center justify-center rounded-md border px-1.5 font-mono text-[11px] font-semibold ${
        onAccent ? 'border-white/25 bg-white/15 text-white' : 'border-line bg-ink-3 text-fg/90 shadow-[0_1px_0_0_#2C3550]'
      } ${className}`}
    >
      {children}
    </kbd>
  );
}
