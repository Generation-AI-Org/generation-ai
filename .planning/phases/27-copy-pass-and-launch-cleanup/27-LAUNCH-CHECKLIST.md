---
phase: 27
slug: copy-pass-and-launch-cleanup
type: launch-checklist
status: done
updated: 2026-04-26
---

# Phase 27 Launch Checklist

## Ready Locally

- [x] Non-Circle UATs from previous phases owner-accepted by Luca.
- [x] Header includes Events on website.
- [x] Footer link colors follow white-default/accent-hover rule.
- [x] Join form matches three-status model.
- [x] Birth year is captured and persisted in waitlist payloads.
- [x] Birth year uses native mobile-friendly select, range 2010-1950.
- [x] International universities added with `Andere` fallback.
- [x] Join H1 is decoupled from dynamic form height.
- [x] `/test` can work as direct lead magnet and routes users to `/join`.
- [x] Welcome mail copy/button updated and HTML regenerated.
- [x] Supabase migration for `early_career` enum + `birth_year` applied live and verified.
- [x] Vercel website env presence checked for Circle, Sentry, Supabase, Resend and signup flags.
- [x] Client/static bundle secret grep passed for Circle/Supabase/Resend token names.
- [x] Sentry website wiring exists for server/client/edge with PII disabled and secret-denylist on server.
- [x] Tools page hero copy tightened without changing app structure.
- [x] UI/UX Pro Max read-only monorepo audit completed.
- [x] Website typecheck, email typecheck, focused Playwright and build pass locally.

## Launch Gates Outside Phase 27

- [x] Apply Supabase migration for `early_career` enum + `birth_year`.
- [ ] Circle Admin token, Circle Headless token, and Vercel env scopes rechecked in preview/prod after pre-launch audit.
- [ ] Circle invitation email template copy checked in Circle Dashboard (`[accept invitation]` removed). No Circle MCP tool exposes template editing.
- [x] Resend/Welcome mail repo template updated for current two-mail flow.
- [ ] Preview signup E2E with real test user against the current two-mail flow.
- [ ] Circle member created, Welcome/default space visible, Circle invitation activation verified.
- [ ] Circle failure path verified: no false "Circle-Mail kommt gleich" copy; admin reprovision path documented.
- [x] Sentry DSN env vars present in Vercel; production event capture still needs Preview/Prod runtime smoke.
- [x] Bundle secret grep before launch.
- [ ] `SIGNUP_ENABLED=true` only after Luca approval.

## Product/Open Copy

- [x] Motivation field deferred from launch join flow.
- [ ] Tools page content/UI pass from Luca/Janna — next phase.
- [ ] Email screenshots to marketing team for final wording.
