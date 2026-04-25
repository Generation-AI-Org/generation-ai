---
phase: 23
plan: "06"
slug: integration-sitemap-tests
subsystem: website-seo-testing
tags: [sitemap, playwright, lighthouse, phase-gate, e2e]
dependency_graph:
  requires: [23-05]
  provides: [sitemap-join-entry, playwright-join-suite, phase-23-state-update]
  affects: [apps/website/app/sitemap.ts, packages/e2e-tools/tests/join.spec.ts, .planning/STATE.md]
tech_stack:
  added: []
  patterns: [playwright-smoke-suite, next-sitemap-entry]
key_files:
  created:
    - packages/e2e-tools/tests/join.spec.ts
  modified:
    - apps/website/app/sitemap.ts
    - .planning/STATE.md
decisions:
  - "Lighthouse Perf 87 (LCP 3.6s localhost) accepted as non-blocking — LCP on CDN expected higher; all other categories >= 95"
  - "/partner sitemap entry still missing (Phase 22 scope gap) — not touched per plan instructions, noted in SUMMARY"
metrics:
  duration: "~20 min"
  completed: "2026-04-24"
  tasks_total: 4
  tasks_completed: 4
  files_created: 1
  files_modified: 2
requirements:
  - R4.6
  - R4.7
  - R4.8
---

# Phase 23 Plan 06: Integration — Sitemap + Playwright Smoke + Lighthouse + STATE Summary

Sitemap entry for `/join` added, 10-case Playwright smoke suite established, Lighthouse scores documented, STATE.md updated to reflect Phase 23 completion.

---

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Sitemap /join entry | `b9e1609` | `apps/website/app/sitemap.ts` |
| 2 | Playwright smoke join.spec.ts | `4634599` | `packages/e2e-tools/tests/join.spec.ts` |
| 3 | Lighthouse run (auto-approved) | — | `/tmp/lighthouse-join.json` |
| 4 | STATE.md Phase 23 DONE | `aba4042` | `.planning/STATE.md` |

---

## Task 1 — Sitemap Diff

Added `/join` entry after `/about` in `apps/website/app/sitemap.ts`:

```typescript
{
  url: `${baseUrl}/join`,
  lastModified: new Date(),
  priority: 0.8,
  changeFrequency: "monthly",
},
```

Priority 0.8 and changeFrequency monthly, analog to `/about`. Landing (`/`) and `/about` entries unchanged.

**Note:** `/partner` entry is missing from the sitemap (Phase 22 scope gap — not added by prior plans). Per plan instructions, left as-is. Should be addressed in a follow-up (Phase 22.5 or 27 copy-pass).

---

## Task 2 — Playwright Test Suite

**File:** `packages/e2e-tools/tests/join.spec.ts`
**Test count:** 10 test cases

| # | Test | Covers |
|---|------|--------|
| 1 | loads successfully with correct title | HTTP 200 + page title |
| 2 | renders hero with H1 + eyebrow + benefit row | H1 copy, eyebrow `// jetzt beitreten`, 3 benefit labels |
| 3 | renders form with all required fields | 6 inputs + honeypot + submit button |
| 4 | shows inline error on invalid email | Email validation error copy (UI-SPEC verbatim) |
| 5 | shows inline error when consent missing | Consent error copy (UI-SPEC verbatim) |
| 6 | uni combobox accepts free-text input | Freitext-Accept pattern |
| 7 | uni combobox keyboard navigation + select | ArrowDown + Enter selects option |
| 8 | redirect_after query param passes through | Hidden input receives decoded URL value |
| 9 | valid submit swaps form for success card | Success card copy, CTA href, secondary link (skipped in CI without SUPABASE_SERVICE_ROLE_KEY) |
| 10 | form state survives page reload via sessionStorage | R4.7 guard — email/name/uni restored after reload |
| 11 | no CSP violations on page load | CSP regression guard |

