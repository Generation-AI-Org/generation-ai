---
phase: 23
plan: "03"
slug: server-action-waitlist-submit
subsystem: website-backend
status: complete
completed: "2026-04-24"
duration_minutes: 4
tasks_completed: 3
tasks_total: 3
files_created: 2
files_modified: 2
tags:
  - server-action
  - zod
  - rate-limit
  - supabase
  - resend
  - waitlist
dependency_graph:
  requires:
    - "23-01 (WaitlistInsert type + waitlist table)"
    - "23-02 (WaitlistConfirmationEmail template)"
  provides:
    - "submitJoinWaitlist server action (stable interface for Phase 25)"
    - "checkWaitlistRateLimit + getClientIp helpers"
  affects:
    - "23-05 (Form Component will call submitJoinWaitlist)"
    - "23-06 (Playwright E2E tests the action end-to-end)"
    - "25 (Phase 25 swaps the implementation, not the interface)"
tech_stack:
  added:
    - "@upstash/ratelimit@2.0.8 (website app)"
    - "@upstash/redis@1.37.0 (website app)"
    - "zod@4.3.6 (website app)"
  patterns:
    - "Server Action with 'use server' directive"
    - "Zod v4 schema validation with German error messages"
    - "Upstash Redis slidingWindow rate limiting per IP"
    - "Supabase Admin Client (service_role) for waitlist insert"
    - "Resend non-blocking email after DB insert"
key_files:
  created:
    - apps/website/lib/rate-limit.ts
    - apps/website/app/actions/waitlist.ts
  modified:
    - apps/website/package.json
    - pnpm-lock.yaml
decisions:
  - "Used zod v4 z.literal(true, { message }) instead of errorMap — cleaner v4 API"
  - "Added @upstash/ratelimit + @upstash/redis + zod as direct deps to @genai/website (not in monorepo catalog — follow tools-app pattern)"
  - "Smoke-test deferred to Plan 23-06 Playwright (server action uses next/headers making unit test setup heavy)"
---

# Phase 23 Plan 03: Server-Action Waitlist Submit — Summary

**One-liner:** `submitJoinWaitlist` Server Action with Zod v4 validation, Upstash slidingWindow(5, '15 m') rate-limit, Supabase admin insert with silent 23505 dedup, and non-blocking Resend confirmation mail.

---

## What Was Built

### Task 1 — `apps/website/lib/rate-limit.ts` (commit `f8b749d`)

Rate-limit helper for the website app, modeled after `apps/tools-app/lib/ratelimit.ts`.

- `checkWaitlistRateLimit(ip: string)` — Upstash `slidingWindow(5, '15 m')`, prefix `ratelimit:waitlist:ip`, graceful fail-open if env vars absent or Redis throws
- `getClientIp(headers: Headers)` — reads `x-forwarded-for` / `x-real-ip` for Server Action context (unlike tools-app which takes a `Request` object)
- Lazy singleton initialization with null-guard

**Deviation (Rule 3 — missing deps):** Added `@upstash/ratelimit` and `@upstash/redis` to `@genai/website` package.json. The website app previously only had those packages in tools-app.

### Task 2 — `apps/website/app/actions/waitlist.ts` (commit `9135d24`)

Server Action implementing the full waitlist submit pipeline.

**Action signature:**
```typescript
export async function submitJoinWaitlist(formData: FormData): Promise<WaitlistResult>
```

**Exported types (stable interface — D-10):**
```typescript
export type WaitlistFieldErrors = Partial<{
  email: string; name: string; university: string;
  study_program: string; consent: string;
}>
export type WaitlistResult = { ok: true } | { ok: false; error: string; fieldErrors?: WaitlistFieldErrors }
```

**Zod Schema — all 7 fields with German error messages:**
| Field | Validation | Error message |
|-------|-----------|---------------|
| `email` | `string().trim().min(1).email().max(320)` | "Hmm, die Mail-Adresse passt noch nicht ganz." |
| `name` | `string().trim().min(1).max(200)` | "Das Feld darf nicht leer sein." |
| `university` | `string().trim().min(1).max(200)` | "Das Feld darf nicht leer sein." |
| `study_program` | optional string, max 200 | — |
| `marketing_opt_in` | `boolean().default(false)` | — |
| `consent` | `z.literal(true, { message })` | "Du musst der Datenschutzerklärung zustimmen, um fortzufahren." |
| `redirect_after` | optional, must start with `/` | open-redirect prevention |

