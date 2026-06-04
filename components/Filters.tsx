'use client';

import * as React from 'react';
import { Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import type { LeadQuality, LeadStatus } from '@/lib/types';
import type { HasWebsiteFilter } from '@/lib/db';

interface FiltersProps {
  search: string;
  onSearchChange: (v: string) => void;
  status: LeadStatus | '';
  onStatusChange: (v: LeadStatus | '') => void;
  quality: LeadQuality | '';
  onQualityChange: (v: LeadQuality | '') => void;
  niche: string;
  onNicheChange: (v: string) => void;
  sourceGroup: string;
  onSourceGroupChange: (v: string) => void;
  hasWebsite: HasWebsiteFilter | '';
  onHasWebsiteChange: (v: HasWebsiteFilter | '') => void;
  niches: string[];
  sources: string[];
  totalCount: number;
  filteredCount: number;
}

const STATUS_OPTIONS: { value: LeadStatus | ''; label: string }[] = [
  { value: '', label: 'All statuses' },
  { value: 'new', label: 'New' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'engaged', label: 'Engaged' },
  { value: 'pitched', label: 'Pitched' },
  { value: 'no_response', label: 'No response' },
  { value: 'closed', label: 'Closed' },
  { value: 'dead', label: 'Dead' },
];

const QUALITY_OPTIONS: { value: LeadQuality | ''; label: string }[] = [
  { value: '', label: 'All qualities' },
  { value: 'warm', label: 'Prime Target' },
  { value: 'cold', label: 'Low Priority' },
];

const HAS_WEBSITE_OPTIONS: { value: HasWebsiteFilter | ''; label: string }[] = [
  { value: '', label: 'All website states' },
  { value: 'no', label: 'No website' },
  { value: 'yes', label: 'Has website' },
  { value: 'unknown', label: 'Unknown' },
];

export function Filters(props: FiltersProps) {
  const active =
    Boolean(props.search) ||
    Boolean(props.status) ||
    Boolean(props.quality) ||
    Boolean(props.niche) ||
    Boolean(props.sourceGroup) ||
    Boolean(props.hasWebsite);

  const reset = () => {
    props.onSearchChange('');
    props.onStatusChange('');
    props.onQualityChange('');
    props.onNicheChange('');
    props.onSourceGroupChange('');
    props.onHasWebsiteChange('');
  };

  return (
    <div>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr_1fr_1fr]">
        <div className="relative">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            value={props.search}
            onChange={(e) => props.onSearchChange(e.target.value)}
            placeholder="Search by name or business…"
            className="h-9 pl-8"
          />
        </div>

        <Select
          value={props.status}
          onChange={(e) => props.onStatusChange(e.target.value as LeadStatus | '')}
        >
          {STATUS_OPTIONS.map((o) => (
            <option key={o.value || 'all'} value={o.value}>
              {o.label}
            </option>
          ))}
        </Select>

        <Select
          value={props.quality}
          onChange={(e) => props.onQualityChange(e.target.value as LeadQuality | '')}
        >
          {QUALITY_OPTIONS.map((o) => (
            <option key={o.value || 'all'} value={o.value}>
              {o.label}
            </option>
          ))}
        </Select>

        <Select
          value={props.hasWebsite}
          onChange={(e) => props.onHasWebsiteChange(e.target.value as HasWebsiteFilter | '')}
        >
          {HAS_WEBSITE_OPTIONS.map((o) => (
            <option key={o.value || 'all'} value={o.value}>
              {o.label}
            </option>
          ))}
        </Select>

        <Select
          value={props.niche}
          onChange={(e) => props.onNicheChange(e.target.value)}
        >
          <option value="">All niches</option>
          {props.niches.map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </Select>

        <Select
          value={props.sourceGroup}
          onChange={(e) => props.onSourceGroupChange(e.target.value)}
        >
          <option value="">All sources</option>
          {props.sources.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </Select>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <div className="font-num text-[12px] text-muted-foreground">
          Showing{' '}
          <span className="text-foreground">{props.filteredCount.toString().padStart(2, '0')}</span>{' '}
          of{' '}
          <span className="text-foreground">{props.totalCount.toString().padStart(2, '0')}</span>
        </div>
        {active && (
          <button
            type="button"
            onClick={reset}
            className={cn(
              'text-[12px] text-muted-foreground transition-colors hover:text-foreground'
            )}
          >
            Reset filters
          </button>
        )}
      </div>
    </div>
  );
}
