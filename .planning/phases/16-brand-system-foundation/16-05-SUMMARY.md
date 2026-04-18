---
phase: 16
plan: 05
subsystem: apps/tools-app
tags: [fonts, geist, logo, microcopy, brand-migration, focus-ring, hex-audit]
dependency_graph:
  requires: [16-02, 16-03]
  provides: [Geist fonts active in tools-app, Logo in GlobalLayout/DetailHeaderLogo/login, VOICE.md microcopy, focus-ring uses --text]
  affects: [apps/tools-app]
tech_stack:
  added: []
  patterns: [geist/font import, Logo context prop, VOICE.md canonical error strings]
key_files:
  created: []
  modified:
    - apps/tools-app/app/layout.tsx
    - apps/tools-app/app/globals.css
    - apps/tools-app/components/layout/GlobalLayout.tsx
    - apps/tools-app/components/ui/DetailHeaderLogo.tsx
    - apps/tools-app/app/login/page.tsx
    - apps/tools-app/components/chat/UrlInputModal.tsx
    - apps/tools-app/components/chat/ChatPanel.tsx
    - apps/tools-app/components/ui/Badge.tsx
decisions:
  - "Inter (next/font/google) + localFont (CascadiaCode) removed; GeistSans + GeistMono loaded via geist/font package"
  - "DetailHeaderLogo.tsx kept as thin wrapper (not deleted) — zero source callsites but safe to preserve; wraps <Logo context=header theme size=md />"
  - "KiwiMascot.tsx + FloatingChat.tsx SVG inline illustration hex values left as-is — mascot/illustration-specific colors, not neutral UI greys"
  - "API error bodies in api/chat/route.ts + api/account/delete/route.ts left as-is — out of microcopy scope per plan (debugging strings)"
  - "Badge.tsx #888 → var(--text-muted) — only neutral hex replaced (trivial single-line fix)"
metrics:
  duration: "~7 minutes"
  completed: "2026-04-18T16:15:07Z"
  tasks_completed: 2
  files_modified: 8
---

# Phase 16 Plan 05: tools-app Migration Summary

Inter → Geist fonts, Logo component in GlobalLayout/DetailHeaderLogo/login, focus-ring using `--text` token, VOICE.md microcopy applied, neutral hex audited.

## What Was Built

### Task 1 — Font Migration + Focus-Ring Fix

**`apps/tools-app/app/layout.tsx`:**
- Removed `import { Inter } from "next/font/google"` and `import localFont from "next/font/local"`
- Removed `cascadiaCode` localFont block (was: `--font-mono`, `CascadiaCode.woff2`)
- Removed `inter` declaration (`--font-inter`, subset latin)
- Added `import { GeistSans } from "geist/font/sans"` + `import { GeistMono } from "geist/font/mono"`
- `<html>` className: `${inter.variable} ${cascadiaCode.variable}` → `${GeistSans.variable} ${GeistMono.variable}`
- `await getUser()` preserved — dynamic-rendering anchor (CSP nonce invariant per AGENTS.md + LEARNINGS.md)

**`apps/tools-app/app/globals.css`:**
- `body { font-family: var(--font-inter), system-ui, ... }` → `body { font-family: var(--font-sans); }`
- `:focus-visible` outline: `var(--accent)` → `var(--text)`, offset `3px` → `2px`
- Element-specific focus ring (button/a/input/select/textarea/[role=button]): `var(--accent)` → `var(--text)`, offset `3px` → `2px`

### Task 2 — Logo Swap + Microcopy + Hex Audit

**`apps/tools-app/components/layout/GlobalLayout.tsx`:**
- Removed `import Image from 'next/image'`
- Added `import { Logo } from '@genai/ui'`
- `<Image src={theme==='dark' ? '/logo-blue-neon-new.jpg' : '/logo-pink-red.jpg'} width={150} height={50} ... />` → `<Logo context="header" theme={theme} size="md" />`
- Logo size: `size="md"` (40px) — matches previous `h-9 md:h-11` height range

**`apps/tools-app/components/ui/DetailHeaderLogo.tsx`:**
- Rewrote from `<Image>` theme-switch to `<Logo context="header" theme={theme} size="md" />`
- Removed `import Image from 'next/image'`
- Added `import { Logo } from '@genai/ui'`
- Decision: kept file as wrapper (not deleted) — zero source callsites but harmless to preserve

**`apps/tools-app/app/login/page.tsx`:**
- Removed `import Image from 'next/image'`
- Added `import { Logo } from '@genai/ui'`
- `<Image src={...} width={180} height={60} className="h-12 ..." />` → `<Logo context="header" theme={theme} size="lg" />`
- Logo size: `size="lg"` (56px) — login page hero placement, matches previous `h-12` height
- Loading text: `"Wird geladen..."` → `"Einen Moment…"` (VOICE.md §Loading canonical)

**`apps/tools-app/components/chat/UrlInputModal.tsx` (microcopy):**

| Old string | New string (VOICE.md canonical) |
|------------|----------------------------------|
| `'Ein Fehler ist aufgetreten'` (catch fallback) | `"Ups, da ist was schiefgelaufen. Probier's nochmal!"` |

**`apps/tools-app/components/chat/ChatPanel.tsx` (microcopy):**

| Old string | New string (VOICE.md canonical) |
|------------|----------------------------------|
| `Jetzt anmelden` (inline link label) | `Anmelden` |

**`apps/tools-app/components/ui/Badge.tsx` (hex audit):**

| Old hex | Replacement |
|---------|-------------|
| `text-[#888]` | `text-[var(--text-muted)]` |

