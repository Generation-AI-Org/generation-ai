---
phase: 16
plan: 02
type: execute
wave: 2
depends_on: [16-01]
files_modified:
  - packages/config/tailwind/base.css
autonomous: true
requirements:
  - BRAND-16-03-radix-slate-tokens
  - BRAND-16-04-geist-font-bindings
  - BRAND-16-05-semantic-status-tokens
must_haves:
  truths:
    - "Radix slate, slate-dark, slateA CSS variables are available globally via base.css import chain"
    - "--font-sans resolves to Geist Sans stack; --font-mono resolves to Geist Mono stack"
    - "Semantic status tokens (error/success/warning/info) exist as CSS variables"
    - "World-mapping preserved: Light=Rosa/Rot accents, Dark=Blau/Neon accents — no change to --accent/--bg-header"
  artifacts:
    - path: "packages/config/tailwind/base.css"
      provides: "Canonical token layer: existing brand tokens + Radix neutrals + Geist fonts + semantic states"
      contains: "@import \"@radix-ui/colors/slate.css\""
  key_links:
    - from: "packages/config/tailwind/base.css"
      to: "@radix-ui/colors npm package (CSS files)"
      via: "@import statements"
      pattern: "@import \"@radix-ui/colors/slate.css\""
    - from: "apps/*/app/globals.css"
      to: "packages/config/tailwind/base.css"
      via: "existing @import chain (no change needed)"
      pattern: "@import \"../../../packages/config/tailwind/base.css\""
---

<objective>
Extend `packages/config/tailwind/base.css` with three additions required by the brand contract:
1. Radix Colors neutrals (`slate`, `slate-dark`, `slateA`) imported and mapped to `--slate-1..12` + `--slateA-1..12` semantic tokens
2. Geist Sans/Mono font family bindings wired to `--font-sans` / `--font-mono` + replace Cascadia/Fira Code fallbacks
3. Semantic status tokens (`--status-error`, `--status-success`, `--status-warning`, `--status-info`)

World-mapping stays identical — Light=Rosa/Rot, Dark=Blau/Neon. Workshop-pre-applied fixes in apps/website/app/globals.css (`--color-primary: var(--accent)`, `--color-ring: var(--text)`) are NOT touched in this plan.

Purpose: Establish the single source of truth for the token layer BEFORE app migrations in Wave 3. Shared base.css is consumed by both apps — changes here propagate simultaneously.

Output: Extended `packages/config/tailwind/base.css` with Radix imports, Geist font bindings, semantic status variables, and the 12-step slate semantic mapping commented inline per UI-SPEC.md role table.
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/phases/16-brand-system-foundation/16-UI-SPEC.md
@packages/config/tailwind/base.css
@brand/DESIGN.md
@brand/tokens.json

<interfaces>
<!-- Current base.css structure (keep untouched): -->
<!-- :root { /* dark defaults */ --bg, --accent, --text, --border, ... } -->
<!-- .light { /* light overrides */ ... } -->
<!-- @theme inline { /* Tailwind v4 @theme mapping */ ... } -->

<!-- Radix Colors CSS package exports per https://www.radix-ui.com/colors/docs/overview/installation: -->
<!-- @radix-ui/colors/slate.css       → :root { --slate-1..12 } -->
<!-- @radix-ui/colors/slate-dark.css  → .dark, :root.dark { --slate-1..12 overrides } -->
<!-- @radix-ui/colors/slateA.css      → :root { --slateA-1..12 } (alpha) -->

<!-- Project theme convention (from base.css + globals.css): -->
<!-- Dark is DEFAULT on :root; Light is applied via `.light` class on <html>. -->
<!-- Radix ships `.dark-theme` / `.light-theme` class patterns by default.    -->
<!-- We MUST map them to our convention (dark on :root, light on .light).    -->
</interfaces>
</context>

<tasks>

<task type="auto" tdd="false">
  <name>Task 1: Add Radix Colors imports + slate semantic mapping + Geist font bindings + semantic status tokens to base.css</name>
  <read_first>
    - packages/config/tailwind/base.css (MUST read full file first — this task edits it)
    - .planning/phases/16-brand-system-foundation/16-UI-SPEC.md (Token Architecture section, Typography section)
    - brand/DESIGN.md §B (typography), §C (colors)
  </read_first>
  <action>
