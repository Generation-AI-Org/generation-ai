# External Integrations

**Analysis Date:** 2026-04-19

## APIs & External Services

**LLM Providers (tools-app):**
- **Google Gemini** — primary public-chat model (`gemini-2.5-flash-lite`) and agent model (`gemini-3-flash` per `CLAUDE.md`)
  - SDK: `@ai-sdk/google` via Vercel AI SDK (`ai`)
  - Wired in: `apps/tools-app/lib/llm.ts`
  - Auth: `GOOGLE_GENERATIVE_AI_API_KEY`
- **Anthropic Claude** — agent path (`claude-haiku-4-5-20251001`)
  - SDK: `@anthropic-ai/sdk`
  - Wired in: `apps/tools-app/lib/agent.ts`
  - Auth: `ANTHROPIC_API_KEY`
- **OpenAI** — client present but not on hot path
  - SDK: `openai`
  - Auth: not currently referenced in code (kept for compatibility)
- **Zhipu / MiniMax** — optional, validated as optional in `apps/tools-app/lib/env.ts`
  - Auth: `ZHIPU_API_KEY`, `MINIMAX_API_KEY`

**Web Search & Content (tools-app):**
- **Exa.ai** — trusted web search for agent
  - Wired in: `apps/tools-app/lib/exa.ts`
  - Auth: `EXA_API_KEY`
- **Firecrawl** — URL extraction fallback
  - Wired in: `apps/tools-app/app/api/defuddle/route.ts`
  - Auth: `FIRECRAWL_API_KEY`
- **Mozilla Readability** — local content extraction (`@mozilla/readability`) used by `apps/tools-app/app/api/extract-url/`

**Voice (tools-app):**
- **Deepgram** — speech-to-text + ephemeral token issuance
  - Wired in: `apps/tools-app/app/api/voice/transcribe/route.ts`, `apps/tools-app/app/api/voice/token/route.ts`
  - Auth: `DEEPGRAM_API_KEY`

**Email (website):**
- **Resend** — transactional email delivery
  - SDK: `resend` ^6.10.0
  - Wired in: `apps/website/lib/email.ts` (sendMagicLinkEmail)
  - Auth: `RESEND_API_KEY`
  - From: `Generation AI <noreply@generation-ai.org>`
- **react-email** — template authoring in `packages/emails/src/templates/` (confirm-signup, magic-link, recovery)
  - Build/export: `pnpm --filter @genai/emails email:export` → `apps/website/emails/dist/*.html`
  - Dev preview: `email:dev` on port 3030

**Community (external, soft SSO):**
- **Circle.so** — community at `community.generation-ai.org`
  - Linked from: `apps/tools-app/components/layout/GlobalLayout.tsx`
  - Auth: `CIRCLE_API_TOKEN`, `CIRCLE_COMMUNITY_ID`, `CIRCLE_COMMUNITY_URL` (whitelisted in `turbo.json`; not yet read by app code — provisioned for future server-side calls)
  - Flow: same email across Supabase + Circle for soft SSO; no direct API integration in repo currently

**Mail forwarding (operational, not in code):**
- **ImprovMX** — forwards `admin@generation-ai.org` and similar (per user memory `reference_mail_forwarding.md`)

## Data Storage

