---
phase: 25
plan: B
slug: circle-client-package
type: execute
wave: 1
depends_on: []
files_modified:
  - packages/circle/package.json
  - packages/circle/tsconfig.json
  - packages/circle/src/index.ts
  - packages/circle/src/client.ts
  - packages/circle/src/errors.ts
  - packages/circle/src/types.ts
  - packages/circle/src/__tests__/client.test.ts
  - pnpm-workspace.yaml
autonomous: true
requirements:
  - R6.1
  - R6.7
must_haves:
  truths:
    - "Neues Workspace-Package `@genai/circle` existiert unter `packages/circle/` mit Standard-Pattern (package.json, tsconfig, src/, exports)."
    - "Helper `createMember({ email, name, metadata? })` ruft Circle Admin-API v2 POST `/api/admin/v2/community_members` mit `CIRCLE_API_TOKEN` + `CIRCLE_COMMUNITY_ID`, returned `{ circleMemberId: string, alreadyExists: boolean }`."
    - "Helper `getMemberByEmail(email)` ruft Circle Admin-API v2 GET `/api/admin/v2/community_members?email=<email>&community_id=<id>`, returned `{ circleMemberId: string } | null`."
    - "Helper `addMemberToSpace(memberId, spaceId)` ruft Circle Admin-API v2 POST `/api/admin/v2/space_members` (D-06 Welcome-Space-Auto-Join), idempotent (409 = ok)."
    - "Helper `generateSsoUrl({ memberId, redirectPath? })` ruft Circle Admin-API v2 POST `/api/admin/v2/headless_auth_tokens` oder entsprechenden SSO-Endpoint, returned `{ ssoUrl: string, expiresAt: string }` (TTL 7 Tage per Q4)."
    - "Alle 4 Helpers sind idempotent + throw typisierte `CircleApiError` (extends Error, hat statusCode + code + correlationId)."
    - "`CircleApiError.code` values: `UNAUTHORIZED`, `RATE_LIMITED`, `NOT_FOUND`, `CONFLICT`, `SERVER_ERROR`, `NETWORK_ERROR`, `CONFIG_MISSING`, `UNKNOWN`."
    - "Client liest env-Vars lazy innerhalb der Helpers (nicht at-module-load), damit Test-Env sie mocken kann."
    - "Wenn `CIRCLE_API_TOKEN` oder `CIRCLE_COMMUNITY_ID` fehlt → `throw new CircleApiError('CONFIG_MISSING', ...)` — nie stillen Fail-Through."
    - "Timeout auf allen Fetch-Calls: 10 Sekunden via `AbortSignal.timeout(10_000)`. Länger blockiert den Signup-Flow zu lange; non-blocking handling ist in Plan E."
    - "Retry NUR auf `NETWORK_ERROR` + `RATE_LIMITED` (exponential backoff 3 Versuche, 500ms/1500ms/4500ms). Auf `UNAUTHORIZED`/`CONFIG_MISSING` **kein** Retry."
    - "Unit-Tests decken Happy-Path + Error-Mapping + Idempotenz + Timeout-Case ab. Fetch via `vi.mock` oder vergleichbarem Pattern gestubbed."
    - "Package exportiert keine Browser-APIs — `packages/circle/package.json` hat `\"sideEffects\": false` und keine `use client` directive."
  artifacts:
    - path: "packages/circle/src/client.ts"
      provides: "Circle-API-Wrapper mit typed helpers + error handling"
      exports: ["createMember", "getMemberByEmail", "addMemberToSpace", "generateSsoUrl"]
    - path: "packages/circle/src/errors.ts"
      provides: "Typed error class für Sentry + Control-Flow-Entscheidungen"
      exports: ["CircleApiError", "CircleErrorCode"]
    - path: "packages/circle/src/types.ts"
      provides: "TypeScript-Types für Circle-API-Shapes"
      exports: ["CircleMember", "CircleSsoToken", "CreateMemberInput", "GenerateSsoInput"]
    - path: "packages/circle/src/index.ts"
      provides: "Barrel-Export für Konsumenten"
      exports: ["createMember", "getMemberByEmail", "addMemberToSpace", "generateSsoUrl", "CircleApiError", "CircleErrorCode", "CircleMember", "CircleSsoToken"]
  key_links:
    - from: "packages/circle/src/client.ts"
      to: "Circle-API (external)"
      via: "fetch() to https://app.circle.so/api/admin/v2"
      pattern: "app\\.circle\\.so/api/admin/v2"
---

