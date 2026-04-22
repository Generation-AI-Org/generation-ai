// Partners-Grid im Handout-Style — Unis & Firmen als Cells in einem 6-Col-Grid,
// thin borders zwischen den Cells, hover hebt die einzelne Zelle leicht.
// Stub-Partner (Deferred, CONTEXT.md) — wird durch echte Partner ersetzt, wenn
// die Kooperationen gesigned sind.

const partners = [
  "TU Berlin",
  "LMU München",
  "Uni Mannheim",
  "ETH Zürich",
  "WU Wien",
  "KIT",
  "Anthropic",
  "Make",
  "Perplexity",
  "ElevenLabs",
  "Bitkom",
  "KI-Bundesverband",
] as const

export function TrustSection() {
  return (
    <section
      aria-labelledby="trust-heading"
      data-section="trust"
      className="bg-bg py-24 sm:py-32 border-b border-border"
    >
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-12 text-center">
          <div className="inline-flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-text-muted mb-4">
            <span
              aria-hidden="true"
              className="h-1.5 w-1.5 rounded-full"
              style={{
                background: "var(--accent)",
                boxShadow: "0 0 8px var(--accent-glow)",
              }}
            />
            {"// unis · firmen · initiativen"}
          </div>
          <h2
            id="trust-heading"
            className="text-3xl sm:text-4xl font-bold tracking-tight text-text text-balance"
          >
            Im Sparring mit.
          </h2>
        </div>

        <div
          className="grid grid-cols-2 overflow-hidden rounded-2xl border border-border sm:grid-cols-3 md:grid-cols-6"
          style={{ background: "var(--border)", gap: "1px" }}
        >
          {partners.map((name) => (
            <div
              key={name}
              className="flex h-[100px] items-center justify-center bg-bg px-4 text-center font-mono text-[13px] font-bold tracking-[-0.01em] text-text-muted transition-colors duration-300 hover:bg-bg-card hover:text-text sm:text-[15px]"
            >
              {name}
            </div>
          ))}
        </div>

        <p className="mt-8 text-center font-mono text-[11px] uppercase tracking-[0.12em] text-text-muted">
          Beispiel-Auswahl · Gespräche laufen
        </p>
      </div>
    </section>
  )
}
