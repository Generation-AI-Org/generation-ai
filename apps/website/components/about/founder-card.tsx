// FounderCard — prominente Gründer-Karte für About-Team-Section (Plan 21-03).
// Avatar (lg, 120px) + Name + Rolle + Bio + optional LinkedIn-Icon.
//
// Server Component (pure render, keine Hooks). Hover-State rein via CSS.
//
// LinkedIn-Icon:
//   - `lucide-react@1.8.0` exportiert KEIN `Linkedin`-Icon (Version zu alt)
//   - Plan erlaubt Inline-SVG-Fallback → eigenes LinkedIn-Logo hier inline
//   - Conditional Rendering: linkedinUrl undefined → Icon wird NICHT gerendert (D-06)
//
// A11y:
//   - aria-label auf Avatar-Wrapper ("Platzhalter-Porträt von {name}")
//   - aria-label auf LinkedIn-Link ("LinkedIn-Profil von {name}")
//   - Icon selbst ist aria-hidden
//   - target="_blank" + rel="noopener noreferrer" (Clickjacking-Schutz)
//
// Layout:
//   - Vertikaler Stack, items-center, text-center
//   - min-h-[320px] verhindert Layout-Shift bei unterschiedlich langen Bios
//
// Tokens: DS-only.

import Link from "next/link"
import { PlaceholderAvatar } from "./placeholder-avatar"

type FounderCardProps = {
  name: string
  role: string
  bio: string
  linkedinUrl?: string
}

function LinkedinGlyph({ className }: { className?: string }) {
  // Simple Corporate-LinkedIn-Glyph, currentColor für Theme-Awareness.
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className={className}
    >
      <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.13 1.44-2.13 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13ZM7.12 20.45H3.56V9h3.56v11.45ZM22.22 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.45c.99 0 1.78-.77 1.78-1.72V1.72C24 .77 23.21 0 22.22 0Z" />
    </svg>
  )
}

export function FounderCard({
  name,
  role,
  bio,
  linkedinUrl,
}: FounderCardProps) {
  return (
    <div className="rounded-2xl bg-bg-card border border-border px-6 py-8 flex flex-col items-center gap-4 text-center min-h-[320px] max-w-sm transition-all duration-300 ease-[var(--ease-out)] hover:border-[var(--border-accent)] hover:scale-[1.015] hover:shadow-[0_0_20px_var(--accent-glow)]">
      <div aria-label={`Platzhalter-Porträt von ${name}`}>
        <PlaceholderAvatar name={name} size="lg" />
      </div>
      <div className="flex flex-col items-center gap-1">
        <span className="font-sans text-base font-bold text-text">{name}</span>
        <span className="font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-text-muted">
          {role}
        </span>
      </div>
      <p className="font-sans text-[14px] font-normal leading-[1.55] text-text-secondary text-pretty">
        {bio}
      </p>
      {linkedinUrl ? (
        <Link
          href={linkedinUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`LinkedIn-Profil von ${name}`}
          className="mt-auto inline-flex items-center justify-center w-10 h-10 rounded-full text-text-muted hover:text-[var(--accent)] transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
        >
          <LinkedinGlyph className="w-5 h-5" />
        </Link>
      ) : null}
    </div>
  )
}