<objective>
Ein eigenes Workspace-Package `@genai/circle` bauen, das alle Circle-API-Calls kapselt. Drei Gründe für eigenes Package (nicht inline in `apps/website/lib/circle.ts`):

1. **Wiederverwendung** — Plan F (Admin-Reprovision-Route) + Plan G (Waitlist-Re-Invite-Script) + tools-app zukünftig brauchen denselben Client.
2. **Test-Isolation** — Unit-Tests laufen gegen Package, nicht gegen App.
3. **Error-Typing** — `CircleApiError` ist Single-Source-of-Truth für alle Call-Sites (Sentry-Tag `circle-api` pro R6.7).

Purpose: Foundation für alle Provisioning-Flows. Wave-1-parallel zu Plan A (keine Cross-Dependency).
Output: Working Circle-Client + Unit-Tests + typed errors.
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/phases/25-circle-api-sync/25-CONTEXT.md
@packages/auth/package.json
@packages/emails/package.json
@packages/types/package.json

<interfaces>
```typescript
// packages/circle/src/types.ts
export interface CircleMember {
  id: string              // internal Circle member ID (stringified numeric)
  email: string
  name: string
  community_id: string
}

export interface CircleSsoToken {
  sso_url: string         // one-time-use magic link
  expires_at: string      // ISO-8601
}

export interface CreateMemberInput {
  email: string
  name: string
  /** Optional metadata stored on Circle-side (Q9: nur Email + Name, keine Uni/Motivation). */
  metadata?: Record<string, string>
}

export interface GenerateSsoInput {
  memberId: string
  /** Post-login redirect path inside Circle, e.g. `/spaces/welcome`. */
  redirectPath?: string
  /** Optional TTL override in seconds. Default per Q4 = 7 days = 604800. */
  ttlSeconds?: number
}

// packages/circle/src/errors.ts
export type CircleErrorCode =
  | 'UNAUTHORIZED'     // 401/403 from Circle
  | 'RATE_LIMITED'     // 429
  | 'NOT_FOUND'        // 404
  | 'CONFLICT'         // 409 (duplicate member, already in space — usually benign)
  | 'SERVER_ERROR'     // 5xx
  | 'NETWORK_ERROR'    // fetch threw (timeout, DNS, reset)
  | 'CONFIG_MISSING'   // CIRCLE_API_TOKEN or CIRCLE_COMMUNITY_ID not set
  | 'UNKNOWN'

export class CircleApiError extends Error {
  readonly code: CircleErrorCode
  readonly statusCode?: number
  readonly correlationId?: string   // from Circle `x-request-id` header if available
  constructor(code: CircleErrorCode, message: string, opts?: { statusCode?: number; correlationId?: string; cause?: unknown }) {
    super(message, { cause: opts?.cause })
    this.name = 'CircleApiError'
    this.code = code
    this.statusCode = opts?.statusCode
    this.correlationId = opts?.correlationId
  }
}

// packages/circle/src/client.ts — 4 exported functions
export async function createMember(input: CreateMemberInput): Promise<{ circleMemberId: string; alreadyExists: boolean }>
export async function getMemberByEmail(email: string): Promise<{ circleMemberId: string } | null>
export async function addMemberToSpace(memberId: string, spaceId: string): Promise<void>
export async function generateSsoUrl(input: GenerateSsoInput): Promise<{ ssoUrl: string; expiresAt: string }>
```
</interfaces>

<environment_notes>
- Circle Admin-API v2 Base-URL: `https://app.circle.so/api/admin/v2`
- Auth-Header: `Authorization: Bearer ${CIRCLE_API_TOKEN}` (Standard OAuth Bearer).
- Rate-Limits: Circle dokumentiert 60 req/min für Admin-API. Unsere Flows erzeugen max ~2 req pro Signup, das ist easy. Wenn wir trotzdem 429 sehen → exponential backoff (3 Retries, 500ms/1500ms/4500ms).
- Circle-MCP (`mcp__aae5c88c-*`) gibt uns die Community/Space-ID-Discovery-Tools, aber der Package-Client selbst nutzt nur `fetch` — kein MCP-Runtime-Call.
- **WICHTIG:** Circle dokumentiert ihre API nicht sauber; die exakten Endpoint-URLs werden via Circle-MCP + Circle-Admin-UI zur Execute-Zeit verifiziert. Die Paths in diesem Plan sind best-guess, der Executor muss gegen Circle-Docs checken und ggf. Paths nachjustieren (Plan-H E2E-Test wird es fangen).
</environment_notes>
</context>

<threat_model>
**Asset:** `CIRCLE_API_TOKEN` (Circle-Admin-Token mit vollem Community-Zugriff).

