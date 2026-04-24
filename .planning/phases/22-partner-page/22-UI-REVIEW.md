---
phase: 22
slug: partner-page
type: ui-review
audited: 2026-04-24
baseline: UI-SPEC.md (approved contract)
screenshots: not captured (no dev server detected)
overall: 22/24
---

# Phase 22 — UI Review

**Audited:** 2026-04-24
**Baseline:** 22-UI-SPEC.md (approved 6/6 PASS)
**Screenshots:** not captured (no dev server on ports 3000, 5173, 8080 — code-only audit)

---

## Pillar Scores

| Pillar | Score | Key Finding |
|--------|-------|-------------|
| 1. Copywriting | 3/4 | All contract strings present; 3 per-tab CTA labels not in spec copywriting table |
| 2. Visuals | 4/4 | Section order, hero pattern, card layouts all match spec exactly |
| 3. Color | 3/4 | Active tab label rendered in `--accent` instead of spec-declared `text-text` |
| 4. Typography | 4/4 | Only `font-bold` used; DS tokens for all size roles; `text-[13px]` is the sole undeclared size but benign |
| 5. Spacing | 4/4 | Scale-compliant; `mt-20` (80px) is the only outside-scale value, used once between form and person cards |
| 6. Experience Design | 4/4 | Full 4-state form machine, honeypot, ARIA tabs, keyboard nav, reduced-motion gate, role=alert |

**Overall: 22/24**

---

## Top 3 Priority Fixes

1. **Active tab label color is `--accent` instead of `text-text`** — on light-mode the accent is `#F5133B` (red), making active tab labels red rather than primary text. Fix: remove `color: 'var(--accent)'` from the `style` prop in `partner-tab-system.tsx` line 113; the `text-text` class in the className string (line 108) is correct and will take over.

2. **Tab panel focus not moved to panel on tab click** — the spec's accessibility contract (§ Accessibility Contract) requires `tabPanel.focus()` after content swap so keyboard users land in the new content. Currently `setActiveTyp` only calls `setActiveTypRaw` + `pushState`; no programmatic focus on the revealed panel. Fix: add a `useEffect` keyed on `activeTyp` that queries `document.getElementById(`${activeTyp}-panel`)` and calls `.focus()`.

3. **Per-tab CTA labels not declared in copywriting contract** — "Jetzt Anfrage stellen" (Unternehmen), "Kooperation anfragen" (Stiftungen + Hochschulen), "Kontakt aufnehmen" (Initiativen) are live on page but absent from the spec's copywriting table. This is a tracking gap, not necessarily wrong copy — but Marketing Pass (Phase 27) has no locked baseline to compare against. Fix: add all 4 CTA labels to the copywriting table in UI-SPEC.md for Phase 27 reference.

---

## Detailed Findings

### Pillar 1: Copywriting (3/4)

**Passing:**
- H1 exact: "Lass uns zusammen was bewegen." — `partner-hero-section.tsx:52`
- Hero subline exact: "Vier Partnertypen. Vier Rollen. Ein Formular." — `partner-hero-section.tsx:64`
- Hero lede exact matches spec — `partner-hero-section.tsx:70-73`
- Eyebrow: "// für partner" — `partner-hero-section.tsx:40`
- All 4 tab labels (Unternehmen / Stiftungen / Hochschulen / Initiativen) match — `partner-tab-system.tsx:7-12`
- All 4 tab content H2s match spec exactly — `partner-tab-content.tsx:19,28,39,50`
- Form section heading: "Jetzt Kontakt aufnehmen" — `partner-client.tsx:75`
- Form eyebrow: "// kooperation anfragen" — `partner-client.tsx:65`
- Primary CTA: "Anfrage senden" / "Wird gesendet…" — `partner-contact-form.tsx:328`
- Success heading: "Anfrage eingegangen." — `partner-contact-form.tsx:105`
- Success body: exact match — `partner-contact-form.tsx:107-109`
- Server error message: exact match including `admin@generation-ai.org` — `partner-contact-form.tsx:87-89`; `partner-inquiry.ts:88-90`
- Field error messages: "Dieses Feld ist erforderlich." and "Bitte gib eine gültige E-Mail-Adresse ein." — `partner-contact-form.tsx:42-47`
- Person cards heading: "Eure Ansprechpersonen" — `partner-person-card.tsx:132`
- Person cards eyebrow: "// direkter draht" — `partner-person-card.tsx:124`
- Transparenz-Hinweis: exact match — `partner-verein-hint.tsx:17-25`
- Nav label: "Für Partner" with 4 `?typ=` sub-items — `header.tsx:33-40`

