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
**Link:** `user_circle_links.user_id FK auth.users.id` + `raw_user_meta_data.circle_member_id` (Mirror für session-reads).
**Non-Blocking:** Circle-Fehler blockieren Signup nicht (D-03). Retry via Admin-Route.
**Feature-Flag:** `SIGNUP_ENABLED` env var (default `false` = `/api/auth/signup` returnt 503; `submitJoinWaitlist` router delegiert an V1-Waitlist).

## Key Files

| File | Purpose |
|------|---------|
| `apps/website/app/actions/signup.ts` | Haupt-Server-Action (Signup-Orchestrator) |
| `apps/website/app/actions/waitlist.ts` | Router V1↔V2 (Feature-Flag SIGNUP_ENABLED) |
| `apps/website/app/auth/confirm/route.ts` | PKCE Confirm + Circle-SSO-Redirect |
| `apps/website/app/auth/error/page.tsx` | Fehler-Seite (abgelaufener Link etc.) |
| `apps/website/app/api/auth/signup/route.ts` | POST-Endpoint (Wrapper um Server-Action) |
| `apps/website/app/api/admin/circle-reprovision/route.ts` | Admin-Retry-Endpoint |
| `apps/website/app/(fallback)/welcome/page.tsx` | Fallback-UX wenn Circle-SSO scheitert |
| `apps/website/components/welcome/community-banner.tsx` | Banner für Fallback |
| `apps/website/lib/admin-auth.ts` | Admin-Session + Allowlist/Role-Check |
| `apps/website/lib/rate-limit.ts` | Rate-limiter für signup/confirm/admin |
| `packages/circle/` | Circle-API-Client (createMember, generateSsoUrl, etc.) |
| `packages/auth/src/circle.ts` | TypeScript-Types für user_circle_links + CircleUserMetadata |
| `packages/emails/src/templates/confirm-signup.tsx` | Single-CTA-Confirm-Mail (Supabase-Template) |
| `packages/emails/src/templates/waitlist-reinvite.tsx` | Post-launch Waitlist-Re-Invite-Mail |
| `scripts/waitlist-reinvite.ts` | Manuelles One-Shot-Script |
| `supabase/migrations/20260425000001_circle_profile_fields.sql` | `user_circle_links` Table |

## Setup (Pre-Launch)

### 1. Env-Vars in Vercel

Siehe `docs/DEPLOYMENT.md` "Circle-API-Sync (Phase 25)" für Tabelle + Setup-Commands.

Benötigt in prod + preview + dev:

