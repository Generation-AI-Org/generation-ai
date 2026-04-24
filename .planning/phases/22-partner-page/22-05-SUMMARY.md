---
phase: 22-partner-page
plan: 22-05
subsystem: ui
tags: [react, form, server-action, honeypot, validation, partner-page]

requires:
  - phase: 22-02
    provides: submitPartnerInquiry Server Action
  - phase: 22-04
    provides: PartnerTyp type
provides:
  - PartnerContactForm component with full form lifecycle management
affects: [22-07]

tech-stack:
  added: []
  patterns: [Controlled dropdown pre-seeded from tab context, useId for form field IDs]

key-files:
  created:
    - apps/website/components/partner/partner-contact-form.tsx

key-decisions:
  - "Honeypot: name=website, tabIndex=-1, aria-hidden=true, className=sr-only"
  - "Success state replaces entire form (not inline) per UI-SPEC"
  - "All inputs disabled during submitting state"
  - "SLUG_TO_TYP mapping bridges tab slug (unternehmen) → dropdown value (Unternehmen)"

patterns-established:
  - "Form state machine: idle → submitting → success/error"
  - "useId() for accessible form field label associations"

requirements-completed: [R3.6]

duration: 10min
completed: 2026-04-24
---

# Plan 22-05: PartnerContactForm Summary

**Contact form with Server Action integration, SLUG_TO_TYP dropdown pre-selection from active tab, honeypot bot-guard, client validation, submitting/success/error states**

## Performance

- **Duration:** 10 min
- **Completed:** 2026-04-24
- **Tasks:** 1
- **Files modified:** 1

## Accomplishments
- Controlled form with Name, E-Mail, Organisation, dropdown (Typ), Nachricht (optional), honeypot
- Dropdown pre-selected from `initialTyp` via `SLUG_TO_TYP` mapping
- 4 states: idle → submitting (inputs disabled, "Wird gesendet…") → success (full replacement) / error (inline banner)
- Client-side onBlur validation + full validate-before-submit check
- `role="alert"` on error banner and success card
- `aria-describedby` + `aria-invalid` binding field errors to inputs

## Task Commits
1. **Task 1** - `829b21b` (feat)

## Decisions Made
- `useId()` for form field IDs avoids hydration mismatches
- Success state fully replaces form container (not stacked) per UI-SPEC

## Deviations from Plan
None.

## Issues Encountered
None.

## Next Phase Readiness
- Component accepts `initialTyp?: PartnerTyp` — ready for partner-client.tsx (Plan 22-07)

---
*Phase: 22-partner-page*
*Completed: 2026-04-24*
