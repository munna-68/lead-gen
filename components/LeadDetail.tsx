'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx } from 'clsx';
import type { Lead, LeadStatus } from '@/lib/types';
import { StatusBadge } from './StatusBadge';
import { QualityBadge } from './QualityBadge';
import { MessageDots } from './MessageDots';

const STATUSES: LeadStatus[] = [
  'new',
  'contacted',
  'engaged',
  'pitched',
  'no_response',
  'closed',
  'dead',
];

interface LeadDetailProps {
  lead: Lead | null;
  onClose: () => void;
  onUpdate: (id: string, updates: Partial<Lead>) => Promise<void>;
}

interface ToggleDef {
  key: keyof Lead;
  label: string;
  shortLabel: string;
}

const TOGGLES: ToggleDef[] = [
  { key: 'msg1_sent', label: 'M1 sent', shortLabel: 'M1' },
  { key: 'msg1_seen', label: 'M1 seen', shortLabel: 'M1v' },
  { key: 'msg1_replied', label: 'M1 reply', shortLabel: 'M1r' },
  { key: 'msg2_sent', label: 'M2 sent', shortLabel: 'M2' },
  { key: 'msg2_replied', label: 'M2 reply', shortLabel: 'M2r' },
  { key: 'msg3_sent', label: 'M3 sent', shortLabel: 'M3' },
];