Use Context7 BEFORE editing to confirm current Radix Colors CSS API:
- `mcp__context7__resolve-library-id` with `libraryName: "@radix-ui/colors"`
- `mcp__context7__get-library-docs` focused on "css import nextjs" — specifically confirm the exact selectors shipped by `@radix-ui/colors/slate.css` vs `slate-dark.css` (whether dark variant ships on `.dark-theme`, `:root.dark`, or both). Adapt step 2 mapping accordingly.

Edit `packages/config/tailwind/base.css`:

**1. Add imports at the very top of the file (before the existing `/* Generation AI Design System - Shared Base */` comment is fine; just before `:root {`):**

```css
/* Radix Colors — neutrals scale. Light defaults, dark overrides via .light inversion. */
@import "@radix-ui/colors/slate.css";
@import "@radix-ui/colors/slate-dark.css";
@import "@radix-ui/colors/slate-alpha.css";
```

Note: If Context7 confirms the correct file name is `slateA.css` instead of `slate-alpha.css`, use that. The Radix package ships both conventions across versions — verify against the installed version's actual file names via `ls node_modules/@radix-ui/colors/*.css`.

**2. Radix slate maps to `.dark-theme` / `.light-theme` by default. Our convention is dark-on-`:root`, light-on-`.light`. Add a wrapper block directly after the imports to alias Radix selectors into our convention:**

```css
/* Alias Radix's default `.light-theme` / `.dark-theme` selectors onto our convention.
   Our :root = dark (app default); our .light class = light override on <html>. */
:where(.light) {
  color-scheme: light;
}
:where(:root:not(.light)) {
  color-scheme: dark;
}
```

If Radix does NOT ship `.dark-theme` selector (newer versions attach to `:root` directly when imported independently), skip this aliasing but document in SUMMARY. Confirm via `grep -l "dark-theme" node_modules/@radix-ui/colors/*.css`.

**3. Add Geist font-family variables to BOTH `:root` and `.light` blocks is NOT needed — font doesn't change between themes. Add to `:root` only:**

Find the existing `:root { ... }` block and add before its closing `}`:

```css
  /* Typography — Geist stacks. Variables --font-geist-sans / --font-geist-mono come from next/font class on <html>. */
  --font-sans: var(--font-geist-sans), ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif;
  --font-mono: var(--font-geist-mono), ui-monospace, "SF Mono", Menlo, monospace;

  /* Semantic status colors (NOT brand accents — must never collide with --accent). */
  --status-error: #DC2626;
  --status-success: #16A34A;
  --status-warning: #F59E0B;
  --status-info: #2563EB;
```

**4. Update the existing `@theme inline` block. Currently it has:**

```css
--font-family-mono: var(--font-mono), ui-monospace, "Cascadia Code", "Fira Code", monospace;
```

Replace this line with:

```css
  /* Font families — Geist Sans + Geist Mono (replaces Inter + Cascadia) */
  --font-family-sans: var(--font-sans);
  --font-family-mono: var(--font-mono);
```

**5. Add to `@theme inline` block (at end, before closing `}`) — semantic status color bindings + Radix slate bindings for Tailwind v4 utility classes:**

```css
  /* Semantic status bindings (for Tailwind utility generation) */
  --color-status-error: var(--status-error);
  --color-status-success: var(--status-success);
  --color-status-warning: var(--status-warning);
  --color-status-info: var(--status-info);

  /* Radix slate bindings — exposed as Tailwind utility colors */
  --color-slate-1: var(--slate-1);
  --color-slate-2: var(--slate-2);
  --color-slate-3: var(--slate-3);
  --color-slate-4: var(--slate-4);
  --color-slate-5: var(--slate-5);
  --color-slate-6: var(--slate-6);
  --color-slate-7: var(--slate-7);
  --color-slate-8: var(--slate-8);
  --color-slate-9: var(--slate-9);
  --color-slate-10: var(--slate-10);
  --color-slate-11: var(--slate-11);
  --color-slate-12: var(--slate-12);
```

**6. Replace the "TYPOGRAPHY" comment block (existing lines describing typography standards) with the canonical role reference verbatim from UI-SPEC.md's Type Scale. The block should document:**

