import * as React from 'react';
import { cn } from '@/lib/utils';

type Variant = 'default' | 'accent' | 'muted' | 'outline' | 'success' | 'warning' | 'danger';

const variantClasses: Record<Variant, string> = {
  default: 'bg-surface-2 text-foreground',
  accent: 'bg-accent-soft text-accent',
  muted: 'bg-surface-2 text-muted-foreground',
  outline: 'border border-border text-foreground',
  success: 'bg-success/10 text-success',
  warning: 'bg-warning/10 text-warning',
  danger: 'bg-danger/10 text-danger',
};

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: Variant;
}

export function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-sm px-2 py-0.5 text-[11px] font-semibold leading-none',
        variantClasses[variant],
        className
      )}
      {...props}
    />
  );
}
