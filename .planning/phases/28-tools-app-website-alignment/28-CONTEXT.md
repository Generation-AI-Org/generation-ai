---
phase: 28
slug: tools-app-website-alignment
type: context
status: completed
created: 2026-04-26
last-updated: 2026-04-26
depends_on:
  - phase 27 copy-pass-and-launch-cleanup
branch: feature/phase-28-tools-app-website-alignment
promoted_from:
  - roadmap backlog 999.3
---

# Phase 28 — Tools-App Website Alignment

> Die Tools-App soll sich wie ein Teil der Generation-AI-Website anfühlen, nicht wie ein separates Produkt. Header, Navigation, Footer, CTA-Sprache, Card-Dichte, Whitespace und Mobile/Desktop-Verhalten werden auf Website-Parität gebracht. Die App-Funktionen bleiben erhalten und sollen hochwertiger wirken.

---

## Mission

Nach Phase 27 ist die Website launch-nah, aber die Tools-App driftet visuell und strukturell noch ab: eigener Header, Legal-Links oben, lange Tool-Cards, "Lite/Pro"-SaaS-Sprache, Emoji-Drift, App-Controls im selben Raum wie Hauptnavigation, dichter Dashboard-Rhythmus. Diese Phase baut den öffentlichen Tools-App-Rahmen so um, dass `tools.generation-ai.org` wie eine Website-Unterseite mit eingebauter Tool-Bibliothek wirkt: ruhiger, luftiger, hochwertiger, mit klaren Funktionen statt voller Oberfläche.

Der Umbau soll autonom ausführbar sein. Alle strategischen Entscheidungen aus Luca/Janna-Scope sind in diesem Kontext gelockt.

---

## Source Context

Read before executing:

- `.planning/STATE.md`
- `.planning/AGENT-DESIGN-VOICE.md`
- `.planning/phases/27-copy-pass-and-launch-cleanup/27-UI-UX-PRO-MAX-AUDIT.md`
- `.codex/skills/ui-ux-pro-max/SKILL.md` (use as UX/polish checklist, not as brand palette)
- `apps/tools-app/AGENTS.md`
- `apps/website/AGENTS.md`
- `brand/Generation AI Design System/README.md`
- `brand/Generation AI Design System/DESIGN.md`
- `packages/config/tailwind/base.css`

If execution touches `apps/tools-app/proxy.ts`, `apps/tools-app/lib/csp.ts`, or `apps/tools-app/app/layout.tsx`, first read `LEARNINGS.md` and run the local production CSP smoke per `apps/tools-app/AGENTS.md`.

---

## Locked Product Decisions

- **D28-01 — Tools-App is part of the website.** Treat the tools domain as a Generation-AI website surface with app functionality, not a separate SaaS dashboard.
- **D28-02 — Header parity over bespoke header.** The Tools-App header must mirror the website header structure and visual language as closely as possible.
- **D28-03 — App controls are separate from primary navigation.** Search, theme toggle, account/settings/logout are app actions, not top-level site nav.
- **D28-04 — Legal leaves the header.** `Impressum` and `Datenschutz` must not appear in the desktop header action row. They belong in the footer and, on mobile, may also appear in a low-priority burger section.
- **D28-05 — Account menu now, not later.** Logged-in Tools-App state uses an account menu/dropdown/sheet section instead of loose Settings + Logout icons.
- **D28-06 — Avoid "Pro" as primary vocabulary.** Signup is free and includes community access. Use `Member`, `Member-Modus`, or `Mitgliedermodus`, not SaaS-like `Pro`, except in code identifiers if renaming would add risk.
- **D28-07 — Public CTA must explain why signup matters.** Public users should understand that membership gives Community, Events, and stronger assistant recommendations.
- **D28-08 — Kiwi stays for now.** Kiwi remains as the current chat button/mascot experiment. Do not replace it with Prisma in this phase. Tokenize only if touched naturally.
- **D28-09 — Decorative emojis are out.** Remove sparkle/decorative UI emojis from cards and chat labels. Keep only functional icons/SVG/Lucide.
- **D28-10 — Cards are previews.** Tool cards should show enough to invite a click, not explain the whole tool. Detailed copy belongs on the detail page.
- **D28-11 — Tool data copy pass is later.** Do not rewrite all Supabase seed/data content in this phase. Build card presentation so future editorial cleanup is easy.
- **D28-12 — Mobile and desktop both count.** Do not optimize only the desktop header. Validate mobile nav, filter/search, footer, and chat-open state.
- **D28-13 — Same feeling as website.** The Tools-App should inherit the website's editorial-tech calm: enough whitespace, clear hierarchy, no overloaded dashboard density.
- **D28-14 — UI/UX skill is required input.** Use `ui-ux-pro-max` as a planning/review checklist during execution. Its generic palette/font suggestions are not authoritative; Generation-AI brand docs remain source of truth.
- **D28-15 — Functions can be richer, surface should stay calmer.** Better functionality must not mean more clutter. Hide secondary controls until needed, group related actions, and preserve scanability.

