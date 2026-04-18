---
phase: 16
plan: 05
type: execute
wave: 3
depends_on: [16-02, 16-03]
files_modified:
  - apps/tools-app/app/layout.tsx
  - apps/tools-app/app/globals.css
  - apps/tools-app/components/layout/GlobalLayout.tsx
  - apps/tools-app/components/ui/DetailHeaderLogo.tsx
  - apps/tools-app/app/login/page.tsx
autonomous: true
requirements:
  - BRAND-16-12-tools-font-migration
  - BRAND-16-13-tools-token-migration
  - BRAND-16-14-tools-logo-swap
  - BRAND-16-15-tools-microcopy
must_haves:
  truths:
    - "tools-app uses Geist Sans + Geist Mono via next/font/google (Inter + Cascadia removed)"
    - "Focus-ring uses var(--text) not var(--accent)"
    - "GlobalLayout, DetailHeaderLogo, login page use <Logo /> from @genai/ui"
    - "No hardcoded neutral hex values remain in component files (brand accents OK)"
    - "Utility microcopy strings match brand/VOICE.md"
    - "Dynamic rendering preserved (await getUser() in layout keeps it dynamic)"
  artifacts:
    - path: "apps/tools-app/app/layout.tsx"
      provides: "Geist Sans + Geist Mono via next/font/google; Inter + Cascadia removed"
      contains: "geist/font"
    - path: "apps/tools-app/app/globals.css"
      provides: "Updated font-family to var(--font-sans); focus-visible uses var(--text)"
      contains: "var(--font-sans)"
    - path: "apps/tools-app/components/layout/GlobalLayout.tsx"
      provides: "Uses <Logo context=\"header\" />"
      contains: "import { Logo }"
    - path: "apps/tools-app/components/ui/DetailHeaderLogo.tsx"
      provides: "Refactored to forward to <Logo context=\"header\" /> or removed+replaced at callsites"
      contains: "Logo"
    - path: "apps/tools-app/app/login/page.tsx"
      provides: "Uses <Logo /> instead of inline theme-switched <Image>"
      contains: "Logo"
  key_links:
    - from: "apps/tools-app/app/layout.tsx"
      to: "geist/font/sans + geist/font/mono"
      via: "next/font import"
      pattern: "from ['\"]geist/font"
    - from: "apps/tools-app/components/**/*.tsx"
      to: "@genai/ui Logo"
      via: "named import"
      pattern: "import .*Logo.*from ['\"]@genai/ui"
---

<objective>
Migrate `apps/tools-app` to the Phase 16 brand foundation — same scope shape as Plan 04 but for tools-app: Inter → Geist fonts, 3 hardcoded logo patterns → `<Logo />`, focus-ring-accent → focus-ring-text, neutral hex audit, microcopy pass from `brand/VOICE.md`.

Purpose: Complete the app-migration half of Wave 3. Plan 04 covers website in parallel. Plan 06 then diffs visual regression.

Output: tools-app built with Geist typography, Logo component wired in 3 callsites (GlobalLayout header, DetailHeaderLogo, login page), VOICE.md microcopy applied. Dynamic rendering preserved via `await getUser()` in layout (documented in apps/tools-app/AGENTS.md).

**CRITICAL CSP GUARDRAIL (per LEARNINGS.md + tools-app/AGENTS.md):**
- Nonce on request-headers pattern in proxy.ts MUST NOT be touched by this plan
- Layout is dynamic because it calls `await getUser()` — do NOT refactor that out without adding `export const dynamic = "force-dynamic"` as replacement
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
@apps/tools-app/AGENTS.md
@apps/tools-app/app/layout.tsx
@apps/tools-app/app/globals.css
@apps/tools-app/components/layout/GlobalLayout.tsx
@apps/tools-app/components/ui/DetailHeaderLogo.tsx
@apps/tools-app/app/login/page.tsx

<interfaces>
<!-- Logo component API (from Plan 03):                              -->
<!--   import { Logo } from '@genai/ui';                              -->
<!--   <Logo context="header" theme={theme} />                        -->
<!--                                                                   -->
<!-- Geist next/font (geist npm package):                             -->
<!--   import { GeistSans } from 'geist/font/sans';                   -->
<!--   import { GeistMono } from 'geist/font/mono';                   -->

<!-- Theme convention (from apps/tools-app/components/ThemeProvider):  -->
<!--   useTheme() returns { theme: 'light' | 'dark', toggleTheme }    -->
<!--   .light class applied to <html>                                 -->

