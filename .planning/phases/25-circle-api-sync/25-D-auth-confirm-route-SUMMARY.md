---
phase: 25
plan: D
slug: auth-confirm-route
status: complete
completed: 2026-04-24
---

# Plan 25-D SUMMARY — /auth/confirm route + welcome fallback

## What was built

- `apps/website/app/auth/confirm/route.ts` — GET handler that handles the Supabase PKCE confirm-link and hands off to Circle SSO.
- `apps/website/app/auth/error/page.tsx` — generic 3-reason error page (invalid_or_expired / missing_params / rate_limited).
- `apps/website/app/(fallback)/welcome/page.tsx` + `welcome-client.tsx` — fallback "Du bist drin." page with optional community banner.
- `apps/website/components/welcome/community-banner.tsx` — a11y-compliant banner (role=status, aria-live=polite).
- `apps/website/lib/rate-limit.ts` — added `checkConfirmRateLimit` + `checkSignupRateLimit` + `checkAdminReprovisionRateLimit` (same fail-open pattern as existing `checkWaitlistRateLimit`).

## Key files

- `apps/website/app/auth/confirm/route.ts`
- `apps/website/app/auth/error/page.tsx`
- `apps/website/app/(fallback)/welcome/page.tsx`
- `apps/website/app/(fallback)/welcome/welcome-client.tsx`
- `apps/website/components/welcome/community-banner.tsx`
- `apps/website/lib/rate-limit.ts` (extended)

## Verification

- `pnpm --filter @genai/website exec tsc --noEmit` clean for new files. Pre-existing phase-24 test error unchanged.
- Open-redirect guard confirmed via grep — no `NextResponse.redirect(next` patterns.
- A11y: banner has role + aria-live, h1 is focus target (Phase 24 pattern).

## Deviations

- Added `/auth/error/page.tsx` on top of plan D's scope (plan references it but didn't scope it). Without it, error-redirect would 404. Minimal impl, Phase-27-polish-target marked in comment.
- Added three rate-limiters (confirm/signup/admin) in this plan rather than splitting across plans — prevents copy-paste drift when Plans E+F need their limiters.
- Installed `@sentry/nextjs@^10` as website dep. Plan H will configure `sentry.*.config.ts`. Import works now, no-op at runtime until DSN is set.

## Hand-off

Plan E's server action will set `raw_user_meta_data.circle_member_id` — that's the key this route reads. Plan H will provide Sentry configs so `captureException` actually ships.
