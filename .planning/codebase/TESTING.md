# Testing Patterns

**Analysis Date:** 2026-04-19

## Test Stack Overview

Three layers, three runners:

| Layer | Runner | Where | What |
|-------|--------|-------|------|
| Unit / component | **Vitest 4** + Testing Library | `apps/*/__tests__/`, `packages/*/__tests__/` | React components, API route handlers, lib helpers |
| End-to-end | **Playwright 1.52** | `packages/e2e-tools/tests/` | Auth flows, chat, smoke, visual baselines |
| Prod smoke | **Playwright** | `packages/e2e-tools/tests/smoke.spec.ts` | Hourly check of live URLs (CSP / black-page regressions) |

## Vitest Setup

**Config** (per app, identical structure — `apps/*/vitest.config.mts`):
```ts
import { defineConfig } from "vitest/config"
import react from "@vitejs/plugin-react"
import tsconfigPaths from "vite-tsconfig-paths"

export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
    include: ["__tests__/**/*.test.{ts,tsx}"],
  },
})
```

**Setup file** (`apps/*/vitest.setup.ts`):
```ts
import "@testing-library/jest-dom/vitest"
```

- `vite-tsconfig-paths` resolves the `@/*` alias automatically
- `globals: true` → `describe`, `it`, `expect`, `vi` available without import (but tests in this repo still import them explicitly — match that)
- `environment: "jsdom"` for React component testing

**Packages with their own vitest:**
- `packages/auth/` — `vitest.config.mts`, tests in `packages/auth/__tests__/helpers.test.ts`
- `packages/ui/` — `vitest.config.ts`

## Test Commands

```bash
# Root — runs everything via Turbo
pnpm test                   # unit + component, all packages
pnpm test:watch             # watch mode
pnpm e2e                    # Playwright (gated on staging URL in CI)

# Per-app
pnpm --filter @genai/website test
pnpm --filter @genai/tools-app test
pnpm --filter @genai/tools-app test:watch

# E2E only
pnpm --filter @genai/e2e-tools e2e          # headless
pnpm --filter @genai/e2e-tools e2e:ui       # Playwright UI
pnpm --filter @genai/e2e-tools e2e:headed   # headed browser

# Smoke against prod
pnpm --filter @genai/e2e-tools exec playwright test smoke.spec.ts

# Tools-app specific helper
pnpm --filter @genai/tools-app test:kb-tools   # tsx script with .env.local
```

## File Layout

**Co-located tests are NOT used.** All tests live under `__tests__/` directories:

```
apps/website/__tests__/
└── components/
    └── Button.test.tsx

apps/tools-app/__tests__/
├── api/
│   ├── chat.test.ts
│   └── health.test.ts
└── components/
    ├── ChatInput.test.tsx
    └── QuickActions.test.tsx

packages/auth/__tests__/
└── helpers.test.ts

packages/e2e-tools/tests/
├── auth.spec.ts
├── chat.spec.ts
├── smoke.spec.ts
└── visual-baseline.spec.ts
```

**Naming:**
- Unit/component: `*.test.{ts,tsx}`
- E2E: `*.spec.ts` (Playwright convention)

## Component Test Pattern

Reference: `apps/website/__tests__/components/Button.test.tsx`

```ts
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, it, expect, vi } from "vitest"
import { Button } from "@/components/ui/button"

describe("Button", () => {
  it("renders correctly", () => {
    render(<Button>Click me</Button>)
    expect(screen.getByRole("button")).toBeInTheDocument()
  })

  it("calls onClick when clicked", async () => {
    const handleClick = vi.fn()
    const user = userEvent.setup()
    render(<Button onClick={handleClick}>Click me</Button>)
    await user.click(screen.getByRole("button"))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })
})
```

**Conventions:**
- `userEvent.setup()` per test, not module-level
- Query by **role + accessible name** first (`getByRole("button", { name: /click me/i })`), fall back to `getByLabelText`, then test IDs as last resort
- `vi.fn()` for callback spies; assert call counts and args
- Always import `describe/it/expect/vi` even though `globals: true` (consistent with rest of suite)

