'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import { clsx } from 'clsx';

const EXTRACTION_PROMPT = `You are a lead extraction assistant for a web design business. When I paste raw Facebook group post content, your job is to extract qualifying leads and return a JSON array. Nothing else — no explanation, no commentary, just the JSON.

A qualifying lead is: a small business owner or service provider who could benefit from a website. Include contractors, cleaners, painters, flooring installers, boutiques, charters, concrete/flooring companies, HR firms, real estate agents, coaches with a real business, and similar.

Skip: job seekers, people looking to hire, event promoters with no clear business, motivational posters with no business context, travel agents promoting deals, individuals asking for recommendations.

For each qualifying lead, return this exact structure:
{
  "name": "person or business name as shown",
  "business_name": "business name if different from poster name, else null",
  "niche": "1-3 word description e.g. Painting Contractor, Tile Installer, Cleaning Service",
  "location": "city and state if mentioned, else infer from group name",
  "facebook_url": "profile or page URL if visible in the text, else null",
  "website": null,
  "post_context": "1-2 sentence summary of what they posted and what their business does",
  "message_1_hook": "a short, casual, human-sounding opening DM — reference something specific from their post or business, no pitch, just start a conversation",
  "has_website": null,
  "lead_quality": "warm or cold — warm if they described their services in detail or have an active page, cold if minimal info",
  "source_group": "name of the Facebook group"
}

For skipped posts, return:
{
  "name": "their name",
  "skip_reason": "one short reason"
}

Return one flat JSON array containing both leads and skipped entries. Do not wrap it in markdown. Do not add any text before or after the array.`;

const STEPS: { text: string; emphasis?: string }[] = [
  { text: 'Click "Copy Prompt" above' },
  { text: 'Open Claude at ', emphasis: 'claude.ai', tail: ' or ChatGPT' },
  { text: 'Start a new conversation and paste the prompt as your first message' },
  { text: 'Go to a Facebook business group and scroll through the posts' },
  { text: 'Select all visible post text, copy it, and paste it as your next message' },
  { text: 'The AI will return a JSON array' },
  { text: 'Copy the entire JSON response' },
  { text: 'Go to the Import page in this app and paste it there' },
  { text: 'Hit ', emphasis: 'Import', tail: ' — your leads will be added to the dashboard automatically' },
];

