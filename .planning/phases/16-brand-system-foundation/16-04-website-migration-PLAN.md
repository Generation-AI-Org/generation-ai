---
phase: 16
plan: 04
type: execute
wave: 3
depends_on: [16-02, 16-03]
files_modified:
  - apps/website/app/layout.tsx
  - apps/website/app/globals.css
  - apps/website/components/layout/header.tsx
  - apps/website/components/layout/footer.tsx
autonomous: true
requirements:
  - BRAND-16-08-website-font-migration
  - BRAND-16-09-website-token-migration
  - BRAND-16-10-website-logo-swap
  - BRAND-16-11-website-microcopy
must_haves:
  truths:
    - "Website uses Geist Sans + Geist Mono via next/font/google (Inter + Cascadia removed)"
    - "Website focus-ring uses --text (not --accent) per brand contract"
    - "Header + footer <Image> tags replaced with <Logo /> from @genai/ui (terminal-splash excluded — square 220x220 variant out-of-scope per CONTEXT.md 'Square-Logo-Varianten nicht in Asset-Drop')"
    - "No hardcoded hex values for neutral colors remain in website component files"
    - "Microcopy utility strings match brand/VOICE.md canonical forms"
    - "force-dynamic + request-headers-nonce pattern preserved (no CSP regression)"
  artifacts:
    - path: "apps/website/app/layout.tsx"
      provides: "Geist Sans + Geist Mono loaded via next/font/google; Inter removed; Cascadia localFont removed"
      contains: "geist/font"
    - path: "apps/website/app/globals.css"
      provides: "Updated --font-sans to Geist; focus-visible outline uses var(--text)"
      contains: "var(--font-geist-sans)"
    - path: "apps/website/components/layout/header.tsx"
      provides: "Uses <Logo context=\"header\" /> instead of theme-switched <Image>"
      contains: "import { Logo }"
    - path: "apps/website/components/layout/footer.tsx"
      provides: "Uses <Logo context=\"footer\" />"
      contains: "import { Logo }"
  key_links:
    - from: "apps/website/app/layout.tsx"
      to: "geist/font/sans + geist/font/mono"
      via: "next/font import"
      pattern: "from ['\"]geist/font"
    - from: "apps/website/components/layout/*.tsx"
      to: "@genai/ui Logo"
      via: "named import"
      pattern: "import .*Logo.*from ['\"]@genai/ui"
---

<objective>
Migrate `apps/website` to the Phase 16 brand foundation: Inter → Geist fonts, hardcoded logo patterns → `<Logo />`, focus-ring-accent → focus-ring-text, audit for hardcoded neutral hex values, and apply microcopy from `brand/VOICE.md` to utility strings.

Purpose: Bring the website onto the canonical token layer from Plan 02 and the Logo component from Plan 03. This is half of Wave 3; Plan 05 does the same for tools-app.

Output: Website built with Geist typography, Logo component in header/footer, neutral colors via Radix slate tokens, VOICE.md microcopy applied to utility strings. CSP + force-dynamic invariants untouched.

**CRITICAL CSP GUARDRAIL (per LEARNINGS.md):**
- `export const dynamic = "force-dynamic"` in app/layout.tsx MUST remain
- Nonce on request-headers pattern in proxy.ts MUST NOT be touched by this plan
- `next/font/google` self-hosts — no external font request, no CSP change needed
- After build: verify routes show `ƒ` (dynamic), not `○` (static)
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/phases/16-brand-system-foundation/16-UI-SPEC.md
@brand/VOICE.md
@LEARNINGS.md
@apps/website/AGENTS.md
@apps/website/app/layout.tsx
@apps/website/app/globals.css
@apps/website/components/layout/header.tsx
@apps/website/components/layout/footer.tsx

<interfaces>
<!-- Logo component API (from Plan 03, exported by @genai/ui): -->
<!--   import { Logo } from '@genai/ui';                         -->
<!--   <Logo context="header" theme={theme} />  // theme from useTheme() -->
<!--   <Logo context="footer" theme={theme} />                   -->
<!--                                                              -->
<!-- Props: variant?, colorway?, context?, size?, height?, theme?, className?, alt? -->
<!-- Colorway="auto" (default) resolves via context + theme       -->

<!-- Geist next/font package API (geist npm):                    -->
<!--   import { GeistSans } from 'geist/font/sans';              -->
<!--   import { GeistMono } from 'geist/font/mono';              -->
<!--   Exposes .variable (e.g. '--font-geist-sans') and .className -->
<!--   Apply to <html>: className={`${GeistSans.variable} ${GeistMono.variable}`} -->

