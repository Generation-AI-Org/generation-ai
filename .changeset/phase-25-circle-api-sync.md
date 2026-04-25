---
"@genai/website": minor
"@genai/auth": patch
"@genai/emails": patch
---

Unified Signup via Circle-SSO (Phase 25, Kern-UX-Win der v4.0-Milestone).

**Was neu ist:**

- `/join`-Signup legt Supabase-User + Circle-Community-Member atomar an
- User bekommt **eine** Mail mit Single-CTA "Loslegen →", landet nach Klick direkt in Circle eingeloggt
- Graceful-Degrade: Circle-API-Fehler blockieren Signup nicht, User landet auf Fallback-Welcome mit Manual-Link
- Admin-Reprovision-Endpoint (`POST /api/admin/circle-reprovision`) für Retry-Cases
- Waitlist-Re-Invite-Script für Phase-23-Migration
- Feature-Flag `SIGNUP_ENABLED` (default `false`) — Phase 27 flippt zum Launch

**Breaking:** Keine öffentliche API geändert. `submitJoinWaitlist` Server-Action bleibt kompatibel (Router zwischen V1-Waitlist und V2-Signup).

**Neu installed:** `@genai/circle` workspace package (Circle-API-Client, nicht extern-versioniert).

**DB-Migration:** `supabase/migrations/20260425000001_circle_profile_fields.sql` — legt `public.user_circle_links` an mit RLS service_role-only.

**Env-Vars (neu, müssen in Vercel eingespielt werden):**

- `CIRCLE_API_TOKEN`
- `CIRCLE_COMMUNITY_ID` (discovered: `511295`)
- `CIRCLE_DEFAULT_SPACE_ID` (discovered: `2574363`)
- `CIRCLE_COMMUNITY_URL`
- `SIGNUP_ENABLED` (default `false`)
- `ADMIN_EMAIL_ALLOWLIST`
- `SENTRY_DSN_WEBSITE` + `NEXT_PUBLIC_SENTRY_DSN_WEBSITE`

Siehe `docs/CIRCLE-INTEGRATION.md` + `.planning/phases/25-circle-api-sync/25-HUMAN-UAT.md` für vollständigen Launch-Runbook.
