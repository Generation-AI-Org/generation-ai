---
phase: 25
plan: G
slug: waitlist-reinvite-script
status: complete
completed: 2026-04-24
executed_by_script: false
commits:
  - 531377e
---

# Plan 25-G SUMMARY — Waitlist re-invite script (Q10)

**autonomous:false** per plan — code written but NOT executed. Luca triggers
manually after Phase-27 flips `SIGNUP_ENABLED=true`.

## What was built

- `packages/emails/src/templates/waitlist-reinvite.tsx` — React-Email template
- `packages/emails/src/index.ts` — `WaitlistReinviteEmail` + Props re-exported
- `scripts/waitlist-reinvite.ts` — CLI runner
- `docs/CIRCLE-INTEGRATION.md` — Q10 runbook section appended

## Key files

- `packages/emails/src/templates/waitlist-reinvite.tsx`
- `scripts/waitlist-reinvite.ts`
- `docs/CIRCLE-INTEGRATION.md`

## Verification

- `pnpm --filter @genai/emails exec tsc --noEmit` clean.
- `pnpm --filter @genai/website exec tsc --noEmit` clean (only pre-existing phase-24 error).
- Script lints manually (no runtime eval — design intentional).

## Deviations

- **Template uses `@react-email/components` `Button` instead of `EmailButton`** from our shared components. Reason: `EmailButton` uses pre-rendered PNG assets keyed by slug (`confirm-signup | magic-link | recovery | email-change | invite`). Adding a new slug `waitlist-reinvite` would require generating + hosting a new PNG via `logos:generate`. Since this is a one-shot email, a pure inline-styled button is simpler and email-client-safe. Style matches brand (light-mode accent red + mono Geist label).
- **Not added a root `package.json` script**: plan suggested optional `pnpm waitlist:reinvite`. Skipped — single invocation via `pnpm tsx scripts/waitlist-reinvite.ts` is fine and doesn't clutter root scripts.

## Post-launch Luca checklist

1. `SIGNUP_ENABLED=true` in Vercel prod, redeploy.
2. Pre-check: `SELECT count(*) FROM waitlist WHERE notified_at IS NULL;`
3. `pnpm tsx scripts/waitlist-reinvite.ts --dry-run`
4. `pnpm tsx scripts/waitlist-reinvite.ts --limit 1` (test email to self)
5. `pnpm tsx scripts/waitlist-reinvite.ts` (real run)
6. Post-check: pending count should be 0

## Hand-off

- Plan I aggregates this runbook into `25-HUMAN-UAT.md` checklist.
