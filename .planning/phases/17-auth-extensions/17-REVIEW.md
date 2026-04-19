---
phase: 17-auth-extensions
reviewed: 2026-04-19T00:00:00Z
depth: standard
files_reviewed: 11
files_reviewed_list:
  - packages/emails/package.json
  - packages/emails/src/index.ts
  - packages/emails/src/tokens.ts
  - packages/emails/src/components/Layout.tsx
  - packages/emails/src/components/BrandLogo.tsx
  - packages/emails/src/components/EmailButton.tsx
  - packages/emails/src/templates/confirm-signup.tsx
  - packages/emails/src/templates/recovery.tsx
  - packages/emails/src/templates/magic-link.tsx
  - packages/emails/src/templates/email-change.tsx
  - packages/emails/src/templates/reauth.tsx
  - packages/emails/src/templates/invite.tsx
  - packages/emails/scripts/generate-logo-pngs.ts
  - packages/emails/scripts/export.ts
findings:
  blocker: 0
  high: 0
  medium: 2
  low: 3
  info: 4
  total: 9
status: issues_found
---

# Phase 17: Code Review Report

**Reviewed:** 2026-04-19
**Depth:** standard
**Files Reviewed:** 14 (incl. index.ts pulled in via re-exports)
**Status:** issues_found (mostly hygiene; nothing blocking handoff)

## Summary

Phase 17 introduces the `@genai/emails` package — six React-Email templates for Supabase
auth, a shared `Layout` with light/dark CSS, a bulletproof `EmailButton` (Outlook VML
fallback), and two build scripts (`generate-logo-pngs.ts`, `export.ts`).

Overall the code is small, surgical, well-commented and matches the plan. Umlauts are
preserved as proper UTF-8 in the rendered HTML (`für`, `Änderung`, `bestätigen` all
correct in `dist/*.html`). Supabase Go-template tokens (`{{ .ConfirmationURL }}`,
`{{ .Data.name }}`, `{{ .Token }}`) survive React render intact because they contain no
HTML-special characters.

The most security-relevant surface is `EmailButton`'s `dangerouslySetInnerHTML`. With
the **current call sites only** (defaults are hardcoded Supabase template strings; no
caller passes runtime user input) this is safe. The risk is latent: nothing in the
component prevents a future caller from feeding unescaped user data through `href` or
`children`. Findings below capture that, plus a handful of code-hygiene items.

No blockers, no high-severity issues. Safe to hand off to Plan 17-05 export.

## Medium

### MD-01: `EmailButton` does not escape `href`/`children` before HTML interpolation

**File:** `packages/emails/src/components/EmailButton.tsx:32-40`
**Issue:** The component builds raw HTML via template string and passes it to
`dangerouslySetInnerHTML`. `href` and `children` are interpolated directly with no
attribute-encoding or text-encoding step:

```tsx
href="${href}" ... >${children}</a>
```

In **the current setup this is safe**: every caller passes either a hardcoded German
label (`'E-Mail bestätigen'`, `'Anmelden'`, …) and a Supabase template literal
(`'{{ .ConfirmationURL }}'`). Supabase substitutes the URL server-side after the HTML
is already in its DB, so React/JS-side escaping is irrelevant for the URL. Children are
literal strings in source.

The risk is **future regression**: as soon as any template starts passing
`children={someUserName}` or `href={dynamicUrl}`, you have a stored-XSS path through
the email pipeline (a `"` in the href breaks out of the attribute; an angle bracket in
children breaks out of the anchor). Worth a defensive guard now since the API surface
is tiny.

**Fix:** Escape both inputs and document the contract. Minimal helper:

```tsx
function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

// inside component:
const safeHref = escapeHtml(href)
const safeChildren = escapeHtml(children)
const html = `<!--[if mso]>
  ... href="${safeHref}" ... >${safeChildren}</center>
  ...
  <a href="${safeHref}" ...>${safeChildren}</a>
  ...`
```

