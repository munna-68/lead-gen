'use client';

import { clsx } from 'clsx';
import type { LeadQuality, LeadStatus } from '@/lib/types';

interface FiltersProps {
  search: string;
  onSearchChange: (v: string) => void;
  status: LeadStatus | '';
  onStatusChange: (v: LeadStatus | '') => void;
  niche: string;
  onNicheChange: (v: string) => void;
  leadQuality: LeadQuality | '';
  onLeadQualityChange: (v: LeadQuality | '') => void;
  sourceGroup: string;
  onSourceGroupChange: (v: string) => void;
  niches: string[];
  sources: string[];
  totalCount: number;
  filteredCount: number;
}

const STATUSES: { value: LeadStatus | ''; label: string }[] = [
  { value: '', label: 'all' },
  { value: 'new', label: 'new' },
  { value: 'contacted', label: 'contacted' },
  { value: 'engaged', label: 'engaged' },
  { value: 'pitched', label: 'pitched' },
  { value: 'no_response', label: 'no response' },
  { value: 'closed', label: 'closed' },
  { value: 'dead', label: 'dead' },
];

export function Filters(props: FiltersProps) {
  return (
    <div className="border border-ink-3 bg-ink-1">
      <div className="grid grid-cols-1 gap-px border-b border-ink-3 bg-ink-3 sm:grid-cols-2 lg:grid-cols-5">
        <div className="bg-ink-1">
          <label className="block px-4 pb-1.5 pt-3 font-mono text-[10px] uppercase tracking-extra-wide text-fog-4">
            search
          </label>
          <input
            value={props.search}
            onChange={(e) => props.onSearchChange(e.target.value)}
            placeholder="name or business…"
            className="w-full bg-transparent px-4 pb-3 font-sans text-sm text-fog-1 placeholder:italic placeholder:text-fog-4 focus:outline-none"
          />
        </div>

        <FilterSelect
          label="status"
          value={props.status}
          onChange={(v) => props.onStatusChange(v as LeadStatus | '')}
          options={STATUSES}
        />
        <FilterSelect
          label="quality"
          value={props.leadQuality}
          onChange={(v) => props.onLeadQualityChange(v as LeadQuality | '')}
          options={[
            { value: '', label: 'all' },
            { value: 'warm', label: 'warm' },
            { value: 'cold', label: 'cold' },
          ]}
        />

        <div className="bg-ink-1">
          <label className="block px-4 pb-1.5 pt-3 font-mono text-[10px] uppercase tracking-extra-wide text-fog-4">
            niche
          </label>
          <select
            value={props.niche}
            onChange={(e) => props.onNicheChange(e.target.value)}
            className="w-full appearance-none bg-transparent px-4 pb-3 font-sans text-sm text-fog-1 focus:outline-none"
          >
            <option value="" className="bg-ink-2">
              all niches
            </option>
            {props.niches.map((n) => (
              <option key={n} value={n} className="bg-ink-2">
                {n}
              </option>
            ))}
          </select>
        </div>

        <div className="bg-ink-1">
          <label className="block px-4 pb-1.5 pt-3 font-mono text-[10px] uppercase tracking-extra-wide text-fog-4">
            source group
          </label>
          <select
            value={props.sourceGroup}
            onChange={(e) => props.onSourceGroupChange(e.target.value)}
            className="w-full appearance-none bg-transparent px-4 pb-3 font-sans text-sm text-fog-1 focus:outline-none"
          >
            <option value="" className="bg-ink-2">
              all sources
            </option>
            {props.sources.map((s) => (
              <option key={s} value={s} className="bg-ink-2">
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex items-center justify-between px-4 py-2.5 font-mono text-2xs uppercase tracking-extra-wide text-fog-3">
        <div className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 animate-pulse-soft rounded-full bg-amber" />
          <span>
            showing{' '}
            <span className="text-fog-1">{props.filteredCount.toString().padStart(2, '0')}</span>{' '}
            of{' '}
            <span className="text-fog-1">{props.totalCount.toString().padStart(2, '0')}</span>
          </span>
        </div>
        {props.filteredCount !== props.totalCount && (
          <button
            onClick={() => {
              props.onSearchChange('');
              props.onStatusChange('');
              props.onNicheChange('');
              props.onLeadQualityChange('');
              props.onSourceGroupChange('');
            }}
            className="text-amber transition-opacity hover:opacity-80"
          >
            reset filters
          </button>
        )}
      </div>
    </div>
  );
}

function FilterSelect<T extends string>({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: T | '';
  onChange: (v: T | '') => void;
  options: { value: T | ''; label: string }[];
}) {
  return (
    <div className="bg-ink-1">
      <label className="block px-4 pb-1.5 pt-3 font-mono text-[10px] uppercase tracking-extra-wide text-fog-4">
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as T | '')}
        className="w-full appearance-none bg-transparent px-4 pb-3 font-sans text-sm text-fog-1 focus:outline-none"
      >
        {options.map((o) => (
          <option key={o.value || 'all'} value={o.value} className="bg-ink-2">
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}
