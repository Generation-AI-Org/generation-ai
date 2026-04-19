# Phase 19 — Password-Flow + Test-Baseline · CONTEXT

> Vorbereitungs-Kontext für `/gsd-plan-phase 19`.

---

## TL;DR

Zwei parallele Mini-Workstreams in einer Phase:

1. **Password-Flow für eingeloggte User** — Set-Password wird beim First-Login-Magic-Link optional angeboten (Skip erlaubt), und nachträglich in `/settings` setzbar. Recovery-Mail-Text wird neutralisiert, damit dieselbe Mail für „erstmalig setzen" und „vergessen" funktioniert.
2. **E2E-Baseline reparieren** — die 4 failenden Tests (`auth.spec.ts` + `chat.spec.ts`) werden gegen Prod umgestellt (wie `smoke.spec.ts`), damit kein localhost:3001 und kein TEST_USER-Env mehr nötig ist. Baseline grün.

**Out-of-Scope:** Signup-Reactivation + Circle-API-Integration. Bleibt liegen bis Luca sagt „Pforten öffnen". Der Code dafür existiert bereits im Git-History (Commit `44f7c97`) und kann jederzeit zurückgeholt werden.

---

## Kontext & Historie

### Was schon existiert

**Set-Password-Page** (`apps/tools-app/app/auth/set-password/page.tsx`, 139 Zeilen):
- Client-Component, nutzt `supabase.auth.updateUser({ password })`
- Validiert min 8 Zeichen + Confirm-Match
- Redirect auf `/` nach Erfolg (1.5s Delay)
- **Funktioniert bereits** — aber nur als Ziel des Recovery-Flows.

**Recovery-Flow** (`apps/tools-app/app/auth/confirm/route.ts`, 34 Zeilen):
- `type === 'recovery'` → redirect zu `/auth/set-password`
- `type === 'magiclink'` → direkter Login, kein Set-Password-Prompt
- Canonical `verifyOtp`-Pattern aus Phase 13.

**Recovery-Mail-Template** (`packages/emails/src/templates/recovery.tsx`):
- Text ist fast neutral: „klick auf den Button, um ein neues Passwort zu setzen"
- **Footer-Problem**: „Falls du das nicht warst, ignorier die Mail. Dein Passwort bleibt unverändert." — impliziert Reset, funktioniert aber auch für „erstmalig setzen" wenn minimal umformuliert.

**Settings-Page** (`apps/tools-app/app/settings/page.tsx` — verifizieren): existiert, aber noch kein Passwort-Setzen-Eintrag.

**E2E-Tests** (`packages/e2e-tools/tests/`):
- `smoke.spec.ts` — läuft gegen Prod, grün ✅
- `auth.spec.ts:32` — Password-Login-Test, erwartet `TEST_USER_EMAIL` + `TEST_USER_PASSWORD` Env (fehlt in CI)
- `chat.spec.ts:4, 10, 19` — erwarten `localhost:3001` Dev-Server (nicht autostart)
- Alle 4 failen sowohl auf main als auch auf Phase-18-Branch → pre-existing, nicht durch Phase 18 verursacht.

---

## Scope im Detail

### 1. Set-Password nach Magic-Link First-Login (mit Skip)

**Ziel:** User klickt Magic-Link, landet auf Set-Password-Screen mit zwei Optionen:
- „Passwort speichern" → Password gesetzt, weiter zu `/`
- „Später / Magic-Link weiter nutzen" → Skip, direkt zu `/`

**Logik „hat User schon ein Passwort?"** — brauchen wir, damit wir den Screen nur beim ersten Mal zeigen, nicht bei jedem Magic-Link-Login. Zwei Optionen:

- **Option A:** Flag `has_password` in `profiles`-Tabelle (boolean, default false, wird true wenn `updateUser({ password })` erfolgreich)
- **Option B:** Flag in `user_metadata` (nutzt Supabase-eigenen Store, kein DB-Schema-Change)

→ Empfehlung: **Option B** — kein DB-Schema-Change, keine Migration, `user_metadata.has_password = true` bei Erfolg.

**Flow:**
1. User klickt Magic-Link → `/auth/confirm?type=magiclink&token_hash=…`
2. `confirm/route.ts` prüft `user_metadata.has_password`
3. Wenn `false` oder unset → redirect zu `/auth/set-password?first=1`
4. Wenn `true` → direkter Redirect zum ursprünglichen `next` oder `/`

**Set-Password-Page Anpassungen:**
- Neuer Skip-Button: „Später setzen — Magic-Link weiter nutzen"
- Skip setzt `user_metadata.has_password = false` (explizit, für zukünftige Skips) und redirected zu `/`
- Erfolgreiches Setzen: `user_metadata.has_password = true` setzen

### 2. Settings-Eintrag „Passwort setzen/ändern"

**Ziel:** Eingeloggter User kann in `/settings` ein Passwort setzen (wenn noch keins) oder ändern (wenn schon eins).

**UI:**
- Button/Link in Settings: „Passwort setzen" ODER „Passwort ändern" (je nach `has_password`-Flag)
- Klick → triggert `supabase.auth.resetPasswordForEmail(email, { redirectTo: /auth/set-password })` — nutzt den existierenden Recovery-Flow
- Kleine Bestätigung: „Check deine Mails"