---

## Scope

### In Scope

1. **Tools-App Header Alignment**
   - Match website header height, max-width, logo behavior, brand band, nav order, nav typography, active Tools state.
   - Remove standalone `KI-Tools` label from header.
   - Keep same-tab `Tools` domain behavior.
   - Keep theme toggle microinteraction aligned with website.

2. **Navigation + App Actions**
   - Desktop primary nav mirrors website: `Tools`, `Events`, `Community`, `Für Partner`, `Über uns`.
   - Search remains an app action; desktop can keep icon/button in right action cluster.
   - Mobile primary nav lives in burger/sheet/panel; app search should be available near the filter/content surface, not competing with primary nav.

3. **Logged-Out CTA / Member Mode**
   - Replace `Pro` framing with `Member`/`Member-Modus`.
   - Add a compact public benefit surface explaining:
     - Community-Zugang
     - Events
     - stärkeren KI-Assistenten
     - tiefere Empfehlungen
   - Primary CTA: `Kostenlos Mitglied werden`
   - Secondary CTA: `Bereits Mitglied? Einloggen`

4. **Logged-In Account Menu**
   - Replace loose settings/logout icons with one account control.
   - Desktop menu items:
     - `Einstellungen`
     - `Community öffnen`
     - `Abmelden`
   - Mobile burger account section mirrors those actions.
   - Signout remains a POST form to `/auth/signout`.

5. **Footer**
   - Add a compact Tools-App footer consistent with website footer.
   - Include logo/claim, main discovery links, legal links, contact.
   - Footer must live in the scrollable content flow and not be fixed.
   - Legal pages remain bare/no chat per existing route rules unless explicitly changed by plan.

6. **Cards as Preview**
   - Remove decorative sparkle from quick-win rows.
   - Reduce visible card copy to a short `Warum klicken?` style preview.
   - Preserve search/filter/highlight behavior.
   - Do not mutate DB content or seed files unless a type/helper requires it.

7. **Chat Surface Alignment**
   - Kiwi remains.
   - Badge copy changes from `Pro` to `Member`.
   - `Lite` may stay for public chat if visually paired with `Member`.
   - Remove decorative `bald ✨` labels.
   - Improve chat textarea/input focus affordance without breaking iOS 16px textarea rule.

8. **Transition / Focus / Token Cleanup in Touched Files**
   - Replace `transition-all` only in files touched by this phase.
   - Tokenize obvious `red-*` danger states touched by account/settings/header work.
   - Do not run an indiscriminate repo-wide transition pass.

9. **QA**
   - Typecheck Tools-App.
   - Targeted E2E or smoke tests for header/nav/footer/cards/chat.
   - Manual or automated visual QA at 375, 768, 1024, 1440 in dark and light.
   - Verify chat open state does not cover critical nav/footer content incorrectly.

10. **Whitespace / Interface Quality Pass**
   - Increase breathing room where the app currently feels cramped.
   - Prefer fewer visible controls per row, clearer grouping, and calmer hierarchy.
   - Keep cards and panels visually aligned with website rhythm.
   - Do not make the UI sparse to the point that the tool grid becomes inefficient.
   - Validate with `ui-ux-pro-max` checklist plus browser screenshots.

### Out of Scope

- Replacing Kiwi with Prisma or a final mascot identity.
- Full `packages/ui` shared Header extraction across both apps.
- Full Tools database/editorial rewrite.
- Full FloatingChat architectural refactor.
- Performance bundle phase.
- Production deploy, push, or signup enablement.
- Circle API changes.

---

## Requirements

| ID | Requirement |
|---|---|
| R28-01 | Tools-App desktop header visually matches website header framework: fixed/brand band, 80px height on desktop, max-w-7xl inner nav, same logo scale behavior, same nav order. |
| R28-02 | `Impressum` and `Datenschutz` are absent from the desktop header and present in the footer. |
| R28-03 | Public desktop header exposes a clear signup CTA and login secondary path without wrapping at common widths. |
| R28-04 | Public mobile nav exposes primary nav plus signup/login CTAs without crowding the top bar. |
| R28-05 | Logged-in desktop state exposes a single account menu with Settings, Community, and POST signout. |
| R28-06 | Logged-in mobile state exposes an Account section with Settings, Community, and POST signout. |
| R28-07 | Header search remains available on desktop; mobile search is available near the tools filter/content area. |
| R28-08 | Footer appears on Tools home and detail pages in the scrollable content flow, in both mobile and desktop. |
| R28-09 | Tool cards do not show decorative emojis and visible copy is preview-length. |
| R28-10 | Detail pages keep fuller summary/quick-win content; card truncation does not destroy detail content. |
| R28-11 | Public chat badge uses `Lite`; logged-in chat badge uses `Member`, not `Pro`. |
| R28-12 | Member CTA copy says Community + Events + stronger assistant / deeper recommendations. |
| R28-13 | Focus-visible affordance remains obvious on keyboard for header actions, account menu, search, filter chips, cards, and chat input. |
| R28-14 | Touched components avoid broad `transition-all` where explicit transitions are practical. |
| R28-15 | Dark and light modes both pass visual smoke for header, hero, cards, CTA, footer, chat open. |
| R28-16 | No changes to production env, deploy config, Circle tokens, or signup gate. |
| R28-17 | Tools home has visibly more breathing room than current baseline: header/hero/filter/card/CTA spacing feels like a website surface, not a cramped dashboard. |
| R28-18 | UI/UX review notes from `ui-ux-pro-max` are either applied or explicitly rejected because they conflict with Generation-AI brand docs. |
| R28-19 | New/changed controls are grouped by purpose and secondary actions are visually quieter than primary actions. |

