'use client';

import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Lead } from '@/lib/types';
import { QualityBadge } from '@/components/QualityBadge';
import { StatusPill } from '@/components/StatusPill';
import { MessageDots } from '@/components/MessagePips';
import { HasWebsiteIndicator } from '@/components/HasWebsiteIndicator';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';

function isSameEntity(lead: Lead): boolean {
  if (!lead.business_name) return true;
  return lead.business_name.trim().toLowerCase() === lead.name.trim().toLowerCase();
}

function firstName(full: string): string {
  return full.trim().split(/\s+/)[0] || full;
}

function displayName(lead: Lead): string {
  return lead.business_name?.trim() || lead.name;
}

export function LeadCard({
  lead,
  onClick,
  onDelete,
  selected,
}: {
  lead: Lead;
  onClick: () => void;
  onDelete: (id: string) => Promise<void> | void;
  selected?: boolean;
}) {
  const same = isSameEntity(lead);
  const primary = same ? lead.name : lead.business_name || lead.name;
  const secondary = same ? null : lead.name;
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleCardKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick();
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await onDelete(lead.id);
      setConfirmOpen(false);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <div
        role="button"
        tabIndex={0}
        aria-label={`Open lead ${displayName(lead)}`}
        onClick={onClick}
        onKeyDown={handleCardKey}
        className={cn(
          'group relative flex w-full cursor-pointer flex-col gap-3 rounded-lg border bg-surface p-5 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
          selected
            ? 'border-accent shadow-[0_0_0_3px_hsl(var(--accent)/0.12)]'
            : 'border-border hover:border-foreground/30'
        )}
      >
        <button
          type="button"
          aria-label={`Delete ${displayName(lead)}`}
          title="Delete lead"
          onClick={(e) => {
            e.stopPropagation();
            setConfirmOpen(true);
          }}
          className="absolute right-3 top-3 inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground/60 transition-colors hover:bg-danger/10 hover:text-danger focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>

        <div className="flex items-start justify-between gap-3 pr-8">
          <div className="min-w-0 flex-1">
            {same ? (
              <div className="truncate text-[18px] font-semibold leading-tight tracking-tight text-foreground">
                {firstName(primary)}
              </div>
            ) : (
              <>
                <div className="truncate text-[18px] font-semibold leading-tight tracking-tight text-foreground">
                  {primary}
                </div>
                <div className="mt-0.5 truncate text-[12px] text-muted-foreground">
                  {secondary}
                </div>
              </>
            )}
          </div>
          <QualityBadge quality={lead.lead_quality} />
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {lead.niche && (
            <span className="inline-flex items-center rounded-sm bg-surface-2 px-1.5 py-0.5 text-[11px] font-medium leading-none text-foreground/80">
              {lead.niche}
            </span>
          )}
          {lead.location && (
            <span className="inline-flex items-center rounded-sm bg-surface-2 px-1.5 py-0.5 font-num text-[11px] font-medium leading-none text-foreground/80">
              {lead.location}
            </span>
          )}
        </div>

        <div className="-ml-0.5">
          <HasWebsiteIndicator value={lead.has_website} />
        </div>

        <div className="mt-1 flex items-center justify-between border-t border-border pt-3">
          <MessageDots lead={lead} />
          <StatusPill status={lead.status} />
        </div>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={(o) => !deleting && setConfirmOpen(o)}
        title={`Delete ${displayName(lead)}?`}
        description="This will permanently remove the lead from the database. This cannot be undone."
        confirmLabel="Delete"
        destructive
        busy={deleting}
        onConfirm={handleDelete}
      />
    </>
  );
}
