---
phase: 25
slug: circle-api-sync
status: human_needed
created: 2026-04-24
verifier: inline (Copilot/Opus-runtime, no Task-subagent available)
---

# Phase 25 — VERIFICATION

## Status: `human_needed`

Automated gates all pass. Live flows (Circle-API handshake, Supabase-SMTP delivery, Sentry wire-up) require human testing against Vercel preview with real Circle token. Captured in `25-HUMAN-UAT.md`.

## Plan Completion Matrix

| Plan | Scope | Autonomous | Status | Commit head |
|------|-------|------------|--------|-------------|
| 25-A | Supabase migration + env docs + types | ✅ true | complete | 906b9b4 |
| 25-B | @genai/circle package + 16 tests | ✅ true | complete | a05a520 |
| 25-C | confirm-signup template D-04 single-CTA | ✅ true | complete | 05265d9 |
| 25-D | /auth/confirm + welcome fallback + auth/error | ✅ true | complete | 9c50320 |
| 25-E | signup server action + waitlist router + api route | ✅ true | complete | 8f145f4 |
| 25-F | admin reprovision route + auth helper | ✅ true | complete | 05dcae2 |
| 25-G | waitlist re-invite script + template (autonomous:false) | ❌ false | complete (written, not run) | eecb109 |
| 25-H | Sentry config + E2E scaffold + safety notes | ✅ true | complete | 173cc49 |
| 25-I | docs + changeset + HUMAN-UAT (autonomous:false I4) | ❌ false (I4) | complete (HUMAN-UAT awaiting Luca) | 672a624 |

## Automated gates

### Typecheck

- `pnpm --filter @genai/auth exec tsc --noEmit` — **clean**
- `pnpm --filter @genai/emails exec tsc --noEmit` — **clean**
- `pnpm --filter @genai/circle exec tsc --noEmit` — **clean**
- `pnpm --filter @genai/website exec tsc --noEmit` — **clean for Phase-25 files**; 1 pre-existing Phase-24 error (`skill-radar-chart.test.tsx` unused `@ts-expect-error`) unchanged.

### Unit tests

- `@genai/circle` — **16/16 pass** (`packages/circle/src/__tests__/client.test.ts`)
- `@genai/website` — **83/83 pass** (includes 6 new admin-auth tests + 77 pre-existing)

### Lint

- `@genai/website` — 2 pre-existing Phase-24 errors (use-assessment.tsx Date.now impurity, labeled-nodes labelsRef-during-render). Not Phase-25 scope.
- Phase-25 lint: **clean** (unused eslint-disable in sentry.server.config.ts fixed in commit 356c620).

### Build (not run here — performed during Phase 24 + expected clean)

Bundle-safety check (`grep -r "CIRCLE_API_TOKEN" apps/website/.next/static/`) deferred to HUMAN-UAT post-build step (documented in `25-HUMAN-UAT.md`).

## Requirements coverage

| Req | Covered by | Notes |
|-----|-----------|-------|
| R6.1 — Server-Action end-to-end | Plan E (`submitJoinSignup`) + Plan D (`/auth/confirm`) | full flow wired, awaits live E2E |
| R6.2 — Single-CTA confirm mail | Plan C (`confirm-signup.tsx` "Loslegen →") | template updated + HTML regenerated |
| R6.3 — Non-blocking Circle provision | Plan E try/catch + Plan F admin retry + Plan D fallback page | all non-blocking paths wired |
| R6.4 — user_circle_links + metadata | Plan A migration + Plan E upsert + Plan F upsert | table live via MCP |
| R6.5 — `circle_member_id` in metadata | Plan E updateUserById | verified in code, awaits live run |
| R6.6 — Signup-Feature-Flag (Q11) | Plan E router in waitlist.ts + Plan E api route | flip via Vercel env only |
| R6.7 — Sentry circle-api tag | Plans D/E/F all tag `'circle-api':'true'` + Plan H config | DSN wiring is HUMAN-UAT |

