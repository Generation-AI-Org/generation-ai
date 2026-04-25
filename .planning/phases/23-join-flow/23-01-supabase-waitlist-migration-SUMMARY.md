---
phase: 23
plan: "01"
slug: supabase-waitlist-migration
subsystem: database
tags: [supabase, migration, rls, typescript, waitlist]
dependency_graph:
  requires: []
  provides: [waitlist-table-prod, WaitlistRow-type, WaitlistInsert-type]
  affects: [23-03-server-action, 25-circle-api-sync]
tech_stack:
  added: []
  patterns: [supabase-rls, service-role-only-table, type-only-barrel-export]
key_files:
  created:
    - supabase/migrations/20260424000001_waitlist.sql
    - packages/auth/src/waitlist.ts
  modified:
    - packages/auth/src/index.ts
decisions:
  - "D-05: separate waitlist table with service_role-only RLS (not in auth.users)"
  - "REVOKE ALL on anon/authenticated so GET returns HTTP 401 (not 200 empty)"
  - "Case-insensitive unique index via lower(email) — no citext extension needed"
metrics:
  duration: "5m"
  completed: "2026-04-24T02:10:17Z"
  tasks_completed: 3
  tasks_total: 3
  files_created: 2
  files_modified: 1
status: complete
---

# Phase 23 Plan 01: Supabase Waitlist Migration Summary

Supabase `waitlist` table created in Prod (wbohulnuwqrhystaamjc) with service-role-only RLS, case-insensitive email uniqueness, and TypeScript types exported from `@genai/auth`.

---

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | SQL-Migration erstellen + committen | `4f98e46`, `3aae84e` | `supabase/migrations/20260424000001_waitlist.sql` |
| 2 | Migration via Supabase CLI auf Prod anwenden + verifizieren | (DB-only, no repo commit) | — |
| 3 | TypeScript-Types in @genai/auth exportieren | `da6bde5` | `packages/auth/src/waitlist.ts`, `packages/auth/src/index.ts` |

---

## Migration Details

**File:** `supabase/migrations/20260424000001_waitlist.sql`
**Applied to:** Prod project `wbohulnuwqrhystaamjc` via `supabase db query --linked -f`

**Table structure (10 columns):**

| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | NO | gen_random_uuid() |
| email | text | NO | — |
| name | text | NO | — |
| university | text | NO | — |
| study_program | text | YES | — |
| marketing_opt_in | boolean | NO | false |
| redirect_after | text | YES | — |
| source | text | NO | 'join-page' |
| created_at | timestamptz | NO | now() |
| notified_at | timestamptz | YES | — |

**Indexes:**
- `waitlist_email_unique_ci` — UNIQUE on `lower(email)` (case-insensitive dedup)
- `waitlist_pending_notification_idx` — on `created_at WHERE notified_at IS NULL` (Phase 25 batch job)

---

## MCP / CLI Verification Outputs

### Table Existence
```
columns verified: id, email, name, university, study_program, marketing_opt_in,
                  redirect_after, source, created_at, notified_at (all 10 present)
```

### RLS Policies
```json
[
  { "cmd": "INSERT", "policyname": "service_role_insert_waitlist", "roles": "{service_role}" },
  { "cmd": "SELECT", "policyname": "service_role_select_waitlist", "roles": "{service_role}" }
]
```

### RLS Enabled
```json
{ "relname": "waitlist", "relrowsecurity": true }
```

---

## Anon RLS Block Smoke Tests

### MCP `set role anon` INSERT test
```
supabase db query --linked "SET ROLE anon; INSERT INTO public.waitlist ..."
→ unexpected status 400: {"message":"Failed to run sql query: ERROR: 42501: new row violates
  row-level security policy for table \"waitlist\""}
```
Result: INSERT blocked as expected.

### End-to-End HTTP Check (anon key)
```
anon GET  /rest/v1/waitlist?select=id&limit=1 → HTTP 401  (RLS OK: anon blocked)
anon POST /rest/v1/waitlist                   → HTTP 401  (INSERT blocked)
```
Result: Both GET and POST return 401 — no data accessible to anon users.

---

## TypeScript Types

**`packages/auth/src/waitlist.ts`** — types-only, no runtime code:
- `WaitlistRow` — 10 fields matching DB schema (read shape)
- `WaitlistInsert` — 7 fields (email, name, university required; study_program, marketing_opt_in, redirect_after, source optional)

**`packages/auth/src/index.ts`** — added at end:
```typescript
// Phase 23 — /join Waitlist types
export type { WaitlistRow, WaitlistInsert } from './waitlist'
```

Existing exports intact: `createBrowserClient`, `createAdminClient`, `needsFirstLoginPrompt`.

**Build check:** `pnpm --filter @genai/auth exec tsc --noEmit` — no errors.

---

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Security] Revoked anon/authenticated table-level grants**
- **Found during:** Task 2 end-to-end HTTP verification
- **Issue:** Supabase's default `grant all on public.*` to anon/authenticated means `anon GET /rest/v1/waitlist` returned HTTP 200 with empty array instead of 401/403. While no data leaks (RLS filters all rows), the plan's acceptance criteria requires HTTP 401/403 for the end-to-end check.
- **Fix:** `REVOKE ALL ON public.waitlist FROM anon, authenticated` — applied to Prod and added to migration SQL so it's idempotent on re-apply.
- **Files modified:** `supabase/migrations/20260424000001_waitlist.sql` (commit `3aae84e`)
- **Result:** anon GET now returns HTTP 401, anon POST returns HTTP 401.

**2. [Rule 3 - Blocking] Used supabase CLI instead of MCP tools**
- **Found during:** Task 2 start
- **Issue:** MCP tools `mcp__supabase__apply_migration` / `mcp__1e7c6bb1-2086-46f7-ba8f-0922520ebe1c__apply_migration` were not available in this session. Management API (`api.supabase.com`) requires personal access token (not service_role key).
- **Fix:** Used `supabase db query --linked -f <file>` via Supabase CLI (v2.84.2, already logged in, project linked). Same outcome — migration applied to Prod.
- **Impact:** None on outcome. CLI is equivalent to MCP apply_migration.

---

## Known Stubs

None. This plan is DB infrastructure only — no UI rendering, no placeholder content.

---

## Threat Flags

None. The `waitlist` table is the planned new trust boundary documented in D-05 and the plan's threat model. RLS restricts all access to service_role only.

---

## Self-Check: PASSED

All files exist on disk. All commits verified in git log.

| Check | Result |
|-------|--------|
| `supabase/migrations/20260424000001_waitlist.sql` | FOUND |
| `packages/auth/src/waitlist.ts` | FOUND |
| `packages/auth/src/index.ts` | FOUND |
| `23-01-supabase-waitlist-migration-SUMMARY.md` | FOUND |
| commit `4f98e46` | FOUND |
| commit `3aae84e` | FOUND |
| commit `da6bde5` | FOUND |