- `CIRCLE_API_TOKEN` (Circle-Admin → Developer → Generate Token)
- `CIRCLE_COMMUNITY_ID` (discovered: `511295` für GenerationAI)
- `CIRCLE_DEFAULT_SPACE_ID` (discovered: `2574363` — "How to", Circle's default_new_member_space_id)
- `CIRCLE_COMMUNITY_URL` = `https://community.generation-ai.org`
- `SIGNUP_ENABLED` (default `false`, flippt in Phase 27)
- `ADMIN_EMAIL_ALLOWLIST` (comma-separated, z.B. `luca@generation-ai.org`)
- `SENTRY_DSN_WEBSITE` + `NEXT_PUBLIC_SENTRY_DSN_WEBSITE` (R6.7)

### 2. Supabase-Migration

```bash
# Via Supabase-MCP (recommended):
mcp__1e7c6bb1-*__apply_migration \
  --name circle_profile_fields \
  --query <contents of 20260425000001_circle_profile_fields.sql>

# Or via CLI (needs supabase link):
supabase db push --project-ref wbohulnuwqrhystaamjc
```

Verify via MCP `list_tables` → `public.user_circle_links` present.

### 3. Email-Template in Supabase-Dashboard

Siehe Sektion "Email-Templates in Supabase-Dashboard einspielen" weiter unten.

### 4. Circle-Welcome-Space prüfen

Via Circle-MCP: `mcp__aae5c88c-*__list_spaces` → ID `2574363` (How to) ist Circle-side bereits als `default_new_member_space_id` konfiguriert. Der explizite `addMemberToSpace`-Call in unserem Signup-Flow ist defense-in-depth.

### 5. Feature-Flag-Gate (Phase 27 Launch-Day)

```bash
# In Vercel-Dashboard prod:
SIGNUP_ENABLED=true
# Trigger redeploy (Vercel auto-detects env changes)
```

## Email-Templates in Supabase-Dashboard einspielen

**Wann:** Nach jedem `pnpm --filter @genai/emails email:export` Run, oder wenn `packages/emails/src/templates/confirm-signup.tsx` geändert wurde.

**Schritte:**

1. Supabase-Dashboard öffnen → Project `wbohulnuwqrhystaamjc` → Authentication → Email Templates.
2. Template "Confirm signup" auswählen.
3. Inhalt aus `apps/website/emails/dist/confirm-signup.html` kopieren und in den Editor einfügen.
4. **Subject** setzen: `Willkommen bei Generation AI 👋`
5. **Speichern** (oben rechts).
6. Test-Mail an Luca's Email senden via "Send test email" Button → visuell prüfen.

**Supabase-Go-Template-Vars (NICHT manuell ersetzen — Supabase injected live):**

- `{{ .ConfirmationURL }}` → der Confirm-Link inkl. Token
- `{{ .Data.full_name }}` → Name aus `raw_user_meta_data.full_name` (wird in Plan E gesetzt)
- `{{ .Email }}` → User-Email

**Rollback:** Wenn neue Version kaputt ist, Git-History von `packages/emails/src/templates/confirm-signup.tsx` nutzen, `email:export` re-runnen, alte HTML ins Dashboard einfügen.

**Automation-Roadmap:** Supabase-Management-API könnte die Templates automatisiert setzen (post-v4.0), aktuell manueller Schritt.

## Waitlist Re-Invite (Q10)

Nach dem Phase-27-Flip von `SIGNUP_ENABLED=true` müssen die Phase-23-Waitlist-Entries informiert werden. One-Shot-Runbook:

### Pre-Check

Via Supabase-MCP `execute_sql`: `SELECT count(*) FROM public.waitlist WHERE notified_at IS NULL;`

### Dry-Run (always first)

```bash
pnpm tsx scripts/waitlist-reinvite.ts --dry-run
```

### Kleiner Testlauf

```bash
pnpm tsx scripts/waitlist-reinvite.ts --limit 1
```

Landet in deinem Postfach? (Voraussetzung: deine Email ist in der Waitlist.)

### Real Run

```bash
pnpm tsx scripts/waitlist-reinvite.ts
```

### Post-Check

```sql
SELECT count(*) FILTER (WHERE notified_at IS NOT NULL) AS sent,
       count(*) FILTER (WHERE notified_at IS NULL)     AS pending
FROM public.waitlist;
```

`pending` sollte 0 sein.

### Rollback

Kein echter Rollback möglich (Mail ist raus). Aber wenn Template kaputt war:

1. `SELECT * FROM waitlist WHERE notified_at > now() - interval '1 hour';`
2. In Resend-Dashboard nach Mail-Sends filtern, Message-IDs sammeln.
3. **Nicht** `UPDATE waitlist SET notified_at = NULL` — das würde Re-Run auslösen.
4. Korrektur-Mail manuell senden.

### Env für Script

`.env.local` (lokal):

- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `RESEND_API_KEY`

## Troubleshooting

### Signup scheitert mit generic error

1. Vercel-Logs checken: `vercel logs <url>`
2. Sentry-Dashboard → Filter `circle-api:true` → letzten Event prüfen
3. Wenn `CircleApiError.code === 'UNAUTHORIZED'` → Token rotieren (Circle-Admin → Tokens)
4. Wenn `CircleApiError.code === 'RATE_LIMITED'` → kurz warten, Circle hat Tempo-Limits

### User ohne circle_member_id

Admin-Reprovision-Route callen:

```bash
curl -X POST https://generation-ai.org/api/admin/circle-reprovision \
  -H "Content-Type: application/json" \
  -H "Cookie: <admin-session-cookie>" \
  -d '{"email": "user@example.com"}'
```

Response: `{ ok: true, circleMemberId: "...", alreadyExists: false|true }`

Falls 502 → Sentry-Event für Details prüfen.

### Fallback-Welcome-Page triggert für alle User

Indikator dass **jeder** Signup Circle-Fehler hat. Check:

1. `CIRCLE_API_TOKEN` gesetzt? Korrekt?
2. Circle-Community-Plan aktiv? (Business erforderlich für API)
3. Token-Scopes (Circle-Dashboard → Token → Permissions)

## Monitoring

- **Sentry:** Tag-Filter `circle-api:true` + `op:createMember|generateSsoUrl|addMemberToSpace|adminReprovision`. DSN in Vercel-Env (`SENTRY_DSN_WEBSITE` server, `NEXT_PUBLIC_SENTRY_DSN_WEBSITE` client).
- **Better Stack:** HTTP-Check auf `/api/auth/signup` → sollte 503 (default) oder 200 (flipped) liefern, nie 500.
- **Supabase:** Monitor `auth.users` count vs `user_circle_links` count — grosser Drift = Circle-Sync kaputt. Admin-Reprovision-Route anwenden.
