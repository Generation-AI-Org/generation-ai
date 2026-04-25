---
phase: 25
plan: A
slug: supabase-migration-and-env
type: execute
wave: 1
depends_on: []
files_modified:
  - supabase/migrations/20260425000001_circle_profile_fields.sql
  - .env.example
  - apps/website/.env.example
  - docs/DEPLOYMENT.md
autonomous: true
requirements:
  - R6.4
  - R6.5
must_haves:
  truths:
    - "Neue Supabase-Migration `20260425000001_circle_profile_fields.sql` ergänzt `auth.users.raw_user_meta_data` um die erwarteten Keys via Comment + Doku (Schema ist Supabase-native JSONB, keine Column-Änderung nötig)."
    - "Migration legt optionale Tabelle `public.user_circle_links` an (uuid PK=user_id, circle_member_id text NOT NULL, circle_provisioned_at timestamptz, last_error text, last_error_at timestamptz, created_at timestamptz default now()) mit RLS service_role-only."
    - "FK `user_circle_links.user_id → auth.users.id ON DELETE CASCADE` hält Link-Daten synchron wenn User gelöscht wird."
    - "Unique-Index auf `user_circle_links.circle_member_id` verhindert Doppel-Links (Defense-in-Depth gegen Race-Conditions beim Reprovision)."
    - "RLS: nur `service_role` darf lesen/schreiben (wie Phase 23 `waitlist`). `anon`/`authenticated` haben keine Grants."
    - "Supabase-Migration wurde via `supabase db push` gegen das Linked-Project (ref: wbohulnuwqrhystaamjc) appliziert ODER — wenn CLI nicht verfügbar — via Supabase-MCP `apply_migration`-Tool appliziert. [BLOCKING]"
    - "`generate_typescript_types` wurde via Supabase-MCP ausgeführt und die `user_circle_links`-Types landen in `packages/auth/src/circle.ts` (oder bestehender Types-Datei) als exportierter TypeScript-Type."
    - "`.env.example` + `apps/website/.env.example` enthalten `CIRCLE_API_TOKEN=`, `CIRCLE_COMMUNITY_ID=`, `CIRCLE_DEFAULT_SPACE_ID=`, `CIRCLE_COMMUNITY_URL=`, `SIGNUP_ENABLED=false` mit inline-Kommentaren (Zweck + wo zu finden)."
    - "`docs/DEPLOYMENT.md` dokumentiert im Env-Var-Abschnitt die 5 neuen Vars (Scope prod+preview+dev, wer sie hat, wie man sie rotiert)."
    - "`SIGNUP_ENABLED=false` als Default dokumentiert (Q11 Feature-Flag): Luca flippt das in Phase 27 via Vercel-Dashboard, kein Code-Deploy nötig."
  artifacts:
    - path: "supabase/migrations/20260425000001_circle_profile_fields.sql"
      provides: "Tabelle `public.user_circle_links` + RLS + Indexe für Circle-Sync"
      exports: []
    - path: "packages/auth/src/circle.ts"
      provides: "TypeScript-Types für `user_circle_links` + Circle-Metadata-Shape in raw_user_meta_data"
      exports: ["UserCircleLink", "UserCircleLinkInsert", "CircleUserMetadata"]
    - path: ".env.example"
      provides: "Root-Env-Example mit Circle-Vars + SIGNUP_ENABLED"
      exports: []
    - path: "apps/website/.env.example"
      provides: "Website-Env-Example mit Circle-Vars + SIGNUP_ENABLED"
      exports: []
  key_links:
    - from: "public.user_circle_links"
      to: "auth.users"
      via: "FK user_id"
      pattern: "references auth\\.users"
---

<objective>
Supabase-Schema + Env-Vars aufsetzen als Fundament für alle anderen Wave-2-Plans. Neue Tabelle `user_circle_links` trackt Circle-Member-IDs + Provision-Status. Env-Vars werden dokumentiert (Vercel-Einspielung kommt in Plan I als HUMAN-UAT-Item, hier nur Doku).

