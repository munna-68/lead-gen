import * as React from 'react';
import { cn } from '@/lib/utils';
import type { LeadStatus } from '@/lib/types';

const STATUS_LABELS: Record<LeadStatus, string> = {
  new: 'New',
  contacted: 'Contacted',
  engaged: 'Engaged',
  pitched: 'Pitched',
  no_response: 'No response',
  closed: 'Closed',
  dead: 'Dead',
};

export function StatusPill({
  status,
  className,
}: {
  status: LeadStatus;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 text-[12px] text-muted-foreground',
        className
      )}
    >
      <span
        aria-hidden
        className="h-1.5 w-1.5 rounded-full"
        style={{ backgroundColor: `hsl(var(--status-${status.replace('_', '-')}))` }}
      />
      {STATUS_LABELS[status]}
    </span>
  );
}
