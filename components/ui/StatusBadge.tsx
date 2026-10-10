import React from "react";
import { AlertTriangleIcon, CheckCircle2Icon, InfoIcon, XCircleIcon, BoxIcon } from "lucide-react";
import { StatusTone } from "../../types/ui";
interface StatusBadgeProps {
  tone: StatusTone;
  children: React.ReactNode;
  size?: 'sm' | 'md';
}
const styles: Record<StatusTone, string> = {
  success: 'border-lime/30 bg-lime/10 text-lime',
  warning: 'border-amber/35 bg-amber/10 text-amber',
  error: 'border-coral/40 bg-coral/10 text-coral',
  info: 'border-cyan/30 bg-cyan/10 text-cyan',
  neutral: 'border-line bg-ink-3 text-muted',
  live: 'border-lime/40 bg-lime/10 text-lime'
};
const icons: Partial<Record<StatusTone, typeof BoxIcon>> = {
  success: CheckCircle2Icon,
  warning: AlertTriangleIcon,
  error: XCircleIcon,
  info: InfoIcon
};
export function StatusBadge({
  tone,
  children,
  size = 'md'
}: StatusBadgeProps) {
  const Icon = icons[tone];
  return <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border font-bold ${styles[tone]} ${size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-3 py-1 text-xs'}`}>
      {tone === 'live' ? <span className="relative flex h-2 w-2" aria-hidden="true">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-lime opacity-60" />
          <span className="relative h-2 w-2 rounded-full bg-lime" />
        </span> : Icon ? <Icon className={size === 'sm' ? 'h-3 w-3' : 'h-3.5 w-3.5'} aria-hidden="true" /> : <span className="h-2 w-2 rounded-full bg-muted/70" aria-hidden="true" />}
      {children}
    </span>;
}