Purpose: Alle nachfolgenden Plans (Circle-Client, Server-Action, Reprovision) brauchen das Schema + Env-Schema zum Compilen. Ohne diesen Plan geht nichts.
Output: Migration + Env-Doku + TypeScript-Types.
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/phases/25-circle-api-sync/25-CONTEXT.md
@.planning/phases/23-join-flow/23-01-supabase-waitlist-migration-PLAN.md
@supabase/migrations/20260424000001_waitlist.sql
@packages/auth/src/waitlist.ts
@packages/auth/src/index.ts
@docs/DEPLOYMENT.md

<interfaces>
```typescript
// Expected TypeScript types after this plan (packages/auth/src/circle.ts):

/** Shape of raw_user_meta_data keys written by Circle-Sync (informational — JSONB is untyped in DB). */
export interface CircleUserMetadata {
  circle_member_id?: string            // set when Circle provision succeeded
  circle_provisioned_at?: string       // ISO-8601 timestamp
  status?: 'student' | 'pre-studium' | 'early-career'  // carried from /join Step 1
  uni?: string
  motivation?: string
  level?: number
  // ... other /join metadata
}

/** Full row of public.user_circle_links (read shape). */
export interface UserCircleLink {
  user_id: string            // uuid, FK → auth.users.id
  circle_member_id: string
  circle_provisioned_at: string | null
  last_error: string | null
  last_error_at: string | null
  created_at: string
}

/** Insert payload — DB fills created_at. */
export interface UserCircleLinkInsert {
  user_id: string
  circle_member_id: string
  circle_provisioned_at?: string | null
  last_error?: string | null
  last_error_at?: string | null
}
```
</interfaces>

<environment_notes>
- Supabase-Projekt ist `wbohulnuwqrhystaamjc` (Prod). Lokale Entwicklung läuft typischerweise ohne Supabase-Container (Cloud-Dev).
- Supabase-MCP ist verfügbar: `mcp__1e7c6bb1-*__apply_migration`, `generate_typescript_types`, `list_tables`. Diese **bevorzugt** nutzen für Schema-Inspection + Push, weil `supabase` CLI hier nicht immer eingerichtet ist.
- Phase 23 `waitlist`-Tabelle bleibt bestehen — Plan G migriert deren Einträge, Plan A löscht sie **nicht**.
- Alle 5 Env-Vars existieren laut STATE.md in Vercel "nicht yet wired" bzw. müssen neu gesetzt werden. Plan I enthält das HUMAN-UAT-Item für den Vercel-MCP-Push.
</environment_notes>
</context>

<threat_model>
**Asset:** `public.user_circle_links` (User→Circle-Mapping, enthält PII-Link zu Circle-Membership).

**Threats (ASVS L1):**

1. **Unauthorized read via PostgREST (anon/authenticated).**
   - Mitigation: RLS enabled, default grants revoked von `anon`, `authenticated`. Only `service_role` (via `createAdminClient` in Server Actions) darf read/write.
   - Test: `curl -H "apikey: <anon-key>" https://<project>.supabase.co/rest/v1/user_circle_links` muss 401/403 liefern.

2. **Circle-Member-ID-Enumeration durch ID-Guessing.**
   - Mitigation: `circle_member_id` ist nicht vorhersagbar (Circle-side UUID). Zusätzlich: `user_id` ist UUID, kein Iterable.

3. **Orphan-Links bei User-Delete.**
   - Mitigation: FK `ON DELETE CASCADE` — wenn Supabase-User gelöscht wird, verschwindet der Circle-Link mit. (Das Circle-Account bleibt bestehen, dessen Löschung ist Phase-27-manual-process.)

4. **Secret-Leakage via Env-Example.**
   - Mitigation: `.env.example` enthält **nur** leere Placeholder (`CIRCLE_API_TOKEN=`) + Kommentare, **keine** echten Tokens. `CIRCLE_API_TOKEN` nie in Git (ist bereits `.gitignore`-covered via `.env.local`).

**Block on:** BLOCKER (`RLS disabled`, `anon grant`, `Token in plaintext`).
**Residual risk:** Timing-side-channels bei `circle_member_id`-Unique-Constraint (minimal — attacker braucht service_role-Key um das überhaupt zu triggern).
</threat_model>

