import * as React from 'react';
import { CircleDot, Globe, GlobeLock } from 'lucide-react';
import { cn } from '@/lib/utils';

type State = 'unknown' | 'no' | 'yes';

const STATE_META: Record<
  State,
  { label: string; short: string; tone: string; Icon: React.ComponentType<{ className?: string }> }
> = {
  unknown: {
    label: 'Website unknown',
    short: 'Website unknown',
    tone: 'bg-surface-2 text-muted-foreground ring-1 ring-inset ring-border',
    Icon: CircleDot,
  },
  no: {
    label: 'No website — prime target',
    short: 'No website',
    tone: 'bg-success/10 text-success ring-1 ring-inset ring-success/20',
    Icon: GlobeLock,
  },
  yes: {
    label: 'Has website — outdated angle',
    short: 'Has website',
    tone: 'bg-warning/10 text-warning ring-1 ring-inset ring-warning/20',
    Icon: Globe,
  },
};

export function hasWebsiteState(value: boolean | null | undefined): State {
  if (value === true) return 'yes';
  if (value === false) return 'no';
  return 'unknown';
}

export function HasWebsiteIndicator({
  value,
  className,
}: {
  value: boolean | null | undefined;
  className?: string;
}) {
  const state = hasWebsiteState(value);
  const { label, short, tone, Icon } = STATE_META[state];

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-sm px-2 py-0.5 text-[11px] font-medium leading-none whitespace-nowrap',
        tone,
        className
      )}
      title={label}
      aria-label={label}
    >
      <Icon className="h-3 w-3" aria-hidden />
      <span>{short}</span>
    </span>
  );
}
