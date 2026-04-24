// PartnerVereinHint — Transparenz-Hinweis unter den Ansprechpersonen.
//
// Text: "Generation AI ist ein gemeinnütziger Verein (e.V. i.G.). Mehr zur Vereinsstruktur →"
// Link: /about#verein (Anker greift sobald Phase 21 live — D-10 CONTEXT.md)
//
// Server Component — pure render, keine Hooks.

import Link from "next/link"

export function PartnerVereinHint() {
  return (
    <section
      aria-label="Transparenzhinweis"
      data-section="partner-verein-hint"
      className="py-12"
    >
      <p className="text-center text-text-muted leading-[1.65]" style={{ fontSize: "var(--fs-body)" }}>
        Generation AI ist ein gemeinnütziger Verein (e.V. i.G.).{" "}
        <Link
          href="/about#verein"
          className="text-text-muted hover:text-[var(--accent)] underline underline-offset-4 transition-colors duration-[var(--dur-fast)]"
        >
          Mehr zur Vereinsstruktur →
        </Link>
      </p>
    </section>
  )
}