<!-- Current tools-app logo references (grep output):                 -->
<!--   app/login/page.tsx:68       → /logo-blue-neon-new.jpg OR /logo-pink-red.jpg  -->
<!--   app/[slug]/page.tsx:5       → ToolLogo (tool-specific, NOT brand logo, do not touch) -->
<!--   components/layout/GlobalLayout.tsx:84 → /logo-blue-neon-new.jpg OR /logo-pink-red.jpg -->
<!--   components/ui/DetailHeaderLogo.tsx:11 → /logo-blue-neon-new.jpg OR /logo-pink-red.jpg -->
<!--   components/ui/ToolLogo.tsx  → Clearbit tool logos, NOT brand, DO NOT TOUCH -->
<!--   components/ui/ToolIcon.tsx  → tool-specific icons, DO NOT TOUCH         -->
<!--   components/library/ContentCard.tsx → ToolLogo, DO NOT TOUCH             -->
</interfaces>
</context>

<tasks>

<task type="auto" tdd="false">
  <name>Task 1: Font migration — Inter → Geist in tools-app layout.tsx + globals.css</name>
  <read_first>
    - apps/tools-app/app/layout.tsx (full file)
    - apps/tools-app/app/globals.css (full file)
    - apps/tools-app/AGENTS.md
    - LEARNINGS.md
    - .planning/phases/16-brand-system-foundation/16-UI-SPEC.md (Typography section)
  </read_first>
  <action>
**Edit `apps/tools-app/app/layout.tsx`:**

1. REMOVE these imports (lines 2-3):
   - `import { Inter } from "next/font/google";`
   - `import localFont from "next/font/local";`
2. REMOVE the `cascadiaCode` localFont block (lines 6-11).
3. REMOVE the `inter` declaration (lines 20-25).
4. ADD to imports:
   ```ts
   import { GeistSans } from "geist/font/sans";
   import { GeistMono } from "geist/font/mono";
   ```
5. REPLACE `<html lang="de" className={`${inter.variable} ${cascadiaCode.variable}`} suppressHydrationWarning>` (line 108) with:
   ```tsx
   <html lang="de" className={`${GeistSans.variable} ${GeistMono.variable}`} suppressHydrationWarning>
   ```
6. KEEP `await getUser()` in the RootLayout default export — this is what makes the layout dynamic and preserves CSP-nonce correctness per AGENTS.md. Do NOT remove.
7. No local font woff2 file exists at `apps/tools-app/app/fonts/` in the same shape as website — confirm via `ls apps/tools-app/app/fonts/` before touching. Current localFont points to `./fonts/CascadiaCode.woff2` — same structure as website. Leave the file, delete the import.

**Edit `apps/tools-app/app/globals.css`:**

Line 23 currently:
```css
body {
  font-family: var(--font-inter), system-ui, -apple-system, sans-serif;
}
```

Replace with:
```css
body {
  font-family: var(--font-sans);
}
```

(The `var(--font-sans)` now resolves to Geist via `packages/config/tailwind/base.css` Plan 02 binding — `--font-sans: var(--font-geist-sans), ...`.)

**Focus-ring update** (same as Plan 04, lines 99-102 and 110-118):

```css
:focus-visible {
  outline: 2px solid var(--text);
  outline-offset: 2px;
}
```

And:
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

Keep `.input-clean:focus` / `.chat-textarea:focus` rules as-is — they intentionally disable the outline for container-styled inputs.

