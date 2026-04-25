---
phase: 23
plan: 01
slug: supabase-waitlist-migration
type: execute
wave: 1
depends_on: []
files_modified:
  - supabase/migrations/20260424000001_waitlist.sql
  - packages/auth/src/waitlist.ts
  - packages/auth/src/index.ts
autonomous: true
requirements:
  - R4.5
  - R4.8
must_haves:
  truths:
    - "Supabase `waitlist` table existiert in Prod-Projekt (wbohulnuwqrhystaamjc) mit allen Feldern laut D-05"
    - "RLS ist aktiv — Anon-Key kann NICHT SELECT/INSERT/UPDATE/DELETE"
    - "Service-Role kann SELECT alle Rows"
    - "Service-Role kann INSERT (wird von Server-Action via @supabase/ssr admin-client genutzt)"
    - "TypeScript-Types für `waitlist`-Table sind in @genai/auth importierbar"
  artifacts:
    - path: "supabase/migrations/20260424000001_waitlist.sql"
      provides: "Idempotente SQL-Migration (CREATE TABLE IF NOT EXISTS + CREATE POLICY)"
      contains: "CREATE TABLE IF NOT EXISTS public.waitlist"
    - path: "packages/auth/src/waitlist.ts"
      provides: "WaitlistRow + WaitlistInsert TypeScript-Types"
      exports: ["WaitlistRow", "WaitlistInsert"]
    - path: "packages/auth/src/index.ts"
      provides: "Re-export der Waitlist-Types"
      contains: "export type { WaitlistRow, WaitlistInsert }"
  key_links:
    - from: "supabase.waitlist"
      to: "RLS-Policies"
      via: "ALTER TABLE ... ENABLE ROW LEVEL SECURITY + 2 policies (service_role only)"
      pattern: "ENABLE ROW LEVEL SECURITY"
    - from: "@genai/auth"
      to: "WaitlistInsert type"
      via: "re-export from ./waitlist"
      pattern: "export type.*Waitlist"
---

<objective>
Supabase `waitlist`-Tabelle aufsetzen (Migration + RLS + TypeScript-Types), so dass Plan 23-03 (Server-Action) darauf inserten kann.

Purpose: D-05 lockt separate `waitlist`-Table (nicht in `auth.users`) mit RLS. Phase 25 wird die Waitlist entweder migrieren oder archivieren — bis dahin sammelt sie alle V1-Signups für Launch-Kommunikation (D-01).
Output: Migration-File im Repo, Table live in Prod-Supabase (via MCP `apply_migration`), TypeScript-Types in `@genai/auth`.
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/phases/23-join-flow/23-CONTEXT.md
@.planning/phases/23-join-flow/23-UI-SPEC.md
@packages/auth/src/index.ts
@packages/auth/src/admin.ts

<interfaces>
<!-- Existing @genai/auth exports (extracted from packages/auth/src/index.ts) -->
```typescript
export { createClient as createBrowserClient } from './browser'
export { createAdminClient } from './admin'
export { needsFirstLoginPrompt } from './password'
```

<!-- Admin client pattern (from packages/auth/src/admin.ts) — used by Plan 23-03 to insert -->
```typescript
import { createAdminClient } from '@genai/auth'
const supabase = createAdminClient()
await supabase.from('waitlist').insert({ ... })
```
</interfaces>

<supabase_mcp>
Supabase MCP is connected for project_ref `wbohulnuwqrhystaamjc`. Use:
- `mcp__supabase__apply_migration` — Apply the SQL migration directly to Prod.
- `mcp__supabase__list_tables` — Verify table creation (expect `waitlist` in schema `public`).
- `mcp__supabase__execute_sql` — Verify RLS (SELECT on `pg_policies` WHERE tablename='waitlist').
</supabase_mcp>
</context>

<tasks>

