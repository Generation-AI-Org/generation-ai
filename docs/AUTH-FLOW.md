# Auth Flow — Generation AI

> Canonical reference for auth-flow audit results, consolidation status, and CSP documentation.
> Created by Phase 13 (Auth-Flow-Audit + CSP Reaktivierung).

---

<!-- Plan 02 (Auth-Flow Diagrams + Playwright Audit) will prepend or append its sections here -->

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
