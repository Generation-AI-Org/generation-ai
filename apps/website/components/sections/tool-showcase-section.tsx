'use client'

import { ArrowUpRight } from "lucide-react"
import { useTheme } from "@/components/ThemeProvider"
import { InfiniteMovingCards } from "@/components/ui/infinite-moving-cards"

/**
 * BeispielBadge — Stub-Markierung für Demo/Dummy-Content.
 *
 * Ist in tool-showcase-section.tsx lokalisiert (nicht in @/components/ui/),
 * damit Plan 04 files_modified-Constraint eingehalten wird.
 * Plan 04 Task 3 (community-preview-section.tsx) importiert die Badge von hier.
 * Bei späterem Bedarf (Phase 26+): Refactor nach @/components/ui/beispiel-badge.tsx.
 *
 * Theme-Aware: .light → brand-red Tönung, dark (default) → brand-neon Tönung.
 * useTheme() fallback liefert 'dark' wenn kein ThemeProvider im Tree.
 */
export function BeispielBadge({ className = "" }: { className?: string }) {
  const { theme } = useTheme()
  const tone =
    theme === "light"
      ? "bg-brand-red-3 text-brand-red-12"
      : "bg-brand-neon-3 text-brand-neon-12"
  return (
    <span
      className={`inline-block text-[11px] font-mono font-bold rounded-full px-2 py-0.5 ${tone} ${className}`}
    >
      Beispiel
    </span>
  )
}

/**
 * Stub-Tools — identisch mit RESEARCH § D-11 locked data.
 * `title`-Feld trägt das "Beispiel"-Suffix → sichtbar pro Card im Marquee
 * (da InfiniteMovingCards das title-Feld als Sub-Zeile rendert).
 */
const stubTools = [
  {
    quote: "PDFs analysieren und zusammenfassen.",
    name: "ChatPDF Pro",
    title: "Recherche · Beispiel",
  },
  {
    quote: "KI-gestützte Notizen und Planung.",
    name: "Notion AI",
    title: "Produktivität · Beispiel",
  },
  {
    quote: "KI-Suchmaschine mit Quellen.",
    name: "Perplexity",
    title: "Recherche · Beispiel",
  },
  {
    quote: "Text-zu-Sprache für Präsentationen.",
    name: "ElevenLabs",
    title: "Audio · Beispiel",
  },
  {
    quote: "KI-Präsentationserstellung.",
    name: "Gamma",
    title: "Slides · Beispiel",
  },
] as const

export function ToolShowcaseSection() {
  return (
    <section
      aria-labelledby="tool-showcase-heading"
      data-section="tool-showcase"
      className="bg-bg py-24 sm:py-32 border-b border-border overflow-hidden"
    >
      <div className="mx-auto max-w-6xl px-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-6 mb-12">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-text-muted mb-3">
              Tool-Bibliothek
            </p>
            <h2
              id="tool-showcase-heading"
              className="text-3xl sm:text-4xl font-bold tracking-tight text-text"
            >
              Über 100 KI-Tools, kuratiert.
            </h2>
            <p className="mt-3 text-base text-text-secondary max-w-xl">
              Eine wachsende Bibliothek mit Anleitungen — sortiert nach Anwendungsfall.
              Diese Auswahl ist exemplarisch.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <BeispielBadge />
            <a
              href="https://tools.generation-ai.org"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm font-mono text-[var(--accent)] hover:text-[var(--accent-hover,var(--accent))] transition-colors"
            >
              Alle Tools ansehen
              <ArrowUpRight className="w-4 h-4" aria-hidden="true" />
            </a>
          </div>
        </div>

        <div data-stub="tool-showcase">
          <InfiniteMovingCards
            items={[...stubTools]}
            direction="left"
            speed="slow"
            pauseOnHover
            className="py-4"
          />
        </div>
      </div>
    </section>
  )
}
