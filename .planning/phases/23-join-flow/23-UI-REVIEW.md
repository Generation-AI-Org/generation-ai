---
phase: 23
slug: join-flow
type: ui-review
status: pass
total_score: 22
max_score: 24
pillar_scores:
  typography: 4
  spacing: 4
  color: 4
  layout: 4
  copywriting: 3
  a11y_interaction: 3
created: 2026-04-24
baseline: 23-UI-SPEC.md + AGENTS.md Unterseiten-Blueprint
screenshots: .planning/ui-reviews/023-20260424-102443/
---

# Phase 23 — UI Review — `/join`

**Audited:** 2026-04-24
**Baseline:** `23-UI-SPEC.md` (approved design contract) + `apps/website/AGENTS.md` (subpages blueprint) + reference implementations `/about`, `/partner`
**Screenshots:** captured (1440/900 desktop, 768/1024 tablet, 375/812 mobile + motion-settled re-captures)
**Live dev server:** `http://localhost:3000/join` (HTTP 200, verified)

---

## Pillar Scores

| Pillar | Score | Key Finding |
|--------|-------|-------------|
| 1. Typography | 4/4 | 100% token-driven; exactly 4 canonical sizes; identical to `/about` |
| 2. Spacing | 4/4 | 4-point grid everywhere; `py-20` hero parity; `min-h-[44px]` on all interactive elements |
| 3. Color | 4/4 | Zero hardcoded hex in join components; accent reserved to 6 documented slots; one RGBA error-banner tint is the only exception and matches `partner-contact-form.tsx` |
| 4. Layout/Composition | 4/4 | Hero/form/success boundaries clean; `max-w-4xl` hero + `max-w-lg` form; D-19 deviation documented and working |
| 5. Copywriting | 3/4 | UI-SPEC copy verbatim matches; one minor field-name typo in UI-SPEC resolved in code; one VOICE-style gap in rate-limit surface (see below) |
| 6. A11y / Interaction | 3/4 | 36 ARIA attributes across 5 files; full keyboard combobox; touch targets honored; two small gaps (`href="#"` placeholder + missing `aria-live` region for client-side validation errors) |

**Overall: 22/24 → PASS**

Threshold: `≥ 18 = pass`, `12-17 = needs-polish`, `<12 = fail`.

---

## Top 3 Priority Fixes

Each fix is small, surgical, and bounded. None are blockers — `/join` ships today. Queue as polish before Phase 25 live-go.

1. **Secondary link has `href="#"` placeholder.** Clicking it scrolls to top of page and pushes `#` into URL history — screenreaders announce it as a link with no destination.
   `apps/website/components/join/join-success-card.tsx:87`
   Fix: change to `<button>` with `onClick={() => {}}` noop + `aria-disabled="true"`, OR point at a documented 503-route (e.g. `/dashboard` analog to the `/test` placeholder pattern used above). UI-SPEC line 413 already flags this as `"placeholder until dashboard URL is decided"` — lock in the decision now.

2. **Client-side validation errors fire `role="alert"` but have no polite live-region.** The first error gets announced (good), but when a user fixes field A then submits and hits a new error on field B, screenreaders may miss it because the previous alert region was never cleared. All error `<p>`s use `role="alert"` (immediate) which can stack poorly.
   `apps/website/components/join/join-form-card.tsx:224, 262, 304, 371`
   Fix: lift a single `<div aria-live="polite" aria-atomic="true" className="sr-only">` summary region into the form root; feed it a short summary on every validation pass (`"Ein Feld benötigt Aufmerksamkeit: E-Mail."`). Keep the inline `role="alert"` for visual context. Partner form shows the same pattern gap — one-time fix can be lifted into a shared hook later.

3. **Rate-limit server error is generic; UI-SPEC specifies a rate-limit-specific copy.** Current code shows `result.error` verbatim from the server action. UI-SPEC lines 350-352 specify two distinct strings: `"Ups, da ist was schiefgelaufen…"` (generic) and `"Zu viele Versuche. Bitte warte einen Moment."` (rate-limit). If the server returns the rate-limit string unchanged, it passes through fine — but this is not verified in the UI code.
   `apps/website/components/join/join-form-card.tsx:439-451`
   Fix: verify `app/actions/waitlist.ts` emits the exact VOICE.md rate-limit string, OR branch on a `result.code === 'rate_limit'` discriminator in the form and pick the correct copy on the client. Low urgency — cosmetic until Phase 25 makes the endpoint live.

