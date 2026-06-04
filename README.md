# LeadFlow

A personal CRM dashboard for managing Facebook cold outreach leads for a web design business. Paste the JSON output from your AI extraction step, ingest it, and run a three-message DM sequence without dropping anyone.

![Next.js](https://img.shields.io/badge/Next.js-15-black) ![React](https://img.shields.io/badge/React-19-blue) ![Postgres](https://img.shields.io/badge/Vercel_Postgres-✓-orange) ![Tailwind](https://img.shields.io/badge/Tailwind-3.4-blue)

## Stack

- **Framework:** Next.js 15 (App Router) + React 19
- **Database:** [Neon](https://neon.com) Postgres (via `@neondatabase/serverless`)
- **Styling:** Tailwind CSS
- **Motion:** [`motion`](https://motion.dev) (the modern, actively-maintained successor to `framer-motion`)
- **Validation:** [Zod](https://zod.dev) for runtime input validation on all API routes
- **Language:** TypeScript

> **Why Neon, not `@vercel/postgres`?** Vercel deprecated the `@vercel/postgres` package in 2026 and migrated existing databases to Neon under the hood. New deployments should set up Neon directly from the Vercel Marketplace and use the `@neondatabase/serverless` SDK — that's what this project uses.
>
> **Why these versions?** As of May 2026, Next.js <15.5.18 has 13 unpatched CVEs (middleware/auth bypass, XSS, SSRF, cache poisoning, DoS). The 14.x line will not receive backports. `next@^15.5.18` ships with all current security fixes.
>
> `framer-motion` is in maintenance mode; the same library is now published as `motion` and is imported from `motion/react` for the React API.

## Features

- **Pipeline dashboard** — filterable grid of leads with stats row, search, and faceted filters
- **Lead detail panel** — slide-in side panel with the message 1 hook (click-to-copy), six-step message tracker, status dropdown, auto-saving notes, and editable website field
- **Bulk import** — paste the JSON array from your AI step, validate it, then import. Skipped rows are still stored (with `skip_reason`) so you have a full audit trail. Duplicates (matched by `name` + `source_group`) are silently ignored.
- **Skipped archive** — every lead the AI flagged with a `skip_reason` lands here for reference

## Project structure

```
.
├── app/
│   ├── layout.tsx              root layout, fonts, sidebar
│   ├── page.tsx                dashboard / pipeline
│   ├── prompt/page.tsx         extraction prompt + workflow
│   ├── import/page.tsx         JSON import
│   ├── skipped/page.tsx        skipped leads archive
│   ├── globals.css             global styles + grain overlay
│   └── api/
│       ├── leads/route.ts              GET (with filters)
│       ├── leads/[id]/route.ts         GET, PATCH
│       ├── leads/import/route.ts       POST (bulk)
│       ├── leads/skipped/route.ts      GET
│       └── stats/route.ts              GET (dashboard counts)
├── components/                 shared UI (badges, panels, filters, etc.)
├── lib/                        types, db helpers
├── scripts/
│   └── setup-db.ts             one-shot migration
└── tailwind.config.ts          design system
```

## Local setup

1. **Clone the repo**

   ```bash
   git clone <your-repo-url> leadflow
   cd leadflow
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Create a Neon Postgres database**

   - Open the [Vercel dashboard](https://vercel.com/dashboard)
   - Go to **Storage → Marketplace → Neon → Add Integration**
   - Create a new Neon project (or link an existing one)
   - Vercel auto-injects `POSTGRES_URL` into your project's environment variables. If you'd rather set it manually, copy the connection string from the Neon dashboard.

4. **Add env variables**

   ```bash
   cp .env.example .env.local
   ```

   Paste the `POSTGRES_URL` into `.env.local`.

5. **Run the migration**

   ```bash
   npm run db:setup
   ```

   This creates the `leads` table and indexes.

6. **Start the dev server**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000).

7. **Audit dependencies (optional, recommended before deploying)**

   ```bash
   npm run audit
   ```

   The `.npmrc` is set to `audit-level=moderate` so installs fail on any
   known moderate-or-higher vulnerability. The audit script ignores
   dev-only packages.

## Security model

- All API inputs are validated with **Zod** at the boundary — invalid payloads return `400` with a structured error, never reaching the database.
- The import endpoint enforces an **8 MB body cap** and a **5,000-lead-per-request** limit.
- The PATCH endpoint validates the UUID format of the `id` path param before hitting the database.
- API responses carry `Cache-Control: no-store` and standard security headers (`X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`, `Strict-Transport-Security`) via `next.config.js`. The `X-Powered-By` header is disabled.

## Deployment to Vercel

1. Push the repo to GitHub and import it into Vercel
2. In the Vercel project, install the **Neon** integration (Storage → Marketplace → Neon). Vercel will auto-inject `POSTGRES_URL` into the project's environment variables.
3. Deploy

The build will run automatically. On first deploy, the `leads` table is created the first time `scripts/setup-db.ts` runs — run it once locally against your Neon database, or add a one-off Vercel build step:

```bash
vercel env pull .env.local
npm run db:setup
```

## API reference

### `POST /api/leads/import`

Bulk-insert leads from a JSON array.

Body — either a raw array, or `{ leads: [...] }`:

```json
{
  "leads": [
    {
      "name": "Maya Patel",
      "business_name": "Bloom & Vine",
      "niche": "florist",
      "location": "Austin, TX",
      "facebook_url": "https://facebook.com/bloomandvine",
      "website": "https://bloomandvine.com",
      "has_website": true,
      "post_context": "Posted about a Squarespace redesign struggle.",
      "message_1_hook": "Saw your post...",
      "lead_quality": "warm",
      "source_group": "Austin Small Biz Owners",
      "skip_reason": null
    }
  ]
}
```

Response:

```json
{
  "inserted": 12,
  "skipped": 3,
  "duplicates": 1,
  "errors": []
}
```

### `GET /api/leads`

Query params (all optional): `status`, `niche`, `lead_quality`, `source_group`, `search`. Skipped leads are excluded.

### `PATCH /api/leads/[id]`

Body: any subset of mutable fields. Returns the updated row.

### `GET /api/leads/skipped`

Returns all leads with a non-null `skip_reason`.

### `GET /api/stats`

```json
{
  "total": 42,
  "warm": 17,
  "contacted": 8,
  "replied": 3,
  "pitched": 2,
  "closed": 1
}
```

## Schema

| Column           | Type                              | Default |
| ---------------- | --------------------------------- | ------- |
| `id`             | `uuid` PK                         | `gen_random_uuid()` |
| `name`           | `text` not null                   | — |
| `business_name`  | `text`                            | null |
| `niche`          | `text`                            | — |
| `location`       | `text`                            | — |
| `facebook_url`   | `text`                            | null |
| `website`        | `text`                            | null |
| `has_website`    | `boolean`                         | null |
| `post_context`   | `text`                            | — |
| `message_1_hook` | `text`                            | — |
| `lead_quality`   | `text` (`warm` / `cold`)          | `cold` |
| `source_group`   | `text`                            | — |
| `skip_reason`    | `text`                            | null |
| `status`         | `text` (see below)                | `new` |
| `msg1_sent`      | `boolean`                         | false |
| `msg1_seen`      | `boolean`                         | false |
| `msg1_replied`   | `boolean`                         | false |
| `msg2_sent`      | `boolean`                         | false |
| `msg2_replied`   | `boolean`                         | false |
| `msg3_sent`      | `boolean`                         | false |
| `notes`          | `text`                            | null |
| `created_at`     | `timestamp`                       | `now()` |
| `updated_at`     | `timestamp`                       | `now()` |

**Statuses:** `new`, `contacted`, `engaged`, `pitched`, `no_response`, `closed`, `dead`.

## License

MIT
