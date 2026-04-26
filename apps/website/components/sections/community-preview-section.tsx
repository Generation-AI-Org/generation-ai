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
// DS-Polish (Phase 20.6 §4.7): Eyebrow mit Dot, Hover-Glow auf Cards,
// CSS-Token-driven transitions, focus-visible Outline.

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
            Aktuelle Artikel aus der Community — und kommende Termine.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Spalte 1: Artikel — echte MDX-Daten (D-08 Option A) */}
          <div>
            <h3 className="mb-6 inline-flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-text-muted">
              <FileText className="h-3.5 w-3.5" aria-hidden="true" />
              {"// letzte artikel"}
            </h3>
            <ul className="grid gap-5 sm:grid-cols-3">
              {articles.map((article) => (
                <li key={article.slug}>
                  <Link
                    href={`/community/artikel/${article.slug}`}
                    className="group block h-full rounded-2xl border border-border bg-bg-card p-5 transition-all hover:scale-[1.015] hover:border-[var(--border-accent)] hover:shadow-[0_0_20px_var(--accent-glow)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 motion-reduce:hover:scale-100 motion-reduce:transition-none"
                    style={{
                      outlineColor: "var(--text)",
                      transitionDuration: "var(--dur-normal)",
                      transitionTimingFunction: "var(--ease-out)",
                    }}
                  >
                    {article.frontmatter.kind === "ki-news" && (
                      <span className="mb-2 inline-flex items-center gap-1 rounded-full bg-bg-elevated px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-text-muted">
                        KI-News
                      </span>
                    )}
                    <h4 className="font-mono text-base font-bold leading-snug text-text">
                      {article.frontmatter.title}
                    </h4>
                    <p className="mt-3 line-clamp-2 text-sm text-text-secondary">
                      {article.frontmatter.excerpt}
                    </p>
                    <p className="mt-3 inline-flex items-center gap-1 font-mono text-xs text-text-muted">
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

        {/* Footer-Links — Simon §4.7: Community + Events + alle Artikel */}
        <div className="mt-14 flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-8">
          <FooterLink href="/community" label="Alle Artikel" />
          <FooterLink href="/events" label="Alle Events" />
          <FooterLink
            href="https://community.generation-ai.org"
            external
            label="Zur Community"
          />
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
      className="group block rounded-2xl border border-border bg-bg-card p-5 transition-all hover:scale-[1.015] hover:border-[var(--border-accent)] hover:shadow-[0_0_20px_var(--accent-glow)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 motion-reduce:hover:scale-100 motion-reduce:transition-none"
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

  if (external) {
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

  return (
    <Link
      href={href}
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
    </Link>
  )
}
