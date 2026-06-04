import * as React from 'react';
import { cn } from '@/lib/utils';

type Variant = 'default' | 'outline' | 'ghost' | 'accent-outline' | 'accent';
type Size = 'sm' | 'md' | 'icon';

const variantClasses: Record<Variant, string> = {
  default:
    'bg-foreground text-background hover:opacity-90 disabled:opacity-50',
  outline:
    'border border-border bg-surface text-foreground hover:bg-surface-2 disabled:opacity-50',
  ghost:
    'text-foreground hover:bg-surface-2 disabled:opacity-50',
  'accent-outline':
    'border border-accent text-accent hover:bg-accent hover:text-accent-foreground disabled:opacity-50',
  accent:
    'bg-accent text-accent-foreground hover:opacity-90 disabled:opacity-50',
};

const sizeClasses: Record<Size, string> = {
  sm: 'h-8 px-3 text-[12px]',
  md: 'h-9 px-4 text-[13px]',
  icon: 'h-8 w-8 p-0',
};

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'md', type = 'button', ...props }, ref) => {
    return (
      <button
        ref={ref}
        type={type}
        className={cn(
          'inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background whitespace-nowrap',
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';
