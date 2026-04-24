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

## Offene Bugs (Must-Fix vor Launch) ❌

### Bug #1 — Circle `addMemberToSpace` 404

**Evidenz:** Sentry-Event am 2026-04-24 21:02:34 UTC, Preview-Env:
```
CircleApiError: Circle API POST /space_members failed with status 404
op: addMemberToSpace
```

**Root-Cause:** Plan-B (`packages/circle/src/client.ts:190-209`) setzt den Request:
```ts
circleFetch('/space_members', {
  method: 'POST',
  body: { space_id: spaceId, community_member_id: memberId }
})
```

Der Pfad `/space_members` und/oder der Payload-Key `community_member_id` ist falsch. Plan-B hatte den Pfad explizit als "best guess" markiert (siehe 25-B-circle-client-package-PLAN.md).

**Live-Verification (via Circle-MCP, nächste Session):**
- MCP `create_space_member` Schema zeigt Payload `{email, space_id}` — **nicht** `community_member_id`
- Also: API erwartet `email` im Body, nicht Member-ID-Referenz

**Fix-Plan:**
1. `packages/circle/src/client.ts` — `addMemberToSpace(email: string, spaceId: string)` (Signatur ändern)
2. Body: `{ space_id: spaceId, email }`
3. Call-Site `apps/website/app/actions/signup.ts:204` — `await addMemberToSpace(email, spaceId)` statt `circleMemberId`
4. Tests `packages/circle/src/__tests__/client.test.ts` — Expectations auf neuen Payload anpassen
5. Circle-MCP Test vor Commit: `create_space_member({email:"…", space_id:2574363})` muss 200 liefern

**Nicht-Impact:** Plan bewusst non-blocking (D-03). Signup geht trotzdem durch, Member existiert in Circle (nur nicht im Welcome-Space). Priority: high (UX-Win: User landet im #how-to-space nach Confirm-Click), aber kein Launch-Blocker.

---

### Bug #2 — Circle `generateSsoUrl` vermutlich gleicher API-Path-Mismatch

**Evidenz:** Runtime-Logs zeigen:
```
21:34:35 GET /auth/confirm → 303   (verifyOtp success)
21:34:36 GET /welcome → 307        (fallback hit → means generateSsoUrl threw)
21:34:36 GET / → 200
```

Der `/welcome`-Redirect deutet darauf hin, dass in [apps/website/app/auth/confirm/route.ts:156](apps/website/app/auth/confirm/route.ts:156) der try/catch um `generateSsoUrl` getriggert hat → `redirectWithCookies(fallbackUrl(origin))`.

**Root-Cause (vermutet):** `packages/circle/src/client.ts:220-232` nutzt Endpoint `/headless_auth_tokens`:
```ts
const token = await circleFetch<CircleSsoToken>('/headless_auth_tokens', ...)
```

Plan-B-Kommentar: *"Exact endpoint may be `/headless_auth_tokens` or `/community_members/:id/sso_token` depending on Circle plan"*. Auch "best guess", genauso wie `addMemberToSpace`.

**Verification nötig:**
- Sentry-Event inspizieren (Tag `op: generateSsoUrl`) — Status-Code und Correlation-ID
- Circle-Dashboard → Settings → API → SSO-Endpoint-Doku abgreifen
- Oder: Circle-Support/Docs nach dem korrekten "Get SSO-Token for Member"-Endpoint fragen

**Fix-Plan:** nach Verification analog zu Bug #1 — Pfad + Payload korrigieren, tests, live-test.

**Impact:** Das ist der Kern-UX-Win-Blocker. Solange das failed, landet User nach Confirm-Click auf `/welcome?circle=pending` (aktuell wegen Routing-Bug #3 auf `/`), nicht direkt in Circle.

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
