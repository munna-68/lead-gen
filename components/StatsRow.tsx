import * as React from 'react';
import { cn } from '@/lib/utils';
import type { StatsResponse } from '@/lib/types';

const TILES: Array<{
  key: keyof StatsResponse;
  label: string;
  accent?: boolean;
}> = [
  { key: 'total', label: 'Total Leads', accent: true },
  { key: 'warm', label: 'Warm' },
  { key: 'contacted', label: 'Contacted' },
  { key: 'replied', label: 'Replied' },
  { key: 'pitched', label: 'Pitched' },
  { key: 'closed', label: 'Closed' },
];

export function StatsRow({ data, className }: { data: StatsResponse | null; className?: string }) {
  return (
    <div
      className={cn(
        'grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-3 lg:grid-cols-6',
        className
      )}
    >
      {TILES.map((t) => {
        const value = data?.[t.key] ?? 0;
        return (
          <div
            key={t.key}
            className="bg-surface px-6 py-5"
          >
            <div className="font-num text-2xs uppercase tracking-[0.08em] text-muted-foreground">
              {t.label}
            </div>
            <div
              className={cn(
                'mt-3 text-[32px] font-semibold leading-none tracking-tight font-num',
                t.accent ? 'text-accent' : 'text-foreground'
              )}
            >
              {value.toString().padStart(2, '0')}
            </div>
          </div>
        );
      })}
    </div>
  );
}
