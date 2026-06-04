import { NextRequest, NextResponse } from 'next/server';
import { deleteAllSkippedLeads, getSkippedLeads } from '@/lib/db';

export async function GET(_req: NextRequest) {
  try {
    const leads = await getSkippedLeads();
    return NextResponse.json({ leads });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest) {
  try {
    const deleted = await deleteAllSkippedLeads();
    return NextResponse.json({ deleted });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';
