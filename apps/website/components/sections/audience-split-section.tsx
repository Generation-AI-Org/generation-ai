'use client'

import Link from "next/link"
import { ArrowRight, ArrowUpRight } from "lucide-react"

// Plan 20-05 Task 1 — R1.7 / D-13 / D-22 / D-23
// Studi-Block is visually dominant (H2 text-3xl→5xl + primary CTA → /join).
// B2B-strip is visually subdued (text-xs/sm, bg-bg-elevated, smaller footprint).
export function AudienceSplitSection() {
  return (
    <section
      aria-labelledby="audience-split-heading"
      data-section="audience-split"
      className="bg-bg border-b border-border"
    >
      {/* Primary — Für Studierende */}
      <div className="py-24 sm:py-32">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-text-muted mb-4">
            Für Studierende &amp; Early-Career
          </p>
          <h2
            id="audience-split-heading"
            className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-text"
          >
            Du fängst gerade an oder steckst mittendrin?
          </h2>
          <p className="mt-6 text-lg text-text-secondary max-w-2xl mx-auto">
            Hol dir die Tools, das Wissen und die Community, die im Studium fehlen — kostenlos.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/join"
              className="inline-flex items-center gap-2 bg-[var(--accent)] text-[var(--text-on-accent)] px-6 py-3 rounded-full text-sm font-mono font-bold transition-all duration-300 hover:shadow-[0_0_20px_var(--accent-glow)] hover:scale-[1.03]"
            >
              Jetzt beitreten
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
            <a
              href="https://tools.generation-ai.org"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm font-mono text-text-muted hover:text-text transition-colors"
            >
              Erst mal umschauen
              <ArrowUpRight className="w-4 h-4" aria-hidden="true" />
            </a>
          </div>
        </div>
      </div>

      {/* Dezent — B2B-Streifen */}
      <div className="bg-bg-elevated border-t border-border">
        <div className="mx-auto max-w-4xl px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-center sm:text-left">
            <p className="font-mono text-xs uppercase tracking-wider text-text-muted">
              Für Unternehmen, Stiftungen, Hochschulen
            </p>
            <p className="text-sm text-text-secondary">
              Kooperation statt Standard — wir sprechen über Masterclasses, Talent-Zugang und Förderung.
            </p>
          </div>
          <Link
            href="/partner"
            className="inline-flex items-center gap-1 text-sm font-mono text-text-muted hover:text-[var(--accent)] transition-colors whitespace-nowrap"
          >
            Für Partner
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  )
}
