import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { bulkInsertLeads, findDuplicate } from '@/lib/db';
import type { ImportResult, LeadQuality } from '@/lib/types';

export const runtime = 'nodejs';
export const maxDuration = 60;

const MAX_LEADS = 5000;
const MAX_BODY_BYTES = 8 * 1024 * 1024;

const LeadInput = z.object({
  name: z.string().min(1).max(200),
  business_name: z.string().max(200).nullable().optional(),
  niche: z.string().max(120).optional().default(''),
  location: z.string().max(160).optional().default(''),
  facebook_url: z.string().url().max(500).nullable().optional(),
  website: z.string().url().max(500).nullable().optional(),
  has_website: z.boolean().nullable().optional(),
  post_context: z.string().max(4000).optional().default(''),
  message_1_hook: z.string().max(2000).optional().default(''),
  lead_quality: z.enum(['warm', 'cold']).optional().default('cold'),
  source_group: z.string().min(1).max(200),
  skip_reason: z.string().max(500).nullable().optional(),
});

const Body = z.union([
  z.array(LeadInput).max(MAX_LEADS),
  z.object({ leads: z.array(LeadInput).max(MAX_LEADS) }),
]);

function normalize(l: z.infer<typeof LeadInput>) {
  return {
    name: l.name.trim(),
    business_name: l.business_name?.trim() || null,
    niche: (l.niche || '').trim(),
    location: (l.location || '').trim(),
    facebook_url: l.facebook_url?.trim() || null,
    website: l.website?.trim() || null,
    has_website:
      typeof l.has_website === 'boolean'
        ? l.has_website
        : l.website
        ? true
        : null,
    post_context: l.post_context || '',
    message_1_hook: l.message_1_hook || '',
    lead_quality: l.lead_quality as LeadQuality,
    source_group: l.source_group.trim(),
    skip_reason: l.skip_reason?.trim() || null,
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

  const toInsert: ReturnType<typeof normalize>[] = [];
  const seenInBatch = new Set<string>();

  for (let i = 0; i < items.length; i++) {
    const lead = normalize(items[i]);

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
