'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Check, Copy, ArrowRight } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';

const EXTRACTION_PROMPT = `You are a lead extraction assistant for a web design business. When I paste raw Facebook group post content, extract qualifying leads and return a JSON array only. No explanation, no commentary, just the JSON.
A qualifying lead is a small business owner or independent service provider who could benefit from a website. Include: contractors, tradespeople, cleaners, painters, flooring installers, tile workers, pet services, photographers, food businesses, boutiques, event services, consultants with a real practice, lawyers, insurance agents, real estate agents, and similar.
Skip: job seekers, people looking to hire, people asking for recommendations, event promoters with no business, motivational posts, travel agents, generic commenters with no business context.
For each qualifying lead return:
{
name: person name as shown,
business_name: business name if different from person name else null,
niche: 1-3 words e.g. Tile Installer / Painting Contractor / Pet Boarding,
location: city and state if mentioned else infer from group name,
facebook_url: profile or page URL if visible in the text else null,
website: website URL if mentioned in post else null,
post_context: 1-2 sentences — what did they post and what does their business do,
message_1_hook: short casual DM opener referencing something specific from their post, no pitch, under 3 sentences,
has_website: null,
lead_quality: warm if they described services in detail or have an active page, cold if minimal info,
source_group: exact name of the Facebook group
}
For skipped entries return:
{
name: their name,
skip_reason: one short reason
}
Return one flat JSON array with both leads and skipped entries mixed. No markdown. No text before or after the array.`;

const STEPS = [
  { num: '01', text: 'Copy the prompt below.' },
  { num: '02', text: 'Open Claude (claude.ai) or ChatGPT in a fresh conversation.' },
  { num: '03', text: 'Paste the prompt as message #1.' },
  { num: '04', text: 'Open a Facebook business group and copy a chunk of post text.' },
  { num: '05', text: 'Paste the Facebook text as message #2.' },
  { num: '06', text: 'Copy the JSON array the AI returns.' },
  { num: '07', text: 'Go to the Import page and paste it.' },
  { num: '08', text: 'Click Import. Your leads appear in the pipeline automatically.' },
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
        subtitle="Copy this prompt, go to Claude or ChatGPT, paste it followed by raw Facebook group text. Paste the resulting JSON into the Import page."
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