<!-- Theme convention (from apps/website/components/ThemeProvider): -->
<!--   useTheme() returns { theme: 'light' | 'dark', toggleTheme } -->
<!--   .light class applied to <html> by ThemeProvider            -->
</interfaces>
</context>

<tasks>

<task type="auto" tdd="false">
  <name>Task 1: Font migration — Inter → Geist in website layout.tsx + globals.css</name>
  <read_first>
    - apps/website/app/layout.tsx (full file)
    - apps/website/app/globals.css (full file)
    - LEARNINGS.md (2026-04-18 CSP/static-prerendering incident)
    - apps/website/AGENTS.md
    - .planning/phases/16-brand-system-foundation/16-UI-SPEC.md (Typography section)
  </read_first>
  <action>
**Edit `apps/website/app/layout.tsx`:**

1. REMOVE these imports:
   - `import { Inter } from "next/font/google";`
   - `import localFont from "next/font/local";`
2. REMOVE the `cascadiaCode` localFont block (lines 13-18 of current file).
3. REMOVE the `inter` declaration (lines 26-30 of current file).
4. ADD at the top (after `"use client"`-style imports, before `"./globals.css"`):
   ```ts
   import { GeistSans } from "geist/font/sans";
   import { GeistMono } from "geist/font/mono";
   ```
5. REPLACE the `<html lang="de" className={`${inter.variable} ${cascadiaCode.variable}`}>` line with:
   ```tsx
   <html lang="de" className={`${GeistSans.variable} ${GeistMono.variable}`}>
   ```
6. KEEP `export const dynamic = "force-dynamic";` — do NOT remove or modify.
7. KEEP the CSP-related comment block above `export const dynamic = ...`.
8. Delete the local font file reference — also delete `apps/website/app/fonts/CascadiaCode.woff2` is NOT required in this task (leaving the file is harmless and reduces risk). Document its orphan status in SUMMARY.

**Edit `apps/website/app/globals.css`:**

Current line 33:
```css
--font-sans: var(--font-inter), system-ui, sans-serif;
```

Replace with:
```css
--font-sans: var(--font-geist-sans), ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif;
--font-mono: var(--font-geist-mono), ui-monospace, "SF Mono", Menlo, monospace;
```

Also: Focus-ring currently uses `var(--accent)` on lines 72-74 and 87-90. Per UI-SPEC.md §Color > Interaction States: focus ring must use `var(--text)`. Update:

Line 72-74:
```css
:focus-visible {
  outline: 2px solid var(--text);
  outline-offset: 2px;
}
```

Line 87-91:
```css
button:focus-visible,
a:focus-visible,
input:focus-visible,
select:focus-visible,
textarea:focus-visible,
[role="button"]:focus-visible {
  outline: 2px solid var(--text);
  outline-offset: 2px;
  border-radius: 4px;
}
```

`.skip-link` focus offset of 3px is for visual clarity on the skip-link-slide-in — keep `.skip-link:focus` as-is (it has its own `outline: none`).

Also update skip-link colors if they hardcode: currently `background: var(--accent); color: var(--text-on-accent);` — those are tokens already, leave them.

**Do NOT touch:**
- `proxy.ts` (CSP nonce setup)
- `lib/csp.ts`
- The shadcn compatibility `@theme inline` block unless it explicitly references Inter — verify by grep
- Any Tailwind class usage in component files in this task (Task 2 handles components)
  </action>
  <verify>
    <automated>! grep -q "Inter" apps/website/app/layout.tsx && ! grep -q "cascadiaCode\|CascadiaCode" apps/website/app/layout.tsx && grep -q "GeistSans" apps/website/app/layout.tsx && grep -q "GeistMono" apps/website/app/layout.tsx && grep -q "force-dynamic" apps/website/app/layout.tsx && grep -q "var(--font-geist-sans)" apps/website/app/globals.css && grep -q "outline: 2px solid var(--text)" apps/website/app/globals.css && ! grep -q "var(--font-inter)" apps/website/app/globals.css && pnpm --filter @genai/website build</automated>
  </verify>
  <acceptance_criteria>
    - `grep -c "Inter\\|cascadia\\|Cascadia" apps/website/app/layout.tsx` → 0
    - `grep -q "from \"geist/font/sans\"" apps/website/app/layout.tsx` → 0
    - `grep -q "from \"geist/font/mono\"" apps/website/app/layout.tsx` → 0
    - `grep -q "GeistSans.variable" apps/website/app/layout.tsx` → 0
    - `grep -q "export const dynamic = \"force-dynamic\"" apps/website/app/layout.tsx` → 0 (PRESERVED)
    - `grep -q "var(--font-geist-sans)" apps/website/app/globals.css` → 0
    - `grep -q "var(--font-inter)" apps/website/app/globals.css` → non-zero exit (Inter REMOVED)
    - `grep -c "outline: 2px solid var(--text)" apps/website/app/globals.css` → ≥2
    - `grep -q "outline: 2px solid var(--accent)" apps/website/app/globals.css` → non-zero (accent focus ring REPLACED)
    - `pnpm --filter @genai/website build` exits 0
    - Build output shows `/` route as `ƒ` (dynamic) — verify with `pnpm --filter @genai/website build 2>&1 | grep "^ƒ\\s*/\\s*"` returns at least one match
  </acceptance_criteria>
  <done>Geist fonts active via next/font/google, Inter+Cascadia removed, focus ring uses --text, force-dynamic preserved, build green, root route still dynamic.</done>
