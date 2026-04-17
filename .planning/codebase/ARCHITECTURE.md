# Architecture

**Analysis Date:** 2026-04-17

## Pattern Overview

**Overall:** Satellite Architecture with Shared Auth Layer

**Key Characteristics:**
- Monorepo (Turborepo + pnpm) with two Next.js apps + shared packages
- Circle.so is the community hub; Website and tools-app are satellites
- Shared Supabase instance for auth across all properties
- Soft SSO via same email across properties
- API-driven chat with dual modes (public + member)

## Layers

**Frontend Layer:**
- Location: `apps/website/`, `apps/tools-app/`
- Purpose: User-facing Next.js 16 applications
- Contains: React 19 components, page routes, client/server hooks
- Depends on: @genai/auth (Supabase client), @genai/types, @genai/config
- Used by: End users via Vercel hosting

**Auth Layer:**
- Location: `packages/auth/`
- Purpose: Canonical Supabase SSR wrapper for both apps
- Contains: Browser client factory, server client factory, middleware, helpers
- Exports: Multiple entry points (`./browser`, `./server`, `./helpers`, `./middleware`)
- Depends on: @supabase/ssr, @supabase/supabase-js, next/headers
- Used by: Both apps via proxy.ts + server components

**API/Backend Layer:**
- Location: `apps/*/app/api/` (Next.js route handlers)
- Purpose: Serverless endpoints for chat, auth, content, voice
- Contains: POST/GET/DELETE handlers with business logic
- Depends on: Supabase client, LLM clients (Gemini, Claude), rate limiting, content services
- Used by: Frontend via fetch(), external tools

**Content & Knowledge Layer:**
- Location: `apps/tools-app/lib/content.ts`, `lib/kb-tools.ts`
- Purpose: Fetch published content from Supabase, enable KB navigation
- Contains: Functions to explore, list, read, search knowledge base
- Depends on: Supabase client, Exa API (search)
- Used by: Chat agent (agent.ts), frontend (AppShell)

**LLM/Agent Layer:**
- Location: `apps/tools-app/lib/llm.ts`, `lib/agent.ts`
- Purpose: AI chat logic with tool-calling capability
- Contains: Gemini models (3 Flash for members, 2.5 Flash-Lite for public), system prompts
- Depends on: @ai-sdk/google, OpenAI SDK (for Gemini via OpenAI-compatible API), kb-tools
- Used by: POST /api/chat endpoint

**Shared Config Layer:**
- Location: `packages/config/`, `packages/types/`
- Purpose: Centralized TypeScript, ESLint, Tailwind, type definitions
- Contains: tsconfig base, shared enums, content types
- Depends on: None (no external deps)
- Used by: All apps via catalog and monorepo references

## Data Flow

**Chat Flow (Member Mode with Agent):**

1. User message → `POST /api/chat` with `mode: 'member'`
2. Rate limit check (`checkRateLimit`)
3. Session lookup/create in `chat_sessions` table
4. Message sanitization (`sanitizeUserInput`)
5. Store user message in `chat_messages`
6. Call `runAgent()` with message + history
7. Agent orchestration:
   - Load full content from DB (`getFullContent`)
   - Initialize Gemini client (OpenAI-compatible)
   - Build tool definitions from KB tools (explore, list, read, search, web_search)
   - Iteratively call Gemini with tools until done
   - Execute tools (kb_*, web_search) as needed
8. Format response with sources and recommendations
9. Store assistant message in `chat_messages`
10. Return to client: `{ text, recommendedSlugs, sources, sessionId }`

**Content Display Flow:**

1. Server component `Home()` fetches user + published tools in parallel
2. Determine `mode` based on auth state
3. Pass `items` + `mode` to `AppShell` client component
4. Client renders `CardGrid` with filtering, search, keyboard shortcuts
5. Chat bubble (lazy-loaded) listens to user selections and highlights
6. When user clicks tool card, chat can recommend related items

**Auth Flow:**

1. User visits app → `proxy.ts` intercepts all requests
2. Proxy calls `updateSession()` from @genai/auth/middleware
3. Session middleware:
   - Creates server-safe Supabase client with cookies
   - Calls `supabase.auth.getUser()` to refresh token if needed
   - Returns updated response with new auth cookies
4. Server components can call `getUser()` or `getSession()` from @genai/auth/helpers
5. Browser components import client from @genai/auth/browser for direct access

**State Management:**