<tasks>

<task type="auto">
  <name>Task A1: Supabase-Migration erstellen + applizieren</name>
  <files>supabase/migrations/20260425000001_circle_profile_fields.sql</files>
  <read_first>
    - `supabase/migrations/20260424000001_waitlist.sql` (RLS + Grant-Revoke-Pattern 1:1 übernehmen)
    - `.planning/phases/25-circle-api-sync/25-CONTEXT.md` D-07 (raw_user_meta_data-Schema) + D-09 (Idempotenz)
  </read_first>
  <action>
Erstelle `supabase/migrations/20260425000001_circle_profile_fields.sql` mit folgendem Inhalt:

```sql
-- Phase 25 — Circle-API-Sync: user_circle_links table
-- Tracks Circle-Member-ID + provision status per Supabase-User.
-- Source of truth for the Circle <→ Supabase link.
-- Complements raw_user_meta_data.circle_member_id (D-07) which is the
-- fast-path copy for session-based reads; this table is the authoritative
-- record including error history.

create table if not exists public.user_circle_links (
  user_id uuid primary key references auth.users(id) on delete cascade,
  circle_member_id text not null,
  circle_provisioned_at timestamptz,
  last_error text,
  last_error_at timestamptz,
  created_at timestamptz not null default now()
);

-- Prevent duplicate Circle-member mappings (defence-in-depth against race
-- conditions during reprovision).
create unique index if not exists user_circle_links_member_id_unique
  on public.user_circle_links (circle_member_id);

-- RLS
alter table public.user_circle_links enable row level security;

drop policy if exists "service_role_select_user_circle_links" on public.user_circle_links;
create policy "service_role_select_user_circle_links"
  on public.user_circle_links
  for select
  to service_role
  using (true);

drop policy if exists "service_role_all_user_circle_links" on public.user_circle_links;
create policy "service_role_all_user_circle_links"
  on public.user_circle_links
  for all
  to service_role
  using (true)
  with check (true);

comment on table public.user_circle_links is
  'Phase 25 Circle-API-Sync: Supabase↔Circle member mapping + provision status. Written by server action submitJoinSignup (apps/website/app/actions/signup.ts) + admin reprovision route via service_role. raw_user_meta_data.circle_member_id mirrors the latest successful provision for session-based reads.';

-- Revoke default public-schema grants from anon/authenticated.
revoke all on public.user_circle_links from anon, authenticated;
```

Nach File-Write:
1. Via Supabase-MCP `mcp__1e7c6bb1-*__apply_migration` applizieren (project_ref `wbohulnuwqrhystaamjc`), name: `circle_profile_fields`, query: Inhalt der SQL-Datei (ohne die Kommentar-Header, MCP nimmt nur DDL).
2. Falls MCP nicht verfügbar ist, fallback: `supabase db push --project-ref wbohulnuwqrhystaamjc` von repo-root.
3. Verify via `mcp__1e7c6bb1-*__list_tables` (schemas=["public"]): `user_circle_links` muss in der Liste auftauchen.

**[BLOCKING]** Wenn weder MCP noch CLI funktionieren, Task auf `autonomous: false` switchen und Luca pingen. Ohne applizierte Migration scheitern alle Downstream-Plans an fehlender Tabelle — Build/Types sehen aber grün aus (Types kommen aus `packages/auth/src/circle.ts`, nicht aus der Live-DB), das ist eine Nyquist-Falle.
  </action>
  <verify>
    <automated>test -f supabase/migrations/20260425000001_circle_profile_fields.sql && grep -q "create table if not exists public.user_circle_links" supabase/migrations/20260425000001_circle_profile_fields.sql && grep -q "references auth.users(id) on delete cascade" supabase/migrations/20260425000001_circle_profile_fields.sql && grep -q "enable row level security" supabase/migrations/20260425000001_circle_profile_fields.sql && grep -q "revoke all on public.user_circle_links from anon, authenticated" supabase/migrations/20260425000001_circle_profile_fields.sql && grep -q "service_role_all_user_circle_links" supabase/migrations/20260425000001_circle_profile_fields.sql</automated>
  </verify>
  <acceptance_criteria>
    - Migration-File existiert mit exaktem Namen `20260425000001_circle_profile_fields.sql`
    - `CREATE TABLE public.user_circle_links` vorhanden mit FK auf `auth.users(id)` + `ON DELETE CASCADE`
    - Unique-Index `user_circle_links_member_id_unique` auf `circle_member_id`
    - RLS enabled + service_role-Policies (select + all) + anon/authenticated grants revoked
    - Migration gegen Prod-DB appliziert — `list_tables` zeigt `public.user_circle_links`
    - Comment auf Table dokumentiert Usage
  </acceptance_criteria>
  <done>Schema live. Downstream-Plans können gegen die Tabelle schreiben.</done>
