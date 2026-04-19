'use client'

import { useReducedMotion } from "motion/react"
import { Marquee } from "@/components/ui/marquee"

// Plan 20-05 Task 2 — R1.8 / D-14
// Stub-Logos (Sparringspartner-Assets sind Deferred, CONTEXT.md "Deferred Ideas") als Text-Pills.
// Marquee bleibt IMMER im DOM → CSS-Guard in globals.css pausiert `.animate-marquee`
// bei prefers-reduced-motion (Plan 01 reduced-motion guard). Zusätzlich JS-Gate via
// useReducedMotion() als belt-and-braces: setzt pauseOnHover + schaltet optional reverse ab.
const stubPartners = [
  "Sparringspartner 1",
  "Sparringspartner 2",
  "Sparringspartner 3",
  "Sparringspartner 4",
  "Sparringspartner 5",
  "Sparringspartner 6",
] as const

function PartnerTile({ name }: { name: string }) {
  return (
    <div className="mx-4 inline-flex items-center justify-center min-w-[180px] h-16 rounded-xl border border-border bg-bg-card px-6">
      <span className="font-mono text-xs uppercase tracking-wider text-text-muted whitespace-nowrap">
        {name}
      </span>
    </div>
  )
}

export function TrustSection() {
  // JS-side reduced-motion detection — CSS-Guard in globals.css pausiert die
  // `.animate-marquee` Keyframes bereits; dieser Hook ist Doppel-Sicherung und
  // kann genutzt werden um z.B. pauseOnHover zu erzwingen.
  const prefersReducedMotion = useReducedMotion()

  return (
    <section
      aria-labelledby="trust-heading"
      data-section="trust"
      className="bg-bg-elevated py-20 border-b border-border"
    >
      <div className="mx-auto max-w-6xl px-6">
        <p
          id="trust-heading"
          className="font-mono text-xs uppercase tracking-[0.2em] text-text-muted text-center mb-10"
        >
          Im Sparring mit
        </p>

        <Marquee
          pauseOnHover
          className={`[--duration:40s] ${prefersReducedMotion ? "[&_.animate-marquee]:![animation-play-state:paused]" : ""}`}
        >
          {stubPartners.map((name) => (
            <PartnerTile key={name} name={name} />
          ))}
        </Marquee>

        {/* Microproof per R1.8 — exact string locked */}
        <p className="mt-10 text-center font-mono text-xs text-text-muted">
          N=109 · März 2026
        </p>
      </div>
    </section>
  )
}
