import { neon, neonConfig } from '@neondatabase/serverless';
import type { Lead, LeadStatus, LeadQuality } from './types';

neonConfig.fetchConnectionCache = true;

function client() {
  const url = process.env.POSTGRES_URL;
  if (!url) throw new Error('POSTGRES_URL is not set');
  return neon(url);
}

export async function getLeadById(id: string): Promise<Lead | null> {
  const sql = client();
  const rows = await sql`SELECT * FROM leads WHERE id = ${id}`;
  return (rows[0] as Lead) || null;
}

export async function getLeadsSafe(filters?: {
  status?: LeadStatus;
  niche?: string;
  lead_quality?: LeadQuality;
  source_group?: string;
  search?: string;
}): Promise<Lead[]> {
  const sql = client();
  const where: string[] = ['skip_reason IS NULL'];
  const args: (string | number)[] = [];

  function add(clause: string, value: string | number) {
    args.push(value);
    where.push(clause.replace('?', `$${args.length}`));
  }

  if (filters?.status) add('status = ?', filters.status);
  if (filters?.niche) add('niche = ?', filters.niche);
  if (filters?.lead_quality) add('lead_quality = ?', filters.lead_quality);
  if (filters?.source_group) add('source_group = ?', filters.source_group);
  if (filters?.search) {
    args.push(`%${filters.search}%`);
    const idx = args.length;
    where.push(`(name ILIKE $${idx} OR business_name ILIKE $${idx})`);
  }

  const query = `SELECT * FROM leads WHERE ${where.join(' AND ')} ORDER BY created_at DESC`;
  const rows = await sql(query, args);
  return rows as Lead[];
}

export async function getSkippedLeads(): Promise<Lead[]> {
  const sql = client();
  const rows = await sql`
    SELECT * FROM leads WHERE skip_reason IS NOT NULL ORDER BY created_at DESC
  `;
  return rows as Lead[];
}

export async function getStats() {
  const sql = client();
  const [total, warm, contacted, replied, pitched, closed] = await Promise.all([
    sql<{ count: string }>`SELECT COUNT(*)::text as count FROM leads WHERE skip_reason IS NULL`,
    sql<{ count: string }>`SELECT COUNT(*)::text as count FROM leads WHERE skip_reason IS NULL AND lead_quality = 'warm'`,
    sql<{ count: string }>`SELECT COUNT(*)::text as count FROM leads WHERE skip_reason IS NULL AND status = 'contacted'`,
    sql<{ count: string }>`SELECT COUNT(*)::text as count FROM leads WHERE skip_reason IS NULL AND (msg1_replied = true OR msg2_replied = true)`,
    sql<{ count: string }>`SELECT COUNT(*)::text as count FROM leads WHERE skip_reason IS NULL AND status = 'pitched'`,
    sql<{ count: string }>`SELECT COUNT(*)::text as count FROM leads WHERE skip_reason IS NULL AND status = 'closed'`,
  ]);

  return {
    total: parseInt(total[0]?.count || '0', 10),
    warm: parseInt(warm[0]?.count || '0', 10),
    contacted: parseInt(contacted[0]?.count || '0', 10),
    replied: parseInt(replied[0]?.count || '0', 10),
    pitched: parseInt(pitched[0]?.count || '0', 10),
    closed: parseInt(closed[0]?.count || '0', 10),
  };
}

export async function findDuplicate(name: string, source_group: string): Promise<boolean> {
  const sql = client();
  const rows = await sql`
    SELECT id FROM leads
    WHERE name = ${name} AND source_group = ${source_group}
    LIMIT 1
  `;
  return rows.length > 0;
}

export async function bulkInsertLeads(
  leads: Array<{
    name: string;
    business_name: string | null;
    niche: string;
    location: string;
    facebook_url: string | null;
    website: string | null;
    has_website: boolean | null;
    post_context: string;
    message_1_hook: string;
    lead_quality: LeadQuality;
    source_group: string;
    skip_reason: string | null;
  }>
): Promise<number> {
  if (leads.length === 0) return 0;

  const sql = client();
  for (const lead of leads) {
    await sql`
      INSERT INTO leads (
        name, business_name, niche, location, facebook_url, website, has_website,
        post_context, message_1_hook, lead_quality, source_group, skip_reason
      ) VALUES (
        ${lead.name},
        ${lead.business_name},
        ${lead.niche},
        ${lead.location},
        ${lead.facebook_url},
        ${lead.website},
        ${lead.has_website},
        ${lead.post_context},
        ${lead.message_1_hook},
        ${lead.lead_quality},
        ${lead.source_group},
        ${lead.skip_reason}
      )
    `;
  }
  return leads.length;
}

export async function updateLead(
  id: string,
  updates: Partial<Lead>
): Promise<Lead | null> {
  const fields = Object.keys(updates).filter(
    (k) => k !== 'id' && k !== 'created_at'
  );
  if (fields.length === 0) {
    const sql = client();
    const rows = await sql`SELECT * FROM leads WHERE id = ${id}`;
    return (rows[0] as Lead) || null;
  }

  const sql = client();
  const setClauses = fields
    .map((field, i) => `${field} = $${i + 2}`)
    .join(', ');
  const values = fields.map((f) => (updates as Record<string, unknown>)[f]);

  const query = `
    UPDATE leads
    SET ${setClauses}, updated_at = NOW()
    WHERE id = $1
    RETURNING *
  `;
  const rows = await sql(query, [id, ...values]);
  return (rows[0] as Lead) || null;
}
