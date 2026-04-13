# Testing-Strategie: Generation AI Monorepo

**Recherchiert:** 2026-04-13
**Konfidenz:** HIGH (Next.js-Docs April 2026, Turborepo-Docs, offizielle Quellen)

---

## TL;DR — Die Entscheidungen

| Bereich | Tool | Warum |
|---|---|---|
| Unit + Component | **Vitest + React Testing Library** | Native ESM, 5–10x schneller als Jest, TypeScript ohne Config |
| E2E | **Playwright** | Kostenlose Parallelisierung, Cross-Browser, 33M weekly downloads |
| API Route Testing | **next-test-api-route-handler** | Einzige Lösung die Next.js-interne APIs (headers, cookies) korrekt emuliert |
| Monorepo Setup | **Per-Package** (nicht zentral) | Turborepo Caching funktioniert nur pro Package |
| CI | **GitHub Actions** mit pnpm Cache | Standard Turborepo-Pattern, Vercel Remote Cache optional |

---

## 1. Unit & Component Tests: Vitest

### Warum Vitest, nicht Jest

**Jest ist tot für neue Next.js-Projekte.** Die Community ist klar: Für Next.js 14+ mit App Router und ESM ist Jest ein schmerzhaftes Setup (babel-jest, ts-jest, ESM-Transforms), Vitest funktioniert out-of-the-box.

