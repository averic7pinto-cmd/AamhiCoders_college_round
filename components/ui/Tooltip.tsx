import React, { useId } from 'react';

interface TooltipProps {
  content: string;
  children: React.ReactElement;
  side?: 'top' | 'bottom' | 'right';
}

const positions = {
  top: 'bottom-full left-1/2 mb-2 -translate-x-1/2',
  bottom: 'top-full left-1/2 mt-2 -translate-x-1/2',
  right: 'left-full top-1/2 ml-2 -translate-y-1/2',
};

export function Tooltip({ content, children, side = 'top' }: TooltipProps) {
  const id = useId();
  return (
    <span className="group/tt relative inline-flex">
      {React.cloneElement(children as React.ReactElement<Record<string, unknown>>, { 'aria-describedby': id })}
      <span
        role="tooltip"
        id={id}
        className={`pointer-events-none absolute z-50 ${positions[side]} scale-[0.96] whitespace-nowrap rounded-lg border border-line bg-ink-4 px-2.5 py-1.5 text-xs font-semibold text-fg opacity-0 shadow-panel transition-[opacity,transform] duration-150 ease-out group-focus-within/tt:scale-100 group-focus-within/tt:opacity-100 group-hover/tt:scale-100 group-hover/tt:opacity-100`}
      >
        {content}
      </span>
    </span>
  );
}
