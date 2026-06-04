'use client';

import { clsx } from 'clsx';
import type { Lead } from '@/lib/types';

interface MessageDotsProps {
  lead: Lead;
  size?: 'sm' | 'md';
}

export function MessageDots({ lead, size = 'sm' }: MessageDotsProps) {
  const steps: { key: string; label: string; filled: boolean }[] = [
    { key: 'm1s', label: 'M1 sent', filled: lead.msg1_sent },
    { key: 'm1v', label: 'M1 seen', filled: lead.msg1_seen },
    { key: 'm1r', label: 'M1 reply', filled: lead.msg1_replied },
    { key: 'm2s', label: 'M2 sent', filled: lead.msg2_sent },
    { key: 'm2r', label: 'M2 reply', filled: lead.msg2_replied },
    { key: 'm3s', label: 'M3 sent', filled: lead.msg3_sent },
  ];

  return (
    <div className="flex items-center gap-1" title={steps.map((s) => `${s.label}: ${s.filled}`).join('\n')}>
      {steps.map((s) => (
        <span
          key={s.key}
          className={clsx(
            'rounded-full transition-colors',
            size === 'sm' ? 'h-1.5 w-1.5' : 'h-2 w-2',
            s.filled ? 'bg-amber' : 'bg-ink-4 ring-1 ring-inset ring-ink-5'
          )}
        />
      ))}
    </div>
  );
}
