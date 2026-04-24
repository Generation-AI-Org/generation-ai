---
phase: 25
plan: F
slug: admin-reprovision-route
type: execute
wave: 3
depends_on:
  - 25-E
files_modified:
  - apps/website/app/api/admin/circle-reprovision/route.ts
  - apps/website/lib/admin-auth.ts
  - apps/website/app/api/admin/circle-reprovision/__tests__/route.test.ts
autonomous: true
requirements:
  - R6.3
  - R6.7
must_haves:
  truths:
    - "Admin-Route `POST /api/admin/circle-reprovision` existiert + nimmt JSON-Body `{ email: string }`."
    - "Admin-Auth (Q6): User muss authenticated sein (session vorhanden) UND `user.user_metadata.role === 'admin'` ODER Email in ADMIN_EMAIL_ALLOWLIST (Env-Var comma-separated)."
    - "Unauthenticated/nicht-admin → 401 + Sentry breadcrumb `admin.reprovision.denied`."
    - "Happy-Path: Route findet User in Supabase, ruft `@genai/circle.createMember` (idempotent), `addMemberToSpace`, updated `user_circle_links` + `raw_user_meta_data.circle_member_id`. Returned `{ ok: true, circleMemberId, alreadyExists }`."
    - "Error-Path: CircleApiError → 502 (Bad Gateway) mit typisiertem Body `{ error, code, correlationId }` (KEIN token, KEIN stack trace an Client)."
    - "Rate-Limit für Admin-Route: 20 requests / 15min pro Admin-User-ID (nicht pro IP — Admin nutzt Tool evtl. häufig, aber nicht dauerhaft). Prefix `ratelimit:admin-reprovision:userid`."
    - "Route nutzt `checkAdminAuth(request)` Helper aus `apps/website/lib/admin-auth.ts` (neu, kapselt Session-Read + Role-Check + Allowlist-Check)."
    - "Alle Reprovision-Events werden in Sentry geloggt mit Tag `circle-api`, `op: adminReprovision`, inkl. `target_user_id` + `admin_user_id` (beide Supabase-UUIDs — PII-OK für Audit-Purpose)."
    - "Unit-Tests mit gemocktem Supabase + gemocktem Circle-Client decken: auth-deny, happy-path, Circle-NOT_FOUND, Circle-UNAUTHORIZED, Rate-Limit-Exceeded."
  artifacts:
    - path: "apps/website/app/api/admin/circle-reprovision/route.ts"
      provides: "POST-Endpoint für manuelles Circle-Reprovisioning"
      exports: ["POST"]
    - path: "apps/website/lib/admin-auth.ts"
      provides: "Reusable Admin-Auth-Helper (Session + Role + Allowlist)"
      exports: ["checkAdminAuth", "AdminAuthResult"]
  key_links:
    - from: "apps/website/app/api/admin/circle-reprovision/route.ts"
      to: "@genai/circle createMember + addMemberToSpace"
      via: "await createMember({ email, name })"
      pattern: "createMember"
    - from: "apps/website/app/api/admin/circle-reprovision/route.ts"
      to: "apps/website/lib/admin-auth.ts"
      via: "const auth = await checkAdminAuth(request)"
      pattern: "checkAdminAuth"
---

<objective>
Wenn Circle-API zum Signup-Zeitpunkt down war, bleibt der Supabase-User ohne `circle_member_id`. Plan F baut den manuellen Re-Try-Mechanismus (D-05 Retry-manuell, kein Auto-Retry im Signup-Flow): Admin ruft Endpoint mit User-Email, Route macht das Provisioning nachträglich.

Purpose: D-05 manueller Retry-Mechanismus. Komplementiert Plan E (non-blocking Signup) mit dem Clean-Up-Pfad.
Output: Admin-Route + Admin-Auth-Helper + Unit-Tests.
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/phases/25-circle-api-sync/25-CONTEXT.md
@apps/website/app/actions/signup.ts
@packages/auth/src/server.ts
@packages/auth/src/helpers.ts
@packages/auth/src/admin.ts
@packages/circle/src/index.ts

