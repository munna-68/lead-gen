'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Check, Copy, ArrowRight } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';

const EXTRACTION_PROMPT = `You are a lead extraction assistant. I will give you the raw HTML of a saved Facebook group page. Extract every post and return a JSON array of leads.

For each role="article" element, extract one lead object with these exact keys:
author_name, facebook_profile_url, facebook_page_url, post_url, business_name, niche, location, post_context, message_1_hook, has_website, website, lead_quality, source_group, skip_reason

Rules:
- facebook_profile_url: first <a> href matching /groups/{id}/user/{id}/, strip tracking params
- facebook_page_url: <a> href matching facebook.com/{slug}/posts/ where slug is not groups/permalink/photo/video. Use just https://facebook.com/{slug}. For permalink.php links extract the id param.
- post_url: <a> href containing /groups/{slug}/posts/, strip tracking params
- post_context: longest text in <span dir="auto"> or <div dir="auto"> blocks, strip "… See more"
- location: text of <a> linking to a Facebook place page (pattern: [City-Name-digits]), or infer from post
- niche: 2-4 word phrase inferred from post content
- lead_quality: "warm" for local business posts, "cold" for off-topic/spam/international
- has_website: always "unknown"
- website: always null
- message_1_hook: 1-2 sentence casual DM opener referencing their post, no pitch, no mention of websites
- skip_reason: brief reason if not a real lead, otherwise null

Return ONLY a raw JSON array. No explanation, no markdown, no backticks. Start with [ and end with ].

Paste HTML below this line:`;

const STEPS = [
  { num: '01', text: 'Open Facebook group in Chrome' },
  { num: '02', text: 'Scroll down to load posts you want to capture' },
  { num: '03', text: 'Click the SingleFile extension icon (install from Chrome Web Store if needed)' },
  { num: '04', text: 'Open the downloaded .html file, press Ctrl+A, Ctrl+C' },
  { num: '05', text: 'Open Claude or ChatGPT, paste this prompt, then paste the HTML below it' },
  { num: '06', text: 'Copy the JSON response' },
  { num: '07', text: 'Go to the Import page and paste the JSON' },
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
      timer.current = setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-[960px] px-10 py-8">
      <PageHeader
        title="Extraction Prompt"
        subtitle="Save a Facebook group page with SingleFile, then paste the prompt + raw HTML into Claude or ChatGPT. Copy the resulting JSON into the Import page."
      />

      <div className="mb-3 flex items-center gap-2 font-num text-2xs uppercase tracking-[0.08em] text-muted-foreground">
        <span>Step 1</span>
        <ArrowRight className="h-3 w-3" />
        <span>Step 2</span>
        <ArrowRight className="h-3 w-3" />
        <span>Step 3</span>
        <span className="ml-3 text-muted-foreground/70">Copy · Paste · Import</span>
      </div>

      <div className="relative overflow-hidden rounded-lg border border-border bg-surface-2">
        <div className="flex items-center justify-between border-b border-border bg-surface px-4 py-2.5">
          <div className="font-num text-2xs uppercase tracking-[0.08em] text-muted-foreground">
            extraction-prompt.md
            <span className="mx-2 text-border">·</span>
            <span>{EXTRACTION_PROMPT.length.toString().padStart(4, '0')} chars</span>
          </div>
          <button
            type="button"
            onClick={copy}
            className="inline-flex h-7 items-center gap-1.5 rounded-md border border-accent px-3 font-num text-2xs uppercase tracking-[0.08em] text-accent transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            {copied ? (
              <>
                <Check className="h-3 w-3" /> Copied
              </>
            ) : (
              <>
                <Copy className="h-3 w-3" /> Copy Prompt
              </>
            )}
          </button>
        </div>

        <pre className="max-h-[520px] overflow-y-auto px-6 py-6 font-num text-[13px] leading-relaxed text-foreground">
          <code className="whitespace-pre-wrap">{EXTRACTION_PROMPT}</code>
        </pre>
      </div>

      <div className="mt-12 mb-3 flex items-center gap-2 font-num text-2xs uppercase tracking-[0.08em] text-muted-foreground">
        <span>Workflow</span>
      </div>

      <ol className="overflow-hidden rounded-lg border border-border">
        {STEPS.map((step, i) => (
          <li
            key={i}
            className={`flex items-start gap-4 px-5 py-3.5 ${
              i !== STEPS.length - 1 ? 'border-b border-border' : ''
            } bg-surface`}
          >
            <span className="mt-0.5 inline-flex h-6 w-7 shrink-0 items-center justify-center font-num text-2xs uppercase tracking-[0.08em] text-muted-foreground">
              {step.num}
            </span>
            <span className="text-[14px] leading-relaxed text-foreground">{step.text}</span>
          </li>
        ))}
      </ol>

      <div className="mt-8 flex items-center justify-end">
        <Link
          href="/import"
          className="inline-flex h-9 items-center gap-1.5 rounded-md border border-accent px-4 text-[13px] font-medium text-accent transition-colors hover:bg-accent hover:text-accent-foreground"
        >
          Go to Import <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}
