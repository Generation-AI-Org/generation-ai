# Phase 19 — Password-Flow + Test-Baseline · CONTEXT

> Vorbereitungs-Kontext für `/gsd-plan-phase 19`.

**Gathered:** 2026-04-17 · **Updated:** 2026-04-19
**Status:** Ready for planning

---

## TL;DR

Zwei parallele Mini-Workstreams in einer Phase:

1. **Password-Flow für eingeloggte User** — Set-Password wird beim First-Login-Magic-Link optional angeboten (Skip erlaubt), und nachträglich als **Inline-Form** in `/settings` setzbar (Industrie-Standard-Pattern à la GitHub/Google mit Re-Auth bei Change).
2. **E2E-Baseline reparieren** — die 4 failenden Tests (`auth.spec.ts` + `chat.spec.ts`) werden gegen Prod umgestellt (wie `smoke.spec.ts`) und nutzen einen echten Test-Account aus GitHub-Secrets. Baseline grün in CI.

**Out-of-Scope:** Signup-Reactivation + Circle-API-Integration. Bleibt liegen bis Luca sagt „Pforten öffnen". Code dafür existiert in Git-History (Commit `44f7c97`).

---

## Phase Boundary

Diese Phase liefert:
- Opt-in-Password-Setup für eingeloggte User (First-Login-Prompt + Settings-Inline-Form)
- Grüne E2E-Baseline gegen Prod mit echtem Test-Account

Nicht in dieser Phase: Signup, OAuth, Circle-Integration, Content-Arbeit.

---

## Implementation Decisions

### has_password-Storage
- **D-01:** Flag wird in `user_metadata.has_password` (Supabase native) gespeichert — **nicht** in der `profiles`-Tabelle. Keine Migration, kein Schema-Change. Set via `supabase.auth.updateUser({ data: { has_password: true } })`.

### Skip-Verhalten
- **D-02:** Skip-Button auf First-Login-Screen setzt `user_metadata.has_password = false` explizit. Beim nächsten Magic-Link wird der Prompt **nicht wieder gezeigt**. Re-Entry ausschließlich über `/settings`.

### Settings-Flow
- **D-03:** Passwort setzen/ändern läuft als **Inline-Form direkt in `/settings`** — **nicht** über Recovery-Mail-Loop. Rationale: User ist eingeloggt, die Session ist die Auth-Evidence. Mail-Loop bringt bei shared Mail-Zugang keinen Sicherheitsgewinn (siehe DISCUSSION-LOG).
- **D-04:** Inline-Form hat zwei Modi, entschieden über `user_metadata.has_password`:
  - **Setzen** (`has_password=false`): nur „Neues Passwort" + „Bestätigen"
  - **Ändern** (`has_password=true`): „Aktuelles Passwort" + „Neues Passwort" + „Bestätigen" — das aktuelle Passwort wird via `signInWithPassword` als Re-Auth geprüft, bevor `updateUser({ password })` aufgerufen wird
- **D-05:** Nach Erfolg: `user_metadata.has_password = true` setzen, Success-Toast/Message in Settings, kein Redirect.

### Recovery-Mail
- **D-06:** Recovery-Mail-Template (`packages/emails/src/templates/recovery.tsx`) bleibt **unverändert**. Mail wird ausschließlich für den „Passwort vergessen"-Case auf der Login-Seite verwendet — der Text „Passwort zurücksetzen" ist dort semantisch korrekt. Kein Re-Export nötig.

### E2E-Test-Strategie
- **D-07:** Password-Login-Test bleibt aktiv und nutzt einen echten Test-Account in Supabase. Test-Credentials via GitHub-Actions-Secrets `TEST_USER_EMAIL` + `TEST_USER_PASSWORD`.
- **D-08:** Tests laufen gegen Prod (`https://tools.generation-ai.org`). `baseURL` in `playwright.config.ts` hat Prod als Default, überschreibbar via `E2E_BASE_URL` für lokale Dev-Tests.
- **D-09:** Test-Account-Setup ist Manual-Step (Supabase-Dashboard + GitHub-Secrets) und wird in `MANUAL-STEPS.md` dokumentiert.

