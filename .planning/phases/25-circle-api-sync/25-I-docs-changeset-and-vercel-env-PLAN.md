---
phase: 25
plan: I
slug: docs-changeset-and-vercel-env
type: execute
wave: 4
depends_on:
  - 25-A
  - 25-B
  - 25-C
  - 25-D
  - 25-E
  - 25-F
  - 25-G
  - 25-H
files_modified:
  - docs/CIRCLE-INTEGRATION.md
  - docs/ARCHITECTURE.md
  - docs/API.md
  - .changeset/phase-25-circle-api-sync.md
  - .planning/phases/25-circle-api-sync/25-HUMAN-UAT.md
autonomous: false
requirements:
  - R6.1
  - R6.4
  - R6.6
must_haves:
  truths:
    - "`docs/CIRCLE-INTEGRATION.md` ist vollständig: Architektur-Überblick + Flow-Diagramm + Setup + Email-Template-Import (aus Plan C) + Waitlist-Re-Invite-Runbook (aus Plan G) + Troubleshooting (Fallback-Flow, Reprovision, Sentry-Dashboard-Filter)."
    - "`docs/ARCHITECTURE.md` erwähnt Phase 25 in System-Overview (Unified-Signup-Box zwischen Website und Circle), Datenflüsse (user_circle_links FK + raw_user_meta_data.circle_member_id)."
    - "`docs/API.md` dokumentiert `POST /api/auth/signup` + `POST /api/admin/circle-reprovision` mit Request/Response-Shapes + Auth-Anforderungen + Rate-Limits + Feature-Flag."
    - "Changeset `.changeset/phase-25-circle-api-sync.md` mit Type `minor` (matches Milestone-v4.0) und Linked-Packages (`website` + `tools-app` per pnpm-workspace config `linked`), Text referenziert Kern-UX-Win."
    - "`25-HUMAN-UAT.md` listet alle manuellen Steps für Launch: Vercel-Env-Push, Supabase-Dashboard-Template-Import, Circle-MCP-Discovery (Community-ID + Space-ID), Sentry-DSN-Provisioning, Test-Account-E2E-Walkthrough, Waitlist-Re-Invite-Runbook-Exec."
    - "Vercel-Env-Push-Schritt ist als klare Command-Liste dokumentiert (nicht automatisch gepusht — Executor hat keine Vercel-MCP-Rechte für Secret-Push ohne explizite Freigabe)."
    - "Keine PLACEHOLDER-Values in committed docs — entweder echte Werte oder expliziter `<will-be-set-by-luca>`-Marker."
  artifacts:
    - path: "docs/CIRCLE-INTEGRATION.md"
      provides: "Vollständige Phase-25-Dokumentation (Architektur + Runbooks)"
      exports: []
    - path: ".changeset/phase-25-circle-api-sync.md"
      provides: "Changelog-Entry für Release"
      exports: []
    - path: ".planning/phases/25-circle-api-sync/25-HUMAN-UAT.md"
      provides: "Checkliste für Luca — was manuell vor Launch zu erledigen"
      exports: []
  key_links: []
---

<objective>
Alle Code + Tests existieren — jetzt wird dokumentiert und geshipped. Plan I ist der letzte Nicht-Code-Schritt: Docs-Konsolidierung, Changeset für Release, HUMAN-UAT-Checkliste.

Purpose: Make Phase 25 shippable + onboardable. Luca hat einen klaren Launch-Path.
Output: 3 Doc-Files + Changeset + HUMAN-UAT-Artifact.
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/phases/25-circle-api-sync/25-CONTEXT.md
@docs/ARCHITECTURE.md
@docs/API.md
@docs/DEPLOYMENT.md
@.planning/phases/23-join-flow/23-HUMAN-UAT.md
@.changeset/

<interfaces>
**Changeset-Shape** (via `pnpm changeset` interactive, oder manuell):
```yaml
---
"@genai/website": minor
"@genai/auth": patch
"@genai/emails": patch
---

unified signup via Circle SSO (Phase 25)
```

Note: `@genai/circle` ist neu (0.0.1), kein Changeset-Bump. `@genai/config` ist ignored per `.changeset/config.json`.
</interfaces>