**Gap:**
- The spec copywriting table (§ Copywriting Contract) does not declare the per-tab content CTA labels. The implementation uses 4 distinct labels: "Jetzt Anfrage stellen" (Unternehmen), "Kooperation anfragen" (Stiftungen + Hochschulen), "Kontakt aufnehmen" (Initiativen) — `partner-tab-content.tsx:24,37,49,59`. These are reasonable labels but untracked. Score impact: minor (Phase 27 Marketing Pass needs anchors).

---

### Pillar 2: Visuals (4/4)

**Hero:** LabeledNodes canvas background, `min-h-[calc(100vh-5rem)]`, `max-w-4xl`, `--fs-display` token, text shadows `sm` and `lg`, no scroll indicator — all per spec and AGENTS.md hero pattern. Eyebrow dot present with `background: var(--accent)` + glow — `partner-hero-section.tsx:34-38`.

**Section order:** matches spec exactly — Hero → TabSystem (no transition) → soft-fade → Trust → soft-fade → Contact + PersonCards → signal-echo → VereinHint — `partner-client.tsx:102-110`.

**Tab rail:** border-b separator, `overflow-x-auto scrollbar-hide flex flex-nowrap`, `max-w-4xl px-6` container, `min-h-[44px]` touch targets — all per spec.

**Contact form card:** `rounded-2xl border border-border bg-bg-card px-6 py-8 sm:p-10` — exact spec shape.

**Person cards:** `grid grid-cols-1 sm:grid-cols-3 gap-4`, `rounded-2xl border border-border bg-bg-card p-6 text-center`, PlaceholderAvatar size="md" — matches spec exactly.

**VereinHint:** minimal centered paragraph with underlined link — appropriate visual weight.

**No border-b on section elements** (AGENTS.md prohibition respected). All transitions via `<SectionTransition>`.

---

### Pillar 3: Color (3/4)