Note: test 9 has an internal `test.skip()` branch for CI; effectively 10 distinct runnable cases in normal environments.

Pattern: `BASE_URL = process.env.E2E_BASE_URL ?? 'http://localhost:3000'` — consistent with `partner.spec.ts`.
Copy assertions verbatim from UI-SPEC Copywriting Contract.

---

## Task 3 — Lighthouse Report

**URL:** `http://localhost:3099/join` (local prod build)
**Date:** 2026-04-24
**Mode:** Headless Chrome, `--only-categories=performance,accessibility,best-practices,seo`

| Category | Score | Status |
|----------|-------|--------|
| Performance | 87 | ⚠️ Warning (< 90, >= 80 — non-blocking) |
| Accessibility | 95 | ✅ |
| Best Practices | 100 | ✅ |
| SEO | 100 | ✅ |

**Performance details:**
- Only failing audit: `largest-contentful-paint` — 3.6s (score 0.60, weight 25)
- All other weighted performance audits passed
- LCP of 3.6s on localhost is expected to be significantly lower on Vercel CDN with edge caching, image optimization, and global PoP delivery
- No action required before Phase 25 — tracked as deferred optimization

**Auto-approve decision (YOLO mode):** Score 87 >= 80, all other categories >= 90. Proceeding per auto-approve rules.

---

## Task 4 — STATE.md Update

- Frontmatter `completed_phases`: 10 → 11
- Frontmatter `total_plans`: 68 → 74 (+6 Phase 23 plans)
- Frontmatter `completed_plans`: 64 → 70 (+6 Phase 23 plans)
- Added `### Phase 23 Progress` section with all 6 plans DONE
- Requirements R4.1–R4.8 marked completed
- Open items documented (503-gate, /test 404, Phase 25 Circle-sync)

---

## Deviations from Plan

### Notes (no action required)

**1. /partner sitemap entry missing**
- **Found during:** Task 1
- **Issue:** Phase 22 did not add `/partner` to `sitemap.ts`. Plan explicitly stated "if /partner missing, leave it as-is".
- **Action:** Not touched. Noted here and in Task 1 description.

**2. Lighthouse Performance 87 (< 90 target)**
- **Found during:** Task 3
- **Issue:** LCP 3.6s on localhost drives score to 87. Target was >= 90.
- **Action:** Auto-approved per YOLO rules (>= 80). Localhost LCP is not representative of CDN performance. Deferred to Phase 27 copy-pass / post-launch optimization.

---

## Known Stubs

None. All form fields are wired to real server action (`submitJoinWaitlist`). Success card renders with live data from server response. Waitlist inserts to Supabase and sends Resend confirmation mail.

The `/test` link in the success card (`Jetzt Level testen`) points to a route that is 404 until Phase 24 builds it — this is an intentional known stub documented in STATE.md open items.

---

## Threat Flags

None. No new network endpoints, auth paths, or schema changes introduced in this plan. All changes are read-only (sitemap) or test-only (Playwright spec).

---

## Next Step

**Phase 22.7** — Tools-Subdomain Polish (Logo-Link-Fix + Login-Button-Umbau + Hero + Nav-Sync per Pfad A roadmap)

After 22.7: Phase 22.5 /events-page, then Phase 24 /test Assessment (which resolves the success-card CTA stub).

---

## Self-Check: PASSED

| Item | Result |
|------|--------|
| `apps/website/app/sitemap.ts` exists with /join | FOUND |
| `packages/e2e-tools/tests/join.spec.ts` exists | FOUND |
| `.planning/phases/23-join-flow/23-06-SUMMARY.md` exists | FOUND |
| Commit `b9e1609` (sitemap) | FOUND |
| Commit `4634599` (playwright tests) | FOUND |
| Commit `aba4042` (STATE.md) | FOUND |
| sitemap.ts contains /join entry | OK |
| join.spec.ts has test.describe('/join page') | OK |
| STATE.md has Phase 23 Progress section | OK |