<task type="auto">
  <name>Task 1: SQL-Migration erstellen + in Repo committen</name>
  <files>supabase/migrations/20260424000001_waitlist.sql</files>
  <read_first>
    - `.planning/phases/23-join-flow/23-CONTEXT.md` D-05 (Table-Schema)
    - `.planning/phases/23-join-flow/23-CONTEXT.md` D-06 (Rate-Limit-Plan — kontextuell)
    - `LEARNINGS.md` (keine CSP/Proxy-Änderungen hier — Migration ist DB-only, aber Repo-Pattern durchlesen)
  </read_first>
  <action>
Erstelle die Datei `supabase/migrations/20260424000001_waitlist.sql` mit exakt folgendem Inhalt (idempotent — `IF NOT EXISTS` damit Re-Apply keine Fehler wirft):

```sql
-- Phase 23 — /join Waitlist V1
-- D-05: separate `waitlist` table, RLS restricts to service_role only.
-- Phase 25 (Circle-API-Sync) migrates or archives this table.

create table if not exists public.waitlist (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  name text not null,
  university text not null,
  study_program text,
  marketing_opt_in boolean not null default false,
  redirect_after text,
  source text not null default 'join-page',
  created_at timestamptz not null default now(),
  notified_at timestamptz
);

-- Case-insensitive unique index on email (prevents duplicate waitlist entries)
create unique index if not exists waitlist_email_unique_ci
  on public.waitlist (lower(email));

-- Index for the Phase 25 batch-notification job
create index if not exists waitlist_pending_notification_idx
  on public.waitlist (created_at)
  where notified_at is null;

-- RLS
alter table public.waitlist enable row level security;

-- Service role: full read + insert (server-action via createAdminClient)
drop policy if exists "service_role_select_waitlist" on public.waitlist;
create policy "service_role_select_waitlist"
  on public.waitlist
  for select
  to service_role
  using (true);

drop policy if exists "service_role_insert_waitlist" on public.waitlist;
create policy "service_role_insert_waitlist"
  on public.waitlist
  for insert
  to service_role
  with check (true);

comment on table public.waitlist is
  'Phase 23 /join waitlist (V1). Inserted by server action waitlist.submitJoinWaitlist via service_role admin client. Phase 25 will migrate accepted entries into auth.users via Circle-API-Sync.';
```

Entscheidungen in diesem Schema (per D-05 + UI-SPEC):
- `email` als TEXT + case-insensitive unique index (robuster als `citext`, keine Extension nötig)
- `name` = kombiniertes Feld (UI-SPEC empfiehlt single-field — passt zu D-02 Minimal-Fields)
- `university` = required (D-02 — Combobox mit Freitext, Freitext wird im UI akzeptiert)
- `study_program` nullable (D-13 optional)
- `marketing_opt_in` DEFAULT false (D-14)
- `redirect_after` nullable TEXT (D-03)
- `source` DEFAULT 'join-page' (D-05)
- `notified_at` nullable (Phase 25 setzt das beim Launch-Mail)

Benennungskonvention: `YYYYMMDDHHMMSS_description.sql`. Timestamp `20260424000001` ist kanonisch für heute (2026-04-24).
  </action>
  <verify>
    <automated>test -f supabase/migrations/20260424000001_waitlist.sql &amp;&amp; grep -q "create table if not exists public.waitlist" supabase/migrations/20260424000001_waitlist.sql &amp;&amp; grep -q "enable row level security" supabase/migrations/20260424000001_waitlist.sql &amp;&amp; grep -q "service_role_insert_waitlist" supabase/migrations/20260424000001_waitlist.sql</automated>
  </verify>
  <acceptance_criteria>
    - `supabase/migrations/20260424000001_waitlist.sql` existiert
    - Enthält `create table if not exists public.waitlist`
    - Enthält alle 10 Columns: id, email, name, university, study_program, marketing_opt_in, redirect_after, source, created_at, notified_at
    - Enthält `enable row level security`
    - Enthält 2 Policies (`service_role_select_waitlist` + `service_role_insert_waitlist`)
    - Enthält `create unique index` für `lower(email)`
    - Keine `anon` oder `authenticated` Policies
  </acceptance_criteria>
  <done>Migration-SQL-File im Repo, idempotent formuliert, RLS aktiv.</done>
</task>