**Passing:**
- No hardcoded hex anywhere in component files. `rgba(220, 38, 38, 0.08)` at `partner-contact-form.tsx:295` is the error banner background — this is the destructive color (#DC2626) with opacity, defined as `--color-destructive` in globals, acceptable per spec exception.
- `rgba(var(--bg-rgb), 1)` text shadow values use CSS variable composition — not hardcoded.
- Accent used on: eyebrow dots (hero + contact + person cards), active tab border, tab content CTA button fill, form submit button fill, link hover states — all 7 reserved usages from spec are represented.
- `--border-accent` on input focus — `partner-contact-form.tsx:138,170,202,235,271`.
- `--status-error` via CSS variable for error text — correct, not hardcoded.
- No accent on card backgrounds, body text, or muted elements.

**Defect:**
- **Active tab label color:** `partner-tab-system.tsx:113` applies `style={{ color: 'var(--accent)' }}` when tab is active. The spec (§ Tab Visual States, line 155) specifies active tab as `text-text` only, with `--accent` reserved for the 2px bottom border only. The `text-text` Tailwind class on line 108 is correct and would apply, but the inline style overrides it (inline style beats className). In light mode this makes the active label red (#F5133B) instead of dark text — a visible contrast and semantic deviation. This is reserved-usage violation #3 (accent on active tab label text instead of border-only).

---

### Pillar 4: Typography (4/4)

**Weights:** Only `font-bold` (700) appears across all partner files. No `font-medium`, `font-semibold`, `font-normal`, or `font-light`. DS constraint (400 + 700 only) is met, and since no body-weight text uses the class explicitly it relies on the base stylesheet — consistent with the DS pattern.

**Size tokens:** H1 uses `var(--fs-display)`, H2s use `var(--fs-h2)`, body text uses `var(--fs-body)` — all DS tokens, no inline clamp() inventions.

**Pixel sizes in use:**
- `text-[11px]` — Micro/eyebrow role, per spec (§ Micro token)
- `text-[14px]` — Button/tab labels, collapsed into body scale per spec ("collapses --fs-button 14px")
- `text-[13px]` — Format badge pills, `partner-tab-content.tsx:124`. This size is not explicitly declared in the 4-role table. It sits between Body (16px) and Micro (11px) with no DS token. Minor: the spec does not prohibit it for decorative badge text, but it is undocumented.
- `text-sm` — Tailwind `text-sm` = 14px, used for error messages — spec specifies `text-sm` for error text explicitly (§ Validation section), correct.
- `text-lg sm:text-xl` — Lede in hero, spec explicitly declares `text-lg sm:text-xl leading-[1.5]` for lede — correct.

**Tracking:** H1 `tracking-[-0.03em]`, H2 `letter-spacing: -0.015em`, eyebrow `tracking-[0.2em]`, button `tracking-[0.02em]` — all match DS canonical values.

---

### Pillar 5: Spacing (4/4)

**Scale-compliant values used:**
- `px-6` (24px, lg), `py-3` (12px), `px-4` (16px, md), `py-2` (8px, sm), `gap-2` (8px), `gap-4` (16px), `gap-3` (12px), `mt-4`, `mt-6`, `mt-8`, `mt-10`, `mb-2`, `mb-3`, `mb-4`, `mb-5`, `mb-8`
- Section padding: `py-24 sm:py-32` on ContactSection — correct convention
- Tab content container: `max-w-4xl px-6` — matches spec
- Form card: `px-6 py-8 sm:p-10` — matches spec exactly

**Outside-scale value:**
- `mt-20` (80px) separates the form from the person cards grid — `partner-client.tsx:82`. The declared scale's ceiling is `3xl=64px` (`--space-16`). 80px falls outside. However, this is a deliberate visual breathing gap between two co-located sub-sections within ContactSection. Not a regression — it reads clearly — but worth noting for DS consistency if the spacing scale is extended.

**No arbitrary `[Npx]` or `[Nrem]` spacing values** found.

---

### Pillar 6: Experience Design (4/4)

**Form state machine:** All 4 states covered — idle (form visible, button enabled), submitting (all inputs `disabled`, button "Wird gesendet…" + `opacity-60`), success (full form replacement with `role="alert"`), error (inline banner with `borderColor: var(--status-error)`, `role="alert"`, form remains editable) — `partner-contact-form.tsx:93-330`.

**Honeypot:** `name="website"`, `tabIndex={-1}`, `aria-hidden="true"`, `className="sr-only"` — matches spec exactly; server-side check returns silent `{ success: false }` — `partner-inquiry.ts:20-24`.

**ARIA tabs:** `role="tablist"` with `aria-label="Partnertypen"`, each tab `role="tab"` + `aria-selected` + `aria-controls`, panels `role="tabpanel"` + `id` + `aria-labelledby` + `tabIndex={0}` + `hidden` attribute (not CSS class) — fully compliant — `partner-tab-system.tsx:87-127`, `partner-tab-content.tsx:79-86`.

**Keyboard navigation:** Arrow Left/Right/Home/End between tabs, focus moved to next tab button — `partner-tab-system.tsx:51-75`.

**Missing:** Tab switch does not call `.focus()` on the revealed tabpanel. The spec's accessibility contract (§ Accessibility Contract) states: "on tab switch, focus moves to the newly revealed tabpanel." Currently only the tab button is focused on keyboard navigation; click-triggered switches move no focus. This affects keyboard users who click a tab and expect to tab into the content. It is the sole a11y gap.

**Contact links a11y:** `aria-label="E-Mail an {name}"` and `aria-label="LinkedIn-Profil von {name}"` on person card links — correct for icon-ambiguous or text-only links — `partner-person-card.tsx:58,65`.

**reduced-motion:** `useReducedMotion()` gate present in all animated components (hero, tab content, contact section, person cards) — collapses to `{}` as specified.

**Server error graceful degradation:** confirmation email failure is non-blocking (inner try/catch) — `partner-inquiry.ts:66-82`. Admin notification failure returns a user-facing error string — correct.

**Empty/invalid state:** invalid `?typ=` param silently falls back to `unternehmen` in both `partner-client.tsx:93-96` and `partner-tab-system.tsx:22-25`.

**Data section attributes:** `data-section="partner-hero"`, `data-section="partner-tab-system"`, `data-section="partner-kontakt"`, `data-section="partner-verein-hint"` — present and Playwright-ready.

---

## Registry Safety

No new shadcn or third-party registry blocks installed in Phase 22. Existing `@aceternity` registry (`LabeledNodes`, `SectionTransition`) is already in codebase and was vetted prior to this phase. No suspicious patterns checked — components were not fetched fresh, they are local project files. No registry flags.

Registry audit: 0 third-party blocks installed in this phase, no flags.

---

## Files Audited

- `apps/website/app/partner/page.tsx`
- `apps/website/components/partner-client.tsx`
- `apps/website/components/partner/partner-hero-section.tsx`
- `apps/website/components/partner/partner-tab-system.tsx`
- `apps/website/components/partner/partner-tab-content.tsx`
- `apps/website/components/partner/partner-contact-form.tsx`
- `apps/website/components/partner/partner-person-card.tsx`
- `apps/website/components/partner/partner-verein-hint.tsx`
- `apps/website/app/actions/partner-inquiry.ts`
- `apps/website/components/layout/header.tsx` (nav section)
- `packages/e2e-tools/tests/partner.spec.ts`
- `.planning/phases/22-partner-page/22-UI-SPEC.md` (baseline)
- `.planning/phases/22-partner-page/22-CONTEXT.md`
- `.planning/phases/22-partner-page/22-01-SUMMARY.md` through `22-08-SUMMARY.md`
