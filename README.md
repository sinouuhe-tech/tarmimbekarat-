# HYMEN ACADEMY | FARAHMAND

Cloudflare Workers + D1 website. This project uses a single Workers entrypoint (`functions/_worker.js`) and Workers Static Assets, not Pages Functions.

## Deploy

1. Install Node.js and Wrangler.
2. Login: `npx wrangler login`
3. Confirm the D1 database in `wrangler.toml` belongs to your Cloudflare account. If its ID differs, replace `database_id` with your real D1 ID.
4. Initialize schema:
   `npx wrangler d1 execute hymenacademy --remote --file=./schema.sql`
5. Set secrets:
   `npx wrangler secret put ADMIN_PASSWORD`
   `npx wrangler secret put SESSION_SECRET`
6. Deploy:
   `npx wrangler deploy`

The Worker serves the static site and API routes. Admin is at `/admin/`.

## Local
`npx wrangler dev`

## Important
- Do not put ADMIN_PASSWORD or SESSION_SECRET in source code.
- Replace placeholder canonical/sitemap host if you later use a custom domain.
- Medical copy is intentionally educational and avoids guarantees or unsupported credentials.
