// PartnerPersonCard — Ansprechpartner-Karte mit PlaceholderAvatar.
//
// Reuses PlaceholderAvatar from Phase 21 (size "md" = 80px).
// LinkedIn URLs: href="#" + data-placeholder="linkedin" (D-07) — URLs delivered post-launch.
// Mail addresses: placeholder — confirm with Luca before go-live.
//
// A11y:
//   - Avatar wrapped with aria-label "Platzhalter-Porträt von {name}" (consistent with Phase 21)
//   - Mail link: aria-label="E-Mail an {name}"
//   - LinkedIn link: aria-label="LinkedIn-Profil von {name}"
//   - Card is not interactive container (div, not button/link)

import { motion, useReducedMotion } from "motion/react"
import { PlaceholderAvatar } from "@/components/about/placeholder-avatar"

export interface PartnerPersonData {
  name: string
  role: string
  mail: string
  linkedIn: string // "#" until delivered (D-07)
}

interface PartnerPersonCardProps {
  person: PartnerPersonData
}

export function PartnerPersonCard({ person }: PartnerPersonCardProps) {
  return (
    <div className="rounded-2xl border border-border bg-bg-card p-6 text-center transition-all duration-[var(--dur-normal)] ease-[var(--ease-out)] hover:border-[var(--border-accent)] hover:-translate-y-0.5">
      {/* Avatar */}
      <div
        className="mx-auto mb-4 w-fit"
        aria-label={`Platzhalter-Porträt von ${person.name}`}
      >
        <PlaceholderAvatar name={person.name} size="md" />
      </div>

      {/* Name */}
      <p
        className="font-sans font-bold text-text"
        style={{ fontSize: "var(--fs-h2)", lineHeight: "var(--lh-headline)" }}
      >
        {person.name}
      </p>

      {/* Role */}
      <p
        className="mt-1 text-text-muted"
        style={{ fontSize: "var(--fs-body)" }}
      >
        {person.role}
      </p>

      {/* Contact links */}
      <div className="mt-4 flex flex-col items-center gap-2">
        <a
          href={`mailto:${person.mail}`}
          aria-label={`E-Mail an ${person.name}`}
          className="font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-text-muted hover:text-[var(--accent)] transition-colors duration-[var(--dur-fast)]"
        >
          {person.mail}
        </a>
        <a
          href={person.linkedIn}
          aria-label={`LinkedIn-Profil von ${person.name}`}
          data-placeholder="linkedin"
          target="_blank"
          rel="noopener noreferrer"
          className="font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-text-muted hover:text-[var(--accent)] transition-colors duration-[var(--dur-fast)]"
        >
          LinkedIn →
        </a>
      </div>
    </div>
  )
}

// Person data — confirm mail addresses with Luca before launch (D-07)
const PARTNER_PERSONS: PartnerPersonData[] = [
  {
    name: 'Alex',
    role: 'Head of Partnerships',
    mail: 'alex@generation-ai.org',
    linkedIn: '#',
  },
  {
    name: 'Janna',
    role: 'Co-Founder',
    mail: 'janna@generation-ai.org',
    linkedIn: '#',
  },
  {
    name: 'Simon',
    role: 'Co-Founder',
    mail: 'simon@generation-ai.org',
    linkedIn: '#',
  },
]

export function PartnerPersonCards() {
  const prefersReducedMotion = useReducedMotion()

  const fadeIn = prefersReducedMotion
    ? {}
    : {
        initial: { opacity: 0, y: 16 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, margin: '-10% 0px' },
        transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const },
      }

  return (
    <div>
      {/* Eyebrow */}
      <motion.div
        {...fadeIn}
        className="mx-auto mb-5 flex items-center justify-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-text-muted"
      >
        <span
          aria-hidden="true"
          className="h-1.5 w-1.5 rounded-full"
          style={{ background: "var(--accent)", boxShadow: "0 0 8px var(--accent-glow)" }}
        />
        {"// direkter draht"}
      </motion.div>

      {/* Heading */}
      <motion.h2
        {...fadeIn}
        className="text-center font-sans font-bold text-text text-balance mb-8"
        style={{ fontSize: "var(--fs-h2)", lineHeight: "var(--lh-headline)" }}
      >
        Eure Ansprechpersonen
      </motion.h2>

      {/* Cards grid */}
      <motion.div
        {...fadeIn}
        className="grid grid-cols-1 sm:grid-cols-3 gap-4"
      >
        {PARTNER_PERSONS.map((person) => (
          <PartnerPersonCard key={person.name} person={person} />
        ))}
      </motion.div>
    </div>
  )
}
