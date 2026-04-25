---
phase: 23
plan: 05
slug: join-page-components
subsystem: website/join
tags: [join, form, hero, sessionStorage, csp, conversion, waitlist]
dependency_graph:
  requires:
    - 23-03 (submitJoinWaitlist Server Action)
    - 23-04 (UniCombobox component)
  provides:
    - /join route (Server-Component + Client-Wrapper + Hero + Form + Success)
  affects:
    - apps/website/app/join/page.tsx
    - apps/website/components/join-client.tsx
    - apps/website/components/join/join-hero-section.tsx
    - apps/website/components/join/join-form-section.tsx
    - apps/website/components/join/join-form-card.tsx
    - apps/website/components/join/join-success-card.tsx
tech_stack:
  added: []
  patterns:
    - Client-Wrapper pattern (analog about-client.tsx)
    - AnimatePresence mode="wait" inline swap (form ↔ success)
    - SessionStorage draft persistence with mount-only hydration
    - Server-Component + await headers() for CSP nonce
    - useSearchParams in Client-Component wrapped in Suspense
key_files:
  created:
    - apps/website/app/join/page.tsx
    - apps/website/components/join-client.tsx
    - apps/website/components/join/join-hero-section.tsx
    - apps/website/components/join/join-form-section.tsx
    - apps/website/components/join/join-form-card.tsx
    - apps/website/components/join/join-success-card.tsx
  modified: []
decisions:
  - "min-h-[60vh] for Hero per D-19 (form visible below fold on desktop)"
  - "No SectionTransition between Hero and Form per UI-SPEC Layout Contract"
  - "Single name field (not first+last) for minimal friction per D-02"
  - "marketing_opt_in field name follows plan/Zod schema (not UI-SPEC typo marketing_consent)"
  - "Suspense boundary wraps JoinClient for useSearchParams() in JoinFormCard"
metrics:
  duration_minutes: 3
  completed_date: "2026-04-24"
  tasks_completed: 3
  tasks_total: 3
  files_created: 6
  files_modified: 0
---

# Phase 23 Plan 05: Join Page Components Summary

> /join route built end-to-end: Server-Component + Client-Wrapper + LabeledNodes Hero + SessionStorage-persisted Form + AnimatePresence Success-Swap.

## What Was Built

Six files delivering the complete `/join` conversion page for Phase 23 V1 Waitlist:

1. **`app/join/page.tsx`** — Server-Component. `await headers()` extracts CSP nonce, passes to `<JoinClient>`. `<Suspense>` boundary required for `useSearchParams()` in JoinFormCard. Exports Metadata with OG + canonical.

2. **`components/join-client.tsx`** — Client-Wrapper. `<MotionConfig nonce={nonce}>` + `<Header>` + `<main id="main-content" className="min-h-screen pt-20">` + `<Footer>`. No SectionTransition between Hero/Form per D-19 Layout Contract.

3. **`components/join/join-hero-section.tsx`** — Hero with LabeledNodes background (15 conversion-focused labels), `min-h-[60vh]` (D-19), Eyebrow `// jetzt beitreten`, H1 "2 Minuten — dann bist du dabei.", Lede "Kostenlos. Für alle Fachrichtungen. Keine Haken.", 3 Benefit-Items with dot-accents.

4. **`components/join/join-form-section.tsx`** — AnimatePresence `mode="wait"` wrapper. Manages `submittedName` state. Form exits (`opacity: 0, y: -12`, 200ms) then Success enters (`opacity: 0, y: 12` → `1, 0`, 300ms delay 50ms).

5. **`components/join/join-form-card.tsx`** — 6 fields: email, name, UniCombobox (university), study_program (optional), DSGVO-consent (required), marketing_opt_in (optional). SessionStorage R4.7: mount-only hydration, 300ms debounced write, clearDraft() on success. redirect_after hidden field passthrough (D-03). Client-side validation + server error banner.

6. **`components/join/join-success-card.tsx`** — Danke headline + body copy + primary CTA "Jetzt Level testen (2 min)" → `/test` (ArrowRight icon) + secondary "Später im Dashboard". Programmatic focus on mount (WCAG 2.4.3). `role="status" aria-live="polite"`.

