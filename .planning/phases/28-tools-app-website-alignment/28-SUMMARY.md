---
phase: 28
slug: tools-app-website-alignment
type: summary
status: completed
completed: 2026-04-26
branch: feature/phase-28-tools-app-website-alignment
---

# Phase 28 Summary — Tools-App Website Alignment

## Outcome

Phase 28 is implemented on `feature/phase-28-tools-app-website-alignment`.

The Tools-App now reads more like a Generation-AI website surface: website-aligned header, grouped app actions, compact footer, public Member CTA, logged-in account menu, mobile/tablet search near content, preview-first cards, no decorative sparkles, and chat copy/focus polish while keeping Kiwi.

## What Changed By Plan

### 28-01 — Shell/Header/Footer

- Extracted the Tools-App header into `apps/tools-app/components/layout/ToolsHeader.tsx`.
- Removed the `KI-Tools` header label and desktop legal links.
- Mirrored website nav order: `Tools`, `Events`, `Community`, `Für Partner`, `Über uns`.
- Added `apps/tools-app/components/layout/ToolsFooter.tsx`.
- Rendered the footer in the scroll flow on home and detail routes.
- Kept bare legal/login route behavior unchanged.

### 28-02 — Account Menu + Member CTA

- Added `apps/tools-app/components/layout/AccountMenu.tsx`.
- Replaced loose logged-in Settings/Logout icons with one account menu on desktop.
- Mobile burger now has logged-in Account section with `Einstellungen`, `Community öffnen`, and POST `Abmelden`.
- Added `apps/tools-app/components/member-cta.tsx` with `Member-Modus` value copy.
- Replaced user-visible membership framing from `Pro` to `Member`.

### 28-03 — Search + Mobile Navigation

- Desktop search remains a header app action from `xl` upward.
- Mobile/tablet search is now near content above filters.
- Tablet `1024px` uses the mobile/tablet header to avoid crowded desktop nav.
- Mobile burger uses `aria-expanded`, `aria-controls`, Escape close, primary nav, public CTAs or account actions, and low-priority legal links.

### 28-04 — Card Preview + Emoji Cleanup

- Added `apps/tools-app/components/library/card-preview.ts`.
- Cards now show one preview line from `quick_win` with `summary` fallback.
- Removed the decorative sparkle from cards.
- Preserved detail page summary and quick-win content.
- Card grid now uses wider website-like max-width and calmer spacing.

### 28-05 — Chat + Focus + Token Polish

- Chat badges now show `Lite` for public and `Member` for logged-in/member mode.
- Removed `bald ✨`; disabled attachment label now reads `bald`.
- Added visible `focus-within` affordance around chat textareas while preserving the 16px mobile textarea guard.
- Tokenized touched danger states to `var(--status-error)`.
- Replaced broad `transition-all` in touched chat/header/card/filter controls with explicit transition properties.

### 28-06 — Verification + Docs

- Updated `packages/e2e-tools/tests/tools-app.spec.ts` for Phase-28 shell/member/card/chat/mobile coverage.
- Added screenshots under `.planning/phases/28-tools-app-website-alignment/screenshots/`.
- Added changeset `.changeset/phase-28-tools-app-website-alignment.md`.

## Validation

Commands run:

- `pnpm --filter @genai/tools-app exec tsc --noEmit` — passed
- `pnpm --filter @genai/e2e-tools exec tsc --noEmit` — passed
- `pnpm --filter @genai/tools-app test` — passed, 5 files / 19 tests
- `pnpm --filter @genai/e2e-tools exec playwright test tests/tools-app.spec.ts` with `TOOLS_URL=http://localhost:3001` — passed, 6/6
- `pnpm --filter @genai/tools-app build` — passed, all app routes dynamic where expected
- `pnpm build` — passed; website build replayed cached logs with existing NFT warning and missing Upstash env notices
- `git diff --check` — passed

