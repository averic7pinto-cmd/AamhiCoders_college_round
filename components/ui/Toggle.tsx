import React, { useId } from 'react';
import { CheckIcon, XIcon } from 'lucide-react';

interface ToggleProps {
  checked: boolean;
  onChange: (value: boolean) => void;
  label: string;
  description?: string;
  disabled?: boolean;
  hideLabel?: boolean;
}

export function Toggle({ checked, onChange, label, description, disabled = false, hideLabel = false }: ToggleProps) {
  const id = useId();
  const descId = `${id}-desc`;
  return (
    <div className="flex items-center justify-between gap-5">
      {!hideLabel && (
        <div className="min-w-0">
          <label htmlFor={id} className="cursor-pointer text-sm font-semibold text-fg">
            {label}
          </label>
          {description && (
            <p id={descId} className="mt-1 text-sm leading-relaxed text-muted">
              {description}
            </p>
          )}
        </div>
      )}
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={hideLabel ? label : undefined}
        aria-describedby={description && !hideLabel ? descId : undefined}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={`relative h-8 w-14 shrink-0 rounded-full border transition-[background-color,border-color,box-shadow] duration-200 ease-out disabled:cursor-not-allowed disabled:opacity-40 ${
          checked ? 'border-transparent bg-grad-primary shadow-glow-blue' : 'border-line bg-ink-4 hover:border-muted/60'
        }`}
      >
        <span
          className={`absolute left-1 top-1/2 grid h-6 w-6 -translate-y-1/2 place-items-center rounded-full bg-fg transition-transform duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] ${
            checked ? 'translate-x-6' : 'translate-x-0'
          }`}
        >
          {checked ? (
            <CheckIcon className="h-3.5 w-3.5 text-electric" strokeWidth={3} aria-hidden="true" />
          ) : (
            <XIcon className="h-3 w-3 text-ink-4" strokeWidth={3} aria-hidden="true" />
          )}
        </span>
      </button>
    </div>
  );
}
