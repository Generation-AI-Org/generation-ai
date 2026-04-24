import Link from "next/link"
import { ArrowUpRight, Calendar, FileText } from "lucide-react"
import { BeispielBadge } from "@/components/ui/beispiel-badge"
import { getAllArticles } from "@/lib/mdx/community"

// Phase 26 Plan 26-05 — Server-Component (D-08 Option A, D-21).
//
// Article-Spalte (D-08): liest die 3 neuesten MDX-Artikel via getAllArticles()
// (newest-first sortiert in lib/mdx/community.ts) und rendert eine 3-up Grid
// mit internen `<Link>`-Cards auf `/community/artikel/[slug]`. KI-News-Artikel
// (kind === "ki-news") bekommen ein zusätzliches Pill-Badge.
//
// Events-Spalte (D-21): bleibt Stub mit BeispielBadge — Live-Daten kommen
// in Phase 22.5. Die Beispiel-Daten sind 1:1 die alte stubEvents-Liste.
//
// Diese Datei hat KEIN `'use client'` mehr (alte Version war Client-Stub).

type StubEvent = {
  title: string
  date: string
  location: string
  href: string
}

/** Stub-Events — bleiben Stub bis Phase 22.5 (D-21). */
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

export async function CommunityPreviewSection() {
  const articles = (await getAllArticles()).slice(0, 3)

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
            Drei aktuelle Artikel aus der Community — und kommende Termine.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Spalte 1: Artikel — echte MDX-Daten (D-08 Option A) */}
          <div>
            <h3 className="font-mono text-sm uppercase tracking-wider text-text-muted mb-6 inline-flex items-center gap-2">
              <FileText className="w-4 h-4" aria-hidden="true" />
              Letzte Artikel
            </h3>
            <ul className="grid gap-5 sm:grid-cols-3">
              {articles.map((article) => (
                <li key={article.slug}>
                  <Link
                    href={`/community/artikel/${article.slug}`}
                    className="group block bg-bg-card border border-border rounded-2xl p-5 hover:border-brand-neon-6 transition-colors h-full"
                  >
                    {article.frontmatter.kind === "ki-news" && (
                      <span className="inline-flex items-center gap-1 mb-2 rounded-full bg-bg-elevated px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-text-muted">
                        KI-News
                      </span>
                    )}
                    <h4 className="font-mono text-base font-bold text-text leading-snug">
                      {article.frontmatter.title}
                    </h4>
                    <p className="mt-3 text-sm text-text-secondary line-clamp-2">
                      {article.frontmatter.excerpt}
                    </p>
                    <p className="mt-3 font-mono text-xs text-text-muted inline-flex items-center gap-1">
                      {article.frontmatter.readingTime} min Lesezeit
                      <ArrowUpRight className="h-3 w-3" aria-hidden="true" />
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Spalte 2: Events — bleibt Stub bis Phase 22.5 (D-21) */}
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
          <Link
            href="/community"
            className="inline-flex items-center gap-1 text-sm font-mono text-[var(--accent)] hover:text-[var(--accent-hover,var(--accent))] transition-colors"
          >
            Alle Artikel ansehen
            <ArrowUpRight className="w-4 h-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  )
}