**Do NOT touch:**
- `proxy.ts` (CSP nonce setup)
- `lib/csp.ts`
- `await getUser()` in layout (dynamic-rendering anchor)
- The `prefers-reduced-motion` media query
- The iOS zoom-prevention `.chat-textarea { font-size: 16px; }` rule
- Animation keyframes / utility classes at bottom of file
  </action>
  <verify>
    <automated>! grep -q "Inter" apps/tools-app/app/layout.tsx && ! grep -q "cascadiaCode\|CascadiaCode" apps/tools-app/app/layout.tsx && grep -q "GeistSans" apps/tools-app/app/layout.tsx && grep -q "GeistMono" apps/tools-app/app/layout.tsx && grep -q "await getUser()" apps/tools-app/app/layout.tsx && ! grep -q "var(--font-inter)" apps/tools-app/app/globals.css && grep -q "font-family: var(--font-sans)" apps/tools-app/app/globals.css && grep -q "outline: 2px solid var(--text)" apps/tools-app/app/globals.css && pnpm --filter @genai/tools-app build</automated>
  </verify>
  <acceptance_criteria>
    - `grep -c "Inter\\|cascadia\\|Cascadia" apps/tools-app/app/layout.tsx` → 0
    - `grep -q "from \"geist/font/sans\"" apps/tools-app/app/layout.tsx` → 0
    - `grep -q "GeistSans.variable" apps/tools-app/app/layout.tsx` → 0
    - `grep -q "await getUser()" apps/tools-app/app/layout.tsx` → 0 (dynamic-rendering anchor PRESERVED)
    - `grep -q "var(--font-inter)" apps/tools-app/app/globals.css` → non-zero exit (removed)
    - `grep -q "var(--font-sans)" apps/tools-app/app/globals.css` → 0
    - `grep -c "outline: 2px solid var(--text)" apps/tools-app/app/globals.css` → ≥2
    - `pnpm --filter @genai/tools-app build` exits 0
    - Build output shows `/` as `ƒ` (dynamic)
  </acceptance_criteria>
  <done>Geist fonts active, Inter+Cascadia removed, focus ring uses --text, await getUser() preserved, build green.</done>
</task>

<task type="auto" tdd="false">
  <name>Task 2: Swap Logo usages in tools-app components + neutral-hex audit + microcopy pass</name>
  <read_first>
    - apps/tools-app/components/layout/GlobalLayout.tsx (full file)
    - apps/tools-app/components/ui/DetailHeaderLogo.tsx (full file)
    - apps/tools-app/app/login/page.tsx (lines around 68, full file for context)
    - apps/tools-app/components/ThemeProvider.tsx (confirm useTheme API)
    - brand/VOICE.md (Microcopy-Library, Passwörter + Auth, Session + Access, Forms + Validierung, Toasts)
    - .planning/phases/16-brand-system-foundation/16-UI-SPEC.md (Copywriting Contract)
  </read_first>
  <action>
**Step 1 — Logo swap in GlobalLayout.tsx (line ~84):**

Open `apps/tools-app/components/layout/GlobalLayout.tsx`. Find the `<Image src={theme === 'dark' ? '/logo-blue-neon-new.jpg' : '/logo-pink-red.jpg'} ... />` block.

Replace with:
```tsx
import { Logo } from "@genai/ui";

// At the callsite:
<Logo context="header" theme={theme} size="md" />
```

Remove `import Image from "next/image";` IF no other <Image> remains in the file after the swap (grep to confirm).

**Step 2 — Refactor DetailHeaderLogo.tsx:**

Open `apps/tools-app/components/ui/DetailHeaderLogo.tsx`. The component is a thin wrapper around <Image> with theme-switching. Refactor to wrap `<Logo />`:

```tsx
'use client'

import { Logo } from "@genai/ui";
import { useTheme } from '@/components/ThemeProvider';

export default function DetailHeaderLogo() {
  const { theme } = useTheme();
  return <Logo context="header" theme={theme} size="md" />;
}
```

(Size "md" = 40px matches the current `h-9 w-auto` ≈ 36px close enough; use `height={36}` if pixel-exact match is needed. Verify by inspecting current Image `width={120} height={36}` and setting `height={36}` explicitly on <Logo />.)

Alternative: Delete DetailHeaderLogo.tsx entirely and replace its callsites with `<Logo context="header" theme={theme} />`. Grep usages first:
```bash
grep -rn "DetailHeaderLogo" apps/tools-app/
```
If there's only 1-2 callsites, inline the migration there and delete DetailHeaderLogo.tsx. If ≥3, keep the wrapper (it still serves a purpose as a pre-configured variant).

**Step 3 — Logo swap in login page.tsx (line ~68):**

Open `apps/tools-app/app/login/page.tsx`. Find the `<Image src={theme === 'dark' ? '/logo-blue-neon-new.jpg' : '/logo-pink-red.jpg'} ... />` block.

Replace with:
```tsx
import { Logo } from "@genai/ui";

// Callsite (preserve surrounding layout):
<Logo context="header" theme={theme} size="lg" />
```

Use `size="lg"` if the login page currently displays the logo larger (typical hero-login placement). Inspect current Image dimensions and pick sm/md/lg accordingly — if the current height is >48px, use `size="lg"` (56px); if ~40px, use `size="md"`; if ≤32px, use `size="sm"`.

Remove `import Image from "next/image";` if unused afterward.

**Step 4 — Neutral-hex audit:**

