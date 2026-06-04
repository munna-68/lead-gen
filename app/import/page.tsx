'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import type { ImportResult } from '@/lib/types';

const SAMPLE = `[
  {
    "name": "Maya Patel",
    "business_name": "Bloom & Vine",
    "niche": "florist",
    "location": "Austin, TX",
    "facebook_url": "https://facebook.com/bloomandvine",
    "website": "https://bloomandvine.com",
    "has_website": true,
    "post_context": "Owner posted about a website redesign struggle; their current site is on Squarespace and they hate it.",
    "message_1_hook": "Saw your post about the Squarespace headaches — I redesign florist sites that actually convert wedding inquiries. Worth a quick look?",
    "lead_quality": "warm",
    "source_group": "Austin Small Biz Owners",
    "skip_reason": null
  },
  {
    "name": "Tariq Holmes",
    "business_name": "Holmes Home Repair",
    "niche": "contractor",
    "location": "Atlanta, GA",
    "facebook_url": null,
    "has_website": false,
    "post_context": null,
    "message_1_hook": null,
    "lead_quality": "cold",
    "source_group": "ATL Trades",
    "skip_reason": "no post context"
  }
]`;

export default function ImportPage() {
  const [raw, setRaw] = useState('');
  const [parsing, setParsing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);
  const [previewCount, setPreviewCount] = useState<number | null>(null);
  const [result, setResult] = useState<ImportResult | null>(null);

  const handleParse = () => {
    setParseError(null);
    setPreviewCount(null);
    if (!raw.trim()) {
      setParseError('Paste the JSON array first.');
      return;
    }
    setParsing(true);
    try {
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) {
        setParseError('Top-level value must be an array.');
        return;
      }
      setPreviewCount(parsed.length);
    } catch (e) {
      setParseError(e instanceof Error ? e.message : 'Invalid JSON');
    } finally {
      setParsing(false);
    }
  };

  const handleImport = async () => {
    setParseError(null);
    setResult(null);
    if (!raw.trim()) {
      setParseError('Paste the JSON array first.');
      return;
    }
    setSubmitting(true);
    try {
      const parsed = JSON.parse(raw);
      const res = await fetch('/api/leads/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leads: parsed }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setParseError(data.error || 'Import failed');
        return;
      }
      const data: ImportResult = await res.json();
      setResult(data);
    } catch (e) {
      setParseError(e instanceof Error ? e.message : 'Invalid JSON');
    } finally {
      setSubmitting(false);
    }
  };

  const reset = () => {
    setRaw('');
    setResult(null);
    setParseError(null);
    setPreviewCount(null);
  };

  return (
    <div className="mx-auto max-w-5xl px-5 py-8 md:px-10 md:py-12">
      <header className="mb-8 border-b border-ink-3 pb-6">
        <div className="flex items-center gap-3 font-mono text-2xs uppercase tracking-extra-wide text-fog-4">
          <Link href="/" className="hover:text-fog-1">
            ← pipeline
          </Link>
          <span className="text-fog-5">/</span>
          <span>import</span>
        </div>
        <h1 className="mt-3 font-display text-5xl italic leading-none tracking-tightest text-fog-1 md:text-6xl">
          Paste. <span className="text-amber">Ingest.</span> Begin.
        </h1>
        <p className="mt-3 max-w-2xl font-sans text-sm text-fog-3">
          Drop the JSON array from your AI extraction step. We&apos;ll filter skipped
          entries, de-dupe against your existing database, and import the rest.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_280px]">
        <div className="border border-ink-3 bg-ink-1">
          <div className="flex items-center justify-between border-b border-ink-3 px-4 py-2.5">
            <div className="flex items-center gap-3 font-mono text-2xs uppercase tracking-extra-wide text-fog-4">
              <span>leads.json</span>
              <span className="text-fog-5">·</span>
              <span>{raw.length.toString().padStart(4, '0')} chars</span>
            </div>
            <div className="flex items-center gap-3 font-mono text-2xs uppercase tracking-extra-wide text-fog-4">
              {previewCount !== null && (
                <span className="text-amber">
                  {previewCount.toString().padStart(2, '0')} rows
                </span>
              )}
              <button
                onClick={() => setRaw(SAMPLE)}
                className="text-amber transition-opacity hover:opacity-80"
              >
                load sample
              </button>
            </div>
          </div>

          <textarea
            value={raw}
            onChange={(e) => {
              setRaw(e.target.value);
              setPreviewCount(null);
              setResult(null);
              setParseError(null);
            }}
            placeholder='[{"name": "...", "niche": "...", ...}]'
            spellCheck={false}
            className="block h-[420px] w-full resize-none bg-ink-2 p-5 font-mono text-sm leading-relaxed text-fog-1 placeholder:italic placeholder:text-fog-4 focus:outline-none"
          />

          {parseError && (
            <div className="border-t border-status-no_response/30 bg-status-no_response/[0.06] px-4 py-2.5 font-mono text-2xs uppercase tracking-extra-wide text-status-no_response">
              ⚠ {parseError}
            </div>
          )}

          <div className="flex items-center justify-between gap-3 border-t border-ink-3 px-4 py-3">
            <button
              onClick={reset}
              className="font-mono text-2xs uppercase tracking-extra-wide text-fog-3 transition-colors hover:text-fog-1"
            >
              clear
            </button>
            <div className="flex items-center gap-2">
              <button
                onClick={handleParse}
                disabled={parsing || !raw.trim()}
                className="border border-ink-4 bg-ink-2 px-4 py-2 font-mono text-2xs uppercase tracking-extra-wide text-fog-1 transition-colors hover:border-ink-5 disabled:opacity-40"
              >
                validate
              </button>
              <button
                onClick={handleImport}
                disabled={submitting || !raw.trim()}
                className="border border-amber/40 bg-amber/[0.08] px-4 py-2 font-mono text-2xs uppercase tracking-extra-wide text-amber transition-colors hover:bg-amber/[0.16] disabled:opacity-40"
              >
                {submitting ? 'importing…' : 'import →'}
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar: schema hint + result */}
        <aside className="space-y-4">
          <div className="border border-ink-3 bg-ink-1">
            <div className="border-b border-ink-3 px-4 py-2.5 font-mono text-2xs uppercase tracking-extra-wide text-fog-4">
              expected fields
            </div>
            <ul className="divide-y divide-ink-3 font-mono text-xs">
              {[
                ['name', 'string · required'],
                ['business_name', 'string?'],
                ['niche', 'string'],
                ['location', 'string'],
                ['facebook_url', 'string?'],
                ['website', 'string?'],
                ['has_website', 'boolean?'],
                ['post_context', 'string'],
                ['message_1_hook', 'string'],
                ['lead_quality', 'warm | cold'],
                ['source_group', 'string'],
                ['skip_reason', 'string? (skips lead)'],
              ].map(([k, v]) => (
                <li
                  key={k}
                  className="flex items-center justify-between gap-3 px-4 py-1.5"
                >
                  <span className="text-fog-1">{k}</span>
                  <span className="text-2xs uppercase tracking-extra-wide text-fog-4">
                    {v}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {result && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="border border-amber/30 bg-amber/[0.04]"
            >
              <div className="border-b border-amber/20 px-4 py-2.5 font-mono text-2xs uppercase tracking-extra-wide text-amber">
                import complete
              </div>
              <div className="grid grid-cols-3 divide-x divide-ink-3">
                <div className="px-4 py-3">
                  <div className="font-mono text-[10px] uppercase tracking-extra-wide text-fog-4">
                    added
                  </div>
                  <div className="mt-1 font-display text-3xl italic tracking-tightest text-amber">
                    {result.inserted.toString().padStart(2, '0')}
                  </div>
                </div>
                <div className="px-4 py-3">
                  <div className="font-mono text-[10px] uppercase tracking-extra-wide text-fog-4">
                    skipped
                  </div>
                  <div className="mt-1 font-display text-3xl tracking-tightest text-fog-1">
                    {result.skipped.toString().padStart(2, '0')}
                  </div>
                </div>
                <div className="px-4 py-3">
                  <div className="font-mono text-[10px] uppercase tracking-extra-wide text-fog-4">
                    dupes
                  </div>
                  <div className="mt-1 font-display text-3xl tracking-tightest text-fog-1">
                    {result.duplicates.toString().padStart(2, '0')}
                  </div>
                </div>
              </div>
              <div className="border-t border-ink-3 px-4 py-3">
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 font-mono text-2xs uppercase tracking-extra-wide text-amber transition-opacity hover:opacity-80"
                >
                  view pipeline →
                </Link>
              </div>
            </motion.div>
          )}

          {result?.errors && result.errors.length > 0 && (
            <div className="border border-status-no_response/30 bg-status-no_response/[0.04]">
              <div className="border-b border-status-no_response/20 px-4 py-2.5 font-mono text-2xs uppercase tracking-extra-wide text-status-no_response">
                errors · {result.errors.length}
              </div>
              <ul className="divide-y divide-status-no_response/20 font-mono text-xs text-fog-2">
                {result.errors.map((e, i) => (
                  <li key={i} className="px-4 py-1.5">
                    {e}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