**Threats (ASVS L1):**

1. **Token-Leak via Client-Bundle.**
   - Mitigation: Package hat `"sideEffects": false` + nutzt `process.env.CIRCLE_API_TOKEN` nur in Funktionen, nicht als Top-Level-Const. Next.js bundelt env-Vars ohne `NEXT_PUBLIC_`-Prefix nie in Client-Bundles. Zusätzlicher Guard: kein `'use client'` irgendwo im Package. Build-Check: `grep -r "CIRCLE_API_TOKEN" apps/website/.next/static/` muss leer sein (Plan H Test).

2. **Token-Leak via Error-Messages / Sentry-Breadcrumbs.**
   - Mitigation: `CircleApiError.message` darf niemals den Token enthalten. Response-Body von Circle wird nicht 1:1 in die Message kopiert, sondern auf `statusCode + code + correlationId` reduziert. Sentry-Tag `circle-api` (R6.7) — kein PII in Extra-Data (nur Email via `user.email` falls Sentry-User-Context bereits gesetzt).

3. **SSRF oder Request-Hijack via user-controlled URL.**
   - Mitigation: Base-URL ist Konstante (`https://app.circle.so/api/admin/v2`). Keine User-Inputs fließen in den URL-Build (nur in Query-Strings / Body — URL-encoded).

4. **SSO-URL-Replay-Attack.**
   - Mitigation: Circle-SSO-Tokens sind one-time-use (Circle-side enforcement). TTL 7 Tage matcht Supabase-Confirm-Link, kürzer würde die Mail zerstören wenn User erst nach Tagen klickt. SSO-URL wird nur in der Confirmation-Mail versendet, nie geloggt.

5. **Timing-Side-Channels beim `getMemberByEmail` (Email-Enumeration).**
   - Mitigation: Dieser Call passiert **nur server-side im Signup-Flow** — attacker ohne Account kann ihn nicht triggern. Signup-Endpoint ist rate-limited (Plan E + Upstash, 5 req/15min per IP).

**Block on:** BLOCKER (`Token im Bundle`, `Token in Error-Message`, `URL-Injection`).
**Residual:** Wenn `CIRCLE_API_TOKEN` geleakt wird, hat Attacker Vollzugriff auf Community. Mitigation: Rotation-Flow dokumentiert (Plan A Task A4), Sentry-Alert bei Auth-Error-Spike (R6.7) = Indikator für geleakten Token.
</threat_model>

<tasks>

<task type="auto">
  <name>Task B1: Package-Skeleton + Workspace-Einbindung</name>
  <files>packages/circle/package.json, packages/circle/tsconfig.json, packages/circle/src/index.ts, pnpm-workspace.yaml</files>
  <read_first>
    - `packages/auth/package.json` (Referenz-Package-Struktur: exports-map, deps, scripts)
    - `packages/auth/tsconfig.json` (tsconfig-Pattern aus `@genai/config`)
    - `pnpm-workspace.yaml` (prüfen ob `packages/*` bereits glob-included ist — meistens ja)
  </read_first>
  <action>
Erstelle `packages/circle/package.json`:

```json
{
  "name": "@genai/circle",
  "version": "0.0.1",
  "private": true,
  "type": "module",
  "sideEffects": false,
  "exports": {
    ".": "./src/index.ts",
    "./client": "./src/client.ts",
    "./errors": "./src/errors.ts",
    "./types": "./src/types.ts"
  },
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "lint": "eslint src/",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {},
  "devDependencies": {
    "@genai/config": "workspace:*",
    "@types/node": "catalog:",
    "typescript": "catalog:",
    "vitest": "catalog:"
  }
}
```

Erstelle `packages/circle/tsconfig.json`:

```json
{
  "extends": "@genai/config/tsconfig/base.json",
  "compilerOptions": {
    "rootDir": "src",
    "outDir": "dist",
    "lib": ["ES2022"]
  },
  "include": ["src/**/*"],
  "exclude": ["src/**/*.test.ts"]
}
```

Erstelle `packages/circle/src/index.ts` (Barrel, fuellen wir in B2-B4):

```typescript
export { createMember, getMemberByEmail, addMemberToSpace, generateSsoUrl } from './client'
export { CircleApiError } from './errors'
export type { CircleErrorCode } from './errors'
export type {
  CircleMember,
  CircleSsoToken,
  CreateMemberInput,
  GenerateSsoInput,
} from './types'
```

Falls `pnpm-workspace.yaml` `packages/*` nicht glob-included hat, Zeile hinzufügen. Dann `pnpm install` vom Repo-Root laufen lassen, damit Workspace-Link erzeugt wird.

