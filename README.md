# TagPoint

Scan the tag. See the asset.

A facilities asset register: track assets from purchase to disposal, print a QR label per asset, and let maintenance techs scan the tag on their phone to view the asset and log repairs — working offline in signal-dead plant rooms and syncing once back online.

**Phase 1 is done**: the office/admin side of the register — sign in, manage assets/locations/cost centres/categories, dispose assets, export CSV. QR generation and the mobile scan-and-log flow (Phase 2) come next. See the TagPoint product & technical plan for the full scope, data model, and roadmap.

## Stack

Next.js (App Router, PWA) · Tailwind CSS · Supabase (Postgres, Auth, Storage, Row Level Security) · Dexie.js for the technician offline cache · Serwist for the installable app shell.

## Local development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Without Supabase env vars set (see below), every page shows a friendly "Supabase isn't set up yet" message instead of crashing — that's expected until a Supabase project is wired up.

## Setting up Supabase

1. Create a free project at [supabase.com](https://supabase.com).
2. In **Project Settings → API**, copy the **Project URL** and **anon public** key.
3. Copy `.env.example` to `.env.local` and fill those two values in:
   ```bash
   cp .env.example .env.local
   ```
4. Run the schema migrations against your project. Either:
   - **Supabase CLI** (recommended): `npx supabase login`, then `npx supabase link --project-ref <your-project-ref>`, then `npx supabase db push`.
   - **Or manually**: open the SQL Editor in the Supabase dashboard and run each file in `supabase/migrations/` in order (they're numbered).
5. Restart `npm run dev` once `.env.local` is filled in.

Once the project exists, regenerate the TypeScript types from the real schema (the checked-in `src/lib/supabase/types.ts` is hand-written to match the migrations until this is run):

```bash
npx supabase gen types typescript --project-id <your-project-ref> > src/lib/supabase/types.ts
```

## First login — becoming an admin

New accounts default to the **technician** role (see `handle_new_user()` in `supabase/migrations/`), and only admin/office can add or edit assets. To bootstrap your own account:

1. Go to `/signup`, create an account, and confirm it via the email Supabase sends.
2. In the Supabase dashboard's **SQL Editor**, run:
   ```sql
   update profiles set role = 'admin' where email = 'you@example.com';
   ```
3. Sign in — you'll now see the full office/admin navigation (Assets, Locations, Cost Centres, Categories).

There's no user-management screen yet, so promoting anyone else to `office` or `admin` means running the same kind of `update` statement for now.

## Deploying to Vercel

1. Import this repo into a new [Vercel](https://vercel.com) project.
2. Add the same environment variables from `.env.local` in the Vercel project's **Settings → Environment Variables**.
3. Deploy. Vercel auto-detects Next.js — no build config needed beyond the env vars.

## Regenerating icons

App icons (`public/icons/`) are generated from the TagPoint mark, not hand-drawn:

```bash
npm run generate-icons
```

## Project structure

```
src/app/login, /signup    Auth pages (Supabase email/password)
src/app/(app)/             Protected office/admin screens — assets, locations,
                           cost-centres, categories, all behind the layout's
                           session check
src/app/error.tsx          Friendly fallback when Supabase isn't configured
src/lib/auth.ts            Current-user/role lookup, shared by pages & actions
src/lib/depreciation.ts    Straight-line book value calculation
src/lib/supabase/          Browser + server Supabase clients, DB types, env check
src/proxy.ts               Refreshes the Supabase auth session on every request
supabase/migrations/       Schema + Row Level Security, in order
scripts/                   Icon generation
```

## Known issue

`npm audit` currently reports advisories in transitive, build-time-only dependencies (ESLint's `minimatch`, PostCSS, and `sharp` via Next.js's own dependency tree) — not in application code, and not reachable by an end user of the deployed app. No fix is available yet without downgrading Next.js itself, which isn't worth doing for build-time-only tooling. Worth re-running `npm audit` after the next Next.js point release.

## Roadmap

Phase 2 is next: QR code generation and printable labels, and the mobile scan-and-log flow with offline support. See the plan for the full phase breakdown.
