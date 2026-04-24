---
phase: 23
plan: "04"
slug: uni-combobox-component
subsystem: website/components/join
tags: [combobox, autocomplete, a11y, universities, form]
dependency_graph:
  requires: []
  provides:
    - apps/website/lib/universities.ts (UNIVERSITIES array, University type)
    - apps/website/components/join/uni-combobox.tsx (UniCombobox component)
  affects:
    - apps/website/components/join/join-form-card.tsx (Plan 23-05 will import UniCombobox)
tech_stack:
  added: []
  patterns:
    - hand-rolled ARIA combobox pattern (WAI-ARIA 1.2 combobox authoring practice)
    - controlled input + listbox dropdown with useReducedMotion guard
    - onMouseDown over onClick to prevent blur-race condition
key_files:
  created:
    - apps/website/lib/universities.ts
    - apps/website/components/join/uni-combobox.tsx
  modified: []
decisions:
  - "University = string type alias (not interface) per plan spec"
  - "44 universities (not minimum 40) — includes DACH additions (Österreich + Schweiz) for wider coverage"
  - "3 fallback options: Andere Hochschule / Ausbildung / Berufstätig / Kein Studium (D-12)"
  - "CSS.escape() used on listboxId in querySelector to safely handle useId() values with colons"
metrics:
  duration: 79s
  completed: "2026-04-24"
  tasks_completed: 2
  files_created: 2
  files_modified: 0
---

# Phase 23 Plan 04: UniCombobox Component + Universities List Summary

Hand-rolled ARIA-compliant UniCombobox with autocomplete over 44+ German/DACH universities, keyboard navigation, and freitext fallback for non-students (D-12).

---

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Uni-Liste erstellen | 9b5cb6b | apps/website/lib/universities.ts |
| 2 | UniCombobox-Komponente bauen | 55eed4c | apps/website/components/join/uni-combobox.tsx |

---

## Files Created

### apps/website/lib/universities.ts

- 44 German/DACH universities ordered by enrollment size
- 15 largest German universities (FernUni Hagen, Uni Köln, LMU, RWTH Aachen, …)
- 10 TUs + elite research universities (KIT, TU Dresden, TU Darmstadt, …)
- 15 further important locations (Ruhr-Uni Bochum, Bremen, Hannover, …)
- 5 major Fachhochschulen / HAWs (Hochschule München, HAW Hamburg, TH Köln, …)
- 4 DACH additions (Uni Wien, TU Wien, ETH Zürich, Uni Zürich)
- 3 fallback options at end: `Andere Hochschule`, `Ausbildung / Berufstätig`, `Kein Studium`
- Exports: `UNIVERSITIES: University[]` + `type University = string`

### apps/website/components/join/uni-combobox.tsx

- 211 lines, fully typed, `'use client'` directive
- Props interface `UniComboboxProps` with id, name, value, onChange, onBlur, required, disabled, error, labelId, describedById, placeholder
- Filters top 15 from UNIVERSITIES on empty input; filters by `.includes(q)` on typed text
- No-match state shows `"Andere: {typedValue} übernehmen"` as single option (D-12 freitext fallback)
- Selecting the freitext option strips the wrapper and keeps the raw typed value

---

## ARIA Attributes Overview

| Element | Attributes |
|---------|------------|
| `<input>` | `role="combobox"` `aria-autocomplete="list"` `aria-expanded={open}` `aria-controls={listboxId}` `aria-activedescendant` `aria-required` `aria-invalid` `aria-labelledby` `aria-describedby` |
| `<motion.ul>` | `role="listbox"` `id={listboxId}` |
| `<li>` | `role="option"` `aria-selected={isActive}` `id={listboxId}-opt-{idx}` |

---

## Keyboard Navigation

| Key | Action |
|-----|--------|
| ArrowDown | Opens dropdown (if closed), moves selection down |
| ArrowUp | Moves selection up |
| Enter | Selects active option (if open + option active); else native form submit |
| Escape | Closes dropdown, clears active index |
| Tab | Closes dropdown, moves focus to next field (natural tab order) |

---

## Deviations from Plan

None — plan executed exactly as written. One minor implementation detail worth noting:

**CSS.escape() on listboxId** — `useId()` in React generates IDs with colons (e.g., `:r1:`). Using these directly in `querySelector('#:r1:-opt-0')` would fail silently because `:` has special meaning in CSS selectors. Applied `CSS.escape()` to safely handle this. This is a correctness requirement, not a deviation.

---

## Known Stubs

None — this plan creates data and a component with no UI stubs. The component is ready for embedding in Plan 23-05 `join-form-card.tsx` via:

```tsx
<UniCombobox
  id={universityId}
  name="university"
  value={form.university}
  onChange={(v) => setField('university', v)}
  onBlur={() => validateField('university')}
  required
  error={errors.university}
  labelId={universityLabelId}
  describedById={errors.university ? universityErrorId : undefined}
/>
```

---

## Threat Flags

None — no new network endpoints, no auth paths, no file access patterns. Static data file + pure client component.

---

## Self-Check: PASSED

- [x] `apps/website/lib/universities.ts` exists
- [x] `apps/website/components/join/uni-combobox.tsx` exists
- [x] Commit `9b5cb6b` exists (universities.ts)
- [x] Commit `55eed4c` exists (uni-combobox.tsx)
- [x] `pnpm --filter @genai/website exec tsc --noEmit` passed (no output = clean)
- [x] UNIVERSITIES count: 44 entries + 3 fallback = 47 total strings
- [x] UniCombobox: 211 lines (> 120 minimum)