```
/*
 * TYPOGRAPHY — Brand Type Scale (canonical roles, UI-SPEC.md Phase 16)
 * ---------------------------------------------------------------------
 * Display / H1:  clamp(32px, 5vw, 48px), weight 700, lh 1.05, Geist Mono,   letter-spacing -0.02em
 * H2 Section:    clamp(24px, 3vw, 32px), weight 700, lh 1.2,  Geist Sans,   letter-spacing -0.015em
 * H3:            20px,                   weight 700, lh 1.3,  Geist Sans
 * Lede / Intro:  18px,                   weight 400, lh 1.5,  Geist Sans
 * Body:          16px,                   weight 400, lh 1.65, Geist Sans
 * Body Small:    14px,                   weight 400, lh 1.55, Geist Sans
 * Caption:       13px,                   weight 400, lh 1.5,  Geist Sans
 * Micro / Tag:   11px,                   weight 700, lh 1.4,  Geist Mono,   letter-spacing +0.08em
 * Button:        14px,                   weight 700, lh 1,    Geist Mono,   letter-spacing +0.02em
 * Code:          13px,                   weight 400, lh 1.5,  Geist Mono
 *
 * Ligaturen in UI-Text deaktiviert: font-feature-settings: "liga" 0, "calt" 0
 * Italic nur in Blockquotes (Geist Sans italic). Headlines/Body nie italic.
 */
```

**7. Radix slate semantic mapping — add as a comment block directly after the Radix imports block (documentation for executors of Plans 04/05):**

```
/*
 * RADIX SLATE — Semantic Role Mapping (use in component code)
 * -----------------------------------------------------------
 * slate-1  → App BG              (body background)
 * slate-2  → Subtle BG           (card section, zebra)
 * slate-3  → UI element BG       (disabled button, skeleton)
 * slate-4  → Hover BG            (ghost button hover)
 * slate-5  → Active BG           (pressed / selected)
 * slate-6  → Subtle border       (divider, card border)
 * slate-7  → UI border           (input border)
 * slate-8  → Hover border        (input focus without ring)
 * slate-9  → Solid BG secondary  (tooltip)
 * slate-10 → Hover solid         (tooltip hover)
 * slate-11 → Low-contrast text   (muted, captions, disabled)
 * slate-12 → High-contrast text  (body, headings)
 *
 * Rule: Never use hex for neutrals. Always var(--slate-N).
 * Brand accents (--accent, --bg-header) stay as CSS-variable references.
 */
```

**8. Do NOT touch:**
- Existing `--bg`, `--accent`, `--bg-header`, `--text`, `--border`, `--border-accent` tokens in either `:root` or `.light`
- The `.light` block's color overrides
- Scrollbar / base body styles
- apps/website/app/globals.css (migration happens in Plan 04)
- apps/tools-app/app/globals.css (migration happens in Plan 05)

