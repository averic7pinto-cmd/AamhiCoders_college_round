import React from "react";
import { Loader2Icon, type LucideIcon } from "lucide-react";
type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';
type ButtonSize = 'sm' | 'md' | 'lg' | 'xl';
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: LucideIcon;
  iconRight?: LucideIcon;
  loading?: boolean;
  fullWidth?: boolean;
}
const base = 'inline-flex items-center justify-center font-bold whitespace-nowrap select-none transition-[background-color,border-color,color,box-shadow,filter,transform] duration-150 ease-out active:scale-[0.98] disabled:opacity-40 disabled:pointer-events-none';
const variants: Record<ButtonVariant, string> = {
  primary: 'bg-grad-primary text-white shadow-glow-blue hover:shadow-glow-violet hover:brightness-110',
  secondary: 'border border-line bg-ink-3 text-fg hover:border-cyan/60 hover:bg-ink-4',
  ghost: 'text-muted hover:bg-white/[0.06] hover:text-fg',
  danger: 'border border-coral/45 bg-coral/10 text-coral hover:bg-coral/20',
  success: 'bg-lime text-ink hover:brightness-105 hover:shadow-glow-lime'
};
const sizes: Record<ButtonSize, string> = {
  sm: 'h-9 gap-1.5 rounded-lg px-3 text-sm',
  md: 'h-11 gap-2 rounded-xl px-4 text-sm',
  lg: 'h-14 gap-2.5 rounded-2xl px-6 text-base',
  xl: 'h-16 gap-3 rounded-2xl px-7 text-base'
};
const iconSizes: Record<ButtonSize, string> = {
  sm: 'h-4 w-4',
  md: 'h-4 w-4',
  lg: 'h-5 w-5',
  xl: 'h-5 w-5'
};
export function Button({
  variant = 'primary',
  size = 'md',
  icon: Icon,
  iconRight: IconRight,
  loading = false,
  fullWidth = false,
  className = '',
  children,
  disabled,
  type = 'button',
  ...rest
}: ButtonProps) {
  return <button type={type} disabled={disabled || loading} aria-busy={loading || undefined} className={[base, variants[variant], sizes[size], fullWidth ? 'w-full' : '', className].join(' ')} {...rest}>
      {loading ? <Loader2Icon className={`${iconSizes[size]} animate-spin`} aria-hidden="true" /> : Icon ? <Icon className={iconSizes[size]} aria-hidden="true" /> : null}
      {children}
      {IconRight && !loading && <IconRight className={iconSizes[size]} aria-hidden="true" />}
    </button>;
}