---

## Copy Contract

### Member CTA

Recommended public CTA block:

- Eyebrow: `Member-Modus`
- Headline: `Mehr aus den Tools rausholen.`
- Body: `Als Mitglied bekommst du Community-Zugang, Events und einen stärkeren KI-Assistenten mit tieferen Empfehlungen.`
- Chips: `Community`, `Events`, `Bessere Empfehlungen`, `Stärkerer Assistent`
- Primary: `Kostenlos Mitglied werden`
- Secondary: `Bereits Mitglied? Einloggen`

If the layout is very compact, use:

`Mitglied werden für Community, Events und bessere KI-Empfehlungen.`

### Chat Badge

- Public: `Lite`
- Member: `Member`

### Card Preview

Card copy should answer why the user should click. Preferred format:

`Für [Use Case]: [konkreter Nutzen in einem Satz].`

Do not add this exact prefix mechanically if it reads awkwardly. The implementation may derive from `quick_win`/`summary` for now and clamp to two lines.

---

## Likely Files

Expected implementation files:

- `apps/tools-app/components/layout/GlobalLayout.tsx`
- `apps/tools-app/components/layout/ConditionalGlobalLayout.tsx`
- `apps/tools-app/components/HomeLayout.tsx`
- `apps/tools-app/components/tools-hero.tsx`
- `apps/tools-app/components/library/ContentCard.tsx`
- `apps/tools-app/components/library/CardGrid.tsx`
- `apps/tools-app/components/library/FilterBar.tsx`
- `apps/tools-app/components/chat/FloatingChat.tsx`
- `apps/tools-app/components/chat/ChatInput.tsx`
- `apps/tools-app/components/ui/StatusPill.tsx`
- `apps/tools-app/app/globals.css`
- `packages/e2e-tools/tests/tools-app*.spec.ts`

Possible new files:

- `apps/tools-app/components/layout/ToolsFooter.tsx`
- `apps/tools-app/components/layout/AccountMenu.tsx`
- `apps/tools-app/components/layout/ToolsHeader.tsx` if extraction from `GlobalLayout.tsx` keeps the file maintainable
- `apps/tools-app/components/member-cta.tsx`
- `apps/tools-app/components/library/card-preview.ts`

Avoid touching:

- `apps/tools-app/app/layout.tsx` unless absolutely needed
- `apps/tools-app/proxy.ts`
- `apps/tools-app/lib/csp.ts`

---

## Risks And Mitigations

| Risk | Mitigation |
|---|---|
| Header rewrite breaks logged-in auth regression | Keep `mode` prop as source of truth; add/extend E2E for public/member branches. |
| Footer conflicts with `h-screen overflow-hidden` app shell | Put footer inside the scrollable content container, not outside the scroll flow. |
| Whitespace pass makes the app inefficient | Use visual QA at mobile and desktop; keep grid density reasonable while increasing section rhythm. |
| Generic UI skill conflicts with brand | Treat skill output as checklist only; brand docs override palette, type, logo, voice, and motion. |
| Account menu adds dependency or focus complexity | Prefer existing simple React state pattern unless a local primitive already exists. Ensure Escape/outside-click if feasible. |
| Mobile top bar overcrowds | Move app search to filter/content area on mobile; keep top bar logo, theme, account/burger only. |
| Card truncation hides useful detail | Keep detail page unchanged; card preview is only the teaser. |
| `Pro` code identifiers are risky to rename | UI text must change; internal variable names may remain if renaming adds churn. |
| Visual QA misses chat overlay | Explicit QA matrix includes chat open at 375 and 768. |

---

## Definition Of Done

- Phase 28 plan files exist and execution can proceed without strategic questions.
- Tools-App public and member headers are website-aligned.
- Tools-App home feels calmer and more spacious without losing utility.
- Legal links are in footer/mobile low-priority area, not desktop header.
- Public users see a clear membership path with honest benefits.
- Logged-in users get a clean account menu.
- Tool cards are compact preview cards with no decorative emoji.
- Chat badge and disabled labels no longer use `Pro`/sparkle drift.
- Typecheck/build/tests/visual smoke documented in `28-SUMMARY.md`.
