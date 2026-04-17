# Technology Stack

**Analysis Date:** 2026-04-17

## Languages

**Primary:**
- TypeScript 5 - All application code, strict type checking enabled

**Secondary:**
- JavaScript - Build and configuration files

## Runtime

**Environment:**
- Node.js - Version specified via pnpm, compatible with Vercel Edge Runtime

**Package Manager:**
- pnpm 10.8.1 - Monorepo-aware, workspace linking via `pnpm-workspace.yaml`
- Lockfile: `pnpm-lock.yaml` (present)

## Frameworks

**Core:**
- Next.js 16.2.3 - App Router (required >=15), React 19 integration
  - `apps/website/` - Landing, sign-up, legal pages
  - `apps/tools-app/` - Tool directory, chat interface
- React 19.2.4 - UI components with React Server Components

**Styling:**
- Tailwind CSS v4 - Utility-first CSS via `@tailwindcss/postcss`
- PostCSS v4 - CSS processing pipeline
- Class Variance Authority (CVA) 0.7.1 - Component variant generation
- Tailwind Merge 3.5.0 - Utility conflict resolution

**UI Components:**
- Base UI React 1.3.0 - Headless components (website)
- lucide-react 1.8.0 - Icon library (both apps)
- react-icons 5.6.0 - Additional icons (tools-app)
- framer-motion 12.38.0 - Animation library (website)
- motion 12.38.0 - Animation library (tools-app, Framer Motion alternative)
- shadcn - Component CLI (website)

**Markdown Rendering:**
- react-markdown 10.1.0 - Markdown to React components
- remark-gfm 4.0.1 - GitHub Flavored Markdown plugin

**Testing:**
- Vitest 4.1.4 - Unit test runner, config in each app
- @testing-library/react 16.3.2 - Component testing utilities
- @testing-library/dom 10.4.1 - DOM testing utilities
- @testing-library/jest-dom 6.9.1 - Jest matchers for DOM
- @testing-library/user-event 14.6.1 - User interaction simulation
- jsdom 29.0.2 - DOM implementation for Node.js
- Playwright 5+ - E2E testing (config: `packages/e2e-tools/playwright.config.ts`)

**Build & Dev Tools:**
- Turborepo 2.5.3 - Monorepo task orchestration and caching
- Vite - Vitest integration via vite-tsconfig-paths
- Prettier 3.8.2 - Code formatting
- ESLint 9 - Linting with Next.js config

**Validation & Environment:**
- Zod 4.3.6 - Runtime schema validation
- @t3-oss/env-nextjs 0.13.11 - Type-safe environment variables with validation at build time

## Key Dependencies

**Critical:**
- @supabase/supabase-js 2.103.0 - Supabase client (Auth, Database, Realtime)
- @supabase/ssr 0.10.2 - Server-side auth helpers for Next.js
- @genai/auth - Shared auth package (workspace), exports: browser, server, admin, helpers, middleware

**AI & LLM:**
- @ai-sdk/google 3.0.63 - Vercel AI SDK integration with Gemini (tools-app)
- @anthropic-ai/sdk 0.87.0 - Anthropic SDK for Claude (tools-app, used for tool definitions)
- openai 6.34.0 - OpenAI SDK (tools-app, unused but present)
- ai 6.0.159 - Vercel AI SDK core for streaming and chat

**Infrastructure & Monitoring:**
- @sentry/nextjs 10 - Error tracking and performance monitoring (tools-app)
- @upstash/redis 1.37.0 - Serverless Redis client for rate limiting
- @upstash/ratelimit 2.0.8 - Distributed rate limiting service
- @vercel/speed-insights 2.0.0 - Performance metrics (both apps)
- @mozilla/readability 0.6.0 - Article extraction and readability (tools-app)

**Utilities:**
- clsx 2.1.1 - Conditional className utility
- tw-animate-css 1.4.0 - Tailwind animation utilities (website)

**Email:**
- resend 6.10.0 - Email service client (website)

**Shared Packages:**
- @genai/types - TypeScript types (workspace)
- @genai/config - ESLint, TypeScript, Tailwind config (workspace)
- @genai/ui - Shared React components (workspace)

## Configuration

**Environment Variables:**

Server-only (never exposed):
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase admin key
- `GOOGLE_GENERATIVE_AI_API_KEY` - Gemini API
- `ANTHROPIC_API_KEY` - Claude API (optional, tools-app)
- `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` - Rate limiting
- `EXA_API_KEY` - Web search API
- `ZHIPU_API_KEY`, `MINIMAX_API_KEY` - LLM fallbacks (optional)

Client (prefixed `NEXT_PUBLIC_`):
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase public key
- `NEXT_PUBLIC_COOKIE_DOMAIN` - Cookie domain (.generation-ai.org)
- `NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA` - Deployment tracking (tools-app)

Validation Strategy:
- Tools-app: `lib/env.ts` uses t3-env with Zod for type-safe validation at build time
- Website: Environment file references in `next.config.ts`
- Turborepo passes through defined env vars via `globalPassThroughEnv` in `turbo.json`

**Build Configuration:**
- `apps/website/next.config.ts` - CSP headers, security headers, HSTS
- `apps/tools-app/next.config.ts` - Sentry integration, image optimization, security headers
- `apps/tools-app/sentry.server.config.ts` - Sentry initialization with DSN, sampling
- `apps/tools-app/sentry.edge.config.ts` - Edge runtime Sentry config

**TypeScript:**
- Base config: `packages/config/tsconfig.base.json` (shared)
- Per-app: `apps/website/tsconfig.json`, `apps/tools-app/tsconfig.json`
- Strict mode enabled, module resolution via path aliases

**ESLint:**
- Config: `packages/config/eslint.config.js` (shared)
- Extends Next.js recommended config
- Per-app ESLint setup with `eslint` command

**Tailwind:**
- Config: `packages/config/tailwind.config.js` (shared)
- PostCSS pipeline via `@tailwindcss/postcss`
- Tailwind v4 with modern CSS features

## Platform Requirements

**Development:**
- Node.js (version manager not enforced, pnpm 10.8.1)
- pnpm for workspace management
- Supabase local development not required (uses remote instance)
- Local `.env.local` files (see `apps/tools-app/.env.example`)

**Production:**
- Vercel - Primary hosting platform (two projects: website, tools-app)
- GitHub - Source control with automatic deployments on push to main
- Supabase Cloud - Managed PostgreSQL + Auth (project: wbohulnuwqrhystaamjc)
- Edge Runtime - Full support for Next.js Edge Functions

**Deployment Target:**
- Vercel (generation-ai.org, tools.generation-ai.org)
- Build command: `turbo build` (Turborepo caching)
- Start command: `next start` (per app)

---

*Stack analysis: 2026-04-17*