</task>

<task type="auto" tdd="false">
  <name>Task 2: Swap Logo usages in website components + neutral-hex audit + microcopy pass</name>
  <read_first>
    - apps/website/components/layout/header.tsx (full file — reference impl lines 20-30)
    - apps/website/components/layout/footer.tsx (full file)
    - apps/website/components/terminal-splash.tsx (line 408, check context)
    - apps/website/components/ThemeProvider.tsx (to confirm useTheme API)
    - brand/VOICE.md (Microcopy-Library section — extract canonical strings for buttons/errors/empty/loading)
    - .planning/phases/16-brand-system-foundation/16-UI-SPEC.md (Copywriting Contract section)
  </read_first>
  <action>
**Step 1 — Logo swap in header.tsx:**

Open `apps/website/components/layout/header.tsx`. Replace the `<Image src={...} />` block (lines 21-29 current) with `<Logo />`:

```tsx
// Top of file — add to imports:
import { Logo } from "@genai/ui";

// Inside the Link, REPLACE the <Image ... /> block with:
<Logo context="header" theme={theme} size="md" className="hover:opacity-90 transition-opacity" />
```

Remove the `import Image from "next/image";` import IF no other <Image> remains in the file (grep the file first — if Image is used elsewhere, keep the import).

**Step 2 — Logo swap in footer.tsx:**

Open `apps/website/components/layout/footer.tsx`. Replace the `<Image src={theme === 'dark' ? ... : ...} />` block (around line 17) with:

```tsx
import { Logo } from "@genai/ui";

// Inside the existing wrapper:
<Logo context="footer" theme={theme} size="md" />
```

Preserve any wrapping `<Link>` and `aria-label`. Remove Image import if unused afterward.

**Step 3 — terminal-splash.tsx: DEFERRED (do NOT touch in this plan):**

The terminal-splash at `apps/website/components/terminal-splash.tsx` line 408 renders a **220×220 square** PNG (`/logos/generationai-blau-neon-transparent.png`). The `<Logo />` component shipped in Plan 03 only supports `variant="wide"` — square-logo variants are explicitly out-of-scope per `CONTEXT.md` ("Square-Logo-Varianten nicht in Asset-Drop, beim Designer nachfordern").

**Action: Leave terminal-splash.tsx untouched.** Keep the existing `<Image src="/logos/generationai-blau-neon-transparent.png" ... />` including its `style={{ filter: 'contrast(1.2) saturate(1.1) drop-shadow(...)' }}`. This file is NOT in `files_modified` for this plan.

Document as post-phase item in SUMMARY under "Deferred to follow-up":
- terminal-splash square-logo swap — blocked on: (a) square-variant asset drop from designer, (b) `<Logo variant="square">` support in @genai/ui. Reopen when assets arrive.

**IMPORTANT — `filter: drop-shadow` forbidden on `<Logo />`:** Anywhere else in this plan where a replaced image previously had an inline `style={{ filter: ... }}` or Tailwind `filter-*` / `drop-shadow-*` class: when swapping to `<Logo />`, REMOVE that filter. Per `brand/DESIGN.md §F` Logo-Nutzungsregeln: no shadows, no transforms, no filters on the logo. (Header/footer usages do not currently have filters, but verify by inspecting the old `<Image>` props before swap and drop any `filter` / `drop-shadow` / `className` that applies a filter.)

**Step 4 — Neutral-hex audit:**

Run from repo root:
```bash
grep -rn "#[0-9a-fA-F]\{3,6\}" apps/website/components/ apps/website/app/ --include="*.tsx" --include="*.ts" --include="*.css" | grep -v "node_modules" | grep -v "globals.css"
```