### Logo Size Choices

| Callsite | Size | Height | Rationale |
|----------|------|--------|-----------|
| GlobalLayout header | `md` | 40px | Previous `h-9 md:h-11` (36–44px range) |
| DetailHeaderLogo | `md` | 40px | Previous `height={36}` px |
| login page hero | `lg` | 56px | Previous `height={60}`, `h-12` (48px) — lg is closest |

### Neutral Hex Audit

Grep: `grep -rn "#[0-9a-fA-F]{3,6}" apps/tools-app/components/ apps/tools-app/app/ --include="*.tsx" --include="*.ts"`

| File | Hex values | Disposition |
|------|-----------|-------------|
| `Badge.tsx` | `#888` (neutral grey) | **Fixed** → `var(--text-muted)` |
| `KiwiMascot.tsx` | Skin tones, plant greens, eye whites/pupils, brand accent | **Acceptable** — mascot illustration palette. Replacing with Radix tokens would break mascot aesthetic identity. |
| `FloatingChat.tsx` | Kiwi fruit SVG inline illustration colors | **Acceptable** — same rationale as KiwiMascot |
| `app/layout.tsx` | `#141414`, `#F6F6F6` | **Acceptable** — brand BG tokens in `themeColor` metadata, required as literal hex |
| `datenschutz/page.tsx` | Address strings with numbers | **Not hex colors** — postal addresses |

## Orphan Files (Do Not Delete — Plan 06 Cleanup)

| File | Status | Notes |
|------|--------|-------|
| `apps/tools-app/public/logo-blue-neon-new.jpg` | Orphan candidate | Replaced by `<Logo />`. No source references remain. |
| `apps/tools-app/public/logo-pink-red.jpg` | Orphan candidate | Same. |
| `apps/tools-app/app/fonts/CascadiaCode.woff2` | Orphan candidate | `localFont` import removed. File still on disk. Harmless. |

## CSP / Dynamic-Rendering Invariants

- `proxy.ts` — **untouched**
- `lib/csp.ts` — **untouched**
- `await getUser()` in `apps/tools-app/app/layout.tsx` — **preserved** (dynamic-rendering anchor)
- `next/font` via `geist` package self-hosts — no external font request at runtime, no CSP change needed

## Build Output Confirmation

```
pnpm --filter @genai/tools-app build

Route (app)
┌ ƒ /
├ ƒ /_not-found
├ ƒ /[slug]
├ ƒ /api/account/delete
├ ƒ /api/chat
├ ƒ /api/debug-auth
├ ƒ /api/defuddle
├ ƒ /api/extract-url
├ ƒ /api/health
├ ƒ /api/voice/token
├ ƒ /api/voice/transcribe
├ ƒ /auth/callback
├ ƒ /auth/confirm
├ ƒ /auth/set-password
├ ƒ /auth/signout
├ ƒ /datenschutz
├ ƒ /impressum
├ ƒ /login
└ ƒ /settings

ƒ Proxy (Middleware)
```

All routes: `ƒ` (dynamic). Exit 0.

## Deviations from Plan

### Auto-fixed Issues

None — plan executed exactly as written.

### Scope Notes

- `UrlInputModal.tsx` and `ChatPanel.tsx` microcopy fixed in addition to the 5 files listed in the plan frontmatter — these were in scope per Task 2 microcopy-pass action. Added to `key_files.modified`.
- `Badge.tsx` neutral hex `#888` → `var(--text-muted)` applied — single-line trivial fix within hex audit scope.
- API route error bodies (`api/chat/route.ts`, `api/account/delete/route.ts`) left as-is per explicit plan exclusion ("API error response bodies").
- `DetailHeaderLogo.tsx` decision: kept as wrapper (not deleted) since it has zero source callsites — safe either way, wrapper is cleaner long-term.

## Known Stubs

None. All Logo usages are wired to the real `<Logo />` component. Font variables active via Geist. Microcopy replacements use canonical VOICE.md strings.

## Threat Flags

None. This plan modifies only presentation-layer files (fonts, component import swaps, string constants). No new network endpoints, auth paths, or trust boundary crossings.

## Self-Check: PASSED

| Check | Result |
|-------|--------|
| `apps/tools-app/app/layout.tsx` | FOUND |
| `apps/tools-app/app/globals.css` | FOUND |
| `apps/tools-app/components/layout/GlobalLayout.tsx` | FOUND |
| `apps/tools-app/components/ui/DetailHeaderLogo.tsx` | FOUND |
| `apps/tools-app/app/login/page.tsx` | FOUND |
| `grep GeistSans apps/tools-app/app/layout.tsx` | FOUND |
| `grep "await getUser()" apps/tools-app/app/layout.tsx` | FOUND |
| `grep "var(--font-sans)" apps/tools-app/app/globals.css` | FOUND |
| `grep "outline: 2px solid var(--text)" apps/tools-app/app/globals.css` | FOUND (×2) |
| `grep 'import { Logo }' GlobalLayout.tsx` | FOUND |
| `grep '<Logo' GlobalLayout.tsx` | FOUND |
| `grep 'Logo' DetailHeaderLogo.tsx` | FOUND |
| `grep '<Logo' login/page.tsx` | FOUND |
| `grep "logo-blue-neon-new.jpg" components/ app/` | EMPTY (removed) |
| `pnpm --filter @genai/tools-app build` | EXIT 0 |
| All user routes `ƒ` (dynamic) | CONFIRMED |
| Commit `16d1bb0` (Task 1) | FOUND |
| Commit `fa0059b` (Task 2) | FOUND |