**Nach Task:** `pnpm --filter @genai/circle exec tsc --noEmit` muss laufen (kann Errors für noch nicht existente files werfen, das ist ok bis B2-B4).
  </action>
  <verify>
    <automated>test -f packages/circle/package.json && grep -q '"name": "@genai/circle"' packages/circle/package.json && grep -q '"sideEffects": false' packages/circle/package.json && test -f packages/circle/tsconfig.json && test -f packages/circle/src/index.ts && pnpm ls --filter @genai/circle 2>&1 | grep -q "@genai/circle"</automated>
  </verify>
  <acceptance_criteria>
    - `packages/circle/package.json` existiert mit Name `@genai/circle`
    - `"sideEffects": false` gesetzt (Tree-Shaking + Bundle-Safety)
    - Exports-Map hat `.`, `./client`, `./errors`, `./types`
    - `packages/circle/tsconfig.json` extends `@genai/config/tsconfig/base.json`
    - `packages/circle/src/index.ts` existiert (Barrel)
    - `pnpm ls --filter @genai/circle` findet das Package
  </acceptance_criteria>
  <done>Package-Skeleton steht, B2-B4 kann den Inhalt füllen.</done>
</task>

<task type="auto">
  <name>Task B2: Types + Errors</name>
  <files>packages/circle/src/types.ts, packages/circle/src/errors.ts</files>
  <read_first>
    - `.planning/phases/25-circle-api-sync/25-CONTEXT.md` Q4 (SSO-TTL 7 Tage) + Q9 (nur Email+Name an Circle)
  </read_first>
  <action>
Erstelle `packages/circle/src/types.ts`:

```typescript
/**
 * Phase 25 — Circle-API-Sync types
 *
 * Shapes match Circle Admin-API v2 response bodies as documented in
 * https://api.circle.so/ (verify against live API at execute time).
 */

export interface CircleMember {
  id: string              // Circle returns numeric IDs, we stringify for safety
  email: string
  name: string
  community_id: string
}

export interface CircleSsoToken {
  sso_url: string         // one-time-use magic link
  expires_at: string      // ISO-8601
}

/** Input for createMember. Q9: nur Email + Name an Circle, keine Uni/Status/Motivation. */
export interface CreateMemberInput {
  email: string
  name: string
  /** Optional metadata stored on Circle-side. Use sparingly (Q9). */
  metadata?: Record<string, string>
}

/** Input for generateSsoUrl. TTL defaults to 7 days per Q4. */
export interface GenerateSsoInput {
  memberId: string
  /** Post-login redirect inside Circle (relative path, e.g. `/spaces/welcome`). */
  redirectPath?: string
  /** TTL in seconds. Default = 604800 (7 days, matches Supabase confirm link). */
  ttlSeconds?: number
}
```

Erstelle `packages/circle/src/errors.ts`:

```typescript
/**
 * Phase 25 — typed error class for all Circle-API calls.
 *
 * Used by:
 * - `apps/website/app/actions/signup.ts` (Plan 25-E) for non-blocking fallback
 * - `apps/website/app/api/admin/circle-reprovision/route.ts` (Plan 25-F)
 * - Sentry `circle-api` tag (R6.7)
 */

export type CircleErrorCode =
  | 'UNAUTHORIZED'     // 401/403 — token invalid or revoked
  | 'RATE_LIMITED'     // 429
  | 'NOT_FOUND'        // 404
  | 'CONFLICT'         // 409 — duplicate member, already in space (often benign)
  | 'SERVER_ERROR'     // 5xx
  | 'NETWORK_ERROR'    // fetch threw (timeout, DNS, reset)
  | 'CONFIG_MISSING'   // CIRCLE_API_TOKEN or CIRCLE_COMMUNITY_ID not set
  | 'UNKNOWN'

export class CircleApiError extends Error {
  readonly code: CircleErrorCode
  readonly statusCode?: number
  readonly correlationId?: string
  constructor(
    code: CircleErrorCode,
    message: string,
    opts?: { statusCode?: number; correlationId?: string; cause?: unknown },
  ) {
    super(message, opts?.cause ? { cause: opts.cause } : undefined)
    this.name = 'CircleApiError'
    this.code = code
    this.statusCode = opts?.statusCode
    this.correlationId = opts?.correlationId
  }
}
```