For each hit:
- Brand accent hex (`#FC78FE`, `#F5133B`, `#3A3AFF`, `#CEFF32`, `#F6F6F6`, `#141414`) in component code → acceptable (brand variables), but prefer token references (`var(--accent)`, `var(--bg)`, `var(--text)`) if easy to swap without changing visual output.
- Neutral greys/near-blacks/near-whites (`#666`, `#333`, `#999`, `#EEE`, etc.) → REPLACE with `var(--slate-N)` per UI-SPEC semantic mapping:
  - Muted text → `var(--slate-11)`
  - Body text → `var(--slate-12)`
  - Card borders/dividers → `var(--slate-6)`
  - Input borders → `var(--slate-7)`
  - Subtle BG → `var(--slate-2)`
- Status colors (`#DC2626` error, `#16A34A` success, etc.) → replace with `var(--status-error)` etc.

Document each replacement in a comment if the mapping is non-obvious.

**Step 5 — Microcopy pass:**

Search for utility-string patterns that violate `brand/VOICE.md`:

```bash
grep -rn -E "(Ein Fehler|Erfolgreich|Bitte|Sind Sie sicher|Jetzt [a-zäöü]|aufgetreten|möchten Sie)" apps/website/ --include="*.tsx" --include="*.ts"
```

For each hit, apply canonical replacement from `brand/VOICE.md` Microcopy-Library § Kernsituationen / Button-Labels / Forms + Validierung:

| Old pattern | Canonical replacement (VOICE.md) |
|-------------|-----------------------------------|
| "Ein Fehler ist aufgetreten" | "Ups, da ist was schiefgelaufen. Probier's nochmal!" |
| "Erfolgreich gespeichert" / "Erfolgreich [verb]" | "Passt, gespeichert!" (or drop "Erfolgreich" and use direct verb) |
| "Einen Augenblick bitte" / "Bitte warten" | "Einen Moment…" |
| "Sind Sie sicher?" | "Sicher? Das lässt sich nicht rückgängig machen." |
| "Hier sind noch keine X" / "Keine Einträge" | "Hier ist noch nichts. Leg los mit deinem ersten Tool." |
| Button labels ending in "!" | Remove the "!" |
| "Jetzt anmelden" / "Jetzt loslegen" | Remove "Jetzt" prefix — "Anmelden" / "Loslegen" |
| "Möchten Sie [X]?" | Direct imperative or "Willst du [X]?" |
| "Leider [X]" | Drop "leider" |
| "ae/oe/ue/ss" in user-facing strings | Replace with real ö/ä/ü/ß |

**Microcopy scope discipline:** Only touch UI strings (button labels, error messages, empty states, loading states, toast texts, form validation). Do NOT touch:
- Marketing landing page copy (hero, sections, CTAs)
- Legal pages (/impressum, /datenschutz) — these have specific legal wording
- SEO metadata (title, description in layout.tsx + page-level)
- Test files

If a string is borderline (e.g. a section heading on the landing page), leave it — Microcopy pass is utility-string only per ROADMAP scope.

**Step 6 — Preserve umlauts:**

Metadata in `apps/website/app/layout.tsx` currently uses "Kuenstliche" and "fuer" — per brand/VOICE.md Sprach-Policy "niemals Umschrift zu oe/ae/ue/ss". Replace:
- "Kuenstliche" → "Künstliche"
- "fuer" → "für"

Apply ONLY in user-facing metadata (title, description, keywords, OG). The description already uses "DACH-Raum" correctly. Keep domain names and URLs unchanged (generation-ai.org).

**Step 7 — Build verify:**

```bash
pnpm --filter @genai/website build
```

Must exit 0. Verify in output that `/` and other user routes show `ƒ` (dynamic), NOT `○` (static).

**Step 8 — Cleanup:**

