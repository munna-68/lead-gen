import * as React from 'react';
import { cn } from '@/lib/utils';

export function PageHeader({
  eyebrow,
  title,
  subtitle,
  action,
  className,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <header
      className={cn(
        'mb-6 flex flex-col gap-4 sm:mb-8 md:flex-row md:items-end md:justify-between',
        className
      )}
    >
      <div className="min-w-0">
        {eyebrow && (
          <div className="font-num text-2xs uppercase tracking-[0.08em] text-muted-foreground">
            {eyebrow}
          </div>
        )}
        <h1 className="mt-1.5 text-[24px] font-semibold leading-tight tracking-tight text-foreground sm:text-[28px]">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-2 max-w-xl text-[13.5px] leading-relaxed text-muted-foreground sm:text-[14px]">
            {subtitle}
          </p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </header>
  );
}
