# Architecture

**Analysis Date:** 2026-04-19

## Pattern Overview

**Overall:** Turborepo monorepo with two Next.js 16 (App Router) apps, sharing a Supabase backend via "Soft SSO" (cookie domain `.generation-ai.org`). Circle.so is the community hub; both Next.js apps are satellites.

**Key Characteristics:**
- Two independently deployable apps (`apps/website`, `apps/tools-app`) on Vercel, one shared Supabase project
- Shared auth helpers in `packages/auth` (wrapper around `@supabase/ssr`)
- App-Router server components + Route Handlers; per-app `proxy.ts` (Next.js middleware) handles session refresh + nonce-CSP
- React 19, Tailwind v4, TypeScript, pnpm workspaces, Turborepo
- Hybrid public/member RLS model in Postgres so the chat works anonymously and authenticated against the same tables

## Layers

**App Shell (Next.js Apps):**
- Purpose: Routing, SSR, layouts, page composition
- Location: `apps/website/app/`, `apps/tools-app/app/`
- Contains: Server components, client components, Route Handlers (`route.ts`), `layout.tsx`, `loading.tsx`, error boundaries
- Depends on: `packages/auth`, `packages/ui`, `packages/types`, `packages/emails`, app-local `lib/`
- Used by: End users via browser

**Edge Middleware (per app):**
- Purpose: Session refresh + CSP nonce injection on every request
- Location: `apps/website/proxy.ts`, `apps/tools-app/proxy.ts`
- Contains: `updateSession()` call, nonce generation, CSP header set on REQUEST then RESPONSE
- Depends on: `@genai/auth/middleware`, app-local `lib/csp.ts`
- Critical: Nonce must be set on `request.headers` BEFORE `updateSession()` (see `LEARNINGS.md` 2026-04-18)

**Shared Auth Package:**
- Purpose: Single source of truth for Supabase client construction
- Location: `packages/auth/src/`
- Contains:
  - `browser.ts` -> `createClient` for client components
  - `server.ts` -> `createClient` with `cookies()` for route handlers / server components (`@genai/auth/server`)
  - `helpers.ts` -> `getUser`, `getSession` (`@genai/auth/helpers`)
  - `middleware.ts` -> `updateSession` (`@genai/auth/middleware`)
  - `admin.ts` -> service-role client (`createAdminClient`)
- Subpath imports enforced so `next/headers` never gets bundled into the browser

**App-Local Domain Logic (tools-app):**
- Purpose: Chat, agent, KB tools, content loading, sanitization, rate limiting
- Location: `apps/tools-app/lib/`
- Contains: `agent.ts` (V2 agent loop), `llm.ts` (V1 full-context), `kb-tools.ts` (tool definitions), `content.ts` (content fetch from Supabase), `supabase.ts` (typed client wrappers), `ratelimit.ts` (Upstash), `sanitize.ts`, `csp.ts`, `exa.ts`, `analytics.ts`, `env.ts`, `auth.ts`, `types.ts`
- Depends on: `packages/auth`, `packages/types`, Supabase, Gemini, Exa, Upstash

**App-Local Domain Logic (website):**
- Purpose: Email sending, schema.org JSON-LD, Supabase wrappers, fonts
- Location: `apps/website/lib/`
- Contains: `email.ts` (Resend), `schema.ts`, `supabase/`, `csp.ts`, `fonts.ts`, `utils.ts`

**Shared Packages:**
- `packages/types/src/` - `auth.ts`, `content.ts`, `index.ts` (cross-app TypeScript types)
- `packages/ui/src/components/` - `Logo.tsx` (currently the only shared component, with a Vitest test)
- `packages/emails/src/` - React Email templates (`templates/`, `components/`, `tokens.ts`) used to render Supabase auth emails; built output in `packages/emails/dist/` and per-app `apps/website/emails/dist/`
- `packages/config/` - shared `eslint/`, `tailwind/`, `tsconfig/` presets
- `packages/e2e-tools/` - Playwright runner (`fixtures/`, `helpers/`, `tests/`, `playwright.config.ts`)

## Data Flow

**Auth (Soft SSO across `.generation-ai.org`):**

1. User signs up on `generation-ai.org` (currently DISABLED, route returns 503 - `apps/website/app/api/auth/signup/`)
2. Backend creates Supabase user + profile + Circle member, sends branded magic link via Resend (templates from `packages/emails`)
3. User clicks link -> lands on tools-app callback `apps/tools-app/app/auth/callback/page.tsx` or confirm `apps/tools-app/app/auth/confirm/route.ts`
4. Supabase sets session cookie scoped to `.generation-ai.org` -> both apps' middleware (`proxy.ts` -> `@genai/auth/middleware updateSession`) can refresh it
5. Sign-out via `apps/tools-app/app/auth/signout/route.ts`; password set via `apps/tools-app/app/auth/set-password/page.tsx`
6. Server components / route handlers read user via `@genai/auth/helpers getUser()` (which uses `@genai/auth/server createClient` with `cookies()`)
7. Circle.so has its own auth; identity link is "same email" only - no token exchange

**Chat Request (tools-app):**

1. Client posts to `apps/tools-app/app/api/chat/route.ts` with `{ message, history, sessionId, mode, context }`
2. Route validates `context` (length-bounded), runs `checkRateLimit(ip, sessionId)` from `lib/ratelimit.ts` (Upstash) - returns 429 with `Retry-After` if exceeded
3. Input passed through `sanitizeUserInput` (`lib/sanitize.ts`)
4. Branch on `mode`:
   - `public` -> `getRecommendations()` from `lib/llm.ts` -> injects all KB items via `getFullContent()` from `lib/content.ts` -> calls Gemini 2.5 Flash-Lite -> returns answer + recommended slugs
   - `member` -> `runAgent()` from `lib/agent.ts` -> Gemini 3 Flash with tool-calling against `lib/kb-tools.ts` (`kb_search`, `kb_list`, `kb_read`, `web_search` via `lib/exa.ts`) - max 5 tool calls per request
