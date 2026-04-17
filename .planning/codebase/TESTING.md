# Testing Patterns

**Analysis Date:** 2026-04-17

## Test Framework

**Runner:**
- Vitest 4.1.4
- Config: `vitest.config.mts` (TypeScript config)
- Supports both Node and jsdom environments

**Assertion Library:**
- Vitest built-in assertions (chai-based)
- `@testing-library/jest-dom` for DOM matchers

**Run Commands:**
```bash
pnpm test              # Run all tests once (vitest run)
pnpm test:watch       # Watch mode (vitest)
pnpm test:kb-tools   # Tools-app specific: test KB tools integration
pnpm e2e              # E2E tests via Playwright (from root)
```

**Coverage:**
- No explicit coverage targets configured
- Run coverage with `vitest run --coverage` (requires coverage provider, not observed in config)

## Test File Organization

**Location:**
- Co-located in `__tests__/` directory at same level as source code
- Unit tests: `__tests__/api/` mirrors `app/api/` structure
- Component tests: `__tests__/components/` mirrors `components/` structure

**Naming:**
- Pattern: `[ModuleName].test.ts` or `[ComponentName].test.tsx`
- Examples: `chat.test.ts`, `health.test.ts`, `Button.test.tsx`, `ChatInput.test.tsx`

**Structure (by app):**
```
apps/website/
├── components/
│   └── ui/button.tsx
└── __tests__/
    └── components/
        └── Button.test.tsx

apps/tools-app/
├── lib/
│   └── agent.ts
├── app/
│   └── api/chat/route.ts
└── __tests__/
    ├── api/
    │   ├── chat.test.ts
    │   └── health.test.ts
    └── components/
        ├── ChatInput.test.tsx
        └── QuickActions.test.tsx

packages/auth/
├── src/
│   └── helpers.ts
└── __tests__/
    └── helpers.test.ts
```

## Test Structure

**Suite Organization:**

Using Vitest's `describe` blocks with nested test organization. From `Button.test.tsx`:

```typescript
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

**Patterns:**

1. **Setup:** Destructure testing library utilities at top
2. **Test naming:** `it("should [behavior]", () => { ... })`
3. **Assertions:** End with `expect()` calls
4. **Async handling:** Mark test as `async`, use `await user.` for interactions
5. **Cleanup:** Automatic via testing library + vitest

## Environment Configuration

**jsdom (UI/Component Tests):**
- `setupFiles: ["./vitest.setup.ts"]`
- Loads `@testing-library/jest-dom/vitest` for DOM matchers
- Example config from `apps/website/vitest.config.mts`:

```typescript
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

**node (Backend/Server Tests):**
- Used by `packages/auth/vitest.config.mts`
- No setupFiles needed
- Example config:

```typescript
export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
  },
})
```

## Mocking

**Framework:** Vitest's `vi` mock function

**Patterns (API Route Tests):**

Mock all external dependencies BEFORE importing handler. From `chat.test.ts`:

```typescript
import { testApiHandler } from 'next-test-api-route-handler'
import { describe, it, expect, vi, beforeEach } from 'vitest'

// IMPORTANT: Mocks FIRST
vi.mock('@/lib/supabase', () => ({
  createServerClient: vi.fn(() => ({
    from: vi.fn(() => ({
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(() => ({
            data: { id: 'test-session-123' },
            error: null,
          })),
        })),
      })),
    })),
  })),
}))

vi.mock('@/lib/ratelimit', () => ({
  checkRateLimit: vi.fn(() =>
    Promise.resolve({
      success: true,
      limit: 20,
      remaining: 19,
      reset: Date.now() + 60000,
    })
  ),
  getClientIp: vi.fn(() => '127.0.0.1'),
}))

// THEN import handler
import * as chatHandler from '@/app/api/chat/route'
import { checkRateLimit } from '@/lib/ratelimit'
```

**Test-Specific Mock Overrides:**

Override mocks for individual tests:

```typescript
it('returns 429 when rate limited', async () => {
  // Override the mock for this test
  vi.mocked(checkRateLimit).mockResolvedValueOnce({
    success: false,
    limit: 20,
    remaining: 0,
    reset: Date.now() + 60000,
    retryAfter: 60,
  })

  await testApiHandler({
    appHandler: chatHandler,
    test: async ({ fetch }) => {
      const res = await fetch({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: 'Test message' }),
      })
      expect(res.status).toBe(429)
    },
  })
})
```

**Server Function Mocking:**

From `helpers.test.ts`:

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock the server module's createClient
vi.mock('../src/server', () => ({
  createClient: vi.fn(),
}))

import { createClient } from '../src/server'

const mockCreateClient = vi.mocked(createClient)

