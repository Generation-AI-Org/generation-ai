---
phase: 25
status: partial-complete
created: 2026-04-24
branch: feature/phase-25-circle-api-sync
preview_url: https://website-git-feature-phase-25-cir-0af118-lucas-projects-e78962e9.vercel.app
---

# Phase 25 — Follow-Up (Next Session Context)

> Kernspec aus `25-CONTEXT.md` + `25-VERIFICATION.md`. Dieses Doc ist der Handoff nach Session-Wrap am 2026-04-24 21:45.

---

## Summary — was live auf Preview funktioniert ✅

Der Unified-Signup-Flow ist **zu 95% durch**. End-to-End auf `feature/phase-25-circle-api-sync`-Branch → Preview-Deploy:

1. ✅ `/join` Form submit → Zod-validation → Rate-limit
2. ✅ Supabase-User angelegt via `admin.createUser({email_confirm:false})`
3. ✅ Circle-Member provisioniert via `@genai/circle.createMember` (idempotent über `getMemberByEmail`)
4. ✅ `user_circle_links` Row + `raw_user_meta_data.circle_member_id` geschrieben
5. ✅ Confirm-Mail via Custom-SMTP (Resend) — Template `ConfirmSignupEmail` rendert, Versand funktioniert
6. ✅ Mail-Link Format: `<preview>/auth/confirm?token_hash=XXX&type=signup` (PKCE-Style, bypasst Supabase-verify-endpoint)
7. ✅ Click → `/auth/confirm` → `verifyOtp({token_hash, type:'signup'})` → Session-Cookie gesetzt → User eingeloggt
8. ✅ `email_confirmed_at` + `last_sign_in_at` werden gesetzt

**Verifizierte Test-Runs (nach Wrap):**
- `movo.fitness+p25-test1@gmail.com` — voll durch bis Login
- `movo.fitness+p25-test2@gmail.com` — voll durch bis Login

---

## Resolved this session ✅

### Bug #2 — Circle `generateSsoUrl` (FIXED 2026-04-25)

**Commit:** `<filled-in-on-commit>` (branch `feature/phase-25-circle-api-sync`)

**Root-Cause (verified live):** `generateSsoUrl` zielte auf eine erfundene API:
1. Falscher Endpoint: `/api/admin/v2/headless_auth_tokens` existiert nicht — korrekt ist `/api/v1/headless/auth_token` (eigene API-Surface, nicht Admin v2)
2. Falscher Token-Type: Admin-Token kann Headless-Endpoints nicht authentifizieren — Circle braucht separat geminten "Headless Auth" Token
3. Falsches Response-Model: Circle liefert kein `sso_url`-Feld — es kommt ein JWT `access_token`, der seamless-Login-URL wird client-side komponiert: `${CIRCLE_COMMUNITY_URL}/session/cookies?access_token=<jwt>`

**Fix:**
- `packages/circle/src/client.ts` — `circleFetch` akzeptiert jetzt `tokenType: 'admin' | 'headless'`, neuer `HEADLESS_BASE_URL`, `generateSsoUrl` rewritten
- `packages/circle/src/types.ts` — `CircleSsoToken` + `GenerateSsoInput` an reale API angepasst (drop `redirect_path` + `ttl_seconds`, beide werden vom Endpoint nicht akzeptiert)
- `packages/circle/src/__tests__/client.test.ts` — Tests gegen neue Endpoint-URL + Response-Shape, plus CONFIG_MISSING-Test für Headless-Token
- `apps/website/app/auth/confirm/route.ts` — Call-Site auf neue Signatur reduziert
- `apps/website/.env.example` — `CIRCLE_HEADLESS_TOKEN=` Placeholder

**Live-Verify (vor Commit):** `curl -X POST https://app.circle.so/api/v1/headless/auth_token` mit echtem Headless-Token + `community_member_id: 80552151` → HTTP 200 mit erwartetem JWT-Response. Volles Detail-Log in `.planning/debug/resolved/phase-25-circle-sso-endpoint.md`.

**Vitest:** 18/18 grün. **Typecheck:** `@genai/circle` clean.