Keine weitere Logic.
  </action>
  <verify>
    <automated>test -f packages/circle/src/types.ts && test -f packages/circle/src/errors.ts && grep -q "export class CircleApiError" packages/circle/src/errors.ts && grep -q "export type CircleErrorCode" packages/circle/src/errors.ts && grep -q "CreateMemberInput" packages/circle/src/types.ts && grep -q "GenerateSsoInput" packages/circle/src/types.ts && pnpm --filter @genai/circle exec tsc --noEmit 2>&1 | tail -5</automated>
  </verify>
  <acceptance_criteria>
    - `types.ts` exportiert 4 Interfaces
    - `errors.ts` exportiert `CircleApiError` + `CircleErrorCode`
    - `CircleApiError.code` + `.statusCode` + `.correlationId` sind readonly
    - `tsc --noEmit` clean
  </acceptance_criteria>
  <done>Types + Errors bereit für client.ts.</done>
</task>

<task type="auto">
  <name>Task B3: Client mit 4 Helpers + Retry-Logic</name>
  <files>packages/circle/src/client.ts</files>
  <read_first>
    - `packages/circle/src/types.ts` + `packages/circle/src/errors.ts` (aus B2)
    - `.planning/phases/25-circle-api-sync/25-CONTEXT.md` D-09 (Idempotenz) + Q4 (SSO-TTL)
    - `apps/tools-app/lib/ratelimit.ts` als Referenz für Pattern "lazy-init + graceful degrade"
  </read_first>
  <action>
Erstelle `packages/circle/src/client.ts`:

