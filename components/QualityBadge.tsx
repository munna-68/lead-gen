import * as React from 'react';
import { Badge } from '@/components/ui/Badge';
import type { LeadQuality } from '@/lib/types';

const QUALITY_LABELS: Record<LeadQuality, string> = {
  warm: 'Prime Target',
  cold: 'Low Priority',
};

const QUALITY_VARIANTS: Record<LeadQuality, 'success' | 'muted'> = {
  warm: 'success',
  cold: 'muted',
};

export function QualityBadge({
  quality,
  className,
}: {
  quality: LeadQuality;
  className?: string;
}) {
  return (
    <Badge variant={QUALITY_VARIANTS[quality]} className={className}>
      {QUALITY_LABELS[quality]}
    </Badge>
  );
}