---

## Detailed Findings

### Pillar 1: Typography (4/4)

**Evidence:** Every typography decision in the code traces back to a `--fs-*` or `--lh-*` token from `packages/config/tailwind/base.css`. Grep for `#` hex literals in the 5 join files returned **zero matches**. Grep for `rgba(` matched exactly the two documented text-shadow values and one server-error-banner tint.

**Observations:**
- **H1 identical to `/about` blueprint.** `fontSize: var(--fs-display)` + `leading-[1.02]` + `tracking-[-0.03em]` + Geist Mono — byte-for-byte match with `about-hero-section.tsx:46-50` (`join-hero-section.tsx:68-77`).
- **Exactly 4 canonical sizes in use:** `--fs-display` (H1), `--fs-h2` (success headline), `--fs-body` (inputs/lede/labels), `--fs-micro` equivalent `text-[11px]` (eyebrow, form labels, benefit row, secondary link, OPTIONAL badge). Error `text-sm` is the documented body-sub-role (UI-SPEC §Typography ¹). Submit button `text-[14px]` is the documented `--fs-button` exception.
- **text-shadow values byte-match `/about` + `/partner`:** `"0 0 10px rgba(var(--bg-rgb), 1), 0 0 4px rgba(var(--bg-rgb), 1)"` (small) and `"0 0 18px rgba(var(--bg-rgb), 1), 0 0 8px rgba(var(--bg-rgb), 1)"` (large). Verified via cross-file grep.

**No fixes required.**

### Pillar 2: Spacing (4/4)

**Evidence:** All spacing uses Tailwind 4-point-grid classes (`px-4`, `py-3`, `mt-6`, `gap-2`, etc.) or the 44px touch-target exception. No `[12px]` / `[17px]` / arbitrary values.

**Observations:**
- **Hero container `mx-auto max-w-4xl px-6 py-20 text-center`** matches `/about` and `/partner` heroes (line 48 of `join-hero-section.tsx` == line 25 of `about-hero-section.tsx`).
- **Form card** `rounded-2xl border border-[var(--border)]/60 bg-bg-card shadow-sm px-6 py-8 sm:px-8 sm:py-10` is 4-grid compliant throughout (24/32/40px). Matches D-20 verbatim. Success card container uses the exact same spacing — visual continuity during inline-swap.
- **Every interactive element carries `minHeight: '44px'`** — inputs, checkboxes (via wrapper `min-h-[44px]`), submit button, success CTA, secondary link (`py-3` brings it to 44px). WCAG 2.5.5 honored.

**No fixes required.**

### Pillar 3: Color (4/4)

**Evidence:** Grep for `#[0-9a-fA-F]{3,8}` across `components/join/` returned **zero matches**. One `rgba()` outside the text-shadow tokens: `background: 'rgba(220, 38, 38, 0.08)'` on the server-error banner (`join-form-card.tsx:447`) — matches `partner-contact-form.tsx:300` byte-for-byte, so this is the DS-native error-surface tint used project-wide, not a one-off.

**Observations:**
- **Accent usage is disciplined.** Counted 6 distinct accent slots in the join components: submit button bg, eyebrow dot, benefit-row dot separators, input focus border (`--border-accent`), checkbox checked fill/border, submit hover glow. Exhaustively matches UI-SPEC §Color reserved list.
- **`/datenschutz` link uses `color: 'var(--accent)'`** — 7th accent slot, not listed in the UI-SPEC reserved list. This is within the spirit (inline action marker in a compliance context) and matches the `<a>` pattern used on brand. Non-blocking.
- **Error color is exclusively `var(--status-error)`** — never accent. Correct separation.
- **Dark/light parity** inherits from base.css tokens; no theme-specific branching required in join components.

**No fixes required.**

### Pillar 4: Layout / Composition (4/4)

**Evidence:** File structure matches UI-SPEC §File Structure Contract 1:1. Page flow matches D-19 + D-22. Responsive screenshots verified.

