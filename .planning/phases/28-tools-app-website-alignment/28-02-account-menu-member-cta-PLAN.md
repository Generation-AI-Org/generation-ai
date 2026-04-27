---
phase: 28
plan: 02
slug: account-menu-member-cta
status: completed
created: 2026-04-26
depends_on:
  - 28-01-shell-header-footer
---

# 28-02 Plan — Account Menu + Member CTA

## Goal

Replace ad hoc logged-in controls with a real account menu and give logged-out users a clear, honest reason to become members.

## Files To Read

- `apps/tools-app/components/layout/GlobalLayout.tsx`
- `apps/tools-app/components/library/FilterBar.tsx`
- `apps/tools-app/components/HomeLayout.tsx`
- `apps/tools-app/components/tools-hero.tsx`
- `apps/tools-app/app/settings/page.tsx`
- `apps/tools-app/app/settings/DeleteAccountButton.tsx`
- `apps/tools-app/app/auth/signout/route.ts`

## Implementation Tasks

### Task 1 — Create AccountMenu

Create `apps/tools-app/components/layout/AccountMenu.tsx` or local component inside `ToolsHeader.tsx` if smaller.

Desktop behavior:

- One account button in the header action cluster.
- Accessible label: `Account-Menü öffnen`.
- Menu items:
  - `Einstellungen` → `/settings`
  - `Community öffnen` → `https://community.generation-ai.org`
  - `Abmelden` → POST form to `/auth/signout`
- Use tokens:
  - text `var(--text)`
  - muted `var(--text-muted)`
  - danger `var(--status-error)`
- Keyboard:
  - Button is focus-visible.
  - Escape closes menu if feasible.
  - Outside click closes menu if feasible.

Mobile behavior:

- Account section appears in mobile burger/nav panel for logged-in users.
- Include same actions.
- Do not show signup/login CTAs when logged in.

### Task 2 — Public CTA in header

Logged-out desktop header:

- Primary: `Kostenlos Mitglied werden`
  - href `https://generation-ai.org/join?utm_source=tools`
  - `data-cta="primary-register"`
- Secondary: `Einloggen` or `Bereits Mitglied? Einloggen`
  - href `/login`
  - `data-cta="secondary-login"`

Keep labels short enough to avoid wrapping. If both labels crowd at medium widths, use:

- Primary: `Mitglied werden`
- Secondary: `Einloggen`

Mobile burger public CTA:

- Primary full-width pill: `Kostenlos Mitglied werden`
- Secondary text link: `Bereits Mitglied? Einloggen`

### Task 3 — Member CTA block on Tools home

Add a compact component, likely `apps/tools-app/components/member-cta.tsx`.

Placement:

- Below hero and above/near filters, or after first visible filter area if that fits better.
- Must not push actual tools too far below fold on mobile.
- Must feel like a quiet website conversion surface, not a SaaS upsell banner.

Copy contract:

- Eyebrow: `Member-Modus`
- Headline: `Mehr aus den Tools rausholen.`
- Body: `Als Mitglied bekommst du Community-Zugang, Events und einen stärkeren KI-Assistenten mit tieferen Empfehlungen.`
- Chips: `Community`, `Events`, `Bessere Empfehlungen`, `Stärkerer Assistent`
- Primary: `Kostenlos Mitglied werden`
- Secondary: `Bereits Mitglied? Einloggen`

Behavior:

- Render only in `mode === 'public'`.
- Do not render for members.
- Use rounded-2xl card/panel styling, not nested card-inside-card.
- Keep desktop compact and mobile scannable.
- Use whitespace and calm hierarchy: one clear headline, one short body, chips as secondary proof.

### Task 4 — Replace UI Pro language

Replace visible `Pro` text in Tools-App UI with `Member` where it means logged-in/member mode.

Do not rename internal variables unless trivial.

Known targets:

- `FloatingChat` badge
- comments/copy around Lite/Pro if user-visible

## Acceptance Criteria

- Logged-in header has one account control, not separate settings/logout icons.
- Public header and mobile menu have signup/login paths.
- Public home includes a compact member benefit CTA.
- No user-visible `Pro` remains for free membership state.
- No logged-in user sees public signup CTA.

## Verification

```bash
pnpm --filter @genai/tools-app exec tsc --noEmit
```

Targeted checks:

- Public `/`: `data-cta="primary-register"` exists.
- Public `/`: member CTA text visible.
- Public `/login`: unchanged enough to login.
- If `TEST_USER_EMAIL`/`TEST_USER_PASSWORD` env exists, run logged-in smoke:
  - login
  - public CTAs absent
  - account menu visible
  - settings link works
  - signout returns to public state

## Defer

- Final pricing/paid wording. This phase treats membership as free community/member access.