```bash
grep -rn "#[0-9a-fA-F]\{3,6\}" apps/tools-app/components/ apps/tools-app/app/ --include="*.tsx" --include="*.ts" --include="*.css" | grep -v "node_modules" | grep -v "globals.css" | grep -v "tools-app/lib/"
```

Apply same rules as Plan 04 Task 2 Step 4:
- Brand accent hex → acceptable, prefer token references where trivial
- Neutral greys → replace with `var(--slate-N)` per UI-SPEC semantic mapping
- Status colors → replace with `var(--status-*)`

Skip ToolLogo.tsx, ToolIcon.tsx (these render external tool branding, not our brand).

**Step 5 — Microcopy pass:**

Search:
```bash
grep -rn -E "(Ein Fehler|Erfolgreich|Bitte|Sind Sie sicher|Jetzt [a-zäöü]|aufgetreten|möchten Sie|fuer|ueber|ae )" apps/tools-app/components/ apps/tools-app/app/ --include="*.tsx" --include="*.ts"
```

Apply replacements from `brand/VOICE.md`:

| Old pattern | VOICE.md canonical |
|-------------|--------------------|
| "Ein Fehler ist aufgetreten" | "Ups, da ist was schiefgelaufen. Probier's nochmal!" |
| "Erfolgreich gespeichert" | "Passt, gespeichert!" |
| "Einen Augenblick bitte" / "Bitte warten" | "Einen Moment…" |
| "Sind Sie sicher?" | "Sicher? Das lässt sich nicht rückgängig machen." |
| "Sie sind nicht angemeldet" / "Nicht eingeloggt" | "Du musst angemeldet sein, um hier weiterzumachen." |
| "Session abgelaufen" / "Ihre Sitzung…" | "Deine Session ist abgelaufen. Log dich nochmal kurz ein." |
| "Möchten Sie [X]?" | "Willst du [X]?" or direct imperative |
| Empty state: "Keine X vorhanden" / "Noch keine X" | "Hier ist noch nichts. Leg los mit deinem ersten Tool." |
| Button "Jetzt anmelden!" | "Anmelden" |
| Button "Passwort zurücksetzen!" | "Link schicken" (per VOICE.md Auth table) |
| Form validation "Bitte geben Sie Ihre E-Mail ein" | "Hmm, die Mail-Adresse passt noch nicht ganz." |
| Form validation "Passwort zu kurz" | "Das Passwort ist noch zu kurz — mindestens 8 Zeichen." |
| Toast "Kopiert in Zwischenablage" | "Kopiert." |
| Umlaut umschrift (oe/ae/ue/ss) in user-facing strings | Real ö/ä/ü/ß |

**Critical microcopy strings to apply (from VOICE.md §Microcopy-Library §Passwörter + Auth, §Session + Access, §Toasts):**

- Login-Page error message: use "Das Passwort passt nicht. Probier's nochmal." (if a password-error string exists)
- Magic-Link trigger feedback: "Check deine Mail — wir haben dir einen Link geschickt."
- "Anmelden" button (not "Einloggen" / "Login"): "Anmelden"
- "Account anlegen" (not "Registrieren" / "Sign up"): "Account anlegen"
- Password-reset button: "Link schicken"

**Microcopy scope:** UI utility strings only. Do NOT touch:
- Tool descriptions / knowledge-base content (seeded from DB)
- Chat-agent system prompts (lib/agent-*.ts)
- API error response bodies (let them stay descriptive for debugging)
- Legal pages
- Test files

**Step 6 — Metadata umlauts:**

Check `apps/tools-app/app/layout.tsx` metadata — it already appears to use umlauts ("Künstliche", "für") but grep to confirm:
```bash
grep -E "(Kuenstliche|fuer|ueber|Intelligenz [Ff]ue)" apps/tools-app/app/layout.tsx
```
Replace any hits.

**Step 7 — Build verify:**

```bash
pnpm --filter @genai/tools-app build
```

Must exit 0. Verify user-facing routes show `ƒ` (dynamic) in output.

**Step 8 — Orphan legacy logos:**

