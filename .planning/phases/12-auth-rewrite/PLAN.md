# Phase 12: Auth Rewrite — @supabase/ssr canonical + cross-domain

**Status:** In Progress
**Started:** 2026-04-16
**Priority:** BLOCKER (Login broken in production)

## Goal

Login (Passwort + Magic Link) funktioniert stabil auf `tools.generation-ai.org`.
Session persistiert über Refreshes und Page-Navigation hinweg.
Cookies shared auf `.generation-ai.org` (cross-domain zwischen website + tools-app).
**Single canonical auth implementation** via `@genai/auth` package.

## Root Cause (diagnosed, now being fixed)

1. **Manueller `btoa(JSON.stringify(...))` cookie write** in `lib/supabase/browser.ts` + `app/login/page.tsx` — falsches Format, `@supabase/ssr` kann beim Lesen nicht parsen.
2. **Doppel-Write Race:** `setAll` (custom handler) und `saveSessionToCookie` schreiben gleichzeitig unterschiedliche Formate auf denselben Cookie-Namen.
3. **Custom cookie handler umgeht** `@supabase/ssr`'s natives Chunking + Base64-URL Encoding + `base64-` Prefix.
4. **3 parallele Auth-Implementierungen** im Monorepo: `packages/auth` (clean, ungenutzt), `apps/tools-app/lib/supabase/*` (kaputt), `apps/website/lib/supabase/*` (deprecated API).

## Strategy

Statt 10 parallele Hacks → **eine canonical Implementation via `packages/auth`**.
Alle manuellen `document.cookie`-Writes entfernen. `@supabase/ssr` managed cookies automatisch (Format, Chunking, Encoding) — wir müssen es nur in Ruhe lassen.

## Waves

### Wave 1: `@genai/auth` Package Enhancement
- [ ] Create `packages/auth/src/middleware.ts` — `updateSession()` helper (canonical Supabase pattern)
- [ ] Update `packages/auth/src/browser.ts` — default cookieOptions from env (`NEXT_PUBLIC_COOKIE_DOMAIN`)
- [ ] Update `packages/auth/src/server.ts` — domain option support
- [ ] Update `packages/auth/src/index.ts` + `package.json` exports
- [ ] Commit: `feat(auth): add canonical updateSession + cookie domain support`

### Wave 2: tools-app Auth Rewrite
- [ ] Delete `apps/tools-app/lib/supabase/{browser,server,proxy}.ts`
- [ ] Rewrite `apps/tools-app/proxy.ts` using shared `updateSession`
- [ ] Update all imports to `@genai/auth`
- [ ] Rewrite `app/login/page.tsx` — alle manuellen Cookie-Writes raus
- [ ] Simplify `app/auth/callback/page.tsx`
- [ ] Update `app/auth/{confirm,signout,set-password}` routes
- [ ] Update `components/{AuthProvider,chat/ChatPanel}.tsx`
- [ ] Update `lib/auth.ts`, `app/api/{debug-auth,account/delete}/route.ts`
- [ ] Commit: `refactor(tools-app): migrate to @genai/auth, remove manual cookie hacks`

### Wave 3: website Auth Rewrite
- [ ] Replace `apps/website/lib/supabase/{client,server}.ts` with `@genai/auth` re-exports
- [ ] Create `apps/website/proxy.ts` for session refresh
- [ ] Update imports
- [ ] Commit: `refactor(website): migrate to @genai/auth + add session-refresh proxy`

### Wave 4: Vercel Env Vars
- [ ] `vercel env add NEXT_PUBLIC_COOKIE_DOMAIN=.generation-ai.org` für tools-app (prod + preview)
- [ ] Gleiches für website
- [ ] Dokumentiere Ergebnis

### Wave 5: Verification
- [ ] `pnpm install` (workspace changes)
- [ ] `pnpm build` beide apps
- [ ] `pnpm lint`
- [ ] `pnpm test` (vitest units)

### Wave 6: Documentation + Changeset
- [ ] `SETTINGS-TODO.md` — Supabase Dashboard 3 changes (user macht Abend)
- [ ] Update `docs/AUTH-FLOWS.md` — neues canonical pattern
- [ ] Update `.planning/STATE.md` — Phase 12 complete, Blocker resolved
- [ ] `pnpm changeset` für beide apps + auth package
- [ ] Commit: `docs(auth): update flow docs for canonical pattern`

## Out of Scope

- Sign-up reaktivieren (bleibt 503)
- Circle SSO integration (separate, funktioniert via magic link zu community.generation-ai.org)
- Production deploy — user's OK required
- Playwright E2E run — braucht deployed preview, kann nicht lokal
- `lib/supabase.ts` (FILE, standalone admin+read client for non-auth data) — touchpt nicht Auth-Flow, bleibt wie es ist

## Blocker for Full Validation

Echte Login-Validierung erfordert:
1. `git push` → Preview-Deploy triggert
2. Supabase Dashboard settings (user macht, Anleitung in SETTINGS-TODO.md)
3. Playwright gegen Preview-URL (Package `packages/e2e-tools` existiert)

Alles bis Push ist autonom.

## Files Changed (preview)

### New
- `packages/auth/src/middleware.ts`
- `apps/website/proxy.ts`
- `.planning/phases/12-auth-rewrite/{PLAN,SETTINGS-TODO}.md`

### Modified
- `packages/auth/src/{browser,server,index}.ts`, `packages/auth/package.json`
- `apps/tools-app/proxy.ts`
- `apps/tools-app/app/{login/page,auth/callback/page,auth/confirm/route,auth/signout/route,auth/set-password/page,api/debug-auth/route,api/account/delete/route}.{ts,tsx}`
- `apps/tools-app/components/{AuthProvider,chat/ChatPanel}.tsx`
- `apps/tools-app/lib/auth.ts`
- `apps/website/lib/supabase/{client,server}.ts`
- `docs/AUTH-FLOWS.md`
- `.planning/STATE.md`

### Deleted
- `apps/tools-app/lib/supabase/{browser,server,proxy}.ts`
