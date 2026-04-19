# Coding Conventions

**Analysis Date:** 2026-04-19

## Repo Layout & Workspace

Monorepo via **Turborepo + pnpm** (`pnpm@10.8.1`). Workspaces declared in `pnpm-workspace.yaml`:
- `apps/*` — `@genai/website`, `@genai/tools-app`
- `packages/*` — `@genai/auth`, `@genai/ui`, `@genai/types`, `@genai/config`, `@genai/emails`, `@genai/e2e-tools`

**Package naming:** All workspace packages use the `@genai/<name>` scope. Internal deps reference `workspace:*`.

**Root scripts** (`package.json`):
```bash
pnpm dev | build | lint | test | e2e      # Turbo-run alles
pnpm dev:website | dev:tools              # gefiltert
pnpm changeset | version | release        # Versioning
```

## TypeScript

**Base config:** `packages/config/tsconfig/base.json` — extended by every app/package via `"extends": "@genai/config/tsconfig/base.json"`.

Key compiler options:
- `strict: true` (non-negotiable)
- `target: ES2017`, `module: esnext`, `moduleResolution: bundler`
- `jsx: react-jsx`, `noEmit: true`, `isolatedModules: true`

**Path alias:** `@/*` → app root. Example: `import { Button } from "@/components/ui/button"`. Configured per app in `apps/*/tsconfig.json`.

**Cross-package imports:** Use the package name with subpath exports, never relative paths into another package.
- `import { createServerClient } from "@genai/auth/server"`
- `import type { ChatMessage } from "@genai/types"`

## ESLint

**Shared config:** `packages/config/eslint/next.mjs` exports `nextConfig` (next-vitals + next-typescript + global ignores for `.next/`, `out/`, `build/`, `next-env.d.ts`).

**App-level overrides** (`apps/*/eslint.config.mjs`) disable React 19 Compiler rules that break existing patterns:
- `react-hooks/set-state-in-effect: off`
- `react-hooks/static-components: off`
- `react-hooks/immutability: off`

`tools-app` additionally disables `@next/next/no-html-link-for-pages` to allow `<a>` tags for auth links (bypasses the router cache).

**No Prettier config in repo** — `prettier` is installed in `apps/website/package.json` but no shared `.prettierrc`. Match existing style of the file you're editing.

## Naming Conventions

**Files:**
- React components in `apps/website/components/ui/` — **kebab-case**: `button.tsx`, `network-grid.tsx`, `text-scramble.tsx`
- React components in `apps/tools-app/components/` — **PascalCase**: `ChatInput.tsx`, `MessageList.tsx`, `ContentCard.tsx`
- Lib modules — **kebab-case** or single-word lowercase: `lib/csp.ts`, `lib/kb-tools.ts`, `lib/ratelimit.ts`
- Test files — match source: `Button.test.tsx`, `chat.test.ts` under `__tests__/`
- Config — `*.config.{ts,mts,mjs}`

> **NOTE:** The two apps disagree on component file casing (kebab in website, Pascal in tools-app). Match the convention of the app you're working in. Don't refactor existing files.

**Functions / variables:** `camelCase`. **Types / Components:** `PascalCase`. **Constants:** `SCREAMING_SNAKE_CASE` (e.g. `URLS`, `ERROR_WHITELIST`).

**Env vars:** `NEXT_PUBLIC_*` prefix for browser-exposed values; otherwise plain `SCREAMING_SNAKE`. Validation via `@t3-oss/env-nextjs` in `apps/tools-app/lib/env.ts`.

## Import Organization

Observed order (no enforced linter rule):
1. External packages (React, Next, Supabase, AI SDKs)
2. Workspace packages (`@genai/*`)
3. Path-aliased local imports (`@/lib`, `@/components`)
4. Relative imports (rare — prefer aliases)

Type-only imports use `import type { ... }`. Side-effect imports first (e.g. `import "@testing-library/jest-dom/vitest"`).

## Styling — Tailwind v4

