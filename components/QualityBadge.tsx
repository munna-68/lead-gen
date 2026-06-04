import * as React from 'react';
import { Badge } from '@/components/ui/Badge';
import type { LeadQuality } from '@/lib/types';

export function QualityBadge({ quality }: { quality: LeadQuality }) {
  return (
    <Badge variant={quality === 'warm' ? 'accent' : 'muted'}>
      {quality}
    </Badge>
  );
}