```typescript
import { CircleApiError, type CircleErrorCode } from './errors'
import type {
  CircleMember,
  CircleSsoToken,
  CreateMemberInput,
  GenerateSsoInput,
} from './types'

const BASE_URL = 'https://app.circle.so/api/admin/v2'
const DEFAULT_TIMEOUT_MS = 10_000
const DEFAULT_SSO_TTL_SECONDS = 7 * 24 * 60 * 60 // Q4: 7 days
const MAX_RETRIES = 3
const RETRY_DELAYS_MS = [500, 1500, 4500]

interface CircleConfig {
  token: string
  communityId: string
}

/** Lazy-read env vars so tests can mock. Throws CONFIG_MISSING if unset. */
function getConfig(): CircleConfig {
  const token = process.env.CIRCLE_API_TOKEN
  const communityId = process.env.CIRCLE_COMMUNITY_ID
  if (!token || !communityId) {
    throw new CircleApiError(
      'CONFIG_MISSING',
      `Circle config missing: ${!token ? 'CIRCLE_API_TOKEN' : ''}${!token && !communityId ? ', ' : ''}${!communityId ? 'CIRCLE_COMMUNITY_ID' : ''}`,
    )
  }
  return { token, communityId }
}

function classifyError(statusCode: number): CircleErrorCode {
  if (statusCode === 401 || statusCode === 403) return 'UNAUTHORIZED'
  if (statusCode === 404) return 'NOT_FOUND'
  if (statusCode === 409) return 'CONFLICT'
  if (statusCode === 429) return 'RATE_LIMITED'
  if (statusCode >= 500) return 'SERVER_ERROR'
  return 'UNKNOWN'
}

function shouldRetry(code: CircleErrorCode): boolean {
  return code === 'NETWORK_ERROR' || code === 'RATE_LIMITED' || code === 'SERVER_ERROR'
}

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Core fetch wrapper with timeout + retry + typed errors.
 * Returns parsed JSON on success, throws CircleApiError on failure.
 */
async function circleFetch<T>(
  path: string,
  init: RequestInit & { method: 'GET' | 'POST' | 'PUT' | 'DELETE' },
): Promise<T> {
  const { token } = getConfig()
  const url = `${BASE_URL}${path}`
  let lastError: CircleApiError | null = null

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const res = await fetch(url, {
        ...init,
        headers: {
          ...init.headers,
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        signal: AbortSignal.timeout(DEFAULT_TIMEOUT_MS),
      })

      const correlationId = res.headers.get('x-request-id') ?? undefined

      if (!res.ok) {
        const code = classifyError(res.status)
        // Do NOT include response body in message (could leak tokens in
        // debug logs if Circle echoes auth-header in some error paths).
        lastError = new CircleApiError(
          code,
          `Circle API ${init.method} ${path} failed with status ${res.status}`,
          { statusCode: res.status, correlationId },
        )
        if (shouldRetry(code) && attempt < MAX_RETRIES - 1) {
          await sleep(RETRY_DELAYS_MS[attempt] ?? 1000)
          continue
        }
        throw lastError
      }

      return (await res.json()) as T
    } catch (err) {
      if (err instanceof CircleApiError) throw err
      // fetch threw (timeout/DNS/reset)
      lastError = new CircleApiError(
        'NETWORK_ERROR',
        `Circle API ${init.method} ${path} network error: ${err instanceof Error ? err.message : String(err)}`,
        { cause: err },
      )
      if (attempt < MAX_RETRIES - 1) {
        await sleep(RETRY_DELAYS_MS[attempt] ?? 1000)
        continue
      }
      throw lastError
    }
  }

  // Should be unreachable, but TypeScript wants it
  throw lastError ?? new CircleApiError('UNKNOWN', 'Circle API exhausted retries')
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Create a Circle community member. Idempotent: if a member with the same
 * email already exists, returns `{ alreadyExists: true }` with the existing ID.
 * (We do a GET-first to avoid Circle's 409 cost.)
 */
export async function createMember(
  input: CreateMemberInput,
): Promise<{ circleMemberId: string; alreadyExists: boolean }> {
  const existing = await getMemberByEmail(input.email)
  if (existing) {
    return { circleMemberId: existing.circleMemberId, alreadyExists: true }
  }

  const { communityId } = getConfig()
  const member = await circleFetch<CircleMember>('/community_members', {
    method: 'POST',
    body: JSON.stringify({
      email: input.email,
      name: input.name,
      community_id: communityId,
      // Q9: keine Uni/Motivation an Circle — bleibt in Supabase-Metadata
      ...(input.metadata ? { metadata: input.metadata } : {}),
    }),
  })

  return { circleMemberId: String(member.id), alreadyExists: false }
}

/**
 * Look up a Circle member by email. Returns null if not found (404).
 * Any other error bubbles up as CircleApiError.
 */
export async function getMemberByEmail(
  email: string,
): Promise<{ circleMemberId: string } | null> {
  const { communityId } = getConfig()
  try {
    const member = await circleFetch<CircleMember>(
      `/community_members?email=${encodeURIComponent(email)}&community_id=${communityId}`,
      { method: 'GET' },
    )
    return { circleMemberId: String(member.id) }
  } catch (err) {
    if (err instanceof CircleApiError && err.code === 'NOT_FOUND') {
      return null
    }
    throw err
  }
}

/**
 * Add a Circle member to a space. Idempotent — 409 CONFLICT
 * (already in space) is swallowed as success.
 */
export async function addMemberToSpace(
  memberId: string,
  spaceId: string,
): Promise<void> {
  try {
    await circleFetch<unknown>('/space_members', {
      method: 'POST',
      body: JSON.stringify({
        space_id: spaceId,
        community_member_id: memberId,
      }),
    })
  } catch (err) {
    if (err instanceof CircleApiError && err.code === 'CONFLICT') {
      // Already in space — idempotent success
      return
    }
    throw err
  }
}

/**
 * Generate a passwordless SSO login URL for a Circle member.
 * TTL defaults to 7 days (Q4) to match Supabase confirm-link lifetime.
 */
export async function generateSsoUrl(
  input: GenerateSsoInput,
): Promise<{ ssoUrl: string; expiresAt: string }> {
  const token = await circleFetch<CircleSsoToken>('/headless_auth_tokens', {
    method: 'POST',
    body: JSON.stringify({
      community_member_id: input.memberId,
      redirect_path: input.redirectPath ?? '/',
      ttl_seconds: input.ttlSeconds ?? DEFAULT_SSO_TTL_SECONDS,
    }),
  })
  return { ssoUrl: token.sso_url, expiresAt: token.expires_at }
}
```

**Wichtig für Executor:**
- Die Endpoint-Paths (`/community_members`, `/space_members`, `/headless_auth_tokens`) sind **best-guess** basierend auf Circle-Doku-Fragmenten. Zum Execute-Zeitpunkt via Circle-MCP (`get_community`, `list_spaces`, etc.) + Circle-Admin-UI → Developer → API-Docs verifizieren und ggf. Paths/Body-Shapes anpassen.
- Wenn die live API andere Keys verwendet (z.B. `member_id` statt `community_member_id`), **Plan anpassen**, nicht hart-codieren lassen — Plan H E2E-Test wird es eh fangen.
- Response-Bodies parsen defensiv: bei Feld-Namen wie `id` / `member_id` / `community_member_id` beide Varianten akzeptieren.
  </action>
  <verify>
    <automated>test -f packages/circle/src/client.ts && grep -q "export async function createMember" packages/circle/src/client.ts && grep -q "export async function getMemberByEmail" packages/circle/src/client.ts && grep -q "export async function addMemberToSpace" packages/circle/src/client.ts && grep -q "export async function generateSsoUrl" packages/circle/src/client.ts && grep -q "AbortSignal.timeout(10_000)" packages/circle/src/client.ts && grep -q "RETRY_DELAYS_MS" packages/circle/src/client.ts && grep -q "app.circle.so/api/admin/v2" packages/circle/src/client.ts && pnpm --filter @genai/circle exec tsc --noEmit 2>&1 | tail -5</automated>
  </verify>
  <acceptance_criteria>
    - Alle 4 Funktionen exported mit den Signaturen aus `<interfaces>`
    - `AbortSignal.timeout(10_000)` auf jedem fetch-Call
    - Retry-Logic mit `MAX_RETRIES=3` + backoff `[500, 1500, 4500]ms`
    - `createMember` ruft `getMemberByEmail` für Idempotenz zuerst
    - `addMemberToSpace` swallowed `CONFLICT` als Success
    - `getMemberByEmail` returned `null` bei `NOT_FOUND`
    - `getConfig()` wirft `CONFIG_MISSING` bei fehlenden Env-Vars
    - Keine `process.env`-Reads außerhalb `getConfig()` (damit Tests mocken können)
    - `tsc --noEmit` clean
  </acceptance_criteria>
  <done>Client funktional, ready für Unit-Tests + Plan-E-Integration.</done>
