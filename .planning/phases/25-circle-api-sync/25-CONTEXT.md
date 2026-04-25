---
phase: 25
slug: circle-api-sync
type: context
status: planning
created: 2026-04-23
last-updated: 2026-04-23
depends_on:
  - 23 (/join — Waitlist-Pattern wird ersetzt durch echten Signup-Flow)
  - 22.5 (/events — Member-Gate nutzt Circle-Membership-Status)
  - 22.7 (tools-app — Login-Button-Flow redirected auf funktionierenden Signup)
branch: feature/phase-25-circle-api-sync
---

# Phase 25 — Circle-API-Sync (Unified Signup)

> **Kern-UX-Win der v4.0-Roadmap.** User registriert sich auf `generation-ai.org/join`, bestätigt eine Mail, landet **direkt eingeloggt** in der Circle-Community. Eine Mail, ein Click, fertig. Technisch: Supabase + Circle Business-Plan-API via Server-Action, Soft-SSO über gleiche Email.

---

## Warum diese Phase

Aktuell läuft Signup zweistufig + kaputt:
- Signup ist **503 disabled** seit Phase 4, weil Supabase + Circle separat verwaltet wurden
- Historie: Generation-AI hatte ~50 User die sich manuell bei beiden (Supabase + Circle) anmelden mussten → 60% Drop-off zwischen Mail 1 und Mail 2

**Diese Phase löst das:**
- Ein Signup-Flow auf `/join` → Supabase Auth-User wird angelegt **und** Circle-Member wird provisioniert (via Circle-API)
- User bekommt **eine** Mail (Supabase-Confirmation) mit embedded Circle-SSO-Token
- Click auf Confirm-Link → Supabase session set + sofortiger Redirect zu `community.generation-ai.org` mit aktivem Circle-Login
- Soft-SSO über gleiche Email-Adresse (Circle Business-Plan API erlaubt programmatic Member-Create)

Simons Konzept §1.2 + §7.1: Circle ist das Zentrum. Die Bridge muss unsichtbar sein.

STATE.md (2026-04-23): „Kern-UX-Win: Phase 25 Circle-API-Sync — User bekommt eine Mail statt zwei, landet nach Confirm via embedded SSO-Link direkt eingeloggt in Circle."

---

## Mission

Signup-Flow ist so reibungsarm wie möglich. Technisch: Supabase bleibt Source-of-Truth für Auth, Circle wird **downstream provisioniert**. Fehler in der Circle-Provision blockieren den Signup nicht (User kann sich notfalls später manuell in Circle einloggen).

---

## Scope

**In-scope:**

### 1. Circle-API-Integration
- Circle Business-Plan API Setup (Token in `CIRCLE_API_TOKEN` env)
- Community-ID-Konfiguration (`CIRCLE_COMMUNITY_ID`)
- Default-Space-ID für Neumitglieder (`CIRCLE_DEFAULT_SPACE_ID` — Welcome-Space)
- Helper `packages/circle/src/client.ts` oder `apps/website/lib/circle.ts`:
  - `createMember(email, name, metadata)` → Circle-Member-ID
  - `generateSsoUrl(memberId, redirectPath)` → one-time-use SSO-Link
  - `getMemberByEmail(email)` → Circle-Member-ID | null

### 2. Signup-Flow Server-Action
- `apps/website/app/api/auth/signup/route.ts` 503-Block entfernen
- Neue Logic in Server-Action:
  ```
  1. Zod-Validate Input
  2. Supabase createUser (PKCE-Flow wie Phase 12+13)
  3. Circle createMember (with try/catch — non-blocking)
  4. Speicher Circle-Member-ID in Supabase user.raw_user_meta_data.circle_member_id
  5. Trigger Supabase-Confirmation-Mail (React Email Template aus Phase 17)
  6. Template injected den Circle-SSO-Link in die Mail (neben der Confirm-URL)
  7. Return Success
  ```

### 3. Email-Template-Update
- `apps/website/emails/templates/confirm.tsx` (aus Phase 17) erweitern:
  - CTA „Zur Community →" zusätzlich zum Bestehenden
  - Oder: **ein** CTA „Loslegen →" der auf Confirm-URL zeigt, und nach Confirm-Success redirected zu Circle
- Empfehlung: **Single-CTA-Flow** (Option B) — simpler, weniger Optionen für User.

### 4. Confirm-Route-Update
- `apps/website/app/auth/confirm/route.ts` (aus Phase 12+13) ergänzen:
  - Nach erfolgreichem `verifyOtp`: lese `circle_member_id` aus User-Metadata
  - Generate Circle-SSO-URL via `generateSsoUrl()`
  - Redirect zu Circle-SSO-URL statt der Default-Post-Confirm-Page
  - Fallback: wenn keine `circle_member_id` (z.B. Circle-Provision war failed), redirect zu `/dashboard` oder `/` mit Banner „Verbinde dich mit der Community →"