### Claude's Discretion
- UI-Details der Inline-Form (Spacing, Button-Label-Wording, Error-State-Copy) — Brand-Tokens aus Phase 16 nutzen
- Genaue Position des Passwort-Blocks in `/settings` (oben/unten, Section-Heading)
- Art der Success-Feedback (Toast, Banner, Inline-Message)
- Password-Policy-Check-Details (min 8 Zeichen ist gesetzt, weitere Regeln sind Claude-Discretion innerhalb Supabase-Defaults)

---

## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Auth-Stack
- `docs/AUTH-FLOW.md` — Auth-Flows, Magic-Link-Verifikation, Session-Lifecycle
- `packages/auth/` — canonical `@genai/auth` implementation (Phase 12)
- `apps/tools-app/app/auth/confirm/route.ts` — Magic-Link-Handler, Entry-Point für First-Login-Prompt
- `apps/tools-app/app/auth/set-password/page.tsx` — existierende Set-Password-Page (wird zu First-Login-Screen erweitert)
- `apps/tools-app/app/settings/page.tsx` — Settings-Page, hier wird der Inline-Form-Block eingebaut

### Emails (Phase 17)
- `packages/emails/src/templates/recovery.tsx` — Recovery-Mail-Template (bleibt unverändert, Referenz für Kontext)
- `apps/website/emails/dist/recovery.html` — kompilierte HTML-Version im Supabase-Dashboard (kein Redeploy nötig)

### Testing
- `packages/e2e-tools/playwright.config.ts` — Playwright-Config, baseURL wird angepasst
- `packages/e2e-tools/tests/smoke.spec.ts` — Referenz-Pattern für Prod-Tests (läuft bereits grün)
- `packages/e2e-tools/tests/auth.spec.ts` — wird angepasst (Password-Login mit Secret-Env)
- `packages/e2e-tools/tests/chat.spec.ts` — URL-Pfade auf Prod umstellen
- `.github/workflows/ci.yml` — CI-Workflow, hier werden Secrets referenziert

### Supabase APIs
- `supabase.auth.updateUser({ data: { has_password } })` — Metadata-Update
- `supabase.auth.updateUser({ password })` — Passwort-Setzen/Ändern
- `supabase.auth.signInWithPassword({ email, password })` — für Re-Auth-Check bei Change

---

## Existing Code Insights

### Reusable Assets
- **Set-Password-Page** (`apps/tools-app/app/auth/set-password/page.tsx`, 139 Zeilen) — Client-Component mit Validation, funktioniert bereits. Wird zu First-Login-Screen erweitert (Skip-Button + metadata-Write).
- **`@genai/auth` Client-Helper** — canonical Supabase-Client, keine manuellen Cookie-Hacks nötig.
- **Brand-Tokens aus Phase 16** — Radix Colors + Geist Font, alle UI-Patterns bereits etabliert.

### Established Patterns
- **`verifyOtp`-Pattern in confirm-Route** (Phase 13) — canonical Magic-Link-Handling, darf nicht kaputt gemacht werden.
- **React Email Templates** (Phase 17) — falls doch noch Text-Änderungen nötig würden, wäre der Export-Workflow etabliert (aktuell laut D-06 nicht nötig).
- **Test-Pattern `smoke.spec.ts`** — minimal, gegen Prod, kein Dev-Server. Vorbild für die Reparatur von `auth`/`chat`.

### Integration Points
- **`/auth/confirm` Route** — wird um `has_password`-Check erweitert, redirected First-Login-User zu `/auth/set-password?first=1`
- **`/auth/set-password`** — bekommt Skip-Button und Query-Param `first=1` zum Ausblenden des Back-Buttons
- **`/settings`** — neuer Passwort-Block (Inline-Form mit 2 Modi)
- **Playwright-Config** — `baseURL`-Handling
- **CI-Workflow** — Secrets-Binding

---

## Success Criteria