**Restliche Verifikation (offen, nach Push):** Preview-Deploy E2E mit frischer Test-Alias — bestätigen dass `/auth/confirm` direkt nach Circle redirected statt `/welcome?circle=pending`.

---

### Bug #1 — Circle `addMemberToSpace` (FIXED 2026-04-25)

**Commit:** `<filled-in-on-commit>` (branch `feature/phase-25-circle-api-sync`)

**Root-Cause (verified live via Circle MCP):** Plan-B's Payload-Annahme war doppelt falsch:
1. Falscher Key: `community_member_id` — Circle's `POST /space_members` resolved den Member über `email`, nicht über Member-ID
2. Falscher Type: `space_id` muss `integer` sein (per MCP-Schema), nicht der String aus `process.env.CIRCLE_DEFAULT_SPACE_ID`

**Fix:**
- `packages/circle/src/client.ts` — `addMemberToSpace(email, spaceId)` (Signatur), Body `{space_id: Number(spaceId), email}`
- `apps/website/app/actions/signup.ts:218` — Call-Site auf `addMemberToSpace(email, spaceId)` umgestellt
- `packages/circle/src/__tests__/client.test.ts` — alle Tests auf Email-Argument umgestellt + neuer Test asserted exakte Wire-Payload-Shape

**Live-Verify (vor Commit):** `mcp__circle__create_space_member({email:"info@movo.fitness", space_id:2574363})` → `{success:true, message:"User added to space"}`. Schema bestätigt `{email, space_id:int}` als required.

**Vitest:** 19/19 grün (+1 Payload-Shape-Test). **Typecheck:** `@genai/circle` clean, website unverändert clean.

---

## Offene Bugs (Must-Fix vor Launch) ❌

### Bug #2 — Circle `generateSsoUrl` (RESOLVED — siehe Section "Resolved this session" oben)

---

### Bug #3 — `/welcome?circle=pending` redirected zu `/`

**Evidenz:** Runtime-Log `GET /welcome → 307`. 307 = Temporary Redirect.

**Root-Cause (vermutet):** `apps/website/app/(fallback)/welcome/page.tsx` oder `welcome-client.tsx` checkt Session und redirect irgendwo hin wenn State nicht passt.

**Fix-Plan:**
1. `apps/website/app/(fallback)/welcome/page.tsx` + `welcome-client.tsx` lesen
2. 307-Ursache identifizieren (vermutlich fehlende Session-Check-Tolerance: User ist eingeloggt aber Metadata-Flag fehlt?)
3. Banner "Zur Community →" muss angezeigt werden, nicht redirect

**Impact:** Low (User ist eingeloggt, sieht aber Landing statt Fallback-Banner). Kein Data-Loss.

---

### Bug #4 (cosmetisch) — Success-Screen zeigt "Warteliste"-Text

**Evidenz:** `components/join/join-success-screen.tsx` zeigt beim Submit-Success: *"Du stehst auf der Warteliste. Schau schon mal in deinen Posteingang…"*

**Root-Cause:** Component wurde für Phase 23 Waitlist-V1 gebaut, zeigt alten Text, obwohl Phase 25 jetzt echten Signup macht.

**Fix-Plan:** Text umbauen auf:
- *"Willkommen! Wir haben dir eine Bestätigungsmail geschickt. Click den Link und du bist drin."*

**Impact:** Verwirrend für User, aber funktional egal. Priority: low.

---

## State auf dem Branch

- **Branch:** `feature/phase-25-circle-api-sync` (nicht in main)
- **Letzter Commit:** `c90b129` fix(25): hashed_token PKCE (+ cleanup pending)
- **31 Commits** seit origin/main — enthält Plans A–I execution + Code-Review-Fixes + Phase-25-Runtime-Fixes
- **Prod live:** `79885b9` (pre-Phase-25 revert, rolled back via Vercel-CLI nach versehentlichem Push — siehe Session-Log)
- **SIGNUP_ENABLED:** `false` in Prod, `true` in Preview + Dev

## Vercel-Envs (alle clean nach `\n`-Patch + Sentry-Setup)

