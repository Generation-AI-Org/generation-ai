# Codebase Structure

**Analysis Date:** 2026-04-19

## Directory Layout

```
generation-ai/
├── apps/
│   ├── website/                  # Next.js 16 — generation-ai.org
│   └── tools-app/                # Next.js 16 — tools.generation-ai.org
├── packages/
│   ├── auth/                     # Shared Supabase auth helpers
│   ├── config/                   # Shared eslint/tailwind/tsconfig presets
│   ├── emails/                   # React Email templates for Supabase Auth
│   ├── e2e-tools/                # Playwright E2E suite
│   ├── types/                    # Shared TypeScript types
│   └── ui/                       # Shared React components (currently: Logo)
├── docs/                         # Architecture, API, deployment, decisions
├── .planning/                    # GSD artefacts (STATE, ROADMAP, phases, codebase/)
├── brand/                        # Logo + brand assets
├── scripts/                      # Repo-wide scripts
├── supabase/                     # SQL migrations / config (root-level)
├── turbo.json                    # Turborepo task graph
├── pnpm-workspace.yaml           # Workspaces + dependency catalog
├── package.json                  # Root scripts (dev, build, lint, changeset)
├── CLAUDE.md                     # Project instructions for Claude Code
├── LEARNINGS.md                  # Prod-incident learnings (CSP/Proxy)
└── CHANGELOG.md
```

## Directory Purposes

**`apps/website/`:**
- Purpose: Public landing + legal + sign-up entry point
- Contains: Next.js App Router project
- Key files:
  - `app/page.tsx` - landing
  - `app/api/auth/signup/route.ts` - sign-up handler (currently disabled)
  - `app/impressum/`, `app/datenschutz/` - legal
  - `app/sitemap.ts`, `app/robots.ts` - SEO
  - `app/layout.tsx` - root layout (must stay dynamic; see `LEARNINGS.md`)
  - `proxy.ts` - middleware (CSP + session refresh)
  - `lib/email.ts`, `lib/schema.ts`, `lib/csp.ts`, `lib/supabase/`, `lib/fonts.ts`, `lib/utils.ts`
  - `components/` - `hero.tsx`, `home-client.tsx`, `terminal-splash.tsx`, `ThemeProvider.tsx`, `layout/`, `sections/`, `ui/`
  - `emails/dist/` - built HTML email templates uploaded to Supabase
  - `__tests__/`, `vitest.config.mts`, `vitest.setup.ts`

**`apps/tools-app/`:**
- Purpose: KI-Tool-Bibliothek + chat assistant (member + public)
- Contains: Next.js App Router project with chat, library, settings
- Key files:
  - `app/page.tsx` - home (chat + library)
  - `app/[slug]/page.tsx` - content detail (tool/guide/faq)
  - `app/login/`, `app/settings/`, `app/impressum/`, `app/datenschutz/`
  - `app/auth/callback/page.tsx`, `app/auth/confirm/route.ts`, `app/auth/set-password/page.tsx`, `app/auth/signout/route.ts`
  - `app/api/chat/route.ts` - main chat endpoint
  - `app/api/agent/`, `app/api/account/delete/`, `app/api/voice/{token,transcribe}/`, `app/api/extract-url/`, `app/api/defuddle/`, `app/api/health/`, `app/api/debug-auth/`
  - `app/error.tsx`, `app/global-error.tsx`, `app/not-found.tsx`, `app/loading.tsx`
  - `proxy.ts` - middleware
  - `lib/` - domain logic (see below)
  - `components/` - chat, library, detail, layout, ui
  - `hooks/` - React hooks
  - `instrumentation.ts`, `instrumentation-client.ts`, `sentry.*.config.ts`
  - `__tests__/`, `vitest.config.mts`, `vitest.setup.ts`

**`apps/tools-app/lib/`:**
- Purpose: Domain logic - chat, agent, KB tools, infra wrappers
- Files:
  - `agent.ts` - V2 agent loop (Gemini 3 Flash + tool calling)
  - `llm.ts` - V1 full-context recommendations (Gemini 2.5 Flash-Lite)
  - `kb-tools.ts` - tool definitions: `kb_search`, `kb_list`, `kb_read`, `web_search`
  - `content.ts` - content loading from Supabase
  - `supabase.ts` - typed Supabase client wrappers
  - `ratelimit.ts` - Upstash Redis rate limiter
  - `sanitize.ts` - input sanitization
  - `csp.ts` - Content-Security-Policy builder
  - `exa.ts` - Exa Web Search client
  - `analytics.ts`, `env.ts`, `auth.ts`, `types.ts`

