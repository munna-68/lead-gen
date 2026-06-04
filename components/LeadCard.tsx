'use client';

import { cn } from '@/lib/utils';
import type { Lead } from '@/lib/types';
import { QualityBadge } from '@/components/QualityBadge';
import { StatusPill } from '@/components/StatusPill';
import { MessagePips } from '@/components/MessagePips';

export function LeadCard({
  lead,
  onClick,
  selected,
}: {
  lead: Lead;
  onClick: () => void;
  selected?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'group flex w-full flex-col gap-3 rounded-lg border bg-surface p-5 text-left transition-colors',
        selected
          ? 'border-accent'
          : 'border-border hover:border-foreground/30'
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="truncate text-[16px] font-semibold text-foreground">
            {lead.business_name || lead.name}
          </div>
          {lead.business_name && (
            <div className="mt-0.5 truncate text-[12px] text-muted-foreground">
              {lead.name}
            </div>
          )}
        </div>
        <QualityBadge quality={lead.lead_quality} />
      </div>

      <div className="font-num text-2xs uppercase tracking-[0.08em] text-muted-foreground">
        {lead.niche || '—'}
        <span className="mx-1.5 text-border">·</span>
        {lead.location || '—'}
      </div>

      {lead.post_context && (
        <p className="line-clamp-2 text-[13px] leading-relaxed text-foreground/80">
          {lead.post_context}
        </p>
      )}

      <div className="mt-1 flex items-center justify-between pt-1">
        <StatusPill status={lead.status} />
        <MessagePips lead={lead} />
      </div>
    </button>
  );
}
