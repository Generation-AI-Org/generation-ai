'use client'

import { useEffect, useRef, useState } from "react"
import { motion, useReducedMotion } from "motion/react"

// Trust (Simon §4.8 "Keine zufälligen Bekannten.") — DS-polished.
//
// Umbau (CONTEXT.md D-12): Von 6-col Partners-Grid (Handout-Rebuild) auf
// horizontal infinite-scrolling Marquee, analog Tool-Bibliothek (§4.6).
//
// Logo-Strategie: **Text-Pills als Stubs**. Keine echten Partner-SVGs in
// `apps/website/brand/partners/` oder `packages/ui/src/brand-assets/`
// vorhanden (Stand 2026-04-23, beide Pfade existieren nicht). Plan 20.6-06
// erlaubt Text-Pills explizit als Stubs bis Kooperationen gesigned sind.
// Typography: Geist Mono für Label-Charakter (konsistent mit BeispielBadge,
// ToolCard-Name, Section-Eyebrow).
//
// Mono statt Brand-Farben: Trust bleibt understated — Subtle Neutral
// (text-muted → text on hover). Kein Accent-Glow auf den Pills selbst,
// damit die Header-Hierarchie stabil bleibt.
//
// Struktur:
//   1. Section-Header zentriert mit Eyebrow "// wer mit uns baut" (dot +
//      slash-prefix Mono-Label, konsistent mit community-preview + tool-showcase)
//      + Hero-level H2 "Keine zufälligen Bekannten." + Lede
//   2. Infinite-Marquee mit 12 Partner-Pills (6 Unis + 6 Firmen/Initiativen)
//   3. Microproof "N=109 · März 2026" unter dem Marquee, Typography DS-aligned
//
// DS-Alignment:
//   - Entry-Motion via motion/react (fadeIn viewport once), reduced-motion
//     Guard via useReducedMotion (fadeIn = {} bei reduce) — konsistent mit
//     tool-showcase + community-preview
//   - Marquee-Animation via existierende `.animate-scroll` Utility (CSS-var
//     --scroll-duration), identisch zum Pattern aus tool-showcase-section
//   - Double reduced-motion Guard (D-06 PFLICHT):
//       a) CSS @media (prefers-reduced-motion: reduce) in globals.css pausiert
//          .animate-scroll (animation-play-state: paused) für alle Marquees
//       b) JS useReducedMotion gated die Entry-Motion (fadeIn = {})
//   - Tokens only: --accent, --text*, --border*, --bg-card, --bg-elevated,
//     --accent-glow, --dur-normal, --ease-out. Keine stray Hex-Werte.
//   - Mask-linear-gradient für soft-edge fade (identisch zu tool-showcase)
//   - hover:pause auf Track (hover:[animation-play-state:paused])
//   - Microproof Typography: Geist Mono, text-muted, uppercase tracking
//     (aligned mit Eyebrow-Pattern)

/**
 * Partner-Liste — 6 Unis + 6 Firmen/Initiativen per Simon §4.8.
 * Text-Pill-Stubs bis Kooperationen gesigned. Echte SVG-Assets kommen
 * später nach `apps/website/brand/partners/` und ersetzen die Pills.
 */
const partners = [
  "TU Berlin",
  "LMU München",
  "Uni Mannheim",
  "ETH Zürich",
  "WU Wien",
  "KIT",
  "Anthropic",
  "Make",
  "Perplexity",
  "ElevenLabs",
  "Bitkom",
  "KI-Bundesverband",
] as const

export function TrustSection() {
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
      aria-labelledby="trust-heading"
      data-section="trust"
      className="bg-bg py-24 sm:py-32 overflow-hidden"
    >
      <div className="mx-auto max-w-6xl px-6">
        <motion.div
          {...fadeIn}
          className="mx-auto mb-14 max-w-2xl text-center"
        >
          <div className="inline-flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-text-muted">
            <span
              aria-hidden="true"
              className="h-1.5 w-1.5 rounded-full"
              style={{
                background: "var(--accent)",
                boxShadow: "0 0 8px var(--accent-glow)",
              }}
            />
            {"// wer mit uns baut"}
          </div>
          <h2
            id="trust-heading"
            className="mt-4 font-mono font-bold leading-[1.1] tracking-[-0.025em] text-text text-balance"
            style={{ fontSize: "clamp(32px, 5vw, 52px)" }}
          >
            Keine zufälligen Bekannten.
          </h2>
          <p className="mt-5 text-lg leading-[1.5] text-text-secondary text-pretty sm:text-xl">
            Unis, Firmen und Initiativen, mit denen wir im Sparring sind.
            Diese Auswahl ist exemplarisch — Gespräche laufen.
          </p>
        </motion.div>
      </div>

      <motion.div {...fadeIn}>
        <PartnerMarquee />
      </motion.div>

      <div className="mx-auto max-w-6xl px-6">
        <motion.p
          {...fadeIn}
          className="mt-8 text-center font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-text-muted"
        >
          Beispiel-Auswahl · Gespräche laufen
        </motion.p>
      </div>
    </section>
  )
}

function PartnerMarquee() {
  const trackRef = useRef<HTMLUListElement>(null)
  const [start, setStart] = useState(false)

  // Duplicate pills for seamless loop (client-side, aria-hide clones) —
  // identisches Pattern wie ToolMarquee in tool-showcase-section.tsx.
  useEffect(() => {
    const track = trackRef.current
    if (!track) return
    const originals = Array.from(track.children)
    const clones = originals.map((el) => {
      const c = el.cloneNode(true) as HTMLElement
      c.setAttribute("aria-hidden", "true")
      c.setAttribute("tabindex", "-1")
      track.appendChild(c)
      return c
    })
    setStart(true)
    return () => {
      clones.forEach((c) => c.remove())
      setStart(false)
    }
  }, [])

  return (
    <div
      className="relative overflow-hidden [mask-image:linear-gradient(to_right,transparent,#000_10%,#000_90%,transparent)]"
      style={{ ["--scroll-duration" as string]: "60s" }}
    >
      <ul
        ref={trackRef}
        className={`flex w-max shrink-0 flex-nowrap gap-4 py-4 hover:[animation-play-state:paused] ${start ? "animate-scroll" : ""}`}
      >
        {partners.map((name, i) => (
          <PartnerPill key={`${name}-${i}`} name={name} />
        ))}
      </ul>
    </div>
  )
}

function PartnerPill({ name }: { name: string }) {
  return (
    <li
      className="flex h-[64px] shrink-0 items-center justify-center rounded-2xl border border-border bg-bg-card px-6 text-text-muted transition-colors hover:border-[var(--border-accent)] hover:text-text motion-reduce:transition-none"
      style={{
        minWidth: "180px",
        transitionDuration: "var(--dur-normal)",
        transitionTimingFunction: "var(--ease-out)",
      }}
    >
      <span className="font-mono text-[15px] font-bold tracking-[-0.01em]">
        {name}
      </span>
    </li>
  )
}
