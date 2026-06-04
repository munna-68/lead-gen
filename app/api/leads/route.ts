import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getLeadsSafe } from '@/lib/db';

const HAS_WEBSITE_VALUES = ['yes', 'no', 'unknown'] as const;
type HasWebsiteFilter = (typeof HAS_WEBSITE_VALUES)[number];

function parseHasWebsiteFilter(raw: string | null): HasWebsiteFilter | undefined {
  if (!raw) return undefined;
  if ((HAS_WEBSITE_VALUES as readonly string[]).includes(raw)) {
    return raw as HasWebsiteFilter;
  }
  return undefined;
}

const Query = z.object({
  status: z
    .enum(['new', 'contacted', 'engaged', 'pitched', 'no_response', 'closed', 'dead'])
    .optional(),
  niche: z.string().max(120).optional(),
  lead_quality: z.enum(['warm', 'cold']).optional(),
  source_group: z.string().max(200).optional(),
  search: z.string().max(200).optional(),
  has_website: z.enum(HAS_WEBSITE_VALUES).optional(),
});

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const parsed = Query.safeParse({
    status: searchParams.get('status') || undefined,
    niche: searchParams.get('niche') || undefined,
    lead_quality: searchParams.get('lead_quality') || undefined,
    source_group: searchParams.get('source_group') || undefined,
    search: searchParams.get('search') || undefined,
    has_website: parseHasWebsiteFilter(searchParams.get('has_website')),
  });
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid query', issues: parsed.error.flatten() },
      { status: 400 }
    );
  }

  try {
    const leads = await getLeadsSafe(parsed.data);
    return NextResponse.json({ leads });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';
