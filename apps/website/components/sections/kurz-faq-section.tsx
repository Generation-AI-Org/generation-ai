'use client'

import { useId, useState } from "react"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"

// Kurz-FAQ Section (Simon §4.10, CONTEXT.md D-10) — 5-Fragen-Accordion
// direkt nach Final-CTA, vor Footer.
//
// Pattern:
//   1. Section-Header "// häufige fragen" + H2 "Kurz & knapp."
//   2. 5 Panels, multi-open (mehrere Panels gleichzeitig offen erlaubt,
//      konsistent mit Simon §9.9 Über-uns-FAQ).
//   3. Unter dem Accordion: "Mehr Fragen? → Über uns" → /about#faq
//      (Link existiert, Target kommt in Phase 21; Anker ist future-safe).
//
// Copy: Placeholder-Antworten. Finales Marketing-Wording kommt im Copy-Pass
// (Phase 27 per CONTEXT.md D-06). Fragen sind Simon §4.10 1:1.
//
// A11y:
//   - aria-expanded auf dem Trigger-Button
//   - aria-controls / id Pairing zwischen Button und Panel
//   - Panel als role="region" mit aria-labelledby auf Button
//   - Keyboard: native <button> hat Space/Enter; Tab iteriert sequentiell
//
// Motion: AnimatePresence mit height:auto → 0 Fade/Slide. prefers-reduced-motion
// → instant toggle ohne Animation. DS-Easing --ease-out (cubic-bezier).
//
// Tokens: DS-only (--accent, --accent-glow, --text, --text-secondary,
// --text-muted, --border, --border-accent, --bg-card, --font-mono).

type FaqItem = {
  q: string
  a: string
}

const faqs: FaqItem[] = [
  {
    q: "Kostet das was?",
    a: "Nein. Mitgliedschaft, Community-Zugang, Wissensplattform und Events sind kostenlos. Generation AI ist als gemeinnütziger Verein aufgestellt und finanziert sich über Fördermitglieder und Partner.",
  },
  {
    q: "Brauche ich technisches Vorwissen?",
    a: "Nein. Wir starten beim Alltagsnutzen und führen schrittweise zu Agenten und Automatisierung. Alle Fachrichtungen willkommen — du musst weder programmieren können noch Informatik studieren.",
  },
  {
    q: "Muss ich an einer bestimmten Uni studieren?",
    a: "Nein. Offen für Studierende und Early-Career aus dem gesamten DACH-Raum, unabhängig von Hochschule oder Fachrichtung. Wir arbeiten perspektivisch mit Hochschulen zusammen, aber eine Mitgliedschaft ist daran nicht gebunden.",
  },
  {
    q: "Wie viel Zeit muss ich investieren?",
    a: "So viel oder so wenig du willst. Kein Pflichtprogramm. Die Community läuft asynchron, Events sind optional. Viele schauen monatlich rein, andere bauen aktiv mit — beides passt.",
  },
  {
    q: "Was passiert nach der Anmeldung?",
    a: "Du bekommst eine Bestätigungsmail mit direktem Zugang zur Community und zur Wissensplattform. Danach kannst du dich vorstellen, bei Events anmelden und sofort loslegen.",
  },
]

export function KurzFaqSection() {
  // Multi-open: Set of open panel indices.
  const [openIndices, setOpenIndices] = useState<Set<number>>(new Set())
  const prefersReducedMotion = useReducedMotion()
  const baseId = useId()

  const toggle = (i: number) => {
    setOpenIndices((prev) => {
      const next = new Set(prev)
      if (next.has(i)) {
        next.delete(i)
      } else {
        next.add(i)
      }
      return next
    })
  }

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
      aria-labelledby="kurz-faq-heading"
      data-section="kurz-faq"
      className="relative bg-bg py-24 sm:py-32 border-b border-border"
    >
      <div className="mx-auto max-w-3xl px-6">
        {/* Section-Header */}
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
          {"// häufige fragen"}
        </motion.div>

        <motion.h2
          {...fadeIn}
          id="kurz-faq-heading"
          className="text-center font-mono text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-text text-balance"
        >
          Kurz & knapp.
        </motion.h2>

        {/* Accordion */}
        <motion.ul
          {...fadeIn}
          className="mt-14 flex flex-col gap-3"
        >
          {faqs.map((item, i) => {
            const isOpen = openIndices.has(i)
            const triggerId = `${baseId}-faq-trigger-${i}`
            const panelId = `${baseId}-faq-panel-${i}`

            return (
              <li
                key={i}
                className="overflow-hidden rounded-[16px] border border-border bg-bg-card transition-colors duration-[var(--dur-normal)] ease-[var(--ease-out)] hover:border-[var(--border-accent)]"
              >
                <h3 className="m-0">
                  <button
                    type="button"
                    id={triggerId}
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    onClick={() => toggle(i)}
                    className="group flex w-full items-center justify-between gap-4 px-6 py-5 text-left font-mono text-[15px] sm:text-base font-bold leading-[1.35] tracking-[-0.01em] text-text transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out)] hover:text-[var(--accent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-0"
                  >
                    <span className="flex items-start gap-3">
                      <span
                        aria-hidden="true"
                        className="font-mono text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--accent)] pt-1 shrink-0"
                      >
                        {`// 0${i + 1}`}
                      </span>
                      <span className="text-pretty">{item.q}</span>
                    </span>
                    <span
                      aria-hidden="true"
                      className="shrink-0 font-mono text-xl text-text-muted transition-transform duration-[var(--dur-normal)] ease-[var(--ease-out)] group-hover:text-[var(--accent)]"
                      style={{
                        transform: isOpen ? "rotate(45deg)" : "rotate(0deg)",
                      }}
                    >
                      +
                    </span>
                  </button>
                </h3>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      key="content"
                      id={panelId}
                      role="region"
                      aria-labelledby={triggerId}
                      initial={
                        prefersReducedMotion
                          ? { height: "auto", opacity: 1 }
                          : { height: 0, opacity: 0 }
                      }
                      animate={{ height: "auto", opacity: 1 }}
                      exit={
                        prefersReducedMotion
                          ? { height: "auto", opacity: 1 }
                          : { height: 0, opacity: 0 }
                      }
                      transition={
                        prefersReducedMotion
                          ? { duration: 0 }
                          : { duration: 0.3, ease: [0.16, 1, 0.3, 1] as const }
                      }
                      className="overflow-hidden"
                    >
                      <div className="px-6 pb-6 pt-0">
                        <div
                          aria-hidden="true"
                          className="mb-4 h-px w-full"
                          style={{ background: "var(--border)" }}
                        />
                        <p className="text-[15px] leading-[1.6] text-text-secondary text-pretty">
                          {item.a}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </li>
            )
          })}
        </motion.ul>

        {/* Footer-Link: Mehr Fragen → Über uns */}
        <motion.div
          {...fadeIn}
          className="mt-12 flex justify-center"
        >
          <Link
            href="/about#faq"
            prefetch={false}
            className="inline-flex items-center gap-2 font-mono text-[13px] font-bold uppercase tracking-[0.12em] text-text-muted transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out)] hover:text-[var(--accent)] focus-visible:outline-none focus-visible:text-[var(--accent)]"
          >
            Mehr Fragen? Über uns
            <ArrowRight
              className="w-3.5 h-3.5 transition-transform duration-[var(--dur-fast)] ease-[var(--ease-out)] group-hover:translate-x-0.5"
              aria-hidden="true"
            />
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
