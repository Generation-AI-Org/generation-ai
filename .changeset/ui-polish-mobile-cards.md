---
"@genai/tools-app": patch
---

UI polish pass for tools-app: mobile-parity animations, card hook, transient highlights.

- **Cards gain a `quick_win` hook.** The DB-backed `quick_win` string
  (already fetched, previously unrendered) now shows as an accent-
  colored one-liner beneath the summary — a concrete, promptable
  "so gehts" so cards feel like invitations rather than catalog rows.
- **Highlights are transient.** SessionStorage no longer re-applies
  `recommendedSlugs` from the last assistant message on mount, so
  highlights clear on refresh and on back-navigation from a detail
  page, matching the mental model that highlights are a fresh-
  response cue.
- **Mobile tap feedback everywhere.** `active:scale-95` / `scale-[0.98]`
  on cards, filter buttons, theme toggle, settings gear, login/logout,
  chat send/close/paperclip, voice toggle, and the detail-page CTA.
  `group-active:*` mirrors of the existing `group-hover:*` rotations
  so the sun/moon and settings gear spin on tap, not just hover.
- **Grey iOS tap-highlight killed** via `-webkit-tap-highlight-color:
  transparent` on all interactive elements — the scale feedback
  replaces it.
- **`prefers-reduced-motion` respected globally.** Transforms and
  animations collapse to near-zero duration; color/opacity
  transitions stay.

All CSS-only, transform/opacity only, no new deps.
