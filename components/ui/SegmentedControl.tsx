import React, { useId } from "react";
import { motion } from "framer-motion";
import { BoxIcon } from "lucide-react";
interface SegmentOption<T extends string> {
  value: T;
  label: string;
  icon?: typeof BoxIcon;
}
interface SegmentedControlProps<T extends string> {
  options: SegmentOption<T>[];
  value: T | null;
  onChange: (value: T) => void;
  label: string;
  size?: 'sm' | 'md';
  fullWidth?: boolean;
}
export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  label,
  size = 'md',
  fullWidth = false
}: SegmentedControlProps<T>) {
  const layoutId = useId();
  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (!['ArrowRight', 'ArrowLeft', 'ArrowDown', 'ArrowUp'].includes(e.key)) return;
    e.preventDefault();
    const idx = Math.max(0, options.findIndex(o => o.value === value));
    const dir = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : -1;
    const next = options[(idx + dir + options.length) % options.length];
    onChange(next.value);
    const btn = e.currentTarget.querySelector<HTMLButtonElement>(`[data-value="${next.value}"]`);
    btn?.focus();
  };
  return <div role="radiogroup" aria-label={label} onKeyDown={onKeyDown} className={`${fullWidth ? 'flex w-full' : 'inline-flex'} gap-1 rounded-xl border border-line bg-ink p-1`}>
      {options.map(o => {
      const active = o.value === value;
      const Icon = o.icon;
      return <button key={o.value} type="button" role="radio" aria-checked={active} tabIndex={active || value === null && o === options[0] ? 0 : -1} data-value={o.value} onClick={() => onChange(o.value)} className={`relative flex items-center justify-center whitespace-nowrap rounded-lg font-bold transition-colors duration-150 ease-out ${size === 'sm' ? 'h-9 px-3 text-xs' : 'h-10 px-4 text-sm'} ${fullWidth ? 'flex-1' : ''} ${active ? 'text-white' : 'text-muted hover:text-fg'}`}>
            {active && <motion.span layoutId={layoutId} className="absolute inset-0 rounded-lg bg-grad-primary shadow-glow-blue" transition={{
          type: 'spring',
          duration: 0.3,
          bounce: 0.12
        }} />}
            <span className="relative flex items-center gap-1.5">
              {Icon && <Icon className="h-4 w-4" aria-hidden="true" />}
              {o.label}
            </span>
          </button>;
    })}
    </div>;
}