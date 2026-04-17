# Codebase Structure

**Analysis Date:** 2026-04-17

## Directory Layout

```
generation-ai/
├── apps/
│   ├── website/                    # Landing page + signup (signup currently 503)
│   │   ├── app/                    # Next.js 16 App Router
│   │   │   ├── layout.tsx          # Root layout with metadata, fonts, theme
│   │   │   ├── page.tsx            # Homepage (renders HomeClient)
│   │   │   ├── api/
│   │   │   │   └── auth/signup/    # POST /api/auth/signup (disabled)
│   │   │   ├── datenschutz/        # Legal: Privacy policy
│   │   │   └── impressum/          # Legal: Impressum
│   │   ├── components/
│   │   │   ├── home-client.tsx     # Main page component (client)
│   │   │   ├── ThemeProvider.tsx   # Dark/light mode
│   │   │   └── [ui components]
│   │   ├── lib/
│   │   │   ├── email.ts            # Resend email templates
│   │   │   ├── schema.ts           # JSON-LD schemas (org, website)
│   │   │   ├── utils.ts            # Helper functions
│   │   │   ├── fonts.ts            # Font loading
│   │   │   └── supabase/           # Supabase clients
│   │   ├── public/                 # Static assets (favicon, logos)
│   │   ├── __tests__/              # Unit tests (vitest)
│   │   ├── proxy.ts                # Next.js 16 auth middleware
│   │   ├── globals.css             # Tailwind + custom styles
│   │   ├── package.json
│   │   └── next.config.js
│   │
│   └── tools-app/                  # KI-Tool-Bibliothek + Chat
│       ├── app/                    # Next.js 16 App Router
│       │   ├── layout.tsx          # Root with AuthProvider, ThemeProvider
│       │   ├── page.tsx            # Home: tools grid + chat (server component)
│       │   ├── [slug]/page.tsx      # Tool detail view
│       │   ├── login/page.tsx       # Auth page
│       │   ├── settings/page.tsx    # User settings + account delete
│       │   ├── api/                 # All API endpoints
│       │   │   ├── chat/            # POST /api/chat (main chat endpoint)
│       │   │   ├── health/          # GET /api/health (monitoring)
│       │   │   ├── account/delete/  # DELETE /api/account/delete
│       │   │   ├── voice/           # Voice input/transcription
│       │   │   ├── extract-url/     # URL content extraction
│       │   │   ├── debug-auth/      # Debug auth state
│       │   │   └── defuddle/        # External tool endpoint
│       │   ├── error.tsx            # Error boundary
│       │   ├── global-error.tsx     # Global error boundary
│       │   ├── not-found.tsx        # 404 page
│       │   ├── loading.tsx          # Loading skeleton
│       │   ├── datenschutz/page.tsx # Legal
│       │   └── impressum/page.tsx   # Legal
│       ├── components/
│       │   ├── AppShell.tsx         # Main layout (library + chat)
│       │   ├── AuthProvider.tsx     # Supabase auth context
│       │   ├── ThemeProvider.tsx    # Dark/light theme
│       │   ├── library/             # Tool library components
│       │   │   ├── CardGrid.tsx     # Renders filtered tools
│       │   │   ├── FilterBar.tsx    # Filter by category/type
│       │   │   ├── ContentCard.tsx  # Single tool card
│       │   │   └── SearchModal.tsx  # Cmd+K search
│       │   ├── chat/                # Chat UI components
│       │   │   ├── FloatingChat.tsx # Chat bubble (lazy-loaded)
│       │   │   ├── ChatPanel.tsx    # Chat container
│       │   │   ├── ChatInput.tsx    # Message input with attachments
│       │   │   ├── MessageList.tsx  # Renders messages with sources
│       │   │   ├── QuickActions.tsx # Quick action buttons
│       │   │   ├── AttachmentsPanel.tsx # File/URL attachments
│       │   │   ├── UrlInputModal.tsx # URL input dialog
│       │   │   └── VoiceInputButton.tsx # Voice recording
│       │   └── ui/
│       │       ├── Badge.tsx        # Category/type badges
│       │       ├── ToolIcon.tsx     # Tool logo icon
│       │       ├── MarkdownContent.tsx # Rendered markdown
│       │       ├── SkeletonCard.tsx # Loading skeleton
│       │       └── [other UI]
│       ├── hooks/
│       │   ├── useChat.ts           # Chat state management
│       │   ├── useTheme.ts          # Theme toggle
│       │   └── [other hooks]
│       ├── lib/
│       │   ├── auth.ts              # getUser() via @genai/auth/server
│       │   ├── supabase.ts          # Server Supabase client factory
│       │   ├── types.ts             # App-specific types (ChatMessage, ChatMode)
│       │   ├── llm.ts               # LLM logic (Gemini models, system prompts)
│       │   ├── agent.ts             # Agent orchestration (tool calling loop)
│       │   ├── kb-tools.ts          # KB navigation tools (explore, list, read, search)
│       │   ├── content.ts           # Content fetching (getPublishedTools, etc)
│       │   ├── exa.ts               # Exa API client for web search
│       │   ├── ratelimit.ts         # Upstash rate limit logic
│       │   ├── sanitize.ts          # Input sanitization (XSS prevention)
│       │   ├── env.ts               # Env validation (Zod)
│       │   └── utils.ts             # Helper functions
│       ├── scripts/
│       │   └── test-kb-tools.ts     # Manual KB tools testing
│       ├── public/                  # Static assets
│       ├── supabase/                # Local Supabase config
│       ├── __tests__/               # Unit tests
│       ├── proxy.ts                 # Next.js 16 auth middleware
│       ├── package.json
│       └── next.config.js
│
├── packages/
│   ├── auth/                        # Canonical @supabase/ssr wrapper
│   │   ├── src/
│   │   │   ├── index.ts             # Barrel (browser client export)
│   │   │   ├── browser.ts           # createClient() for client components
│   │   │   ├── server.ts            # createClient() for server components
│   │   │   ├── helpers.ts           # getUser(), getSession()
│   │   │   ├── middleware.ts        # updateSession() for proxy.ts
│   │   │   └── admin.ts             # Admin client for backend ops
│   │   ├── __tests__/               # Auth tests
│   │   └── package.json
│   │
│   ├── types/                       # Shared TypeScript types
│   │   ├── src/
│   │   │   ├── index.ts             # Main exports
│   │   │   ├── content.ts           # ContentItem, ContentType, etc
│   │   │   └── auth.ts              # Auth-related types
│   │   └── package.json
│   │
│   ├── config/                      # Shared configuration
│   │   ├── tsconfig/
│   │   │   └── base.json            # Base TypeScript config
│   │   ├── eslint/
│   │   │   └── [eslint config]
│   │   ├── tailwind/
│   │   │   └── [Tailwind config]
│   │   └── package.json
│   │
│   ├── ui/                          # Shared UI components (placeholder)
│   │   ├── README.md
│   │   └── .gitkeep
│   │
│   └── e2e-tools/                   # Playwright E2E tests
│       ├── tests/
│       │   ├── website.spec.ts      # Website E2E tests
│       │   ├── tools-app.spec.ts    # Tools app E2E tests
│       │   └── auth.spec.ts         # Auth flow E2E tests
│       └── package.json
│
├── docs/
│   ├── ARCHITECTURE.md              # System architecture overview
│   ├── API.md                       # API endpoint documentation
│   ├── DEPLOYMENT.md                # Vercel deployment docs
│   ├── AUTH-FLOWS.md                # Auth flow diagrams
│   ├── AUTH-TEST-PLAN.md            # Auth testing guide
│   ├── MIGRATION.md                 # Phase migration notes
│   ├── DESIGN.md                    # UI/UX design decisions
│   └── decisions/                   # ADR (Architecture Decision Records)
│
├── .planning/
│   ├── STATE.md                     # Current project status (SOURCE OF TRUTH)
│   ├── PROJECT.md                   # Vision, roadmap, philosophy
│   ├── codebase/                    # Generated codebase analysis docs
│   │   ├── ARCHITECTURE.md          # (this file in different format)
│   │   ├── STRUCTURE.md
│   │   ├── CONVENTIONS.md
│   │   └── TESTING.md
│   ├── phases/                      # Phase planning artifacts
│   │   ├── 01-app-migration/
│   │   ├── 02-shared-packages/
│   │   └── [12 phases total]
│   ├── research/                    # Research findings
│   └── sessions/                    # Session notes
│
├── scripts/                         # Root-level utilities
├── supabase/                        # Local Supabase migrations
├── .github/workflows/               # CI/CD workflows (GitHub Actions)
├── .turbo/                          # Turbo cache (generated)
├── .changesets/                     # Changeset files for versioning
├── turbo.json                       # Monorepo task definitions
├── pnpm-workspace.yaml              # Workspace declaration
├── package.json                     # Root package + scripts
└── [root configs]
```