### 5. Waitlist-Migration
- Wenn `/join` in Phase 23 als Waitlist-Pattern implementiert wurde:
  - Migration-Script: alle Waitlist-Einträge bekommen eine Mail „Wir sind live — bestätige deinen Account" mit neuem Signup-Link
  - Oder: Supabase-User werden direkt mit `email_confirmed_at=null` angelegt + Mail-Send triggered
- Siehe Plan 23-D-10: V1-Waitlist-Code ist so strukturiert, dass Switch easy ist

### 6. Retry-Logic + Error-Handling
- Circle-API-Call failed: Signup trotzdem erfolgreich (Supabase-User existiert). Error wird in Sentry geloggt, Luca bekommt Mail-Alert, User kann später via Re-Provision-Script nachprovisioniert werden.
- Re-Provision-Script (Server-Action): `POST /api/admin/circle-reprovision` → nimmt User-Email, provisioniert Circle-Member, updated User-Metadata. Admin-gated (Magic-Link + Role-Check).

### 7. Testing
- E2E-Test mit Test-User:
  1. Signup auf `/join` mit neuer Email
  2. Confirm-Mail erhalten (Magic-Link + Circle-SSO-Link)
  3. Confirm-URL klicken → lande in Circle eingeloggt
  4. Verify Circle-Profil existiert mit korrekter Email
- Negativtests:
  - Circle-API down → Signup trotzdem erfolgreich, Fallback-Flow funktioniert
  - Duplicate-Email in Circle → `getMemberByEmail` gibt Member-ID zurück, kein neuer Member erstellt (idempotent)

**Out-of-scope:**
- **Google/Apple OAuth** — Backlog seit Phase 17, bleibt dort
- **Magic-Link-Login für existierende User** (nicht Signup-related, läuft bereits aus Phase 12)
- **Circle-Webhook-Listener** (User aktualisiert Circle-Profil → Supabase sync) — Roadmap, nicht nötig für V1
- **Admin-UI für User-Management** — Roadmap
- **Bulk-Import alter User** (die ~50 Legacy-User bleiben manuell verwaltet für V1, Migration kommt post-Launch falls gebraucht)
- **Finales Wording der Welcome-Mail** — Phase 27 Copy-Pass

---

## Decisions

