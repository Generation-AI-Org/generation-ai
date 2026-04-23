'use client'

// AboutTeamSection — Team-Section der /about-Seite (Plan 21-03).
//
// Layout: Eyebrow + H2 + Sub-Zeile + Gründer-Grid (2-col) + Mitglieder-Grid
// (bis 4-col).
//
// Daten: `team-data.ts` (founders + members). Komponenten-Composition aus
// Plan 21-01 (FounderCard, TeamMemberCard).
//
// Responsive:
//   - Founders: 1-col Mobile, 2-col Desktop (max-w-2xl zentriert)
//   - Members: 1-col Mobile, 2-col Tablet, 4-col Desktop (10 Items → 4+4+2)
//   - Container max-w-5xl (Team-Exception zur Standard-3xl, UI-SPEC §58-59)
//
// A11y: id="team"-Anker für Deep-Link /about#team. Heading semantisch h2,
// visuell --fs-h3-Size.
//
// Motion: fadeIn-Entry mit useReducedMotion-Gate.

import { motion, useReducedMotion } from "motion/react"
import { FounderCard } from "./founder-card"
import { TeamMemberCard } from "./team-member-card"
import { founders, members } from "./team-data"

export function AboutTeamSection() {
  const prefersReducedMotion = useReducedMotion()

  const fadeIn = prefersReducedMotion
    ? {}
    : {
        initial: { opacity: 0, y: 16 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, margin: "-10% 0px" },
        transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const },
      }

  return (
    <section
      id="team"
      aria-labelledby="about-team-heading"
      data-section="about-team"
      className="relative bg-bg py-24 sm:py-32 border-b border-border"
    >
      <div className="mx-auto max-w-5xl px-6">
        {/* Eyebrow */}
        <motion.div
          {...fadeIn}
          className="mx-auto mb-5 flex items-center justify-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-text-muted"
        >
          <span
            aria-hidden="true"
            className="h-1.5 w-1.5 rounded-full"
            style={{
              background: "var(--accent)",
              boxShadow: "0 0 8px var(--accent-glow)",
            }}
          />
          {"// wer dahintersteckt"}
        </motion.div>

        {/* H2 — semantisch, visuell --fs-h3 */}
        <motion.h2
          {...fadeIn}
          id="about-team-heading"
          className="text-center font-sans font-bold text-text text-balance"
          style={{
            fontSize: "var(--fs-h3)",
            lineHeight: "var(--lh-sub)",
          }}
        >
          Wir sind Generation AI.
        </motion.h2>

        {/* Sub-Zeile */}
        <motion.div
          {...fadeIn}
          className="mt-4 text-center font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-text-muted tabular-nums"
        >
          Stand: April 2026 · Wir wachsen.
        </motion.div>

        {/* Gründer-Grid: 1-col Mobile, 2-col Desktop */}
        <motion.div
          {...fadeIn}
          className="mt-14 grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl mx-auto"
        >
          {founders.map((founder) => (
            <FounderCard
              key={founder.name}
              name={founder.name}
              role={founder.role}
              bio={founder.bio}
              linkedinUrl={founder.linkedinUrl}
            />
          ))}
        </motion.div>

        {/* Mitglieder-Grid: 1 → 2 → 4 cols */}
        <motion.div
          {...fadeIn}
          className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {members.map((member) => (
            <TeamMemberCard key={member.name} name={member.name} />
          ))}
        </motion.div>
      </div>
    </section>
  )
}