`apps/tools-app/public/logo-blue-neon-new.jpg` and `apps/tools-app/public/logo-pink-red.jpg` are orphaned after this plan. Do NOT delete — Plan 06 verifies clean state, post-phase cleanup task can remove.
  </action>
  <verify>
    <automated>grep -q "import { Logo } from \"@genai/ui\"" apps/tools-app/components/layout/GlobalLayout.tsx && grep -q "<Logo " apps/tools-app/components/layout/GlobalLayout.tsx && grep -q "Logo" apps/tools-app/components/ui/DetailHeaderLogo.tsx && grep -q "<Logo " apps/tools-app/app/login/page.tsx && ! grep -rq "logo-blue-neon-new\.jpg\|logo-pink-red\.jpg" apps/tools-app/components/ apps/tools-app/app/ && ! grep -rq "Ein Fehler ist aufgetreten\|Erfolgreich gespeichert\|Einen Augenblick bitte" apps/tools-app/components/ apps/tools-app/app/ --include="*.tsx" --include="*.ts" && pnpm --filter @genai/tools-app build</automated>
  </verify>
  <acceptance_criteria>
    - `grep -q "import { Logo } from \"@genai/ui\"" apps/tools-app/components/layout/GlobalLayout.tsx` → 0
    - `grep -q "<Logo context=\"header\"" apps/tools-app/components/layout/GlobalLayout.tsx` → 0
    - `grep -q "Logo" apps/tools-app/components/ui/DetailHeaderLogo.tsx` → 0 (component either wraps Logo or has been deleted+replaced at callsites)
    - `grep -q "<Logo " apps/tools-app/app/login/page.tsx` → 0
    - `grep -r "logo-blue-neon-new\.jpg\|logo-pink-red\.jpg" apps/tools-app/components/ apps/tools-app/app/ 2>/dev/null` → empty
    - `grep -r "Ein Fehler ist aufgetreten" apps/tools-app/components/ apps/tools-app/app/ 2>/dev/null` → empty
    - `grep -r "Erfolgreich gespeichert" apps/tools-app/components/ apps/tools-app/app/ 2>/dev/null` → empty
    - `grep -r "Einen Augenblick bitte" apps/tools-app/components/ apps/tools-app/app/ 2>/dev/null` → empty
    - No `ae/oe/ue/ss` Umschrift in user-facing strings (spot-check: `grep -rn "fuer \|ueber \|Kuenstliche\|Moegl" apps/tools-app/app/ apps/tools-app/components/` → empty for user-facing files)
    - `pnpm --filter @genai/tools-app build` exits 0
    - Build output: root and key routes show `ƒ` (dynamic)
  </acceptance_criteria>
  <done>GlobalLayout + DetailHeaderLogo + login page use `<Logo />`, no old JPG logo paths remain in component code, microcopy utility strings match VOICE.md, build green and dynamic.</done>
</task>

</tasks>

<verification>
- `pnpm --filter @genai/tools-app build` green
- Root and key routes are `ƒ` (dynamic) — `await getUser()` anchor preserved
- No Inter / Cascadia references in layout.tsx or globals.css
- GlobalLayout, DetailHeaderLogo, login page use `<Logo />` from @genai/ui
- No `logo-blue-neon-new.jpg` / `logo-pink-red.jpg` paths remain in component code
- No `"Ein Fehler ist aufgetreten"` / `"Erfolgreich gespeichert"` / `"Einen Augenblick bitte"` remain in component code
- Focus-ring uses `var(--text)` not `var(--accent)`
- `proxy.ts` + `lib/csp.ts` untouched
- `await getUser()` in layout.tsx preserved (dynamic-rendering anchor)
</verification>

<success_criteria>
- tools-app fonts migrated to Geist (Sans + Mono) via next/font/google
- 3 hardcoded brand logo patterns (GlobalLayout, DetailHeaderLogo, login) replaced with `<Logo />` from @genai/ui
- ToolLogo / ToolIcon (third-party tool branding) left untouched — they serve a different purpose
- Focus ring uses brand-contract color (--text) per UI-SPEC
- Neutral hex values audited; trivial replacements applied with Radix slate tokens
- Utility microcopy strings match `brand/VOICE.md` canonical forms
- CSP + dynamic-rendering invariants preserved
- pnpm build green, key routes dynamic
</success_criteria>

<output>
After completion, create `.planning/phases/16-brand-system-foundation/16-05-SUMMARY.md` with:
- Files modified with line counts
- List of microcopy replacements applied (old → new per file)
- Decision on DetailHeaderLogo.tsx (wrapped / deleted) + reason
- Logo size choices per callsite (GlobalLayout md, DetailHeaderLogo md/36px, login lg)
- Hex → slate token replacements applied
- Orphan files flagged for future cleanup (logo-blue-neon-new.jpg, logo-pink-red.jpg, any CascadiaCode.woff2)
- Confirmation CSP patterns (proxy.ts, await getUser()) untouched
- Build output confirmation (routes dynamic ƒ)
</output>
