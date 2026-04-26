'use client'

import { motion, useReducedMotion } from "motion/react"
import { Building2, GraduationCap, Landmark, Users } from "lucide-react"
import { LabeledNodes } from "@/components/ui/labeled-nodes"
import type { PartnerTyp } from "./partner-tab-content"

const PARTNER_LABELS = [
  "PARTNER",
  "KOOPERATION",
  "SPONSOR",
  "STIPENDIUM",
  "MASTERCLASS",
  "SPEAKER",
  "GASTVORTRAG",
  "CO-HOST",
  "VEREIN",
  "DACH",
  "TALENTE",
  "IMPACT",
  "REICHWEITE",
  "COMMUNITY",
  "BRAND",
]

const PARTNER_TYPES: Array<{
  slug: PartnerTyp
  label: string
  Icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>
}> = [
  { slug: "unternehmen", label: "Unternehmen", Icon: Building2 },
  { slug: "stiftungen", label: "Stiftungen", Icon: Landmark },
  { slug: "hochschulen", label: "Hochschulen", Icon: GraduationCap },
  { slug: "initiativen", label: "Initiativen", Icon: Users },
]

interface PartnerHeroSectionProps {
  onTypChange?: (slug: PartnerTyp) => void
}

export function PartnerHeroSection({ onTypChange }: PartnerHeroSectionProps) {
  const prefersReducedMotion = useReducedMotion()

  const textShadowSm =
    "0 0 10px rgba(var(--bg-rgb), 1), 0 0 4px rgba(var(--bg-rgb), 1)"
  const textShadowLg =
    "0 0 18px rgba(var(--bg-rgb), 1), 0 0 8px rgba(var(--bg-rgb), 1)"

  const handleTypeClick = (slug: PartnerTyp) => {
    onTypChange?.(slug)
    const section = document.querySelector(
      "[data-section=\"partner-tab-system\"]",
    ) as HTMLElement | null
    section?.scrollIntoView({ block: "start", behavior: "smooth" })
  }

  return (
    <section
      aria-labelledby="partner-hero-heading"
      data-section="partner-hero"
      className="relative isolate"
    >
      <LabeledNodes
        labels={PARTNER_LABELS}
        className="flex min-h-[calc(100vh-5rem)] flex-col items-center justify-center"
      >
        <motion.div
          initial={prefersReducedMotion ? false : { opacity: 0, y: 16 }}
          animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="relative z-10 mx-auto max-w-4xl px-6 py-20 text-center"
        >
          {/* Eyebrow */}
          <div
            className="inline-flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-text-muted"
            style={{ textShadow: textShadowSm }}
          >
            <span
              aria-hidden="true"
              className="h-1.5 w-1.5 rounded-full"
              style={{
                background: "var(--accent)",
                boxShadow: "0 0 8px var(--accent-glow)",
              }}
            />
            {"// für partner"}
          </div>

          {/* H1 */}
          <h1
            id="partner-hero-heading"
            className="mt-6 font-mono font-bold leading-[1.02] tracking-[-0.03em] text-text text-balance"
            style={{
              fontSize: "var(--fs-display)",
              textShadow: textShadowLg,
            }}
          >
            Lass uns zusammen was bewegen.
          </h1>

          {/* Subline */}
          <p
            className="mx-auto mt-6 max-w-3xl font-mono font-bold tracking-tight text-text text-balance"
            style={{
              fontSize: "var(--fs-h2)",
              lineHeight: "var(--lh-headline)",
              textShadow: textShadowLg,
            }}
          >
            Vier Partnertypen. Vier Rollen. Ein Formular.
          </p>

          {/* Lede */}
          <p
            className="mx-auto mt-6 max-w-2xl text-lg sm:text-xl leading-[1.5] text-text-secondary text-balance"
            style={{ textShadow: textShadowSm }}
          >
            Ob Unternehmen, Stiftung, Hochschule oder Initiative — hier findet ihr
            den passenden Einstieg in eine Kooperation mit Generation AI.
          </p>

          {/* 4 Partnertyp-Boxen */}
          <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
            {PARTNER_TYPES.map(({ slug, label, Icon }) => (
              <button
                key={slug}
                onClick={() => handleTypeClick(slug)}
                aria-label={`${label} — zum Bereich springen`}
                className="group flex flex-col items-center gap-3 rounded-2xl border border-border bg-bg-card/80 px-4 py-5 text-center transition-all duration-300 ease-[var(--ease-out)] hover:scale-[1.015] hover:border-[var(--border-accent)] hover:shadow-[0_0_20px_var(--accent-glow)] focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-text focus-visible:outline-offset-2"
                style={{ backdropFilter: "blur(8px)" }}
              >
                <span
                  className="flex h-10 w-10 items-center justify-center rounded-xl"
                  style={{
                    background:
                      "color-mix(in oklch, var(--accent) 12%, transparent)",
                    border:
                      "1px solid color-mix(in oklch, var(--accent) 25%, transparent)",
                  }}
                >
                  <Icon
                    className="h-5 w-5"
                    style={{ color: "var(--accent)" }}
                  />
                </span>
                <span
                  className="font-mono text-[13px] font-bold tracking-[0.02em] text-text-secondary transition-colors group-hover:text-text"
                  style={{ textShadow: textShadowSm }}
                >
                  {label}
                </span>
              </button>
            ))}
          </div>
        </motion.div>
      </LabeledNodes>
    </section>
  )
}
