'use client';

import { clsx } from 'clsx';
import type { LeadQuality } from '@/lib/types';

export function QualityBadge({ quality }: { quality: LeadQuality }) {
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 rounded-sm border px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-extra-wide',
        quality === 'warm'
          ? 'border-amber/30 bg-amber/[0.06] text-amber'
          : 'border-fog-4/30 bg-fog-4/[0.04] text-fog-3'
      )}
    >
      <span
        className={clsx(
          'h-1 w-1 rounded-full',
          quality === 'warm' ? 'bg-amber' : 'bg-fog-4'
        )}
      />
      {quality}
    </span>
  );
}
