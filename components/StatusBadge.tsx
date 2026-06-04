'use client';

import { clsx } from 'clsx';
import type { LeadStatus } from '@/lib/types';

const STATUS_LABELS: Record<LeadStatus, string> = {
  new: 'NEW',
  contacted: 'CONTACTED',
  engaged: 'ENGAGED',
  pitched: 'PITCHED',
  no_response: 'NO RESPONSE',
  closed: 'CLOSED',
  dead: 'DEAD',
};

const STATUS_DOT: Record<LeadStatus, string> = {
  new: 'bg-status-new',
  contacted: 'bg-status-contacted',
  engaged: 'bg-status-engaged',
  pitched: 'bg-status-pitched',
  no_response: 'bg-status-no_response',
  closed: 'bg-status-closed',
  dead: 'bg-status-dead',
};

export function StatusBadge({
  status,
  size = 'sm',
}: {
  status: LeadStatus;
  size?: 'sm' | 'xs';
}) {
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 font-mono uppercase tracking-extra-wide text-fog-2',
        size === 'sm' ? 'text-2xs' : 'text-[10px]'
      )}
    >
      <span
        className={clsx(
          'h-1.5 w-1.5 rounded-full ring-2 ring-ink-0',
          STATUS_DOT[status]
        )}
      />
      {STATUS_LABELS[status]}
    </span>
  );
}