## Directory Purposes

**apps/website:**
- Purpose: Landing page, company info, signup flow
- Contains: Marketing pages, authentication entry point
- Key files: `app/page.tsx` (homepage), `app/api/auth/signup/route.ts` (disabled)

**apps/tools-app:**
- Purpose: Core product — tool library + AI chat assistant
- Contains: Tool discovery, chat interface, agent logic
- Key files: `app/page.tsx` (main UI), `app/api/chat/route.ts` (chat API)

**packages/auth:**
- Purpose: Centralized Supabase auth for all properties
- Contains: Supabase client factories with safe cookie handling
- Key files: `src/server.ts`, `src/browser.ts`, `src/middleware.ts`

**packages/types:**
- Purpose: Shared TypeScript definitions across apps
- Contains: Content types, chat types, auth types
- Key files: `src/content.ts` (ContentItem, ContentType)

**packages/config:**
- Purpose: Shared build and linting configuration
- Contains: TypeScript base config, ESLint rules, Tailwind config
- Key files: `tsconfig/base.json`

**packages/e2e-tools:**
- Purpose: Playwright end-to-end tests
- Contains: User journey tests for both apps
- Key files: `tests/*.spec.ts`

## Key File Locations

**Entry Points:**
- `apps/website/app/layout.tsx` — Website root layout (metadata, fonts)
- `apps/website/app/page.tsx` — Website homepage
- `apps/tools-app/app/layout.tsx` — Tools app root (auth provider, theme)
- `apps/tools-app/app/page.tsx` — Tools app homepage with server-side data fetch
- `apps/tools-app/app/api/chat/route.ts` — Main chat API endpoint

