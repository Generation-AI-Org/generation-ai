---
phase: 25
plan: E
slug: signup-server-action
status: complete
completed: 2026-04-24
commits:
  - 3c2f83f
---

# Plan 25-E SUMMARY — Unified signup server action

## What was built

- `apps/website/app/actions/signup.ts` (new) — `submitJoinSignup` orchestrator
- `apps/website/app/actions/waitlist.ts` — refactored to feature-flag router
- `apps/website/app/api/auth/signup/route.ts` — 503-block replaced with delegate

## Flow (per D-01/D-03/D-06/D-07/Q11)

1. Honeypot check (silent reject)
2. Rate-limit via `checkSignupRateLimit` (5/15min per IP)
3. Zod validation (email, name, university + optional study_program, status, motivation, level, redirect_after)
4. `admin.createUser({ email, email_confirm:false, password:random32, user_metadata: {...flow-data, has_password:false} })`
5. `createMember({ email, name })` from `@genai/circle` — wrapped in try/catch, sub-try for `addMemberToSpace(CIRCLE_DEFAULT_SPACE_ID)`
6. On Circle success: upsert `user_circle_links` + `updateUserById` with `circle_member_id` + `circle_provisioned_at`
7. On Circle failure: `updateUserById` stamps `circle_provision_error` + `circle_provision_failed_at` in metadata (Plan F reads these)
8. `admin.generateLink({ type:'magiclink', email, options:{redirectTo:'/auth/confirm'} })` — fallback to `type:'signup'` if magiclink is refused

## Key files

- `apps/website/app/actions/signup.ts`
- `apps/website/app/actions/waitlist.ts`
- `apps/website/app/api/auth/signup/route.ts`

## Deviations

- **Supabase generateLink choice:** Plan specified `admin.generateLink({type:'signup'})` or `inviteUserByEmail`. Reading `@supabase/auth-js@2.103.0` types: `generateLink(signup)` requires a password, and `inviteUserByEmail` explicitly disables PKCE (docs). Chose: `createUser({email_confirm:false, password:random})` then `generateLink({type:'magiclink'})` with `signup`-type fallback. Both paths redirect to `/auth/confirm` which does the verifyOtp handshake.
- **Random placeholder password:** User never sees it — they set a real password later via Phase-19 set-password flow (triggered by `has_password:false` in metadata).
- **fieldErrors type:** Added `redirect_after` key to `SignupFieldErrors` since the Zod refine can produce that path — otherwise TypeScript narrowing errored.

## Open risks / follow-ups

- **`generateLink` path**: The magiclink-first/signup-fallback pattern is the defensible choice given Supabase docs ambiguity. Plan H E2E will validate live that one of the two paths actually sends the confirm email.
- **`circle_member_id` typing in user_metadata**: Supabase `admin.updateUserById` replaces `user_metadata` entirely (no merge). I spread `baseMetadata` before overlaying Circle keys — matches Phase-17/19 pattern.

## Hand-off

- Plan F (admin-reprovision) reads `circle_provision_error` or missing `circle_member_id` from user metadata + can `upsert` into `user_circle_links` on success.
- Plan G (waitlist re-invite script) iterates over legacy `waitlist` rows and calls `submitJoinSignup`-equivalent logic (or the same action via a thin wrapper).
- Plan H (tests) can POST to `/api/auth/signup` with `SIGNUP_ENABLED=true` in preview env.
