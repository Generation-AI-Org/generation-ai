'use client'

import { ArrowUpRight, Calendar, FileText } from "lucide-react"
import { BeispielBadge } from "@/components/sections/tool-showcase-section"

// Community-Preview (Simon §4.7 "Aus der Community") — DS-polished.
//
// Struktur:
//   1. Section-Header mit Eyebrow "// aus der community" + Hero-level H2 + Lede
//      (Simon §4.7 Fix: slash-prefix Mono-Label mit Dot analog Offering / Tool-Showcase)
//   2. 2-col Grid: Letzte Artikel | Kommende Events, je 3/2 Karten mit BeispielBadge
//   3. Footer: zwei Links (Community-Subdomain + /events) — Simon §4.7 Spec
//
// DS-Alignment:
//   - Section bleibt STATIC (D-24 aus Phase 20): keine motion/react entry, kein Skeleton
//   - Easings + Durations via CSS-Tokens (--ease-out, --dur-normal) über inline styles
//   - Keyboard-Fokus: Card-Links mit focus-visible:outline, Neutral-Ring (DS §C)
//   - Hover: card border-accent + subtle accent-glow shadow (DS §C Interaction-States)
//   - Tokens only: --accent, --text*, --border*, --bg-card, --bg-elevated, --accent-glow.
//     Keine stray Hex-Werte.
//   - BeispielBadge reused aus tool-showcase (theme-aware, konsistent zur Tool-Bibliothek)

type StubArticle = {
  title: string
  readingTime: string
  href: string
}

type StubEvent = {
  title: string
  date: string
  location: string
  href: string
}

/** Stub-Artikel — RESEARCH § D-12 locked data. */
const stubArticles: StubArticle[] = [
  {
    title: "Wie ich ChatGPT für meine Bachelorarbeit genutzt habe",
    readingTime: "6 min Lesezeit",
    href: "https://community.generation-ai.org",
  },
  {
    title: "5 KI-Tools die jeder BWL-Student kennen sollte",
    readingTime: "4 min Lesezeit",
    href: "https://community.generation-ai.org",
  },
  {
    title: "Prompt Engineering für Anfänger: Der komplette Guide",
    readingTime: "9 min Lesezeit",
    href: "https://community.generation-ai.org",
  },
]

/** Stub-Events — RESEARCH § D-12 locked data. */
const stubEvents: StubEvent[] = [
  {
    title: "KI-Basics Workshop",
    date: "28. April 2026",
    location: "Online",
    href: "https://community.generation-ai.org",
  },
  {
    title: "Masterclass: Automatisierung mit Make",
    date: "05. Mai 2026",
    location: "Online",
    href: "https://community.generation-ai.org",
  },
]

export function CommunityPreviewSection() {
  return (
    <section
      aria-labelledby="community-preview-heading"
      data-section="community-preview"
      className="bg-bg-elevated py-24 sm:py-32"
    >
      <div className="mx-auto max-w-6xl px-6">
        {/* Section-Header — Simon §4.7 Fix: slash-prefix Mono-Label mit Dot */}
        <div className="mx-auto mb-14 max-w-2xl text-center">
          <div className="inline-flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-text-muted">
            <span
              aria-hidden="true"
              className="h-1.5 w-1.5 rounded-full"
              style={{
                background: "var(--accent)",
                boxShadow: "0 0 8px var(--accent-glow)",
              }}
            />
            {"// aus der community"}
          </div>
          <h2
            id="community-preview-heading"
            className="mt-4 font-mono font-bold leading-[1.1] tracking-[-0.025em] text-text text-balance"
            style={{ fontSize: "clamp(32px, 5vw, 52px)" }}
          >
            Was gerade läuft.
          </h2>
          <p className="mt-5 text-lg leading-[1.5] text-text-secondary text-pretty sm:text-xl">
            Ein Einblick in Diskussionen und Termine. Sobald die Community-API
            live ist, erscheinen hier echte Artikel und Events.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Spalte 1: Artikel */}
          <div>
            <h3 className="mb-6 inline-flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-text-muted">
              <FileText className="h-3.5 w-3.5" aria-hidden="true" />
              {"// letzte artikel"}
            </h3>
            <ul className="space-y-4">
              {stubArticles.map((article) => (
                <li key={article.title}>
                  <PreviewCard
                    href={article.href}
                    title={article.title}
                    meta={article.readingTime}
                  />
                </li>
              ))}
            </ul>
          </div>

          {/* Spalte 2: Events */}
          <div>
            <h3 className="mb-6 inline-flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-text-muted">
              <Calendar className="h-3.5 w-3.5" aria-hidden="true" />
              {"// kommende events"}
            </h3>
            <ul className="space-y-4">
              {stubEvents.map((event) => (
                <li key={event.title}>
                  <PreviewCard
                    href={event.href}
                    title={event.title}
                    meta={`${event.date} · ${event.location}`}
                  />
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Footer-Links — Simon §4.7: zwei Links (Community + Events) */}
        <div className="mt-14 flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-8">
          <FooterLink
            href="https://community.generation-ai.org"
            external
            label="Zur Community"
          />
          <FooterLink href="/events" label="Alle Events" />
        </div>
      </div>
    </section>
  )
}

function PreviewCard({
  href,
  title,
  meta,
}: {
  href: string
  title: string
  meta: string
}) {
  const isExternal = href.startsWith("http")
  const linkProps = isExternal
    ? ({ target: "_blank", rel: "noopener noreferrer" } as const)
    : {}

  return (
    <a
      href={href}
      {...linkProps}
      className="group block rounded-2xl border border-border bg-bg-card p-5 transition-all hover:-translate-y-[2px] hover:border-[var(--border-accent)] hover:shadow-[0_0_20px_var(--accent-glow)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 motion-reduce:hover:translate-y-0 motion-reduce:transition-none"
      style={{
        outlineColor: "var(--text)",
        transitionDuration: "var(--dur-normal)",
        transitionTimingFunction: "var(--ease-out)",
      }}
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <BeispielBadge />
        <ArrowUpRight
          className="h-4 w-4 text-text-muted transition-colors group-hover:text-[var(--accent)] motion-reduce:transition-none"
          style={{
            transitionDuration: "var(--dur-normal)",
            transitionTimingFunction: "var(--ease-out)",
          }}
          aria-hidden="true"
        />
      </div>
      <p className="font-mono text-[15px] font-bold leading-[1.35] text-text">
        {title}
      </p>
      <p className="mt-2 text-[13px] leading-[1.5] text-text-secondary">
        {meta}
      </p>
    </a>
  )
}

function FooterLink({
  href,
  label,
  external = false,
}: {
  href: string
  label: string
  external?: boolean
}) {
  const linkProps = external
    ? ({ target: "_blank", rel: "noopener noreferrer" } as const)
    : {}

  return (
    <a
      href={href}
      {...linkProps}
      className="inline-flex items-center gap-1 font-mono text-[12px] font-bold uppercase tracking-[0.08em] text-[var(--accent)] hover:text-[var(--accent-hover,var(--accent))] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 motion-reduce:transition-none"
      style={{
        outlineColor: "var(--text)",
        transitionDuration: "var(--dur-normal)",
        transitionTimingFunction: "var(--ease-out)",
        transitionProperty: "color",
      }}
    >
      {label}
      <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
    </a>
  )
}
