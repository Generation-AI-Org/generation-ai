---
phase: 28
plan: 01
slug: shell-header-footer
status: completed
created: 2026-04-26
depends_on:
  - 28-CONTEXT
---

# 28-01 Plan — Shell/Header/Footer Foundation

## Goal

Bring the Tools-App shell into website parity: header visual structure, primary nav, active Tools state, compact footer, and calmer page rhythm. This creates the frame all later plans build on.

## Files To Read

- `apps/website/components/layout/header.tsx`
- `apps/website/components/layout/footer.tsx`
- `apps/tools-app/components/layout/GlobalLayout.tsx`
- `apps/tools-app/components/layout/ConditionalGlobalLayout.tsx`
- `apps/tools-app/components/HomeLayout.tsx`
- `apps/tools-app/app/[slug]/page.tsx`
- `apps/tools-app/app/globals.css`
- `.codex/skills/ui-ux-pro-max/SKILL.md`

## Implementation Tasks

### Task 1 — Extract or isolate Tools header

Preferred: create `apps/tools-app/components/layout/ToolsHeader.tsx` if it reduces `GlobalLayout.tsx` complexity. Otherwise keep header inside `GlobalLayout.tsx` but structure it in clearly marked blocks.

Header requirements:

- Fixed/sticky behavior should preserve existing app shell behavior.
- Desktop visual target:
  - `bg-[var(--bg-header)]`
  - `border-b border-white/10`
  - `h-20` equivalent on desktop
  - inner `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8`
  - logo uses `<Logo context="header" theme={theme} size="lg" interactive />` if layout allows
  - no standalone `KI-Tools` text label beside logo
- Desktop nav order:
  - `Tools` active, current domain
  - `Events` → `https://generation-ai.org/events`
  - `Community` → `https://generation-ai.org/community`
  - `Für Partner` → `https://generation-ai.org/partner`
  - `Über uns` → `https://generation-ai.org/about`
- Active Tools item uses website-compatible text treatment plus a subtle active indicator. Do not invent a large tab treatment.

### Task 2 — Remove legal from desktop header

Remove the desktop header legal cluster:

- `Impressum`
- `Datenschutz`

Do not delete legal pages.

### Task 3 — Add compact Tools footer

Create `apps/tools-app/components/layout/ToolsFooter.tsx`.

Footer requirements:

- Match website footer language, but compact enough for app surface.
- Include:
  - Logo + `Die KI-Community für Studierende im DACH-Raum.`
  - Entdecken: `Tools`, `Events`, `Community`, `Für Partner`, `Über uns`, `Kostenlos Mitglied werden`
  - Rechtliches: `Impressum`, `Datenschutz`
  - Kontakt: `info@generation-ai.org`
- Use cross-domain `<a>` for website/community links.
- Use internal `Link` for Tools-App legal routes where possible.
- Footer must render on Tools home and detail pages in the scroll container.
- Footer must not render on bare legal/login routes if `ConditionalGlobalLayout` intentionally excludes the global shell.

### Task 4 — Place footer correctly in scroll flow

Current app shell uses `h-screen overflow-hidden` and route-specific scroll containers. Footer must be inside the scrollable route content.

Preferred implementation:

- Wrap `children` and `<ToolsFooter />` in the main content scroll area only if this does not break `HomeLayout`'s own scroll behavior.
- If `HomeLayout` owns the only scroll container, add footer from inside `HomeLayout` after `CardGrid`.
- For detail pages, ensure footer appears below detail content, not behind chat.

Document the chosen placement in a short code comment if the scroll containment is non-obvious.

### Task 5 — Establish calmer shell spacing

Adjust only the shell-level spacing needed to make the page feel less cramped:

- Header-to-hero rhythm should feel like website subpages, not a dashboard toolbar.
- Footer should have enough top spacing so it reads as a site footer.
- Main scroll area should avoid hard visual compression around hero/filter/grid.
- Do not add decorative bands/cards just to create spacing.
- Use existing DS spacing scale (`space-4`, `space-6`, `space-8`, `space-12`) through Tailwind utilities.

## Acceptance Criteria

- Header desktop visually matches website framework.
- Desktop legal links are gone from the header.
- Footer is visible below Tools home content and a detail page.
- Shell feels more spacious and website-like without making the grid inefficient.
- Existing public CTAs still exist somewhere; final CTA copy is refined in 28-02.
- Chat still renders.
- No CSP-sensitive files touched.

## Verification

```bash
pnpm --filter @genai/tools-app exec tsc --noEmit
```

Manual/browser:

- `/` desktop 1440: header height/nav/logo match website rhythm.
- `/` mobile 375: top bar is not crowded.
- `/chatgpt`: footer appears after content.
- Legal links work from footer.

## Defer

- Account menu details → 28-02.
- Search mobile repositioning → 28-03.
- Card density → 28-04.
