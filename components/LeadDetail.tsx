'use client';

import { useEffect, useRef, useState } from 'react';
import {
  X,
  Check,
  Copy,
  ExternalLink,
  MessageSquare,
  User,
  FileText,
  Sparkles,
  ListChecks,
  Trash2,
  Link2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Lead, LeadStatus } from '@/lib/types';
import { QualityBadge } from '@/components/QualityBadge';
import { StatusPill } from '@/components/StatusPill';
import { hasWebsiteState, HasWebsiteIndicator } from '@/components/HasWebsiteIndicator';
import { Select } from '@/components/ui/Select';
import { Label } from '@/components/ui/Label';
import { Textarea } from '@/components/ui/Textarea';
import { Input } from '@/components/ui/Input';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';

const STATUSES: LeadStatus[] = [
  'new',
  'contacted',
  'engaged',
  'pitched',
  'no_response',
  'closed',
  'dead',
];

interface StepDef {
  key: keyof Lead;
  label: string;
}

const STEPS: StepDef[] = [
  { key: 'msg1_sent', label: 'M1 Sent' },
  { key: 'msg1_seen', label: 'M1 Seen' },
  { key: 'msg1_replied', label: 'M1 Replied' },
  { key: 'msg2_sent', label: 'M2 Sent' },
  { key: 'msg2_replied', label: 'M2 Replied' },
  { key: 'msg3_sent', label: 'M3 Sent' },
];

function hasWebsiteLabel(value: boolean | null): string {
  if (value === true) return 'Yes';
  if (value === false) return 'No';
  return 'Unknown';
}

function buildClaudePrompt(lead: Lead): string {
  const business = lead.business_name?.trim() || lead.niche?.trim() || 'not specified';
  const location = lead.location?.trim() || 'not specified';
  const post = lead.post_context?.trim() || 'not specified';
  const website = lead.website?.trim() || 'not known';

  return `Write a short casual Facebook DM opener for a web design cold outreach. Do not pitch anything. Just start a conversation.
Person's name: ${lead.name}
Business: ${business}
Location: ${location}
What they posted: ${post}
Do they have a website: ${hasWebsiteLabel(lead.has_website)}
Website if known: ${website}
The message should reference something specific about their business or post. Keep it under 3 sentences. Conversational, not salesy.`;
}

function BlockHeader({
  icon: Icon,
  eyebrow,
  title,
  right,
}: {
  icon: React.ComponentType<{ className?: string }>;
  eyebrow: string;
  title: string;
  right?: React.ReactNode;
}) {
  return (
    <div className="mb-3 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Icon className="h-3.5 w-3.5 text-muted-foreground" aria-hidden />
        <div>
          <div className="font-num text-2xs uppercase tracking-[0.08em] text-muted-foreground">
            {eyebrow}
          </div>
          <div className="text-[14px] font-semibold tracking-tight text-foreground">
            {title}
          </div>
        </div>
      </div>
      {right}
    </div>
  );
}

