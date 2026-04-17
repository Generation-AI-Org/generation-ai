# Coding Conventions

**Analysis Date:** 2026-04-17

## Naming Patterns

**Files:**
- Components (React): `PascalCase.tsx` — `Hero.tsx`, `Button.tsx`, `ChatInput.tsx`
- Utilities/helpers: `camelCase.ts` — `sanitize.ts`, `agent.ts`, `ratelimit.ts`
- Route handlers: `route.ts` in Next.js app directory structure
- Test files: `[ComponentName].test.tsx` or `[module].test.ts` in `__tests__/` directories
- API routes: `route.ts` in `app/api/[route]/` paths

**Functions:**
- Named exports use `camelCase`: `stripThinkTags()`, `getGeminiClient()`, `checkRateLimit()`
- React components use `PascalCase`: `function Button()`, `export function Hero()`
- Private functions prefix with underscore: `_geminiClient` (state variable, not function)
- Async functions: standard naming, no special prefix

**Variables:**
- Constants: `SCREAMING_SNAKE_CASE` — `MODEL`, `LITE_MODEL`, `SYSTEM_PROMPT`
- Standard variables: `camelCase` — `ipRatelimit`, `sessionId`, `seenSlugs`
- Component props: `camelCase` — `isLoading`, `onSend`, `onClick`, `variant`
- Prefix state with `_` when singleton cached value: `_geminiClient`, `_anthropicClient`

**Types:**
- Interfaces: `PascalCase` — `ChatMessage`, `RateLimitResult`, `KBListItem`, `RecommendationResponse`
- Type aliases: `PascalCase` — `ChatMode`, `ContentType`, `ContentSource`
- Generic parameters: single uppercase letter or descriptive — `<T>`, `<Props>`

**Imported items:**
- Lowercase module names: `import { Button } from "@/components/ui/button"`
- Mixed imports for components and utilities: `import React, { useState } from "react"`
- Path aliases used: `@/` for src root, `@genai/` for workspace packages

## Code Style

**Formatting:**
- Tool: Prettier
- Settings (from `.prettierrc`):
  - `semi: true` — Statements end with semicolons
  - `singleQuote: false` — Double quotes for strings
  - `tabWidth: 2` — 2-space indentation
  - `trailingComma: "es5"` — Trailing commas in ES5-valid contexts (objects, arrays)

**Linting:**
- Tool: ESLint
- Config: `eslint.config.mjs` using flat config format (ESLint 9+)
- Extends: `eslint-config-next/core-web-vitals` and `eslint-config-next/typescript`
- Website-specific overrides in `apps/website/eslint.config.mjs`:
  - Disables `react-hooks/set-state-in-effect` (React 19 compiler conflicts)
  - Disables `react-hooks/static-components` (React 19 patterns)
  - Disables `react-hooks/immutability` (React 19 patterns)
- Ignores: `.next/`, `out/`, `build/`, `next-env.d.ts`

## Import Organization

**Order:**
1. External packages (React, Next.js, third-party) — `import { useState } from "react"`
2. Workspace packages — `import { Button } from "@genai/ui"`
3. Absolute imports from app — `import { checkRateLimit } from "@/lib/ratelimit"`
4. Relative imports (same-module helpers) — rarely used, prefer absolute
5. Types/interfaces — mixed with imports, no separate block

**Example from `apps/tools-app/lib/agent.ts`:**
```typescript
import OpenAI from 'openai'
import { KB_TOOLS_OPENAI, executeTool } from './kb-tools'
import type { ChatMessage, ContentSource, ContentType } from './types'
```

**Path Aliases:**
- `@/` — src root of current app (via `tsconfig.json`)
- `@genai/auth` — workspace auth package
- `@genai/types` — workspace types package
- `@genai/config` — workspace config package

## Error Handling

**Patterns:**
- Try-catch for external operations (API calls, parsing) — `agent.ts`, `ratelimit.ts`, `llm.ts`
- Silent catch for non-critical parsing: `} catch {} {}`
- Log with context before throwing: `console.log('[Timing] Gemini 3 Flash request starting...')`
- Return error objects instead of throwing in async APIs: `{ success: false, error: ... }`
- Graceful degradation on Redis failures: continue request instead of 500

