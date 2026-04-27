---
phase: 28
slug: tools-app-website-alignment
type: discussion-log
status: locked
created: 2026-04-26
---

# Phase 28 Discussion Log — Tools-App Website Alignment

## Source Conversation Summary

Luca wants the Tools-App to feel like Generation AI, not a detached SaaS/dashboard. The app should be cleaner, more spacious, more aligned with the public website, and still functionally stronger.

This log captures product/design decisions that are locked before autonomous implementation.

## Locked Decisions

| ID | Decision | Rationale |
|---|---|---|
| D28-01 | Treat Tools-App as a Website-Unterseite with app functionality. | Users may land on tools first; it must still explain and feel like Generation AI. |
| D28-02 | Mirror website header/navigation. | Current header looks app-specific and drifts from website. |
| D28-03 | Remove Legal from desktop header. | `Impressum`/`Datenschutz` are footer/burger-low-priority links, not primary actions. |
| D28-04 | Add compact website-consistent footer. | Legal/contact/discovery need a home and should match website expectations. |
| D28-05 | Build account menu now. | Loose Settings/Logout icons are less polished; doing it properly now avoids another Launch compromise. |
| D28-06 | Use Member/Member-Modus instead of Pro. | Membership is free; `Pro` implies paid SaaS. |
| D28-07 | Member value = Community + Events + stronger assistant + deeper recommendations. | This matches actual product promise and website conversion narrative. |
| D28-08 | Keep Kiwi for now. | Mascot/Prisma identity is a future creative decision; do not block shell alignment on it. |
| D28-09 | Remove decorative emojis. | Brand docs ban decorative UI emojis; sparkle drift makes the app feel less premium. |
| D28-10 | Cards are previews. | Cards should answer why to click, not explain the whole tool. Detail pages carry fuller content. |
| D28-11 | Do not rewrite all tool data now. | Structure first; editorial pass over all tools can happen before launch or separately. |
| D28-12 | Search mobile near content/filter, desktop as app action. | Keeps primary navigation clean and avoids crowding mobile header. |
| D28-13 | More whitespace, calmer hierarchy. | The interface should feel like the website: clear, spacious, not overcrowded. |
| D28-14 | Use `ui-ux-pro-max` as checklist, not brand source. | Skill helps catch UX/density/focus issues; Generation-AI brand remains authoritative. |

## Copy Decisions

### Public Member CTA

Use this as the default:

- Eyebrow: `Member-Modus`
- Headline: `Mehr aus den Tools rausholen.`
- Body: `Als Mitglied bekommst du Community-Zugang, Events und einen stärkeren KI-Assistenten mit tieferen Empfehlungen.`
- Chips: `Community`, `Events`, `Bessere Empfehlungen`, `Stärkerer Assistent`
- Primary: `Kostenlos Mitglied werden`
- Secondary: `Bereits Mitglied? Einloggen`

### Chat Badge

- Public: `Lite`
- Logged-in/member: `Member`

Avoid visible `Pro`.

## Open Questions Resolved

### Does Tools-App need a footer?

Yes, but compact. It should match the website's expectations without becoming a giant marketing footer inside an app.

### Should Account Menu be deferred?

No. Implement now if feasible. It is not inherently large and materially improves polish.

### Should Kiwi be removed?

No. Keep Kiwi for now. Only remove decorative emoji and reduce brand drift around it.

### Should card source content be rewritten?

No. This phase changes presentation and structure. Full editorial content cleanup can happen later.

## Implementation Bias

- Prefer a few high-quality surfaces over adding more visible controls.
- Add functions where useful, but hide/group secondary controls.
- Validate with real screenshots, not only typecheck.
- Use the same website feeling as the standard: editorial-tech, calm, confident, spacious.

