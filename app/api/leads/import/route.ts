import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { bulkInsertLeads, findDuplicate } from '@/lib/db';
import type { ImportResult, LeadQuality } from '@/lib/types';

export const runtime = 'nodejs';
export const maxDuration = 60;

const MAX_LEADS = 5000;
const MAX_BODY_BYTES = 8 * 1024 * 1024;

// Accepts null/undefined/empty, or a URL-like string with or without protocol.
// "www.example.com" and "example.com" both pass; "not a url" and "abc" don't.
const URLish = z
  .string()
  .max(500)
  .nullable()
  .optional()
  .refine(
    (val) => {
      if (val === null || val === undefined || val === '') return true;
      const normalized = /^https?:\/\//i.test(val) ? val : `https://${val}`;
      try {
        new URL(normalized);
        return true;
      } catch {
        return false;
      }
    },
    { message: 'Invalid URL' }
  );

const FullLeadInput = z.object({
  name: z.string().min(1).max(200),
  business_name: z.string().max(200).nullable().optional(),
  niche: z.string().max(120).optional().default(''),
  location: z.string().max(160).optional().default(''),
  facebook_url: URLish,
  website: URLish,
  has_website: z.boolean().nullable().optional(),
  post_context: z.string().max(4000).optional().default(''),
  message_1_hook: z.string().max(2000).optional().default(''),
  lead_quality: z.enum(['warm', 'cold']).optional().default('cold'),
  source_group: z.string().min(1).max(200),
  skip_reason: z.string().max(500).nullable().optional(),
});

const SkippedLeadInput = z.object({
  name: z.string().min(1).max(200),
  skip_reason: z.string().min(1).max(500),
});

// Mixed array: qualifying leads and skipped entries can be interleaved.
// A non-empty skip_reason means the entry is a skipped record; otherwise
// it must satisfy the full lead schema.
const Entry = z.union([FullLeadInput, SkippedLeadInput]);

const Body = z.union([
  z.array(Entry).max(MAX_LEADS),
  z.object({ leads: z.array(Entry).max(MAX_LEADS) }),
]);

function normalizeUrl(val: string | null | undefined): string | null {
  if (!val) return null;
  return /^https?:\/\//i.test(val) ? val : `https://${val}`;
}

function isSkipped(
  e: z.infer<typeof Entry>
): e is z.infer<typeof SkippedLeadInput> {
  return typeof e.skip_reason === 'string' && e.skip_reason.trim().length > 0;
}

function normalizeFull(l: z.infer<typeof FullLeadInput>) {
  const facebook_url = normalizeUrl(l.facebook_url);
  const website = normalizeUrl(l.website);
  return {
    name: l.name.trim(),
    business_name: l.business_name?.trim() || null,
    niche: (l.niche || '').trim(),
    location: (l.location || '').trim(),
    facebook_url,
    website,
    has_website:
      typeof l.has_website === 'boolean' ? l.has_website : website ? true : null,
    post_context: l.post_context || '',
    message_1_hook: l.message_1_hook || '',
    lead_quality: l.lead_quality as LeadQuality,
    source_group: l.source_group.trim(),
    skip_reason: l.skip_reason?.trim() || null,
  };
}

function normalizeSkipped(l: z.infer<typeof SkippedLeadInput>) {
  return {
    name: l.name.trim(),
    business_name: null,
    niche: '',
    location: '',
    facebook_url: null,
    website: null,
    has_website: null,
    post_context: '',
    message_1_hook: '',
    lead_quality: 'cold' as LeadQuality,
    source_group: '',
    skip_reason: l.skip_reason.trim(),
  };
}

export async function POST(req: NextRequest) {
  const contentLength = Number(req.headers.get('content-length') || '0');
  if (contentLength > MAX_BODY_BYTES) {
    return NextResponse.json({ error: 'Payload too large' }, { status: 413 });
  }

  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const parsed = Body.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid lead payload', issues: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const items = Array.isArray(parsed.data) ? parsed.data : parsed.data.leads;
  const result: ImportResult = {
    inserted: 0,
    skipped: 0,
    duplicates: 0,
    errors: [],
  };

  const toInsert: ReturnType<typeof normalizeFull | typeof normalizeSkipped>[] = [];
  const seenInBatch = new Set<string>();

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const lead = isSkipped(item) ? normalizeSkipped(item) : normalizeFull(item);

    const dedupeKey = `${lead.name}::${lead.source_group}`;
    if (seenInBatch.has(dedupeKey)) {
      result.duplicates++;
      continue;
    }
    seenInBatch.add(dedupeKey);

    if (lead.skip_reason) {
      result.skipped++;
      toInsert.push(lead);
      continue;
    }

    // source_group is required for qualifying leads (enforced by FullLeadInput).
    // Skipped entries skip the duplicate check because they have no source_group.
    const isDup = await findDuplicate(lead.name, lead.source_group);
    if (isDup) {
      result.duplicates++;
      continue;
    }

    toInsert.push(lead);
  }

  if (toInsert.length > 0) {
    const nonSkipped = toInsert.filter((l) => !l.skip_reason);
    await bulkInsertLeads(toInsert);
    result.inserted = nonSkipped.length;
  }

  return NextResponse.json(result);
}

export const dynamic = 'force-dynamic';