**Authentication:**
- `packages/auth/src/browser.ts` — Client-side Supabase client
- `packages/auth/src/server.ts` — Server-side Supabase client
- `packages/auth/src/helpers.ts` — getUser(), getSession() functions
- `packages/auth/src/middleware.ts` — Session refresh middleware
- `apps/website/proxy.ts` — Website auth proxy
- `apps/tools-app/proxy.ts` — Tools-app auth proxy

**Core Logic (tools-app):**
- `lib/auth.ts` — getUser() wrapper
- `lib/llm.ts` — Gemini model initialization, system prompts
- `lib/agent.ts` — Agent orchestration with tool calling
- `lib/kb-tools.ts` — Knowledge base navigation (explore, list, read, search)
- `lib/content.ts` — Content fetching from Supabase
- `lib/types.ts` — App-specific types

**UI Components:**
- `components/AppShell.tsx` — Main app layout (library + chat)
- `components/library/CardGrid.tsx` — Tool card display
- `components/chat/FloatingChat.tsx` — Chat bubble (lazy-loaded)
- `components/chat/ChatInput.tsx` — Message input

**Styling & Configuration:**
- `apps/website/globals.css` — Website styles
- `apps/tools-app/globals.css` — Tools app styles
- `packages/config/tailwind/` — Tailwind configuration
- `tailwind.config.ts` — (in each app)

## Naming Conventions

