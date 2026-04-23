'use client'

// AboutFaqSection — 10-Fragen FAQ für /about#faq (Plan 21-06).
//
// Mechanik: 1:1 Reuse von components/sections/kurz-faq-section.tsx
// (Plan 20.6-09 Blueprint). Konkrete Abweichungen zur Landing-Variante:
//   - Eyebrow: "// fragen & antworten" (statt "// häufige fragen")
//   - H2: "Was du wissen solltest." (visuell --fs-h3, semantisch <h2>)
//   - 10 Items statt 5, aus faq-data.ts
//   - id="faq" LOAD-BEARING (Target von Landing-Kurz-FAQ-Footer-Link)
//   - Kein Footer-Link (wir SIND /about, kein self-referential)
//   - Inline-Links in Antwort 8/9/10 (#team, #verein, #mitmach)
//
// A11y:
//   - aria-expanded auf Trigger-Button
//   - aria-controls/id-Pairing zwischen Button und Panel
//   - Panel: role="region" + aria-labelledby auf Button
//   - Keyboard: native <button> (Space/Enter), Tab iteriert sequentiell
//
// Motion: AnimatePresence height:0 → auto. prefers-reduced-motion → instant.

import { useId, useState } from "react"
import Link from "next/link"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"
import { faqs, type FaqAnswerNode } from "./faq-data"

function AnswerNode({ node }: { node: FaqAnswerNode }) {
  if (node.kind === "text") {
    return <>{node.text}</>
  }
  return (
    <Link
      href={node.href}
      className="text-[var(--accent)] underline-offset-4 hover:underline transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out)] focus-visible:outline-none focus-visible:underline"
    >
      {node.text}
    </Link>
  )
}

export function AboutFaqSection() {
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
      id="faq"
      aria-labelledby="about-faq-heading"
      data-section="about-faq"
      className="relative bg-bg py-24 sm:py-32 border-b border-border"
    >
      <div className="mx-auto max-w-3xl px-6">
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
          {"// fragen & antworten"}
        </motion.div>

        {/* H2 — visuell --fs-h3 (Mid-Page Sub-Section, kein Peak) */}
        <motion.h2
          {...fadeIn}
          id="about-faq-heading"
          className="text-center font-sans font-bold text-text text-balance"
          style={{ fontSize: "var(--fs-h3)", lineHeight: "var(--lh-sub)" }}
        >
          Was du wissen solltest.
        </motion.h2>

        {/* Accordion-List */}
        <motion.ul {...fadeIn} className="mt-14 flex flex-col gap-3">
          {faqs.map((item, i) => {
            const isOpen = openIndices.has(i)
            const triggerId = `${baseId}-about-faq-trigger-${i}`
            const panelId = `${baseId}-about-faq-panel-${i}`
            const indexLabel = i + 1 < 10 ? `// 0${i + 1}` : `// ${i + 1}`

            return (
              <li
                key={item.q}
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
                        {indexLabel}
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
                          {item.answerNodes.map((node, nodeIdx) => (
                            <AnswerNode key={nodeIdx} node={node} />
                          ))}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </li>
            )
          })}
        </motion.ul>
      </div>
    </section>
  )
}