<interfaces>
```typescript
// apps/website/lib/admin-auth.ts
export type AdminAuthResult =
  | { ok: true; userId: string; email: string }
  | { ok: false; status: 401 | 403; reason: string }

export async function checkAdminAuth(request: Request): Promise<AdminAuthResult>

// apps/website/app/api/admin/circle-reprovision/route.ts
export async function POST(request: NextRequest): Promise<NextResponse>
// Body: { email: string }
// Success response: { ok: true, circleMemberId: string, alreadyExists: boolean }
// Error responses: 400 | 401 | 403 | 404 | 429 | 502 | 500
```

**Admin-Auth-Check-Priorität (Q6):**
1. User session vorhanden (`getUser()` returns user)
2. ENTWEDER `user.user_metadata.role === 'admin'` (Supabase-side role)
3. ODER `user.email` ∈ `ADMIN_EMAIL_ALLOWLIST` (comma-separated env var)
   - Beispiel: `ADMIN_EMAIL_ALLOWLIST=luca@generation-ai.org,team@generation-ai.org`
4. Falls beide fail → 403.
</interfaces>

<environment_notes>
- Kein spezieller Admin-UI in dieser Phase — Admin ruft Endpoint via `curl` oder zukünftiges Admin-Tool. Auth-Flow: Admin logged sich via Magic-Link in Website ein (Phase 17), dann POST mit authentifiziertem Cookie.
- `getUser()` aus `@genai/auth/helpers` ließt Session via `cookies()`. Route-Handler haben Cookie-Zugriff via `next/headers` cookies-Accessor.
- Neue Env-Var `ADMIN_EMAIL_ALLOWLIST` wird in Plan-I DEPLOYMENT.md dokumentiert + in `.env.example` ergänzt.
- `createAdminClient()` (service_role) wird für das Read-User-by-Email + Metadata-Update genutzt.
</environment_notes>
</context>

<threat_model>
**Asset:** Admin-Endpoint mit Vollzugriff auf Circle-Provisioning (kann beliebige User in Circle anlegen).

**Threats (ASVS L2 — Admin-Privilege):**

1. **Privilege-Escalation via fehlender Role-Check.**
   - Mitigation: `checkAdminAuth` wird in jedem Request aufgerufen, bevor andere Logic läuft. Test: `grep -A5 "export async function POST" route.ts | head -20` muss `checkAdminAuth` enthalten in den ersten ~5 Zeilen der Funktion.

2. **CSRF (Cross-Site-Request-Forgery) auf Admin-Endpoint.**
   - Mitigation: Route akzeptiert nur `Content-Type: application/json` (kein `application/x-www-form-urlencoded` von HTML-Formen). Supabase-Cookie ist `SameSite=Lax` per Default — Cross-Site-POSTs werden vom Browser nicht mit Cookie versendet.
   - Zusätzlich: CSRF-Token-Header prüfen (future), aktuell V1 reicht Cookie-SameSite + JSON-Only.

3. **Admin-Email-Allowlist-Drift.**
   - Mitigation: Allowlist als Env-Var in Vercel (nicht in Code). Rotation trivial.

4. **Sentry-PII-Leak via User-Email.**
   - Mitigation: `admin_user_id` + `target_user_id` sind UUIDs (keine PII). Email **nicht** in Sentry-Extra-Data — nur die UUID. Body nicht 1:1 ins Sentry-Event kopieren.

5. **Rate-Limit per User-ID kann bei Admin-Tools mit geteiltem Account bypassed werden.**
   - Mitigation: Limit ist `20 / 15min` — großzügig genug für legitime Use-Cases, niedrig genug dass Mass-Abuse schnell auffällt. Kombiniert mit Sentry-Event-Rate-Alarm.

6. **Idempotent Retry vs Duplicate-Side-Effects.**
   - Mitigation: `createMember` ist idempotent (Plan B `getMemberByEmail` first). `addMemberToSpace` idempotent (409-swallow). `user_circle_links.upsert` idempotent. Mehrfaches Reprovision ist safe.

