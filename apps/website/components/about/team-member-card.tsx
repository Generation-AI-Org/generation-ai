// TeamMemberCard — kleine Mitglieder-Kachel für About-Team-Section (Plan 21-03).
// Avatar + Name, dezenter Hover-Lift. Server Component (pure render).
//
// Hover rein via CSS/Tailwind (transition + transform). Globale
// `@media (prefers-reduced-motion: reduce)`-Regel in globals.css disablet
// transition — daher kein JS-Hook nötig.
//
// A11y: Avatar-Wrapper trägt aria-label "Platzhalter-Porträt von {name}",
// Name ist als <span> zusätzlich screenreader-visible.
//
// Tokens: DS-only (bg-bg-card, border-border, --border-accent, --dur-normal,
// --ease-out, text-text-secondary, font-sans).

import { PlaceholderAvatar } from "./placeholder-avatar"

type TeamMemberCardProps = {
  name: string
}

export function TeamMemberCard({ name }: TeamMemberCardProps) {
  return (
    <div
      className="rounded-2xl bg-bg-card border border-border px-4 py-6 flex flex-col items-center gap-3 text-center transition-all duration-300 ease-[var(--ease-out)] hover:border-[var(--border-accent)] hover:scale-[1.015] hover:shadow-[0_0_20px_var(--accent-glow)]"
    >
      <div aria-label={`Platzhalter-Porträt von ${name}`}>
        <PlaceholderAvatar name={name} size="md" />
      </div>
      <span className="font-sans text-[13px] font-normal text-text-secondary text-pretty">
        {name}
      </span>
    </div>
  )
}
