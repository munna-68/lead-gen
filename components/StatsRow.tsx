'use client';

import { motion } from 'motion/react';
import type { StatsResponse } from '@/lib/types';

interface Stat {
  key: keyof StatsResponse;
  label: string;
  index: string;
  accent?: boolean;
}

const STATS: Stat[] = [
  { key: 'total', label: 'Total leads', index: '00', accent: true },
  { key: 'warm', label: 'Warm', index: '01' },
  { key: 'contacted', label: 'Contacted', index: '02' },
  { key: 'replied', label: 'Replied', index: '03' },
  { key: 'pitched', label: 'Pitched', index: '04' },
  { key: 'closed', label: 'Closed', index: '05' },
];

export function StatsRow({ data }: { data: StatsResponse | null }) {
  return (
    <div className="grid grid-cols-2 divide-x divide-ink-3 border border-ink-3 sm:grid-cols-3 lg:grid-cols-6">
      {STATS.map((s, i) => {
        const value = data?.[s.key] ?? 0;
        return (
          <motion.div
            key={s.key}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05, duration: 0.4 }}
            className="group relative px-5 py-5 transition-colors hover:bg-ink-2"
          >
            <div className="flex items-baseline justify-between font-mono text-[10px] uppercase tracking-extra-wide text-fog-4">
              <span>{s.label}</span>
              <span className="text-fog-5">{s.index}</span>
            </div>
            <div
              className={
                'mt-3 font-display text-5xl leading-none tracking-tightest ' +
                (s.accent ? 'text-amber italic' : 'text-fog-1')
              }
            >
              {value.toString().padStart(2, '0')}
            </div>
            <div className="mt-2 h-px w-full bg-ink-3">
              <div
                className={
                  'h-px transition-all ' + (s.accent ? 'bg-amber' : 'bg-fog-4')
                }
                style={{ width: s.key === 'total' ? '100%' : '0%' }}
              />
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