<environment_notes>
- Vercel-MCP (`mcp__0363308b-*`) kann Env-Vars **lesen** und **setzen**. Aber Phase 25 Tokens (Circle-API-Token, Sentry-DSN) sind Secrets, die der Executor nicht kennt — Luca muss sie selbst einspielen.
- Circle-MCP (`mcp__aae5c88c-*`) kann Community-ID + Space-IDs live discovern. Der Executor kann das im Plan-I-Run tun und die gefundenen IDs in CIRCLE-INTEGRATION.md dokumentieren (nicht in git-committed Env-Files!). Alternative: Luca macht es selbst.
- `.changeset/config.json` hat `"linked": [["@genai/website", "@genai/tools-app"]]` — beide werden zusammen versioniert.
</environment_notes>
</context>

<threat_model>
Plan I ist 100% Docs — keine neuen exposure surfaces. Einzige Sorge: Tokens in Docs committen.

**Mitigation:**
- Alle Real-Values (API-Tokens, DSNs, Community-IDs) landen **nicht** in CIRCLE-INTEGRATION.md oder ARCHITECTURE.md. Dokumentiert als "siehe Vercel Env-Vars" + Link.
- Gefundene Circle-Community-ID + Space-IDs sind **nicht-secret** (public-readable aus Circle selbst), dürfen dokumentiert werden — aber als Konvention: in `docs/` trotzdem nur als Beispiel nennen, nicht als einzige Source of Truth.
</threat_model>

<tasks>

<task type="auto">
  <name>Task I1: CIRCLE-INTEGRATION.md vollständigen</name>
  <files>docs/CIRCLE-INTEGRATION.md</files>
  <read_first>
    - `docs/CIRCLE-INTEGRATION.md` (Plan C + G haben bereits Sektionen ergänzt)
    - `.planning/phases/25-circle-api-sync/25-CONTEXT.md` (alle Decisions + Resolved Questions)
  </read_first>
  <action>
Ergänze `docs/CIRCLE-INTEGRATION.md` am Anfang (before existing sections) folgende Kapitel:

```markdown
# Circle-Integration (Phase 25)

> Unified Signup: User meldet sich auf `/join` an → eine Mail → ein Klick → in Circle eingeloggt.

## Architektur-Überblick

```
┌────────────┐         ┌──────────────┐
│  /join     │  POST   │   Server-    │
│  Form      ├────────▶│   Action     │
└────────────┘         │ submitJoin-  │
                       │ Signup       │
                       └──────┬───────┘
                              │
               ┌──────────────┼──────────────┐
               ▼              ▼              ▼
       ┌────────────┐  ┌──────────────┐  ┌──────────┐
       │ Supabase   │  │  Circle-API  │  │ Supabase │
       │createUser  │  │ createMember │  │  Email   │
       │(metadata)  │  │ + addToSpace │  │ Trigger  │
       └────────────┘  └──────┬───────┘  └────┬─────┘
                              │               │
                              ▼               ▼
                       ┌──────────────┐  ┌─────────────┐
                       │user_circle_  │  │  Confirm-   │
                       │  links       │  │  Mail →     │
                       │(Supabase-DB) │  │  user inbox │
                       └──────────────┘  └────┬────────┘
                                               │
                                               ▼
                                        ┌─────────────────┐
                                        │ /auth/confirm   │
                                        │ verifyOtp       │
                                        │ → Circle-SSO    │
                                        │ → Community     │
                                        └─────────────────┘