Tailwind v4 with `@tailwindcss/postcss` (catalog version). No `tailwind.config.{js,ts}` — config is **CSS-driven via `@theme`** in `packages/config/tailwind/base.css`.

**Design system entry:** `packages/config/tailwind/base.css` (imported by each app's `app/globals.css`). Defines:
- Radix `slate` neutral scale with semantic role mapping `slate-1`..`slate-12` (App BG, Subtle BG, UI BG, Hover BG, Active BG, Subtle border, UI border, Hover border, Solid BG, Hover solid, Low-contrast text, High-contrast text)
- Brand tokens via CSS custom properties: `--bg`, `--bg-card`, `--accent`, `--text`, `--border`, `--bg-header`, …
- Geist Sans + Geist Mono font stacks via `--font-sans` / `--font-mono` (loaded via `next/font`)
- Semantic status colors: `--status-error`, `--status-success`, `--status-warning`, `--status-info`
- Tailwind utility bindings via `@theme inline` block (e.g. `--color-accent` → `bg-accent`, `text-accent`)

**Theme switching:** Dark is **default** (`:root`, no class). Light theme via `.light` class on `<html>`. Slate dark values are re-aliased onto `:root:not(.light)` because Radix v3 ships dark on `.dark`/`.dark-theme` only (see comment block in `base.css`).

**Class composition:** `clsx` + `tailwind-merge` via `cn()` helper in `apps/*/lib/utils.ts`. **Always use `cn()`** when combining conditional classes.

**Variants:** `class-variance-authority` (cva) for component variants. Reference: `apps/website/components/ui/button.tsx`.

**Color rules:**
- Never use hex literals for neutrals — always `var(--slate-N)` or the bound Tailwind utility
- Brand tokens via CSS variable references (`bg-[var(--accent)]`, `text-[var(--text)]`)
- Status colors stay separate from brand accents (must never collide with `--accent`)

**Typography roles** (`base.css`, per UI-SPEC §B):
- `h1` → Geist Mono, `letter-spacing: -0.02em`, `line-height: 1.05`
- `h2` → Geist Sans, tighter tracking
- `button` → Geist Mono, `letter-spacing: 0.02em`
- Body ligatures disabled globally (`font-feature-settings: "liga" 0, "calt" 0`)

## React / Next.js Patterns

- **Next.js 16, React 19, App Router** in both apps
- Server Components by default. `"use client"` directive only when needed (state, refs, browser APIs)
- Client components: `apps/tools-app/components/AuthProvider.tsx`, `ThemeProvider.tsx`
- Async Server Components for data fetching (e.g. `app/[slug]/page.tsx`)
- Route handlers under `app/api/*/route.ts` exporting named HTTP methods (`GET`, `POST`)
- Sentry instrumentation via `instrumentation.ts` + `instrumentation-client.ts` (tools-app)

**Auth:** Always go through `@genai/auth` — never import `@supabase/ssr` directly in app code. Subpath imports: `@genai/auth/server`, `@genai/auth/browser`, `@genai/auth/middleware`, `@genai/auth/admin`.

**Error boundaries:** `error.tsx`, `global-error.tsx`, `not-found.tsx` per Next conventions in `apps/tools-app/app/`.

## Component Patterns

**Two distinct layers:**
1. **`apps/website/components/ui/`** — shadcn-style primitives built on `@base-ui/react`, with `cva` variants. Kebab-case files. The Button uses `ButtonPrimitive` from `@base-ui/react/button`.
2. **`apps/tools-app/components/<feature>/`** — Feature-grouped composites (`chat/`, `library/`, `detail/`, `layout/`). PascalCase files.

**Standard component shape:**
```tsx
"use client"  // only if needed

import { cn } from "@/lib/utils"

interface Props {
  /* required first, optional after */
}

export default function ComponentName({ ... }: Props) {
  return <div className={cn("base classes", conditional && "extra")} />
}
```

**Default vs named exports:** Both used. Feature components in tools-app default-export. UI primitives in website named-export.

## German Content Rules — Umlaute (PFLICHT)

**Always use real Umlaute** in user-facing content: `ö ä ü ß`. **Never** ASCII transliteration `oe ae ue ss`.

Applies to:
- Website copy, landing pages, marketing
- Legal pages (`datenschutz`, `impressum`)
- Email templates (`packages/emails/src/templates/`)
- Toast messages, button labels, placeholders, error messages
- All user-facing strings in components

Example placeholder (correct): `"Tippe weiter oder drücke Enter zum Abbrechen..."`
Example button (correct): `"Mit Passwort anmelden"`, `"Passwort speichern"`

**Exceptions** (ASCII allowed):
- Code identifiers, file names, package names
- Internal docs in `.planning/`
- Git commit messages (mixed in practice)
- Slug fragments in URLs (`ueber` is acceptable as a slug)

## Comments

- German is fine for in-line dev notes, especially explaining business logic or referencing incidents (cross-ref `LEARNINGS.md`)
- Reference incident dates and learnings inline (`// Siehe LEARNINGS.md` style)
- JSDoc for non-obvious public functions in lib modules; not enforced everywhere
- Heavy use of `// ─── Section ─────────────────────` ASCII headers in CSS and longer files

## Error Handling

- API routes return JSON with `{ error: string, ... }` and a meaningful HTTP status (400, 405, 429, 500)
- Rate-limit responses include `Retry-After` header + `retryAfter` in body (see `apps/tools-app/app/api/chat/route.ts`)
- Sentry captures unhandled errors in tools-app (instrumentation files)
- Client errors surface via toast / inline UI text in German

## Logging

- **No dedicated logging framework.** `console.*` for ad-hoc, Sentry for production exceptions
- Avoid `console.log` in committed code outside `scripts/`

## Module Design

- **Subpath exports** for packages with multiple entry points (`@genai/auth/server`, `@genai/config/eslint/next`, `@genai/config/tailwind/base.css`)
- No barrel re-exports across feature boundaries; each component imported directly
- `lib/*` modules are flat — one concern per file (`csp.ts`, `ratelimit.ts`, `sanitize.ts`, `agent.ts`, `llm.ts`)

## Changesets Workflow (PFLICHT)

Versioning + changelogs via **Changesets**. Config in `.changeset/config.json`:
- `linked: [["@genai/website", "@genai/tools-app"]]` — Apps versioned together
- `ignore: ["@genai/config"]` — Config package not versioned
- `changelog: ["@changesets/changelog-github", { repo: "Generation-AI-Org/generation-ai" }]` — auto-links PRs
- `baseBranch: main`, `access: public`, `commit: false`

**Per change:**
```bash
pnpm changeset            # interaktiv: packages? bump-level? message?
git add .changeset/       # commit das changeset zusammen mit dem Feature
```

**Bei Release:**
```bash
pnpm version              # generates CHANGELOGs + bumps versions
git add -A && git commit -m "chore: release"
git tag vX.Y.Z
git push --follow-tags
gh release create vX.Y.Z
```

**Rules:**
- Every non-trivial change needs a changeset
- Changeset file ships in the same commit as the feature
- `CHANGELOG.md` is generated — never edit by hand
- Apps are linked → bumping one bumps the other

## Git / Commits

- Conventional-style prefixes observed: `feat`, `fix`, `chore`, `docs`, `feat(scope)`, `feat(<phase-N>)`
- German is fine in commit messages
- No push without explicit OK from Luca (per project CLAUDE.md)
- No direct prod deploys without OK; preview deploys are fine
- Never amend; create new commits

## CI

GitHub Actions in `.github/workflows/`:
- **`ci.yml`** — push to main + PRs: install → build → lint → unit tests. E2E job is gated on `STAGING_URL` var
- **`smoke-prod.yml`** — post-main-push (with 3-min sleep for Vercel promote), hourly cron, manual dispatch. Runs `smoke.spec.ts` against real prod URLs

Turbo cache is wired via `TURBO_TOKEN` / `TURBO_TEAM` secrets.

---

*Convention analysis: 2026-04-19*
