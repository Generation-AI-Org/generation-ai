---
phase: 28
plan: 04
slug: card-preview-emoji-cleanup
status: completed
created: 2026-04-26
depends_on:
  - 28-01-shell-header-footer
---

# 28-04 Plan — Card Preview + Emoji Cleanup

## Goal

Make tool cards feel like clean previews: less text, clear reason to click, no decorative sparkle, and more visual breathing room.

## Files To Read

- `apps/tools-app/components/library/ContentCard.tsx`
- `apps/tools-app/components/library/CardGrid.tsx`
- `apps/tools-app/lib/types.ts`
- `apps/tools-app/app/[slug]/page.tsx`
- `apps/tools-app/scripts/seed-v2.ts` only for understanding fields, not editing

## Implementation Tasks

### Task 1 — Remove card sparkle

Remove the decorative `✨` from `ContentCard`.

Replace with either:

- no icon, or
- a small functional inline SVG/Lucide-style arrow/spark-free marker using `currentColor`.

Prefer no icon unless the row loses scannability.

### Task 2 — Add preview helper

Implement a small helper, either inside `ContentCard.tsx` or new `apps/tools-app/components/library/card-preview.ts`.

Purpose:

- Produce short visible preview copy from existing fields.
- Do not mutate data.
- Prefer `quick_win` as the "why click" source.
- Fall back to `summary`.
- Normalize overly long text for cards.

Suggested behavior:

- Strip wrapping quotes only if trivial.
- Remove leading repetitive phrases if they are not useful.
- Keep German punctuation and umlauts.
- Limit visible card text with CSS `line-clamp-2`.
- Avoid substring logic that breaks words. If truncating in JS, truncate by sentence or word boundary.

Simpler acceptable implementation:

- Keep raw text, but display only one/two lines with `line-clamp-2`.
- Hide full summary on card if quick_win exists.
- Preserve full summary on detail page.

### Task 3 — Reduce visible card density

Card target:

- Logo
- Pricing badge
- Title
- Category
- One compact preview/why-click line

Remove or de-emphasize the long summary on card. If summary remains, it must be one short line and secondary to the why-click text.

Do not change detail page content.

Whitespace target:

- Cards should feel easier to scan than current baseline.
- Prefer fewer text blocks with stronger hierarchy over squeezing summary plus quick-win.
- Keep grid density practical: do not turn each card into a large marketing tile.

### Task 4 — Card layout stability

Ensure cards have stable minimum height and hover does not shift layout.

Use explicit transitions:

- `transition-[transform,box-shadow,border-color,background-color]`
- `duration-300`
- `ease-[var(--ease-out)]` where available

### Task 5 — Search/filter still works

Search should continue indexing title, summary, category, quick_win as before. This plan changes presentation, not search semantics.

## Acceptance Criteria

- `rg "✨|🚀|🔥|🎉" apps/tools-app/components apps/tools-app/app` returns no launch-visible decorative UI occurrences, except documented non-UI content if any.
- Tool cards show preview-length copy.
- Tool cards feel calmer and less text-heavy than the current baseline.
- Tool detail pages still show fuller summaries and quick wins.
- Card grid remains responsive at 375, 768, 1440.

## Verification

```bash
pnpm --filter @genai/tools-app exec tsc --noEmit
pnpm --filter @genai/tools-app test -- ContentCard
```

If no component test exists, add a focused test if lightweight. Otherwise document manual DOM/visual verification.

Browser checks:

- `/` first 6 cards in dark and light.
- Search for `Claude` still filters/highlights correctly.
- Detail route `/chatgpt` still has full content.

## Defer

- Full editorial rewrite of all tools.
- Supabase seed changes.