```

**Source of Truth:** Supabase Auth (D-01). Circle ist Downstream-Resource.
**Link:** `user_circle_links.user_id FK auth.users.id` + `raw_user_meta_data.circle_member_id` (Mirror).
**Non-Blocking:** Circle-Fehler blockieren Signup nicht (D-03). Retry via Admin-Route.

## Key Files

| File | Purpose |
|------|---------|
| `apps/website/app/actions/signup.ts` | Haupt-Server-Action (Signup-Orchestrator) |
| `apps/website/app/actions/waitlist.ts` | Router V1↔V2 (Feature-Flag SIGNUP_ENABLED) |
| `apps/website/app/auth/confirm/route.ts` | PKCE Confirm + SSO-Redirect |
| `apps/website/app/api/auth/signup/route.ts` | POST-Endpoint (Wrapper um Server-Action) |
| `apps/website/app/api/admin/circle-reprovision/route.ts` | Admin-Retry-Endpoint |
| `apps/website/app/(fallback)/welcome/page.tsx` | Fallback-UX wenn Circle-SSO scheitert |
| `packages/circle/` | Circle-API-Client (createMember, generateSsoUrl, etc.) |
| `packages/emails/src/templates/confirm-signup.tsx` | Single-CTA-Confirm-Mail (Supabase-Template) |
| `supabase/migrations/20260425000001_circle_profile_fields.sql` | `user_circle_links` Table |

## Setup (Pre-Launch)

### 1. Env-Vars in Vercel

Alle 6 Env-Vars (aus `docs/DEPLOYMENT.md` Circle-Section):

```bash
CIRCLE_API_TOKEN=<...>             # Circle-Admin → Developer → Generate Token
CIRCLE_COMMUNITY_ID=<...>          # Circle-MCP get_community or Admin-UI
CIRCLE_DEFAULT_SPACE_ID=<...>      # Circle-MCP list_spaces (pick Welcome)
CIRCLE_COMMUNITY_URL=https://community.generation-ai.org
SIGNUP_ENABLED=false               # flip to true in Phase 27
ADMIN_EMAIL_ALLOWLIST=luca@generation-ai.org   # comma-separated
SENTRY_DSN_WEBSITE=<...>           # Sentry Project → Settings → Client Keys
NEXT_PUBLIC_SENTRY_DSN_WEBSITE=<same as above>  # public-version
```

Commands:
```bash
# Alle 8 Vars in prod+preview+dev-scope pushen (außer Service-Role-Key — der ist bereits da)
vercel env add CIRCLE_API_TOKEN production preview development
vercel env add CIRCLE_COMMUNITY_ID production preview development
# ... etc
```

Oder via Vercel-MCP: `mcp__0363308b-*__list_projects` → `add_env` (Executor kennt die Werte nicht, siehe HUMAN-UAT).

### 2. Supabase-Migration

```bash
# Via Supabase-MCP (recommended):
mcp__1e7c6bb1-*__apply_migration --project_ref wbohulnuwqrhystaamjc \
  --name circle_profile_fields \
  --query <contents of 20260425000001_circle_profile_fields.sql>

# Or via CLI (needs supabase link):
supabase db push --project-ref wbohulnuwqrhystaamjc
```

### 3. Supabase-Email-Template einspielen

Siehe Sektion "Email-Templates in Supabase-Dashboard einspielen" weiter unten (aus Plan C).

### 4. Circle-Welcome-Space prüfen

Via Circle-MCP:
```
mcp__aae5c88c-*__list_spaces  → find "Welcome" or "#general"  → note space.id
```
ID in `CIRCLE_DEFAULT_SPACE_ID` Env-Var eintragen (prod+preview+dev).

### 5. Feature-Flag-Gate (Phase 27 Launch-Day)

```bash
# In Vercel-Dashboard:
vercel env rm SIGNUP_ENABLED production
vercel env add SIGNUP_ENABLED production  # value: true
# Trigger redeploy (Vercel auto-detects env changes)
```

## Troubleshooting

### Signup scheitert mit generic error

1. Vercel-Logs checken: `vercel logs <url>`
2. Sentry-Dashboard → Filter `tag:circle-api:true` → letzten Event prüfen
3. Wenn `CircleApiError.code === 'UNAUTHORIZED'`: Token rotieren (Circle-Admin → Tokens)
4. Wenn `CircleApiError.code === 'RATE_LIMITED'`: Kurz warten, Circle hat Tempo-Limits

### User ohne circle_member_id

1. Admin-Reprovision-Route callen:
```bash
curl -X POST https://generation-ai.org/api/admin/circle-reprovision \
  -H "Content-Type: application/json" \
  -H "Cookie: <admin-session-cookie>" \
  -d '{"email": "user@example.com"}'