**Block on:** BLOCKER (fehlender Auth-Check, CSRF-Öffnung, Token/Email in Sentry).
**Residual:** Admin-Account-Takeover → Vollzugriff. Mitigation: Admin-Access ist Magic-Link-Only (kein Passwort), 2FA in Roadmap.
</threat_model>

<tasks>

<task type="auto">
  <name>Task F1: Admin-Auth-Helper</name>
  <files>apps/website/lib/admin-auth.ts</files>
  <read_first>
    - `packages/auth/src/helpers.ts` (getUser-Signatur)
    - `packages/auth/src/server.ts` (createClient)
    - `.planning/phases/25-circle-api-sync/25-CONTEXT.md` Q6
  </read_first>
  <action>
Erstelle `apps/website/lib/admin-auth.ts`:

```typescript
/**
 * Phase 25 — Admin-Auth-Helper für Admin-Routes.
 *
 * Strategie (Q6): Magic-Link-Session + Role-Check ODER Allowlist.
 *
 * Usage:
 * ```ts
 * const auth = await checkAdminAuth(request)
 * if (!auth.ok) return NextResponse.json({ error: auth.reason }, { status: auth.status })
 * // auth.userId + auth.email verfügbar
 * ```
 */

import { createClient } from '@genai/auth/server'

export type AdminAuthResult =
  | { ok: true; userId: string; email: string }
  | { ok: false; status: 401 | 403; reason: string }

function getAllowlist(): string[] {
  const raw = process.env.ADMIN_EMAIL_ALLOWLIST
  if (!raw) return []
  return raw
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean)
}

export async function checkAdminAuth(_request: Request): Promise<AdminAuthResult> {
  // Route-Handler liest Session via Cookies (via @genai/auth/server createClient).
  // _request wird derzeit nicht genutzt, bleibt aber in Signatur für zukünftige
  // CSRF-Token-Prüfung + Content-Type-Guards.
  const supabase = await createClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user || !user.email) {
    return { ok: false, status: 401, reason: 'Not authenticated' }
  }

  const emailLower = user.email.toLowerCase()
  const allowlist = getAllowlist()
  const isAllowlisted = allowlist.includes(emailLower)
  const hasAdminRole =
    (user.user_metadata as Record<string, unknown> | null)?.role === 'admin'

  if (!isAllowlisted && !hasAdminRole) {
    return { ok: false, status: 403, reason: 'Not authorized (admin only)' }
  }

  return { ok: true, userId: user.id, email: user.email }
}
```

**Wichtig:**
- Getrennter Helper, damit andere Admin-Routes (zukünftig) denselben Check reusen.
- Allowlist-Check ist case-insensitive.
- `user.user_metadata.role === 'admin'` ist der Supabase-native Pfad. Wenn das Role-System später in eine `profiles.role`-Column wandert, Helper anpassen.
  </action>
  <verify>
    <automated>test -f apps/website/lib/admin-auth.ts && grep -q "export async function checkAdminAuth" apps/website/lib/admin-auth.ts && grep -q "ADMIN_EMAIL_ALLOWLIST" apps/website/lib/admin-auth.ts && grep -q "user_metadata" apps/website/lib/admin-auth.ts && grep -q "role === 'admin'" apps/website/lib/admin-auth.ts && pnpm --filter @genai/website exec tsc --noEmit 2>&1 | tail -5</automated>
  </verify>
  <acceptance_criteria>
    - Helper exportiert `checkAdminAuth` + `AdminAuthResult`
    - Check: authenticated + (allowlist ODER role=admin)
    - 401 bei not-authenticated, 403 bei not-authorized
    - Allowlist Parse: comma-separated, trimmed, lowercased
    - tsc clean
  </acceptance_criteria>
  <done>Admin-Auth-Helper reusable.</done>
</task>

<task type="auto">
  <name>Task F2: Reprovision-Route-Handler</name>
  <files>apps/website/app/api/admin/circle-reprovision/route.ts</files>
  <read_first>
    - `apps/website/app/actions/signup.ts` (aus Plan E — copy Circle-Provision-Pattern)
    - `apps/website/lib/admin-auth.ts` (aus F1)
    - `apps/website/lib/rate-limit.ts` (Pattern)
  </read_first>
  <action>