export default function PromptPage() {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(EXTRACTION_PROMPT);
      setCopied(true);
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-5 py-8 md:px-10 md:py-12">
      {/* Header */}
      <header className="mb-10 border-b border-ink-3 pb-6">
        <div className="font-mono text-2xs uppercase tracking-extra-wide text-fog-4">
          workflow · the brief
        </div>
        <h1 className="mt-3 font-display text-5xl italic leading-none tracking-tightest text-fog-1 md:text-6xl">
          The <span className="text-amber">brief</span>.
        </h1>
        <p className="mt-3 max-w-2xl font-sans text-sm text-fog-3">
          A two-step ritual. First, the prompt that turns Facebook noise into qualified
          leads. Then, the workflow to run it.
        </p>
      </header>

      {/* Section 1 — Extraction prompt */}
      <section className="mb-14">
        <SectionHeader index="01" label="copy" title="Step 1: Copy this prompt" />

        <div className="border border-ink-3 bg-ink-1">
          {/* Window chrome */}
          <div className="flex items-center justify-between gap-3 border-b border-ink-3 bg-ink-2 px-4 py-2.5">
            <div className="flex items-center gap-3 font-mono text-2xs uppercase tracking-extra-wide text-fog-4">
              <span className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-amber/60" />
                <span className="h-1.5 w-1.5 rounded-full bg-fog-5" />
                <span className="h-1.5 w-1.5 rounded-full bg-fog-5" />
              </span>
              <span className="ml-1.5">extraction-prompt.md</span>
              <span className="text-fog-5">·</span>
              <span>{EXTRACTION_PROMPT.length.toString().padStart(4, '0')} chars</span>
            </div>
            <div className="flex items-center gap-2 font-mono text-2xs uppercase tracking-extra-wide">
              {copied ? (
                <motion.span
                  initial={{ opacity: 0, y: 2 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-amber"
                >
                  ✓ copied
                </motion.span>
              ) : (
                <span className="text-fog-4">read-only</span>
              )}
            </div>
          </div>

          {/* Code block */}
          <pre className="max-h-[480px] overflow-y-auto bg-ink-1 p-6 font-mono text-[13px] leading-relaxed text-fog-1">
            <code className="whitespace-pre-wrap">{EXTRACTION_PROMPT}</code>
          </pre>

          {/* Footer with copy button */}
          <div className="flex items-center justify-between gap-3 border-t border-ink-3 bg-ink-2 px-4 py-3">
            <div className="font-mono text-2xs uppercase tracking-extra-wide text-fog-4">
              paste this into a fresh chat as message 01
            </div>
            <button
              onClick={copy}
              className={clsx(
                'group inline-flex items-center gap-2 border px-4 py-2 font-mono text-2xs uppercase tracking-extra-wide transition-all',
                copied
                  ? 'border-amber/50 bg-amber/[0.1] text-amber'
                  : 'border-amber/40 bg-amber/[0.06] text-amber hover:bg-amber/[0.14]'
              )}
            >
              <CopyIcon />
              {copied ? 'Copied!' : 'Copy Prompt'}
            </button>
          </div>
        </div>
      </section>

      {/* Section 2 — Workflow */}
      <section>
        <SectionHeader index="02" label="workflow" title="Step 2: Follow this workflow" />

        <ol className="border border-ink-3 bg-ink-1">
          {STEPS.map((step, i) => (
            <li
              key={i}
              className={clsx(
                'group flex items-start gap-5 px-5 py-4 transition-colors hover:bg-ink-2',
                i !== STEPS.length - 1 && 'border-b border-ink-3'
              )}
            >
              <span className="mt-0.5 inline-flex w-9 shrink-0 items-center justify-center border border-ink-3 bg-ink-2 px-1.5 py-1 font-mono text-2xs uppercase tracking-extra-wide text-amber group-hover:border-amber/40">
                {(i + 1).toString().padStart(2, '0')}
              </span>
              <span className="min-w-0 flex-1 pt-0.5 font-sans text-sm leading-relaxed text-fog-1">
                {step.text}
                {step.emphasis && (
                  <span className="text-amber">{step.emphasis}</span>
                )}
                {step.tail && (
                  <span className="text-fog-2">{step.tail}</span>
                )}
              </span>
            </li>
          ))}
        </ol>

        <div className="mt-8 flex items-center justify-between">
          <div className="font-mono text-2xs uppercase tracking-extra-wide text-fog-4">
            // end of workflow
          </div>
          <Link
            href="/import"
            className="group inline-flex items-center gap-2 border border-amber/40 bg-amber/[0.06] px-5 py-2.5 font-mono text-2xs uppercase tracking-extra-wide text-amber transition-colors hover:bg-amber/[0.14]"
          >
            <span>Go to Import</span>
            <span className="transition-transform group-hover:translate-x-1">→</span>
          </Link>
        </div>
      </section>
    </div>
  );
}

function SectionHeader({
  index,
  label,
  title,
}: {
  index: string;
  label: string;
  title: string;
}) {
  return (
    <div className="mb-5 flex items-end justify-between gap-4">
      <h2 className="font-display text-3xl italic leading-none tracking-tightest text-fog-1 md:text-4xl">
        {title}
      </h2>
      <div className="flex items-center gap-2 font-mono text-2xs uppercase tracking-extra-wide text-fog-4">
        <span className="text-amber">{index}</span>
        <span className="text-fog-5">/</span>
        <span>{label}</span>
      </div>
    </div>
  );
}

function CopyIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="square"
      strokeLinejoin="miter"
      aria-hidden="true"
    >
      <rect x="5" y="5" width="9" height="9" />
      <path d="M3 11V2h9" />
    </svg>
  );
}