<task type="auto">
  <name>Task 2: Migration via Supabase MCP auf Prod anwenden + verifizieren</name>
  <files>(keine Repo-Änderung — DB-Operation via MCP)</files>
  <read_first>
    - `supabase/migrations/20260424000001_waitlist.sql` (aus Task 1)
  </read_first>
  <action>
Supabase-MCP ist für Projekt `wbohulnuwqrhystaamjc` (Prod) connected. Kein lokales Supabase, kein Docker — direkt Prod.

Schritte:

1. **Migration anwenden** via `mcp__supabase__apply_migration`:
   - `name: "waitlist"`
   - `query`: Den kompletten SQL-Body aus `supabase/migrations/20260424000001_waitlist.sql`. Einlesen via Read-Tool, dann als `query`-Parameter übergeben.

2. **Verifizieren Table-Existenz** via `mcp__supabase__list_tables`:
   - `schemas: ["public"]`
   - Erwartung: `waitlist` in Response enthalten mit 10 Columns.

3. **Verifizieren RLS + Policies** via `mcp__supabase__execute_sql`:
   ```sql
   select policyname, cmd, roles from pg_policies where schemaname = 'public' and tablename = 'waitlist';
   ```
   - Erwartung: 2 Rows, beide mit `roles = {service_role}`.

4. **Verifizieren RLS enabled** via `mcp__supabase__execute_sql`:
   ```sql
   select relname, relrowsecurity from pg_class where relname = 'waitlist';
   ```
   - Erwartung: `relrowsecurity = true`.

5. **Smoke-Test Anon-Block** via `mcp__supabase__execute_sql` (Insert als anon MUSS failen):
   ```sql
   set role anon;
   insert into public.waitlist (email, name, university) values ('rls-test@example.com', 'RLS Test', 'Test Uni');
   reset role;
   ```
   - Erwartung: Insert schlägt fehl mit "new row violates row-level security policy" oder "permission denied".

Falls der Smoke-Test durchkommt (anon kann inserten), STOP und melde zurück — die Policies sind falsch konfiguriert.

**Final automated verification:** Nach den MCP-Schritten führt der automated verify-Command einen End-to-End-HTTP-Check durch: Ein anonymer REST-Call gegen `/rest/v1/waitlist` mit dem Anon-Key MUSS 401/403 zurückgeben. Das beweist RLS live aus Client-Perspektive, unabhängig von MCP-internem Routing.
  </action>
  <verify>
    <automated>HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" -H "apikey: $NEXT_PUBLIC_SUPABASE_ANON_KEY" -H "Authorization: Bearer $NEXT_PUBLIC_SUPABASE_ANON_KEY" "$NEXT_PUBLIC_SUPABASE_URL/rest/v1/waitlist?select=id&limit=1"); echo "anon GET /rest/v1/waitlist -> HTTP $HTTP_STATUS"; echo "$HTTP_STATUS" | grep -qE '^(401|403|404)$' && echo "RLS OK: anon blocked"</automated>
  </verify>
  <acceptance_criteria>
    - MCP `apply_migration` hat success zurückgegeben
    - MCP `list_tables` zeigt `waitlist` mit allen 10 Columns
    - MCP `execute_sql` auf `pg_policies` gibt 2 Rows zurück (beide service_role)
    - MCP `execute_sql` auf `pg_class.relrowsecurity` gibt `true`
    - Anon-INSERT-Test (über MCP set role anon) schlägt fehl (erwünscht)
    - curl gegen `$NEXT_PUBLIC_SUPABASE_URL/rest/v1/waitlist?select=id&limit=1` mit dem Anon-Key liefert HTTP 401 oder 403 (RLS blocks public read end-to-end). HTTP 404 ist ebenfalls akzeptabel falls die Route von Supabase versteckt wird.
  </acceptance_criteria>
  <done>`waitlist`-Table ist live in Prod-Supabase, RLS aktiv, anon blockiert end-to-end (HTTP 401/403), service_role kann lesen+schreiben.</done>
</task>