- **D-01** — **Supabase bleibt Source-of-Truth für Auth.** Circle-Member ist Downstream-Resource, wird per Supabase-User-Metadata verknüpft (`circle_member_id` in `raw_user_meta_data`).
- **D-02** — **Soft-SSO via gleiche Email.** Circle Business-Plan-API erlaubt programmatic Member-Create + one-time-SSO-Links. Kein hartes SAML, kein User-Password-Sync.
- **D-03** — **Non-blocking Circle-Provision.** Wenn Circle-API failed, erfolgt Supabase-Signup trotzdem. User kann sich notfalls auch ohne Circle einloggen (z.B. auf tools.generation-ai.org).
- **D-04** — **Single-CTA in Confirm-Mail.** User klickt einen Link → Supabase session set + Redirect zu Circle. Kein „hier ist dein Confirm-Link und hier ist dein Circle-Link" Doppel-CTA. Klarheit schlägt Flexibilität.
- **D-05** — **Retry-Mechanismus manuell** (Re-Provision-Script), kein Auto-Retry im Signup-Flow. Grund: Circle-API-Outages sind selten, User dennoch anmelden ist wichtiger als alle Edge-Cases zu automatisieren.
- **D-06** — **Welcome-Space-Auto-Join:** Neue Circle-Members werden automatisch zu `CIRCLE_DEFAULT_SPACE_ID` (Welcome-Space oder #general) hinzugefügt. Verhindert „ich bin in Circle aber sehe nix"-Moment.
- **D-07** — **User-Metadata-Schema:** `raw_user_meta_data.circle_member_id: string | null` + `raw_user_meta_data.circle_provisioned_at: timestamp`. Historisch nachvollziehbar.
- **D-08** — **Token-Security:** `CIRCLE_API_TOKEN` nur in Vercel-Env, nie in Client-Code. Alle Circle-Calls über Server-Action oder Route-Handler.
- **D-09** — **Idempotency-Check:** `createMember` sollte `getMemberByEmail` vor Create ausführen. Wenn Member existiert (z.B. Legacy-User) → skip Create, nur SSO-Link generieren. Verhindert Duplicate-Members bei Race-Conditions.
- **D-10** — **Sentry-Integration:** alle Circle-API-Errors werden in Sentry geloggt mit Email + Timestamp, ohne Personal-Data über das hinaus. Luca bekommt Sentry-Slack-Notify bei Failure-Rate > 5%.
- **D-11** — **Launch-Decision bleibt Phase 27.** Phase 25 liefert die Tech-Pipeline, Luca entscheidet in Phase 27 ob Signup live geht (Signup-Reactivation-Gate).

---

## Success Criteria

- [ ] `packages/circle` oder `apps/website/lib/circle.ts` existiert mit Helpers (createMember, getMemberByEmail, generateSsoUrl)
- [ ] `CIRCLE_API_TOKEN`, `CIRCLE_COMMUNITY_ID`, `CIRCLE_DEFAULT_SPACE_ID` in Vercel-Env
- [ ] `/api/auth/signup` 503-Block entfernt, Server-Action implementiert
- [ ] Supabase-User wird angelegt bei Signup
- [ ] Circle-Member wird provisioniert (idempotent) und zum Welcome-Space geaddet
- [ ] `circle_member_id` landet in Supabase `raw_user_meta_data`
- [ ] Confirm-Mail-Template enthält Single-CTA „Loslegen →"
- [ ] `/auth/confirm`-Route redirected zu Circle-SSO-URL nach verifyOtp
- [ ] Fallback bei fehlendem `circle_member_id`: Redirect zu `/` mit Banner
- [ ] Re-Provision-Script `POST /api/admin/circle-reprovision` funktioniert (admin-gated)
- [ ] Circle-API-Failure: Signup trotzdem erfolgreich, Sentry-Log, User kann sich einloggen
- [ ] Duplicate-Email-Case: kein Member-Duplikat, SSO-Link funktioniert
- [ ] E2E-Test mit Test-User durchläuft kompletten Flow (Signup → Mail → Click → Circle eingeloggt)
- [ ] Waitlist-Migration-Script funktioniert (wenn Phase 23 Waitlist-Pattern aktiv hat)
- [ ] Documentation in `docs/CIRCLE-INTEGRATION.md` (wie Auth-Flow-Doc aus Phase 13)
- [ ] Rate-Limits auf Signup-Endpoint aktiv (Upstash, konsistent mit Phase 23)

---

## Resolved Open Questions (2026-04-24, autonomous --interactive)

Alle 9 originalen offenen Fragen + 2 Ergänzungen wurden vor Plan-Dispatch geklärt:

- **Q1 Circle-API-Token** — Business-Plan aktiv, Admin-Token vorhanden. In Vercel-Env einspielen (prod + preview + dev).
- **Q2 Community/Space-IDs** — Circle-MCP verfügbar (`mcp__aae5c88c-*`), IDs werden vom Planner/Executor via MCP live discovered statt hardcoded.
- **Q3 Member-Role** — Standard `member` beim Provisioning. Upgrades via Circle-Admin manuell.
- **Q4 SSO-Link-TTL** — **7 Tage** (matcht Supabase-Confirm-Link).
- **Q5 Legacy-User-Migration** — **V1 manuell**: bleiben in Dual-Login, Re-Provision-Script deckt Edge-Cases. Bulk-Migration im Backlog.
- **Q6 Admin-Reprovision-Auth** — **Magic-Link + Role-Check** (Phase-17-Pattern, konsistent mit Admin-Tools).
- **Q7 Mail-Template-Branching** — **V1 einheitlich**, ein Template für alle Sources. Personalisierung in Phase 27.
- **Q8 Monitoring** — **Sentry reicht** für V1. Slack-Webhook nicht in Scope.
- **Q9 Profile-Pre-Fill** — **Nur Email + Name** an Circle. Uni/Status/Motivation bleiben in Supabase-Metadata (unsere Seite).
- **Q10 Waitlist-Migration (Ergänzung)** — **Re-Invite-Mail-Script** post-Launch: Waitlist-Einträge bekommen Mail "Wir sind live — hier ist dein Account-Link". Einmalig, kein Auto-Trigger.
- **Q11 Signup-Reactivation-Gate (Ergänzung)** — **Env-Var Feature-Flag `SIGNUP_ENABLED=true|false`**. Default false, Luca flippt in Phase 27 ohne Code-Deploy.

**UI-SPEC-Gate:** Übersprungen — Phase 25 ist 90% Backend. UI-Work (Confirm-Route-Redirect, Fallback-Banner) ist minimal und nutzt bestehende DS-Tokens aus Phase 20.6. Confirm-Mail-Template aus Phase 17 existiert bereits.

---

## Release

Minor innerhalb Milestone v4.0. **Kern-UX-Win**, verdient eigenen Changeset-Eintrag („unified signup via Circle SSO") und prominente Erwähnung in Release-Notes. Nach Phase 25 ist `/join` funktional live-fähig (Signup-Reactivation-Gate bleibt Phase 27).
