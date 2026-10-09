# Deployment record

Cloned from `https://github.com/saad-bin-ashraf/science-club-bussscr` (commit `654a2df`, branch `main`, 105 files) and deployed as a production Next.js server.

**Stack:** Next.js 16.2.6, React 19.2.6, Tailwind 4, Drizzle ORM 0.45.2, PostgreSQL (Neon), Node 20.

## Steps performed

1. Cloned the repository.
2. `npm install` — 399 packages. The repo ships **no lockfile**, so versions were resolved fresh from the semver ranges in `package.json` and a `package-lock.json` was generated.
3. Connected to the Neon database named in `drizzle.config.json` and diffed every table in `src/db/schema.ts` against the live database.
4. Applied the two migrations under `src/db/migrations/`, which had **not** been applied to the database:
   - `2026-10-03-achievement-details.sql` → `achievements.organizer_info`, `olympiad_website`, `map_embed_url`, `participants`
   - `2026-10-03-member-certificates.sql` → `members.certificates`
5. Created `.env` (DB URL, a fresh random `SESSION_SECRET`, `NEXT_PUBLIC_SITE_URL`).
6. `npx tsc --noEmit` — clean. `npm run build` — succeeded, 41 routes, 20 pages prerendered.
7. Started `next start` bound to `0.0.0.0:3000`.

## Why the migrations were mandatory

`src/db/schema.ts` declares all columns, and Drizzle selects every declared column on every query. The live database was missing 5 of them, so **every** page touching `achievements` or `members` would have failed with `column ... does not exist`. `SEO_DEPLOYMENT.md` already instructed applying them before deploy.

Both migrations are `ADD COLUMN IF NOT EXISTS ... NOT NULL DEFAULT`, so they are additive and idempotent — no existing row was altered or removed. Row counts before and after were identical: 10 achievements, 7 members, 6 slides.

## Verification

| Check | Result |
|---|---|
| `npx tsc --noEmit` | exit 0, no errors |
| `npm run build` | exit 0, 41 routes, 20 static pages |
| 17 public/SEO routes | all `200` |
| 5 dynamic detail pages (`/achievements/[id]`, `/members/[id]`, `/members/[id]/certificates`) | all `200` |
| `/api/health` | `{"ok":true}` |
| `/api/search?q=olympiad` | returns 3 real achievements from the DB |
| `/sitemap.xml`, `/robots.txt` | `200`, DB-backed, correct canonical origin |
| `/achievements/999999` | `404` (not a crash) |
| `/admin`, `/admin/settings`, `/admin/branding`, `/admin/seo`, `/admin/applications` | all `307` → `/admin/login` |

## Known issues (pre-existing, non-blocking)

`npm run lint` reports **52 problems (11 errors, 41 warnings)** in the original source. They are code-quality issues only and do not block the build or runtime:

- `react/no-unescaped-entities` — literal `"` characters in JSX text
- `react-hooks/set-state-in-effect` — `useEffect(() => setMounted(true), [])` in `src/components/theme.tsx:17`

## Security notes

1. **`drizzle.config.json` contains the live Neon password in plaintext, committed to a public repository.** Anyone can read it. Rotate the Neon database password, then load the new one from an environment variable instead of hardcoding it.
2. The repo originally had **no `.gitignore`**. One was added so `.env`, `node_modules`, and `.next` are not committed. `.env.example` documents the required variables without real secrets.
3. `src/lib/auth.ts` falls back to the hardcoded `"sc-dev-secret-change-me"` when `SESSION_SECRET` is unset. A real random secret is now set in `.env`; keep it set in every environment, since it signs admin session cookies.
4. `src/db/index.ts` connects with `rejectUnauthorized: false`, which accepts any TLS certificate. Fine for a quick deploy, but it disables server-identity verification.

## Redeploying

```bash
cd science-club-bussscr
npm install
cp .env.example .env   # fill in real values
npm run build
npx next start -H 0.0.0.0 -p 3000
```

For a permanent deployment, set `NEXT_PUBLIC_SITE_URL` to the real HTTPS domain before building (it is inlined at build time), then submit `/sitemap.xml` to Google Search Console as described in `SEO_DEPLOYMENT.md`.
