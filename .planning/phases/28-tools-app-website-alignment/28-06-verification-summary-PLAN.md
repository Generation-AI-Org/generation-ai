---
phase: 28
plan: 06
slug: verification-summary
status: completed
created: 2026-04-26
depends_on:
  - 28-01-shell-header-footer
  - 28-02-account-menu-member-cta
  - 28-03-search-mobile-navigation
  - 28-04-card-preview-emoji-cleanup
  - 28-05-chat-focus-token-polish
---

# 28-06 Plan — Verification + Summary

## Goal

Prove the Tools-App alignment pass works across public/member states, mobile/desktop, dark/light, home/detail/login/settings, and chat-open surfaces, and that it feels like the Generation-AI website rather than a cramped separate dashboard.

## Files To Read

- `packages/e2e-tools/tests/tools-app.spec.ts`
- `packages/e2e-tools/tests/visual-baseline.spec.ts`
- `packages/e2e-tools/tests/auth.spec.ts`
- `.planning/phases/28-tools-app-website-alignment/28-CONTEXT.md`
- `.planning/phases/28-tools-app-website-alignment/28-PLAN.md`
- `.codex/skills/ui-ux-pro-max/SKILL.md`

## Implementation Tasks

### Task 1 — Add/extend targeted E2E smoke

Create or update a tools-app alignment spec.

Coverage:

- Public home:
  - header nav has Tools active
  - legal not in desktop header
  - primary member CTA exists
  - footer legal links exist
  - card preview has no sparkle
- Mobile:
  - burger opens
  - nav items visible
  - public signup/login visible in burger or CTA surface
  - search control visible near content
- Chat:
  - chat opens
  - public badge says Lite
  - no `bald ✨`

Optional if env is available:

- Logged-in:
  - public CTAs hidden
  - account menu visible
  - Settings link exists
  - signout action exists

Use `TOOLS_URL` pattern from existing spec.

### Task 2 — Run validation commands

Minimum:

```bash
pnpm --filter @genai/tools-app exec tsc --noEmit
pnpm --filter @genai/tools-app test
pnpm --filter @genai/e2e-tools exec playwright test tests/tools-app.spec.ts
git diff --check
```

Preferred final:

```bash
pnpm build
```

If `pnpm build` is too slow/flaky, document why and run the narrower app build:

```bash
pnpm --filter @genai/tools-app build
```

### Task 3 — Browser visual QA

Start local tools dev or production server.

Capture/check:

- 375x812 dark home
- 375x812 light home
- 375x812 dark chat open
- 375x812 light chat open
- 768x1024 home
- 1024x768 home
- 1440x900 home
- 1440x900 detail `/chatgpt`
- `/login`
- `/settings` redirects to login if unauthenticated, or renders if authenticated

Look for:

- Header wrap/crowding
- Text overlap
- Footer cutoff
- Chat covering critical controls
- Focus ring visibility
- Card density and line clamp
- Light mode contrast
- Whitespace and hierarchy: page should feel calm, clear, and website-like.
- Control grouping: app actions should not compete with site navigation.

### Task 4 — UI/UX checklist pass

Use `ui-ux-pro-max` as a review checklist after implementation:

- responsive spacing
- focus affordance
- layout density
- hierarchy and scanability
- mobile control grouping
- animation/transition restraint

Document in `28-SUMMARY.md`:

- Applied recommendations
- Rejected recommendations with reason, especially if they conflict with Generation-AI brand docs
- Remaining UI risks for Luca/Janna UAT

### Task 5 — Write summary

Create `.planning/phases/28-tools-app-website-alignment/28-SUMMARY.md`.

Include:

- What changed by plan
- Commands run and results
- Browser/visual QA matrix
- UI/UX checklist notes
- Known limitations/deferred items
- Any screenshots paths if produced
- Copy-paste prompt for next recommended session

## Acceptance Criteria

- Typecheck green.
- Tests green or failures clearly documented as pre-existing/non-blocking.
- Visual QA matrix completed.
- `28-SUMMARY.md` exists.
- Phase is ready for Luca/Janna UAT.

## Final UAT Prompt

Review Tools-App Phase 28 on local/preview. Check: header matches website, legal is only footer/burger-low-priority, Member CTA makes sense, cards feel preview-only, Account menu feels clean, mobile search/filter are easy, Kiwi/chat still works, dark/light both feel like Generation AI.
