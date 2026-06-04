import { neon, neonConfig } from '@neondatabase/serverless';
import type { Lead, LeadStatus, LeadQuality } from './types';

neonConfig.fetchConnectionCache = true;

function client() {
  const url = process.env.POSTGRES_URL || process.env.DATABASE_URL;
  if (!url) throw new Error('POSTGRES_URL (or DATABASE_URL) is not set');
  return neon(url);
}

let schemaReady: Promise<void> | null = null;

export async function ensureSchema(): Promise<void> {
  if (schemaReady) return schemaReady;
  schemaReady = (async () => {
    const sql = client();
    await sql(`CREATE EXTENSION IF NOT EXISTS "pgcrypto"`, []);
    await sql(
      `CREATE TABLE IF NOT EXISTS leads (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        business_name TEXT,
        niche TEXT NOT NULL DEFAULT '',
        location TEXT NOT NULL DEFAULT '',
        facebook_url TEXT,
        website TEXT,
        has_website BOOLEAN,
        post_context TEXT NOT NULL DEFAULT '',
        message_1_hook TEXT NOT NULL DEFAULT '',
        lead_quality TEXT NOT NULL DEFAULT 'cold' CHECK (lead_quality IN ('warm','cold')),
        source_group TEXT NOT NULL DEFAULT '',
        skip_reason TEXT,
        status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new','contacted','engaged','pitched','no_response','closed','dead')),
        msg1_sent BOOLEAN NOT NULL DEFAULT false,
        msg1_seen BOOLEAN NOT NULL DEFAULT false,
        msg1_replied BOOLEAN NOT NULL DEFAULT false,
        msg2_sent BOOLEAN NOT NULL DEFAULT false,
        msg2_replied BOOLEAN NOT NULL DEFAULT false,
        msg3_sent BOOLEAN NOT NULL DEFAULT false,
        notes TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      )`,
      []
    );
    await sql(`CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status)`, []);
    await sql(`CREATE INDEX IF NOT EXISTS idx_leads_skip_reason ON leads(skip_reason)`, []);
    await sql(
      `CREATE INDEX IF NOT EXISTS idx_leads_name_source ON leads(name, source_group)`,
      []
    );
  })();
  return schemaReady;
}

export async function getLeadById(id: string): Promise<Lead | null> {
  const sql = client();
  const rows = await sql`SELECT * FROM leads WHERE id = ${id}`;
  return (rows[0] as Lead) || null;
}

export type HasWebsiteFilter = 'yes' | 'no' | 'unknown';

export async function getLeadsSafe(filters?: {
  status?: LeadStatus;
  niche?: string;
  lead_quality?: LeadQuality;
  source_group?: string;
  search?: string;
  has_website?: HasWebsiteFilter;
}): Promise<Lead[]> {
  const sql = client();
  const where: string[] = ['skip_reason IS NULL'];
  const args: (string | number | boolean | null)[] = [];

  function add(clause: string, value: string | number | boolean | null) {
    args.push(value);
    where.push(clause.replace('?', `$${args.length}`));
  }

  if (filters?.status) add('status = ?', filters.status);
  if (filters?.niche) add('niche = ?', filters.niche);
  if (filters?.lead_quality) add('lead_quality = ?', filters.lead_quality);
  if (filters?.source_group) add('source_group = ?', filters.source_group);
  if (filters?.has_website === 'yes') add('has_website = ?', true);
  if (filters?.has_website === 'no') add('has_website = ?', false);
  if (filters?.has_website === 'unknown') add('has_website IS ?', null);
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
    sql`SELECT COUNT(*)::text as count FROM leads WHERE skip_reason IS NULL`,
    sql`SELECT COUNT(*)::text as count FROM leads WHERE skip_reason IS NULL AND lead_quality = 'warm'`,
    sql`SELECT COUNT(*)::text as count FROM leads WHERE skip_reason IS NULL AND status = 'contacted'`,
    sql`SELECT COUNT(*)::text as count FROM leads WHERE skip_reason IS NULL AND (msg1_replied = true OR msg2_replied = true)`,
    sql`SELECT COUNT(*)::text as count FROM leads WHERE skip_reason IS NULL AND status = 'pitched'`,
    sql`SELECT COUNT(*)::text as count FROM leads WHERE skip_reason IS NULL AND status = 'closed'`,
  ]) as Array<Array<{ count: string }>>;

  return {
    total: parseInt(total[0]?.count || '0', 10),
    warm: parseInt(warm[0]?.count || '0', 10),
    contacted: parseInt(contacted[0]?.count || '0', 10),
    replied: parseInt(replied[0]?.count || '0', 10),
    pitched: parseInt(pitched[0]?.count || '0', 10),
    closed: parseInt(closed[0]?.count || '0', 10),
  };
}

export async function findExistingLeads(
  pairs: Array<{ name: string; source_group: string }>
): Promise<Set<string>> {
  if (pairs.length === 0) return new Set();

  const sql = client();
  const out = new Set<string>();
  const CHUNK = 100;

  for (let i = 0; i < pairs.length; i += CHUNK) {
    const slice = pairs.slice(i, i + CHUNK);
    const values: string[] = [];
    const conds: string[] = [];
    for (const p of slice) {
      values.push(p.name, p.source_group);
      const base = values.length - 1;
      conds.push(`(name = $${base} AND source_group = $${base + 1})`);
    }
    const rows = (await sql(
      `SELECT name, source_group FROM leads WHERE ${conds.join(' OR ')}`,
      values
    )) as Array<{ name: string; source_group: string }>;
    for (const r of rows) out.add(`${r.name}::${r.source_group}`);
  }
  return out;
}

export interface InsertableLead {
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
}

export async function bulkInsertLeads(leads: InsertableLead[]): Promise<number> {
  if (leads.length === 0) return 0;

  const sql = client();
  const COLS = 12;
  const CHUNK = 50;

  let total = 0;
  for (let start = 0; start < leads.length; start += CHUNK) {
    const slice = leads.slice(start, start + CHUNK);
    const values: (string | number | boolean | null)[] = [];
    const placeholders: string[] = [];

    for (let i = 0; i < slice.length; i++) {
      const l = slice[i];
      const o = i * COLS;
      values.push(
        l.name, l.business_name, l.niche, l.location,
        l.facebook_url, l.website, l.has_website,
        l.post_context, l.message_1_hook,
        l.lead_quality, l.source_group, l.skip_reason
      );
      placeholders.push(
        `($${o + 1}, $${o + 2}, $${o + 3}, $${o + 4}, $${o + 5}, $${o + 6}, $${o + 7}, $${o + 8}, $${o + 9}, $${o + 10}, $${o + 11}, $${o + 12})`
      );
    }

    await sql(
      `INSERT INTO leads (
         name, business_name, niche, location, facebook_url, website, has_website,
         post_context, message_1_hook, lead_quality, source_group, skip_reason
       ) VALUES ${placeholders.join(', ')}`,
      values
    );
    total += slice.length;
  }
  return total;
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