5. Persisted to `chat_sessions` / `chat_messages` via `createServerClient` from `lib/supabase.ts` (RLS: `user_id IS NULL OR auth.uid() = user_id`)

**State Management:**
- Server-first: server components fetch from Supabase directly
- Client state for chat in `apps/tools-app/components/chat/` (`ChatPanel`, `MessageList`, `ChatInput`, `FloatingChat`, `AttachmentsPanel`, `QuickActions`, `UrlInputModal`)
- Auth context in `apps/tools-app/components/AuthProvider.tsx`; theme in `ThemeProvider.tsx` (mirrored in website)

## Key Abstractions

**`ChatMode`:**
- Purpose: Switches between V1 full-context and V2 agent
- Location: `apps/tools-app/lib/types.ts`
- Values: `'public'` | `'member'`

**Hybrid V1/V2 RLS:**
- `chat_sessions.user_id` and `chat_messages.user_id` nullable
- `USING (user_id IS NULL OR auth.uid() = user_id)` - anonymous public sessions coexist with owner-only member sessions in one table

**KB Tools (V2 agent):**
- Location: `apps/tools-app/lib/kb-tools.ts`
- Tools: `kb_search`, `kb_list`, `kb_read`, `web_search`
- Bound to Gemini function-calling; the agent loop in `lib/agent.ts` caps iterations

**Server-only auth subpath imports:**
- `@genai/auth` barrel exports only browser-safe symbols
- `@genai/auth/server`, `@genai/auth/helpers`, `@genai/auth/middleware` must be imported by their subpath to avoid leaking `next/headers` into client bundles

## Entry Points

**Website pages (`apps/website/app/`):**
- `page.tsx` -> landing
- `impressum/`, `datenschutz/` -> legal
- `robots.ts`, `sitemap.ts` -> SEO
- `layout.tsx` -> root layout (must remain dynamic - see CSP rules)

**Website API (`apps/website/app/api/`):**
- `auth/signup/` -> POST sign-up (currently 503; see `CLAUDE.md` for reactivation path)

**Tools-app pages (`apps/tools-app/app/`):**
- `page.tsx` -> home (chat + library)
- `[slug]/page.tsx` -> tool/guide/faq detail
- `login/`, `settings/`, `impressum/`, `datenschutz/`
- `auth/callback/page.tsx`, `auth/confirm/route.ts`, `auth/set-password/page.tsx`, `auth/signout/route.ts`
- `error.tsx`, `global-error.tsx`, `not-found.tsx`, `loading.tsx`

**Tools-app API (`apps/tools-app/app/api/`):**
- `chat/route.ts` - main chat endpoint (V1 + V2)
- `agent/` - agent-specific endpoint (subdir present)
- `account/delete/` - account deletion
- `voice/token/`, `voice/transcribe/` - voice input
- `extract-url/`, `defuddle/` - URL/content extraction for chat attachments
- `health/` - uptime check
- `debug-auth/` - auth diagnostics

**Edge Middleware:**
- `apps/website/proxy.ts`, `apps/tools-app/proxy.ts`
- Sets `x-nonce` + `Content-Security-Policy` on REQUEST headers, then calls `updateSession()`, then mirrors CSP onto the RESPONSE

**Sentry instrumentation (tools-app):**
- `instrumentation.ts`, `instrumentation-client.ts`, `sentry.edge.config.ts`, `sentry.server.config.ts`

## Error Handling

**Strategy:** Try/catch in route handlers returning typed JSON errors; React error boundaries for UI; Sentry capture in tools-app via `instrumentation*.ts` and `sentry.*.config.ts`.

**Patterns:**
- Rate-limit failures -> 429 JSON `{ error, retryAfter }` with `Retry-After` header
- Invalid optional input (e.g. chat `context`) -> silently dropped, never fail the request
- Per-route `error.tsx` + `global-error.tsx` in tools-app for client-side recovery

## Cross-Cutting Concerns

**Logging:** Sentry (errors), Better Stack (uptime). No structured app logger by default - `console.*` in route handlers.

**Validation:** Inline checks (length-bounded) + `sanitizeUserInput` for chat messages (`apps/tools-app/lib/sanitize.ts`). No Zod usage detected at architecture layer.

**Authentication:** `@supabase/ssr` via `packages/auth`. `getUser()` (verifies via Auth server) preferred over `getSession()` for trust-sensitive checks. Cookie domain `.generation-ai.org` shared across both apps.

**CSP:** Per-app `lib/csp.ts` builds nonce-based directives; proxy injects on request. Root layouts MUST be dynamic (`force-dynamic` or implicit via `await getUser()` / `await cookies()`) - see `LEARNINGS.md`.

**Rate Limiting:** Upstash Redis via `apps/tools-app/lib/ratelimit.ts`, keyed on `ip + sessionId`.

**Email:** Resend in `apps/website/lib/email.ts`; React Email templates in `packages/emails/src/templates/` (`confirm-signup.tsx`, `magic-link.tsx`, `recovery.tsx`); built HTML in `apps/website/emails/dist/` and uploaded to Supabase Auth.

---

*Architecture analysis: 2026-04-19*
