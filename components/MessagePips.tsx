import * as React from 'react';
import { cn } from '@/lib/utils';
import type { Lead } from '@/lib/types';

interface DotDef {
  key: 'msg1_sent' | 'msg2_sent' | 'msg3_sent';
  label: string;
}

const DOTS: DotDef[] = [
  { key: 'msg1_sent', label: 'M1' },
  { key: 'msg2_sent', label: 'M2' },
  { key: 'msg3_sent', label: 'M3' },
];

export function MessageDots({
  lead,
  className,
}: {
  lead: Lead;
  className?: string;
}) {
  return (
    <div
      className={cn('flex items-center gap-2.5', className)}
      aria-label="Message sequence progress"
    >
      {DOTS.map((d) => {
        const filled = lead[d.key] as boolean;
        return (
          <div key={d.key} className="flex items-center gap-1">
            <span
              aria-hidden
              className={cn(
                'h-2 w-2 rounded-full transition-colors',
                filled
                  ? 'bg-accent ring-2 ring-accent/20'
                  : 'border border-border bg-surface'
              )}
            />
            <span
              className={cn(
                'font-num text-[10px] uppercase tracking-[0.06em]',
                filled ? 'text-foreground' : 'text-muted-foreground/70'
              )}
            >
              {d.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