**Observations:**
- **`JoinClient` wrapper identical pattern to `AboutClient`** — `MotionConfig nonce` → `Header` → `<main id="main-content" className="min-h-screen pt-20">` → sections → `Footer`. LEARNINGS.md CSP contract honored.
- **D-19 hero-height deviation works as intended.** Live desktop screenshot (`join-desktop-v2.png`) shows H1 + lede + benefit row fit above the fold and the form card top edge peeks in at ~90vh — Simon §10 "Formular sofort sichtbar" is satisfied. The dev-server capture at 900px viewport shows form top edge at ~820px — exactly the "angeteasert" promise.
- **No `<SectionTransition>` between hero and form** (D-19) and no transition before footer (D-20 superseded by CTA-cluster rule from AGENTS.md). Both deviations are deliberate, documented in `join-client.tsx:5-11` comments, and line up with AGENTS.md Ausnahmen-Regel.

**No fixes required.**

### Pillar 5: Copywriting (3/4)

**Evidence:** Every string in the rendered components matches UI-SPEC §Copywriting Contract verbatim. Umlaute use real ö/ä/ü (not oe/ae/ue). Du-Form consistent. No Ausrufezeichen on buttons.

**Observations:**
- **UI-SPEC line 337 `name="marketing_consent"` typo** was caught and correctly resolved in code to `name="marketing_opt_in"` (matches Zod schema + DB column). Inline comment at `join-form-card.tsx:380-387` documents the decision — good defensive practice.
- **Rate-limit copy surface gap** (see Top-3 #3): UI-SPEC defines two distinct error strings (generic vs rate-limit) but the form renders `result.error` unconditionally. If the server action emits the correct string this is cosmetic; if not, users hit a vague `"Ups…"` for a 429. Verifiable but not blocking.
- **Placeholder `deine@uni.de`** is excellent — subtly implies audience, non-German-uni users see it as a mental "also works for .ch/.at" signal, matches §10 tone.

**Fix (P3 above):** verify/branch rate-limit-specific error copy.

### Pillar 6: A11y / Interaction (3/4)

**Evidence:** 36 ARIA attributes across the 5 join files (Grep count). `useReducedMotion` imported in 4 of 5 animated files. Full keyboard-nav combobox with documented `aria-activedescendant` + `role="combobox/listbox/option"`. Touch targets enforced. Focus management explicit on success-swap.

**Observations:**
- **Combobox A11y is production-grade.** `role="combobox"`, `aria-autocomplete="list"`, `aria-expanded`, `aria-controls`, `aria-activedescendant` all present; `WR-04` comment documents why `aria-selected` tracks actual selection not keyboard focus — that's a WAI-ARIA Combobox pattern 1.2 compliance move.
- **Success card focus management correct.** `headingRef.current?.focus()` in `useEffect` + `tabIndex={-1}` — WCAG 2.4.3 honored, matches UI-SPEC §A11y Focus Management.
- **Motion-reduction honored everywhere** including the form-exit transition (`join-form-section.tsx:28-32`) and the dropdown animation (`uni-combobox.tsx:198-202`).
- **Gap 1 (P1):** `href="#"` on secondary link (`join-success-card.tsx:87`) — adds `#` to URL on click, no destination. Small but real A11y/UX bug.
- **Gap 2 (P2):** client-side error `role="alert"` regions can stack; no unified polite live-region. Low severity — error messages are still visible + announced on first display.

**Fixes (P1 + P2 above).**

---

## Blueprint Deviation Audit

Cross-check vs. AGENTS.md subpages blueprint and `/about` + `/partner` reference:

| Property | `/about` | `/partner` | `/join` | Match |
|----------|----------|------------|---------|-------|
| LabeledNodes background | yes | yes | yes | ✓ |
| Client-Wrapper + MotionConfig nonce | yes | yes | yes | ✓ |
| `<main className="min-h-screen pt-20">` | yes | yes | yes | ✓ |
| Hero `max-w-4xl px-6 py-20 text-center` | yes | yes | yes | ✓ |
| `min-h` on hero inner | `calc(100vh-5rem)` | `calc(100vh-5rem)` | `60vh` | **INTENTIONAL (D-19)** — documented in UI-SPEC line 175 + `join-client.tsx:7-9` |
| H1 `--fs-display` + `leading-[1.02]` + `tracking-[-0.03em]` + Geist Mono | yes | yes | yes | ✓ |
| Eyebrow pattern (dot + `//` + muted mono caps) | yes | yes | yes | ✓ |
| Eyebrow dot `h-1.5 w-1.5` + `boxShadow: 0 0 8px var(--accent-glow)` | yes | yes | yes | ✓ |
| `textShadowSm` / `textShadowLg` exact values | yes | yes | yes | ✓ |
| Motion `duration: 0.7, ease: 'easeOut'` + reduced-motion gate | yes | yes | yes | ✓ |
| H2 subline below H1 | yes | yes | **NO** | **INTENTIONAL (D-21)** — Simon §10 "kein scroll-heavy Marketing" |
| SectionTransition between Hero and first content section | NONE (hero→story special case) | NONE | NONE | ✓ matches AGENTS.md Hero-Ausnahme |
| SectionTransition before Footer | yes (Final-CTA→Kontakt exception) | yes | NONE | **INTENTIONAL** — D-20 superseded by AGENTS.md "Final-CTA schließt visuell selbst ab"; form-card IS the final CTA cluster |

**Verdict:** Three documented deviations, zero undocumented. Blueprint-faithful with purpose-driven conversion-focused exceptions.

---

## Files Audited

Primary (implementation):
- `apps/website/app/join/page.tsx`
- `apps/website/components/join-client.tsx`
- `apps/website/components/join/join-hero-section.tsx`
- `apps/website/components/join/join-form-section.tsx`
- `apps/website/components/join/join-form-card.tsx`
- `apps/website/components/join/join-success-card.tsx`
- `apps/website/components/join/uni-combobox.tsx`

Reference (consistency check):
- `apps/website/components/about/about-hero-section.tsx`
- `apps/website/components/about-client.tsx`
- `apps/website/components/partner/partner-hero-section.tsx`
- `apps/website/components/partner/partner-contact-form.tsx`
- `apps/website/app/about/page.tsx`
- `packages/config/tailwind/base.css`

Contracts:
- `.planning/phases/23-join-flow/23-UI-SPEC.md`
- `.planning/phases/23-join-flow/23-CONTEXT.md`
- `apps/website/AGENTS.md`
- `LEARNINGS.md`

Screenshots:
- `.planning/ui-reviews/023-20260424-102443/desktop.png` (1440×900, full-page)
- `.planning/ui-reviews/023-20260424-102443/tablet.png` (768×1024, full-page)
- `.planning/ui-reviews/023-20260424-102443/mobile.png` (375×812, full-page)
- `.planning/ui-reviews/023-20260424-102443/join-desktop-v2.png` (motion-settled)
- `.planning/ui-reviews/023-20260424-102443/about-desktop-v2.png` (motion-settled reference)

---

## Strengths (Top 3)

1. **Token discipline is exemplary.** Zero hex literals in component code; every color/size/spacing traces to base.css. This is the cleanest token adherence of any subpage so far.
2. **Combobox implementation is production-grade A11y.** Full keyboard, correct `aria-activedescendant` vs `aria-selected` separation (WR-04), race-condition handling on blur/select (WR-01), memoization correctness (WR-03). Reads like a WAI-ARIA Combobox 1.2 conformance reference.
3. **Inline code comments document every deviation** from spec/blueprint — `join-client.tsx:5-11`, `join-form-card.tsx:380-387`, `uni-combobox.tsx:36-38, 77-84, 86-88, 214-218`. Future maintainers will know why, not just what.

## Improvement Areas (Top 3)

1. Secondary link placeholder `href="#"` — needs real target or disabled semantics.
2. Client-validation live-region unified — one atomic polite region over stacked `role="alert"` inline errors.
3. Rate-limit copy — verify server emits UI-SPEC string or branch on code client-side.

---

## Recommendation

**Status: PASS (22/24).** Ship as-is for Phase 23. The three improvement areas are polish items — queue them for the Phase 27 copy-pass or a small follow-up before the Phase 25 live-go. None blocks the current release path (Waitlist V1 with 503-backed signup).

Blueprint consistency with `/about` and `/partner` is high (10 identical axes + 3 documented intentional deviations). The deviations are conversion-driven, not sloppiness — they directly implement Simon §10 and D-19/D-21.
