---
phase: 23-join-flow
verified: 2026-04-24T12:00:00Z
status: human_needed
score: 15/16 must-haves verified
overrides_applied: 0
re_verification: false
human_verification:
  - test: "Navigate to /join in a browser and fill out the form with valid data, then submit"
    expected: "Supabase waitlist row created, Resend confirmation email delivered to inbox, success card animates in with 'Danke, {Vorname}!' headline"
    why_human: "End-to-end DB insert + transactional email delivery cannot be verified without live Supabase service-role credentials and a real mail inbox"
  - test: "Run Playwright test suite against dev server (pnpm dev:website)"
    expected: "All 11 test cases in join.spec.ts pass green"
    why_human: "Playwright tests require running dev server + live Supabase + live Upstash env vars to exercise the full submit path"
  - test: "Run Lighthouse on /join in Chrome DevTools on the deployed Vercel preview URL"
    expected: "Performance >= 90 (localhost scored 87, CDN expected higher); A11y, Best Practices, SEO all >= 90"
    why_human: "Localhost LCP is inflated vs CDN; real score needs a Vercel preview URL; automated check cannot run browser lighthouse"
deferred:
  - truth: "Assessment CTA on success card links to a live /test route"
    addressed_in: "Phase 24"
    evidence: "Phase 24 goal: 'Optionaler Kompetenz-Test mit Level-Score-Output' — builds the /test Assessment page that is the CTA target"
---

# Phase 23: `/join` Fragebogen-Flow Verification Report

**Phase Goal:** Waitlist-V1-Landing (Single-Page + Inline-Success-Swap) mit Form-Validation, Rate-Limit, Supabase-Insert, Resend-Confirmation-Mail. Live-Signup-Reaktivierung bleibt auf Phase 25 verschoben — bis dahin sammelt /join Waitlist-Einträge.
**Verified:** 2026-04-24T12:00:00Z
**Status:** human_needed
**Re-verification:** No — initial verification

---

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | `/join` route exists and renders as dynamic (ƒ) | VERIFIED | `apps/website/app/join/page.tsx` exists; `pnpm --filter @genai/website build` output shows `ƒ /join` |
| 2 | Hero has `min-h-[60vh]` (not full-height) | VERIFIED | `join-hero-section.tsx:42` contains `className="flex min-h-[60vh] flex-col items-center justify-center"` |
| 3 | Form has all 6 required fields (email, name, university combobox, study_program, gdpr_consent, marketing_opt_in) | VERIFIED | All fields present in `join-form-card.tsx`; name field is single combined "VOR- UND NACHNAME"; marketing field uses correct `name="marketing_opt_in"` |
| 4 | No Self-Select-Level or multi-step wizard fields | VERIFIED | No `level`, `self_select`, progress bar, or step indicator found in form-card; single-page layout confirmed |
| 5 | Inline-success-swap via AnimatePresence mode="wait" | VERIFIED | `join-form-section.tsx` contains `<AnimatePresence mode="wait">` (5 occurrences including imports) |
| 6 | SessionStorage persistence (R4.7): DRAFT_KEY, readDraft/writeDraft/clearDraft, useEffect hydration | VERIFIED | `join-form-card.tsx` has `const DRAFT_KEY = 'join-form-draft'`, `readDraft()`, `writeDraft()`, `clearDraft()`; mount-only `useEffect` for hydration; debounced 300ms write; `clearDraft()` on success |
| 7 | Assessment CTA post-submit links to `/test` | VERIFIED | `join-success-card.tsx` contains `href="/test"` and `Jetzt Level testen (2 min)` label |
| 8 | Supabase waitlist migration exists with RLS | VERIFIED | `supabase/migrations/20260424000001_waitlist.sql` exists (51 lines); contains `enable row level security`, `service_role_select_waitlist`, `service_role_insert_waitlist` policies |
| 9 | Server Action `submitJoinWaitlist` with Zod + rate-limit + Supabase insert + Resend mail | VERIFIED | `apps/website/app/actions/waitlist.ts`: `'use server'` line 1; exports `submitJoinWaitlist`, `WaitlistResult`, `WaitlistFieldErrors`; Zod schema with all fields; `checkWaitlistRateLimit`; `createAdminClient().from('waitlist').insert()`; `WaitlistConfirmationEmail` render + `resend.emails.send()` |
| 10 | Rate-limit: Upstash slidingWindow(5, '15 m') | VERIFIED | `apps/website/lib/rate-limit.ts` line: `Ratelimit.slidingWindow(5, '15 m'), // D-06` with prefix `ratelimit:waitlist:ip` |
| 11 | Email template exported from @genai/emails | VERIFIED | `packages/emails/src/templates/waitlist-confirmation.tsx` exists; `packages/emails/src/index.ts` exports `WaitlistConfirmationEmail` and `WaitlistConfirmationEmailProps` |
| 12 | Sitemap entry `/join` with priority 0.8 | VERIFIED | `apps/website/app/sitemap.ts` contains `url: \`${baseUrl}/join\`` with `priority: 0.8`, `changeFrequency: "monthly"` |
| 13 | Playwright smoke tests with ≥9 test cases | VERIFIED | `packages/e2e-tools/tests/join.spec.ts` exists with 11 `test()` cases covering: loads, hero, form fields, email error, consent error, uni free-text, uni keyboard nav, redirect_after, valid submit swap, sessionStorage reload, CSP |
| 14 | CSP compliance: MotionConfig nonce prop + await headers() in page.tsx | VERIFIED | `join-client.tsx`: `<MotionConfig nonce={nonce}>`; `app/join/page.tsx`: `const nonce = (await headers()).get('x-nonce') ?? ''`; build output confirms `ƒ /join` (dynamic) |
| 15 | CR-01 open-redirect fix: regex whitelist + sanitize in waitlist.ts | VERIFIED | `waitlist.ts:70`: `.refine((v) => !v \|\| /^\/[A-Za-z0-9_\-][A-Za-z0-9_\-/?=&.%#]*$/.test(v))`; sanitization via `replace(/\\/g, '').replace(/^\/+/, '/')` confirmed |
| 16 | Supabase insert + Resend email deliver end-to-end (functional) | NEEDS HUMAN | Cannot verify live DB row creation or email delivery without running credentials and real inbox |

