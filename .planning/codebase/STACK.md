# Technology Stack

**Analysis Date:** 2026-04-19

## Languages

**Primary:**
- TypeScript ^5 (catalog) — all apps and packages, strict mode via `@genai/config/tsconfig/base.json`
- TSX/JSX — React 19 components in apps and `packages/ui`, `packages/emails`

**Secondary:**
- CSS — Tailwind v4 source files, e.g. `packages/config/tailwind/base.css`
- SQL — Supabase migrations under `apps/website/supabase/`, `apps/tools-app/supabase/`, top-level `supabase/`

## Runtime

**Environment:**
- Node.js >=20 (implied by `@types/node` ^20 in catalog; no `.nvmrc` present)
- Next.js runtimes: `nodejs` (default for App Router) and `edge` (some routes), see `apps/tools-app/instrumentation.ts`

**Package Manager:**
- pnpm 10.8.1 (`packageManager` field in `package.json`)
- Lockfile: `pnpm-lock.yaml` present at repo root
- Workspaces defined in `pnpm-workspace.yaml` (`apps/*`, `packages/*`) with shared catalog

## Frameworks

**Core:**
- Next.js 16.2.3 (catalog) — App Router, both apps. **Note:** `apps/website/AGENTS.md` warns this is a non-standard build with breaking changes versus training data; consult `node_modules/next/dist/docs/` before changes.
- React 19.2.4 / React DOM 19.2.4 (catalog)
- Tailwind CSS ^4 with `@tailwindcss/postcss` ^4

**UI Libraries:**
- `@base-ui/react` ^1.3.0 (website) — headless primitives
- `@radix-ui/colors` ^3.0.0 (`packages/ui`, `packages/config`)
- `framer-motion` ^12.38.0 (website), `motion` ^12.38.0 (tools-app)
- `lucide-react` ^1.8.0, `react-icons` ^5.6.0 (tools-app)
- `class-variance-authority` ^0.7.1, `clsx` ^2.1.1, `tailwind-merge` ^3.5.0, `tw-animate-css` ^1.4.0
- `shadcn` ^4.2.0 CLI in website (`components.json` present)
- `geist` ^1.7.0 fonts in both apps

**LLM / AI SDKs (tools-app):**
- `ai` ^6.0.159 (Vercel AI SDK)
- `@ai-sdk/google` ^3.0.63 — Gemini provider
- `@anthropic-ai/sdk` ^0.87.0 — Claude provider
- `openai` ^6.34.0 — OpenAI client (kept for compatibility; not main path)

**Content / Parsing (tools-app):**
- `@mozilla/readability` ^0.6.0
- `react-markdown` ^10.1.0 + `remark-gfm` ^4.0.1
- `zod` ^4.3.6 — schema validation
- `@t3-oss/env-nextjs` ^0.13.11 — typed env validation

**Auth:**
- `@supabase/supabase-js` ^2.103.0 (catalog)
- `@supabase/ssr` ^0.10.2 (catalog)

**Email (`packages/emails`):**
- `react-email` ^3.0.1, `@react-email/components` ^0.0.31, `@react-email/render` ^1.0.1
- `resend` ^6.10.0 (used in `apps/website/lib/email.ts`)
- `sharp` ^0.33.5 (logo PNG generation script)

**Testing:**
- Vitest ^4.1.4 (`vitest.config.mts` per app)
- `@testing-library/react` ^16.3.2, `@testing-library/dom` ^10.4.1, `@testing-library/jest-dom` ^6.9.1, `@testing-library/user-event` ^14.6.1
- `jsdom` ^29.0.2 (~^26 in `packages/ui`)
- `@vitejs/plugin-react` ^6.0.1, `vite-tsconfig-paths` ^6.1.1
- Playwright ^1.52.0 in `packages/e2e-tools` with `dotenv` ^16.4.5
- `next-test-api-route-handler` ^5.0.4 (tools-app)

**Build / Dev:**
- Turborepo ^2.5.3 — pipeline in `turbo.json` (build, dev, lint, test, e2e)
- ESLint ^9 (catalog) + `eslint-config-next` 16.2.3, shared config `@genai/config/eslint/next`
- Prettier ^3.8.2 (website devDep)
- `tsx` ^4.19.0 — script runner for emails / scripts

**Monitoring / Perf:**
- `@sentry/nextjs` ^10 (tools-app) — `sentry.server.config.ts`, `sentry.edge.config.ts`, `instrumentation.ts`, `instrumentation-client.ts`
- `@vercel/speed-insights` ^2.0.0 (both apps)

**Rate Limiting (tools-app):**
- `@upstash/ratelimit` ^2.0.8
- `@upstash/redis` ^1.37.0

**Voice (tools-app):**
- Deepgram REST API (no SDK; called via fetch in `apps/tools-app/app/api/voice/`)

## Key Dependencies

**Critical:**
- Next.js 16 + React 19 — App Router with App-router-specific dynamic rendering rules (see `LEARNINGS.md`)
- Supabase SSR — request-cookie based session handling via `packages/auth`
- Vercel AI SDK + Anthropic SDK — drive chat/agent features in tools-app
- Turborepo — orchestrates builds across apps and packages with `globalPassThroughEnv`

**Infrastructure:**
- pnpm catalog — single source of truth for shared versions (React, Next, Supabase, Tailwind, ESLint, types)
- Changesets (`@changesets/cli` ^2.30.0, `@changesets/changelog-github` ^0.6.0) — versioning for `linked: [website, tools-app]`

## Configuration

**Environment:**
- Type-safe validation via `@t3-oss/env-nextjs` in `apps/tools-app/lib/env.ts` (Zod schemas, server vs client split)
- Website does not use t3-env; reads `process.env` directly in `apps/website/lib/email.ts` and `apps/website/next.config.ts`
- `turbo.json` `globalPassThroughEnv` whitelist controls which env vars cross the Turbo cache boundary
- `.env*` files exist locally; never read by tooling here. `SKIP_ENV_VALIDATION=1` bypass available

**Build:**
- Per-app Next config: `apps/website/next.config.ts`, `apps/tools-app/next.config.ts` (latter wraps with Sentry, sets `NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA`, `NEXT_PUBLIC_COOKIE_DOMAIN`)
- TS configs extend `@genai/config/tsconfig/base.json`
- ESLint flat config: `apps/*/eslint.config.mjs`
- PostCSS: `apps/*/postcss.config.mjs` (Tailwind v4)
- Vitest: `apps/*/vitest.config.mts` + `vitest.setup.ts`

## Platform Requirements

**Development:**
- macOS / Linux with Node.js 20+ and pnpm 10.8.1
- `pnpm install` from repo root, then `pnpm dev` (all apps) or `pnpm dev:website` / `pnpm dev:tools`
- Website on port 3000, tools-app on port 3001 (`next dev --port 3001`)

**Production:**
- Hosted on Vercel; two projects (one per app)
- Domains: `generation-ai.org` (website), `tools.generation-ai.org` (tools-app), `community.generation-ai.org` (Circle, external)
- CSP with nonce requires dynamic rendering (force-dynamic in root layout) — see `LEARNINGS.md`

---

*Stack analysis: 2026-04-19*