```
2. Response: `{ ok: true, circleMemberId: "...", alreadyExists: false|true }`
3. Falls 502 → siehe Sentry-Event für Details

### Fallback-Welcome-Page triggert für alle User

Das ist ein Indikator dass **jeder** Signup Circle-Fehler hat. Check:
1. `CIRCLE_API_TOKEN` gesetzt? Korrekt?
2. Circle-Community-Plan aktiv? (Business erforderlich für API)
3. Token-Scopes (Circle-Dashboard → Token → Permissions)

## Monitoring

- **Sentry:** Tag-Filter `circle-api:true` + `op:createMember|generateSsoUrl|addMemberToSpace|adminReprovision`.
- **Better Stack:** HTTP-Check auf `/api/auth/signup` → sollte 503 (default) oder 200 (flipped) liefern, nie 500.
- **Supabase:** Monitor `auth.users` count vs `user_circle_links` count — grosser Drift = Circle-Sync kaputt.

(Email-Templates-Sektion + Waitlist-Re-Invite-Sektion wurden in Plans C + G bereits ergänzt — vor diesen neuen Sektionen einfügen, damit die neue Architektur-Übersicht ganz oben steht.)
```

Wichtig: Nicht einfach an das File hängen — **ordne um** so dass:
1. `# Circle-Integration (Phase 25)` Top-Heading
2. `## Architektur-Überblick`
3. `## Key Files`
4. `## Setup (Pre-Launch)`
5. `## Email-Templates in Supabase-Dashboard einspielen` (aus Plan C)
6. `## Waitlist Re-Invite (Q10)` (aus Plan G)
7. `## Troubleshooting`
8. `## Monitoring`
  </action>
  <verify>
    <automated>grep -q "Circle-Integration (Phase 25)" docs/CIRCLE-INTEGRATION.md && grep -q "Architektur-Überblick" docs/CIRCLE-INTEGRATION.md && grep -q "Key Files" docs/CIRCLE-INTEGRATION.md && grep -q "Setup (Pre-Launch)" docs/CIRCLE-INTEGRATION.md && grep -q "Troubleshooting" docs/CIRCLE-INTEGRATION.md && grep -q "Monitoring" docs/CIRCLE-INTEGRATION.md && grep -q "Waitlist Re-Invite" docs/CIRCLE-INTEGRATION.md && grep -q "Email-Templates in Supabase-Dashboard" docs/CIRCLE-INTEGRATION.md</automated>
  </verify>
  <acceptance_criteria>
    - Alle 8 Sektionen (ToC) vorhanden + in sinnvoller Reihenfolge
    - Keine echten Tokens / DSNs im File
    - Commands copy-pasteable
    - Troubleshooting-Sektion mappped zu Sentry-Tags
  </acceptance_criteria>
  <done>Doc ist Single-Source-of-Truth für Phase 25.</done>
</task>

<task type="auto">
  <name>Task I2: ARCHITECTURE.md + API.md ergänzen</name>
  <files>docs/ARCHITECTURE.md, docs/API.md</files>
  <read_first>
    - `docs/ARCHITECTURE.md` (Struktur-Check)
    - `docs/API.md` (Endpoint-Doc-Pattern — match style)
  </read_first>
  <action>
**ARCHITECTURE.md:** Einen `## Phase 25 — Unified Signup`-Abschnitt ergänzen (nach Data-Model-Section):

```markdown
## Phase 25 — Unified Signup

Flow: User → `/join` Form → Server-Action `submitJoinSignup` → Supabase createUser + Circle createMember + Mail-Trigger → User-Inbox → Click → `/auth/confirm` → verifyOtp + SSO-Redirect → Circle-Community.

**Tables:**
- `auth.users` (Supabase-managed)
- `public.user_circle_links` (new — FK auth.users)
- `public.waitlist` (Phase-23-legacy, superseded by Phase-25, Re-Invite via script)

**Key-Code:** Siehe `docs/CIRCLE-INTEGRATION.md` → Key Files Table.

**Feature-Flag:** `SIGNUP_ENABLED` env var (default `false` = returns 503).
```

**API.md:** Zwei neue Endpoint-Blöcke ergänzen:

```markdown
### POST /api/auth/signup

Unified signup endpoint. Feature-flagged (SIGNUP_ENABLED env var).

**Auth:** None (public, rate-limited 5/15min per IP).

**Request** (`multipart/form-data` or `application/x-www-form-urlencoded`):
```
email=user@example.com
name=Jane Doe
university=TU Berlin
study_program=Informatik        (optional)
marketing_opt_in=on              (optional)
consent=on                       (required)
redirect_after=/join/welcome     (optional, same-origin path)
status=student                   (optional: student | pre-studium | early-career)
motivation=Karriere              (optional)
level=3                          (optional: 1-5)
website=                         (honeypot — must be empty)
```

**Response:**
- `200 { ok: true }` — success (user created, mail sent)
- `400 { ok: false, error, fieldErrors? }` — validation failed
- `429 { ok: false, error }` — rate-limit
- `503 { error }` — SIGNUP_ENABLED=false

**Idempotency:** Duplicate email returns `{ ok: true }` (no-leak, no re-send).

### POST /api/admin/circle-reprovision

Admin-only: Retry Circle provisioning for a user whose signup-time Circle call failed.

**Auth:** Session required + (user_metadata.role === 'admin' OR email in ADMIN_EMAIL_ALLOWLIST env).
**Rate-limit:** 20/15min per admin-user-id.

**Request** (`application/json`):
```json
{ "email": "user@example.com" }
```

**Response:**
- `200 { ok: true, circleMemberId, alreadyExists }`
- `400` — invalid body / content-type
- `401` — not authenticated
- `403` — not admin
- `404` — user not found
- `429` — rate-limited
- `502` — Circle API failed (includes `code` + `correlationId`)
```
  </action>
  <verify>
    <automated>grep -q "Phase 25 — Unified Signup" docs/ARCHITECTURE.md && grep -q "user_circle_links" docs/ARCHITECTURE.md && grep -q "POST /api/auth/signup" docs/API.md && grep -q "POST /api/admin/circle-reprovision" docs/API.md && grep -q "SIGNUP_ENABLED" docs/API.md</automated>
  </verify>
  <acceptance_criteria>
    - ARCHITECTURE.md hat Phase-25-Abschnitt
    - API.md hat 2 neue Endpoint-Blöcke mit Request/Response/Auth
    - Response-Codes vollständig aufgelistet
  </acceptance_criteria>
  <done>Haupt-Doku reflektiert Phase 25.</done>
</task>

<task type="auto">
  <name>Task I3: Changeset</name>
  <files>.changeset/phase-25-circle-api-sync.md</files>
  <read_first>
    - `.changeset/config.json` (linked packages)
    - Bestehende Changesets als Format-Referenz
  </read_first>
  <action>
Erstelle `.changeset/phase-25-circle-api-sync.md`:

```markdown
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
- Admin-Reprovision-Endpoint für Retry-Cases
- Waitlist-Re-Invite-Script für Phase-23-Migration
- Feature-Flag `SIGNUP_ENABLED` (default `false`) — Phase 27 flippt zum Launch

**Breaking:** Keine öffentliche API geändert. `submitJoinWaitlist` Server-Action bleibt kompatibel (Router zwischen V1-Waitlist und V2-Signup).

**Neu installed:** `@genai/circle` workspace package (Circle-API-Client). Nicht extern-versioniert (private).

**DB-Migration:** `supabase/migrations/20260425000001_circle_profile_fields.sql` — legt `public.user_circle_links` an.

**Env-Vars (neu, müssen in Vercel eingespielt werden):**
- `CIRCLE_API_TOKEN`
- `CIRCLE_COMMUNITY_ID`
- `CIRCLE_DEFAULT_SPACE_ID`
- `CIRCLE_COMMUNITY_URL`
- `SIGNUP_ENABLED` (default `false`)
- `ADMIN_EMAIL_ALLOWLIST`
- `SENTRY_DSN_WEBSITE` + `NEXT_PUBLIC_SENTRY_DSN_WEBSITE`
```
  </action>
  <verify>
    <automated>test -f .changeset/phase-25-circle-api-sync.md && grep -q '"@genai/website": minor' .changeset/phase-25-circle-api-sync.md && grep -q "Kern-UX-Win" .changeset/phase-25-circle-api-sync.md && grep -q "SIGNUP_ENABLED" .changeset/phase-25-circle-api-sync.md</automated>
  </verify>
  <acceptance_criteria>
    - Changeset-File existiert mit korrektem Frontmatter
    - minor-bump für @genai/website
    - Kern-Features + Breaking-Notes + Env-Vars gelistet
  </acceptance_criteria>
  <done>Changeset ready für `pnpm version` bei Milestone-Release.</done>
</task>

