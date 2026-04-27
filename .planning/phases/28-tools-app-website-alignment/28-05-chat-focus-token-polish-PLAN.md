---
phase: 28
plan: 05
slug: chat-focus-token-polish
status: completed
created: 2026-04-26
depends_on:
  - 28-02-account-menu-member-cta
  - 28-04-card-preview-emoji-cleanup
---

# 28-05 Plan — Chat + Focus + Token Polish

## Goal

Align chat UI language and focus states with the new member framing while keeping Kiwi and avoiding a full FloatingChat refactor.

## Files To Read

- `apps/tools-app/components/chat/FloatingChat.tsx`
- `apps/tools-app/components/chat/ChatInput.tsx`
- `apps/tools-app/components/chat/QuickActions.tsx`
- `apps/tools-app/components/ui/VoiceInputButton.tsx`
- `apps/tools-app/app/globals.css`
- `apps/tools-app/app/settings/page.tsx`
- `apps/tools-app/app/auth/callback/page.tsx`

## Implementation Tasks

### Task 1 — Badge copy

In `FloatingChat`, change visible badge:

- public mode: `Lite`
- member mode: `Member`

Do not rename mode values; `ChatMode` can remain `public | member`.

### Task 2 — Remove chat sparkle labels

Replace `bald ✨` with a clean label:

- `bald`
- or `kommt bald`

Use the shorter one if chip space is tight.

### Task 3 — Focus affordance for chat input

Current `.chat-textarea` removes focus outline. Keep iOS font-size guard, but make the wrapper show visible focus.

Preferred:

- Add `focus-within` classes to chat textarea wrapper:
  - `focus-within:ring-2`
  - `focus-within:ring-[var(--text)]` or DS-neutral equivalent
  - `focus-within:ring-offset-2`
  - ring offset uses `var(--bg-card)`/`var(--bg)` if needed
- Avoid brand-colored focus ring if it conflicts with DS focus rule.

Do not cause iOS viewport zoom. Keep `.chat-textarea` base font-size 16px on mobile.

### Task 4 — Tokenize touched danger states

Only in files touched naturally:

- Replace `bg-red-500`, `text-red-400`, `border-red-500/30`, `hover:bg-red-500/20` with `var(--status-error)` equivalents.
- If glow token does not exist, either use a conservative no-glow state or `color-mix` only if project already uses it. Do not introduce a broad token migration.

Known targets if in scope:

- `apps/tools-app/components/chat/ChatInput.tsx`
- `apps/tools-app/app/settings/page.tsx`
- `apps/tools-app/app/auth/callback/page.tsx`
- `apps/tools-app/components/layout/GlobalLayout.tsx` logout hover if still present after AccountMenu

### Task 5 — Explicit transitions in touched chat controls

Replace `transition-all` in touched chat sections with explicit transitions. Do not attempt full 1,100-line refactor.

Good mappings:

- icon buttons: `transition-[background-color,color,transform]`
- panel open/close wrappers: `transition-[opacity,transform,width,height]` only if those properties are actually changing
- text/icon color: `transition-colors`

## Acceptance Criteria

- No visible `Pro` badge in chat.
- No decorative sparkle in chat dropdown.
- Keyboard focus on chat textarea is visible.
- Touched danger states use semantic tokens.
- Kiwi still appears and opens chat.
- Chat open state still works on mobile and desktop.

## Verification

```bash
pnpm --filter @genai/tools-app exec tsc --noEmit
pnpm --filter @genai/tools-app test -- ChatInput QuickActions
```

Browser checks:

- 375 dark/light chat open.
- Type/focus chat textarea.
- Attachment dropdown opens; disabled PDF/Text label reads cleanly.
- Member/public badge copy if member login env is available.

## Defer

- Replacing Kiwi.
- Splitting `FloatingChat.tsx`.
- Adding new DS status glow tokens unless required by a touched bug.

