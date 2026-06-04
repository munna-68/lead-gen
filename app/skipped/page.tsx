'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import type { Lead } from '@/lib/types';
import { QualityBadge } from '@/components/QualityBadge';
import { EmptyState } from '@/components/EmptyState';

export default function SkippedPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/leads/skipped')
      .then((r) => r.json())
      .then((d) => setLeads(d.leads || []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="mx-auto max-w-6xl px-5 py-8 md:px-10 md:py-12">
      <header className="mb-8 flex flex-col gap-4 border-b border-ink-3 pb-6 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="font-mono text-2xs uppercase tracking-extra-wide text-fog-4">
            archive · skipped
          </div>
          <h1 className="mt-2 font-display text-5xl italic leading-none tracking-tightest text-fog-1 md:text-6xl">
            The <span className="text-amber">rejects</span>.
          </h1>
          <p className="mt-3 max-w-lg font-sans text-sm text-fog-3">
            Leads the AI extraction filtered out, for any reason. Reference only — no
            actions taken here.
          </p>
        </div>
        <div className="flex items-center gap-2 border border-ink-3 bg-ink-1 px-3 py-2 font-mono text-2xs uppercase tracking-extra-wide text-fog-3">
          <span className="h-1.5 w-1.5 rounded-full bg-status-no_response" />
          <span>
            total{' '}
            <span className="text-fog-1">
              {leads.length.toString().padStart(2, '0')}
            </span>
          </span>
        </div>
      </header>

      {loading ? (
        <div className="space-y-px">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-12 animate-pulse border border-ink-3 bg-ink-1"
            />
          ))}
        </div>
      ) : leads.length === 0 ? (
        <EmptyState
          title="Nothing skipped yet"
          description="When your AI extraction step returns leads with a skip_reason, they'll land here for reference."
        />
      ) : (
        <div className="border border-ink-3 bg-ink-1">
          <div className="grid grid-cols-[1fr_140px_120px_1fr] gap-px border-b border-ink-3 bg-ink-3 font-mono text-2xs uppercase tracking-extra-wide text-fog-4">
            <div className="bg-ink-1 px-4 py-2.5">name · business</div>
            <div className="bg-ink-1 px-4 py-2.5">niche</div>
            <div className="bg-ink-1 px-4 py-2.5">quality</div>
            <div className="bg-ink-1 px-4 py-2.5">skip reason</div>
          </div>
          <ul>
            {leads.map((lead, i) => (
              <motion.li
                key={lead.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: Math.min(i, 16) * 0.02 }}
                className="grid grid-cols-[1fr_140px_120px_1fr] gap-px border-b border-ink-3 bg-ink-3 last:border-b-0"
              >
                <div className="bg-ink-1 px-4 py-3">
                  <div className="font-display text-base text-fog-1">
                    {lead.business_name || lead.name}
                  </div>
                  {lead.business_name && (
                    <div className="font-mono text-2xs uppercase tracking-extra-wide text-fog-4">
                      {lead.name}
                    </div>
                  )}
                </div>
                <div className="bg-ink-1 px-4 py-3 font-sans text-sm text-fog-2">
                  {lead.niche}
                </div>
                <div className="bg-ink-1 px-4 py-3">
                  <QualityBadge quality={lead.lead_quality} />
                </div>
                <div className="bg-ink-1 px-4 py-3 font-sans text-sm text-fog-2">
                  <span className="mr-2 font-mono text-2xs uppercase tracking-extra-wide text-status-no_response">
                    ▸
                  </span>
                  {lead.skip_reason || '—'}
                </div>
              </motion.li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-8 flex items-center justify-between">
        <Link
          href="/"
          className="font-mono text-2xs uppercase tracking-extra-wide text-fog-3 hover:text-fog-1"
        >
          ← back to pipeline
        </Link>
      </div>
    </div>
  );
}