export function LeadDetail({ lead, onClose, onUpdate }: LeadDetailProps) {
  const [notes, setNotes] = useState('');
  const [website, setWebsite] = useState('');
  const [copied, setCopied] = useState(false);
  const [savingNotes, setSavingNotes] = useState(false);
  const notesTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!lead) return;
    setNotes(lead.notes || '');
    setWebsite(lead.website || '');
    // Only re-sync when switching to a different lead. We deliberately don't
    // re-run on lead.notes/lead.website changes — that would clobber the
    // user's in-flight edits during auto-save.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lead?.id]);

  useEffect(() => {
    function onEsc(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    if (lead) window.addEventListener('keydown', onEsc);
    return () => window.removeEventListener('keydown', onEsc);
  }, [lead, onClose]);

  const toggle = async (key: keyof Lead) => {
    if (!lead) return;
    await onUpdate(lead.id, { [key]: !lead[key] } as Partial<Lead>);
  };

  const changeStatus = async (status: LeadStatus) => {
    if (!lead) return;
    await onUpdate(lead.id, { status });
  };

  const copyHook = async () => {
    if (!lead) return;
    try {
      await navigator.clipboard.writeText(lead.message_1_hook);
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    } catch {
      // noop
    }
  };

  const saveNotes = async (val: string) => {
    if (!lead) return;
    if (val === lead.notes) return;
    setSavingNotes(true);
    try {
      await onUpdate(lead.id, { notes: val });
    } finally {
      setSavingNotes(false);
    }
  };

  const saveWebsite = async (val: string) => {
    if (!lead) return;
    if (val === (lead.website || '')) return;
    await onUpdate(lead.id, { website: val || null });
  };

  return (
    <AnimatePresence>
      {lead && (
        <>
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-ink-0/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.aside
            key="panel"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 36 }}
            className="fixed right-0 top-0 z-50 flex h-screen w-full max-w-xl flex-col border-l border-ink-3 bg-ink-1"
          >
        {/* Header */}
        <header className="flex shrink-0 items-start justify-between border-b border-ink-3 px-7 py-5">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 font-mono text-2xs uppercase tracking-extra-wide text-fog-4">
              <span>lead</span>
              <span className="text-fog-5">/</span>
              <span className="text-fog-2">{lead.id.slice(0, 8)}</span>
            </div>
            <h2 className="mt-2 font-display text-3xl italic leading-none tracking-tightest text-fog-1">
              {lead.business_name || lead.name}
            </h2>
            <div className="mt-2 flex items-center gap-3 font-mono text-2xs uppercase tracking-extra-wide text-fog-3">
              {lead.business_name && <span>{lead.name}</span>}
              {lead.business_name && <span className="text-fog-5">·</span>}
              <span>{lead.niche}</span>
              <span className="text-fog-5">·</span>
              <span>{lead.location}</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="ml-4 grid h-8 w-8 place-items-center rounded-sm border border-ink-3 text-fog-3 transition-colors hover:border-ink-5 hover:text-fog-1"
            aria-label="Close"
          >
            ×
          </button>
        </header>

        <div className="flex-1 overflow-y-auto">
          {/* Status + quality row */}
          <section className="grid grid-cols-2 border-b border-ink-3">
            <div className="border-r border-ink-3 px-7 py-5">
              <div className="font-mono text-[10px] uppercase tracking-extra-wide text-fog-4">
                status
              </div>
              <div className="mt-2">
                <select
                  value={lead.status}
                  onChange={(e) => changeStatus(e.target.value as LeadStatus)}
                  className="w-full appearance-none border-b border-ink-4 bg-transparent py-1.5 font-mono text-sm uppercase tracking-extra-wide text-fog-1 outline-none focus:border-amber"
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s} className="bg-ink-2">
                      {s.replace('_', ' ')}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mt-2">
                <StatusBadge status={lead.status} />
              </div>
            </div>
            <div className="px-7 py-5">
              <div className="font-mono text-[10px] uppercase tracking-extra-wide text-fog-4">
                quality
              </div>
              <div className="mt-2">
                <QualityBadge quality={lead.lead_quality} />
              </div>
              <div className="mt-3 font-mono text-[10px] uppercase tracking-extra-wide text-fog-4">
                source · {lead.source_group}
              </div>
            </div>
          </section>

          {/* Message progress */}
          <section className="border-b border-ink-3 px-7 py-5">
            <div className="mb-4 flex items-center justify-between">
              <div className="font-mono text-[10px] uppercase tracking-extra-wide text-fog-4">
                message sequence
              </div>
              <MessageDots lead={lead} size="md" />
            </div>
            <div className="grid grid-cols-3 gap-2">
              {TOGGLES.map((t) => {
                const on = lead[t.key] as boolean;
                return (
                  <button
                    key={t.key}
                    onClick={() => toggle(t.key)}
                    className={clsx(
                      'group flex flex-col items-start gap-1.5 border px-3 py-2.5 text-left transition-all',
                      on
                        ? 'border-amber/50 bg-amber/[0.05]'
                        : 'border-ink-3 hover:border-ink-5'
                    )}
                  >
                    <div className="flex w-full items-center justify-between">
                      <span
                        className={clsx(
                          'font-mono text-[10px] uppercase tracking-extra-wide',
                          on ? 'text-amber' : 'text-fog-4'
                        )}
                      >
                        {t.label}
                      </span>
                      <span
                        className={clsx(
                          'font-mono text-2xs',
                          on ? 'text-amber' : 'text-fog-5'
                        )}
                      >
                        {on ? '●' : '○'}
                      </span>
                    </div>
                    <span
                      className={clsx(
                        'font-mono text-[10px]',
                        on ? 'text-amber-soft' : 'text-fog-4'
                      )}
                    >
                      {on ? 'on' : 'off'}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Message 1 hook */}
          <section className="border-b border-ink-3 px-7 py-5">
            <div className="mb-2 flex items-center justify-between">
              <div className="font-mono text-[10px] uppercase tracking-extra-wide text-fog-4">
                message 1 — hook
              </div>
              <button
                onClick={copyHook}
                className="font-mono text-2xs uppercase tracking-extra-wide text-amber transition-opacity hover:opacity-80"
              >
                {copied ? '✓ copied' : 'click to copy'}
              </button>
            </div>
            <div
              onClick={copyHook}
              className="cursor-pointer border-l-2 border-amber/40 bg-ink-2 px-4 py-3 font-sans text-sm leading-relaxed text-fog-1 transition-colors hover:bg-ink-3"
            >
              {lead.message_1_hook || (
                <span className="italic text-fog-4">no hook generated</span>
              )}
            </div>
          </section>

          {/* Post context */}
          {lead.post_context && (
            <section className="border-b border-ink-3 px-7 py-5">
              <div className="mb-2 font-mono text-[10px] uppercase tracking-extra-wide text-fog-4">
                post context
              </div>
              <p className="font-sans text-sm leading-relaxed text-fog-2">
                {lead.post_context}
              </p>
            </section>
          )}

          {/* Links */}
          <section className="grid grid-cols-1 gap-px border-b border-ink-3 bg-ink-3 sm:grid-cols-2">
            <div className="bg-ink-1 px-7 py-5">
              <div className="font-mono text-[10px] uppercase tracking-extra-wide text-fog-4">
                facebook
              </div>
              {lead.facebook_url ? (
                <a
                  href={lead.facebook_url}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 inline-block break-all font-sans text-sm text-amber underline-offset-4 hover:underline"
                >
                  {lead.facebook_url}
                </a>
              ) : (
                <p className="mt-2 font-sans text-sm italic text-fog-4">not provided</p>
              )}
            </div>
            <div className="bg-ink-1 px-7 py-5">
              <div className="flex items-center justify-between">
                <div className="font-mono text-[10px] uppercase tracking-extra-wide text-fog-4">
                  website
                </div>
                {lead.has_website === false && (
                  <span className="font-mono text-[10px] uppercase tracking-extra-wide text-fog-4">
                    none
                  </span>
                )}
              </div>
              <input
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                onBlur={(e) => saveWebsite(e.target.value)}
                placeholder="https://..."
                className="mt-2 w-full border-b border-ink-4 bg-transparent py-1 font-sans text-sm text-fog-1 placeholder:italic placeholder:text-fog-4 focus:border-amber focus:outline-none"
              />
            </div>
          </section>

          {/* Notes */}
          <section className="px-7 py-5">
            <div className="mb-2 flex items-center justify-between">
              <div className="font-mono text-[10px] uppercase tracking-extra-wide text-fog-4">
                notes
              </div>
              <div className="font-mono text-[10px] uppercase tracking-extra-wide text-fog-4">
                {savingNotes ? 'saving…' : 'auto-saves'}
              </div>
            </div>
            <textarea
              value={notes}
              onChange={(e) => {
                setNotes(e.target.value);
                if (notesTimer.current) clearTimeout(notesTimer.current);
                notesTimer.current = setTimeout(() => saveNotes(e.target.value), 700);
              }}
              rows={6}
              placeholder="conversation log, follow-up cadence, deal size…"
              className="w-full resize-none border border-ink-3 bg-ink-2 p-3 font-sans text-sm text-fog-1 placeholder:italic placeholder:text-fog-4 focus:border-amber focus:outline-none"
            />
          </section>
        </div>

        <footer className="shrink-0 border-t border-ink-3 px-7 py-3 font-mono text-[10px] uppercase tracking-extra-wide text-fog-4">
          <div className="flex items-center justify-between">
            <span>added {new Date(lead.created_at).toLocaleDateString()}</span>
            <span>updated {new Date(lead.updated_at).toLocaleDateString()}</span>
          </div>
        </footer>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