<task type="manual">
  <name>Task I4: HUMAN-UAT-Checkliste für Luca</name>
  <files>.planning/phases/25-circle-api-sync/25-HUMAN-UAT.md</files>
  <read_first>
    - `.planning/phases/23-join-flow/23-HUMAN-UAT.md` (Format-Referenz)
    - Alle anderen Plan-Files (alle HUMAN-Tasks sammeln)
  </read_first>
  <action>
Erstelle `.planning/phases/25-circle-api-sync/25-HUMAN-UAT.md`:

```markdown
# Phase 25 — HUMAN-UAT Checkliste

> Manuelle Steps die Luca vor/während/nach dem Phase-27-Launch erledigt. Alle Code-Änderungen + Automated-Tests sind durch die Plans A-H abgedeckt.

---

## Pre-Launch (vor Phase 27)

### Circle-Setup

- [ ] **Circle Business-Plan aktiv:** In Circle-Admin → Billing prüfen dass API-Access enabled ist.
- [ ] **Circle-Admin-Token generieren:**
  - Circle-Admin → Settings → Developer → Generate Token
  - Scope: Full admin (oder minimum: read members, create members, create SSO tokens, add to space)
  - Token kopieren, nicht verlieren (erscheint nur einmal)
- [ ] **Community-ID notieren:**
  ```
  Via Circle-MCP: mcp__aae5c88c-*__get_community
  Oder: Circle-Admin → Settings → Developer → Community ID
  ```
- [ ] **Welcome-Space-ID notieren:**
  ```
  Via Circle-MCP: mcp__aae5c88c-*__list_spaces
  Pick the space that should be default-join (e.g. "Welcome" or "#general")
  ```

### Vercel-Env-Push

- [ ] 4 Circle-Vars in Vercel (prod + preview + dev):
  ```bash
  vercel env add CIRCLE_API_TOKEN            # alle 3 scopes
  vercel env add CIRCLE_COMMUNITY_ID
  vercel env add CIRCLE_DEFAULT_SPACE_ID
  vercel env add CIRCLE_COMMUNITY_URL        # https://community.generation-ai.org
  ```
- [ ] `SIGNUP_ENABLED=false` für prod, `=true` für preview+dev:
  ```bash
  vercel env add SIGNUP_ENABLED production   # false
  vercel env add SIGNUP_ENABLED preview      # true
  vercel env add SIGNUP_ENABLED development  # true
  ```
- [ ] `ADMIN_EMAIL_ALLOWLIST` in prod+preview:
  ```bash
  vercel env add ADMIN_EMAIL_ALLOWLIST       # luca@generation-ai.org
  ```
- [ ] Sentry-DSN:
  - [ ] Sentry → Projects → Create "generation-ai-website" → Copy DSN
  - [ ] `vercel env add SENTRY_DSN_WEBSITE` (prod+preview)
  - [ ] `vercel env add NEXT_PUBLIC_SENTRY_DSN_WEBSITE` (prod+preview)

### Supabase-Setup

- [ ] **Migration applizieren:**
  ```
  Via Supabase-MCP: mcp__1e7c6bb1-*__apply_migration
  project_ref: wbohulnuwqrhystaamjc
  name: circle_profile_fields
  ```
- [ ] **user_circle_links Tabelle via MCP `list_tables` verifizieren.**
- [ ] **Email-Template in Supabase-Dashboard einspielen:**
  - `pnpm --filter @genai/emails email:export` lokal runnen
  - `apps/website/emails/dist/confirm-signup.html` öffnen, Inhalt kopieren
  - Supabase-Dashboard → Authentication → Email Templates → Confirm signup → paste + save
  - Subject: `Willkommen bei Generation AI 👋`

### Preview-E2E

- [ ] Preview-URL öffnen (mit SIGNUP_ENABLED=true in preview)
- [ ] `/join` aufrufen, Form mit Test-Email (z.B. luca+test1@generation-ai.org) ausfüllen, submitten
- [ ] Check: Mail landet im Postfach
- [ ] Click "Loslegen →" → lande in Circle eingeloggt (kein zweiter Login-Prompt)
- [ ] Circle-Admin → Members: Test-User existiert, ist in Welcome-Space
- [ ] Sentry: keine Events (happy-path sollte clean sein)
- [ ] Supabase-SQL: `SELECT * FROM auth.users WHERE email = '...'` → user_metadata.circle_member_id ist gesetzt
- [ ] Supabase-SQL: `SELECT * FROM user_circle_links WHERE user_id = '...'` → Row existiert

### Negativtest Preview

- [ ] `CIRCLE_TEST_FORCE_FAIL=500` in Preview-Env setzen (temporär)
- [ ] Redeploy
- [ ] Neuer Signup mit anderer Test-Email → `{ ok: true }`, Mail kommt
- [ ] Confirm-Link klicken → lande auf `/welcome?circle=pending` mit Banner "Zur Community →"
- [ ] Sentry: Event mit Tag `circle-api:true` + `op:createMember` gelandet
- [ ] `CIRCLE_TEST_FORCE_FAIL` wieder entfernen

---

## Launch-Day (Phase 27)

- [ ] Code-Freeze: alle geplanten Phases für v4.0 sind merged
- [ ] Release-Notes finalisiert
- [ ] `SIGNUP_ENABLED=true` in Vercel production setzen
- [ ] Redeploy (Vercel auto-trigger bei env-change)
- [ ] Production-E2E (mit echter Test-Email):
  - [ ] Signup-Flow end-to-end
  - [ ] Sentry sauber, keine Flood
- [ ] Änderung in Better Stack / Monitor: `/api/auth/signup` sollte 200 zurückgeben (nicht mehr 503)

## Post-Launch (Phase 27+)

- [ ] Waitlist-Re-Invite-Script ausführen (siehe `docs/CIRCLE-INTEGRATION.md` Runbook):
  - [ ] Dry-Run: `pnpm tsx scripts/waitlist-reinvite.ts --dry-run`
  - [ ] Limit-1-Run: `pnpm tsx scripts/waitlist-reinvite.ts --limit 1` (an luca+test@)
  - [ ] Real-Run: `pnpm tsx scripts/waitlist-reinvite.ts`
  - [ ] Verify `notified_at` in DB is filled
- [ ] Sentry-Dashboard-Check: 24h nach Launch, circle-api-Events-Rate prüfen
  - [ ] Falls >5% Failure-Rate: Alert-Rule in Sentry aktivieren (R6.7-Followup)
- [ ] Check Circle-Dashboard: Neue Member-Count matched Supabase-Signup-Count ±1%

## Rollback-Plan

Wenn Phase 25 live Probleme macht:

1. **Sofort-Fallback:** `SIGNUP_ENABLED=false` in Vercel prod setzen. Signup returnt wieder 503, bestehende User sind nicht betroffen.
2. **Tiefer-Rollback:** Git-Revert der Phase-25-Commits. Migration `user_circle_links` bleibt (safe, leer wenn kein neuer Signup).
3. **Circle-Cleanup:** Falls Test-User oder falsch-provisionierte User in Circle → Circle-Admin → Members → manual delete.
```
  </action>
  <verify>
    <automated>test -f .planning/phases/25-circle-api-sync/25-HUMAN-UAT.md && grep -q "Pre-Launch" .planning/phases/25-circle-api-sync/25-HUMAN-UAT.md && grep -q "Launch-Day (Phase 27)" .planning/phases/25-circle-api-sync/25-HUMAN-UAT.md && grep -q "Post-Launch" .planning/phases/25-circle-api-sync/25-HUMAN-UAT.md && grep -q "Rollback-Plan" .planning/phases/25-circle-api-sync/25-HUMAN-UAT.md && grep -q "CIRCLE_API_TOKEN" .planning/phases/25-circle-api-sync/25-HUMAN-UAT.md</automated>
  </verify>
  <acceptance_criteria>
    - 4 Sektionen: Pre-Launch / Launch-Day / Post-Launch / Rollback
    - Alle manuellen Steps aus Plans A-H gesammelt
    - Commands copy-pasteable
    - Negativtest mit `CIRCLE_TEST_FORCE_FAIL` beschrieben
  </acceptance_criteria>
  <done>Luca hat den kompletten Launch-Drehbuch.</done>
</task>

</tasks>

<verification>
**Automated:** grep-gates in tasks.

**Manual:** Luca liest das Doc-Set durch → keine offenen Fragen.
</verification>

<must_haves>
Siehe `must_haves` im Frontmatter oben.
</must_haves>