## API Route Test Pattern

Reference: `apps/tools-app/__tests__/api/chat.test.ts`

Uses `next-test-api-route-handler` to invoke Next.js App Router route handlers in isolation.

**Critical ordering rule** (commented in the file):
```ts
// 1. next-test-api-route-handler MUST be the first import
import { testApiHandler } from "next-test-api-route-handler"
import { describe, it, expect, vi, beforeEach } from "vitest"

// 2. ALL vi.mock() calls BEFORE importing the handler
vi.mock("@/lib/supabase", () => ({ /* ... */ }))
vi.mock("@/lib/ratelimit", () => ({ /* ... */ }))
vi.mock("@/lib/llm", () => ({ /* ... */ }))

// 3. Import handler AFTER mocks
import * as chatHandler from "@/app/api/chat/route"
```

**Test shape:**
```ts
await testApiHandler({
  appHandler: chatHandler,
  test: async ({ fetch }) => {
    const res = await fetch({
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: "Hello" }),
    })
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.sessionId).toBeDefined()
  },
})
```

**Per-test mock overrides** with `vi.mocked(fn).mockResolvedValueOnce(...)` for edge cases (rate-limit, error paths).

## Mocking

- **Framework:** Vitest built-in `vi.mock()`, `vi.fn()`, `vi.mocked()`
- **What to mock:** External services (Supabase, LLM SDKs, Upstash rate-limit, Exa), Next.js internals when needed
- **What NOT to mock:** The component under test, simple pure helpers, types
- `vi.clearAllMocks()` in `beforeEach` for handler tests
- No global mock setup file — every test file declares its own mocks

## Playwright E2E

**Config:** `packages/e2e-tools/playwright.config.ts`
- `testDir: "./tests"`, `fullyParallel: true`
- Browser: chromium only
- `baseURL: process.env.BASE_URL || "http://localhost:3001"` (override via `.env.test.local`)
- Retries: 2 in CI, 0 local; workers: 1 in CI
- Timeouts: `30s` test, `10s` expect
- Reporter: HTML
- Trace: `on-first-retry`

**Loaded env:** `dotenv/config` + `dotenv.config({ path: ".env.test.local" })` at top of config.

**Helpers / fixtures:**
- `packages/e2e-tools/fixtures/test-user.ts` — `getTestUser()`, `requireTestUser()`
- `packages/e2e-tools/helpers/supabase-admin.ts` — `generateMagicLink()`, `generateRecoveryLink()`, `ensureTestUser()` (admin-API bypass for email delivery)
- `packages/e2e-tools/helpers/csp-assertions.ts` — `collectCspViolations()`, `assertCspHeader()`

**Test patterns** (`auth.spec.ts`):
- `test.describe.configure({ mode: "serial" })` when tests share one Supabase user (prevents login/logout races)
- `test.setTimeout(60_000)` per long auth test
- `test.skip("manual-only: ...")` for things infeasible in short automated runs (e.g. token expiry) — comment links to `docs/AUTH-FLOW.md`
- Wait helpers: `page.waitForURL((url) => ...)`, `page.waitForLoadState("networkidle")`
- Cookie assertions: read via `page.context().cookies(URL)`, check `domain === ".generation-ai.org"`, `sameSite === "Lax"`
- German UI selectors: `page.getByRole("button", { name: /mit passwort anmelden/i })`

## Smoke Tests (Prod)

`packages/e2e-tools/tests/smoke.spec.ts` — **the most important test in the repo**.

Catches the 2026-04-18 black-page incident (CSP nonce mismatch → all scripts blocked → HTTP 200 + empty body). See `LEARNINGS.md`.

