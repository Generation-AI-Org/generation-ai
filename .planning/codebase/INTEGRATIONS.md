# External Integrations

**Analysis Date:** 2026-04-17

## APIs & External Services

**AI & Language Models:**
- Gemini API (Google)
  - SDK: `@ai-sdk/google` 3.0.63
  - Models: `gemini-2.5-flash-lite` (public chat, fast/cheap), `gemini-3-flash` (member mode, agent)
  - Used in: `apps/tools-app/lib/llm.ts`
  - Auth: `GOOGLE_GENERATIVE_AI_API_KEY`

- Claude API (Anthropic)
  - SDK: `@anthropic-ai/sdk` 0.87.0
  - Purpose: Tool definitions and imports (currently unused for inference)
  - Used in: `apps/tools-app/lib/kb-tools.ts`
  - Auth: `ANTHROPIC_API_KEY` (optional, tools-app)

- OpenAI API
  - SDK: `openai` 6.34.0
  - Status: Included but unused
  - Auth: `OPENAI_API_KEY` (not configured)

- LLM Fallbacks (Chinese market)
  - Zhipu API (Optional)
  - MiniMax API (Optional)
  - Auth: `ZHIPU_API_KEY`, `MINIMAX_API_KEY` (optional)

**Web Search:**
- Exa API
  - SDK: None (direct HTTP calls expected)
  - Purpose: Trusted web search for agent web-browsing capability
  - Used in: `apps/tools-app/lib/exa.ts`
  - Auth: `EXA_API_KEY` (optional, graceful fallback)

**Email Services:**
- Resend
  - SDK: `resend` 6.10.0
  - Purpose: Transactional email for magic links and notifications
  - Used in: `apps/website/` (auth flows)
  - Auth: `RESEND_API_KEY`

**Community Platform:**
- Circle.so
  - API: REST API (credentials in Vercel env)
  - Purpose: Community platform for discussions, courses, events
  - Auth: `CIRCLE_API_TOKEN`, `CIRCLE_COMMUNITY_ID`, `CIRCLE_COMMUNITY_URL`
  - Flow: Website redirects users to community.generation-ai.org (soft SSO, same email)

## Data Storage

**Databases:**
- Supabase PostgreSQL
  - Connection: `NEXT_PUBLIC_SUPABASE_URL` (wbohulnuwqrhystaamjc.supabase.co)
  - Client: `@supabase/supabase-js` 2.103.0 (browser) + `@supabase/ssr` 0.10.2 (server)
  - Tables:
    - `auth.users` - Supabase built-in auth users
    - `profiles` - Extended user profile data
    - `content_items` - KI-Tool knowledge base (tools-app)
    - `chat_sessions` - Chat history sessions (tools-app)
    - `chat_messages` - Individual chat messages with roles and content
  - Access:
    - Admin: `SUPABASE_SERVICE_ROLE_KEY` (server-side only)
    - Public: `NEXT_PUBLIC_SUPABASE_ANON_KEY` with Row Level Security (RLS)
  - Auth method: Session cookies via `@supabase/ssr` middleware

**File Storage:**
- Supabase Storage (implicit)
  - Purpose: Potential for image/asset storage
  - Status: Not actively used in current codebase

**Caching:**
- Upstash Redis
  - Endpoint: `UPSTASH_REDIS_REST_URL`
  - Client: `@upstash/redis` 1.37.0
  - Purpose: Rate limiting via `@upstash/ratelimit` 2.0.8
  - Auth: `UPSTASH_REDIS_REST_TOKEN`
  - Used in: `apps/tools-app/lib/ratelimit.ts`

## Authentication & Identity

**Auth Provider:**
- Supabase Auth
  - Method: Passwordless (magic links via email)
  - Provider: `@supabase/supabase-js` + `@supabase/ssr`
  - Session Management: HTTP-only cookies (set via middleware in `packages/auth/src/middleware.ts`)
  - Cookie Domain: `.generation-ai.org` (shared across website and tools-app)
  - Soft SSO: Same email registers once, logs into both apps

**Implementation Location:**
- Middleware: `packages/auth/src/middleware.ts` - Cookie management per Supabase pattern
- Browser Client: `packages/auth/src/browser.ts` - createBrowserClient for client-side auth
- Server Client: `packages/auth/src/server.ts` - createServerClient for server-side operations
- Admin Client: `packages/auth/src/admin.ts` - createClient with service role key
- Helpers: `packages/auth/src/helpers.ts` - getCurrentUser(), getSession()

**Auth Disabled:**
- Sign-up endpoint: `apps/website/app/api/auth/signup/route.ts` returns 503 (temporarily disabled)
- Can be restored from git history

## Monitoring & Observability

