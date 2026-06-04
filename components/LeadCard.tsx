'use client';

import { clsx } from 'clsx';
import type { Lead } from '@/lib/types';
import { StatusBadge } from './StatusBadge';
import { QualityBadge } from './QualityBadge';
import { MessageDots } from './MessageDots';

interface LeadCardProps {
  lead: Lead;
  index: number;
  onClick: () => void;
  selected?: boolean;
}

export function LeadCard({ lead, index, onClick, selected }: LeadCardProps) {
  const sentCount =
    (lead.msg1_sent ? 1 : 0) +
    (lead.msg2_sent ? 1 : 0) +
    (lead.msg3_sent ? 1 : 0);

  return (
    <button
      onClick={onClick}
      className={clsx(
        'group relative w-full overflow-hidden border bg-ink-1 text-left transition-all',
        'animate-fade-up opacity-0',
        selected
          ? 'border-amber/50 shadow-[inset_0_0_0_1px_rgba(245,158,11,0.15)]'
          : 'border-ink-3 hover:border-ink-5 hover:bg-ink-2'
      )}
      style={{ animationDelay: `${Math.min(index, 24) * 22}ms` }}
    >
      {selected && (
        <span className="absolute left-0 top-0 h-full w-px bg-amber" />
      )}

      <div className="flex items-start justify-between gap-3 px-4 pt-3.5">
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline gap-2">
            <h3 className="truncate font-display text-base text-fog-1">
              {lead.business_name || lead.name}
            </h3>
            {lead.business_name && (
              <span className="truncate font-mono text-2xs uppercase tracking-extra-wide text-fog-4">
                {lead.name}
              </span>
            )}
          </div>
          <p className="mt-0.5 truncate font-mono text-2xs uppercase tracking-extra-wide text-fog-3">
            {lead.niche}
            <span className="mx-1.5 text-fog-5">·</span>
            {lead.location}
          </p>
        </div>
        <QualityBadge quality={lead.lead_quality} />
      </div>

      {lead.post_context && (
        <p className="mt-3 line-clamp-2 px-4 text-xs leading-relaxed text-fog-3">
          {lead.post_context}
        </p>
      )}

      <div className="mt-4 flex items-center justify-between border-t border-ink-3 px-4 py-2.5">
        <div className="flex items-center gap-3">
          <StatusBadge status={lead.status} />
          <span className="font-mono text-[10px] text-fog-4">
            {sentCount}/3 sent
          </span>
        </div>
        <MessageDots lead={lead} />
      </div>
    </button>
  );
}