</task>

<task type="auto">
  <name>Task A2: TypeScript-Types für user_circle_links + CircleUserMetadata</name>
  <files>packages/auth/src/circle.ts, packages/auth/src/index.ts</files>
  <read_first>
    - `packages/auth/src/waitlist.ts` (Type-Pattern 1:1 übernehmen: Row + Insert + JSDoc-Kommentare)
    - `packages/auth/src/index.ts` (Export-Stelle, Pattern: `export type { ... } from './waitlist'`)
  </read_first>
  <action>
Erstelle `packages/auth/src/circle.ts`:

```typescript
/**
 * Phase 25 — Circle-API-Sync types
 *
 * Mirrors the `public.user_circle_links` table schema defined in
 * `supabase/migrations/20260425000001_circle_profile_fields.sql`.
 *
 * Also documents the shape of Circle-related keys stored in
 * `auth.users.raw_user_meta_data` (JSONB, untyped in DB) written by
 * the server action `apps/website/app/actions/signup.ts` (Plan 25-E)
 * and read by `apps/website/app/auth/confirm/route.ts` (Plan 25-D).
 */

/** Full row as stored in Supabase (read shape). */
export interface UserCircleLink {
  user_id: string
  circle_member_id: string
  circle_provisioned_at: string | null
  last_error: string | null
  last_error_at: string | null
  created_at: string
}

/** Insert payload — DB fills created_at. */
export interface UserCircleLinkInsert {
  user_id: string
  circle_member_id: string
  circle_provisioned_at?: string | null
  last_error?: string | null
  last_error_at?: string | null
}

/**
 * Keys we write into auth.users.raw_user_meta_data during signup.
 * Not enforced by the DB (JSONB), documented here for TypeScript consumers.
 */
export interface CircleUserMetadata {
  /** Carried from /join Step 1 payload */
  status?: 'student' | 'pre-studium' | 'early-career'
  uni?: string
  motivation?: string
  level?: number
  full_name?: string

  /** Set when Circle provisioning succeeded at signup time (D-07). */
  circle_member_id?: string
  /** ISO-8601 timestamp of last successful Circle provision. */
  circle_provisioned_at?: string
}
```

Dann `packages/auth/src/index.ts` ergänzen — nach der bestehenden waitlist-Zeile:

```typescript
// Phase 25 — Circle-API-Sync types
export type {
  UserCircleLink,
  UserCircleLinkInsert,
  CircleUserMetadata,
} from './circle'
```

Keine Runtime-Logic, nur Types. `packages/auth/package.json` braucht keine Änderung (Subpath-Export via Barrel).
  </action>
  <verify>
    <automated>test -f packages/auth/src/circle.ts && grep -q "export interface UserCircleLink" packages/auth/src/circle.ts && grep -q "export interface UserCircleLinkInsert" packages/auth/src/circle.ts && grep -q "export interface CircleUserMetadata" packages/auth/src/circle.ts && grep -q "UserCircleLink" packages/auth/src/index.ts && pnpm --filter @genai/auth exec tsc --noEmit 2>&1 | tail -5</automated>
  </verify>
  <acceptance_criteria>
    - `packages/auth/src/circle.ts` existiert
    - Exportiert `UserCircleLink`, `UserCircleLinkInsert`, `CircleUserMetadata`
    - `packages/auth/src/index.ts` re-exportiert die Types
    - `pnpm --filter @genai/auth exec tsc --noEmit` clean (0 errors)
  </acceptance_criteria>
  <done>Types verfügbar via `import type { UserCircleLink, CircleUserMetadata } from '@genai/auth'`.</done>