- [ ] User klickt Magic-Link zum ersten Mal → sieht Set-Password-Screen mit Skip-Option
- [ ] User klickt „Später setzen" → wird normal eingeloggt, landet auf `/`, `has_password=false` gesetzt
- [ ] Bei nächstem Magic-Link-Login: kein Prompt mehr
- [ ] User setzt Passwort erfolgreich → `has_password=true`, beim nächsten Magic-Link kein Prompt
- [ ] In `/settings`: User ohne Passwort sieht „Passwort setzen" (2-Feld-Form)
- [ ] In `/settings`: User mit Passwort sieht „Passwort ändern" (3-Feld-Form mit Re-Auth)
- [ ] Re-Auth-Check schlägt bei falschem aktuellen Passwort fehl, zeigt klaren Error
- [ ] Alle E2E-Tests grün in CI gegen Prod mit Test-Account
- [ ] `pnpm build` beider Apps grün
- [ ] Keine Regression: Magic-Link-only-Flow für Alt-User ohne Passwort funktioniert unverändert
- [ ] `MANUAL-STEPS.md` dokumentiert Supabase-Test-User + GitHub-Secrets-Setup

---

## Out-of-Scope

- **Signup-Reactivation** — Pforten bleiben zu. `/api/auth/signup` bleibt auf 503. Code in `git show 44f7c97:apps/website/app/api/auth/signup/route.ts`.
- **Circle-API-Integration** — parallel zur Signup-Reactivation, nicht jetzt.
- **OAuth Google/Apple** — separater Workstream.
- **Password-Policy-Erweiterungen** (Special-Chars, Password-Strength-Meter) — Supabase-Default reicht.
- **2FA** — eigene Phase.
- **Session-Invalidation bei Passwort-Change** — Supabase-Default-Verhalten reicht (andere Geräte bleiben eingeloggt bis Token-Refresh).

---

## Änderungs-Footprint (Pre-Estimate)

| Bereich | Files | Zeilen |
|---|---|---|
| `apps/tools-app/app/auth/confirm/route.ts` | 1 | +15 (has_password-Check) |
| `apps/tools-app/app/auth/set-password/page.tsx` | 1 | +30 (Skip-Button + metadata-Write) |
| `apps/tools-app/app/settings/page.tsx` | 1 | +80 (neuer Passwort-Block, Inline-Form, 2 Modi + Re-Auth) |
| `packages/e2e-tools/playwright.config.ts` | 1 | +3 (baseURL) |
| `packages/e2e-tools/tests/chat.spec.ts` | 1 | ~5 (URL-Pfade) |
| `packages/e2e-tools/tests/auth.spec.ts` | 1 | ~10 (Password-Login mit Env-Secret) |
| `.github/workflows/ci.yml` | 1 | +4 (Secret-Binding) |
| `MANUAL-STEPS.md` (neu) | 1 | +30 (Supabase-User + GH-Secret Setup) |

**Total:** ~8 Files, ~180 Zeilen Code. ~1-1.5 Tage.

---

## Env-Vars

Keine neuen App-Env-Vars. Neu in **GitHub Actions Secrets**:
- `TEST_USER_EMAIL` — Test-Account für E2E
- `TEST_USER_PASSWORD` — Test-Account-Passwort

---

## Abhängigkeiten / Risks

- **Supabase user_metadata-API** — `updateUser({ data: {...} })` muss im Client-Context funktionieren. Erprobt in Phase 12 ✅.
- **Re-Auth via `signInWithPassword`** — bei Erfolg **ersetzt** Supabase die aktive Session. Muss im Client getestet werden: Session-Continuity nach Re-Auth → dann `updateUser({ password })` → dann Success.
- **Test-Account-Setup** — Manual-Step, muss in `MANUAL-STEPS.md` dokumentiert werden. Test-Mail-Adresse: idealerweise eine Fake-Adresse die nicht geforwarded wird (ImprovMX vermeiden), oder echte Mailbox für zukünftige Magic-Link-Tests.
- **E2E gegen Prod**: wenn Prod down ist, failen Tests. Tradeoff akzeptiert — Prod-Downtime soll von Tests aufgedeckt werden.

---

## Deferred Ideas

- **Echter Password-Reset-E2E-Test** (User triggert „Passwort vergessen" → Mail parsen → Link folgen → neues Passwort setzen) — braucht Mail-Inbox-Scraping oder Supabase-Admin-Access, zu komplex für Baseline.
- **Password-Strength-Meter** — UX-nice-to-have, eigene kleine Task wenn gewünscht.
- **OAuth Google/Apple** — bleibt in BACKLOG.

---

*Phase: 19-password-flow-and-test-baseline*
*Context gathered: 2026-04-17 · Decisions locked: 2026-04-19*
