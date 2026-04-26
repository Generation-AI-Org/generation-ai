'use client'

import { motion, useReducedMotion } from "motion/react"

// Problem-Block (Simon §4.4) — replaces the old Sticky-Scroll Discrepancy variant.
//
// Struktur (exakt nach Konzept §4.4):
//   1. Eyebrow "// die lücke"
//   2. Kontrast-Statement, zweizeilig. Zeile 1 neutral, Zeile 2 in --accent.
//   3. Überleitungssatz (italic, text-secondary).
//   4. Drei Beleg-Kacheln mit Nummer-Marker, Claim, Source-Micro-Credit (verlinkt).
//   5. Tonwechsel-Closer — "Aber: du bist hier richtig." in --accent.
//   6. Scroll-Einladung "So gehen wir's an ↓" mit sanftem Bounce (motion-safe).
//
// Quellen (D-09):
//   - PwC AI Jobs Barometer 2025 → +56 % höheres Gehalt für KI-Skill-Jobs
//   - Financial Times (Feb 2026) → Accenture koppelt Beförderungen an KI-Nutzung
//   - The Information / heise online (2026) → Meta bindet Performance-Reviews an KI
//
// Motion-Strategy: schlichte Entry-Fades (viewport once). Keine Scroll-Driven-Logic,
// kein Sticky-Pattern. `prefers-reduced-motion` → alle Animationen auf final state.
//
// Tokens: DS-only (--accent, --text, --text-secondary, --text-muted, --border,
// --border-accent, --bg-card, --bg-elevated, --accent-glow, --font-mono).

type Evidence = {
  num: string
  headline: React.ReactNode
  body: string
  source: string
  href: string
}

const evidence: Evidence[] = [
  {
    num: "// 01",
    headline: (
      <>
        <span style={{ color: "var(--accent)" }}>+56 %</span> höheres Gehalt
      </>
    ),
    body: "für Jobs, die KI-Skills voraussetzen.",
    source: "PwC AI Jobs Barometer 2025",
    href: "https://www.pwc.com/gx/en/issues/artificial-intelligence/ai-jobs-barometer.html",
  },
  {
    num: "// 02",
    headline: (
      <>
        Beförderungen an <span style={{ color: "var(--accent)" }}>KI-Nutzung</span>{" "}
        gekoppelt
      </>
    ),
    body: "bei Accenture — ab 2026, 700.000 Mitarbeitende.",
    source: "Financial Times, Feb 2026",
    href: "https://www.ft.com/content/accenture-ai-performance-reviews-2026",
  },
  {
    num: "// 03",
    headline: (
      <>
        Performance-Reviews an <span style={{ color: "var(--accent)" }}>KI-Einsatz</span>{" "}
        gebunden
      </>
    ),
    body: "bei Meta — ab 2026, konzernweit verpflichtend.",
    source: "The Information / heise online, 2026",
    href: "https://www.heise.de/news/Meta-KI-Einsatz-Performance-Review-2026",
  },
]

