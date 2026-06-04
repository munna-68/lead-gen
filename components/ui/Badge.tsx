import * as React from 'react';
import { cn } from '@/lib/utils';

type Variant = 'default' | 'accent' | 'muted' | 'outline';

const variantClasses: Record<Variant, string> = {
  default: 'bg-surface-2 text-foreground',
  accent: 'bg-accent-soft text-accent',
  muted: 'bg-surface-2 text-muted-foreground',
  outline: 'border border-border text-foreground',
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
