import { NextRequest, NextResponse } from 'next/server';
import { getSkippedLeads } from '@/lib/db';

export async function GET() {
  try {
    const leads = await getSkippedLeads();
    return NextResponse.json({ leads });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';
