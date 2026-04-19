---
phase: 17-auth-extensions
plan: "03"
subsystem: emails
tags: [react-email, email-templates, supabase, auth, german-copy]
dependency_graph:
  requires: ["@genai/emails package (17-01)", "brand/VOICE.md"]
  provides: ["confirm-signup template", "recovery template", "magic-link template"]
  affects: [packages/emails/src/templates]
tech_stack:
  added: []
  patterns: ["React Email component with Layout wrapper", "Supabase Go-template variable defaults", "VOICE.md verbatim copy"]
key_files:
  created:
    - packages/emails/src/templates/confirm-signup.tsx
    - packages/emails/src/templates/recovery.tsx
    - packages/emails/src/templates/magic-link.tsx
  modified: []
decisions:
  - "Templates import from '../index' (re-export barrel) rather than deep-importing components directly — consistent with package public API"
  - "Heading text uses {name} interpolation so React renders Supabase {{ .Data.name }} Go-template var at HTML-render time"
  - "No duplicate footer/closing in templates — Layout already renders brand signature per VOICE.md Utility-Signatur tone"
metrics:
  duration_minutes: 8
  completed_date: "2026-04-19"
  tasks_completed: 2
  tasks_total: 2
  files_created: 3
  files_modified: 0
---

# Phase 17 Plan 03: Templates Group A Summary

**One-liner:** Three Supabase auth email templates (confirm-signup, recovery, magic-link) as React Email components with brand-consistent Layout/EmailButton and VOICE.md copy verbatim.

---

## Tasks Completed

| Task | Name | Commit | Key Files |
|------|------|--------|-----------|
| 1 | Build confirm-signup.tsx + recovery.tsx | 61c9a5a | templates/confirm-signup.tsx, templates/recovery.tsx |
| 2 | Build magic-link.tsx | 387730d | templates/magic-link.tsx |

---

## What Was Built

### `packages/emails/src/templates/confirm-signup.tsx`

Default-exports `ConfirmSignupEmail({ name, confirmationUrl })`:
- `name` defaults to `'{{ .Data.name }}'`, `confirmationUrl` to `'{{ .ConfirmationURL }}'`
- Preview: "Schön dass du da bist. Hier geht's weiter."
- Heading: `Hey {name} 👋` (only emoji in welcome mail per VOICE.md policy)
- Body: "Willkommen bei Generation AI — der KI-Community für Studierende im DACH-Raum. Bestätige kurz deine Mail-Adresse, dann geht's los."
- CTA: "E-Mail bestätigen" linking to `confirmationUrl`
- Muted footer: "Falls du dich nicht angemeldet hast, ignorier die Mail einfach."

### `packages/emails/src/templates/recovery.tsx`

Default-exports `RecoveryEmail({ name, confirmationUrl })`:
- Preview: "Setz dein Passwort in 60 Minuten zurück."
- Heading: `Hey {name},`
- Body: "klick auf den Button, um ein neues Passwort zu setzen. Der Link gilt 60 Minuten."
- CTA: "Passwort zurücksetzen" linking to `confirmationUrl`
- Muted footer: "Falls du das nicht warst, ignorier die Mail. Dein Passwort bleibt unverändert."

### `packages/emails/src/templates/magic-link.tsx`

Default-exports `MagicLinkEmail({ name, confirmationUrl })`:
- Preview: "Dein Login-Link, gültig 15 Minuten."
- Heading: `Hey {name},`
- Body: "hier ist dein Login-Link. Klick drauf und du bist drin. Der Link gilt 15 Minuten."
- CTA: "Anmelden" linking to `confirmationUrl`
- Muted footer: "Falls du den Link nicht angefordert hast, ignorier die Mail."

All three templates import `{ EmailButton, Layout, tokens }` from `'../index'` and `@react-email/components` primitives (`Heading`, `Text`, `Section`). Dark-mode adaptation is handled by Layout's CSS media query — no per-template override needed.

---

## Deviations from Plan

None — plan executed exactly as written.

---

## Known Stubs

None. All Supabase Go-template variables (`{{ .ConfirmationURL }}`, `{{ .Data.name }}`) are embedded as default prop values — Dashboard import will work out-of-the-box.

---

## Success Criteria Verification

- [x] 3 template files exist under `packages/emails/src/templates/`
- [x] Each file default-exports a component
- [x] Each uses `Layout + EmailButton + tokens` from `@genai/emails`
- [x] All copy matches VOICE.md with real Umlauts (ä/ö/ü/ß — no ae/oe/ue/ss)
- [x] `pnpm -F @genai/emails exec tsc --noEmit` passes

---

## Self-Check: PASSED

Files exist:
- packages/emails/src/templates/confirm-signup.tsx — FOUND
- packages/emails/src/templates/recovery.tsx — FOUND
- packages/emails/src/templates/magic-link.tsx — FOUND

Commits exist:
- 61c9a5a (Task 1) — FOUND
- 387730d (Task 2) — FOUND
