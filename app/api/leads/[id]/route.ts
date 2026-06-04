import { NextRequest, NextResponse } from 'next/server';
import { updateLead } from '@/lib/db';

const PATCHABLE = new Set([
  'name',
  'business_name',
  'niche',
  'location',
  'facebook_url',
  'website',
  'has_website',
  'post_context',
  'message_1_hook',
  'lead_quality',
  'source_group',
  'status',
  'msg1_sent',
  'msg1_seen',
  'msg1_replied',
  'msg2_sent',
  'msg2_replied',
  'msg3_sent',
  'notes',
]);

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const updates: Record<string, unknown> = {};
    for (const key of Object.keys(body || {})) {
      if (PATCHABLE.has(key)) updates[key] = body[key];
    }

    const lead = await updateLead(params.id, updates);
    if (!lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }
    return NextResponse.json({ lead });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { getLeadById } = await import('@/lib/db');
    const lead = await getLeadById(params.id);
    if (!lead) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ lead });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';
