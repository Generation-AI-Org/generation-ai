// Placeholder-Avatar für Team-Section (Plan 21-03). Initialen aus `name`,
// keine Foto-Ladung (Foto-Swap kommt in Phase 27).
//
// Server Component — pure render, keine Hooks.
//
// Size-Map:
//   sm → 40px (Mobile-Kacheln)
//   md → 80px (Member-Kacheln Desktop)
//   lg → 120px (Founder-Karten, SPEC-Vorgabe)
//
// A11y: aria-hidden wird NICHT gesetzt — Consumer (TeamMemberCard, FounderCard)
// wrappt mit aria-label "Platzhalter-Porträt von {name}".
//
// Tokens: DS-only (bg-bg-elevated, border-border, text-text, font-mono).

type PlaceholderAvatarProps = {
  name: string
  size?: "sm" | "md" | "lg"
  className?: string
}

function getInitials(name: string): string {
  const trimmed = name.trim()
  if (!trimmed) return "?"
  const tokens = trimmed.split(/\s+/)
  if (tokens.length >= 2) {
    return (tokens[0][0] + tokens[1][0]).toUpperCase()
  }
  // Single-token fallback: first 1-2 chars
  return tokens[0].slice(0, 2).toUpperCase()
}

const sizeClasses: Record<NonNullable<PlaceholderAvatarProps["size"]>, string> = {
  sm: "h-10 w-10 text-sm",
  md: "h-20 w-20 text-xl",
  lg: "h-[120px] w-[120px] text-[28px]",
}

export function PlaceholderAvatar({
  name,
  size = "md",
  className,
}: PlaceholderAvatarProps) {
  const initials = getInitials(name)
  const sizeCls = sizeClasses[size]
  const base =
    "aspect-square rounded-full bg-bg-elevated border border-border flex items-center justify-center font-mono font-bold text-text tabular-nums"
  return (
    <div className={[base, sizeCls, className].filter(Boolean).join(" ")}>
      {initials}
    </div>
  )
}
