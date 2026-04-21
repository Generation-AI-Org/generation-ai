'use client'

import { ArrowUpRight, Calendar, FileText } from "lucide-react"
import { BeispielBadge } from "@/components/sections/tool-showcase-section"

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
      className="bg-bg-elevated py-24 sm:py-32 border-b border-border"
    >
      <div className="mx-auto max-w-6xl px-6">
        <div className="text-center mb-16">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-text-muted mb-3">
            Aus der Community
          </p>
          <h2
            id="community-preview-heading"
            className="text-3xl sm:text-4xl font-bold tracking-tight text-text"
          >
            Was gerade läuft.
          </h2>
          <p className="mt-3 text-sm text-text-muted max-w-2xl mx-auto">
            Ein Einblick in Diskussionen und Termine. Sobald die Community-API live ist,
            erscheinen hier echte Artikel und Events.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Spalte 1: Artikel */}
          <div>
            <h3 className="font-mono text-sm uppercase tracking-wider text-text-muted mb-6 inline-flex items-center gap-2">
              <FileText className="w-4 h-4" aria-hidden="true" />
              Letzte Artikel
            </h3>
            <ul className="space-y-4">
              {stubArticles.map((article) => (
                <li key={article.title}>
                  <a
                    href={article.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group block bg-bg-card border border-border rounded-2xl p-5 hover:border-brand-neon-6 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <BeispielBadge />
                      <ArrowUpRight
                        className="w-4 h-4 text-text-muted group-hover:text-[var(--accent)] transition-colors"
                        aria-hidden="true"
                      />
                    </div>
                    <p className="font-mono text-base font-bold text-text leading-snug">
                      {article.title}
                    </p>
                    <p className="mt-2 text-xs text-text-muted">{article.readingTime}</p>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Spalte 2: Events */}
          <div>
            <h3 className="font-mono text-sm uppercase tracking-wider text-text-muted mb-6 inline-flex items-center gap-2">
              <Calendar className="w-4 h-4" aria-hidden="true" />
              Kommende Events
            </h3>
            <ul className="space-y-4">
              {stubEvents.map((event) => (
                <li key={event.title}>
                  <a
                    href={event.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group block bg-bg-card border border-border rounded-2xl p-5 hover:border-brand-neon-6 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <BeispielBadge />
                      <ArrowUpRight
                        className="w-4 h-4 text-text-muted group-hover:text-[var(--accent)] transition-colors"
                        aria-hidden="true"
                      />
                    </div>
                    <p className="font-mono text-base font-bold text-text leading-snug">
                      {event.title}
                    </p>
                    <p className="mt-2 text-xs text-text-muted">
                      {event.date} · {event.location}
                    </p>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 text-center">
          <a
            href="https://community.generation-ai.org"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-sm font-mono text-[var(--accent)] hover:text-[var(--accent-hover,var(--accent))] transition-colors"
          >
            Zur Community
            <ArrowUpRight className="w-4 h-4" aria-hidden="true" />
          </a>
        </div>
      </div>
    </section>
  )
}