## Build Output Snippet

```
├ ƒ /join
```

`ƒ` = dynamic rendering confirmed. `await headers()` in page.tsx forces dynamic per LEARNINGS.md Rule 2. Root-Layout also has `export const dynamic = "force-dynamic"` as double safety.

## CSP-Check Status

- Build: `ƒ /join` (not `○`) — nonce-compatible
- Local prod smoke (`PORT=3099 NODE_ENV=production pnpm start`): HTTP 200
- HTML contains "2 Minuten" (H1 text) confirmed via curl smoke test
- No changes to `proxy.ts` or `lib/csp.ts` — existing nonce pipeline untouched

## SessionStorage Keys + R4.7 Coverage

| Key | Type | Description |
|-----|------|-------------|
| `join-form-draft` | JSON string | `{ email, name, university, study_program, marketing_opt_in }` |

- **Hydration:** Mount-only `useEffect` — SSR renders from `emptyDraft`, client hydrates from sessionStorage after mount. No hydration mismatch.
- **Write:** Debounced 300ms after every `draft` state change. Only fires after `hydrated=true` to prevent overwriting stored draft with empty state.
- **Clear:** `clearDraft()` called in `onSuccess` path after successful submit.
- **Error safety:** All sessionStorage calls in `try/catch` + `typeof window === 'undefined'` guards.

## Commits

| Hash | Message |
|------|---------|
| `fb7d6fc` | feat(23-05): add JoinHeroSection + JoinFormSection structural shell |
| `1df65c1` | feat(23-05): add JoinFormCard + JoinSuccessCard with SessionStorage persistence |
| `55b64e9` | feat(23-05): add JoinClient wrapper + /join Server-Component page |

## Deviations from Plan

None - plan executed exactly as written.

The plan already accounted for all structural decisions (D-19 min-h, D-21 no H2, D-22 inline swap, D-03 redirect_after, marketing_opt_in naming). One executor-level choice: single `name` field (Vor- und Nachname) per D-02 minimal friction guidance in UI-SPEC Component 3.

## Known Stubs

| Stub | File | Reason |
|------|------|--------|
| `href="#"` on "Später im Dashboard" secondary link | `join-success-card.tsx:74` | Dashboard URL not yet determined. Phase 25 Circle-API-Sync will define the authenticated dashboard route. |
| `/test` link leads to 404 | `join-success-card.tsx:52` | Assessment page built in Phase 24. Link present but page doesn't exist yet. |

Both stubs are intentional per plan: D-15 documents that `/test` is Phase 24 scope, and the dashboard URL is Phase 25 scope.

## Threat Flags

None. No new network endpoints, auth paths, file access patterns, or schema changes introduced in this plan. All API calls go through the existing `submitJoinWaitlist` server action (validated in Plan 23-03).

## Open Questions for Plan 23-06 (E2E Tests)

- Playwright spec: `packages/e2e-tools/tests/join.spec.ts`
  - Route loads HTTP 200
  - Form submits → Success-Card renders (mock server action or use test Supabase)
  - Invalid email shows inline error
  - DSGVO unchecked on submit shows consent error
  - Rate-limit after 6 rapid submits shows banner "Zu viele Versuche"
  - SessionStorage: reload mid-fill preserves email/name/university fields
  - Combobox keyboard navigation (ArrowDown, Enter, Escape)
- Sitemap entry `/join` in `app/sitemap.ts` (Priority 0.8)

## Self-Check: PASSED

Files exist check:
- apps/website/app/join/page.tsx: FOUND
- apps/website/components/join-client.tsx: FOUND
- apps/website/components/join/join-hero-section.tsx: FOUND
- apps/website/components/join/join-form-section.tsx: FOUND
- apps/website/components/join/join-form-card.tsx: FOUND
- apps/website/components/join/join-success-card.tsx: FOUND

Commits exist check:
- fb7d6fc: FOUND
- 1df65c1: FOUND
- 55b64e9: FOUND

Build: ƒ /join confirmed dynamic.
