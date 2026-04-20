'use client'

import { useRef } from "react"
import {
  motion,
  useScroll,
  useTransform,
  useInView,
  useReducedMotion,
} from "motion/react"
import { NumberTicker } from "@/components/ui/number-ticker"

// Plan 03 Task 2 — Discrepancy: das zentrale Wow-Stueck der Landing (D-09).
// Custom Bento-Split mit 6 Number-Tickern + scroll-getriebener Divergenz + Closer.
//
// LOCKED Daten aus .planning/phases/20-navigation-landing-skeleton/20-RESEARCH.md
// § Component Recipes D-09 (die 6 Kernzahlen duerfen NICHT geaendert werden).
//
// Reduced-motion-Verhalten:
//   - useReducedMotion() → useTransform liefert konstante 0% (kein Panel-Movement)
//   - motion-Entries (Intro, Closer) skippen Animation, springen in End-State
//   - NumberTicker zeigt Final-Werte (NumberTicker hat internen useInView-Start)

const wirtschaftStats = [
  { value: 7,  decimals: 0, suffix: "×",  label: "Nachfrage nach KI-Talent (2023→2025)" },
  { value: 56, decimals: 0, suffix: " %", label: "Lohnaufschlag für KI-Kompetenz" },
  { value: 73, decimals: 0, suffix: " %", label: "Unternehmen können KI nicht ausschöpfen" },
] as const

const studisStats = [
  { value: 83.5, decimals: 1, suffix: " %", label: "auf Anfänger-Level" },
  { value: 75,   decimals: 0, suffix: " %", label: "„Studium bereitet mich nicht vor.“" },
  { value: 6.4,  decimals: 1, suffix: " %", label: "intensive KI-Lehre im Studium" },
] as const

export function DiscrepancySection() {
  const sectionRef = useRef<HTMLElement>(null)
  const tickersRef = useRef<HTMLDivElement>(null)
  const prefersReducedMotion = useReducedMotion()

  // Scroll-Divergenz: linke Spalte wandert leicht nach links, rechte nach rechts.
  // Maximal ±4% Transform — innerhalb overflow-hidden, kein Layout-Shift
  // (siehe 20-RESEARCH.md § OQ-5 CLS-Mitigation).
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start 80%", "end 20%"],
  })
  const leftX = useTransform(
    scrollYProgress,
    [0, 1],
    prefersReducedMotion ? ["0%", "0%"] : ["0%", "-4%"],
  )
  const rightX = useTransform(
    scrollYProgress,
    [0, 1],
    prefersReducedMotion ? ["0%", "0%"] : ["0%", "4%"],
  )

  // Gate fuer Number-Ticker-Start auf die tatsaechliche Ticker-Sichtbarkeit —
  // verhindert, dass Ticker schon vor Scroll in den Viewport "losrennen".
  const tickersInView = useInView(tickersRef, { once: true, amount: 0.3 })

  return (
    <section
      ref={sectionRef}
      aria-labelledby="discrepancy-heading"
      data-section="discrepancy"
      className="relative overflow-hidden bg-bg py-24 sm:py-32 border-b border-border"
    >
      <div className="mx-auto max-w-6xl px-6">
        {/* Intro */}
        <motion.div
          initial={prefersReducedMotion ? false : { opacity: 0, y: 16 }}
          whileInView={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-text-muted mb-3">
            Die KI-Diskrepanz
          </p>
          <h2
            id="discrepancy-heading"
            className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-text"
          >
            Was die Wirtschaft braucht — und was im Studium passiert.
          </h2>
        </motion.div>

        {/* Bento-Split */}
        <div
          ref={tickersRef}
          className="grid grid-cols-1 lg:grid-cols-2 gap-px bg-border rounded-2xl overflow-hidden"
        >
          {/* LINKS: Was Wirtschaft will */}
          <motion.div
            style={{ x: leftX, willChange: "transform" }}
            className="bg-brand-blue-2 dark:bg-brand-blue-12/40 p-8 sm:p-10"
          >
            <h3 className="font-mono text-sm uppercase tracking-wider text-brand-blue-11 dark:text-brand-neon-9 mb-8">
              Was die Wirtschaft will
            </h3>
            <ul className="space-y-8">
              {wirtschaftStats.map((stat) => (
                <li key={stat.label}>
                  <p className="font-mono text-5xl sm:text-6xl font-bold text-brand-blue-11 dark:text-brand-neon-9 leading-none">
                    {tickersInView ? (
                      <NumberTicker
                        value={stat.value}
                        decimalPlaces={stat.decimals}
                      />
                    ) : (
                      <span>0</span>
                    )}
                    <span className="text-3xl sm:text-4xl ml-1">{stat.suffix}</span>
                  </p>
                  <p className="mt-2 text-sm text-brand-blue-11/90 dark:text-brand-neon-4">{stat.label}</p>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* RECHTS: Was Studis mitbringen */}
          <motion.div
            style={{ x: rightX, willChange: "transform" }}
            className="bg-brand-red-2 dark:bg-brand-red-12/40 p-8 sm:p-10"
          >
            <h3 className="font-mono text-sm uppercase tracking-wider text-brand-red-11 dark:text-brand-pink-9 mb-8">
              Was Studierende mitbringen
            </h3>
            <ul className="space-y-8">
              {studisStats.map((stat) => (
                <li key={stat.label}>
                  <p className="font-mono text-5xl sm:text-6xl font-bold text-brand-red-11 dark:text-brand-pink-9 leading-none">
                    {tickersInView ? (
                      <NumberTicker
                        value={stat.value}
                        decimalPlaces={stat.decimals}
                      />
                    ) : (
                      <span>0</span>
                    )}
                    <span className="text-3xl sm:text-4xl ml-1">{stat.suffix}</span>
                  </p>
                  <p className="mt-2 text-sm text-brand-red-11/90 dark:text-brand-pink-4">{stat.label}</p>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>

        {/* Closer-Zeile (R1.3 explicit) */}
        <motion.p
          initial={prefersReducedMotion ? false : { opacity: 0, y: 12 }}
          whileInView={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ delay: 0.4, duration: 0.8, ease: "easeOut" }}
          className="mt-16 text-center font-mono text-2xl sm:text-3xl text-text"
        >
          Generation AI schließt diese Lücke.
        </motion.p>
      </div>
    </section>
  )
}
