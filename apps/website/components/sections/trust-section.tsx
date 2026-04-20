import { Marquee } from "@/components/ui/marquee"

// Plan 20-05 Task 2 — R1.8 / D-14
// Stub-Logos (Sparringspartner-Assets sind Deferred, CONTEXT.md "Deferred Ideas") als Text-Pills.
// Marquee bleibt IMMER im DOM → CSS-Guard in globals.css pausiert `.animate-marquee`
// bei prefers-reduced-motion (Plan 01 reduced-motion guard). Keine JS-Seite nötig:
// useReducedMotion() würde auf SSR null liefern und zu Hydration-Mismatch führen.
const stubPartners = [
  "Sparringspartner 1",
  "Sparringspartner 2",
  "Sparringspartner 3",
  "Sparringspartner 4",
  "Sparringspartner 5",
  "Sparringspartner 6",
] as const

function PartnerTile({ name }: { name: string }) {
  return (
    <div className="mx-4 inline-flex items-center justify-center min-w-[180px] h-16 rounded-xl border border-border bg-bg-card px-6">
      <span className="font-mono text-xs uppercase tracking-wider text-text-muted whitespace-nowrap">
        {name}
      </span>
    </div>
  )
}

export function TrustSection() {
  // Reduced-motion wird rein per CSS-Guard in globals.css behandelt
  // (`@media (prefers-reduced-motion: reduce)` → `.animate-marquee` paused).
  // Keine JS-Hook-Lösung hier: useReducedMotion() liefert auf SSR null und
  // auf Client true/false, was einen Hydration-Mismatch im className-String
  // erzeugen würde (HI-01 aus Phase-20 code review).

  return (
    <section
      aria-labelledby="trust-heading"
      data-section="trust"
      className="bg-bg-elevated py-20 border-b border-border"
    >
      <div className="mx-auto max-w-6xl px-6">
        <p
          id="trust-heading"
          className="font-mono text-xs uppercase tracking-[0.2em] text-text-muted text-center mb-10"
        >
          Im Sparring mit
        </p>

        <Marquee pauseOnHover className="[--duration:40s]">
          {stubPartners.map((name) => (
            <PartnerTile key={name} name={name} />
          ))}
        </Marquee>

        {/* Microproof per R1.8 — exact string locked */}
        <p className="mt-10 text-center font-mono text-xs text-text-muted">
          N=109 · März 2026
        </p>
      </div>
    </section>
  )
}
