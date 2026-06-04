'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Plus, Inbox } from 'lucide-react';
import type { Lead, LeadQuality, LeadStatus, StatsResponse } from '@/lib/types';
import { PageHeader } from '@/components/PageHeader';
import { StatsRow } from '@/components/StatsRow';
import { Filters } from '@/components/Filters';
import { LeadCard } from '@/components/LeadCard';
import { LeadDetail } from '@/components/LeadDetail';

const ACCENT_OUTLINE_LINK =
  'inline-flex h-9 items-center gap-1.5 rounded-md border border-accent px-4 text-[13px] font-medium text-accent transition-colors hover:bg-accent hover:text-accent-foreground';

export default function PipelinePage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<LeadStatus | ''>('');
  const [quality, setQuality] = useState<LeadQuality | ''>('');
  const [niche, setNiche] = useState('');
  const [sourceGroup, setSourceGroup] = useState('');

  const fetchLeads = useCallback(async () => {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (status) params.set('status', status);
    if (quality) params.set('lead_quality', quality);
    if (niche) params.set('niche', niche);
    if (sourceGroup) params.set('source_group', sourceGroup);

    const res = await fetch(`/api/leads?${params.toString()}`);
    if (res.ok) {
      const data = await res.json();
      setLeads(data.leads);
    }
  }, [search, status, quality, niche, sourceGroup]);

  const fetchStats = useCallback(async () => {
    const res = await fetch('/api/stats');
    if (res.ok) setStats(await res.json());
  }, []);

  useEffect(() => {
    setLoading(true);
    Promise.all([fetchLeads(), fetchStats()]).finally(() => setLoading(false));
  }, [fetchLeads, fetchStats]);

  const niches = useMemo(
    () => Array.from(new Set(leads.map((l) => l.niche).filter(Boolean))).sort(),
    [leads]
  );
  const sources = useMemo(
    () => Array.from(new Set(leads.map((l) => l.source_group).filter(Boolean))).sort(),
    [leads]
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
  const hasFilters = Boolean(search || status || quality || niche || sourceGroup);

  return (
    <div className="mx-auto w-full max-w-[1200px] px-10 py-8">
      <PageHeader
        title="Pipeline"
        subtitle="Your active Facebook outreach. Filter, click into a lead, and track every message in the sequence."
        action={
          <Link href="/import" className={ACCENT_OUTLINE_LINK}>
            <Plus className="h-3.5 w-3.5" /> Import Leads
          </Link>
        }
      />

      <div className="mb-8">
        <StatsRow data={stats} />
      </div>

      <div className="mb-6">
        <Filters
          search={search}
          onSearchChange={setSearch}
          status={status}
          onStatusChange={setStatus}
          quality={quality}
          onQualityChange={setQuality}
          niche={niche}
          onNicheChange={setNiche}
          sourceGroup={sourceGroup}
          onSourceGroupChange={setSourceGroup}
          niches={niches}
          sources={sources}
          totalCount={stats?.total ?? 0}
          filteredCount={leads.length}
        />
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-[176px] animate-pulse rounded-lg border border-border bg-surface"
              style={{ animationDelay: `${i * 60}ms` }}
            />
          ))}
        </div>
      ) : leads.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-surface px-6 py-20 text-center">
          <Inbox className="h-8 w-8 text-muted-foreground" aria-hidden />
          <h3 className="mt-4 text-[16px] font-semibold text-foreground">No leads to show</h3>
          <p className="mt-1.5 max-w-sm text-[13px] text-muted-foreground">
            {hasFilters
              ? 'Try clearing your filters, or import a fresh batch of leads.'
              : 'Paste the JSON output from your extraction step to get started.'}
          </p>
          <Link href="/import" className={`mt-5 ${ACCENT_OUTLINE_LINK}`}>
            <Plus className="h-3.5 w-3.5" /> Go to import
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          {leads.map((lead) => (
            <LeadCard
              key={lead.id}
              lead={lead}
              selected={lead.id === selectedId}
              onClick={() => setSelectedId(lead.id)}
            />
          ))}
        </div>
      )}

      <LeadDetail lead={selected} onClose={() => setSelectedId(null)} onUpdate={handleUpdate} />
    </div>
  );
}