**Score:** 15/16 truths verified (1 needs human confirmation for live delivery)

---

### Deferred Items

Items not yet met but explicitly addressed in later milestone phases.

| # | Item | Addressed In | Evidence |
|---|------|-------------|----------|
| 1 | Assessment CTA links to a live /test route (currently 404) | Phase 24 | Phase 24 goal: "Optionaler Kompetenz-Test mit Level-Score-Output" builds the `/test` page that is the CTA target on the success card |

---

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|---------|--------|---------|
| `apps/website/app/join/page.tsx` | Server-Component with `await headers()` + Metadata | VERIFIED | 1755 bytes; `await headers()` confirmed; full OpenGraph + canonical metadata |
| `apps/website/components/join-client.tsx` | Client-Wrapper with MotionConfig nonce | VERIFIED | `'use client'`; `<MotionConfig nonce={nonce}>`; Header + main + Footer |
| `apps/website/components/join/join-hero-section.tsx` | Hero with min-h-[60vh] + eyebrow + H1 + benefit row | VERIFIED | 3706 bytes; `min-h-[60vh]`; `// jetzt beitreten`; `2 Minuten — dann bist du dabei.`; 3 benefit items |
| `apps/website/components/join/join-form-section.tsx` | AnimatePresence wrapper for form/success swap | VERIFIED | 1437 bytes; `<AnimatePresence mode="wait">` |
| `apps/website/components/join/join-form-card.tsx` | Form with all fields + SessionStorage persistence | VERIFIED | 18176 bytes; all 6 fields + honeypot + redirect_after; DRAFT_KEY; readDraft/writeDraft/clearDraft |
| `apps/website/components/join/join-success-card.tsx` | Success card with assessment CTA | VERIFIED | 3200 bytes; `href="/test"`; `Jetzt Level testen (2 min)`; `Später im Dashboard` |
| `apps/website/components/join/uni-combobox.tsx` | ARIA combobox with keyboard nav + free-text | VERIFIED | 240 lines (>120); `role="combobox"`, `role="listbox"`, `role="option"`; `useReducedMotion()`; UNIVERSITIES import |
| `apps/website/lib/universities.ts` | ≥30 DE universities + fallback options | VERIFIED | 79 lines; 40+ entries; `Andere Hochschule`, `Ausbildung / Berufstätig`, `Kein Studium` |
| `apps/website/app/actions/waitlist.ts` | Server Action with Zod + rate-limit + insert + mail | VERIFIED | `'use server'` line 1; all required exports; honeypot; rate-limit; Zod; 23505 duplicate handling; non-blocking Resend |
| `apps/website/lib/rate-limit.ts` | Upstash slidingWindow(5, '15 m') | VERIFIED | `slidingWindow(5, '15 m')`; graceful degrade on missing env vars; prefix `ratelimit:waitlist:ip` |
| `packages/emails/src/templates/waitlist-confirmation.tsx` | React Email template | VERIFIED | Exists; `export default function WaitlistConfirmationEmail`; `WaitlistConfirmationEmailProps` |
| `packages/emails/src/index.ts` | Re-export of WaitlistConfirmationEmail | VERIFIED | Both `WaitlistConfirmationEmail` and `WaitlistConfirmationEmailProps` exported |
| `packages/auth/src/waitlist.ts` | WaitlistRow + WaitlistInsert types | VERIFIED | `export interface WaitlistRow` + `export interface WaitlistInsert` |
| `packages/auth/src/index.ts` | Re-export of Waitlist types | VERIFIED | `export type { WaitlistRow, WaitlistInsert } from './waitlist'` |
| `supabase/migrations/20260424000001_waitlist.sql` | Idempotent migration with RLS | VERIFIED | 51 lines; `create table if not exists public.waitlist`; `enable row level security`; 2 service_role policies |
| `apps/website/app/sitemap.ts` | /join entry with priority 0.8 | VERIFIED | Entry present with `priority: 0.8`, `changeFrequency: "monthly"` |
| `packages/e2e-tools/tests/join.spec.ts` | Playwright smoke tests ≥9 cases | VERIFIED | 11 test cases; CSP check; sessionStorage reload; redirect_after |

