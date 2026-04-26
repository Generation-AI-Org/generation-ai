---
phase: 27
slug: copy-pass-and-launch-cleanup
type: launch-checklist
status: in_progress
updated: 2026-04-26
---

# Phase 27 Launch Checklist

## Ready Locally

- [x] Non-Circle UATs from previous phases owner-accepted by Luca.
- [x] Header includes Events on website.
- [x] Footer link colors follow white-default/accent-hover rule.
- [x] Join form matches three-status model.
- [x] Birth year is captured and persisted in waitlist payloads.
- [x] International universities added with `Andere` fallback.
- [x] `/test` can work as direct lead magnet and routes users to `/join`.
- [x] Welcome mail copy/button updated and HTML regenerated.
- [x] Supabase migration for `early_career` enum + `birth_year` applied live and verified.
- [x] Vercel website env presence checked for Circle, Sentry, Supabase, Resend and signup flags.
- [x] Client/static bundle secret grep passed for Circle/Supabase/Resend token names.
- [x] Sentry website wiring exists for server/client/edge with PII disabled and secret-denylist on server.
- [x] Tools page hero copy tightened without changing app structure.
- [x] Website typecheck, email typecheck, focused Playwright and build pass locally.

## Needs Luca / External Setup

- [x] Apply Supabase migration for `early_career` enum + `birth_year`.
- [x] Circle token and Vercel env set in preview/prod.
- [ ] Circle invitation email template copy checked in Circle Dashboard (`[accept invitation]` removed). No Circle MCP tool exposes template editing.
- [x] Resend/Welcome mail repo template updated for current two-mail flow.
- [ ] Preview signup E2E with real test user.
- [ ] Circle member created, Welcome/default space visible, SSO/fallback verified.
- [x] Sentry DSN env vars present in Vercel; production event capture still needs Preview/Prod runtime smoke.
- [x] Bundle secret grep before launch.
- [ ] `SIGNUP_ENABLED=true` only after Luca approval.

## Product/Open Copy

- [ ] Decide whether motivation field belongs in join flow.
- [ ] Tools page content pass from Luca/Janna.
- [ ] Email screenshots to marketing team for final wording.