Note: `&` in `{{ .ConfirmationURL }}` will not occur (it's a literal Go-template token);
the escape is a no-op for the current placeholder string and stays a no-op after
Supabase substitution as long as URLs are well-formed (Supabase already URL-encodes
query params).

---

### MD-02: Unused dependency `@react-email/button`

**File:** `packages/emails/package.json:17`
**Issue:** `@react-email/button` is listed as a direct dependency but no source file
imports it (verified via grep across `packages/emails/src`). The custom `EmailButton`
replaces it, presumably because the official component does not emit Outlook VML
fallback. Leaving it in inflates `node_modules` and confuses future maintainers
("which button should I use?").

**Fix:** Remove from `dependencies`:

```diff
   "dependencies": {
-    "@react-email/button": "0.0.10",
     "@react-email/components": "^0.0.31",
     "@react-email/render": "^1.0.1",
     "react-email": "^3.0.1"
   },
```

Then `pnpm install` to update the lockfile.

## Low

### LO-01: Empty interface `BrandLogoProps`

**File:** `packages/emails/src/components/BrandLogo.tsx:4`
**Issue:** `export interface BrandLogoProps {}` has no members and the component
ignores its props (`_props: BrandLogoProps`). Empty interfaces are a TS lint warning
(`@typescript-eslint/no-empty-interface`) and add no value. The re-export in `index.ts`
also exposes a type that conveys nothing.

**Fix:** Either drop the interface and the prop entirely:

```tsx
export function BrandLogo(): React.ReactElement { ... }
```

…and remove the `BrandLogoProps` re-export from `src/index.ts`. Or, if you want to
keep the door open for future props (e.g., size variant), add a TODO comment so the
empty interface is intentional rather than dead.

---

### LO-02: `export.ts` `pretty: true` may break VML conditional comments long-term

**File:** `packages/emails/scripts/export.ts:27`
**Issue:** `render(..., { pretty: true })` runs an HTML formatter over the output. In
the current `dist/confirm-signup.html` the formatter has already split the Outlook
conditional-comment closer across two lines:

```
                        </v:roundrect> <!
                      [endif]--><!--[if !mso]><!-->
```

That stray space and line break inside `<![endif]-->` is technically still parsed by
Outlook's MSO renderer (Word HTML is forgiving) but it's a known source of
"button-disappears-in-Outlook" bugs and has bitten people before. Pretty-printing also
balloons the file size, which matters for Gmail's 102 KB clip threshold.

**Fix:** Switch to `pretty: false` for the Supabase-import artifacts (Supabase pastes
the raw HTML; humans don't read it):

```tsx
const html = await render(React.createElement(Component), { pretty: false })
```

If you want a pretty version for diff review, write both: `${name}.html` (minified for
import) and `${name}.pretty.html` (formatted for humans, gitignored).

---

### LO-03: `export.ts` and `generate-logo-pngs.ts` resolve `__dirname` without ESM guard

**File:** `packages/emails/scripts/export.ts:12`, `packages/emails/scripts/generate-logo-pngs.ts:5`
**Issue:** Both scripts use `__dirname` directly. They run via `tsx`, which today
emulates CJS globals so this works. If the package is ever switched to `"type": "module"`
or `tsx` changes its default ESM behaviour, `__dirname` becomes `undefined` and the
scripts crash with a non-obvious error (`join` receives `undefined`). The package.json
currently has no `"type"` field, which means CJS — fine today but brittle.

**Fix:** Pin behaviour with an ESM-safe pattern (works in both worlds via tsx):

```ts
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
```

Or accept the current state and add a comment noting the CJS assumption.

## Info

### IN-01: Logo asset paths assume `generation-ai.org/brand/logos/` is reachable from email clients

**File:** `packages/emails/src/components/BrandLogo.tsx:22,31`
**Issue:** Hardcoded absolute URLs to `https://generation-ai.org/brand/logos/...`. The
PNGs do exist in `apps/website/public/brand/logos/` (verified). Just confirm they ship
to production *before* importing templates into Supabase, otherwise the first batch of
production emails will have broken logo `<img>` tags. Plan 17-05 already calls this
out — flagging here so the verifier checks it.

**Fix:** Pre-deploy checklist item: `curl -I https://generation-ai.org/brand/logos/logo-wide-red.png`
must return 200 before Supabase template paste.

---

### IN-02: Dark-mode CSS depends on client support for `prefers-color-scheme`

**File:** `packages/emails/src/components/Layout.tsx:36-57`
**Issue:** `email-card`, `email-text`, `email-btn` etc. all rely on
`@media (prefers-color-scheme: dark)`. Outlook Desktop ignores the `<style>` block
entirely and will render the **light tokens** (red `#F5133B` button on white card),
which is fine but worth recording as expected behaviour, not a bug. The component
comment already notes this — no change needed; included so the verifier doesn't flag
it.

**Fix:** None. Document expectation in QA matrix only.

---

### IN-03: `borderRadius = 6` comment in EmailButton is misleading

**File:** `packages/emails/src/components/EmailButton.tsx:30`
**Issue:** The variable is declared and commented (`// pts, approximate for Outlook
VML`) but never used — the VML `<v:roundrect>` uses `arcsize="50%"` (pill shape)
and the modern `<a>` uses `radius.full` (`9999px`). Dead variable.

**Fix:** Delete the unused `borderRadius` constant and its comment.

---

### IN-04: Tokens file uses mixed quote styles

**File:** `packages/emails/src/tokens.ts:44-45`
**Issue:** Most string values use single quotes; the font stacks use single quotes
that wrap embedded single-quoted family names (`"'Geist Mono', ui-monospace, ..."`).
Functionally fine, but `fontStack.sans` uses single quotes around `'Segoe UI'` and
`'Helvetica'`/none consistently — minor. Project doesn't have a documented quote-style
rule in CLAUDE.md, so leaving it. Mentioned only because the file will be diffed often.

**Fix:** None unless you adopt a project-wide Prettier config that enforces one style.

---

_Reviewed: 2026-04-19_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