function CopyButton({
  text,
  disabled,
  className,
}: {
  text: string;
  disabled?: boolean;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  const onCopy = async () => {
    if (disabled || !text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), 1500);
    } catch {
      // noop
    }
  };

  return (
    <button
      type="button"
      onClick={onCopy}
      disabled={disabled || !text}
      className={cn(
        'inline-flex h-7 items-center gap-1.5 rounded-md border border-accent px-2.5 font-num text-2xs uppercase tracking-[0.08em] text-accent transition-colors hover:bg-accent hover:text-accent-foreground disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
    >
      {copied ? (
        <>
          <Check className="h-3 w-3" /> Copied
        </>
      ) : (
        <>
          <Copy className="h-3 w-3" /> Copy
        </>
      )}
    </button>
  );
}

export function LeadDetail({
  lead,
  onClose,
  onUpdate,
  onDelete,
}: {
  lead: Lead | null;
  onClose: () => void;
  onUpdate: (id: string, updates: Partial<Lead>) => Promise<void>;
  onDelete: (id: string) => Promise<void> | void;
}) {
  const [website, setWebsite] = useState('');
  const [facebookUrl, setFacebookUrl] = useState('');
  const [facebookPageUrl, setFacebookPageUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!lead) return;
    setWebsite(lead.website || '');
    setFacebookUrl(lead.facebook_url || '');
    setFacebookPageUrl(lead.facebook_page_url || '');
    setNotes(lead.notes || '');
    setConfirmDeleteOpen(false);
  }, [lead?.id]);

  useEffect(() => {
    function onEsc(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        if (confirmDeleteOpen) return;
        onClose();
      }
    }
    if (lead) {
      document.addEventListener('keydown', onEsc);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', onEsc);
      document.body.style.overflow = '';
    };
  }, [lead, onClose, confirmDeleteOpen]);

  if (!lead) return null;

  const same = !lead.business_name ||
    lead.business_name.trim().toLowerCase() === lead.name.trim().toLowerCase();
  const primaryName = lead.name;
  const secondaryName = same ? null : lead.business_name;

  const toggleStep = async (key: keyof Lead) => {
    await onUpdate(lead.id, { [key]: !lead[key] } as Partial<Lead>);
  };

  const changeStatus = async (status: LeadStatus) => {
    await onUpdate(lead.id, { status });
  };

  const setHasWebsite = async (value: boolean | null) => {
    await onUpdate(lead.id, { has_website: value });
  };

  const saveFacebook = async (val: string) => {
    if (val === (lead.facebook_url || '')) return;
    await onUpdate(lead.id, { facebook_url: val.trim() || null });
  };

  const saveFacebookPage = async (val: string) => {
    if (val === (lead.facebook_page_url || '')) return;
    await onUpdate(lead.id, { facebook_page_url: val.trim() || null });
  };

  const saveWebsite = async (val: string) => {
    if (val === (lead.website || '')) return;
    await onUpdate(lead.id, { website: val.trim() || null });
  };

  const saveNotes = async (val: string) => {
    if (val === (lead.notes || '')) return;
    await onUpdate(lead.id, { notes: val });
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await onDelete(lead.id);
      setConfirmDeleteOpen(false);
    } finally {
      setDeleting(false);
    }
  };

  const claudePrompt = buildClaudePrompt(lead);
  const hasWebsiteCurrent = hasWebsiteState(lead.has_website);

  return (
    <div className="fixed inset-0 z-[60] flex">
      <div
        aria-hidden
        onClick={onClose}
        className="absolute inset-0 bg-foreground/30 backdrop-blur-[1px] animate-fade-in"
      />
      <aside
        role="dialog"
        aria-label={`Lead details for ${lead.business_name || lead.name}`}
        className="relative ml-auto flex h-full w-full flex-col border-border bg-surface max-md:absolute max-md:inset-x-0 max-md:bottom-0 max-md:top-[6vh] max-md:rounded-t-2xl max-md:border-t max-md:animate-slide-up md:ml-0 md:max-w-[620px] md:border-l md:animate-slide-in-right"
      >
        <div
          aria-hidden
          className="absolute left-1/2 top-1.5 z-10 h-1 w-10 -translate-x-1/2 rounded-full bg-border md:hidden"
        />
        <header className="flex items-start justify-between gap-4 border-b border-border px-5 py-5 sm:px-7">
          <div className="min-w-0 flex-1">
            <div className="font-num text-2xs uppercase tracking-[0.08em] text-muted-foreground">
              LEAD · {lead.id.slice(0, 8).toUpperCase()}
            </div>
            <h2 className="mt-2 text-[24px] font-semibold leading-tight tracking-tight text-foreground sm:text-[28px]">
              {primaryName}
            </h2>
            {secondaryName && (
              <div className="mt-1 text-[14px] text-muted-foreground">
                {secondaryName}
              </div>
            )}
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <QualityBadge quality={lead.lead_quality} />
              <StatusPill status={lead.status} />
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-surface-2 hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </header>

        <div className="flex-1 space-y-7 overflow-y-auto px-5 py-6 sm:px-7 pb-safe">
          {/* BLOCK 1 — WHO IS THIS PERSON */}
          <section>
            <BlockHeader icon={User} eyebrow="Block 1" title="Who is this person" />

            <div className="space-y-3">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <Label className="mb-1.5 block">Niche</Label>
                  <div className="rounded-md border border-input bg-surface-2 px-3 py-2 text-[13px] text-foreground">
                    {lead.niche || '—'}
                  </div>
                </div>
                <div>
                  <Label className="mb-1.5 block">Location</Label>
                  <div className="rounded-md border border-input bg-surface-2 px-3 py-2 text-[13px] text-foreground">
                    {lead.location || '—'}
                  </div>
                </div>
              </div>

              <div>
                <Label className="mb-1.5 block">Source group</Label>
                <div className="rounded-md border border-input bg-surface-2 px-3 py-2 text-[13px] text-foreground">
                  {lead.source_group || '—'}
                </div>
              </div>

              <div>
                <Label className="mb-1.5 block">Facebook profile</Label>
                <div className="flex items-center gap-2">
                  <Input
                    value={facebookUrl}
                    onChange={(e) => setFacebookUrl(e.target.value)}
                    onBlur={(e) => saveFacebook(e.target.value)}
                    placeholder="Paste profile URL here"
                    className="flex-1"
                  />
                  {lead.facebook_url && (
                    <a
                      href={lead.facebook_url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-md border border-accent px-3 font-num text-2xs uppercase tracking-[0.08em] text-accent transition-colors hover:bg-accent hover:text-accent-foreground"
                    >
                      Open <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
              </div>

              <div>
                <Label className="mb-1.5 block">Facebook page</Label>
                <div className="flex items-center gap-2">
                  <Input
                    value={facebookPageUrl}
                    onChange={(e) => setFacebookPageUrl(e.target.value)}
                    onBlur={(e) => saveFacebookPage(e.target.value)}
                    placeholder="https://facebook.com/..."
                    className="flex-1"
                  />
                  {lead.facebook_page_url && (
                    <a
                      href={lead.facebook_page_url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-md border border-accent px-3 font-num text-2xs uppercase tracking-[0.08em] text-accent transition-colors hover:bg-accent hover:text-accent-foreground"
                    >
                      Open <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
              </div>

              {lead.post_url && (
                <div>
                  <Label className="mb-1.5 block">Original post</Label>
                  <a
                    href={lead.post_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex h-9 items-center gap-1.5 rounded-md border border-accent bg-accent/5 px-3 text-[13px] font-medium text-accent transition-colors hover:bg-accent hover:text-accent-foreground"
                  >
                    <Link2 className="h-3.5 w-3.5" />
                    View Post <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              )}

              <div>
                <Label className="mb-1.5 block">Has website</Label>
                <div className="grid grid-cols-3 overflow-hidden rounded-md border border-input">
                  {(['unknown', 'no', 'yes'] as const).map((s, i) => {
                    const active = hasWebsiteCurrent === s;
                    const value: boolean | null = s === 'yes' ? true : s === 'no' ? false : null;
                    return (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setHasWebsite(value)}
                        className={cn(
                          'px-2.5 py-2 font-num text-2xs uppercase tracking-[0.08em] transition-colors',
                          i !== 0 && 'border-l border-input',
                          active
                            ? 'bg-accent text-accent-foreground'
                            : 'bg-surface text-muted-foreground hover:bg-surface-2 hover:text-foreground'
                        )}
                      >
                        {s === 'yes' ? 'Has website' : s === 'no' ? 'No website' : 'Unknown'}
                      </button>
                    );
                  })}
                </div>
                <div className="mt-2">
                  <HasWebsiteIndicator value={lead.has_website} />
                </div>
              </div>

              <div>
                <Label className="mb-1.5 block">Website URL</Label>
                <Input
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  onBlur={(e) => saveWebsite(e.target.value)}
                  placeholder="https://…"
                />
              </div>
            </div>
          </section>

          {/* BLOCK 2 — WHAT DID THEY POST */}
          {lead.post_context && (
            <section>
              <BlockHeader icon={FileText} eyebrow="Block 2" title="Their post" />
              <blockquote className="rounded-md border border-input bg-surface-2 px-4 py-3 text-[13.5px] leading-relaxed text-foreground">
                {lead.post_context}
              </blockquote>
            </section>
          )}

          {/* BLOCK 3 — MESSAGE 1 */}
          <section>
            <BlockHeader
              icon={MessageSquare}
              eyebrow="Block 3"
              title="Suggested opener"
              right={
                <CopyButton text={lead.message_1_hook} disabled={!lead.message_1_hook} />
              }
            />
            <div className="rounded-md border border-input bg-surface-2 px-4 py-3 text-[14px] leading-relaxed text-foreground">
              {lead.message_1_hook || (
                <span className="italic text-muted-foreground">
                  No opener generated yet.
                </span>
              )}
            </div>

            <div className="mt-5">
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-3.5 w-3.5 text-accent" aria-hidden />
                  <Label>Claude prompt</Label>
                </div>
                <CopyButton text={claudePrompt} />
              </div>
              <p className="mb-2 text-[12px] text-muted-foreground">
                Copy this into Claude if you want a stronger Message 1.
              </p>
              <pre className="max-h-[280px] overflow-y-auto whitespace-pre-wrap rounded-md border border-input bg-surface-2 px-4 py-3 font-num text-[12.5px] leading-relaxed text-foreground/90">
                {claudePrompt}
              </pre>
            </div>
          </section>

          {/* BLOCK 4 — OUTREACH PROGRESS */}
          <section>
            <BlockHeader icon={ListChecks} eyebrow="Block 4" title="Outreach progress" />

            <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
              {STEPS.map((step) => {
                const done = lead[step.key] as boolean;
                return (
                  <button
                    key={step.key}
                    type="button"
                    onClick={() => toggleStep(step.key)}
                    aria-pressed={done}
                    aria-label={step.label}
                    title={step.label}
                    className={cn(
                      'inline-flex h-9 items-center justify-center rounded-md border px-1.5 font-num text-[10.5px] font-semibold uppercase tracking-[0.04em] transition-colors',
                      done
                        ? 'border-accent bg-accent text-accent-foreground'
                        : 'border-input bg-surface text-muted-foreground hover:border-foreground/30 hover:text-foreground'
                    )}
                  >
                    {step.label}
                  </button>
                );
              })}
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Label className="mb-1.5 block">Status</Label>
                <Select
                  value={lead.status}
                  onChange={(e) => changeStatus(e.target.value as LeadStatus)}
                  className="h-9"
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
              <div>
                <Label className="mb-1.5 block">Quality</Label>
                <div className="h-9 rounded-md border border-input bg-surface-2 px-3 flex items-center">
                  <QualityBadge quality={lead.lead_quality} />
                </div>
              </div>
            </div>

            <div className="mt-5">
              <div className="mb-1.5 flex items-center justify-between">
                <Label>Notes</Label>
                <span className="font-num text-2xs uppercase tracking-[0.08em] text-muted-foreground">
                  Auto-saves on blur
                </span>
              </div>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                onBlur={(e) => saveNotes(e.target.value)}
                rows={4}
                placeholder="Conversation log, follow-up cadence, deal size…"
              />
            </div>
          </section>

          <section className="border-t border-border pt-6">
            <button
              type="button"
              onClick={() => setConfirmDeleteOpen(true)}
              className="inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-md border border-danger bg-danger/5 px-4 text-[13px] font-medium text-danger transition-colors hover:bg-danger hover:text-white"
            >
              <Trash2 className="h-3.5 w-3.5" /> Delete Lead
            </button>
          </section>
        </div>
      </aside>

      <ConfirmDialog
        open={confirmDeleteOpen}
        onOpenChange={(o) => !deleting && setConfirmDeleteOpen(o)}
        title={`Delete ${lead.name}?`}
        description="This will permanently remove the lead from the database. This cannot be undone."
        confirmLabel="Delete"
        destructive
        busy={deleting}
        onConfirm={handleDelete}
      />
    </div>
  );
}
