'use client'

import Link from "next/link"
import { motion, useReducedMotion } from "motion/react"

// Offering-Section (Simon §4.5 "Drei Säulen") — DS-polished.
//
// Struktur:
//   1. Section-Header mit Eyebrow "// was wir bauen" + H2 + Lede
//   2. 3-Card-Grid (Community · Wissensplattform · Events), Card-Content:
//      - Header: Nummer-Marker + Subdomain-URL
//      - Title (Mono, 22px, bold) + Body (Sans, 15px, secondary)
//      - Preview-Visualisierung (mini bento)
//      - CTA-Row mit Arrow-Translate
//
// DS-Alignment:
//   - Entry-Motion via motion/react (fadeIn, viewport once), reduced-motion Fallback
//   - Easings + Durations via CSS-Tokens (--ease-out, --dur-normal) über inline styles
//   - Keyboard-Fokus: Link-Wrapper mit focus-visible:outline, Neutral-Ring (DS §C)
//   - Hover: card lift + glow (DS §C Interaction-States), Preview lebt subtil mit
//   - Tokens only: --accent, --text*, --border*, --bg-card, --bg-elevated, --accent-glow,
//     --accent-soft, --brand-blue, --brand-pink. Keine stray Hex-Werte.
//   - Theme-aware: alles über CSS-Vars, light + dark werden automatisch mitgezogen.

type Surface = {
  num: string
  url: string
  title: string
  description: string
  cta: string
  href: string
  external: boolean
  preview: React.ReactNode
}

const surfaces: Surface[] = [
  {
    num: "// 01",
    url: "community.generation-ai.org",
    title: "Community",
    description:
      "Peer-Learning, Austausch und Sparring — der Ort für Diskussionen und den direkten Draht zu anderen Studis.",
    cta: "Zur Community",
    href: "https://community.generation-ai.org",
    external: true,
    preview: <CommunityPreview />,
  },
  {
    num: "// 02",
    url: "tools.generation-ai.org",
    title: "Wissensplattform",
    description:
      "Über 100 KI-Tools, kuratiert nach Anwendungsfall. Mit Anleitungen und Agent-Chat für deine Fragen.",
    cta: "Tools entdecken",
    href: "https://tools.generation-ai.org",
    external: true,
    preview: <ToolsPreview />,
  },
  {
    num: "// 03",
    url: "generation-ai.org/events",
    title: "Events & Workshops",
    description:
      "Monatliche Hands-on-Sessions zu Prompting, Automatisierung und Agenten. Masterclasses mit Praktiker:innen.",
    cta: "Alle Events",
    href: "/events",
    external: false,
    preview: <EventsPreview />,
  },
]

export function OfferingSection() {
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
      aria-labelledby="offering-heading"
      data-section="offering"
      className="bg-bg py-24 sm:py-32"
    >
      <div className="mx-auto max-w-6xl px-6">
        {/* Section-Header */}
        <motion.div
          {...fadeIn}
          className="mx-auto mb-16 max-w-2xl text-center"
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
            {"// was wir bauen"}
          </div>
          <h2
            id="offering-heading"
            className="mt-4 font-mono font-bold leading-[1.1] tracking-[-0.025em] text-text text-balance"
            style={{ fontSize: "clamp(32px, 5vw, 52px)" }}
          >
            Drei Säulen, ein Ökosystem.
          </h2>
          <p className="mt-5 text-lg leading-[1.5] text-text-secondary text-pretty sm:text-xl">
            Community, Wissensplattform und Events — aufeinander abgestimmt,
            unabhängig nutzbar.
          </p>
        </motion.div>

        {/* 3-Card-Grid */}
        <motion.div {...fadeIn} className="grid gap-5 md:grid-cols-3">
          {surfaces.map((s) => (
            <SurfaceCard key={s.title} surface={s} />
          ))}
        </motion.div>
      </div>
    </section>
  )
}

