'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import type { Lead, LeadQuality, LeadStatus, StatsResponse } from '@/lib/types';
import { LeadCard } from '@/components/LeadCard';
import { LeadDetail } from '@/components/LeadDetail';
import { StatsRow } from '@/components/StatsRow';
import { Filters } from '@/components/Filters';
import { EmptyState } from '@/components/EmptyState';

export default function Dashboard() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<LeadStatus | ''>('');
  const [niche, setNiche] = useState('');
  const [leadQuality, setLeadQuality] = useState<LeadQuality | ''>('');
  const [sourceGroup, setSourceGroup] = useState('');

  const fetchLeads = useCallback(async () => {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (status) params.set('status', status);
    if (niche) params.set('niche', niche);
    if (leadQuality) params.set('lead_quality', leadQuality);
    if (sourceGroup) params.set('source_group', sourceGroup);

    const res = await fetch(`/api/leads?${params.toString()}`);
    if (res.ok) {
      const data = await res.json();
      setLeads(data.leads);
    }
  }, [search, status, niche, leadQuality, sourceGroup]);

  const fetchStats = useCallback(async () => {
    const res = await fetch('/api/stats');
    if (res.ok) setStats(await res.json());
  }, []);

  useEffect(() => {
    setLoading(true);
    Promise.all([fetchLeads(), fetchStats()]).finally(() => setLoading(false));
  }, [fetchLeads, fetchStats]);

  const allLeads = useMemo(() => leads, [leads]);

  const niches = useMemo(
    () => Array.from(new Set(allLeads.map((l) => l.niche).filter(Boolean))).sort(),
    [allLeads]
  );
  const sources = useMemo(
    () => Array.from(new Set(allLeads.map((l) => l.source_group).filter(Boolean))).sort(),
    [allLeads]
  );

  const handleUpdate = async (id: string, updates: Partial<Lead>) => {
    const res = await fetch(`/api/leads/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (res.ok) {
      const data = await res.json();
      setLeads((prev) => prev.map((l) => (l.id === id ? data.lead : l)));
      fetchStats();
    }
  };

  const selected = selectedId ? leads.find((l) => l.id === selectedId) || null : null;

  return (
    <div className="mx-auto max-w-7xl px-5 py-8 md:px-10 md:py-12">
      {/* Title bar */}
      <header className="mb-8 flex flex-col gap-4 border-b border-ink-3 pb-6 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="font-mono text-2xs uppercase tracking-extra-wide text-fog-4">
            pipeline · live
          </div>
          <h1 className="mt-2 font-display text-5xl italic leading-none tracking-tightest text-fog-1 md:text-6xl">
            Your <span className="text-amber">outbound</span> desk.
          </h1>
          <p className="mt-3 max-w-lg font-sans text-sm text-fog-3">
            Cold DMs, tracked. Three-message sequences, observed. No leads falling through the cracks.
          </p>
        </div>
        <Link
          href="/import"
          className="group inline-flex items-center gap-2 self-start border border-amber/40 bg-amber/[0.06] px-4 py-2.5 font-mono text-2xs uppercase tracking-extra-wide text-amber transition-colors hover:bg-amber/[0.12]"
        >
          <span>+ import leads</span>
          <span className="transition-transform group-hover:translate-x-1">→</span>
        </Link>
      </header>

      <div className="mb-8">
        <StatsRow data={stats} />
      </div>

      <div className="mb-6">
        <Filters
          search={search}
          onSearchChange={setSearch}
          status={status}
          onStatusChange={setStatus}
          niche={niche}
          onNicheChange={setNiche}
          leadQuality={leadQuality}
          onLeadQualityChange={setLeadQuality}
          sourceGroup={sourceGroup}
          onSourceGroupChange={setSourceGroup}
          niches={niches}
          sources={sources}
          totalCount={stats?.total ?? 0}
          filteredCount={leads.length}
        />
      </div>

      {/* Lead grid */}
      {loading ? (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-40 animate-pulse border border-ink-3 bg-ink-1"
              style={{ animationDelay: `${i * 80}ms` }}
            />
          ))}
        </div>
      ) : leads.length === 0 ? (
        <EmptyState
          title="No leads to show"
          description={
            search || status || niche || leadQuality || sourceGroup
              ? 'Try clearing your filters, or import a fresh batch of leads.'
              : 'Paste the JSON output from your extraction step to get started.'
          }
          action={
            <Link
              href="/import"
              className="inline-flex items-center gap-2 border border-amber/40 bg-amber/[0.06] px-4 py-2.5 font-mono text-2xs uppercase tracking-extra-wide text-amber transition-colors hover:bg-amber/[0.12]"
            >
              <span>go to import</span>
              <span>→</span>
            </Link>
          }
        />
      ) : (
        <motion.div
          layout
          className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3"
        >
          {leads.map((lead, i) => (
            <LeadCard
              key={lead.id}
              lead={lead}
              index={i}
              selected={lead.id === selectedId}
              onClick={() => setSelectedId(lead.id)}
            />
          ))}
        </motion.div>
      )}

      <LeadDetail
        lead={selected}
        onClose={() => setSelectedId(null)}
        onUpdate={handleUpdate}
      />
    </div>
  );
}
