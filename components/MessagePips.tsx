import * as React from 'react';
import { cn } from '@/lib/utils';
import type { Lead } from '@/lib/types';

export function MessagePips({ lead, className }: { lead: Lead; className?: string }) {
  const steps = [
    { filled: lead.msg1_sent },
    { filled: lead.msg1_replied },
    { filled: lead.msg2_sent },
    { filled: lead.msg2_replied },
    { filled: lead.msg3_sent },
  ];

  return (
    <div
      className={cn('flex items-center gap-1', className)}
      aria-label="Message sequence progress"
    >
      {steps.map((s, i) => (
        <span
          key={i}
          aria-hidden
          className={cn(
            'h-2 w-2 rounded-full transition-colors',
            s.filled ? 'bg-foreground' : 'border border-border bg-transparent'
          )}
        />
      ))}
    </div>
  );
}
