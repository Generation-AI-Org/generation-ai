---
phase: 25
plan: C
slug: confirm-email-template
status: complete
completed: 2026-04-24
commits:
  - ccf50dd
---

# Plan 25-C SUMMARY — Confirm-email template (Single-CTA, D-04)

## What was built

- `packages/emails/src/templates/confirm-signup.tsx` updated: preview text, body copy, CTA label changed to "Loslegen →". Added 7-day validity subtext.
- `apps/website/emails/dist/confirm-signup.html` regenerated via `pnpm --filter @genai/emails email:export`.
- `docs/CIRCLE-INTEGRATION.md` bootstrapped with Supabase-Dashboard-import runbook (Architektur-Überblick stays placeholder for Plan I).

## Key files

- `packages/emails/src/templates/confirm-signup.tsx`
- `apps/website/emails/dist/confirm-signup.html`
- `docs/CIRCLE-INTEGRATION.md`

## Verification

- `pnpm --filter @genai/emails exec tsc --noEmit` clean.
- `grep Loslegen` on HTML export → 1 match. `.ConfirmationURL` + `.Data.full_name` preserved. No `[object Object]`.
- No "Zur Community" secondary CTA (D-04 compliant). No "Bitte klicken Sie" (VOICE compliant).

## Deviations

None. Went exactly per plan.

## Hand-off

Luca has to paste `apps/website/emails/dist/confirm-signup.html` into Supabase Dashboard manually (HUMAN-UAT in Plan I). Plan D's confirm route will be the handler behind `{{ .ConfirmationURL }}`.