</task>

<task type="auto">
  <name>Task A3: Env-Example-Files ergänzen</name>
  <files>.env.example, apps/website/.env.example</files>
  <read_first>
    - Bestehende `.env.example` und `apps/website/.env.example` (falls existiert) um Patterns zu matchen (Kommentar-Stil, Gruppierung)
  </read_first>
  <action>
Ergänze in der Root-`.env.example` (falls existiert — sonst neu erstellen, Struktur der bestehenden website-env matchen) am Ende:

```bash
# ---------------------------------------------------------------------------
# Circle-API-Sync (Phase 25)
# ---------------------------------------------------------------------------
# Circle Business-Plan Admin-API-Token. Provisioniert Members + generiert
# SSO-Links. Vercel-Env only (server-side). Rotate via Circle-Admin → API Tokens.
CIRCLE_API_TOKEN=

# Circle Community-ID (numeric string). Discover via Circle-MCP tool
# `get_community` or Circle Admin-UI → Settings → Developer → Community ID.
CIRCLE_COMMUNITY_ID=

# Welcome-Space-ID — Default-Space neuer Members (D-06 Auto-Join).
# Discover via Circle-MCP `list_spaces` → pick the "Welcome" or "#general" space.
CIRCLE_DEFAULT_SPACE_ID=

# Public Circle community URL (for SSO redirect base + mail CTA).
# Example: https://community.generation-ai.org
CIRCLE_COMMUNITY_URL=

# Signup-Reactivation-Gate (Q11). Default `false` — /api/auth/signup returns 503.
# Flip to `true` in Vercel Dashboard for Phase 27 go-live. No code deploy needed.
SIGNUP_ENABLED=false
```

Dasselbe Block in `apps/website/.env.example` kopieren (app-lokale Env für pnpm dev).

Falls bisherige `.env.example`-Files nicht existieren: Die Circle-Section trotzdem schreiben, plus Hinweis oben im File:
```bash
# Generation AI — Environment variables reference
# Copy to .env.local and fill with real values. Never commit .env.local.
```

Keine echten Tokens, keine URLs die private Info enthalten.
  </action>
  <verify>
    <automated>grep -q "CIRCLE_API_TOKEN=" .env.example 2>/dev/null && grep -q "CIRCLE_COMMUNITY_ID=" .env.example && grep -q "CIRCLE_DEFAULT_SPACE_ID=" .env.example && grep -q "CIRCLE_COMMUNITY_URL=" .env.example && grep -q "SIGNUP_ENABLED=false" .env.example && grep -q "CIRCLE_API_TOKEN=" apps/website/.env.example</automated>
  </verify>
  <acceptance_criteria>
    - Root `.env.example` enthält 5 neue Vars mit Platzhalter + Kommentar
    - `apps/website/.env.example` enthält dieselben 5 Vars
    - Kein Wert rechts vom `=` (außer `SIGNUP_ENABLED=false`)
    - Keine Tokens versehentlich committed
  </acceptance_criteria>
  <done>Devs haben ein Template, wissen welche Vars sie brauchen.</done>
</task>

<task type="auto">
  <name>Task A4: DEPLOYMENT.md Env-Var-Sektion ergänzen</name>
  <files>docs/DEPLOYMENT.md</files>
  <read_first>
    - `docs/DEPLOYMENT.md` (Struktur matchen — wo sind aktuelle Env-Vars dokumentiert?)
    - `.planning/phases/25-circle-api-sync/25-CONTEXT.md` (Q1-Q11 Auflistung)
  </read_first>
  <action>
In `docs/DEPLOYMENT.md` im Env-Var-Abschnitt (falls keiner existiert: neuer Top-Level-Abschnitt `## Environment Variables`) eine Subsektion `### Circle-API-Sync (Phase 25)` einfügen:

