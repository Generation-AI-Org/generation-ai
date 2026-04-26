'use client'

import { useRef } from "react"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react"

const TIMELINE_ITEMS = [
  {
    date: "Februar 2026",
    title: "Die Lücke wird sichtbar.",
    body:
      "Janna und Simon starten mit der Frage, warum KI überall erwartet wird, aber kaum jemand im Studium praktisch lernt, damit zu arbeiten.",
  },
  {
    date: "März 2026",
    title: "Aus Workshops wird ein Team.",
    body:
      "Die ersten Formate zeigen, dass der Bedarf real ist. Aus einem Versuch zu zweit wird ein ehrenamtliches Team aus Studierenden und Early-Careers.",
  },
  {
    date: "April 2026",
    title: "Generation AI wird Verein.",
    body:
      "Wir bauen die Struktur, die zu unserer Mission passt: gemeinnützig, transparent, kostenlos für Mitglieder und offen für alle Fachrichtungen.",
  },
  {
    date: "Mai 2026",
    title: "Launch statt lose Idee.",
    body:
      "Website, Community, Tools und erste Events laufen zusammen. Ab hier wächst Generation AI mit den Menschen, die KI praktisch gestalten wollen.",
  },
]

export function AboutStorySection() {
  const timelineRef = useRef<HTMLDivElement>(null)
  const prefersReducedMotion = useReducedMotion()
  const { scrollYProgress } = useScroll({
    target: timelineRef,
    offset: ["start 70%", "end 35%"],
  })
  const progressScaleY = useTransform(scrollYProgress, [0, 1], [0, 1])

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
      id="story"
      aria-labelledby="about-story-heading"
      data-section="about-story"
      className="relative bg-bg py-24 sm:py-32"
    >
      <div className="mx-auto max-w-4xl px-6">
        {/* Eyebrow: // unsere story */}
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
          {"// unsere story"}
        </motion.div>

        {/* Semantisch H2, visuell H3-Size via --fs-h3 Token */}
        <motion.h2
          {...fadeIn}
          id="about-story-heading"
          className="text-center font-mono font-bold text-text text-balance"
          style={{
            fontSize: "var(--fs-h2)",
            lineHeight: "var(--lh-headline)",
          }}
        >
          Wie aus einer Idee ein Verein wurde.
        </motion.h2>

        <motion.p
          {...fadeIn}
          className="mx-auto mt-6 max-w-2xl text-center text-pretty text-text-secondary"
          style={{
            fontSize: "var(--fs-lede)",
            lineHeight: "var(--lh-lede)",
          }}
        >
          Wir bauen die Community auf, die wir selbst gebraucht hätten: praktisch, unabhängig und nah an dem, was Studierende gerade wirklich brauchen.
        </motion.p>

        <div ref={timelineRef} className="relative mx-auto mt-14 max-w-3xl" data-timeline="about-story">
          <div
            aria-hidden="true"
            className="absolute bottom-8 left-4 top-8 hidden w-px bg-border sm:block"
          />
          <motion.div
            aria-hidden="true"
            className="absolute bottom-8 left-4 top-8 hidden w-px origin-top bg-[var(--accent)] shadow-[0_0_16px_var(--accent-glow)] sm:block"
            style={{ scaleY: prefersReducedMotion ? 1 : progressScaleY }}
          />

          <ol className="space-y-5" aria-label="Timeline der Vereinsentstehung">
            {TIMELINE_ITEMS.map((item, index) => (
              <motion.li
                key={item.date}
                className="relative sm:pl-12"
                initial={prefersReducedMotion ? false : { opacity: 0, y: 18 }}
                whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-12% 0px" }}
                transition={{
                  duration: 0.5,
                  delay: prefersReducedMotion ? 0 : index * 0.05,
                  ease: [0.16, 1, 0.3, 1],
                }}
              >
                <span
                  aria-hidden="true"
                  className="absolute left-[11px] top-8 hidden h-2.5 w-2.5 rounded-full border border-[var(--accent)] bg-bg shadow-[0_0_10px_var(--accent-glow)] sm:block"
                />
                <article className="rounded-2xl border border-border bg-bg-card px-6 py-6">
                  <p className="font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-text-muted">
                    {item.date}
                  </p>
                  <h3
                    className="mt-3 font-sans font-bold text-text text-balance"
                    style={{ fontSize: "var(--fs-h3)", lineHeight: "var(--lh-sub)" }}
                  >
                    {item.title}
                  </h3>
                  <p
                    className="mt-3 text-pretty text-text-secondary"
                    style={{ fontSize: "var(--fs-body)", lineHeight: "var(--lh-body)" }}
                  >
                    {item.body}
                  </p>
                </article>
              </motion.li>
            ))}
          </ol>
        </div>

        {/* Inline-CTA zum #mitmach-Anker */}
        <motion.div {...fadeIn} className="mt-10 flex justify-center">
          <Link
            href="#mitmach"
            className="group inline-flex items-center gap-2 font-mono text-sm font-bold text-text transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out)] hover:text-[var(--accent)] focus-visible:outline-none focus-visible:text-[var(--accent)]"
          >
            Werde Teil davon
            <ArrowRight
              className="w-4 h-4 transition-transform duration-[var(--dur-fast)] ease-[var(--ease-out)] group-hover:translate-x-0.5"
              aria-hidden="true"
            />
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
