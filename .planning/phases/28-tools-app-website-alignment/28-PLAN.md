---
phase: 28
slug: tools-app-website-alignment
type: plan
status: completed
created: 2026-04-26
branch: feature/phase-28-tools-app-website-alignment
depends_on:
  - phase 27 complete on develop
---

# Phase 28 Plan — Tools-App Website Alignment

## Goal

Make `tools.generation-ai.org` feel like a polished Generation-AI website surface with app functionality: website-parity header, clean app actions, compact footer, member-mode CTA, account menu, preview-first tool cards, calmer whitespace, and mobile/desktop QA.

This phase does not deploy production and does not change Circle/signup backend behavior.

## Inputs

- `.planning/phases/28-tools-app-website-alignment/28-CONTEXT.md`
- `.planning/phases/27-copy-pass-and-launch-cleanup/27-UI-UX-PRO-MAX-AUDIT.md`
- `.planning/AGENT-DESIGN-VOICE.md`
- `apps/tools-app/AGENTS.md`
- `apps/website/AGENTS.md`
- `apps/website/components/layout/header.tsx`
- `apps/website/components/layout/footer.tsx`
- `.codex/skills/ui-ux-pro-max/SKILL.md`
- `brand/Generation AI Design System/README.md`
- `brand/Generation AI Design System/DESIGN.md`
- `packages/config/tailwind/base.css`

## Execution Strategy

Run the plans in order. They are intentionally scoped so each can be committed and verified independently.

1. `28-01` Shell foundation: header parity + footer.
2. `28-02` Account menu + member CTA.
3. `28-03` Search/filter placement and mobile nav polish.
4. `28-04` Card preview and emoji cleanup.
5. `28-05` Chat/member badge/focus/token polish.
6. `28-06` Tests, visual QA, docs, summary.

Do not skip to visual polish before the shell and account model are stable.

Before implementation, use `ui-ux-pro-max` as a quality checklist for education/community app UX, responsive layout, spacing, focus, and clarity. Reject any generated palette/font/style recommendation that conflicts with Generation-AI brand docs.

## Non-Negotiables

- Kiwi remains.
- No decorative emoji in UI labels/cards.
- UI text says `Member`/`Member-Modus`, not `Pro`.
- Legal links are not in desktop header.
- Header mirrors website nav order and visual hierarchy.
- Interface must feel calmer and more spacious than the current Tools-App baseline.
- Do not add visible feature explanations or clutter just because functionality is richer.
- No live-service writes, deploys, pushes, or env changes.
- Do not touch `apps/tools-app/app/layout.tsx`, `proxy.ts`, or `lib/csp.ts` unless absolutely necessary; if necessary, read `LEARNINGS.md` first.

## Plan Index

| Plan | Name | Purpose | Main Files |
|---|---|---|---|
| 28-01 | Shell/Header/Footer Foundation | Website-parity frame | `GlobalLayout`, new `ToolsFooter`, possibly `ToolsHeader` |
| 28-02 | Account Menu + Member CTA | Clean public/member conversion and logged-in controls | `AccountMenu`, `MemberCTA`, `GlobalLayout`, `HomeLayout` |
| 28-03 | Search + Mobile Navigation | Put search/filter in the right place on mobile/desktop | `HomeLayout`, `FilterBar`, `GlobalLayout` |
| 28-04 | Card Preview + Emoji Cleanup | Make cards shorter and remove sparkle drift | `ContentCard`, helper, tests |
| 28-05 | Chat + Focus + Token Polish | Member badge, no sparkle labels, focus affordance | `FloatingChat`, `ChatInput`, globals |
| 28-06 | Verification + Docs | E2E/visual QA, UI/UX checklist, summary, launch notes | `packages/e2e-tools`, phase docs |

## Cross-Plan Acceptance

- `pnpm --filter @genai/tools-app exec tsc --noEmit`
- `pnpm --filter @genai/tools-app test`
- `pnpm --filter @genai/e2e-tools exec playwright test tests/tools-app.spec.ts` or a new targeted spec when local server is available
- `pnpm build` before final summary if runtime budget allows
- `git diff --check`
- Browser screenshots or documented manual checks:
  - 375x812 dark/light home
  - 375x812 dark/light chat open
  - 768x1024 dark/light home
  - 1024x768 desktop/tablet
  - 1440x900 desktop
- `/login`
- a detail route such as `/chatgpt`
- Document whether the page feels like the website: whitespace, hierarchy, density, and control grouping.

## Definition Of Done

- All six plan summaries are captured in `28-SUMMARY.md`.
- No known header/footer/card/chat alignment blocker remains.
- Any deferred items are explicitly listed with reason.
- Phase can be handed to Luca/Janna for visual UAT.

## Copy-Paste Prompt For Autonomous Execution

Continue Phase 28 in `/Users/lucaschweigmann/projects/generation-ai`. Read `.planning/STATE.md`, `.planning/phases/28-tools-app-website-alignment/28-CONTEXT.md`, `.planning/phases/28-tools-app-website-alignment/28-PLAN.md`, `.planning/AGENT-DESIGN-VOICE.md`, `apps/tools-app/AGENTS.md`, `apps/website/AGENTS.md`, `brand/Generation AI Design System/README.md`, `brand/Generation AI Design System/DESIGN.md`, `packages/config/tailwind/base.css`, and `.codex/skills/ui-ux-pro-max/SKILL.md`. Execute `28-01` through `28-06` in order. Do not replace Kiwi. Remove decorative emoji. Use Member/Member-Modus copy instead of Pro. Make the interface calmer, more spacious, and more website-like without hiding core functionality. Do not push, deploy, or touch live services.
