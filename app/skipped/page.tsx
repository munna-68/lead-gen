'use client';

import { useEffect, useState } from 'react';
import { Archive } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import type { Lead } from '@/lib/types';

export default function SkippedPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/leads/skipped')
      .then((r) => r.json())
      .then((d) => setLeads(d.leads || []))
      .finally(() => setLoading(false));
  }, []);

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });

  return (
    <div className="mx-auto w-full max-w-[960px] px-10 py-8">
      <PageHeader
        title="Skipped"
        subtitle="Every lead the AI extraction flagged with a skip_reason, kept for reference."
      />

      {loading ? (
        <div className="overflow-hidden rounded-lg border border-border">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-12 animate-pulse border-b border-border bg-surface last:border-b-0"
            />
          ))}
        </div>
      ) : leads.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-surface px-6 py-20 text-center">
          <Archive className="h-8 w-8 text-muted-foreground" aria-hidden />
          <h3 className="mt-4 text-[16px] font-semibold text-foreground">Nothing skipped yet</h3>
          <p className="mt-1.5 max-w-sm text-[13px] text-muted-foreground">
            When your AI extraction step returns leads with a skip_reason, they&apos;ll land here.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-border">
          <table className="w-full table-fixed text-[13px]">
            <colgroup>
              <col className="w-[35%]" />
              <col className="w-[40%]" />
              <col className="w-[25%]" />
            </colgroup>
            <thead>
              <tr className="border-b border-border bg-surface-2">
                <th className="px-5 py-2.5 text-left font-num text-2xs font-medium uppercase tracking-[0.08em] text-muted-foreground">
                  Name
                </th>
                <th className="px-5 py-2.5 text-left font-num text-2xs font-medium uppercase tracking-[0.08em] text-muted-foreground">
                  Skip Reason
                </th>
                <th className="px-5 py-2.5 text-left font-num text-2xs font-medium uppercase tracking-[0.08em] text-muted-foreground">
                  Date Added
                </th>
              </tr>
            </thead>
            <tbody>
              {leads.map((lead, i) => (
                <tr
                  key={lead.id}
                  className={`border-b border-border last:border-b-0 ${
                    i % 2 === 0 ? 'bg-surface' : 'bg-surface-2/50'
                  }`}
                >
                  <td className="px-5 py-3 text-foreground">
                    {lead.business_name || lead.name}
                    {lead.business_name && (
                      <div className="text-[12px] text-muted-foreground">{lead.name}</div>
                    )}
                  </td>
                  <td className="px-5 py-3 text-muted-foreground">
                    {lead.skip_reason || '—'}
                  </td>
                  <td className="px-5 py-3 font-num text-muted-foreground">
                    {formatDate(lead.created_at)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