**Example from `ratelimit.ts`:**
```typescript
try {
  const [ipResult, sessionResult] = await Promise.all([
    ipRatelimit.limit(ip),
    sessionRatelimit.limit(sessionId),
  ])
  // Handle results
} catch (error) {
  // Graceful degradation: if Redis fails, allow the request
  return { success: true, limit: 100, remaining: 100 }
}
```

**Example from `agent.ts`:**
```typescript
try {
  const parsed = JSON.parse(result)
  if (parsed && parsed.slug && !seenSlugs.has(parsed.slug)) {
    // Process
  }
} catch {
  // Ignore parse errors - tool response was malformed
}
```

## Logging

**Framework:** Console methods only (no external logger)

**Patterns:**
- Timing info: `console.log('[Timing] Message with timing info...')` — includes milliseconds
- Debug-level: use brackets for context, e.g. `[DebugContext]`
- Production errors: log with context before returning error response
- No console.warn or console.error observed — uses console.log for all

**Example from `agent.ts`:**
```typescript
const startTime = Date.now()
console.log(`[Timing] Gemini 3 Flash request starting...`)
const response = await getGeminiClient().chat.completions.create(...)
const elapsed = Date.now() - startTime
console.log(`[Timing] Gemini completed in ${elapsed}ms | Tokens: ${usage?.prompt_tokens ?? '?'} in, ${usage?.completion_tokens ?? '?'} out`)
```

## Comments

**When to Comment:**
- Context for complex logic: "Dual-layer rate limiting: IP + Session"
- References to architecture docs: `// Source: CONTEXT.md D-12 to D-16`
- State of incomplete features: `// TEMPORARILY DISABLED — restore from git history`
- Inline clarifications for tool call formats: `// Handle both function and custom tool call formats`

**JSDoc/TSDoc:**
- Functions with external impact use JSDoc blocks: `/** @param ... @returns ... */`
- Not on every function — only where parameter/return types need explanation
- Used on public library functions and exported utilities

**Example from `ratelimit.ts`:**
```typescript
/**
 * Check rate limits for both IP and session.
 * Both must pass for the request to proceed.
 *
 * @param ip - Client IP address
 * @param sessionId - Chat session ID
 * @returns Rate limit result with success flag and retry info
 */
export async function checkRateLimit(ip: string, sessionId: string): Promise<RateLimitResult>
```

## Function Design

**Size:** Keep functions focused and testable. Agent loop in `agent.ts` exceeds 200 lines — acceptable for complex orchestration, but breaks long loops into helper functions.

**Parameters:** 
- Prefer objects for multiple parameters (not observed, but type-based pattern)
- Use destructuring in function signatures: `({ className, variant, size, ...props })`
- Keep async functions flat without deep nesting

**Return Values:**
- Return objects with explicit shape for complex data: `{ response, model }`
- Use Promise-based returns for async: `Promise<RateLimitResult>`
- Return null for optional/not-found: `return null` instead of undefined
- Error responses include both success flag and detail: `{ success: false, error: 'message', retryAfter: 60 }`

**Example from `button.tsx`:**
```typescript
function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}
```

## Module Design

**Exports:**
- Named exports preferred over default: `export function checkRateLimit()`, `export { Button, buttonVariants }`
- Type exports explicit: `export type { ChatMessage, ContentType }`
- Re-exports for type aggregation: `export type { ... } from '@genai/types/content'`

**Barrel Files:**
- Used in `lib/types.ts` to re-export workspace types:
  ```typescript
  export type { ContentType, ContentStatus } from '@genai/types/content'
  export interface ChatMessage { ... }
  ```
- Consolidates app-specific and workspace types in one file

**File Organization:**
- One main export per file (component or utility function)
- Helper functions kept in same file (not split to separate utils unless reused)
- Large functions broken into private helpers: `stripThinkTags()`, `parseResponse()`

## Client vs Server Code

**Patterns:**
- `'use client'` directive at top of client components (React 19, Next.js 16)
- Server functions in `/api/route.ts` files, `lib/` modules are isomorphic
- API routes handle HTTP, business logic in `lib/` folders

**Example from `hero.tsx`:**
```typescript
'use client'

import { SignalGrid } from "@/components/ui/signal-grid";

export function Hero() {
  return (...)
}
```

---

*Convention analysis: 2026-04-17*