**Keine eigene Route nötig** — Recovery-Mail-Flow deckt beide Cases ab.

### 3. Recovery-Mail-Text neutralisieren

`packages/emails/src/templates/recovery.tsx`:

```
Vorher:
  - Preview: „Setz dein Passwort in 60 Minuten zurück."
  - Body: „klick auf den Button, um ein neues Passwort zu setzen."
  - Der Link gilt 60 Minuten.
  - Footer: „Falls du das nicht warst, ignorier die Mail. Dein Passwort bleibt unverändert."

Nachher:
  - Preview: „Dein Passwort-Link — 60 Minuten gültig."
  - Body: „Klick auf den Button, um dein Passwort zu setzen."
  - Der Link gilt 60 Minuten.
  - Footer: „Falls du das nicht angefragt hast, ignorier die Mail."
```

Nach Text-Änderung: `pnpm email:export` → neue HTMLs generieren → in Supabase-Dashboard Recovery-Template einfügen.

### 4. E2E-Baseline reparieren (Option A: Tests gegen Prod)

**Ziel:** Alle `auth.spec.ts` + `chat.spec.ts` Tests laufen ohne Dev-Server und ohne TEST_USER-Env.

**Strategie:**
- Statt `http://localhost:3001/chat` → `https://tools.generation-ai.org/chat`
- Statt Password-Login-Test mit echten Credentials → Test prüft nur dass Login-Form erscheint und Submit ohne Credentials den erwarteten Error zeigt (`"Invalid login credentials"`)
- Alternative für Password-Login-Test: komplett als `test.skip()` mit Kommentar „needs authenticated test user, see BACKLOG" markieren, bis echter Test-User in CI existiert.

**Config-Änderung** (`packages/e2e-tools/playwright.config.ts`):
- `baseURL: 'https://tools.generation-ai.org'` als Default
- Optional: per Env-Var überschreibbar für lokale Dev-Tests

**Smoke-Guarantee:** Alle Tests müssen grün sein bevor PR gemergt wird.

---

## Out-of-Scope

- **Signup-Reactivation** — Pforten bleiben zu. Der 503-Endpoint `/api/auth/signup` bleibt unverändert. Code für Reaktivierung liegt in `git show 44f7c97:apps/website/app/api/auth/signup/route.ts` bereit inkl. Circle-API-Call.
- **Circle-API-Integration** — wird parallel zur Signup-Reactivation reaktiviert. Nicht jetzt.
- **OAuth Google/Apple** — separater Workstream, später.
- **Content-Arbeit** — eigener Workstream (Supabase-Dashboard-Work, kein Code).

---

## Success Criteria

- [ ] User klickt Magic-Link zum ersten Mal → sieht Set-Password-Screen mit Skip-Option
- [ ] User klickt „Später setzen" → wird normal eingeloggt, landet auf `/`
- [ ] User setzt Passwort erfolgreich → `user_metadata.has_password = true`, beim nächsten Magic-Link wird Screen nicht mehr gezeigt
- [ ] Eingeloggter User öffnet `/settings`, klickt „Passwort setzen/ändern" → bekommt Recovery-Mail → Link führt zu Set-Password-Screen
- [ ] Recovery-Mail-Text ist neutral formuliert und funktioniert für beide Fälle (erstmalig + vergessen)
- [ ] Alle E2E-Tests in `packages/e2e-tools/tests/` grün gegen Prod
- [ ] `pnpm build` beider Apps grün
- [ ] Keine Regressionen an bestehendem Magic-Link-only-Flow (Alt-User ohne Passwort kann weiter via Magic-Link einloggen)

---

## Env-Vars

Keine neuen Env-Vars nötig. Bestehende Supabase-Keys reichen.

---

## Änderungs-Footprint (Pre-Estimate)

| Bereich | Files | Zeilen |
|---|---|---|
| `apps/tools-app/app/auth/confirm/route.ts` | 1 | +15 (has_password-Check) |
| `apps/tools-app/app/auth/set-password/page.tsx` | 1 | +30 (Skip-Button + metadata-update) |
| `apps/tools-app/app/settings/page.tsx` | 1 | +40 (neuer Passwort-Button + resetPasswordForEmail-Call) |
| `packages/emails/src/templates/recovery.tsx` | 1 | ~5 (Text) |
| `apps/website/emails/dist/recovery.html` | 1 | regeneriert |
| `packages/e2e-tools/playwright.config.ts` | 1 | +3 (baseURL) |
| `packages/e2e-tools/tests/chat.spec.ts` | 1 | ~5 (URL-Pfade) |
| `packages/e2e-tools/tests/auth.spec.ts` | 1 | ~10 (Skip für Password-Login-Test) |

**Total:** ~8 Files, ~100 Zeilen Code + 1 HTML-Regen. ~1.5 Tage.

---

## Abhängigkeiten / Risks

- **Supabase user_metadata-API** — `supabase.auth.updateUser({ data: { has_password: true } })` muss im Client-Context funktionieren. Verifizieren in Phase-19-Research.
- **Recovery-Mail-Template** muss in Supabase-Dashboard manuell eingefügt werden (kein Auto-Deploy).
- **E2E gegen Prod**: wenn Prod down ist, failen die Tests. Tradeoff akzeptiert — Prod-Downtime ist sowieso ein Issue das Tests aufdecken sollen.