---

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `app/join/page.tsx` | `join-client.tsx` | `<JoinClient nonce={nonce} />` | WIRED | Confirmed in page.tsx |
| `join-client.tsx` | `join-hero-section.tsx` + `join-form-section.tsx` | Direct imports + JSX | WIRED | Both imported and rendered in JoinClient |
| `join-form-card.tsx` | `app/actions/waitlist.ts` | `submitJoinWaitlist(formData)` | WIRED | Import + call in handleSubmit startTransition |
| `join-form-card.tsx` | `uni-combobox.tsx` | `<UniCombobox ... />` | WIRED | Imported and rendered in university field slot |
| `join-form-card.tsx` | `sessionStorage` | `window.sessionStorage.setItem('join-form-draft', ...)` | WIRED | DRAFT_KEY constant; writeDraft on debounce; readDraft on mount useEffect |
| `join-form-section.tsx` | `join-form-card.tsx` + `join-success-card.tsx` | `AnimatePresence mode="wait"` state swap | WIRED | Both cards in AnimatePresence; `submittedName` state drives swap |
| `waitlist.ts` | `public.waitlist` (Supabase) | `createAdminClient().from('waitlist').insert(payload)` | WIRED | Lines 150-161 |
| `waitlist.ts` | `WaitlistConfirmationEmail` (Resend) | `render(WaitlistConfirmationEmail({ name }))` + `resend.emails.send(...)` | WIRED | Non-blocking try/catch block |
| `waitlist.ts` | `rate-limit.ts` | `checkWaitlistRateLimit(ip)` | WIRED | Import + call at top of action |
| `uni-combobox.tsx` | `lib/universities.ts` | `import { UNIVERSITIES } from '@/lib/universities'` | WIRED | Import confirmed; used in `filtered` useMemo |

---

### Data-Flow Trace (Level 4)

| Artifact | Data Variable | Source | Produces Real Data | Status |
|----------|--------------|--------|-------------------|--------|
| `join-form-card.tsx` | `draft` (form state) | `readDraft()` from sessionStorage on mount; `updateField()` on user input | Yes — controlled inputs; sessionStorage populated by user | FLOWING |
| `join-success-card.tsx` | `name` prop | Passed from `join-form-section.tsx` `submittedName` state; set from `formData.get('name')` on successful server response | Yes — live from submitted form | FLOWING |
| `waitlist.ts` | `payload` (WaitlistInsert) | Zod-parsed `formData` fields | Yes — validated form data from client | FLOWING |
| Note: `/test` CTA in success card | `href="/test"` | Hardcoded — Phase 24 not yet built | N/A — intentional stub per D-15 | DEFERRED (Phase 24) |

---

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
|----------|---------|--------|--------|
| `/join` route is dynamic | `pnpm --filter @genai/website build` output | `ƒ /join` confirmed | PASS |
| Sitemap contains /join | `grep "/join" apps/website/app/sitemap.ts` | Entry found with priority 0.8 | PASS |
| Playwright spec has ≥9 tests | `grep -c "test(" packages/e2e-tools/tests/join.spec.ts` | 11 | PASS |
| Live DB insert + email delivery | Requires running server + credentials | Cannot run without env | SKIP (human needed) |