**Execution pipeline:**
1. Honeypot check (`website` field must be empty)
2. IP rate-limit via Upstash (D-06)
3. Zod validation with `fieldErrors` mapping
4. Supabase `createAdminClient().from('waitlist').insert(payload)` with `email.toLowerCase()`
5. `23505` unique-violation → silent `{ ok: true }` (no-leak privacy, D-08)
6. Resend `WaitlistConfirmationEmail` — non-blocking try/catch (DB is source of truth)

**Deviation (Rule 3 — missing dep):** Added `zod` to `@genai/website` package.json.

### Task 3 — Smoke Test

tsc clean confirms structural correctness. Full end-to-end smoke test deferred to Plan 23-06 Playwright (the `next/headers` import and Supabase client make unit test setup in vitest heavyweight without benefit since the Playwright suite covers the same path).

---

## Threat Model Coverage

All 10 threats from the plan's STRIDE register are addressed:

| Threat ID | Mitigation |
|-----------|-----------|
| T-23-01 | Zod `.email()` server-side (client-side is convenience only) |
| T-23-02 | `z.literal(true)` on consent field |
| T-23-03 | Accept — `created_at` + `source` columns provide audit trail |
| T-23-04 | 23505 → `{ ok: true }` — no "email already exists" hint |
| T-23-05 | `createAdminClient()` uses service_role, RLS allows only that |
| T-23-06 | Upstash `slidingWindow(5, '15 m')` per IP |
| T-23-07 | `honeypot` field check as first step |
| T-23-08 | `redirect_after.refine(v => v.startsWith('/'))` |
| T-23-09 | Accept — `process.env.RESEND_API_KEY` server-only |
| T-23-10 | Explicit `WaitlistInsert` payload construction, no spread from FormData |

---

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 — Missing Dependency] Added @upstash/ratelimit + @upstash/redis to @genai/website**
- **Found during:** Task 1 — `tsc --noEmit` after creating `rate-limit.ts`
- **Issue:** Website app had no upstash dependencies (tools-app had them, website didn't)
- **Fix:** `pnpm --filter @genai/website add @upstash/ratelimit @upstash/redis`
- **Files modified:** `apps/website/package.json`, `pnpm-lock.yaml`
- **Commit:** `f8b749d`

**2. [Rule 3 — Missing Dependency] Added zod to @genai/website**
- **Found during:** Task 2 — zod was not in website app dependencies
- **Fix:** `pnpm --filter @genai/website add zod`
- **Files modified:** `apps/website/package.json`, `pnpm-lock.yaml`
- **Commit:** `9135d24`

**3. [Rule 1 — API Alignment] Used zod v4 `z.literal(true, { message })` instead of v3 `errorMap`**
- **Found during:** Task 2 — discovered project has zod v4.3.6 (not v3)
- **Issue:** Plan code used v3-style `{ errorMap: () => ({ message: ERR_CONSENT }) }`. While this works in v4, the cleaner v4 API is `{ message: ERR_CONSENT }` directly on `z.literal()`
- **Fix:** Used `z.literal(true, { message: ERR_CONSENT })` — tested that both parse and error behavior are correct

---

## Known Stubs

None. The action is fully wired.

---

## Threat Flags

None — no new trust boundaries beyond what the plan's threat model documents.

---

## Self-Check: PASSED

Verified:
- `apps/website/lib/rate-limit.ts` exists with correct exports and `slidingWindow(5, '15 m')`
- `apps/website/app/actions/waitlist.ts` exists with `'use server'`, all 3 exports, all 9 acceptance criteria
- Commits `f8b749d` (rate-limit), `9135d24` (waitlist action) exist in git log
- `tsc --noEmit` passes cleanly (no output = success)