**Files:**
- `.tsx` — React components
- `.ts` — TypeScript utilities, types, logic
- `route.ts` — Next.js API route handlers (app/api/*/)
- `layout.tsx` — Next.js layout components
- `page.tsx` — Next.js page components
- `[slug]` — Dynamic route segments
- `.spec.ts` — Vitest unit tests
- `.e2e.ts` — Playwright E2E tests
- `proxy.ts` — Next.js 16 auth proxy (special name)

**Directories:**
- `app/` — Next.js 16 App Router (pages, layouts, API routes)
- `lib/` — Utility functions, business logic, clients
- `components/` — React components (UI and containers)
- `hooks/` — Custom React hooks
- `public/` — Static assets
- `__tests__/` — Test files
- `supabase/` — Supabase migrations and config
- `scripts/` — Executable utilities

**Components:**
- PascalCase for component names: `HomeClient.tsx`, `ChatInput.tsx`
- Suffix patterns: `*Client.tsx` (client-only), `*Provider.tsx` (context providers)
- Folder structure reflects component hierarchy: `components/chat/`, `components/library/`

**Functions:**
- camelCase: `getPublishedTools()`, `runAgent()`, `createClient()`
- Prefix patterns: `get*` (fetch/retrieve), `create*` (factory), `update*` (mutation), `check*` (validation)

**Types:**
- PascalCase: `ChatMessage`, `ContentItem`, `ChatMode`
- Suffix patterns: `*Props` (component props), `*Type` (union type), `*Result` (function return)

**Exports:**
- Named exports for utilities: `export { getUser, getSession }`
- Barrel exports for complex packages: `export * from './browser'`
- Conditional exports in package.json for subpaths: `./server`, `./browser`, `./helpers`

## Where to Add New Code

**New Feature (in tools-app):**
- API endpoint: `apps/tools-app/app/api/[feature]/route.ts`
- Hook: `apps/tools-app/hooks/use[Feature].ts`
- Component: `apps/tools-app/components/[domain]/[Feature].tsx`
- Utility: `apps/tools-app/lib/[feature].ts`
- Tests: `apps/tools-app/__tests__/[feature].spec.ts`

**New Component/Module:**
- If shared across apps: `packages/ui/src/[Component].tsx` (currently empty, ready to use)
- If tools-app only: `apps/tools-app/components/[domain]/[Component].tsx`
- If website only: `apps/website/components/[Component].tsx`

**New Type/Constant:**
- If shared: `packages/types/src/[feature].ts` or existing file
- If app-specific: `apps/[app]/lib/types.ts`
- If shared config: `packages/config/[feature]/`

**API Utilities:**
- Auth-specific: Add to `packages/auth/src/` (export via subpath)
- Content/Chat: Add to `apps/tools-app/lib/[feature].ts`
- Both apps: Consider moving to shared package

**Tests:**
- Unit tests: Same directory as code (`__tests__/[feature].spec.ts`)
- E2E tests: `packages/e2e-tools/tests/[feature].spec.ts`
- Fixtures: `packages/e2e-tools/fixtures/` (create if needed)

## Special Directories

**supabase/:**
- Purpose: Local Supabase configuration and migrations
- Generated: Yes (migrations auto-created via CLI)
- Committed: Yes (version control for schema changes)
- Usage: `pnpm supabase ...` commands for local dev

**.turbo/:**
- Purpose: Turborepo build cache
- Generated: Yes (auto-generated during builds)
- Committed: No (.gitignore)
- Usage: Speeds up incremental builds

**.changesets/:**
- Purpose: Changeset files for versioning and changelog
- Generated: Yes (via `pnpm changeset`)
- Committed: Yes (MUST commit with each feature)
- Usage: `pnpm version` reads to bump versions, `pnpm release` publishes

**.planning/:**
- Purpose: GSD project artifacts (phases, research, state)
- Generated: Partially (STATE.md is source of truth, phases auto-created)
- Committed: Yes (all planning documents)
- Usage: Reference for current work, phase status, decisions

**.github/workflows/:**
- Purpose: CI/CD automation (testing, linting, deployment)
- Generated: No (manually configured)
- Committed: Yes
- Usage: Runs on PR and push events

---

*Structure analysis: 2026-04-17*