**9. Verify no existing Tailwind utility class relies on `--font-family-mono` pointing to Cascadia explicitly — if it does, the app-level migration (Plans 04/05) handles the font import swap; base.css already points to `var(--font-mono)` which both apps' next/font will set correctly after migration.**
  </action>
  <verify>
    <automated>grep -q "@import \"@radix-ui/colors/slate.css\"" packages/config/tailwind/base.css && grep -q "@import \"@radix-ui/colors/slate-dark.css\"" packages/config/tailwind/base.css && grep -q "\-\-font-sans: var(\-\-font-geist-sans)" packages/config/tailwind/base.css && grep -q "\-\-status-error: #DC2626" packages/config/tailwind/base.css && grep -q "\-\-color-slate-11: var(\-\-slate-11)" packages/config/tailwind/base.css && pnpm --filter @genai/website build && pnpm --filter @genai/tools-app build</automated>
  </verify>
  <acceptance_criteria>
    - `grep -c "@import \"@radix-ui/colors" packages/config/tailwind/base.css` → ≥3 (slate, slate-dark, alpha)
    - `grep -q "var(--font-geist-sans)" packages/config/tailwind/base.css` → 0
    - `grep -q "var(--font-geist-mono)" packages/config/tailwind/base.css` → 0
    - `grep -q "#DC2626" packages/config/tailwind/base.css` → 0 (--status-error)
    - `grep -q "#16A34A" packages/config/tailwind/base.css` → 0 (--status-success)
    - `grep -q "#F59E0B" packages/config/tailwind/base.css` → 0 (--status-warning)
    - `grep -q "#2563EB" packages/config/tailwind/base.css` → 0 (--status-info)
    - `grep -c "\-\-color-slate-[0-9]" packages/config/tailwind/base.css` → 12
    - `grep -q "Cascadia" packages/config/tailwind/base.css` → non-zero exit (Cascadia REMOVED from base.css)
    - `grep -q "\-\-bg-header" packages/config/tailwind/base.css` → 0 (preserved — world-mapping intact)
    - `grep -q "#FC78FE" packages/config/tailwind/base.css` → 0 (Rosa header preserved in .light)
    - `grep -q "#3A3AFF" packages/config/tailwind/base.css` → 0 (Blau header preserved in :root)
    - `pnpm --filter @genai/website build` exits 0 (existing Inter+Cascadia still wired in app, base.css doesn't break build)
    - `pnpm --filter @genai/tools-app build` exits 0
    - **Radix dark-mode selector convention identified and documented:** `grep -E 'dark-theme|prefers-color-scheme' node_modules/@radix-ui/colors/slate-dark.css` output captured verbatim. If output is empty (neither convention found), investigate the file contents before proceeding — DO NOT blindly skip the aliasing block, as that risks silently-wrong colors in dark mode.
  </acceptance_criteria>
  <done>base.css imports Radix slates, binds Geist font stacks, defines semantic status tokens, preserves brand world-mapping. Both apps still build green (they still use Inter until Plans 04/05 swap).</done>
</task>

</tasks>

<verification>
- `grep "@radix-ui/colors" packages/config/tailwind/base.css` returns 3 import lines
- `grep "font-geist" packages/config/tailwind/base.css` returns ≥2 hits (sans + mono)
- `grep "status-" packages/config/tailwind/base.css` returns 4 hits (error/success/warning/info)
- `grep "color-slate" packages/config/tailwind/base.css` returns 12 hits
- No hardcoded Cascadia/Fira Code references remain in base.css
- Both apps `pnpm build` green (apps still reference --font-inter via their own globals.css — that's Plans 04/05's job)
- Brand world-mapping preserved: `:root { --bg-header: #3A3AFF; --accent: #CEFF32 }` and `.light { --bg-header: #FC78FE; --accent: #F5133B }` untouched
- **Radix dark-mode selector convention documented in SUMMARY.** Before finalizing, run:
  ```bash
  grep -E 'dark-theme|prefers-color-scheme|:root' node_modules/@radix-ui/colors/slate-dark.css | head -5
  ```
  This reveals whether the installed @radix-ui/colors version ships `.dark-theme` class selector, `@media (prefers-color-scheme: dark)`, or attaches directly to `:root`. Record the EXACT convention used (with the grep output) in `16-02-SUMMARY.md` — this is required so Plans 04/05 executors know whether the `:where(.light)` aliasing in base.css is actually needed or a no-op. Do NOT silently "skip aliasing" if the convention is unknown; confirm first.
</verification>

<success_criteria>
- Radix Colors CSS imported and slate-N tokens available globally
- Geist font-family stacks bound to --font-sans / --font-mono via next/font variable names (--font-geist-sans / --font-geist-mono)
- Semantic status tokens defined as separate scale from brand accents
- 12-step slate semantic role mapping documented inline for executor reference
- Canonical type scale from UI-SPEC.md documented inline
- World-mapping preserved verbatim (no change to --accent, --bg-header, .light overrides)
- Both apps' builds remain green (no app-level code references broken yet)
</success_criteria>

<output>
After completion, create `.planning/phases/16-brand-system-foundation/16-02-SUMMARY.md` with:
- Exact Radix Colors version installed + which CSS files were imported (slate.css, slate-dark.css, and the alpha file — note exact name: `slate-alpha.css` vs `slateA.css`)
- Whether Radix ships `.dark-theme`/`.light-theme` selectors vs attaches to `:root` — document for downstream migrations
- Diff summary (lines added, lines changed)
- Confirmation both apps still build green after token-layer extension
</output>