**`apps/tools-app/components/`:**
- `chat/` - `ChatPanel`, `MessageList`, `ChatInput`, `FloatingChat`, `AttachmentsPanel`, `QuickActions`, `UrlInputModal`
- `library/` - `CardGrid`, `ContentCard`, `FilterBar`
- `detail/`, `layout/`, `ui/`
- `AuthProvider.tsx`, `HomeLayout.tsx`, `ThemeProvider.tsx`

**`packages/auth/`:**
- Purpose: Shared Supabase auth helpers; the only place to construct Supabase clients
- Source: `src/`
  - `index.ts` - browser-safe barrel (`createBrowserClient`, `createAdminClient`)
  - `browser.ts` - client-component client
  - `server.ts` - `@genai/auth/server` (route handlers / server components)
  - `helpers.ts` - `@genai/auth/helpers` (`getUser`, `getSession`)
  - `middleware.ts` - `@genai/auth/middleware` (`updateSession` for `proxy.ts`)
  - `admin.ts` - service-role client
- Tests: `__tests__/`, `vitest.config.mts`

**`packages/types/`:**
- Purpose: Cross-app TypeScript types
- Source: `src/auth.ts`, `src/content.ts`, `src/index.ts`

**`packages/ui/`:**
- Purpose: Shared React components
- Source: `src/components/Logo.tsx` (+ test), `src/assets/`, `src/index.ts`
- Currently minimal - most UI lives per app

**`packages/emails/`:**
- Purpose: React Email templates rendered to HTML for Supabase Auth
- Source: `src/templates/` (`confirm-signup.tsx`, `magic-link.tsx`, `recovery.tsx`), `src/components/`, `src/tokens.ts`
- Build output: `dist/` (also mirrored into `apps/website/emails/dist/`)
- Build scripts: `scripts/`

**`packages/config/`:**
- Purpose: Shared toolchain configs
- Subdirs: `eslint/`, `tailwind/`, `tsconfig/`
- Not versioned (ignored in changesets)

**`packages/e2e-tools/`:**
- Purpose: Playwright E2E tests run against deployed/local apps
- Layout: `tests/`, `fixtures/`, `helpers/`, `playwright.config.ts`, `playwright-report/`, `test-results/`

**`docs/`:**
- `ARCHITECTURE.md`, `API.md`, `DEPLOYMENT.md`, `DESIGN.md`, `MIGRATION.md`
- `AUTH-FLOW.md`, `AUTH-FLOWS.md`, `AUTH-TEST-PLAN.md` - auth detail + Phase-13 audit
- `decisions/` - ADRs

**`.planning/`:**
- `STATE.md` - current project status (source of truth)
- `BACKLOG.md`, `ROADMAP.md`, `PROJECT.md`
- `phases/` - per-phase plans, reviews, contexts (currently up to phase 18)
- `codebase/` - these mapping documents

**`supabase/` (root):**
- SQL migrations + Supabase project config
- Each app may also have its own `supabase/` subdir for app-scoped migrations

## Key File Locations

**Entry Points:**
- `apps/website/app/page.tsx` - public landing
- `apps/website/app/api/auth/signup/route.ts` - sign-up (503 right now)
- `apps/tools-app/app/page.tsx` - chat + library
- `apps/tools-app/app/api/chat/route.ts` - chat API
- `apps/website/proxy.ts`, `apps/tools-app/proxy.ts` - middleware

**Configuration:**
- `pnpm-workspace.yaml` - workspaces + version catalog (Next 16.2.3, React 19.2.4, Supabase SSR 0.10.2)
- `turbo.json` - task graph
- `apps/*/next.config.ts`, `apps/*/eslint.config.mjs`, `apps/*/tsconfig.json`, `apps/*/postcss.config.mjs`
- `apps/*/lib/csp.ts` - CSP rules per app
- `apps/tools-app/lib/env.ts` - env-var validation

