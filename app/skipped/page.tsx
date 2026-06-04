'use client';

import { useEffect, useState } from 'react';
import { Archive, Trash2 } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { PageContainer } from '@/components/PageContainer';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import type { Lead } from '@/lib/types';

export default function SkippedPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

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

  const handleClearAll = async () => {
    setDeleting(true);
    try {
      const res = await fetch('/api/leads/skipped', { method: 'DELETE' });
      if (res.ok) {
        setLeads([]);
        setConfirmOpen(false);
      }
    } catch {
      // swallow
    } finally {
      setDeleting(false);
    }
  };

  return (
    <PageContainer width="sm">
      <PageHeader
        title="Skipped"
        subtitle="Every lead the AI extraction flagged with a skip_reason, kept for reference."
        action={
          !loading && leads.length > 0 ? (
            <button
              type="button"
              onClick={() => setConfirmOpen(true)}
              className="inline-flex h-9 items-center gap-1.5 rounded-md border border-danger bg-danger px-4 text-[13px] font-medium text-white transition-opacity hover:opacity-90"
            >
              <Trash2 className="h-3.5 w-3.5" /> Clear All Skipped
            </button>
          ) : undefined
        }
      />

      {loading ? (
        <div className="overflow-hidden rounded-lg border border-border">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-12 animate-pulse border-b border-border bg-surface last:border-b-0 sm:h-12"
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
        <>
          {/* Mobile: card list */}
          <ul className="space-y-2 sm:hidden">
            {leads.map((lead) => (
              <li
                key={lead.id}
                className="rounded-lg border border-border bg-surface px-4 py-3"
              >
                <div className="text-[14px] font-semibold tracking-tight text-foreground">
                  {lead.business_name || lead.name}
                </div>
                {lead.business_name && (
                  <div className="mt-0.5 text-[12px] text-muted-foreground">
                    {lead.name}
                  </div>
                )}
                <div className="mt-2 text-[13px] leading-relaxed text-muted-foreground">
                  {lead.skip_reason || '—'}
                </div>
                <div className="mt-2 font-num text-[11px] uppercase tracking-[0.08em] text-muted-foreground">
                  {formatDate(lead.created_at)}
                </div>
              </li>
            ))}
          </ul>

          {/* Desktop: table */}
          <div className="hidden overflow-hidden rounded-lg border border-border sm:block">
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
        </>
      )}

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={(o) => !deleting && setConfirmOpen(o)}
        title="Clear all skipped leads?"
        description={
          <>
            This will permanently delete{' '}
            <span className="font-semibold text-foreground">
              {leads.length.toString().padStart(2, '0')}
            </span>{' '}
            skipped {leads.length === 1 ? 'record' : 'records'}. This cannot be undone.
          </>
        }
        confirmLabel="Clear all"
        destructive
        busy={deleting}
        onConfirm={handleClearAll}
      />
    </PageContainer>
  );
}
