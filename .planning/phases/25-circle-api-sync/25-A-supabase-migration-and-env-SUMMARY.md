---
phase: 25
plan: A
slug: supabase-migration-and-env
status: complete
completed: 2026-04-24
commits:
  - 56afa45
  - 3a3e2b9
  - 5d6e730
  - a49c8f5
---

# Plan 25-A SUMMARY — Supabase migration + env vars

## What was built

- `supabase/migrations/20260425000001_circle_profile_fields.sql` created and applied to prod DB (`wbohulnuwqrhystaamjc`) via Supabase MCP.
- `public.user_circle_links` table live: `user_id` PK (FK `auth.users` on-delete-cascade), `circle_member_id` text unique, `circle_provisioned_at`/`last_error`/`last_error_at`/`created_at`. RLS on, `service_role`-only policies, `anon`/`authenticated` grants revoked.
- `packages/auth/src/circle.ts` — TypeScript types `UserCircleLink`, `UserCircleLinkInsert`, `CircleUserMetadata`. Re-exported from `@genai/auth` barrel.
- `.env.example` (root, new) + `apps/website/.env.example` (new) — templates with 5 Circle vars + SIGNUP_ENABLED feature flag + commented real IDs (community 511295, default space 2574363).
- `docs/DEPLOYMENT.md` — new "Circle-API-Sync (Phase 25)" section with scope-table, setup commands, rotation notes, Q11 gate explanation.

## Key files

- `supabase/migrations/20260425000001_circle_profile_fields.sql`
- `packages/auth/src/circle.ts`
- `packages/auth/src/index.ts`
- `.env.example` (root)
- `apps/website/.env.example`
- `docs/DEPLOYMENT.md`

## Verification

- `pnpm --filter @genai/auth exec tsc --noEmit` clean.
- Supabase MCP `list_tables` confirms `public.user_circle_links` with rls_enabled.
- Migration query applied via `apply_migration` returned `{success:true}`.

## Discovered Circle IDs

- `CIRCLE_COMMUNITY_ID=511295` (GenerationAI)
- `CIRCLE_DEFAULT_SPACE_ID=2574363` ("How to" — Circle's own `default_new_member_space_id`)
- `CIRCLE_COMMUNITY_URL=https://community.generation-ai.org`

These are documented in `docs/DEPLOYMENT.md` + inline comments in `.env.example`. Luca still has to paste real token + push vars to Vercel (HUMAN-UAT in Plan I).

## Deviations

None.

## Hand-off

Wave-2 plans (C/D/E) + Plan F + Plan G all import types from `@genai/auth` and read env-vars via `process.env`. Schema is live.