**Core Logic:**
- `apps/tools-app/lib/agent.ts` - V2 agent loop
- `apps/tools-app/lib/llm.ts` - V1 full-context
- `apps/tools-app/lib/kb-tools.ts` - agent tools
- `apps/tools-app/lib/content.ts` - content loading
- `packages/auth/src/server.ts` - server-side Supabase client
- `packages/auth/src/middleware.ts` - `updateSession` for proxies

**Testing:**
- Per-app: `apps/*/__tests__/`, `apps/*/vitest.config.mts`, `apps/*/vitest.setup.ts`
- Shared package tests: `packages/auth/__tests__/`, `packages/ui/src/components/Logo.test.tsx`
- E2E: `packages/e2e-tools/tests/`

## Naming Conventions

**Files:**
- Route handlers: `route.ts` (App Router convention)
- Pages: `page.tsx`
- React components: `PascalCase.tsx` (e.g. `ChatPanel.tsx`, `HomeLayout.tsx`)
- Lib/utility modules: `kebab-or-single-word.ts` (e.g. `kb-tools.ts`, `ratelimit.ts`)
- Tests: `*.test.ts(x)` co-located in `__tests__/` or next to source

**Directories:**
- App routes: lowercase (`login`, `settings`, `auth/callback`)
- Components grouped by feature (`chat/`, `library/`, `detail/`, `layout/`, `ui/`)
- Dynamic routes: `[slug]/`

**Package names:**
- Scope `@genai/*` (e.g. `@genai/auth`, `@genai/ui`, `@genai/types`, `@genai/emails`, `@genai/config`)

## Where to Add New Code

**New website page:**
- `apps/website/app/<route>/page.tsx`
- Page-specific components: `apps/website/components/sections/` or `apps/website/components/<feature>/`
- Add to `app/sitemap.ts` if public

**New tools-app page:**
- `apps/tools-app/app/<route>/page.tsx`
- Feature components: `apps/tools-app/components/<feature>/`
- Hooks: `apps/tools-app/hooks/`

**New API endpoint:**
- `apps/<app>/app/api/<resource>/route.ts`
- Domain logic in `apps/<app>/lib/<feature>.ts` (do not put logic in route file)
- Always run via `checkRateLimit` for user-facing endpoints in tools-app

**New shared TypeScript type:**
- `packages/types/src/<domain>.ts` and re-export from `index.ts`

**New shared UI component:**
- `packages/ui/src/components/<Component>.tsx` + test
- Export from `packages/ui/src/index.ts`

**New shared auth helper:**
- `packages/auth/src/<file>.ts`
- Browser-safe -> re-export from `index.ts`
- Server-only (`next/headers`, `NextRequest`) -> require subpath import (`@genai/auth/server`, `/helpers`, `/middleware`); DO NOT add to barrel

**New email template:**
- `packages/emails/src/templates/<name>.tsx`
- Build via `packages/emails/scripts/`; copy output into `apps/website/emails/dist/`

**New agent tool:**
- Add tool definition + handler in `apps/tools-app/lib/kb-tools.ts`
- Wire into `runAgent()` in `apps/tools-app/lib/agent.ts`

**New SQL migration:**
- `supabase/` (root) for shared schema changes
- Update RLS to respect hybrid `user_id IS NULL OR auth.uid() = user_id` pattern if relevant

**New E2E test:**
- `packages/e2e-tools/tests/<scenario>.spec.ts`
- Use existing fixtures in `packages/e2e-tools/fixtures/`

## Special Directories

**`apps/*/.next/`:**
- Purpose: Next.js build output
- Generated: Yes
- Committed: No

**`apps/website/emails/dist/`, `packages/emails/dist/`:**
- Purpose: Built HTML email templates uploaded to Supabase Auth dashboard
- Generated: Yes (from `packages/emails/src/templates/`)
- Committed: Yes (so deploys / handoff don't require rebuild)

**`packages/e2e-tools/playwright-report/`, `test-results/`:**
- Purpose: Playwright run output
- Generated: Yes
- Committed: No

**`brand/`:**
- Purpose: Source brand assets (logos, avatars, animations POC)
- Generated: No
- Committed: Yes

**`.planning/phases/`:**
- Purpose: GSD per-phase artefacts (PLAN, REVIEW, CONTEXT)
- Generated: No (authored by GSD commands)
- Committed: Yes

---

*Structure analysis: 2026-04-19*