```markdown
### Circle-API-Sync (Phase 25)

Fünf Env-Vars steuern Circle-Provisioning + Signup-Gate:

| Variable | Wert | Scope | Wo setzen |
|----------|------|-------|-----------|
| `CIRCLE_API_TOKEN` | Circle Admin-API-Bearer-Token | prod + preview + dev | Circle → Settings → Developer → Generate Token |
| `CIRCLE_COMMUNITY_ID` | Numerische Community-ID | prod + preview + dev | Circle-MCP `get_community` oder Admin-UI |
| `CIRCLE_DEFAULT_SPACE_ID` | Space-ID des Welcome-Space | prod + preview + dev | Circle-MCP `list_spaces` |
| `CIRCLE_COMMUNITY_URL` | `https://community.generation-ai.org` | prod + preview + dev | Bekannt |
| `SIGNUP_ENABLED` | `true` oder `false` (Default `false`) | **prod nur** (preview + dev = `true` für Tests) | Vercel-Dashboard, Phase 27 flip |

**Setup-Kommandos** (via Vercel-CLI oder `mcp__vercel__*`):

```bash
# Prod (alle 4 ausser SIGNUP_ENABLED kriegen echte Werte)
vercel env add CIRCLE_API_TOKEN production
vercel env add CIRCLE_COMMUNITY_ID production
vercel env add CIRCLE_DEFAULT_SPACE_ID production
vercel env add CIRCLE_COMMUNITY_URL production
# SIGNUP_ENABLED bleibt bei false bis Phase 27

# Preview + Development mit SIGNUP_ENABLED=true für E2E-Tests
vercel env add SIGNUP_ENABLED preview  # true
vercel env add SIGNUP_ENABLED development  # true
```

**Rotation:**
- `CIRCLE_API_TOKEN`: Circle-Admin → alten Token revoken → neuen generieren → in Vercel + lokal .env.local updaten → Deploy triggern.
- `CIRCLE_DEFAULT_SPACE_ID`: Wenn Welcome-Space umgezogen wird, Var updaten + Redeploy. Nicht breaking — nur neue Members landen anderswo.

**Signup-Reactivation-Gate (Q11):**
Die `SIGNUP_ENABLED=false`-Default stellt sicher, dass `/api/auth/signup` nach Phase 25 weiterhin 503 returnt. In Phase 27 wird die Var in Prod auf `true` gesetzt — dann läuft der unified signup live. Keine Code-Änderung nötig zum Live-Schalten.
```

In TOC/Index des DEPLOYMENT.md-Files den neuen Abschnitt verlinken, falls TOC existiert.
  </action>
  <verify>
    <automated>grep -q "Circle-API-Sync (Phase 25)" docs/DEPLOYMENT.md && grep -q "CIRCLE_API_TOKEN" docs/DEPLOYMENT.md && grep -q "SIGNUP_ENABLED" docs/DEPLOYMENT.md && grep -q "Rotation" docs/DEPLOYMENT.md</automated>
  </verify>
  <acceptance_criteria>
    - `docs/DEPLOYMENT.md` enthält "Circle-API-Sync (Phase 25)"-Subsektion
    - 5 Env-Vars in Tabelle dokumentiert (Variable, Wert, Scope, Wo setzen)
    - Setup-Kommandos + Rotation-Hinweise vorhanden
    - Signup-Reactivation-Gate (Q11) erklärt
  </acceptance_criteria>
  <done>Luca weiss beim Deploy genau welche Env-Vars er wo setzen muss.</done>
</task>

</tasks>

<verification>
**Automated gates:**
- `pnpm --filter @genai/auth exec tsc --noEmit` — 0 errors
- `grep -q "user_circle_links" supabase/migrations/20260425000001_circle_profile_fields.sql` — present
- Supabase-MCP `list_tables` — `user_circle_links` in `public` schema

**Manual:**
- Luca prüft `docs/DEPLOYMENT.md` Circle-Section → verständlich ohne Rückfrage?
</verification>

<must_haves>
Siehe `must_haves` im Frontmatter oben.
</must_haves>
