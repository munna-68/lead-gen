import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { deleteLead, getLeadById, updateLead } from '@/lib/db';
import type { Lead } from '@/lib/types';

const PATCHABLE = z
  .object({
    name: z.string().min(1).max(200).optional(),
    business_name: z.string().max(200).nullable().optional(),
    niche: z.string().max(120).optional(),
    location: z.string().max(160).optional(),
    facebook_url: z.string().url().max(500).nullable().optional(),
    website: z.string().url().max(500).nullable().optional(),
    has_website: z.boolean().nullable().optional(),
    post_context: z.string().max(2000).optional(),
    message_1_hook: z.string().max(2000).optional(),
    lead_quality: z.enum(['warm', 'cold']).optional(),
    source_group: z.string().max(200).optional(),
    status: z
      .enum(['new', 'contacted', 'engaged', 'pitched', 'no_response', 'closed', 'dead'])
      .optional(),
    msg1_sent: z.boolean().optional(),
    msg1_seen: z.boolean().optional(),
    msg1_replied: z.boolean().optional(),
    msg2_sent: z.boolean().optional(),
    msg2_replied: z.boolean().optional(),
    msg3_sent: z.boolean().optional(),
    notes: z.string().max(10000).nullable().optional(),
  })
  .strict();

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!UUID_RE.test(id)) {
    return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const parsed = PATCHABLE.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid update', issues: parsed.error.flatten() },
      { status: 400 }
    );
  }

  try {
    const lead = await updateLead(id, parsed.data as Partial<Lead>);
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
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!UUID_RE.test(id)) {
    return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
  }
  try {
    const lead = await getLeadById(id);
    if (!lead) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ lead });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!UUID_RE.test(id)) {
    return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
  }
  try {
    const removed = await deleteLead(id);
    if (!removed) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';
