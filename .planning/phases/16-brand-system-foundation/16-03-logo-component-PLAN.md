---
phase: 16
plan: 03
type: execute
wave: 2
depends_on: [16-01]
files_modified:
  - packages/ui/src/index.ts
  - packages/ui/src/components/Logo.tsx
  - packages/ui/src/components/Logo.test.tsx
  - packages/ui/src/test-setup.ts
  - packages/ui/src/assets/logos/logo-wide-black.svg
  - packages/ui/src/assets/logos/logo-wide-white.svg
  - packages/ui/src/assets/logos/logo-wide-red.svg
  - packages/ui/src/assets/logos/logo-wide-pink.svg
  - packages/ui/src/assets/logos/logo-wide-pink-red.svg
  - packages/ui/src/assets/logos/logo-wide-red-on-pink.svg
  - packages/ui/src/assets/logos/logo-wide-neon.svg
  - packages/ui/src/assets/logos/logo-wide-blue.svg
  - packages/ui/src/assets/logos/logo-wide-blue-neon.svg
  - packages/ui/src/assets/logos/logo-wide-neon-on-blue.svg
  - packages/ui/src/assets/logos/logo-wide-sand.svg
  - packages/ui/vitest.config.ts
  - packages/ui/package.json
  - apps/website/public/brand/logos/logo-wide-black.svg
  - apps/website/public/brand/logos/logo-wide-white.svg
  - apps/website/public/brand/logos/logo-wide-red.svg
  - apps/website/public/brand/logos/logo-wide-pink.svg
  - apps/website/public/brand/logos/logo-wide-pink-red.svg
  - apps/website/public/brand/logos/logo-wide-red-on-pink.svg
  - apps/website/public/brand/logos/logo-wide-neon.svg
  - apps/website/public/brand/logos/logo-wide-blue.svg
  - apps/website/public/brand/logos/logo-wide-blue-neon.svg
  - apps/website/public/brand/logos/logo-wide-neon-on-blue.svg
  - apps/website/public/brand/logos/logo-wide-sand.svg
  - apps/tools-app/public/brand/logos/logo-wide-black.svg
  - apps/tools-app/public/brand/logos/logo-wide-white.svg
  - apps/tools-app/public/brand/logos/logo-wide-red.svg
  - apps/tools-app/public/brand/logos/logo-wide-pink.svg
  - apps/tools-app/public/brand/logos/logo-wide-pink-red.svg
  - apps/tools-app/public/brand/logos/logo-wide-red-on-pink.svg
  - apps/tools-app/public/brand/logos/logo-wide-neon.svg
  - apps/tools-app/public/brand/logos/logo-wide-blue.svg
  - apps/tools-app/public/brand/logos/logo-wide-blue-neon.svg
  - apps/tools-app/public/brand/logos/logo-wide-neon-on-blue.svg
  - apps/tools-app/public/brand/logos/logo-wide-sand.svg
autonomous: true
requirements:
  - BRAND-16-06-logo-component
must_haves:
  truths:
    - "<Logo /> component can be imported from @genai/ui and rendered in both apps"
    - "colorway='auto' resolves correctly per context×theme matrix (6 combos)"
    - "All 11 SVG variants are available at runtime in both apps' /public/brand/logos/"
    - "Component logs console.warn when height < 32px (min-size enforcement)"
    - "Component renders as <img> element (not inline SVG — no CSS leakage)"
  artifacts:
    - path: "packages/ui/src/components/Logo.tsx"
      provides: "Logo React component with variant/colorway/context/size/height API"
      exports: ["Logo"]
      min_lines: 60
    - path: "packages/ui/src/index.ts"
      provides: "Public barrel exporting Logo"
      contains: "export { Logo }"
    - path: "packages/ui/src/components/Logo.test.tsx"
      provides: "Vitest tests covering colorway='auto' resolution matrix + min-size warn"
      min_lines: 40
  key_links:
    - from: "packages/ui/src/components/Logo.tsx"
      to: "apps/*/public/brand/logos/*.svg"
      via: "src attribute on <img>"
      pattern: "/brand/logos/logo-wide-.*\\.svg"
    - from: "apps/website + apps/tools-app (via Plans 04/05)"
      to: "@genai/ui Logo export"
      via: "import { Logo } from '@genai/ui'"
      pattern: "import .* from ['\"]@genai/ui['\"]"