| KEY | Prod | Preview | Dev |
|---|---|---|---|
| ADMIN_EMAIL_ALLOWLIST | ✓ | ✓ | ✓ |
| CIRCLE_API_TOKEN | ✓ | ✓ | ✓ |
| CIRCLE_COMMUNITY_ID (511295) | ✓ | ✓ | ✓ |
| CIRCLE_COMMUNITY_URL | ✓ | ✓ | ✓ |
| CIRCLE_DEFAULT_SPACE_ID (2574363) | ✓ | ✓ | ✓ |
| NEXT_PUBLIC_SENTRY_DSN_WEBSITE | ✓ | ✓ | ✓ |
| NEXT_PUBLIC_SITE_URL | ✓ | — | ✓ |
| NEXT_PUBLIC_SUPABASE_ANON_KEY | ✓ | ✓ | ✓ |
| NEXT_PUBLIC_SUPABASE_URL | ✓ | ✓ | ✓ |
| SIGNUP_ENABLED | false | true | true |
| SUPABASE_SERVICE_ROLE_KEY | ✓ | ✓ | ✓ |
| SENTRY_DSN_WEBSITE | ✓ | ✓ | ✓ |

## Supabase-Dashboard-State

- **Custom SMTP:** Aktiv, Host `smtp.resend.com`:587, Sender `noreply@generation-ai.org`
- **Redirect URLs Allowlist:** enthält `https://website-git-*.vercel.app/auth/confirm`, `generation-ai.org/auth/confirm`, `localhost:3000/auth/confirm` (nicht länger benötigt nach PKCE-Fix, aber schadet nicht)
- **Email Template "Confirm signup":** Luca hat das Template aus `apps/website/emails/dist/confirm-signup.html` eingespielt — **nicht länger benötigt** weil Phase-25-Code jetzt direkt via Resend sendet mit gerendertem React-Email. Supabase-Template dient nur als Fallback falls jemand anders die Supabase-Auth-Mails triggert (magic-link-login z.B.).

## Session-Log highlights (für Context)

- Versehentlicher Push auf main + Rollback via `vercel rollback` (Memory: `feedback_branch_check_before_push.md`)
- Alle Vercel-Envs hatten `\n`-Suffix (Backslash + n Escape aus `echo | vercel env add`) — per REST-API PATCHED
- Supabase `admin.generateLink` sendet keine Mail in v2 — Resend-Direct-Send nötig (fix drin)
- Supabase's action_link = Implicit-Flow, ging via Site-URL-Fallback auf tools.generation-ai.org → Fix: `hashed_token` statt `action_link` benutzen

---

## Next-Session Commands

### Resume-Command
```
/gsd-debug 25
```

### Ziele für nächste Session (Priority-Order)
1. Bug #2 fixen (Circle SSO endpoint) — Sentry-Event inspizieren, Circle-Docs checken, Code + Test + Live-Verify
2. Bug #1 fixen (addMemberToSpace payload)
3. Bug #3 fixen (welcome redirect)
4. Bug #4 fixen (success-screen copy)
5. Code-Review-Fix-Commits squashen/tidy, VERIFICATION.md auf `passed` updaten
6. Feature-Branch → PR → main-Merge
7. Phase 25 als completed markieren, weiter mit Phase 22.5 oder 22.7

### Test-Email
Frische Alias verwenden: `movo.fitness+p25-test3@gmail.com` (nach jedem Test löschen via SQL:
```sql
DELETE FROM public.user_circle_links WHERE user_id IN (SELECT id FROM auth.users WHERE email LIKE 'movo.fitness+p25%');
DELETE FROM auth.users WHERE email LIKE 'movo.fitness+p25%';
```
).

### Debug-Tools bereit
- Sentry: https://sentry.io/organizations/<luca-org>/projects/generation-ai-website/issues/ (DSN konfiguriert)
- Vercel-Runtime-Logs (MCP): `get_runtime_logs environment=preview since=5m`
- Supabase-Auth-Logs (MCP): `get_logs service=auth`
- Circle-API-Schemas (MCP): `list_space_members`, `create_space_member`, `get_community_member` etc.
