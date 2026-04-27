---
phase: 28
plan: 03
slug: search-mobile-navigation
status: completed
created: 2026-04-26
depends_on:
  - 28-01-shell-header-footer
  - 28-02-account-menu-member-cta
---

# 28-03 Plan — Search + Mobile Navigation

## Goal

Put app search and filters where users expect them, while keeping primary site navigation clean and website-like.

## Files To Read

- `apps/tools-app/components/HomeLayout.tsx`
- `apps/tools-app/components/library/FilterBar.tsx`
- `apps/tools-app/components/layout/GlobalLayout.tsx`
- `apps/tools-app/components/layout/ToolsHeader.tsx` if created

## Implementation Tasks

### Task 1 — Desktop search remains app action

Desktop may keep a search control in the header right action cluster, but it must read as an app control, not a nav item.

Requirements:

- Stable accessible label: `Suche öffnen`.
- Search does not displace primary nav at 1024px.
- `⌘K` hint can remain on large desktop only.
- Use explicit transitions, not `transition-all`.

### Task 2 — Mobile search moves near content

On mobile, remove search from the top header action cluster if it crowds logo/theme/burger/account. Provide search near the filters/content.

Preferred:

- Add a mobile search row/button above `FilterBar` or inside `FilterBar`.
- Label can be icon + `Suche` if space allows.
- Touch target min 44px.
- It should trigger the existing `HomeLayout` search overlay.
- It should not make the filter area feel like a dense control board; prefer one clean row or a clearly grouped control.

### Task 3 — Mobile burger polish

Improve the existing mobile nav:

- Website-parity nav order.
- Public CTA section at bottom.
- Logged-in account section at bottom.
- Legal links may appear in low-priority bottom group if footer is not immediately accessible, but they must not compete with primary nav.
- Add Escape close if simple.
- Use `aria-expanded`, `aria-controls`, and a clear label.

Do not add a heavy dialog dependency unless already available and low risk.

### Task 4 — Filter behavior sanity

Ensure filter chips remain horizontally scrollable on mobile and do not collide with member CTA/search row.

If layout becomes too tall, reduce vertical spacing rather than removing functionality.

Spacing target:

- Mobile should show hero/CTA/search/filter as a deliberate sequence.
- Desktop should have enough air between hero/member CTA/filter/grid to feel like the website, while still surfacing tools quickly.

## Acceptance Criteria

- Mobile top bar has no more than logo + essential action controls.
- Mobile users can still open search without opening the site nav.
- Desktop users can still use search from header.
- Burger contains primary nav plus correct public/member bottom sections.
- No legal links in desktop header.

## Verification

```bash
pnpm --filter @genai/tools-app exec tsc --noEmit
```

Browser checks:

- 375 dark/light: header no wrap/crowding.
- 375: search open works.
- 375: filter chips scroll.
- 375: burger opens and closes.
- 768: no overlap between member CTA, filters, and cards.
- 1024: desktop/tablet header nav does not wrap.

## Defer

- Full command-palette redesign.
