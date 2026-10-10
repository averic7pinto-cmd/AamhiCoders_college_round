import React from 'react';
import { FlaskConicalIcon } from 'lucide-react';

interface DemoTagProps {
  label?: string;
}

export function DemoTag({ label = 'Sample data' }: DemoTagProps) {
  return (
    <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border border-amber/40 bg-amber/10 px-2.5 py-1 text-[11px] font-bold text-amber">
      <FlaskConicalIcon className="h-3 w-3" aria-hidden="true" />
      {label}
    </span>
  );
}