Local production server used for E2E/visual QA:

- `pnpm --filter @genai/tools-app exec next start --port 3001`

No `apps/tools-app/app/layout.tsx`, `apps/tools-app/proxy.ts`, or `apps/tools-app/lib/csp.ts` changes were made, so the LEARNINGS/CSP special smoke gate was not triggered. Build still confirms Tools-App page routes remain `ƒ` dynamic.

## Visual QA Matrix

Screenshots captured:

- `screenshots/375-home-dark.png`
- `screenshots/375-home-light.png`
- `screenshots/375-chat-dark.png`
- `screenshots/375-chat-light.png`
- `screenshots/768-home-dark.png`
- `screenshots/768-home-light.png`
- `screenshots/1024-home-dark.png`
- `screenshots/1024-home-light.png`
- `screenshots/1440-home-dark.png`
- `screenshots/1440-home-light.png`
- `screenshots/1440-detail-dark.png`
- `screenshots/1440-detail-light.png`
- `screenshots/1440-login-dark.png`
- `screenshots/1440-settings-redirect-dark.png`

Observed checks:

- 375 dark/light: top bar remains logo + theme + burger, no search crowding.
- 375 chat dark/light: Kiwi opens chat, `Lite` badge visible, input focus ring visible, no sparkle label.
- 768 dark/light: header stays tablet-style, Member CTA and search/filter sequence remain readable.
- 1024 dark/light: tablet header avoids desktop nav wrapping; search is available near content.
- 1440 dark/light: desktop header/nav/search/CTA align with website rhythm; cards feel preview-length.
- 1440 detail: detail content keeps full summary/quick win and footer appears in scroll flow.
- `/settings` unauthenticated redirects to `/login`.

Console note: local production visual runs consistently log two Speed Insights errors for `/_vercel/speed-insights/script.js` 404/MIME in local `next start`. This is local Vercel-script behavior, not introduced by Phase 28 UI code.

## UI/UX Checklist Notes

Applied from `ui-ux-pro-max` checklist:

- Removed emoji-as-icon/decorative sparkle usage in launch-visible card/chat UI.
- Kept focus states visible for header controls, account menu, search, filter chips, cards, and chat input.
- Checked light/dark contrast through screenshots.
- Avoided crowded mobile header by moving search to the content surface.
- Grouped app actions separately from primary navigation.
- Replaced broad transitions in touched surfaces with explicit property transitions.

Rejected or overridden:

- Generic skill palette/font guidance was not used. Generation-AI brand docs remain binding.
- Floating navbar spacing guidance was not applied because this app uses the established fixed brand header.
- Heavy dialog dependency for mobile nav/account was rejected; simple stateful panel/menu matches existing app pattern and keeps bundle risk low.

## Known Limitations / Deferred

- Kiwi remains a temporary mascot experiment by decision D28-08.
- Full editorial rewrite of all tool data is deferred; this phase changes card presentation only.
- Full shared `packages/ui` header extraction is deferred.
- Some untouched auth/login/settings components still have legacy `transition-all`; this phase only cleaned touched chat/shell/card/filter surfaces.
- Local Speed Insights console errors remain in `next start`.

## Luca/Janna Visual UAT Focus

Check:

- Does the Tools-App feel like a Generation-AI website subpage rather than a dashboard?
- Is the `Member-Modus` CTA clear without feeling like a paid SaaS upsell?
- Are mobile/tablet header, search, filters, and Kiwi comfortable at 375/768/1024?
- Do preview cards feel concise enough while still inviting clicks?
- Does the account menu feel clean for logged-in users?

## Next Session Prompt

Review Phase 28 visually on local or preview. Focus on header parity, Member CTA wording, mobile/tablet search placement, card preview density, Kiwi/chat overlap, dark/light contrast, and footer placement on home/detail. If approved, proceed to launch-readiness UAT without changing Circle/signup gates or production deploy settings.
