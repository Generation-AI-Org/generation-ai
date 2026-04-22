'use client'

import Link from "next/link"
import { ArrowRight } from "lucide-react"

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
      "Circle-Community mit Peer-Learning, Austausch und Sparring. Der Ort für Diskussionen und den direkten Draht zu anderen Studis.",
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
      "Kuratierte KI-Tools mit Anleitungen, sortiert nach Anwendungsfall. Agent-Chat für Fragen zur Nutzung.",
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
      "Monatliche Hands-on-Sessions zu Prompting, Automatisierung und Tools. Masterclasses mit Praktiker:innen.",
    cta: "Alle Events",
    href: "/events",
    external: false,
    preview: <EventsPreview />,
  },
]

export function OfferingSection() {
  return (
    <section
      aria-labelledby="offering-heading"
      data-section="offering"
      className="bg-bg py-24 sm:py-32 border-b border-border"
    >
      <div className="mx-auto max-w-6xl px-6">
        <div className="text-center mb-16 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-text-muted mb-4">
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
            className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-text text-balance"
          >
            Drei Säulen, ein Ökosystem.
          </h2>
          <p className="mt-4 text-lg text-text-secondary text-pretty">
            Community, Wissensplattform und Events — aufeinander abgestimmt, unabhängig nutzbar.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {surfaces.map((s) => (
            <SurfaceCard key={s.title} surface={s} />
          ))}
        </div>
      </div>
    </section>
  )
}

function SurfaceCard({ surface }: { surface: Surface }) {
  const content = (
    <article className="group flex h-full min-h-[420px] flex-col overflow-hidden rounded-[20px] border border-border bg-bg-card p-7 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-[3px] hover:border-[var(--border-accent)] hover:shadow-[0_0_32px_var(--accent-glow)]">
      <header className="mb-5 flex items-start justify-between gap-2">
        <span className="font-mono text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--accent)]">
          {surface.num}
        </span>
        <span className="font-mono text-[11px] tracking-[0.04em] text-text-muted">
          {surface.url}
        </span>
      </header>

      <h3 className="font-mono text-[22px] font-bold leading-tight tracking-[-0.01em] text-text">
        {surface.title}
      </h3>
      <p className="mt-3 text-[15px] leading-[1.55] text-text-secondary">
        {surface.description}
      </p>

      <div className="relative mt-6 flex-1 overflow-hidden rounded-xl border border-border bg-bg">
        {surface.preview}
      </div>

      <div className="mt-5 inline-flex items-center gap-1.5 font-mono text-[12px] font-bold uppercase tracking-[0.06em] text-[var(--accent)]">
        {surface.cta}
        <ArrowRight
          className="h-3.5 w-3.5 transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-1"
          aria-hidden="true"
        />
      </div>
    </article>
  )

  if (surface.external) {
    return (
      <a
        href={surface.href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`${surface.title} öffnen`}
        className="block"
      >
        {content}
      </a>
    )
  }
  return (
    <Link href={surface.href} className="block" aria-label={surface.title}>
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
      {msgs.map((m, i) => (
        <div
          key={i}
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
      {tools.map((t, i) => (
        <div
          key={i}
          className={
            t.hl
              ? "flex items-center justify-center rounded-lg border font-mono text-sm font-bold"
              : "flex items-center justify-center rounded-lg border border-border bg-bg-elevated font-mono text-sm font-bold text-text-secondary"
          }
          style={
            t.hl
              ? {
                  borderColor: "var(--border-accent)",
                  color: "var(--accent)",
                  boxShadow: "0 0 12px var(--accent-glow)",
                  background: "var(--bg-elevated)",
                }
              : undefined
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
      {events.map((e, i) => (
        <div
          key={i}
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