</task>

<task type="auto">
  <name>Task B4: Unit-Tests mit gemocktem Fetch</name>
  <files>packages/circle/src/__tests__/client.test.ts, packages/circle/vitest.config.ts</files>
  <read_first>
    - `packages/circle/src/client.ts` (aus B3 — API-Contract)
    - Bestehende Vitest-Configs in anderen Packages (z.B. `packages/auth` falls vorhanden) als Referenz
  </read_first>
  <action>
Erstelle `packages/circle/vitest.config.ts`:

```typescript
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
})
```

Erstelle `packages/circle/src/__tests__/client.test.ts`:

```typescript
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { CircleApiError } from '../errors'
import {
  addMemberToSpace,
  createMember,
  generateSsoUrl,
  getMemberByEmail,
} from '../client'

const ORIGINAL_ENV = { ...process.env }

function mockFetch(responses: Array<Partial<Response> & { body?: unknown; status?: number }>) {
  let call = 0
  global.fetch = vi.fn(async () => {
    const r = responses[call++] ?? { status: 500 }
    const res = {
      ok: (r.status ?? 200) < 400,
      status: r.status ?? 200,
      headers: new Headers({ 'x-request-id': 'test-corr-id' }),
      json: async () => r.body ?? {},
    } as unknown as Response
    return res
  }) as typeof fetch
}

beforeEach(() => {
  process.env.CIRCLE_API_TOKEN = 'test-token'
  process.env.CIRCLE_COMMUNITY_ID = 'test-community'
})

afterEach(() => {
  process.env = { ...ORIGINAL_ENV }
  vi.restoreAllMocks()
})

describe('getConfig (via any call)', () => {
  it('throws CONFIG_MISSING when CIRCLE_API_TOKEN unset', async () => {
    delete process.env.CIRCLE_API_TOKEN
    await expect(getMemberByEmail('a@b.de')).rejects.toMatchObject({
      name: 'CircleApiError',
      code: 'CONFIG_MISSING',
    })
  })

  it('throws CONFIG_MISSING when CIRCLE_COMMUNITY_ID unset', async () => {
    delete process.env.CIRCLE_COMMUNITY_ID
    await expect(getMemberByEmail('a@b.de')).rejects.toMatchObject({
      name: 'CircleApiError',
      code: 'CONFIG_MISSING',
    })
  })
})

describe('getMemberByEmail', () => {
  it('returns member when found', async () => {
    mockFetch([{ status: 200, body: { id: 42, email: 'a@b.de', name: 'A', community_id: '1' } }])
    const result = await getMemberByEmail('a@b.de')
    expect(result).toEqual({ circleMemberId: '42' })
  })

  it('returns null on 404', async () => {
    mockFetch([{ status: 404 }])
    const result = await getMemberByEmail('missing@b.de')
    expect(result).toBeNull()
  })

  it('throws UNAUTHORIZED on 401', async () => {
    mockFetch([{ status: 401 }])
    await expect(getMemberByEmail('a@b.de')).rejects.toMatchObject({ code: 'UNAUTHORIZED' })
  })
})

describe('createMember', () => {
  it('is idempotent — reuses existing member', async () => {
    mockFetch([{ status: 200, body: { id: 42, email: 'a@b.de', name: 'A', community_id: '1' } }])
    const result = await createMember({ email: 'a@b.de', name: 'A' })
    expect(result).toEqual({ circleMemberId: '42', alreadyExists: true })
  })

  it('creates when not found', async () => {
    mockFetch([
      { status: 404 }, // getMemberByEmail miss
      { status: 201, body: { id: 99, email: 'new@b.de', name: 'N', community_id: '1' } },
    ])
    const result = await createMember({ email: 'new@b.de', name: 'N' })
    expect(result).toEqual({ circleMemberId: '99', alreadyExists: false })
  })
})

describe('addMemberToSpace', () => {
  it('resolves on 200', async () => {
    mockFetch([{ status: 200, body: {} }])
    await expect(addMemberToSpace('42', '123')).resolves.toBeUndefined()
  })

  it('swallows 409 (already in space) as success', async () => {
    mockFetch([{ status: 409 }])
    await expect(addMemberToSpace('42', '123')).resolves.toBeUndefined()
  })

  it('propagates 500 as SERVER_ERROR', async () => {
    // 500 retries 3x — all 500
    mockFetch([{ status: 500 }, { status: 500 }, { status: 500 }])
    await expect(addMemberToSpace('42', '123')).rejects.toMatchObject({ code: 'SERVER_ERROR' })
  })
})

describe('generateSsoUrl', () => {
  it('returns sso_url + expires_at', async () => {
    mockFetch([
      {
        status: 200,
        body: {
          sso_url: 'https://community.generation-ai.org/sso?token=xyz',
          expires_at: '2026-05-01T00:00:00Z',
        },
      },
    ])
    const result = await generateSsoUrl({ memberId: '42' })
    expect(result).toEqual({
      ssoUrl: 'https://community.generation-ai.org/sso?token=xyz',
      expiresAt: '2026-05-01T00:00:00Z',
    })
  })

  it('passes custom TTL', async () => {
    const fetchSpy = vi.fn(async () => ({
      ok: true,
      status: 200,
      headers: new Headers(),
      json: async () => ({ sso_url: 'x', expires_at: 'y' }),
    }))
    global.fetch = fetchSpy as unknown as typeof fetch
    await generateSsoUrl({ memberId: '42', ttlSeconds: 3600 })
    const call = fetchSpy.mock.calls[0]?.[1] as RequestInit
    expect(call.body).toContain('"ttl_seconds":3600')
  })
})

describe('retry logic', () => {
  it('retries on 500 then succeeds on attempt 2', async () => {
    mockFetch([
      { status: 500 },
      { status: 200, body: { id: 42, email: 'a@b.de', name: 'A', community_id: '1' } },
    ])
    const result = await getMemberByEmail('a@b.de')
    expect(result).toEqual({ circleMemberId: '42' })
  })

  it('does NOT retry on 401', async () => {
    const fetchSpy = vi.fn(async () => ({
      ok: false,
      status: 401,
      headers: new Headers(),
      json: async () => ({}),
    }))
    global.fetch = fetchSpy as unknown as typeof fetch
    await expect(getMemberByEmail('a@b.de')).rejects.toMatchObject({ code: 'UNAUTHORIZED' })
    expect(fetchSpy).toHaveBeenCalledTimes(1) // no retry
  })
})
```