**Error Tracking:**
- Sentry (tools-app only)
  - SDK: `@sentry/nextjs` 10
  - Config: `apps/tools-app/sentry.server.config.ts`, `apps/tools-app/sentry.edge.config.ts`
  - DSN: `https://67d7d952c96ed82810c68e17aeec8ce3@o4511218002362368.ingest.de.sentry.io/4511218004197456`
  - Sampling: tracesSampleRate = 1 (100%, should adjust in production)
  - Features: Automatic instrumentation, Vercel Cron monitoring, PII capture enabled
  - Website: No Sentry configured (minimal error tracking)

**Performance Metrics:**
- Vercel Speed Insights
  - SDK: `@vercel/speed-insights` 2.0.0 (both apps)
  - Tracks: Web Vitals, Performance metrics
  - Integration: Automatic with Vercel deployment

**Monitoring & Uptime:**
- Better Stack (referenced in docs, integration status unknown)
  - Purpose: Uptime monitoring and status page
  - Status: Mentioned in architecture, not visible in code

**Logs:**
- Vercel Logs (default)
  - Access: Vercel Dashboard > Logs
  - Framework: Structured logging via console.log/error

**Analytics:**
- Status: Not detected in codebase (potential gap)

## CI/CD & Deployment

**Hosting:**
- Vercel
  - Projects:
    - `website` - generation-ai.org (root: `apps/website/`)
    - `tools-app` - tools.generation-ai.org (root: `apps/tools-app/`)
  - GitHub Integration: Automatic deployment on push to main
  - Preview Deployments: Automatic for pull requests
  - Build Command: `turbo build` (monorepo-aware caching)
  - Start Command: `next start`

**CI Pipeline:**
- GitHub Actions (referenced in Playwright config: `process.env.CI`)
  - E2E Tests: Run on CI with retry=2, 1 worker
  - Local Testing: Run in parallel with 0 retries
  - Config: `packages/e2e-tools/playwright.config.ts`

**Versioning & Changelog:**
- Changesets
  - CLI: `@changesets/cli` 2.30.0
  - Changelog Generator: `@changesets/changelog-github` 0.6.0
  - Workflow: `pnpm changeset` before commit, `pnpm version` for release
  - Linked Apps: website + tools-app (co-versioned)
  - Ignored: `@genai/config` (internal package)

## Environment Configuration

**Required env vars (tools-app):**
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anon key
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase admin key (Vercel only)
- `GOOGLE_GENERATIVE_AI_API_KEY` - Gemini API key

**Optional env vars (graceful fallback):**
- `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` - Rate limiting disabled if missing
- `EXA_API_KEY` - Web search disabled if missing
- `ANTHROPIC_API_KEY` - Claude imports available but not inference
- `ZHIPU_API_KEY`, `MINIMAX_API_KEY` - LLM fallbacks for Chinese market

**Secrets location:**
- Vercel Environment Variables (production)
  - Dashboard: vercel.com > Project Settings > Environment Variables
  - Protected: All secrets marked as "Sensitive"
  - Scope: Per app, per environment (Preview, Production)
- Local Development: `.env.local` files (git-ignored)
  - Reference: `apps/tools-app/.env.example`

**Validation:**
- Tools-app: `lib/env.ts` validates at build time using t3-env + Zod
- Skip validation: Set `SKIP_ENV_VALIDATION=1` (e.g., Docker builds without secrets)
- Build will fail if required env vars missing

## Webhooks & Callbacks

**Incoming Webhooks:**
- Not detected in codebase
- Potential: Circle.so webhooks (not implemented)

**Outgoing Webhooks:**
- Supabase Realtime (implicit)
  - Purpose: Chat message updates, session changes
  - Transport: WebSocket
  - Not explicitly called, managed by Supabase client

**Callback URLs:**
- Magic Link Flow: User email → Resend → Vercel function → Supabase redirect
- Circle.so: Soft SSO via same email (no webhook, manual linking)

## Third-Party Scripts

**Performance & Analytics:**
- Vercel Speed Insights - Automatic injection
- Sentry (tools-app) - Automatic error capture

**Font Loading:**
- Status: Not explicitly configured (uses Tailwind defaults)

## Data Flow

**Authentication:**
```
User → Website/tools-app → Supabase Auth → Magic Link (Resend) → Verify → Cookies
```

**Chat:**
```
User (tools-app) → Rate Limit (Upstash) → LLM (Google Gemini) → Supabase (history) → Response
```

**Tool Search:**
```
User Query → Gemini (2.5 Flash-Lite) → Supabase (content_items) → Response + Sources
```

**Agent Mode (member):**
```
User → Rate Limit → Gemini 3 Flash (Agent) → Tools (KB-Tools, Exa API) → Response
```

---

*Integration audit: 2026-04-17*
