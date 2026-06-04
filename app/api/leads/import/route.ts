import { NextRequest, NextResponse } from 'next/server';
import { bulkInsertLeads, findDuplicate } from '@/lib/db';
import type { ImportResult, LeadQuality } from '@/lib/types';

interface IncomingLead {
  name?: string;
  business_name?: string | null;
  niche?: string;
  location?: string;
  facebook_url?: string | null;
  website?: string | null;
  has_website?: boolean | null;
  post_context?: string;
  message_1_hook?: string;
  lead_quality?: LeadQuality;
  source_group?: string;
  skip_reason?: string | null;
}

function normalize(l: IncomingLead) {
  return {
    name: (l.name || '').trim(),
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
    lead_quality: (l.lead_quality === 'warm' ? 'warm' : 'cold') as LeadQuality,
    source_group: (l.source_group || '').trim(),
    skip_reason: l.skip_reason?.trim() || null,
  };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const raw: unknown = body?.leads ?? body;

    if (!Array.isArray(raw)) {
      return NextResponse.json(
        { error: 'Body must be a JSON array of leads, or { leads: [...] }' },
        { status: 400 }
      );
    }

    const result: ImportResult = {
      inserted: 0,
      skipped: 0,
      duplicates: 0,
      errors: [],
    };

    const toInsert: ReturnType<typeof normalize> = [];

    for (let i = 0; i < raw.length; i++) {
      const item = raw[i] as IncomingLead;
      const lead = normalize(item);

      if (!lead.name) {
        result.errors.push(`Row ${i + 1}: missing name`);
        continue;
      }
      if (!lead.source_group) {
        result.errors.push(`Row ${i + 1}: missing source_group`);
        continue;
      }

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
      // `inserted` reports only the qualifying leads that show up in the pipeline.
      // Skipped leads (with skip_reason) are still written to the DB so the
      // /skipped archive stays accurate, but they're not counted in `inserted`.
      const nonSkipped = toInsert.filter((l) => !l.skip_reason);
      await bulkInsertLeads(toInsert);
      result.inserted = nonSkipped.length;
    }

    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';