describe('getUser', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns user object when supabase returns valid user', async () => {
    mockCreateClient.mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: mockUser },
          error: null,
        }),
      },
    } as any)

    const result = await getUser()
    expect(result).toEqual(mockUser)
  })
})
```

**What to Mock:**
- All external services (Supabase, OpenAI, Upstash Redis)
- Database calls
- HTTP requests to external APIs
- Environment-dependent functions

**What NOT to Mock:**
- Utilities from your own `lib/` (unless they're external wrappers)
- React Testing Library internals
- Vitest internals

## Fixtures and Factories

**Test Data Pattern:**

Define mock/test data inline or in test file. From `chat.test.ts`:

```typescript
// Mock data inline
vi.mock('@/lib/ratelimit', () => ({
  checkRateLimit: vi.fn(() =>
    Promise.resolve({
      success: true,
      limit: 20,
      remaining: 19,
      reset: Date.now() + 60000,
    })
  ),
}))
```

**Mock User Object (from `helpers.test.ts`):**

```typescript
const mockUser = {
  id: 'user-123',
  email: 'test@example.com',
  aud: 'authenticated',
  role: 'authenticated',
}

mockCreateClient.mockResolvedValue({
  auth: {
    getUser: vi.fn().mockResolvedValue({
      data: { user: mockUser },
      error: null,
    }),
  },
} as any)
```

**Location:** No separate fixtures directory observed. Mock data defined in test files where used.

**Factory Pattern:** Not observed. Use inline mock objects or factory-like functions if building many test variants.

## Test Types

**Unit Tests (API + Functions):**
- Scope: Individual functions or route handlers
- Approach: Mock all dependencies, test single behavior
- Example: `chat.test.ts` tests `/api/chat` POST handler with various inputs
- Framework: Vitest + `next-test-api-route-handler` for route handlers

**Component Tests (UI):**
- Scope: React components in isolation
- Approach: Render component, user interactions via userEvent, assertion on DOM
- Example: `Button.test.tsx` tests button rendering, clicking, disabled state
- Framework: Testing Library (React) + Vitest

**Integration Tests:**
- Not explicitly separated in test suite
- Could be tests that mock fewer dependencies and test multiple layers

**E2E Tests:**
- Framework: Playwright
- Config: `packages/e2e-tools/playwright.config.ts`
- Location: `packages/e2e-tools/tests/`
- Pattern: Full browser test from user perspective
- Example: `auth.spec.ts` tests login page accessibility, navigation

## Common Patterns

**Async Testing:**

Using `async/await` with userEvent:

```typescript
it('calls onSend when Enter is pressed', async () => {
  const user = userEvent.setup()
  const onSend = vi.fn()
  render(<ChatInput onSend={onSend} isLoading={false} />)

  const textarea = screen.getByRole('textbox')
  await user.type(textarea, 'Test message{Enter}')

  expect(onSend).toHaveBeenCalledWith('Test message')
})
```

Key: `userEvent.setup()` then `await user.[action]()` for all interactions.

**Error Testing:**

Test both success and error paths:

```typescript
it('returns 400 when message is empty', async () => {
  await testApiHandler({
    appHandler: chatHandler,
    test: async ({ fetch }) => {
      const res = await fetch({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: '' }),
      })
      expect(res.status).toBe(400)
      const data = await res.json()
      expect(data.error).toBeDefined()
    },
  })
})
```

**Mock Cleanup:**

Always clear mocks between tests:

```typescript
beforeEach(() => {
  vi.clearAllMocks()
})
```

**Query Patterns:**

Use semantic queries from Testing Library:

```typescript
// Good
screen.getByRole('button', { name: /click me/i })
screen.getByRole('textbox')
screen.getByLabel(/email/i)

// Avoid
screen.getByTestId('button')
screen.getByClassName('...')
```

## E2E Test Structure

**Playwright Configuration:**
```typescript
export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "html",
  use: {
    baseURL: process.env.BASE_URL || "http://localhost:3001",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
})
```

**E2E Test Example (from `auth.spec.ts`):**

```typescript
import { test, expect } from '@playwright/test'

test.describe('Auth Flow', () => {
  test('homepage loads', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveTitle(/Generation AI|Tools/i)
  })

  test('login page accessible', async ({ page }) => {
    await page.goto('/login')
    const loginHeading = page.getByRole('heading', { name: /anmelden|login/i })
    const emailInput = page.getByLabel(/email/i)
    await expect(loginHeading.or(emailInput)).toBeVisible({ timeout: 10000 })
  })

  test.skip('can login with valid credentials', async ({ page }) => {
    // Incomplete: needs TEST_USER_EMAIL, TEST_USER_PASSWORD
    test.skip()
  })
})
```

**E2E Patterns:**
- Use `page.goto()` for navigation
- Use `page.getByRole()`, `page.getByLabel()` for element selection (semantic)
- Use `await expect(element).toBeVisible()` for assertions
- Conditional `test.skip()` for tests that need env vars

## CI Pipeline

**GitHub Actions (`.github/workflows/ci.yml`):**

```bash
# Step 1: Build
pnpm build

# Step 2: Lint
pnpm lint

# Step 3: Unit Tests
pnpm test

# Step 4: E2E Tests (optional, requires STAGING_URL var)
pnpm e2e
```

**E2E Test Requirements:**
- Only runs if `vars.STAGING_URL` is configured
- Runs AFTER build-and-test job succeeds
- Caches Playwright browsers for speed
- Uploads HTML report on failure

## Coverage

**Coverage Configuration:** Not enforced in `vitest.config.mts`. No minimum targets defined.

**To Enable Coverage:**
```bash
vitest run --coverage
```

Requires coverage provider like `@vitest/coverage-v8` (not currently installed).

---

*Testing analysis: 2026-04-17*