export function ProblemBlockSection() {
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
      aria-labelledby="problem-block-heading"
      data-section="problem-block"
      className="relative bg-bg py-24 sm:py-32"
    >
      <div className="mx-auto max-w-6xl px-6">
        {/* Eyebrow */}
        <motion.div
          {...fadeIn}
          className="mx-auto mb-8 flex max-w-2xl items-center justify-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-text-muted"
        >
          <span
            aria-hidden="true"
            className="h-1.5 w-1.5 rounded-full"
            style={{
              background: "var(--accent)",
              boxShadow: "0 0 8px var(--accent-glow)",
            }}
          />
          {"// die lücke"}
        </motion.div>

        {/* Kontrast-Statement — zweizeilig */}
        <motion.h2
          {...fadeIn}
          id="problem-block-heading"
          className="mx-auto max-w-4xl text-center font-mono font-bold leading-[1.1] tracking-[-0.025em] text-text text-balance"
          style={{ fontSize: "clamp(32px, 5vw, 56px)" }}
        >
          <span className="block">Studierende lernen mit ChatGPT.</span>
          <span className="block" style={{ color: "var(--accent)" }}>
            Unternehmen arbeiten mit Agenten.
          </span>
        </motion.h2>

        {/* Überleitung */}
        <motion.p
          {...fadeIn}
          className="mx-auto mt-6 max-w-2xl text-center text-lg italic leading-[1.5] text-text-secondary text-pretty sm:text-xl"
        >
          Die Lücke wächst jeden Monat. Und niemand bringt dir systematisch bei,
          wie du sie schließt.
        </motion.p>

        {/* 3-Kachel-Grid */}
        <motion.div
          {...fadeIn}
          className="mt-16 grid gap-5 md:grid-cols-3"
        >
          {evidence.map((item) => (
            <EvidenceCard key={item.num} item={item} />
          ))}
        </motion.div>

        {/* Tonwechsel-Closer */}
        <motion.div
          {...fadeIn}
          className="mx-auto mt-20 max-w-3xl text-center sm:mt-24"
        >
          <p
            className="font-mono font-bold leading-[1.15] tracking-[-0.02em] text-text text-balance"
            style={{ fontSize: "clamp(28px, 4vw, 44px)" }}
          >
            Aber:{" "}
            <span style={{ color: "var(--accent)" }}>du bist hier richtig.</span>
          </p>
          <p className="mx-auto mt-5 max-w-xl text-base leading-[1.55] text-text-secondary text-pretty sm:text-lg">
            Wir bringen dir die Skills bei, die in Jobs heute schon erwartet
            werden. Kostenlos, praxisnah, für alle Fachrichtungen.
          </p>
        </motion.div>

        {/* Scroll-Einladung */}
        <motion.div
          {...fadeIn}
          className="mt-14 flex flex-col items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-text-muted"
        >
          <span>So gehen wir&apos;s an</span>
          <span aria-hidden="true" className="problem-block-arrow text-base">
            ↓
          </span>
        </motion.div>
      </div>

      <style jsx>{`
        .problem-block-arrow {
          animation: problemBlockBounce 2.2s ease-in-out infinite;
          color: var(--accent);
        }
        @keyframes problemBlockBounce {
          0%,
          100% {
            transform: translateY(0);
            opacity: 0.7;
          }
          50% {
            transform: translateY(4px);
            opacity: 1;
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .problem-block-arrow {
            animation: none;
            opacity: 1;
          }
        }
      `}</style>
    </section>
  )
}

function EvidenceCard({ item }: { item: Evidence }) {
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-[20px] border border-border bg-bg-card p-7 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:scale-[1.015] hover:border-[var(--border-accent)] hover:shadow-[0_0_20px_var(--accent-glow)]">
      {/* Header: Number-Marker */}
      <header className="mb-5 flex items-center gap-3">
        <span className="font-mono text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--accent)]">
          {item.num}
        </span>
        <span
          aria-hidden="true"
          className="h-px flex-1"
          style={{ background: "var(--border)" }}
        />
      </header>

      {/* Headline */}
      <h3
        className="font-mono font-bold leading-[1.2] tracking-[-0.01em] text-text"
        style={{ fontSize: "clamp(22px, 2.2vw, 28px)" }}
      >
        {item.headline}
      </h3>

      {/* Body */}
      <p className="mt-3 text-[15px] leading-[1.55] text-text-secondary">
        {item.body}
      </p>

      {/* Micro-Credit (sichtbar, verlinkt) */}
      <a
        href={item.href}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-6 inline-flex items-center gap-1.5 self-start font-mono text-[11px] uppercase tracking-[0.12em] text-text-muted transition-colors duration-200 hover:text-[var(--accent)] focus-visible:text-[var(--accent)]"
      >
        <span>Quelle: {item.source}</span>
        <svg
          aria-hidden="true"
          width="10"
          height="10"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
        >
          <path d="M7 17L17 7M7 7h10v10" />
        </svg>
      </a>
    </article>
  )
}
