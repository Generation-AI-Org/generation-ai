---
phase: 27
slug: copy-pass-and-launch-cleanup
type: summary
status: in_progress
updated: 2026-04-26
---

# Phase 27 Summary — Janna/Sparring Feedback Slice

## Implemented

- `/join` form simplified to three statuses: Studierend, Early Career, Sonstiges.
- `/join` now captures first name, last name, birth year, university, study field / degree / career field / free context depending on status.
- University dropdown extended with Switzerland, Austria and Portugal entries, including Nova and Católica Lisbon variants. `Andere` still exposes a free-text fallback.
- Join hero/form layout stabilized with a fixed-height form column so H1/background do not jump when dynamic fields change.
- `/test` repositioned as lead magnet: copy now says status quo ermitteln + verbessern, result CTA is `Jetzt registrieren`, secondary CTA is `Zur Community`.
- Result radar chart received wider horizontal margins to avoid clipping the `Anwendung` axis label.
- Website header now includes `/events`; footer navigation/contact/legal links are white by default and accent only on hover; footer logo uses header-sized `md` logo.
- Welcome mail copy no longer tells users to click `Accept invitation`; KI-Tools button uses CI neon.
- About/Verein mitmach copy updated toward the positive team-building wording from the call.
- Supabase migration was applied live and verified: `early_career` exists in `waitlist_status`, `birth_year` exists on `public.waitlist`.
- Vercel website environment names were checked; Circle, Supabase, Resend, Sentry and signup flag variables are present in the expected scopes. `SIGNUP_ENABLED` was not changed.
- Tools-app hero copy received a small action-oriented pass while preserving layout and test contract.

## Validation

- `pnpm --filter @genai/website exec tsc --noEmit` — passed.
- `pnpm --filter @genai/emails exec tsc --noEmit` — passed.
- `pnpm --filter @genai/emails email:export` — passed; regenerated `apps/website/emails/dist/confirm-signup.html`.
- `E2E_BASE_URL=http://localhost:3000 pnpm --filter @genai/e2e-tools exec playwright test tests/join.spec.ts tests/test-assessment.spec.ts --project=chromium` — 23 passed, 1 skipped by design (`RUN_LIVE_JOIN_E2E=true` required for live signup write).
- `pnpm --filter @genai/website build` — passed. Existing Turbopack NFT warning in `app/sitemap.ts` trace remains non-blocking.
- `grep -RIl "CIRCLE_API_TOKEN|SUPABASE_SERVICE_ROLE_KEY|RESEND_API_KEY|CIRCLE_HEADLESS_TOKEN" apps/website/.next/static` — no matches.
- `git diff --check` — passed.

## Remaining

- Phase 25 Circle-Sync full live UAT remains open for Luca-run signup: preview signup E2E, Circle member/SSO, fallback test, runtime Sentry observation.
- Circle invitation template copy still needs dashboard-level confirmation; available Circle MCP tools do not expose invitation template editing.
- Motivation field is still an explicit product decision, not implemented.
- Marketing screenshots for email text optimization are still manual/visual follow-up.