---

<objective>
Create `<Logo />` component in `packages/ui` that implements the contract from `16-UI-SPEC.md` §Logo Component Contract and `brand/DESIGN.md §F`. Component replaces the ad-hoc `<Image src={theme === 'dark' ? '...' : '...'} />` patterns currently scattered across `apps/website/components/layout/header.tsx`, `apps/website/components/layout/footer.tsx`, `apps/tools-app/components/layout/GlobalLayout.tsx`, `apps/tools-app/app/login/page.tsx`, `apps/tools-app/components/ui/DetailHeaderLogo.tsx`, `apps/website/components/terminal-splash.tsx`.

Also: copy the 11 brand logos from `brand/logos/` into each app's `public/brand/logos/` directory so they are statically served at `/brand/logos/*.svg`.

Purpose: Single canonical component for all brand-logo rendering — removes 6 hardcoded theme-switching patterns and establishes the contract Plans 04/05 consume.

Output: `@genai/ui` exports `Logo`, 22 SVGs staged in public dirs (11 per app), 11 SVGs bundled with the component for packages that import directly.
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/phases/16-brand-system-foundation/16-UI-SPEC.md
@brand/DESIGN.md
@brand/logos/
@apps/website/components/layout/header.tsx
@apps/tools-app/components/ui/DetailHeaderLogo.tsx

<interfaces>
<!-- Public API (from UI-SPEC.md Logo Component Contract §): -->
<!--                                                                             -->
<!-- Props:                                                                      -->
<!--   variant    "wide"                                           default "wide"-->
<!--   colorway   "auto" | "red" | "neon" | "black" | "white" |                  -->
<!--              "pink" | "blue" | "pink-red" | "red-on-pink" |                 -->
<!--              "blue-neon" | "neon-on-blue" | "sand"           default "auto" -->
<!--   context    "header" | "footer" | "mail"                    default "header"-->
<!--   size       "sm" (32px) | "md" (40px) | "lg" (56px)         default "md"   -->
<!--   height     number (explicit override)                                     -->
<!--   className  string (passthrough)                                           -->
<!--                                                                             -->
<!-- colorway="auto" resolution matrix:                                         -->
<!--   header + light  → red                                                    -->
<!--   header + dark   → neon                                                   -->
<!--   footer + light  → black                                                  -->
<!--   footer + dark   → white                                                  -->
<!--   mail   + light  → red                                                    -->
<!--   mail   + dark   → neon                                                   -->

<!-- Theme detection: callers pass theme explicitly OR component reads          -->
<!-- `document.documentElement.classList.contains('light')`. Since @genai/ui   -->
<!-- should be SSR-friendly and doesn't own ThemeProvider, prefer an explicit  -->
<!-- `theme?: 'light' | 'dark'` prop that apps pass from their own              -->
<!-- useTheme() hook. Fallback to DOM-check only on client when unprovided.    -->

<!-- Enforce via <img> (not inline SVG) per DESIGN.md §F (no CSS leakage):     -->
<!--   <img src="/brand/logos/logo-wide-{colorway}.svg" ... />                  -->
</interfaces>
</context>

<tasks>

<task type="auto" tdd="true">
  <name>Task 1: Copy 11 SVG logos to both apps' public/brand/logos/ directories</name>
  <read_first>
    - brand/logos/ (list all 11 SVGs)
    - apps/website/public/ (confirm no /brand/ dir yet)
    - apps/tools-app/public/ (confirm no /brand/ dir yet)
  </read_first>
  <action>
Create destination directories and copy the 11 SVG files verbatim. Source: `brand/logos/`. Destinations: `apps/website/public/brand/logos/` and `apps/tools-app/public/brand/logos/`.

The 11 filenames to copy (exact list from `brand/DESIGN.md §F`):
```
logo-wide-black.svg
logo-wide-white.svg
logo-wide-red.svg
logo-wide-pink.svg
logo-wide-pink-red.svg
logo-wide-red-on-pink.svg
logo-wide-neon.svg
logo-wide-blue.svg
logo-wide-blue-neon.svg
logo-wide-neon-on-blue.svg
logo-wide-sand.svg
```

