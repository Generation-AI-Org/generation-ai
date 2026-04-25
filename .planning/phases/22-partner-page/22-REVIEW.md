---
phase: 22
status: clean
depth: standard
files_reviewed: 15
findings:
  critical: 0
  warning: 0
  info: 2
  total: 2
reviewed: 2026-04-24
---

# Code Review — Phase 22: partner-page

**Status: CLEAN** — No critical or warning issues. 2 informational observations.

## Files Reviewed

1. `packages/emails/src/templates/partner-inquiry.tsx`
2. `packages/emails/src/templates/partner-inquiry-confirmation.tsx`
3. `packages/emails/src/index.ts`
4. `apps/website/app/actions/partner-inquiry.ts`
5. `apps/website/package.json`
6. `apps/website/components/partner/partner-hero-section.tsx`
7. `apps/website/components/partner/partner-tab-content.tsx`
8. `apps/website/components/partner/partner-tab-system.tsx`
9. `apps/website/components/partner/partner-contact-form.tsx`
10. `apps/website/components/partner/partner-person-card.tsx`
11. `apps/website/components/partner/partner-verein-hint.tsx`
12. `apps/website/app/partner/page.tsx`
13. `apps/website/components/partner-client.tsx`
14. `apps/website/components/layout/header.tsx`
15. `packages/e2e-tools/tests/partner.spec.ts`

## Findings

### INFO-01 — Non-null assertion on TABS array access

**File:** `apps/website/components/partner/partner-tab-system.tsx:66`
**Code:** `const nextSlug = TABS[nextIndex]!.slug`
**Assessment:** Safe. `nextIndex` is always `0..TABS.length-1` by construction (modulo arithmetic + bounds checks). The `!` assertion correctly communicates TypeScript cannot infer this, but there is no runtime risk. No action required.

### INFO-02 — Mail addresses are placeholders

**File:** `apps/website/components/partner/partner-person-card.tsx`
**Code:** `mail: 'admin@generation-ai.org', // TODO: replace with alex@ when confirmed`
**Assessment:** Intentional per D-07. Three TODO comments mark the fallback addresses. These must be updated before launch once Luca confirms real addresses. Surfaced here for tracking.

## What Passed

- **Security:** No hardcoded API keys. Honeypot implemented correctly (`name="website"`, `tabIndex={-1}`, `aria-hidden="true"`, `className="sr-only"`). Server Action has `'use server'` directive. Email content rendered via React Email (no raw HTML injection risk).
- **TypeScript:** All 15 files compile cleanly with `tsc --noEmit`. No `as any` casts in new code.
- **ARIA:** Tab pattern fully compliant — `role="tablist"`, `role="tab"`, `role="tabpanel"`, `aria-selected`, `aria-controls`, `aria-labelledby`, `hidden` attribute (not CSS class). Keyboard navigation correct with proper dependency arrays.
- **React hooks:** `useCallback` dependency arrays are correct. `setActiveTyp` uses `[]` (setter is stable). `handleKeyDown` correctly includes `[setActiveTyp]`. `TABS` is module-level constant — no stale closure risk.
- **CSP/Nonce:** `await headers()` in `page.tsx` forces dynamic rendering per LEARNINGS.md. `MotionConfig nonce={nonce}` in client wrapper is correct.
- **Graceful degradation:** Confirmation email failure silently caught and logged — admin notification always completes. TODO comment for noreply@ domain verification present as required.
- **Form accessibility:** `useId()` for label associations. `aria-describedby`/`aria-invalid` binding. `role="alert"` on error and success elements.
- **E2E tests:** ARIA-based selectors throughout. Resend-dependent test guarded with `test.skip()`. 13 tests covering all required scenarios.
