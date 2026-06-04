import { neon } from '@neondatabase/serverless';

const STATEMENTS = [
  `CREATE EXTENSION IF NOT EXISTS "pgcrypto"`,
  `CREATE TABLE IF NOT EXISTS leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    business_name TEXT,
    niche TEXT NOT NULL DEFAULT '',
    location TEXT NOT NULL DEFAULT '',
    facebook_url TEXT,
    facebook_page_url TEXT,
    post_url TEXT,
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
  `ALTER TABLE leads ADD COLUMN IF NOT EXISTS facebook_page_url TEXT`,
  `ALTER TABLE leads ADD COLUMN IF NOT EXISTS post_url TEXT`,
  `CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status)`,
  `CREATE INDEX IF NOT EXISTS idx_leads_skip_reason ON leads(skip_reason)`,
  `CREATE INDEX IF NOT EXISTS idx_leads_name_source ON leads(name, source_group)`,
];

async function main() {
  const url = process.env.POSTGRES_URL || process.env.DATABASE_URL;
  if (!url) {
    console.error('Missing POSTGRES_URL (or DATABASE_URL). Set it in .env.local or your environment.');
    process.exit(1);
  }
  const sql = neon(url);

  for (const stmt of STATEMENTS) {
    process.stdout.write('→ executing migration... ');
    await sql(stmt, []);
    process.stdout.write('ok\n');
  }
  console.log('\n✓ Database ready.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
