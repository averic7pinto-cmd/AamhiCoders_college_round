import React, { useId } from 'react';

interface SliderProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  format?: (value: number) => string;
  description?: string;
  minLabel?: string;
  maxLabel?: string;
  disabled?: boolean;
}

export function Slider({
  label,
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  format = (v) => String(v),
  description,
  minLabel,
  maxLabel,
  disabled = false,
}: SliderProps) {
  const id = useId();
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="text-sm font-semibold text-fg">
          {label}
        </label>
        <output htmlFor={id} className="rounded-md bg-cyan/10 px-2 py-0.5 font-mono text-sm font-medium text-cyan">
          {format(value)}
        </output>
      </div>
      {description && <p className="mt-1 text-sm leading-relaxed text-muted">{description}</p>}
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={disabled}
        aria-valuetext={format(value)}
        onChange={(e) => onChange(Number(e.target.value))}
        className="hf-range mt-2"
        style={{ '--fill': `${pct}%` } as React.CSSProperties}
      />
      {(minLabel || maxLabel) && (
        <div className="mt-0.5 flex justify-between text-xs font-medium text-muted">
          <span>{minLabel}</span>
          <span>{maxLabel}</span>
        </div>
      )}
    </div>
  );
}