Execute:
```bash
mkdir -p apps/website/public/brand/logos apps/tools-app/public/brand/logos packages/ui/src/assets/logos
cp brand/logos/*.svg apps/website/public/brand/logos/
cp brand/logos/*.svg apps/tools-app/public/brand/logos/
cp brand/logos/*.svg packages/ui/src/assets/logos/
```

Both apps serve from `/public` at runtime, so callers reference `/brand/logos/logo-wide-{colorway}.svg`. The packages/ui copy in `src/assets/logos/` is a backup reference for package consumers that might bundle their own copy later — not used by the Logo component (which uses absolute /brand/logos/ paths at runtime).

Do NOT modify the SVG content. Do NOT touch `brand/logos/` itself (that remains the canonical source).
  </action>
  <verify>
    <automated>ls apps/website/public/brand/logos/*.svg | wc -l | awk '{exit ($1==11)?0:1}' && ls apps/tools-app/public/brand/logos/*.svg | wc -l | awk '{exit ($1==11)?0:1}' && ls packages/ui/src/assets/logos/*.svg | wc -l | awk '{exit ($1==11)?0:1}'</automated>
  </verify>
  <acceptance_criteria>
    - `ls apps/website/public/brand/logos/ | wc -l` → 11
    - `ls apps/tools-app/public/brand/logos/ | wc -l` → 11
    - `ls packages/ui/src/assets/logos/ | wc -l` → 11
    - `diff brand/logos/logo-wide-red.svg apps/website/public/brand/logos/logo-wide-red.svg` → exit 0 (identical)
    - `diff brand/logos/logo-wide-neon.svg apps/tools-app/public/brand/logos/logo-wide-neon.svg` → exit 0
    - All 11 exact filenames from brand/DESIGN.md §F present in each target
  </acceptance_criteria>
  <done>11 SVGs present in both apps' public dirs and in packages/ui/src/assets. Identical bytes to brand/logos/ source.</done>
</task>

<task type="auto" tdd="true">
  <name>Task 2: Implement Logo component + tests + export from @genai/ui</name>
  <behavior>
    - Test 1: `<Logo />` with no props renders an <img> with src="/brand/logos/logo-wide-red.svg" and height="40" (defaults: variant=wide, colorway=auto, context=header, size=md; default theme fallback = light when DOM class `.light` absent on :root is DARK in our convention, so handle both — see Test 2)
    - Test 2: `<Logo theme="dark" />` (header context) renders src="/brand/logos/logo-wide-neon.svg"
    - Test 3: `<Logo theme="light" context="footer" />` renders src="/brand/logos/logo-wide-black.svg"
    - Test 4: `<Logo theme="dark" context="footer" />` renders src="/brand/logos/logo-wide-white.svg"
    - Test 5: `<Logo theme="light" context="mail" />` renders src="/brand/logos/logo-wide-red.svg"
    - Test 6: `<Logo theme="dark" context="mail" />` renders src="/brand/logos/logo-wide-neon.svg"
    - Test 7: `<Logo colorway="pink-red" />` renders src="/brand/logos/logo-wide-pink-red.svg" (explicit override ignores auto)
    - Test 8: `<Logo size="sm" />` has height=32; size="md" →40; size="lg" →56
    - Test 9: `<Logo height={24} />` triggers console.warn containing "minimum" or "32"
    - Test 10: `<Logo className="custom" />` passes className to the <img>
    - Test 11: Rendered element is `<img>` (not `<svg>`) — use `getByRole('img')` and assert `.tagName === 'IMG'`
    - Test 12: Rendered element has `margin: 0` via inline style or default (no wrapping div with margin; clearspace is caller responsibility per DESIGN.md §F)
  </behavior>
  <read_first>
    - packages/ui/package.json (Plan 01 created it)
    - packages/ui/src/index.ts
    - .planning/phases/16-brand-system-foundation/16-UI-SPEC.md (Logo Component Contract section, copy Colorway matrix + Props table verbatim)
    - brand/DESIGN.md §F (Logo-Nutzungsregeln — verify min-size 32px, no transforms)
    - apps/website/components/layout/header.tsx (reference implementation to replace)
    - apps/tools-app/components/ui/DetailHeaderLogo.tsx (reference implementation to replace)
  </read_first>
  <action>
**Step 1: Add vitest + testing-library to packages/ui:**

Update `packages/ui/package.json` devDependencies to include:
```json
{
  "devDependencies": {
    "@types/react": "catalog:",
    "typescript": "catalog:",
    "vitest": "^2.1.0",
    "@vitest/ui": "^2.1.0",
    "@testing-library/react": "^16.3.2",
    "@testing-library/jest-dom": "^6.9.1",
    "jsdom": "^26.0.0",
    "@vitejs/plugin-react": "^6.0.1"
  },
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest"
  }
}
```

Run `pnpm install` from repo root.

Create `packages/ui/vitest.config.ts`:
```ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test-setup.ts'],
  },
});
```

Create `packages/ui/src/test-setup.ts`:
```ts
import '@testing-library/jest-dom/vitest';
```

**Step 2: Write failing tests FIRST (RED phase).**

Create `packages/ui/src/components/Logo.test.tsx`:

```tsx
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Logo } from './Logo';

describe('Logo', () => {
  let warnSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
  });
  afterEach(() => {
    warnSpy.mockRestore();
  });

  describe('colorway="auto" resolution matrix', () => {
    it('header + light → red', () => {
      render(<Logo theme="light" context="header" />);
      expect(screen.getByRole('img')).toHaveAttribute(
        'src',
        '/brand/logos/logo-wide-red.svg'
      );
    });

    it('header + dark → neon', () => {
      render(<Logo theme="dark" context="header" />);
      expect(screen.getByRole('img')).toHaveAttribute(
        'src',
        '/brand/logos/logo-wide-neon.svg'
      );
    });

    it('footer + light → black', () => {
      render(<Logo theme="light" context="footer" />);
      expect(screen.getByRole('img')).toHaveAttribute(
        'src',
        '/brand/logos/logo-wide-black.svg'
      );
    });

    it('footer + dark → white', () => {
      render(<Logo theme="dark" context="footer" />);
      expect(screen.getByRole('img')).toHaveAttribute(
        'src',
        '/brand/logos/logo-wide-white.svg'
      );
    });

    it('mail + light → red', () => {
      render(<Logo theme="light" context="mail" />);
      expect(screen.getByRole('img')).toHaveAttribute(
        'src',
        '/brand/logos/logo-wide-red.svg'
      );
    });

    it('mail + dark → neon', () => {
      render(<Logo theme="dark" context="mail" />);
      expect(screen.getByRole('img')).toHaveAttribute(
        'src',
        '/brand/logos/logo-wide-neon.svg'
      );
    });
  });

  describe('explicit colorway overrides auto', () => {
    it('colorway="pink-red" renders pink-red variant regardless of theme', () => {
      render(<Logo theme="dark" colorway="pink-red" />);
      expect(screen.getByRole('img')).toHaveAttribute(
        'src',
        '/brand/logos/logo-wide-pink-red.svg'
      );
    });

    it('colorway="sand" renders sand variant', () => {
      render(<Logo colorway="sand" />);
      expect(screen.getByRole('img')).toHaveAttribute(
        'src',
        '/brand/logos/logo-wide-sand.svg'
      );
    });
  });

  describe('sizing', () => {
    it('size="sm" → height 32', () => {
      render(<Logo size="sm" />);
      expect(screen.getByRole('img')).toHaveAttribute('height', '32');
    });
    it('size="md" → height 40 (default)', () => {
      render(<Logo />);
      expect(screen.getByRole('img')).toHaveAttribute('height', '40');
    });
    it('size="lg" → height 56', () => {
      render(<Logo size="lg" />);
      expect(screen.getByRole('img')).toHaveAttribute('height', '56');
    });
    it('explicit height prop overrides size', () => {
      render(<Logo size="md" height={48} />);
      expect(screen.getByRole('img')).toHaveAttribute('height', '48');
    });
  });

  describe('min-size enforcement', () => {
    it('height < 32 triggers console.warn', () => {
      render(<Logo height={24} />);
      expect(warnSpy).toHaveBeenCalled();
      expect(warnSpy.mock.calls[0][0]).toMatch(/32|minimum/i);
    });
    it('height ≥ 32 does not warn', () => {
      render(<Logo height={32} />);
      expect(warnSpy).not.toHaveBeenCalled();
    });
  });

  describe('rendering', () => {
    it('renders <img> element (not inline <svg>)', () => {
      render(<Logo />);
      expect(screen.getByRole('img').tagName).toBe('IMG');
    });

    it('passes className through', () => {
      render(<Logo className="custom-class" />);
      expect(screen.getByRole('img')).toHaveClass('custom-class');
    });

    it('sets alt text', () => {
      render(<Logo />);
      expect(screen.getByRole('img')).toHaveAttribute('alt', 'Generation AI');
    });
  });
});
```

Run `pnpm --filter @genai/ui test` — MUST fail with "Cannot find module './Logo'".

**Step 3: Implement Logo.tsx (GREEN phase).**

Create `packages/ui/src/components/Logo.tsx`:

```tsx
import type { CSSProperties } from 'react';

export type LogoColorway =
  | 'auto'
  | 'red'
  | 'neon'
  | 'black'
  | 'white'
  | 'pink'
  | 'blue'
  | 'pink-red'
  | 'red-on-pink'
  | 'blue-neon'
  | 'neon-on-blue'
  | 'sand';

export type LogoContext = 'header' | 'footer' | 'mail';
export type LogoSize = 'sm' | 'md' | 'lg';
export type LogoTheme = 'light' | 'dark';

export interface LogoProps {
  variant?: 'wide';
  colorway?: LogoColorway;
  context?: LogoContext;
  size?: LogoSize;
  height?: number;
  theme?: LogoTheme;
  className?: string;
  alt?: string;
}

const SIZE_MAP: Record<LogoSize, number> = {
  sm: 32,
  md: 40,
  lg: 56,
};

const MIN_HEIGHT_PX = 32;

// colorway="auto" resolution matrix — matches UI-SPEC.md Phase 16 §Logo Component Contract
function resolveAutoColorway(
  context: LogoContext,
  theme: LogoTheme
): Exclude<LogoColorway, 'auto'> {
  if (context === 'header') return theme === 'dark' ? 'neon' : 'red';
  if (context === 'footer') return theme === 'dark' ? 'white' : 'black';
  if (context === 'mail') return theme === 'dark' ? 'neon' : 'red';
  return 'red';
}

// Detect theme from DOM (client-side only). Project convention: dark is default (:root),
// light is applied via `.light` class on <html>.
function detectTheme(): LogoTheme {
  if (typeof document === 'undefined') return 'light'; // SSR fallback — caller should pass theme prop for SSR correctness
  return document.documentElement.classList.contains('light') ? 'light' : 'dark';
}

export function Logo({
  variant = 'wide',
  colorway = 'auto',
  context = 'header',
  size = 'md',
  height,
  theme,
  className,
  alt = 'Generation AI',
}: LogoProps) {
  const resolvedHeight = height ?? SIZE_MAP[size];

  if (resolvedHeight < MIN_HEIGHT_PX) {
    // eslint-disable-next-line no-console
    console.warn(
      `[Logo] height ${resolvedHeight}px is below minimum 32px per brand/DESIGN.md §F. Use size="sm" or height={32} or higher.`
    );
  }

  const resolvedTheme: LogoTheme = theme ?? detectTheme();
  const resolvedColorway =
    colorway === 'auto' ? resolveAutoColorway(context, resolvedTheme) : colorway;

  const src = `/brand/logos/logo-${variant}-${resolvedColorway}.svg`;

  const style: CSSProperties = { margin: 0, height: resolvedHeight, width: 'auto' };

  return (
    <img
      src={src}
      alt={alt}
      height={resolvedHeight}
      className={className}
      style={style}
      draggable={false}
    />
  );
}
```

**Step 4: Export from barrel.**

Update `packages/ui/src/index.ts`:
```ts
export { Logo } from './components/Logo';
export type { LogoProps, LogoColorway, LogoContext, LogoSize, LogoTheme } from './components/Logo';
```

**Step 5: Run tests (GREEN).**

```bash
pnpm --filter @genai/ui test
```

All 17 tests must pass.

**Step 6: Wire @genai/ui as workspace dep into both apps.**

Update `apps/website/package.json` dependencies:
```json
"@genai/ui": "workspace:*"
```

Update `apps/tools-app/package.json` dependencies:
```json
"@genai/ui": "workspace:*"
```

Run `pnpm install`. Plans 04 and 05 consume this.

**Non-goals for this plan (Plans 04/05 handle them):**
- Do NOT yet replace `<Image src={...} />` usages in apps/website/components/layout/header.tsx or any other caller — that's app-migration scope.
- Do NOT remove the old PNG logos at `apps/website/public/logos/generationai-*.png` or `apps/tools-app/public/logo-*.jpg` yet — Plans 04/05 swap callers, then can remove.
  </action>
  <verify>
    <automated>pnpm --filter @genai/ui test && grep -q "export { Logo }" packages/ui/src/index.ts && grep -q "@genai/ui" apps/website/package.json && grep -q "@genai/ui" apps/tools-app/package.json && pnpm --filter @genai/website build && pnpm --filter @genai/tools-app build</automated>
  </verify>
  <acceptance_criteria>
    - `pnpm --filter @genai/ui test` exits 0 with all tests passing (≥17 tests)
    - `grep -q "export { Logo }" packages/ui/src/index.ts` → 0
    - `grep -q "export type { LogoProps" packages/ui/src/index.ts` → 0
    - `grep -q "\"@genai/ui\":" apps/website/package.json` → 0
    - `grep -q "\"@genai/ui\":" apps/tools-app/package.json` → 0
    - `grep -q "minimum" packages/ui/src/components/Logo.tsx || grep -q "32" packages/ui/src/components/Logo.tsx` → 0 (min-size enforcement present)
    - `grep -q "'header' && theme === 'dark'" packages/ui/src/components/Logo.tsx || grep -q "header.*dark.*neon" packages/ui/src/components/Logo.tsx` → 0 (auto matrix implemented)
    - `grep -c "'auto'\\|'red'\\|'neon'\\|'black'\\|'white'\\|'pink'\\|'blue'\\|'pink-red'\\|'red-on-pink'\\|'blue-neon'\\|'neon-on-blue'\\|'sand'" packages/ui/src/components/Logo.tsx` → all 12 colorway literals present (including 'auto')
    - Both apps `pnpm build` exit 0
  </acceptance_criteria>
  <done>Logo component with 17+ passing tests, exported from @genai/ui, consumable in both apps. No callers wired yet (Plans 04/05).</done>
</task>

</tasks>

<verification>
- `pnpm --filter @genai/ui test` exits 0
- 11 SVG files present in each app's /public/brand/logos/
- @genai/ui wired as workspace dep in both apps
- Both apps still `pnpm build` green (no callers changed yet)
- Logo.tsx enforces min-size 32px via console.warn
- Logo.tsx renders <img> (not inline SVG)
- colorway="auto" matrix matches UI-SPEC.md Phase 16 exactly
</verification>

<success_criteria>
- 11 SVG logos staged in each app's public dir + packages/ui/src/assets
- Logo component with complete API from UI-SPEC.md (variant, colorway, context, size, height, theme, className, alt)
- 17+ Vitest tests covering: 6 auto-resolution matrix combos, 2 explicit overrides, 4 sizing cases, 2 min-size cases, 3 rendering cases
- colorway="auto" resolves per UI-SPEC matrix exactly
- Min-size 32px enforced via console.warn
- Renders as <img>, not inline SVG (no CSS leakage)
- Exported cleanly from @genai/ui barrel
- Both apps can import @genai/ui (workspace dep wired)
- Both apps still build green (no caller migrations yet — that's Plans 04/05)
</success_criteria>

<output>
After completion, create `.planning/phases/16-brand-system-foundation/16-03-SUMMARY.md` with:
- Logo component API surface (exported types)
- Test count + pass rate
- SVG file counts per destination
- Confirmation @genai/ui dep wired in both apps
- Note for Plans 04/05: import pattern is `import { Logo } from '@genai/ui'`
</output>