**What it checks per URL** (`generation-ai.org` + `tools.generation-ai.org`):
1. HTTP status `< 400`
2. **Zero CSP violations** (regex: `/Content Security Policy|script-src|strict-dynamic|nonce/i`)
3. **Body has visible text** (>20 chars after trim — the black-page symptom is empty `body.innerText`)
4. **Zero unhandled page errors**
5. **Zero console errors** (with whitelist for Vercel Speed Insights noise)

**Whitelist:**
```ts
const ERROR_WHITELIST = [
  /speed-insights/i,
  /vercel-scripts/i,
  /vitals\.vercel-insights/i,
]
```

**Schedule** (`.github/workflows/smoke-prod.yml`):
- After every `main` push (with 3-min sleep for Vercel promotion)
- Hourly cron `0 * * * *`
- Manual `workflow_dispatch`
- On failure → workflow rot → GitHub email to repo admins

**Manual smoke before "fertig":** Per project CLAUDE.md and global rules, never declare a UI/API change done without at least one browser smoke test.

## Visual Baselines

`packages/e2e-tools/tests/visual-baseline.spec.ts` with snapshots in `visual-baseline.spec.ts-snapshots/`. Standard Playwright `expect(page).toHaveScreenshot()` flow.

## CI Integration

`.github/workflows/ci.yml`:
1. Checkout → pnpm setup → Node 20 → `pnpm install --frozen-lockfile`
2. `pnpm build` (with Supabase env vars from secrets)
3. `pnpm lint`
4. `pnpm test` (Vitest across all workspaces via Turbo)
5. **E2E job** — only runs when `vars.STAGING_URL` is set; caches Playwright browsers; uploads HTML report artifact on failure

`.github/workflows/smoke-prod.yml`: independent job for prod smoke (see above).

## Coverage

**No coverage thresholds enforced** anywhere. No `--coverage` flag wired into scripts. Add `pnpm vitest run --coverage` ad-hoc when investigating gaps.

## What's Tested vs What Isn't

**Tested:**
- `apps/website` — Button primitive (one component) → coverage minimal
- `apps/tools-app` — `/api/health`, `/api/chat` happy-path + 400 + 429; ChatInput, QuickActions components
- `packages/auth` — helpers (`packages/auth/__tests__/helpers.test.ts`)
- E2E: 6 auth flow paths (password, magic link, signout, password-reset, cross-domain cookie, session persistence), CSP baseline, prod smoke

**NOT tested (gaps):**
- Most website components (sections/, hero, terminal-splash, ThemeProvider) — only `Button` has a test
- tools-app library/, detail/, layout/ components
- Most lib modules (`agent.ts`, `llm.ts`, `kb-tools.ts`, `exa.ts`, `sanitize.ts`, `csp.ts`, `content.ts`)
- Email templates (`packages/emails/src/templates/`) — manual visual check via `dist/` HTML
- Middleware logic in `packages/auth/src/middleware.ts` (only manual Playwright-MCP runs documented)
- Token refresh flow — explicitly skipped, manual-only
- `@genai/ui` package — has vitest config but no `__tests__/` directory yet

## Smoke-Test Approach (Project Rule)

Per global + project CLAUDE.md:

> **Kein "fertig" ohne Verifikation** — mindestens ein Smoke-Test.

**Definition of "smoke" depends on the change:**
- **UI:** Open in browser, check the actual rendered page (Playwright MCP or manual). Verify dark + light theme.
- **API:** `curl` or `npx tsx` script against the route. Check status + JSON shape.
- **Auth / middleware / CSP:** Run `packages/e2e-tools/tests/smoke.spec.ts` against staging or prod (after deploy promo).
- **Type-only changes:** Trust `tsc`, but run `pnpm build` for the affected app when in doubt.

**Debug protocol when smoke fails:**
1. Read `LEARNINGS.md` first (incident lessons, mandatory before CSP / proxy / middleware changes)
2. Use Playwright against the **real URL**, don't guess from code
3. Form hypotheses in order: own diff → recent commits → config → infrastructure → upstream provider (Supabase, Vercel, Anthropic). Never start at "the model is broken."

---

*Testing analysis: 2026-04-19*