- Server-driven: Most state lives in Supabase (sessions, messages, profiles)
- Client-local: UI state in React hooks (search query, filters, theme, chat expansion)
- Session state: Supabase auth cookie in `sb-*` format, shared across .generation-ai.org subdomain
- Rate limit state: Upstash Redis (IP + session ID keyed)

## Key Abstractions

**Supabase Client Factory Pattern:**
- Purpose: Manage auth cookie lifecycle safely across server/browser contexts
- Examples: `@genai/auth/server.ts`, `@genai/auth/browser.ts`
- Pattern: Function that returns typed Supabase client with appropriate cookie handlers

**Chat Mode Routing:**
- Purpose: Branch logic based on user auth state
- Examples: `lib/llm.ts` (getRecommendations vs runAgent), `app/page.tsx` (ChatMode type)
- Pattern: Conditional exports and conditional API calls based on `ChatMode` enum

**Tool Definition System:**
- Purpose: Enable agent to explore and use knowledge base programmatically
- Examples: `lib/kb-tools.ts` (kbExplore, kbList, kbRead, kbSearch), `lib/agent.ts` (KB_TOOLS_OPENAI)
- Pattern: Tool objects with name, description, input schema, execution function

**Content Item Types:**
- Purpose: Serialize content across DB → API → UI with type safety
- Examples: `@genai/types/content.ts` (ContentType, ContentItem, ContentItemMeta, ContentSource)
- Pattern: Full type for DB reads, meta type for UI lists, source type for attribution

## Entry Points

**Website App:**
- Location: `apps/website/app/layout.tsx`, `app/page.tsx`
- Triggers: HTTP requests to generation-ai.org
- Responsibilities: Render landing page, SEO metadata, theme provider, speed insights

**Tools App:**
- Location: `apps/tools-app/app/layout.tsx`, `app/page.tsx`
- Triggers: HTTP requests to tools.generation-ai.org
- Responsibilities: Fetch user + tools, render app shell, lazy-load chat

**Chat API Endpoint:**
- Location: `apps/tools-app/app/api/chat/route.ts`
- Triggers: POST /api/chat from frontend or external tools
- Responsibilities: Validate input, rate limit, determine mode, orchestrate LLM + agent

**Auth Proxy:**
- Location: `apps/*/proxy.ts`
- Triggers: Every HTTP request (via Next.js 16 proxy config)
- Responsibilities: Refresh Supabase session, update auth cookies

**Delete Account:**
- Location: `apps/tools-app/app/api/account/delete/route.ts`
- Triggers: DELETE /api/account/delete from settings
- Responsibilities: Delete user messages, sessions, auth.users row (in order)

## Error Handling

**Strategy:** Fail gracefully with user-friendly German messages, log server-side errors to Sentry

**Patterns:**
- Rate limit: 429 with `Retry-After` header and `X-RateLimit-*` headers
- Missing data: 400 with error message (e.g., "Nachricht fehlt")
- Auth required: 401 (not explicitly shown but implied in account/delete)
- Server error: 500 with generic message, Sentry integration logs details
- Chat mode mismatch: Defaults to 'public' if mode not recognized
- Missing tool results: Agent returns empty list and continues (e.g., kbList returns [])

## Cross-Cutting Concerns

**Logging:** 
- Server-side: console.log for development, structured via Sentry for production
- Client-side: console only (no production logging configured)
- Timing: Chat route logs Gemini latency + token counts

**Validation:**
- Input: `sanitizeUserInput()` for user messages (HTML strip, XSS prevention)
- Schema: Zod in tools-app for env validation (@t3-oss/env-nextjs)
- Types: TypeScript strict mode across monorepo

**Authentication:**
- Supabase Auth (PKCE flow, session management via cookies)
- Soft SSO: Email matching across websites (no explicit sync)
- Admin: Admin API client in packages/auth/admin.ts for backend operations
- Middleware: Proxy ensures session always refreshed before route handlers

**Caching:**
- ISR: None explicitly configured (dynamic routes)
- Database: Supabase client caching (SDK-level)
- Edge: Vercel Edge Functions not used
- Client: React query not used, reliance on server-driven fetches

**Rate Limiting:**
- Implementation: Upstash Redis via @upstash/ratelimit
- Scope: Per IP + session ID
- Limits: 20 requests/minute (configurable)
- Headers: Standard RateLimit headers in response

---

*Architecture analysis: 2026-04-17*