<task type="auto">
  <name>Task 3: TypeScript-Types in @genai/auth exportieren</name>
  <files>
    - packages/auth/src/waitlist.ts
    - packages/auth/src/index.ts
  </files>
  <read_first>
    - `packages/auth/src/index.ts` (existing exports — NICHT überschreiben, nur erweitern)
    - `packages/auth/src/admin.ts` (Admin-Client-Pattern)
  </read_first>
  <action>
**Schritt 1:** Erstelle `packages/auth/src/waitlist.ts` mit folgendem Inhalt:

```typescript
/**
 * Phase 23 — /join Waitlist V1 types
 *
 * Mirrors the `public.waitlist` table schema defined in
 * `supabase/migrations/20260424000001_waitlist.sql`.
 *
 * Used by server action `apps/website/app/actions/waitlist.ts` (Plan 23-03)
 * via `createAdminClient()` from this package.
 *
 * Phase 25 (Circle-API-Sync) will migrate these rows into `auth.users`.
 */

/** Full row as stored in Supabase (read shape). */
export interface WaitlistRow {
  id: string
  email: string
  name: string
  university: string
  study_program: string | null
  marketing_opt_in: boolean
  redirect_after: string | null
  source: string
  created_at: string
  notified_at: string | null
}

/** Insert payload — DB defaults fill in id, source, created_at, notified_at. */
export interface WaitlistInsert {
  email: string
  name: string
  university: string
  study_program?: string | null
  marketing_opt_in?: boolean
  redirect_after?: string | null
  source?: string
}
```

**Schritt 2:** Erweitere `packages/auth/src/index.ts` um das Re-Export am Ende der Datei (existing exports NICHT anfassen):

```typescript
// Phase 23 — /join Waitlist types
export type { WaitlistRow, WaitlistInsert } from './waitlist'
```

Wichtig: KEIN Runtime-Code in `waitlist.ts` — nur Types. Das `index.ts` ist als client-safe barrel markiert — TypeScript-Types sind client-safe, kein Konflikt.
  </action>
  <verify>
    <automated>test -f packages/auth/src/waitlist.ts && grep -q "export interface WaitlistRow" packages/auth/src/waitlist.ts && grep -q "export interface WaitlistInsert" packages/auth/src/waitlist.ts && grep -q "WaitlistRow, WaitlistInsert" packages/auth/src/index.ts && pnpm --filter @genai/auth build</automated>
  </verify>
  <acceptance_criteria>
    - `packages/auth/src/waitlist.ts` enthält `export interface WaitlistRow` (10 Felder)
    - `packages/auth/src/waitlist.ts` enthält `export interface WaitlistInsert` (7 Felder: 3 required + 4 optional)
    - `packages/auth/src/index.ts` re-exportiert beide Types
    - `pnpm --filter @genai/auth build` (falls build-Script existiert) läuft grün ODER `pnpm -w tsc --noEmit` grün
    - Existing @genai/auth Exports bleiben intakt (createBrowserClient, createAdminClient, needsFirstLoginPrompt)
  </acceptance_criteria>
  <done>Waitlist-Types in @genai/auth importierbar via `import type { WaitlistInsert } from '@genai/auth'`.</done>
</task>

</tasks>

<verification>
- SQL-Migration committed in supabase/migrations/
- DB-State in Prod verifiziert (Table + RLS + Policies)
- Types kompilieren, Re-Export funktioniert
- Anon kann nicht inserten (Smoke-Test via MCP set role anon + end-to-end HTTP-Check)
</verification>

<success_criteria>
- `waitlist`-Table existiert in Prod-Supabase mit RLS
- Plan 23-03 kann `import type { WaitlistInsert } from '@genai/auth'` verwenden
- Plan 23-03 kann `createAdminClient().from('waitlist').insert(...)` aufrufen
- Anonymer REST-Call (curl mit Anon-Key) gegen `/rest/v1/waitlist` liefert 401/403
</success_criteria>

<output>
After completion, create `.planning/phases/23-join-flow/23-01-SUMMARY.md` with:
- Migration timestamp + full SQL path
- MCP verification outputs (table structure + policies)
- Anon-RLS-block smoke-test evidence (both MCP `set role anon` + curl HTTP-Status)
- Types-file location
</output>
