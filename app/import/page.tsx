'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { AlertCircle, Check } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { Textarea } from '@/components/ui/Textarea';
import type { ImportResult } from '@/lib/types';

const SAMPLE = `[
  {
    "author_name": "Maya Patel",
    "facebook_profile_url": "https://facebook.com/maya.patel",
    "facebook_page_url": "https://facebook.com/bloomandvine",
    "post_url": "https://facebook.com/groups/austinsmallbiz/posts/1234567890/",
    "business_name": "Bloom & Vine",
    "niche": "florist",
    "location": "Austin, TX",
    "post_context": "Owner posted about a website redesign struggle; their current site is on Squarespace and they hate it.",
    "message_1_hook": "Saw your post about the Squarespace headaches — I redesign florist sites that actually convert wedding inquiries. Worth a quick look?",
    "has_website": "unknown",
    "website": null,
    "lead_quality": "warm",
    "source_group": "Austin Small Biz Owners",
    "skip_reason": null
  },
  {
    "author_name": "Tariq Holmes",
    "skip_reason": "no post context"
  }
]`;

export default function ImportPage() {
  const [raw, setRaw] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ImportResult | null>(null);

  const previewCount = useMemo(() => {
    if (!raw.trim()) return null;
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed.length;
      if (parsed && Array.isArray(parsed.leads)) return parsed.leads.length;
      return null;
    } catch {
      return null;
    }
  }, [raw]);

  const handleImport = async () => {
    setError(null);
    setResult(null);
    if (!raw.trim()) {
      setError('Paste the JSON array first.');
      return;
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Invalid JSON');
      return;
    }

    const leads = Array.isArray(parsed) ? parsed : (parsed as { leads?: unknown[] })?.leads;
    if (!Array.isArray(leads)) {
      setError('Top-level value must be a JSON array (or { leads: [...] }).');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/leads/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leads }),
      });
      if (!res.ok) {
        const text = await res.text();
        let msg = `HTTP ${res.status}`;
        try {
          const data = JSON.parse(text);
          msg = data.error || msg;
        } catch {
          msg = text ? `HTTP ${res.status} — ${text.slice(0, 120)}` : msg;
        }
        setError(msg);
        return;
      }
      const data: ImportResult = await res.json();
      setResult(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Import failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClear = () => {
    setRaw('');
    setError(null);
    setResult(null);
  };

  return (
    <div className="mx-auto w-full max-w-[1000px] px-10 py-8">
      <PageHeader
        title="Import Leads"
        subtitle="Paste the JSON array from Claude or ChatGPT below."
      />

      <div className="overflow-hidden rounded-lg border border-border bg-surface">
        <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
          <div className="font-num text-2xs uppercase tracking-[0.08em] text-muted-foreground">
            <span>leads.json</span>
            <span className="mx-2 text-border">·</span>
            <span>{raw.length.toString().padStart(4, '0')} chars</span>
            {previewCount !== null && (
              <>
                <span className="mx-2 text-border">·</span>
                <span className="text-accent">
                  {previewCount.toString().padStart(2, '0')} entries
                </span>
              </>
            )}
          </div>
          <div className="flex items-center gap-3 font-num text-2xs uppercase tracking-[0.08em]">
            {raw.trim() && (
              <button
                type="button"
                onClick={handleClear}
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                Clear
              </button>
            )}
            <button
              type="button"
              onClick={() => setRaw(SAMPLE)}
              className="text-accent transition-opacity hover:opacity-80"
            >
              Load sample
            </button>
          </div>
        </div>

        <Textarea
          value={raw}
          onChange={(e) => {
            setRaw(e.target.value);
            setError(null);
            setResult(null);
          }}
          placeholder='[{"author_name": "...", "post_context": "...", "facebook_profile_url": "...", ...}]'
          spellCheck={false}
          className="min-h-[320px] resize-y rounded-none border-0 bg-surface-2 font-num text-[13px] leading-relaxed focus-visible:ring-0 focus-visible:ring-offset-0"
        />

        {error && (
          <div className="flex items-start gap-2 border-t border-border bg-danger/5 px-4 py-2.5 text-[12px] text-danger">
            <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
            <span>{error}</span>
          </div>
        )}

        <div className="flex items-center justify-end gap-2 border-t border-border px-4 py-3">
          <button
            type="button"
            onClick={handleImport}
            disabled={submitting || !raw.trim()}
            className="inline-flex h-9 items-center gap-1.5 rounded-md border border-accent bg-accent px-4 text-[13px] font-medium text-accent-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting
              ? 'Importing…'
              : previewCount !== null
                ? `Import ${previewCount.toString().padStart(2, '0')} entries`
                : 'Import entries'}
          </button>
        </div>
      </div>

      {result && (
        <div className="mt-4 flex items-center gap-3 rounded-lg border border-border bg-surface px-5 py-4 text-[14px] text-foreground">
          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-success/10 text-success">
            <Check className="h-3.5 w-3.5" />
          </span>
          <span>
            <span className="font-semibold text-success">
              {result.inserted.toString().padStart(2, '0')} leads imported
            </span>
            <span className="mx-2 text-border">·</span>
            <span className="text-muted-foreground">
              {result.skipped.toString().padStart(2, '0')} skipped
            </span>
            <span className="mx-2 text-border">·</span>
            <span className="text-muted-foreground">
              {result.duplicates.toString().padStart(2, '0')} duplicates
            </span>
            {result.errors.length > 0 && (
              <>
                <span className="mx-2 text-border">·</span>
                <span className="text-danger">
                  {result.errors.length.toString().padStart(2, '0')} errors
                </span>
              </>
            )}
          </span>
          <Link
            href="/"
            className="ml-auto text-[13px] font-medium text-accent hover:underline"
          >
            View pipeline →
          </Link>
        </div>
      )}
    </div>
  );
}