function SurfaceCard({ surface }: { surface: Surface }) {
  const content = (
    <article
      className="group relative flex h-full min-h-[420px] flex-col overflow-hidden rounded-[20px] border border-border bg-bg-card p-7 transition-all hover:-translate-y-[3px] hover:border-[var(--border-accent)] hover:shadow-[0_0_32px_var(--accent-glow)] motion-reduce:hover:translate-y-0 motion-reduce:transition-none"
      style={{
        transitionDuration: "var(--dur-normal)",
        transitionTimingFunction: "var(--ease-out)",
      }}
    >
      <header className="mb-5 flex items-start justify-between gap-2">
        <span
          className="font-mono text-[11px] font-bold uppercase tracking-[0.12em]"
          style={{ color: "var(--accent)" }}
        >
          {surface.num}
        </span>
        <span className="font-mono text-[11px] tracking-[0.04em] text-text-muted">
          {surface.url}
        </span>
      </header>

      <h3 className="font-mono text-[22px] font-bold leading-[1.2] tracking-[-0.01em] text-text">
        {surface.title}
      </h3>
      <p className="mt-3 text-[15px] leading-[1.55] text-text-secondary">
        {surface.description}
      </p>

      <div className="relative mt-6 flex-1 overflow-hidden rounded-xl border border-border bg-bg transition-colors group-hover:border-[var(--border-accent)] motion-reduce:transition-none"
        style={{
          transitionDuration: "var(--dur-normal)",
          transitionTimingFunction: "var(--ease-out)",
        }}
      >
        {surface.preview}
      </div>

      <div
        className="mt-5 inline-flex items-center gap-1.5 font-mono text-[12px] font-bold uppercase tracking-[0.08em]"
        style={{ color: "var(--accent)" }}
      >
        {surface.cta}
        <svg
          aria-hidden="true"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="transition-transform group-hover:translate-x-1 motion-reduce:transition-none"
          style={{
            transitionDuration: "var(--dur-normal)",
            transitionTimingFunction: "var(--ease-out)",
          }}
        >
          <path d="M5 12h14M13 5l7 7-7 7" />
        </svg>
      </div>
    </article>
  )

  const linkClassName =
    "block rounded-[20px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
  const linkStyle = { outlineColor: "var(--text)" } as const

  if (surface.external) {
    return (
      <a
        href={surface.href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`${surface.title} — ${surface.url} öffnen`}
        className={linkClassName}
        style={linkStyle}
      >
        {content}
      </a>
    )
  }
  return (
    <Link
      href={surface.href}
      aria-label={surface.title}
      className={linkClassName}
      style={linkStyle}
    >
      {content}
    </Link>
  )
}

// ─── Preview-Visualisierungen ────────────────────────────────────────────

function CommunityPreview() {
  const msgs = [
    { text: "Hat jemand Claude für die Bachelorarbeit genutzt?", color: "var(--accent)" },
    { text: "Ja — kompletter Workflow ist im Circle, schick's dir.", color: "var(--brand-pink)" },
    { text: "Workshop zu Prompting am 05.05. — Anmeldung offen.", color: "var(--brand-blue)" },
  ]
  return (
    <div className="absolute inset-3 flex flex-col gap-1.5">
      {msgs.map((m) => (
        <div
          key={m.text}
          className="flex items-start gap-1.5 rounded-lg bg-bg-elevated px-2 py-1.5 text-[10px] leading-snug text-text-secondary"
        >
          <span
            aria-hidden="true"
            className="mt-0.5 h-4 w-4 flex-shrink-0 rounded-full"
            style={{ background: m.color }}
          />
          <span className="truncate">{m.text}</span>
        </div>
      ))}
    </div>
  )
}

function ToolsPreview() {
  const tools = [
    { letter: "C", hl: false },
    { letter: "G", hl: true },
    { letter: "P", hl: false },
    { letter: "M", hl: false },
    { letter: "E", hl: false },
    { letter: "N", hl: false },
  ]
  return (
    <div className="absolute inset-3 grid grid-cols-3 gap-2">
      {tools.map((t) => (
        <div
          key={t.letter}
          className="flex items-center justify-center rounded-lg border font-mono text-sm font-bold"
          style={
            t.hl
              ? {
                  borderColor: "var(--border-accent)",
                  color: "var(--accent)",
                  boxShadow: "0 0 12px var(--accent-glow)",
                  background: "var(--bg-elevated)",
                }
              : {
                  borderColor: "var(--border)",
                  color: "var(--text-secondary)",
                  background: "var(--bg-elevated)",
                }
          }
        >
          {t.letter}
        </div>
      ))}
    </div>
  )
}

function EventsPreview() {
  const events = [
    { day: "28", month: "APR", title: "KI-Basics Workshop" },
    { day: "05", month: "MAI", title: "Masterclass: Automatisierung" },
    { day: "14", month: "MAI", title: "Q&A mit Anthropic" },
  ]
  return (
    <div className="absolute inset-3 flex flex-col gap-1.5">
      {events.map((e) => (
        <div
          key={`${e.day}-${e.month}`}
          className="flex items-center gap-2 rounded-lg bg-bg-elevated px-2 py-1.5"
        >
          <div
            className="flex h-8 w-8 flex-shrink-0 flex-col items-center justify-center rounded-md border font-mono leading-none"
            style={{
              borderColor: "var(--border-accent)",
              background: "var(--accent-soft)",
            }}
          >
            <span
              className="text-[11px] font-bold"
              style={{ color: "var(--accent)" }}
            >
              {e.day}
            </span>
            <span className="mt-0.5 text-[7px] tracking-wider text-text-muted">
              {e.month}
            </span>
          </div>
          <span className="truncate font-mono text-[10px] font-bold text-text">
            {e.title}
          </span>
        </div>
      ))}
    </div>
  )
}
