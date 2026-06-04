'use client';

import { cn } from '@/lib/utils';
import type { Lead } from '@/lib/types';
import { QualityBadge } from '@/components/QualityBadge';
import { StatusPill } from '@/components/StatusPill';
import { MessageDots } from '@/components/MessagePips';
import { HasWebsiteIndicator } from '@/components/HasWebsiteIndicator';

function isSameEntity(lead: Lead): boolean {
  if (!lead.business_name) return true;
  return lead.business_name.trim().toLowerCase() === lead.name.trim().toLowerCase();
}

function firstName(full: string): string {
  return full.trim().split(/\s+/)[0] || full;
}

export function LeadCard({
  lead,
  onClick,
  selected,
}: {
  lead: Lead;
  onClick: () => void;
  selected?: boolean;
}) {
  const same = isSameEntity(lead);
  const primary = same ? lead.name : lead.business_name || lead.name;
  const secondary = same ? null : lead.name;

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'group flex w-full flex-col gap-3 rounded-lg border bg-surface p-5 text-left transition-colors',
        selected
          ? 'border-accent shadow-[0_0_0_3px_hsl(var(--accent)/0.12)]'
          : 'border-border hover:border-foreground/30'
      )}
    >
      <div className="flex items-start justify-between gap-3">
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
    </button>
  );
}
