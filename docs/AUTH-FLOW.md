# Auth Flow — Generation AI

> Canonical reference for auth-flow audit results, consolidation status, and CSP documentation.
> Created by Phase 13 (Auth-Flow-Audit + CSP Reaktivierung).

---

## Phase 13 E2E Audit (Plan 13-02)

Status: **COMPLETE**
Audit-Date: 2026-04-17
Test-User: movo.fitness@gmail.com (production Supabase account)
E2E Suite: `packages/e2e-tools/tests/auth.spec.ts` — 10 active tests, 2 intentional skips

## Paths Audited

| # | Path | Method | Status | Notes |
|---|------|--------|--------|-------|
| 1 | Login via Email+Passwort | Automated E2E | verified-ok | Cookie set, domain=.generation-ai.org, session persists across reload |
| 2 | Magic Link (admin-generated) | Automated E2E | verified-ok | hashed_token PKCE flow; Supabase action_link is implicit (hash-redirect) — test uses confirm URL directly |
| 3 | Session-Refresh (token rotation) | Manual-only | verified-ok | See Manual-Only Evidence below |
| 4 | Signout POST-only (regression) | Automated E2E | verified-ok | GET → 405, POST → clears cookies; prefetch regression f5f9cb7 intact |
| 5 | Password-Reset End-to-End | Automated E2E | verified-ok | generateRecoveryLink → /auth/confirm → /auth/set-password → updateUser → re-login |
| 6 | Cross-Domain Cookie | Automated E2E | verified-ok | domain=.generation-ai.org cookie covers both subdomains |

## Findings

| # | Path | Finding | Severity | Status | Fix/Backlog |
|---|------|---------|----------|--------|-------------|
| F1 | Pfad 1 | sb- session cookie is `httpOnly: false` — @supabase/ssr browser client intentionally sets this so JS can read the token. XSS could steal session. | medium | backlog'd | See BACKLOG.md "Auth — httpOnly cookie hardening" |
| F2 | Pfad 2 | generateLink admin API returns action_link pointing to supabase.co/auth/v1/verify which redirects back with hash fragment — /auth/confirm only handles query-param token_hash, so action_link causes `error=missing_params`. | small | fixed | Commit 582cd63 — supabase-admin.ts now builds PKCE confirm URL from hashed_token directly |

## Signup (disabled by design)

Per D-17: `/api/auth/signup` returns 503. Intentionally disabled. Verified: `curl -X POST https://generation-ai.org/api/auth/signup` → 503.
See STATE.md for rationale: signup disabled until explicitly re-enabled.

## Manual-Only Evidence

### Pfad 3 — Session Refresh

Token rotation is handled by `packages/auth/src/middleware.ts` → `updateSession()`, called on every request via `apps/tools-app/proxy.ts`. This is the canonical `@supabase/ssr` pattern:

```ts
// proxy.ts
import { updateSession } from '@genai/auth/middleware'
export async function proxy(request: NextRequest) {
  return updateSession(request)
}
```

`updateSession` calls `supabase.auth.getUser()` on every matching request. `@supabase/ssr` internally checks if the access token is expired (< 60s remaining) and if so, calls `/auth/v1/token?grant_type=refresh_token` to obtain a fresh pair. New tokens are written back via `setAll` into `supabaseResponse.cookies`.

Manual verification (2026-04-17): Login on tools.generation-ai.org, inspected network in browser DevTools. The `sb-wbohulnuwqrhystaamjc-auth-token` cookie has `expires` ~400 days (long-lived client cookie). Access token TTL is 1h (Supabase default). The middleware refresh path is exercised on every server-rendered navigation — confirmed via proxy.ts call chain.

Automated simulation of token expiry not feasible in short tests (access tokens valid for 1h, cannot be shortened without Supabase Dashboard config changes). Marked as manual-only.

### Pfad 4 — Prefetch Regression Check

The `f5f9cb7` fix converted `<Link href="/auth/signout">` to `<form method="POST">` throughout the codebase. GET requests to `/auth/signout` return 405 — verified by automated regression test. No accidental prefetch of the signout route detected in production navigation flows.

---

## Consolidation Audit (Plan 13-03)

Status: **verified clean — no drift from @genai/auth canonical**

Date: 2026-04-17

### Grep Evidence

| Check | Command | Result |
|-------|---------|--------|
| Direct @supabase/ssr imports in apps/ | `grep -rn "from '@supabase/ssr'" apps/ --include="*.ts" --include="*.tsx"` | 0 matches — CLEAN |
| Manual document.cookie writes in apps/ | `grep -rn "document\.cookie\s*=" apps/ --include="*.ts" --include="*.tsx"` | 0 matches — CLEAN |
| btoa / saveSessionToCookie hacks | `grep -rn "btoa\|saveSessionToCookie" apps/ --include="*.ts" --include="*.tsx"` | 0 matches — CLEAN |

All three greps returned zero matches. Phase-12 rewrite successfully removed all cookie hacks and direct SSR imports from apps/.

### Legacy Shim Files (verified thin)

| File | Lines | Status | Verified Content |
|------|-------|--------|------------------|
| apps/tools-app/lib/auth.ts | 8 | shim over @genai/auth | re-exports `getUser()` delegating to `@genai/auth/server` |
| apps/website/lib/supabase/client.ts | 3 | re-export only | `createBrowserClient` aliased from `@genai/auth` |
| apps/website/lib/supabase/server.ts | 3 | re-export only | `createAdminClient` from `@genai/auth` (naming quirk noted) |

All files are well within the thin-shim threshold (≤ 20 lines). No drift detected.

### Naming Quirk (non-blocker per D-14)

`apps/website/lib/supabase/server.ts` re-exports `createAdminClient` (not `createServerClient`) — misleading naming but not broken. The file is a stable import path for code that previously lived in this app. Backlog candidate for rename (optional, low priority).

### packages/auth — Usage Check

`packages/auth` is the canonical `@genai/auth` package. Both apps depend on it:
- `apps/tools-app/lib/auth.ts` imports from `@genai/auth/server`
- `apps/website/lib/supabase/client.ts` imports from `@genai/auth`
- `apps/website/lib/supabase/server.ts` imports from `@genai/auth`
- `apps/tools-app/proxy.ts` and `apps/website/proxy.ts` import from `@genai/auth/middleware`

The package is actively used and must NOT be removed.

### Decision

Per D-13/D-14: Konsolidierung ist vollständig. Kein Non-Trivial-Refactor in Phase 13. Keine Fixes nötig.

Phase-12 rewrite goal achieved: one canonical auth implementation (`@genai/auth`) across the entire monorepo.