Nach Write: `pnpm --filter @genai/circle test` muss grün laufen (alle ~10 Tests).
  </action>
  <verify>
    <automated>test -f packages/circle/src/__tests__/client.test.ts && test -f packages/circle/vitest.config.ts && pnpm --filter @genai/circle test 2>&1 | tail -20 | grep -E "passed|PASS"</automated>
  </verify>
  <acceptance_criteria>
    - Test-File existiert mit 10+ Tests
    - `pnpm --filter @genai/circle test` → alle grün
    - Tests decken ab: CONFIG_MISSING, happy-path (getMember/createMember/addMemberToSpace/generateSso), 404-null, 409-swallow, retry-on-500, no-retry-on-401
    - Tests mocken `global.fetch` (kein echter Circle-Call)
  </acceptance_criteria>
  <done>Client ist getestet + ready für Integration.</done>
</task>

</tasks>

<verification>
**Automated gates:**
- `pnpm --filter @genai/circle test` — alle Tests grün
- `pnpm --filter @genai/circle exec tsc --noEmit` — 0 errors
- Bundle-Safety: Plan H wird nach Build prüfen dass `CIRCLE_API_TOKEN` NICHT im Client-Bundle landet.

**Manual:**
- Executor verifiziert Circle-API-Paths gegen live Doku + Circle-MCP `get_community`/`list_spaces` zum Execute-Zeitpunkt.
</verification>

<must_haves>
Siehe `must_haves` im Frontmatter oben.
</must_haves>