---

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|------------|-------------|--------|---------|
| R4.1 | 23-05 (covered-as-revised D-17) | Linear flow with progress indicator | SATISFIED (revised) | D-17 locks Single-Page layout; no multi-step wizard per D-17; single form card verified |
| R4.2 | 23-05 (covered-as-revised D-18) | Step 1: Name, Email, Status, Uni, Motivation, Self-Select Level | SATISFIED (revised) | D-18 removes Status/Level/Motivation fields; delivers Email, Name, Uni-Combobox, Studiengang; form-card confirmed |
| R4.3 | 23-05 (covered-as-revised D-15) | Step 2: Assessment-Weiche CTA | SATISFIED (revised) | D-15 moves Assessment-Weiche to success-card post-submit CTA; `href="/test"` confirmed |
| R4.4 | 23-05 (covered-as-revised D-01/D-10) | Step 3: Account + Circle-Flow | SATISFIED (revised) | D-01/D-10 defer live Circle-Sync to Phase 25; V1 delivers Waitlist-Insert with stable interface; deferred per plan |
| R4.5 | 23-01, 23-02 | Step 4: Confirmation-Screen / Email | SATISFIED | `WaitlistConfirmationEmail` template exists; Supabase `waitlist` table exists; success-card rendered |
| R4.6 | 23-03, 23-04, 23-05 | Validation per step (Email format, required fields, Uni-Autocomplete) | SATISFIED | Zod schema in waitlist.ts; UniCombobox with ARIA autocomplete; client-side pre-validation in form-card; all confirmed |
| R4.7 | 23-05 | State persists via SessionStorage | SATISFIED | DRAFT_KEY `join-form-draft`; readDraft/writeDraft/clearDraft; mount useEffect hydration; debounced write; clearDraft on success; all confirmed |
| R4.8 | 23-01, 23-03 | Backend 503-Gate — UI complete, Submit testable | SATISFIED | UI fully built; live signup deferred per D-01; waitlist insert works (service_role) while main signup stays 503 |

All R4.1–R4.8 satisfied (R4.1–R4.4 as-revised per decisions D-17, D-18, D-15, D-01 documented in 23-05-PLAN.md Scope Note).

---

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| `apps/website/components/join/join-success-card.tsx` | `href="/test"` | Link to non-existent route (Phase 24 dependency) | Info | Expected stub; documented in STATE.md; Phase 24 resolves it |
| `apps/website/lib/universities.ts` | line ~59 | `'Universität Münster (FH)'` — entity does not exist (should be `'FH Münster'`) | Info | Data-correctness issue; skipped in code-review fix pass (IN-07 info-severity) |
| `apps/website/app/actions/waitlist.ts` | line 149 | `console.log` on duplicate-email path (should be `console.info`) | Info | Log aggregation cosmetic; IN-01 skipped in fix pass |

No STUB, MISSING, or BLOCKER patterns found. All form fields are wired to live server action. No placeholders, no `return null`, no empty handlers in critical paths.

---

### Human Verification Required

#### 1. Live Submit End-to-End

**Test:** Start `pnpm dev:website`, navigate to `http://localhost:3000/join`, fill in a real email address with name, university, and check the GDPR checkbox, then click "Kostenlos beitreten".

**Expected:**
- Button shows spinner while pending
- Success card animates in with "Danke, {Vorname}! Wir melden uns, sobald wir live gehen."
- A row appears in Supabase `public.waitlist` with the submitted data
- Confirmation email arrives in inbox with subject "Du stehst auf der Warteliste — Generation AI"

**Why human:** Live Supabase service-role insert and Resend email delivery require running credentials; cannot be verified by static code analysis or build checks alone.

#### 2. Playwright Test Suite Run

**Test:** With `pnpm dev:website` running and all env vars set (SUPABASE_SERVICE_ROLE_KEY, RESEND_API_KEY, UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN), run `pnpm --filter @genai/e2e-tools test -- --grep "join"`.

**Expected:** All 11 test cases pass green, including the valid submit swap test (which writes a real waitlist row).

**Why human:** Playwright needs a running dev server and live external services; the test for `valid submit swaps form for success card` requires actual DB access.

#### 3. Lighthouse Performance on Vercel Preview

**Test:** Deploy to Vercel preview, run Lighthouse in Chrome DevTools (Mobile preset) on the preview URL.

**Expected:** Performance ≥ 90 (localhost scored 87 — CDN expected to improve LCP); Accessibility ≥ 90; Best Practices ≥ 90; SEO ≥ 90.

**Why human:** Localhost LCP is inflated vs CDN performance; automated headless Lighthouse without running server is not available in verification context.

---

### Gaps Summary

No automated gaps found. All 15 verifiable must-haves passed. One item (live submit + email delivery) requires human confirmation. The `/test` CTA is an intentional deferred stub covered by Phase 24. The Lighthouse Performance score of 87 on localhost is documented as accepted in 23-06-SUMMARY.md ("Localhost LCP is not representative of CDN performance. Deferred to Phase 27 copy-pass / post-launch optimization.") — no action required until post-launch.

---

_Verified: 2026-04-24T12:00:00Z_
_Verifier: Claude (gsd-verifier)_