**Databases:**
- **Supabase Postgres** (shared instance: `wbohulnuwqrhystaamjc.supabase.co`)
  - Auth: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` (browser/SSR), `SUPABASE_SERVICE_ROLE_KEY` (server-only admin)
  - Client factory: `packages/auth/src/{browser,server,admin,middleware}.ts` exposed via `@genai/auth`, `@genai/auth/server`, `@genai/auth/admin`, `@genai/auth/middleware`
  - Used in: `apps/tools-app/lib/supabase.ts`, `apps/website/lib/supabase/`, all API routes
  - Migrations: `supabase/` (root), `apps/website/supabase/`, `apps/tools-app/supabase/`

**File Storage:**
- Local filesystem for build artifacts only (no external object storage configured)
- Brand assets in `brand/` and per-app `public/`

**Caching / Rate Limiting:**
- **Upstash Redis** — sliding-window rate limits (10/min IP, 60/h session)
  - Wired in: `apps/tools-app/lib/ratelimit.ts` (`Redis.fromEnv()`)
  - Auth: `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`
  - Optional with graceful degradation per Zod schema

## Authentication & Identity

**Auth Provider:**
- **Supabase Auth** — magic-link based, cookie-bound sessions via `@supabase/ssr`
- Cross-app session sharing via `NEXT_PUBLIC_COOKIE_DOMAIN` (set in both `next.config.ts` files) — enables `.generation-ai.org` cookie scope between website and tools-app
- Sign-up endpoint currently disabled (returns 503): `apps/website/app/api/auth/signup/route.ts`
- Account deletion: `apps/tools-app/app/api/account/delete/`
- Sign-out: `apps/tools-app/app/auth/signout/route.ts`
- Middleware/proxy: `apps/website/proxy.ts`, `apps/tools-app/proxy.ts` (also handle CSP nonce — see `LEARNINGS.md`)

## Monitoring & Observability

**Error Tracking:**
- **Sentry** (tools-app only)
  - Config: `apps/tools-app/sentry.server.config.ts`, `apps/tools-app/sentry.edge.config.ts`, `apps/tools-app/instrumentation.ts`, `apps/tools-app/instrumentation-client.ts`
  - DSN hardcoded in server config (project: `o4511218002362368`)
  - Build wrapped via `withSentryConfig` in `apps/tools-app/next.config.ts`
  - `tracesSampleRate: 1`, `enableLogs: true`, `sendDefaultPii: true`

**Performance:**
- **Vercel Speed Insights** (`@vercel/speed-insights`) in both apps

**Uptime:**
- **Better Stack** monitors `generation-ai.org`, `tools.generation-ai.org`, `community.generation-ai.org` (configured externally; see `.planning/research/monitoring.md`)

**Logs:**
- `console.error` / `console.log` shipped to Vercel logs and (in tools-app) forwarded to Sentry via `enableLogs: true`

**Analytics:**
- Internal analytics module: `apps/tools-app/lib/analytics.ts`

## CI/CD & Deployment

**Hosting:**
- Vercel — two projects (website, tools-app)
- Build version surfaced via `NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA` (mapped from `VERCEL_GIT_COMMIT_SHA` in `apps/tools-app/next.config.ts`)

**CI Pipeline:**
- No GitHub Actions in repo (no `.github/workflows/` detected)
- Vercel handles preview + prod deploys on push
- Sentry source maps uploaded silently unless `CI=true`

**Versioning:**
- Changesets — `linked: [website, tools-app]`, `ignore: [@genai/config]`

## Environment Configuration

**Required env vars (per `turbo.json` `globalPassThroughEnv` + `apps/tools-app/lib/env.ts`):**

| Var | Scope | Required | Used in |
|-----|-------|----------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | client | yes | both apps via `@genai/auth` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | client | yes | both apps via `@genai/auth` |
| `SUPABASE_SERVICE_ROLE_KEY` | server | yes (tools-app) | `@genai/auth/admin` |
| `NEXT_PUBLIC_COOKIE_DOMAIN` | client | yes (prod) | `apps/*/next.config.ts` |
| `GOOGLE_GENERATIVE_AI_API_KEY` | server | optional | `apps/tools-app/lib/llm.ts` |
| `ANTHROPIC_API_KEY` | server | optional | `apps/tools-app/lib/agent.ts` |
| `MINIMAX_API_KEY` | server | optional | (validated only) |
| `ZHIPU_API_KEY` | server | optional | (validated only) |
| `EXA_API_KEY` | server | optional | `apps/tools-app/lib/exa.ts` |
| `UPSTASH_REDIS_REST_URL` | server | optional | `apps/tools-app/lib/ratelimit.ts` |
| `UPSTASH_REDIS_REST_TOKEN` | server | optional | `apps/tools-app/lib/ratelimit.ts` |
| `RESEND_API_KEY` | server | yes (website) | `apps/website/lib/email.ts` |
| `DEEPGRAM_API_KEY` | server | feature-gated | `apps/tools-app/app/api/voice/*` |
| `FIRECRAWL_API_KEY` | server | feature-gated | `apps/tools-app/app/api/defuddle/route.ts` |
| `CIRCLE_API_TOKEN` | server | provisioned | not yet wired |
| `CIRCLE_COMMUNITY_ID` | server | provisioned | not yet wired |
| `CIRCLE_COMMUNITY_URL` | server | provisioned | not yet wired |
| `NEXT_PUBLIC_APP_URL` | client | optional | `apps/tools-app/app/auth/signout/route.ts` (defaults to `https://tools.generation-ai.org`) |
| `SKIP_ENV_VALIDATION` | server | dev-only | `apps/tools-app/lib/env.ts` |

**Secrets location:**
- Local: `.env.local` per app (gitignored)
- Vercel: project-level env vars per environment (Preview / Production)
- `tsx --env-file=.env.local scripts/test-kb-tools.ts` pattern used for local script auth

## Webhooks & Callbacks

**Incoming:**
- Supabase auth callback handled by `proxy.ts` middleware on both apps (cookie refresh)
- No external webhooks (Resend, Stripe, etc.) registered in repo

**Outgoing:**
- LLM, Exa, Firecrawl, Deepgram, Resend — outbound calls only

---

*Integration audit: 2026-04-19*