After verifying the build and that the Logo component renders correctly, the legacy PNG logos at `apps/website/public/logos/generationai-*.png` are orphaned. Do NOT delete them in this plan — Plan 06 verifies the migration is clean, then cleanup can be a post-phase task. Document them as orphan candidates in SUMMARY.
  </action>
  <verify>
    <automated>grep -q "import { Logo } from \"@genai/ui\"" apps/website/components/layout/header.tsx && grep -q "import { Logo } from \"@genai/ui\"" apps/website/components/layout/footer.tsx && grep -q "<Logo " apps/website/components/layout/header.tsx && grep -q "<Logo " apps/website/components/layout/footer.tsx && ! grep -rq "generationai-pink-rot-transparent" apps/website/components/layout/ && ! grep -rq "Ein Fehler ist aufgetreten\|Erfolgreich gespeichert\|Einen Augenblick bitte" apps/website/components/ apps/website/app/ --include="*.tsx" --include="*.ts" && pnpm --filter @genai/website build</automated>
  </verify>
  <acceptance_criteria>
    - `grep -q "import { Logo } from \"@genai/ui\"" apps/website/components/layout/header.tsx` → 0
    - `grep -q "import { Logo } from \"@genai/ui\"" apps/website/components/layout/footer.tsx` → 0
    - `grep -q "<Logo context=\"header\"" apps/website/components/layout/header.tsx` → 0
    - `grep -q "<Logo context=\"footer\"" apps/website/components/layout/footer.tsx` → 0
    - `grep -q "generationai-blau-neon-transparent" apps/website/components/terminal-splash.tsx` → 0 (terminal-splash DEFERRED — square-variant; PNG + inline filter preserved)
    - `grep -q "filter:\s*drop-shadow\|drop-shadow-" apps/website/components/layout/header.tsx apps/website/components/layout/footer.tsx 2>/dev/null` → non-zero exit (no filter:drop-shadow on <Logo /> usages per brand/DESIGN.md §F)
    - `grep -r "generationai-blau-neon-transparent\\|generationai-pink-rot-transparent" apps/website/components/ apps/website/app/ 2>/dev/null` → empty (no component still references old PNG paths)
    - `grep -r "Ein Fehler ist aufgetreten" apps/website/components/ apps/website/app/ 2>/dev/null` → empty
    - `grep -r "Erfolgreich gespeichert" apps/website/components/ apps/website/app/ 2>/dev/null` → empty
    - `grep -q "Künstliche" apps/website/app/layout.tsx` → 0 (umlaut restored)
    - `grep -q "für" apps/website/app/layout.tsx` → 0 (umlaut restored)
    - `grep -q "Kuenstliche" apps/website/app/layout.tsx` → non-zero (old spelling gone)
    - `pnpm --filter @genai/website build` exits 0
    - `pnpm --filter @genai/website build 2>&1 | grep -E "^\\s*ƒ\\s+/"` matches (root dynamic)
  </acceptance_criteria>
  <done>Header + footer use <Logo /> (terminal-splash DEFERRED — square-variant out-of-scope), no filter:drop-shadow on any Logo usage, neutral hex values audited and replaced where trivial, microcopy utility strings match VOICE.md canonical forms, umlauts restored in metadata, build green and dynamic.</done>
</task>

</tasks>

<verification>
- `pnpm --filter @genai/website build` green
- Root route is `ƒ` (dynamic) in build output — CSP invariant preserved
- No Inter / Cascadia references remain in layout.tsx or globals.css
- Header + Footer use `<Logo />` from @genai/ui (terminal-splash DEFERRED — square-variant out-of-scope per CONTEXT.md)
- No `filter: drop-shadow` / `drop-shadow-*` classes on any `<Logo />` usage (brand/DESIGN.md §F)
- No `"Ein Fehler ist aufgetreten"` / `"Erfolgreich gespeichert"` / `"Einen Augenblick bitte"` remain in components
- Focus-ring uses `var(--text)` not `var(--accent)`
- Metadata "Kuenstliche" → "Künstliche", "fuer" → "für"
- `proxy.ts` + `lib/csp.ts` untouched (CSP nonce pattern preserved)
</verification>

<success_criteria>
- Website fonts migrated to Geist (Sans + Mono) via next/font/google
- 2 hardcoded logo patterns (header, footer) replaced with <Logo /> — terminal-splash DEFERRED (square-variant, post-phase)
- No filter:drop-shadow on <Logo /> usages (brand/DESIGN.md §F)
- Focus ring uses brand-contract color (--text) per UI-SPEC.md
- Neutral hex values audited; trivial replacements done with Radix slate tokens; non-trivial documented
- Utility microcopy strings match brand/VOICE.md canonical forms
- Umlauts restored in user-facing metadata
- CSP + force-dynamic invariants preserved (per LEARNINGS.md)
- pnpm build green, root route dynamic
</success_criteria>

<output>
After completion, create `.planning/phases/16-brand-system-foundation/16-04-SUMMARY.md` with:
- Files modified with line counts
- List of microcopy replacements applied (old → new per file)
- List of hex → slate token replacements applied
- Orphan files flagged for future cleanup (CascadiaCode.woff2, /public/logos/generationai-pink-rot-transparent.png + any other unused header/footer variants — note: generationai-blau-neon-transparent.png STILL USED by terminal-splash, do NOT delete)
- DEFERRED to follow-up: terminal-splash.tsx square-logo swap (needs square-variant asset + <Logo variant="square"> support)
- Confirmation CSP patterns (proxy.ts, force-dynamic) untouched
- Build output confirmation (routes dynamic ƒ vs static ○)
</output>