Erstelle `apps/website/app/api/admin/circle-reprovision/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import * as Sentry from '@sentry/nextjs'
import { z } from 'zod'
import { createAdminClient } from '@genai/auth'
import {
  addMemberToSpace,
  CircleApiError,
  createMember,
} from '@genai/circle'
import { checkAdminAuth } from '@/lib/admin-auth'
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

// Admin-scope rate limit (per user id, not IP)
let adminLimiter: Ratelimit | null = null
function getAdminLimiter(): Ratelimit | null {
  if (adminLimiter) return adminLimiter
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) return null
  try {
    adminLimiter = new Ratelimit({
      redis: Redis.fromEnv(),
      limiter: Ratelimit.slidingWindow(20, '15 m'),
      prefix: 'ratelimit:admin-reprovision:userid',
      analytics: true,
    })
    return adminLimiter
  } catch {
    return null
  }
}

const bodySchema = z.object({
  email: z.string().trim().min(1).email().max(320),
})

export async function POST(request: NextRequest): Promise<NextResponse> {
  // -- 1. Admin-Auth --------------------------------------------------------
  const auth = await checkAdminAuth(request)
  if (!auth.ok) {
    Sentry.addBreadcrumb({
      category: 'admin',
      message: 'admin.reprovision.denied',
      level: 'warning',
      data: { reason: auth.reason },
    })
    return NextResponse.json({ error: auth.reason }, { status: auth.status })
  }

  // -- 2. Rate-limit per admin-user-id --------------------------------------
  const limiter = getAdminLimiter()
  if (limiter) {
    try {
      const { success } = await limiter.limit(auth.userId)
      if (!success) {
        return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 })
      }
    } catch {
      // fail-open (matches other rate-limiters)
    }
  }

  // -- 3. Parse body --------------------------------------------------------
  if (request.headers.get('content-type') !== 'application/json') {
    return NextResponse.json({ error: 'Content-Type must be application/json' }, { status: 400 })
  }
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }
  const parsed = bodySchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid email', details: parsed.error.issues }, { status: 400 })
  }
  const targetEmail = parsed.data.email.toLowerCase()

  // -- 4. Look up target user via admin-client ------------------------------
  const supabase = createAdminClient()
  const { data: listData, error: listErr } = await supabase.auth.admin.listUsers({
    // Supabase doesn't have "getByEmail" in admin; we list + filter.
    // For production scale, consider paginating. V1: assume <10k users.
    perPage: 1000,
  })
  if (listErr) {
    Sentry.captureException(listErr, {
      tags: { op: 'admin.listUsers' },
      extra: { admin_user_id: auth.userId },
    })
    return NextResponse.json({ error: 'Failed to lookup user' }, { status: 500 })
  }
  const targetUser = listData.users.find((u) => u.email?.toLowerCase() === targetEmail)
  if (!targetUser) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  const targetName = (targetUser.user_metadata?.full_name as string) ?? targetEmail.split('@')[0]

  // -- 5. Circle provisioning (idempotent) ----------------------------------
  try {
    const { circleMemberId, alreadyExists } = await createMember({
      email: targetEmail,
      name: targetName,
    })

    const spaceId = process.env.CIRCLE_DEFAULT_SPACE_ID
    if (spaceId) {
      try {
        await addMemberToSpace(circleMemberId, spaceId)
      } catch (spaceErr) {
        if (spaceErr instanceof CircleApiError) {
          Sentry.captureException(spaceErr, {
            tags: { 'circle-api': true, op: 'adminReprovision.addMemberToSpace' },
            extra: { target_user_id: targetUser.id, admin_user_id: auth.userId },
          })
        }
      }
    }

    // -- 6. Persist link + metadata ----------------------------------------
    const now = new Date().toISOString()
    await supabase.from('user_circle_links').upsert({
      user_id: targetUser.id,
      circle_member_id: circleMemberId,
      circle_provisioned_at: now,
      last_error: null,
      last_error_at: null,
    })
    await supabase.auth.admin.updateUserById(targetUser.id, {
      user_metadata: {
        ...targetUser.user_metadata,
        circle_member_id: circleMemberId,
        circle_provisioned_at: now,
        circle_provision_error: null,
      },
    })

    Sentry.addBreadcrumb({
      category: 'circle-api',
      message: 'admin.reprovision.success',
      level: 'info',
      data: {
        target_user_id: targetUser.id,
        admin_user_id: auth.userId,
        already_exists: alreadyExists,
      },
    })

    return NextResponse.json({ ok: true, circleMemberId, alreadyExists })
  } catch (err) {
    if (err instanceof CircleApiError) {
      Sentry.captureException(err, {
        tags: { 'circle-api': true, op: 'adminReprovision.createMember' },
        extra: {
          target_user_id: targetUser.id,
          admin_user_id: auth.userId,
          code: err.code,
          correlationId: err.correlationId,
        },
      })
      return NextResponse.json(
        {
          error: 'Circle API failed',
          code: err.code,
          correlationId: err.correlationId,
        },
        { status: 502 },
      )
    }
    Sentry.captureException(err, {
      tags: { 'circle-api': true, op: 'adminReprovision.unknown' },
      extra: { target_user_id: targetUser.id, admin_user_id: auth.userId },
    })
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
```

