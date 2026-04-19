---
phase: 17-auth-extensions
plan: "04"
subsystem: emails
tags: [react-email, email-templates, supabase, auth, german-copy, otp]
dependency_graph:
  requires: ["@genai/emails package (17-01)", "brand/VOICE.md", "packages/emails/src/templates/confirm-signup.tsx (pattern reference)"]
  provides: ["email-change template", "reauth template", "invite template"]
  affects: [packages/emails/src/templates]
tech_stack:
  added: []
  patterns: ["React Email component with Layout wrapper", "Supabase Go-template variable defaults", "VOICE.md verbatim copy", "Static light-theme OTP code block for maximum mail-client compatibility"]
key_files:
  created:
    - packages/emails/src/templates/email-change.tsx
    - packages/emails/src/templates/reauth.tsx
    - packages/emails/src/templates/invite.tsx
  modified: []
decisions:
  - "reauth.tsx uses static light-theme colors (#EFEFEF bg, #141414 text) for OTP code block — dark-mode CSS media query cannot reliably target the OTP block across all mail clients, so static high-contrast values ensure 6-digit code is always readable"
  - "No EmailButton in reauth.tsx — OTP flow requires user to copy the code, not click a link; removes any accidental phishing vector"
  - "inviterName defaults to '{{ .Data.inviter_name }}' — Supabase injects the inviter's display name at send time; fallback is the raw Go-template variable (shown only in React Email preview server, not in production)"
metrics:
  duration_minutes: 7
  completed_date: "2026-04-19"
  tasks_completed: 2
  tasks_total: 2
  files_created: 3
  files_modified: 0
---

# Phase 17 Plan 04: Templates Group B Summary

**One-liner:** Three Supabase auth email templates (email-change, reauth OTP, invite) as React Email components using Layout/EmailButton/tokens with verbatim VOICE.md German copy and real Umlauts.

---

## Tasks Completed

| Task | Name | Commit | Key Files |
|------|------|--------|-----------|
| 1 | Build email-change.tsx + invite.tsx | 4ed1a9b | templates/email-change.tsx, templates/invite.tsx |
| 2 | Build reauth.tsx (OTP template without button) | 469d401 | templates/reauth.tsx |

---

## What Was Built

### `packages/emails/src/templates/email-change.tsx`

Default-exports `EmailChangeEmail({ confirmationUrl, newEmail })`:
- `confirmationUrl` defaults to `'{{ .ConfirmationURL }}'`, `newEmail` to `'{{ .Email }}'`
- Preview: "Klick, um die Änderung zu bestätigen."
- Heading: "Neue Mail-Adresse bestätigen"
- Body: "Du willst deine Mail-Adresse zu {newEmail} ändern. Bestätige die Änderung mit einem Klick:"
- CTA: "Änderung bestätigen" linking to `confirmationUrl`
- Muted footer: "Falls du das nicht warst, ignorier die Mail. Deine aktuelle Mail-Adresse bleibt."

### `packages/emails/src/templates/invite.tsx`

Default-exports `InviteEmail({ confirmationUrl, inviterName })`:
- `confirmationUrl` defaults to `'{{ .ConfirmationURL }}'`, `inviterName` to `'{{ .Data.inviter_name }}'`
- Preview: "Leg deinen Account an und leg los."
- Heading: "{inviterName} hat dich eingeladen"
- Body: "Willkommen bei Generation AI — der KI-Community für Studierende im DACH-Raum. Leg deinen Account an, dann geht's los."
- CTA: "Account anlegen" linking to `confirmationUrl`
- Muted footer: "Kein Interesse? Ignorier die Mail einfach."

### `packages/emails/src/templates/reauth.tsx`

Default-exports `ReauthEmail({ token })`:
- `token` defaults to `'{{ .Token }}'`
- Preview: "Aus Sicherheitsgründen — dein Code kommt hier."
- Heading: "Kurz bestätigen, dass du's bist"
- Body: "Gib diesen Code in Generation AI ein, um fortzufahren:"
- No CTA button — renders token in `Geist Mono` at 32px, `letterSpacing: '0.2em'`, `#EFEFEF` background
- Muted footer: "Der Code gilt 10 Minuten. Falls du das nicht angefordert hast, ignorier die Mail."

All three templates import `{ Layout, tokens }` from `'../index'`; email-change and invite additionally import `{ EmailButton }`. Dark-mode adaptation is handled by Layout's CSS media query. OTP code block uses static light-theme values for maximum contrast in all mail clients.

---

## Deviations from Plan

None — plan executed exactly as written.

---

## Known Stubs

None. All Supabase Go-template variables (`{{ .ConfirmationURL }}`, `{{ .Email }}`, `{{ .Token }}`, `{{ .Data.inviter_name }}`) are embedded as default prop values — Dashboard import will work out-of-the-box.

---

## Success Criteria Verification

- [x] email-change.tsx, invite.tsx, reauth.tsx exist and compile (`pnpm -F @genai/emails exec tsc --noEmit` passes)
- [x] reauth.tsx uses `{{ .Token }}` in a monospace code block (no EmailButton)
- [x] email-change uses `{{ .ConfirmationURL }}` + `{{ .Email }}`, CTA "Änderung bestätigen"
- [x] invite uses `{{ .ConfirmationURL }}` + `{{ .Data.inviter_name }}`, CTA "Account anlegen"
- [x] All copy uses real Umlauts (ä/ö/ü/ß — no ae/oe/ue/ss)
- [x] All 6 templates now exist in packages/emails/src/templates/

---

## Self-Check: PASSED

Files exist:
- packages/emails/src/templates/email-change.tsx — FOUND
- packages/emails/src/templates/invite.tsx — FOUND
- packages/emails/src/templates/reauth.tsx — FOUND

Commits exist:
- 4ed1a9b (Task 1) — FOUND
- 469d401 (Task 2) — FOUND