## Decisions honored

- D-01 Supabase source of truth — ✅ (user_circle_links FKs auth.users)
- D-02 Soft SSO via email — ✅ (Circle createMember keyed by email)
- D-03 Non-blocking — ✅ (try/catch in signup + fallback `/welcome?circle=pending`)
- D-04 Single-CTA — ✅ (Loslegen → template, no double CTA)
- D-05 Manual retry — ✅ (admin-reprovision route, no auto-retry loop in signup)
- D-06 Welcome-space auto-join — ✅ (`addMemberToSpace(CIRCLE_DEFAULT_SPACE_ID)`)
- D-07 Metadata schema — ✅ (CircleUserMetadata type + runtime upsert)
- D-08 Token server-side only — ✅ (lazy getConfig in @genai/circle, no NEXT_PUBLIC_ prefix, Sentry beforeSend filter)
- D-09 Idempotency — ✅ (createMember GET-first, addMemberToSpace 409-swallow, upsert onConflict)
- D-10 Sentry tag — ✅ (`circle-api`+`op`, UUIDs not emails in extras)
- D-11 Launch gate in Phase 27 — ✅ (SIGNUP_ENABLED default false)

## Resolved Q1-Q11

- Q1 Circle token — Luca has Business plan; token placeholder in env, HUMAN-UAT to populate.
- Q2 Community/Space IDs — discovered via MCP: **511295** + **2574363**, documented in env-example + CIRCLE-INTEGRATION.md.
- Q3 Member-role standard — createMember uses default role.
- Q4 SSO TTL 7d — hard-coded default `DEFAULT_SSO_TTL_SECONDS = 7 * 24 * 60 * 60`.
- Q5 Legacy users manual — admin-reprovision route covers edge cases.
- Q6 Admin-auth magic-link + role/allowlist — `checkAdminAuth` helper implements both.
- Q7 Unified mail template — one `confirm-signup.tsx` for all signups.
- Q8 Sentry only — no Slack webhook wired.
- Q9 Name+Email only to Circle — createMember body contains `email`, `name`, `community_id`; no uni/motivation.
- Q10 Waitlist reinvite — script written, not run (Phase 27+).
- Q11 Env feature flag — `SIGNUP_ENABLED` gate in waitlist router + api route.

## Human verification items (HUMAN-UAT.md)

See `25-HUMAN-UAT.md` for the full checklist. High-level:

1. Vercel env push (Circle token + IDs + Sentry DSN + ADMIN_EMAIL_ALLOWLIST + SIGNUP_ENABLED per env).
2. Supabase Dashboard paste `confirm-signup.html` + test-send mail.
3. Preview E2E: happy path + negative (bad token → fallback).
4. Bundle-safety grep post-build.
5. Phase-27 flip `SIGNUP_ENABLED=true` in prod.
6. Post-launch run waitlist-reinvite script.

## Key deviations captured in plan SUMMARY files

- Plan B: defensive response parsing (records-array + single-object shapes) + sso_url-OR-access_token fallback in generateSsoUrl
- Plan D: added `/auth/error/page.tsx` (plan referenced but did not scope); installed `@sentry/nextjs` + `@genai/circle` deps
- Plan E: `createUser + generateLink(magiclink)` instead of `generateLink(signup)` per Supabase auth-js type reality; random placeholder password for createUser
- Plan F: route-level vitest tests deferred to Plan H E2E (plan F3 fallback explicitly permitted)
- Plan G: `@react-email/components` Button instead of slug-keyed EmailButton (no new PNG asset needed)
- Plan H: bundle-safety check as manual grep (HUMAN-UAT item) instead of cross-workspace vitest

## What's left

- HUMAN-UAT run-through by Luca (checklist in `25-HUMAN-UAT.md`).
- Phase 27 will flip SIGNUP_ENABLED=true.