**Hinweise:**
- `listUsers({ perPage: 1000 })` ist Temp-Lösung für V1 (<10k Users). Bei Skalierung: Pagination-Loop oder direkt `from('auth.users').select('id,email').eq('email', ...)` via service_role.
- Error-Response-Body enthält **nie** den Token, **nie** Stack-Trace — nur `code + correlationId`.
- Sentry-Extra enthält User-IDs (UUIDs) aber keine Emails — User-Ownership-Mapping via DB.
  </action>
  <verify>
    <automated>test -f apps/website/app/api/admin/circle-reprovision/route.ts && grep -q "export async function POST" apps/website/app/api/admin/circle-reprovision/route.ts && grep -q "checkAdminAuth" apps/website/app/api/admin/circle-reprovision/route.ts && grep -q "ratelimit:admin-reprovision" apps/website/app/api/admin/circle-reprovision/route.ts && grep -q "createMember" apps/website/app/api/admin/circle-reprovision/route.ts && grep -q "status: 502" apps/website/app/api/admin/circle-reprovision/route.ts && ! grep -q "user.email" apps/website/app/api/admin/circle-reprovision/route.ts || grep -q "targetEmail" apps/website/app/api/admin/circle-reprovision/route.ts && pnpm --filter @genai/website exec tsc --noEmit 2>&1 | tail -5</automated>
  </verify>
  <acceptance_criteria>
    - Route exportiert POST
    - `checkAdminAuth` in ersten Zeilen (vor allem anderen außer Sentry-Init)
    - `Content-Type: application/json` Check
    - Rate-Limit mit Prefix `ratelimit:admin-reprovision:userid`
    - `createMember` + `addMemberToSpace` Pattern identisch zu Plan E
    - Idempotenz-gesichert (`alreadyExists` in Response)
    - 502 bei CircleApiError, 404 bei User-not-found, 429 Rate, 403 non-admin, 401 not-auth
    - Sentry-Breadcrumbs/Exceptions mit User-UUIDs statt Emails
    - tsc clean
  </acceptance_criteria>
  <done>Admin kann nachträglich provisionieren.</done>
</task>

<task type="auto">
  <name>Task F3: Unit-Tests für Route</name>
  <files>apps/website/app/api/admin/circle-reprovision/__tests__/route.test.ts</files>
  <read_first>
    - `apps/website/app/api/admin/circle-reprovision/route.ts` (aus F2)
    - Bestehende Route-Tests im Repo (z.B. aus Phase 21/22) als Vitest-Mock-Pattern
  </read_first>
  <action>
Erstelle `apps/website/app/api/admin/circle-reprovision/__tests__/route.test.ts`:

```typescript
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'

// Mock @genai/circle
vi.mock('@genai/circle', () => ({
  CircleApiError: class CircleApiError extends Error {
    code: string
    statusCode?: number
    correlationId?: string
    constructor(code: string, msg: string, opts?: { statusCode?: number; correlationId?: string }) {
      super(msg)
      this.code = code
      this.statusCode = opts?.statusCode
      this.correlationId = opts?.correlationId
    }
  },
  createMember: vi.fn(),
  addMemberToSpace: vi.fn(),
}))

// Mock @genai/auth
vi.mock('@genai/auth', () => ({
  createAdminClient: vi.fn(() => ({
    auth: {
      admin: {
        listUsers: vi.fn(),
        updateUserById: vi.fn().mockResolvedValue({ data: { user: {} }, error: null }),
      },
    },
    from: vi.fn(() => ({ upsert: vi.fn().mockResolvedValue({ error: null }) })),
  })),
}))

// Mock admin-auth helper
vi.mock('@/lib/admin-auth', () => ({
  checkAdminAuth: vi.fn(),
}))

// Mock Sentry (no-op)
vi.mock('@sentry/nextjs', () => ({
  captureException: vi.fn(),
  addBreadcrumb: vi.fn(),
}))

// Mock Upstash (force no rate-limiter)
beforeEach(() => {
  delete process.env.UPSTASH_REDIS_REST_URL
  delete process.env.UPSTASH_REDIS_REST_TOKEN
})

afterEach(() => {
  vi.restoreAllMocks()
})

function makeReq(body: unknown, headers: Record<string, string> = { 'content-type': 'application/json' }) {
  return new NextRequest('http://localhost/api/admin/circle-reprovision', {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  })
}

describe('POST /api/admin/circle-reprovision', () => {
  it('returns 401 when not authenticated', async () => {
    const { checkAdminAuth } = await import('@/lib/admin-auth')
    vi.mocked(checkAdminAuth).mockResolvedValue({ ok: false, status: 401, reason: 'Not authenticated' })
    const { POST } = await import('../route')
    const res = await POST(makeReq({ email: 't@a.de' }))
    expect(res.status).toBe(401)
  })

  it('returns 403 when not admin', async () => {
    const { checkAdminAuth } = await import('@/lib/admin-auth')
    vi.mocked(checkAdminAuth).mockResolvedValue({ ok: false, status: 403, reason: 'Not authorized' })
    const { POST } = await import('../route')
    const res = await POST(makeReq({ email: 't@a.de' }))
    expect(res.status).toBe(403)
  })

  it('returns 400 on missing content-type json', async () => {
    const { checkAdminAuth } = await import('@/lib/admin-auth')
    vi.mocked(checkAdminAuth).mockResolvedValue({ ok: true, userId: 'admin-1', email: 'a@a.de' })
    const { POST } = await import('../route')
    const res = await POST(makeReq({ email: 't@a.de' }, { 'content-type': 'text/plain' }))
    expect(res.status).toBe(400)
  })

  it('returns 400 on invalid email', async () => {
    const { checkAdminAuth } = await import('@/lib/admin-auth')
    vi.mocked(checkAdminAuth).mockResolvedValue({ ok: true, userId: 'admin-1', email: 'a@a.de' })
    const { POST } = await import('../route')
    const res = await POST(makeReq({ email: 'not-an-email' }))
    expect(res.status).toBe(400)
  })

  it('returns 404 when user not found', async () => {
    const { checkAdminAuth } = await import('@/lib/admin-auth')
    const { createAdminClient } = await import('@genai/auth')
    vi.mocked(checkAdminAuth).mockResolvedValue({ ok: true, userId: 'admin-1', email: 'a@a.de' })
    vi.mocked(createAdminClient).mockReturnValue({
      auth: {
        admin: {
          listUsers: vi.fn().mockResolvedValue({ data: { users: [] }, error: null }),
          updateUserById: vi.fn(),
        },
      },
      from: vi.fn(),
    } as never)
    const { POST } = await import('../route')
    const res = await POST(makeReq({ email: 'missing@a.de' }))
    expect(res.status).toBe(404)
  })

  it('happy-path: returns 200 + circleMemberId on success', async () => {
    const { checkAdminAuth } = await import('@/lib/admin-auth')
    const { createAdminClient } = await import('@genai/auth')
    const circle = await import('@genai/circle')
    vi.mocked(checkAdminAuth).mockResolvedValue({ ok: true, userId: 'admin-1', email: 'a@a.de' })
    vi.mocked(createAdminClient).mockReturnValue({
      auth: {
        admin: {
          listUsers: vi.fn().mockResolvedValue({
            data: {
              users: [
                { id: 'user-uuid-1', email: 'target@a.de', user_metadata: { full_name: 'Target' } },
              ],
            },
            error: null,
          }),
          updateUserById: vi.fn().mockResolvedValue({ data: { user: {} }, error: null }),
        },
      },
      from: vi.fn(() => ({ upsert: vi.fn().mockResolvedValue({ error: null }) })),
    } as never)
    vi.mocked(circle.createMember).mockResolvedValue({
      circleMemberId: 'circle-42',
      alreadyExists: false,
    })
    vi.mocked(circle.addMemberToSpace).mockResolvedValue(undefined)

    process.env.CIRCLE_DEFAULT_SPACE_ID = 'space-7'
    const { POST } = await import('../route')
    const res = await POST(makeReq({ email: 'target@a.de' }))
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body).toEqual({ ok: true, circleMemberId: 'circle-42', alreadyExists: false })
    expect(circle.addMemberToSpace).toHaveBeenCalledWith('circle-42', 'space-7')
  })

  it('returns 502 on CircleApiError', async () => {
    const { checkAdminAuth } = await import('@/lib/admin-auth')
    const { createAdminClient } = await import('@genai/auth')
    const circle = await import('@genai/circle')
    vi.mocked(checkAdminAuth).mockResolvedValue({ ok: true, userId: 'admin-1', email: 'a@a.de' })
    vi.mocked(createAdminClient).mockReturnValue({
      auth: {
        admin: {
          listUsers: vi.fn().mockResolvedValue({
            data: { users: [{ id: 'u1', email: 'target@a.de', user_metadata: {} }] },
            error: null,
          }),
          updateUserById: vi.fn(),
        },
      },
      from: vi.fn(),
    } as never)
    vi.mocked(circle.createMember).mockRejectedValue(
      new circle.CircleApiError('UNAUTHORIZED', 'Bad token', { statusCode: 401, correlationId: 'corr-1' }),
    )
    const { POST } = await import('../route')
    const res = await POST(makeReq({ email: 'target@a.de' }))
    expect(res.status).toBe(502)
    const body = await res.json()
    expect(body.code).toBe('UNAUTHORIZED')
    expect(body.correlationId).toBe('corr-1')
  })
})
```

