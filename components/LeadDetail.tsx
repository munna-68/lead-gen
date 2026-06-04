'use client';

import { useEffect, useRef, useState } from 'react';
import { X, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Lead, LeadStatus } from '@/lib/types';
import { QualityBadge } from '@/components/QualityBadge';
import { StatusPill } from '@/components/StatusPill';
import { Switch } from '@/components/ui/Switch';
import { Select } from '@/components/ui/Select';
import { Label } from '@/components/ui/Label';

const STATUSES: LeadStatus[] = [
  'new',
  'contacted',
  'engaged',
  'pitched',
  'no_response',
  'closed',
  'dead',
];

interface ToggleDef {
  key: keyof Lead;
  label: string;
}

const TOGGLES: ToggleDef[] = [
  { key: 'msg1_sent', label: 'M1 Sent' },
  { key: 'msg1_seen', label: 'M1 Seen' },
  { key: 'msg1_replied', label: 'M1 Reply' },
  { key: 'msg2_sent', label: 'M2 Sent' },
  { key: 'msg2_replied', label: 'M2 Reply' },
  { key: 'msg3_sent', label: 'M3 Sent' },
];

export function LeadDetail({
  lead,
  onClose,
  onUpdate,
}: {
  lead: Lead | null;
  onClose: () => void;
  onUpdate: (id: string, updates: Partial<Lead>) => Promise<void>;
}) {
  const [copied, setCopied] = useState(false);
  const [website, setWebsite] = useState('');
  const [notes, setNotes] = useState('');
  const notesTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!lead) return;
    setWebsite(lead.website || '');
    setNotes(lead.notes || '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lead?.id]);

  useEffect(() => {
    function onEsc(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    if (lead) {
      document.addEventListener('keydown', onEsc);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', onEsc);
      document.body.style.overflow = '';
    };
  }, [lead, onClose]);

  useEffect(() => {
    return () => {
      if (notesTimer.current) clearTimeout(notesTimer.current);
    };
  }, []);

  if (!lead) return null;

  const toggle = async (key: keyof Lead) => {
    await onUpdate(lead.id, { [key]: !lead[key] } as Partial<Lead>);
  };

  const changeStatus = async (status: LeadStatus) => {
    await onUpdate(lead.id, { status });
  };

  const copyHook = async () => {
    if (!lead.message_1_hook) return;
    try {
      await navigator.clipboard.writeText(lead.message_1_hook);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // noop
    }
  };

  const saveNotes = async (val: string) => {
    if (val === lead.notes) return;
    await onUpdate(lead.id, { notes: val });
  };

  const saveWebsite = async (val: string) => {
    if (val === (lead.website || '')) return;
    await onUpdate(lead.id, { website: val || null });
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });

  return (
    <div className="fixed inset-0 z-50 flex">
      <div
        aria-hidden
        onClick={onClose}
        className="flex-1 bg-foreground/30 backdrop-blur-[1px] animate-fade-in"
      />
      <aside
        role="dialog"
        aria-label={`Lead details for ${lead.business_name || lead.name}`}
        className="flex h-full w-full max-w-[480px] flex-col border-l border-border bg-surface animate-slide-in-right"
      >
        <header className="flex items-start justify-between gap-4 border-b border-border px-6 py-5">
          <div className="min-w-0 flex-1">
            <div className="font-num text-2xs uppercase tracking-[0.08em] text-muted-foreground">
              LEAD / {lead.id.slice(0, 8).toUpperCase()}
            </div>
            <h2 className="mt-2 text-[28px] font-semibold leading-tight tracking-tight text-foreground">
              {lead.business_name || lead.name}
            </h2>
            <div className="mt-1.5 text-[12px] text-muted-foreground">
              {lead.niche || '—'}
              {lead.niche && lead.location && <span className="mx-1.5 text-border">·</span>}
              {lead.location || '—'}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-surface-2 hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto">
          <section className="grid grid-cols-2 gap-px border-b border-border bg-border">
            <div className="bg-surface px-6 py-4">
              <Label className="mb-1.5 block">Status</Label>
              <Select
                value={lead.status}
                onChange={(e) => changeStatus(e.target.value as LeadStatus)}
                className="h-8"
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                  </option>
                ))}
              </Select>
              <div className="mt-2.5">
                <StatusPill status={lead.status} />
              </div>
            </div>
            <div className="bg-surface px-6 py-4">
              <Label className="mb-1.5 block">Quality</Label>
              <div className="mt-2.5">
                <QualityBadge quality={lead.lead_quality} />
              </div>
              <div className="mt-2.5 text-[12px] text-muted-foreground">
                {lead.source_group || 'No source'}
              </div>
            </div>
          </section>

          <section className="border-b border-border px-6 py-5">
            <Label className="mb-3 block">Message Sequence</Label>
            <div className="grid grid-cols-2 gap-x-4 gap-y-3">
              {TOGGLES.map((t) => {
                const on = lead[t.key] as boolean;
                return (
                  <div key={t.key} className="flex items-center justify-between">
                    <span className="text-[13px] text-foreground">{t.label}</span>
                    <Switch
                      checked={on}
                      onCheckedChange={() => toggle(t.key)}
                      aria-label={t.label}
                    />
                  </div>
                );
              })}
            </div>
          </section>

          <section className="border-b border-border px-6 py-5">
            <div className="mb-2.5 flex items-center justify-between">
              <Label>Message 1 Hook</Label>
              <button
                type="button"
                onClick={copyHook}
                disabled={!lead.message_1_hook}
                className="inline-flex items-center gap-1.5 font-num text-2xs uppercase tracking-[0.08em] text-accent transition-opacity hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {copied ? (
                  <>
                    <Check className="h-3 w-3" /> Copied
                  </>
                ) : (
                  'Click to copy'
                )}
              </button>
            </div>
            <blockquote
              onClick={copyHook}
              className={cn(
                'cursor-pointer border-l-2 border-border bg-surface-2 px-4 py-3 text-[14px] leading-relaxed text-foreground transition-colors',
                'hover:border-foreground/40',
                !lead.message_1_hook && 'italic text-muted-foreground'
              )}
            >
              {lead.message_1_hook || 'No hook generated yet.'}
            </blockquote>
          </section>

          {lead.post_context && (
            <section className="border-b border-border px-6 py-5">
              <Label className="mb-2.5 block">Post Context</Label>
              <p className="text-[13px] leading-relaxed text-foreground/90">{lead.post_context}</p>
            </section>
          )}

          {lead.facebook_url && (
            <section className="border-b border-border px-6 py-4">
              <Label className="mb-1.5 block">Facebook</Label>
              <a
                href={lead.facebook_url}
                target="_blank"
                rel="noreferrer"
                className="text-[13px] text-accent hover:underline"
              >
                {lead.facebook_url}
              </a>
            </section>
          )}

          <section className="border-b border-border px-6 py-5">
            <Label className="mb-2.5 block">Website</Label>
            <input
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              onBlur={(e) => saveWebsite(e.target.value)}
              placeholder="https://…"
              className="h-9 w-full rounded-md border border-input bg-surface px-3 text-[13px] text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background"
            />
          </section>

          <section className="px-6 py-5">
            <div className="mb-2.5 flex items-center justify-between">
              <Label>Notes</Label>
              <span className="font-num text-2xs uppercase tracking-[0.08em] text-muted-foreground">
                Auto-saves
              </span>
            </div>
            <textarea
              value={notes}
              onChange={(e) => {
                setNotes(e.target.value);
                if (notesTimer.current) clearTimeout(notesTimer.current);
                notesTimer.current = setTimeout(() => saveNotes(e.target.value), 700);
              }}
              rows={4}
              placeholder="Conversation log, follow-up cadence, deal size…"
              className="w-full resize-none rounded-md border border-input bg-surface p-3 text-[13px] leading-relaxed text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background"
            />
          </section>
        </div>

        <footer className="flex items-center justify-between border-t border-border px-6 py-3 font-num text-2xs uppercase tracking-[0.08em] text-muted-foreground">
          <span>ADDED {formatDate(lead.created_at)}</span>
          <span>UPDATED {formatDate(lead.updated_at)}</span>
        </footer>
      </aside>
    </div>
  );
}