Performance-Daten (Quelle: [tech-insider.org 2026](https://tech-insider.org/vitest-vs-jest-2026/)):
- Cold Start: Vitest 38s vs. Jest 214s bei 50.000 Tests (5,6x schneller)
- TypeScript: Nativ, kein ts-jest nötig
- ESM: Nativ, kein Babel-Config nötig
- Monorepo: Workspace-Support built-in

**Einziger Grund für Jest:** Existierender 10.000+ Test-Suite. Hier: Keine Tests vorhanden → Vitest.

### Installation (pro App)

```bash
pnpm add -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/dom vite-tsconfig-paths --filter @genai/tools-app
pnpm add -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/dom vite-tsconfig-paths --filter @genai/website
```

### vitest.config.mts (pro App, z.B. apps/tools-app/)

```ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
  },
})
```

### package.json scripts (pro App)

```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest"
  }
}
```

Wichtig: `vitest run` (nicht `vitest`) für Turborepo Caching — `vitest` allein läuft im Watch-Mode und blockiert.

### Wichtige Einschränkung: Async Server Components

Vitest unterstützt **keine async Server Components** (RSC mit await). Das ist ein bekanntes Limit des gesamten Testing-Ecosystems (Stand April 2026). Strategie:
- Synchrone Server + Client Components: Vitest unit tests
- Async Server Components + Datenladung: E2E mit Playwright

---

## 2. React Testing Library

Standardmäßig mit Vitest kombiniert. Keine Alternative nötig.

### Setup-Datei (vitest.setup.ts)

```ts
import '@testing-library/jest-dom/vitest'
```

### Was testen mit RTL

```ts
// Gutes Beispiel: Chat-Input-Komponente
import { render, screen, userEvent } from '@testing-library/react'
import { ChatInput } from './ChatInput'

test('sendet Nachricht bei Enter', async () => {
  const onSend = vi.fn()
  render(<ChatInput onSend={onSend} />)
  
  await userEvent.type(screen.getByRole('textbox'), 'Hallo{Enter}')
  expect(onSend).toHaveBeenCalledWith('Hallo')
})
```

RTL-Prinzip: Teste Verhalten, nicht Implementation. Kein Zugriff auf interne State-Variablen.

---

## 3. E2E Tests: Playwright

### Warum Playwright, nicht Cypress

[Playwright überholt Cypress](https://tech-insider.org/playwright-vs-cypress-vs-selenium-2026/) eindeutig:
- **30M+ weekly downloads** (Cypress: 6,5M) — der Gap wächst
- **Kostenlos parallelisieren** — Cypress verlangt dafür Cypress Cloud (bezahlt)
- **Cross-Browser**: Chromium, Firefox, WebKit als gebündelte Binaries
- **Performance**: 290ms/action vs. 420ms/action bei Cypress
- **RAM**: 2,1 GB vs. 3,2 GB bei 10 parallelen Workers

Cypress wäre nur sinnvoll bei starkem Fokus auf interaktives Debugging und reinem Chrome-Support. Kein Grund hier.

### Monorepo-Struktur für Playwright

Empfehlung: **Eigenes Package** pro App (nicht in der App selbst).

```
packages/
  e2e-website/          ← Playwright tests für website
  e2e-tools/            ← Playwright tests für tools-app
```

```json
// packages/e2e-tools/package.json
{
  "name": "@genai/e2e-tools",
  "devDependencies": {
    "@playwright/test": "^1.x",
    "@genai/tools-app": "workspace:*"
  },
  "scripts": {
    "e2e": "playwright test"
  }
}
```

### turbo.json tasks für E2E

```json
{
  "tasks": {
    "build": {
      "dependsOn": ["^build"]
    },
    "e2e": {
      "dependsOn": ["^build"],
      "passThroughEnv": ["PLAYWRIGHT_*", "BASE_URL"]
    }
  }
}
```

### Was E2E testen (Generation AI konkret)

- Auth-Flow: Signup → Login → Redirect → Logout
- Chat: Nachricht senden → Antwort empfangen → Scroll
- Tool-Bibliothek: Suche → Filter → Tool öffnen
- Rate Limiting: Anfragen-Limit erscheint nach X Requests
- Async Server Components (die Vitest nicht testen kann)

---

## 4. API Route Testing

### Das Problem

Next.js App Router Route Handlers nutzen Web-Standard `Request`/`Response` APIs plus Next.js-spezifische Funktionen wie `headers()`, `cookies()`, `NextResponse`. Diese können nicht einfach per direktem Import getestet werden — der Next.js-Kontext fehlt.

### Lösung: next-test-api-route-handler

Das einzige Tool das Next.js-interne Resolver nutzt um Route Handler korrekt zu emulieren. Framework-agnostisch (funktioniert mit Vitest).

```bash
pnpm add -D next-test-api-route-handler --filter @genai/tools-app
```

### Beispiel: Rate-Limit-Route testen

```ts
// __tests__/api/chat.test.ts
import { testApiHandler } from 'next-test-api-route-handler' // MUSS erstes Import sein
import * as chatHandler from '@/app/api/chat/route'
import { vi } from 'vitest'

// Supabase mocken
vi.mock('@genai/auth', () => ({
  createClient: vi.fn(() => ({
    auth: { getUser: vi.fn(() => ({ data: { user: { id: 'user-123' } } })) }
  }))
}))

test('POST /api/chat gibt 200 zurück', async () => {
  await testApiHandler({
    appHandler: chatHandler,
    test: async ({ fetch }) => {
      const res = await fetch({
        method: 'POST',
        body: JSON.stringify({ message: 'Hallo' }),
        headers: { 'Content-Type': 'application/json' }
      })
      expect(res.status).toBe(200)
    }
  })
})

test('POST /api/chat gibt 401 ohne Auth', async () => {
  vi.mocked(createClient).mockReturnValue({
    auth: { getUser: vi.fn(() => ({ data: { user: null } })) }
  } as any)

  await testApiHandler({
    appHandler: chatHandler,
    test: async ({ fetch }) => {
      const res = await fetch({ method: 'POST' })
      expect(res.status).toBe(401)
    }
  })
})
```

**Wichtig:** `next-test-api-route-handler` muss der erste Import in der Test-Datei sein — Next.js-Interna.

### vitest.config.mts für API-Tests

API-Tests brauchen `environment: 'node'`, nicht `jsdom`:

```ts
export default defineConfig({
  test: {
    environment: 'node', // für API route tests
    // oder: environmentMatchGlobs für gemischte Tests
    environmentMatchGlobs: [
      ['**/*.component.test.tsx', 'jsdom'],
      ['**/*.api.test.ts', 'node'],
    ]
  }
})
```

---

## 5. Monorepo Setup: Per-Package

### Empfehlung: Tests leben im jeweiligen Package

```
apps/
  website/
    __tests__/          ← Unit + Component Tests
    vitest.config.mts
  tools-app/
    __tests__/
    vitest.config.mts
packages/
  ui/
    __tests__/          ← Component Tests für shared UI
    vitest.config.mts
  auth/
    __tests__/          ← Unit Tests für auth helpers
    vitest.config.mts
  e2e-tools/            ← Eigenes Package für Playwright
  e2e-website/
```

### Warum per-Package und nicht zentral

Turborepo cached **per Task pro Package**. Mit zentraler Vitest-Workspace-Config geht jeder Change in irgendeinem Package als Cache-Miss durch — alle Tests laufen neu. Mit per-Package-Setup werden nur die Packages neu getestet, die sich geändert haben.

### turbo.json — Test Tasks

```json
{
  "tasks": {
    "test": {
      "dependsOn": ["^build"],
      "outputs": ["coverage/**"]
    },
    "test:watch": {
      "cache": false,
      "persistent": true
    },
    "e2e": {
      "dependsOn": ["^build"],
      "passThroughEnv": ["PLAYWRIGHT_*", "BASE_URL", "NEXT_PUBLIC_*"]
    }
  }
}
```

### Root package.json scripts ergänzen

```json
{
  "scripts": {
    "test": "turbo test",
    "test:watch": "turbo test:watch",
    "e2e": "turbo e2e"
  }
}
```

---

## 6. GitHub Actions CI

### Workflow: .github/workflows/ci.yml

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    types: [opened, synchronize]

jobs:
  build-and-test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - uses: pnpm/action-setup@v3
        with:
          version: 10
      
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'
      
      - name: Install dependencies
        run: pnpm install --frozen-lockfile
      
      - name: Build
        run: pnpm build
        env:
          TURBO_TOKEN: ${{ secrets.TURBO_TOKEN }}
          TURBO_TEAM: ${{ vars.TURBO_TEAM }}
      
      - name: Unit Tests
        run: pnpm test
        env:
          TURBO_TOKEN: ${{ secrets.TURBO_TOKEN }}
          TURBO_TEAM: ${{ vars.TURBO_TEAM }}

  e2e:
    runs-on: ubuntu-latest
    needs: build-and-test
    
    steps:
      - uses: actions/checkout@v4
      
      - uses: pnpm/action-setup@v3
        with:
          version: 10
      
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'
      
      - name: Install dependencies
        run: pnpm install --frozen-lockfile
      
      - name: Cache Playwright browsers
        uses: actions/cache@v4
        with:
          path: ~/.cache/ms-playwright
          key: playwright-${{ runner.os }}-${{ hashFiles('**/package-lock.json') }}
      
      - name: Install Playwright browsers
        run: pnpm --filter @genai/e2e-tools exec playwright install --with-deps chromium
      
      - name: E2E Tests
        run: pnpm e2e
        env:
          BASE_URL: ${{ secrets.STAGING_URL }}
```

### Turborepo Remote Cache (Vercel)

Optional aber sehr hilfreich: Verhindert unnötige Rebuilds in CI.

1. Vercel Dashboard → Settings → Tokens → Scoped Access Token erstellen
2. Als `TURBO_TOKEN` GitHub Secret speichern
3. Team-Slug als `TURBO_TEAM` GitHub Variable

Bei aktiviertem Remote Cache werden bereits gecachte Build-Outputs direkt von Vercel geladen — auch auf frischen CI-Maschinen.

### Nur geänderte Packages testen (optional, bei wachsendem Repo)

```bash
# Nur Packages testen die sich seit main geändert haben
pnpm turbo test --filter='...[origin/main]'
```

---

## Was zuerst testen — Priorisierung

### Phase 1: Fundament (1–2 Tage)

1. **Vitest + RTL in tools-app einrichten** — das ist das Herzstück
2. **Auth-Logik in packages/auth testen** — `createClient`, Session-Helpers
3. **API Route /api/chat** — wichtigste Route, testet Auth + Rate Limit zusammen

### Phase 2: Component Coverage (nach Bedarf)

4. **Shared UI Components** (packages/ui) — wiederverwendete Komponenten, hoher ROI
5. **Tool-Bibliothek** — Filter-Logik, Suche (pure functions, einfach testbar)

### Phase 3: E2E für kritische Flows

6. **Auth-Flow E2E** — Signup/Login/Logout
7. **Chat-Flow E2E** — als Smoke Test nach Deployments

### Was erstmal NICHT testen

- Landing Page UI — ändert sich zu häufig, schlechtes ROI
- LLM-Responses — nicht deterministisch, E2E reicht als Smoke
- Supabase-Queries direkt — zu viel Mock-Overhead, lieber Integration durch API Routes

---

## Bekannte Einschränkungen

| Problem | Situation | Workaround |
|---|---|---|
| Async Server Components | Vitest unterstützt kein RSC mit await | E2E mit Playwright |
| LLM-Streams testen | Streaming-Responses schwer zu unit-testen | Mock der AI SDK, E2E für Smoke |
| Supabase in Tests | DB-Calls in unit tests aufwändig | vi.mock für @genai/auth, Integration via API |
| Rate Limiting (Upstash) | Redis-Calls in Tests | vi.mock für @upstash/ratelimit |

---

## Quellen

- [Next.js Testing Vitest Guide](https://nextjs.org/docs/app/guides/testing/vitest) (offizielle Docs, April 2026)
- [Turborepo Vitest Integration](https://turborepo.dev/docs/guides/tools/vitest) (offizielle Docs)
- [Turborepo Playwright Integration](https://turborepo.dev/docs/guides/tools/playwright) (offizielle Docs)
- [Turborepo GitHub Actions](https://turborepo.dev/docs/guides/ci-vendors/github-actions) (offizielle Docs)
- [next-test-api-route-handler NPM](https://www.npmjs.com/package/next-test-api-route-handler)
- [Testing Next.js App Router API Routes — Arcjet Blog](https://blog.arcjet.com/testing-next-js-app-router-api-routes/)
- [Vitest vs Jest 2026 — tech-insider.org](https://tech-insider.org/vitest-vs-jest-2026/)
- [Playwright vs Cypress 2026 — tech-insider.org](https://tech-insider.org/playwright-vs-cypress-vs-selenium-2026/)