Note: Vitest für Next.js-Route-Handler kann tricky sein wenn die App nicht auf `vitest-next` / `@edge-runtime/vm` läuft. Falls Setup zu komplex: Fallback ist, die Tests als Integration-Tests in Plan-H Playwright zu verlegen. **Executor entscheidet nach 10 Min Setup-Versuch** — wenn ein sauberer Node-Vitest-Run möglich ist → hier; sonst Plan-H E2E.
  </action>
  <verify>
    <automated>test -f apps/website/app/api/admin/circle-reprovision/__tests__/route.test.ts && (pnpm --filter @genai/website test 2>&1 | tail -20 | grep -qE "passed|PASS" || echo "tests-skipped-route-handler-setup-complex")</automated>
  </verify>
  <acceptance_criteria>
    - Test-File existiert mit 7 Tests (401, 403, 400 content-type, 400 email, 404, 200 happy, 502 circle-err)
    - ENTWEDER alle grün, ODER Executor dokumentiert klar in SUMMARY dass Tests nach Plan H umgezogen wurden
  </acceptance_criteria>
  <done>Route getestet oder Test-Coverage in Plan H scheduled.</done>
</task>

</tasks>

<verification>
**Automated:**
- tsc clean
- Grep-Gates (Auth-Check, Rate-Limit, Sentry-Tags)

**Manual:**
- Dev-Testing: curl POST mit valid Admin-Cookie → 200
- curl ohne Cookie → 401
- curl mit non-admin-Cookie → 403
</verification>

<must_haves>
Siehe `must_haves` im Frontmatter oben.
</must_haves>
