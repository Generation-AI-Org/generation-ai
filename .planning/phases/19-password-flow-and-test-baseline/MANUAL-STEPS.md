# Phase 19 — Manual Steps für Luca

> Einmaliges Setup damit die E2E-Baseline (`auth.spec.ts` + `smoke.spec.ts`) grün gegen Prod läuft. Kontext: Phase 19 Decisions D-07 (Test-Account für Password-Login-E2E) und D-09 (Manual-Step-Dokumentation).

Ohne diese Schritte:
- `packages/e2e-tools/tests/auth.spec.ts` Path 1 (Password-Login) failed — `requireTestUser()` in `packages/e2e-tools/fixtures/test-user.ts` wirft: `TEST_USER_EMAIL / TEST_USER_PASSWORD missing`.
- CI `e2e`-Job schlägt fehl (Exit-Code != 0).

---

## 1. Supabase Test-User anlegen

**Warum:** `auth.spec.ts` Path 1 loggt sich mit realen Credentials in Prod ein. Ohne User ist der Test nicht ausführbar.

### Schritte

1. Supabase Dashboard öffnen → Projekt `wbohulnuwqrhystaamjc` → **Authentication** → **Users**
   Direkt-Link: https://supabase.com/dashboard/project/wbohulnuwqrhystaamjc/auth/users
2. „**Add user**" → „**Create new user**"
3. **Email:** z.B. `e2e-tester@generation-ai.test`
   **Wichtig:** Fake-Adresse die NICHT via ImprovMX geforwarded wird — vermeide `admin@generation-ai.org`, `luca@generation-ai.org` o.ä., sonst landen alle Test-Mails in Lucas persönlicher Inbox.
4. **Password:** sicheres Passwort generieren:
   `openssl rand -base64 24`
   → Output kopieren (wird gleich als `TEST_USER_PASSWORD` eingesetzt)
5. **„Auto Confirm User"** → **ON** (sonst ist der User nicht direkt loginfähig)
6. „**Create user**" klicken
7. Verifizieren: User erscheint in der Liste mit Status „**Confirmed**"

### Wichtiger Hinweis

Der Test-User darf **kein** `user_metadata.has_password=true` gesetzt bekommen, sonst greift der First-Login-Prompt (Phase 19 Plan 01) nicht und der E2E-Flow testet den falschen Pfad. Supabase's „Add user" setzt kein Metadata per Default → passt. Falls versehentlich gesetzt: User löschen und neu anlegen.

### Recovery-Hinweis

Wenn E2E-Test Path 5 (Password-Reset) den User-State nicht sauber zurücksetzt, kann sich das Passwort in Supabase unterscheiden von dem was in `TEST_USER_PASSWORD` steht. In dem Fall:
- Supabase Dashboard → User öffnen → „**Reset Password**" → manuell gleiches Passwort wieder setzen.
- Alternativ: User löschen, neu anlegen mit bekanntem Passwort, Secret in GitHub updaten.

---

## 2. GitHub Repo Secrets setzen

**Warum:** Der CI-Workflow (`.github/workflows/ci.yml`) injiziert die Credentials als env-Vars in den `e2e`-Job. Ohne Secrets failen die Password-Login-Tests in CI mit dem gleichen Error wie lokal.

### Schritte

1. GitHub → Repo `Generation-AI-Org/generation-ai` → **Settings** → **Secrets and variables** → **Actions**
   Direkt-Link: https://github.com/Generation-AI-Org/generation-ai/settings/secrets/actions
2. „**New repository secret**"
   - **Name:** `TEST_USER_EMAIL`
   - **Value:** Email aus Schritt 1.3 (z.B. `e2e-tester@generation-ai.test`)
3. „**New repository secret**"
   - **Name:** `TEST_USER_PASSWORD`
   - **Value:** Passwort aus Schritt 1.4 (aus `openssl rand -base64 24`)

### Verify

Secrets-Liste zeigt beide Namen (Values sind nach Anlage nicht mehr lesbar — GitHub verrät sie nicht mehr, notfalls neu setzen).

Bereits bestehende Repo-Secrets aus früheren Phasen die weiterhin gebraucht werden:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `TURBO_TOKEN`

Diese sollten bereits gesetzt sein (Phase 7 CI-Setup). Falls nicht: in gleicher Stelle nachpflegen.

---

## 3. (Optional) Repo-Variable `E2E_BASE_URL`

**Warum:** Standardmäßig nutzt Playwright Prod (`https://tools.generation-ai.org`) aus dem Default in `packages/e2e-tools/playwright.config.ts`. Nur setzen wenn eine Preview-URL getestet werden soll (z.B. für eine spezifische PR).

### Schritte

1. GitHub → Repo → **Settings** → **Secrets and variables** → **Actions** → Tab **Variables**
2. „**New repository variable**"
   - **Name:** `E2E_BASE_URL`
   - **Value:** z.B. `https://tools-preview-xxx.vercel.app`

### Wieder entfernen

Gleiche Stelle → Variable anklicken → „**Remove variable**" — danach fällt der CI-Run wieder auf den Prod-Default zurück.

---

## 4. Local `.env.test.local` für Dev-Runs

**Warum:** Lokale Playwright-Runs (außerhalb CI) lesen Credentials aus `packages/e2e-tools/.env.test.local`. Diese Datei ist gitignored und enthält die echten Werte aus Schritt 1.

### Content

Datei anlegen unter `packages/e2e-tools/.env.test.local`:

    TEST_USER_EMAIL=<Email aus Schritt 1.3>
    TEST_USER_PASSWORD=<Passwort aus Schritt 1.4>
    NEXT_PUBLIC_SUPABASE_URL=https://wbohulnuwqrhystaamjc.supabase.co
    SUPABASE_SERVICE_ROLE_KEY=<aus Supabase Dashboard → Settings → API → service_role key>

Optional für Local-Dev-Server-Tests:

    E2E_BASE_URL=http://localhost:3001

### Verify

1. `.env.test.local` ist in `.gitignore` — vor Commit prüfen mit:
   `git check-ignore -v packages/e2e-tools/.env.test.local`
   → sollte einen Match anzeigen. NIEMALS committen.
2. Tests ausführen:
   `pnpm --filter @genai/e2e-tools exec playwright test`
   → Password-Login-Tests müssen jetzt passen (statt zu skippen/failen).

---

## 5. Rollback

Falls Test-Setup wieder zurückgedreht werden soll (z.B. Test-User kompromittiert, Secret geleaked):

**Test-User löschen:**
- Supabase Dashboard → Authentication → Users → Test-User anklicken → „**Delete user**"

**Repo-Secrets löschen:**
- GitHub → Settings → Secrets and variables → Actions → Secret anklicken → „**Remove secret**"

**Konsequenz:**
- CI `e2e`-Job failed Password-Login-Tests (wird aber nicht mehr den gesamten Job rot machen, solange andere Tests grün bleiben — Playwright reportet per-test).
- Lokale Runs ohne `.env.test.local` skippen oder failen ebenso.

Neuer Test-User → gleicher Flow wie Schritte 1–2.

---

*Phase: 19-password-flow-and-test-baseline · erstellt: 2026-04-19*
