import { NextRequest, NextResponse } from 'next/server';
import { getLeadsSafe } from '@/lib/db';
import type { LeadQuality, LeadStatus } from '@/lib/types';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') as LeadStatus | null;
    const niche = searchParams.get('niche');
    const lead_quality = searchParams.get('lead_quality') as LeadQuality | null;
    const source_group = searchParams.get('source_group');
    const search = searchParams.get('search');

    const leads = await getLeadsSafe({
      status: status || undefined,
      niche: niche || undefined,
      lead_quality: lead_quality || undefined,
      source_group: source_group || undefined,
      search: search || undefined,
    });

    return NextResponse.json({ leads });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';
