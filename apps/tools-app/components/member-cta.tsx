import Link from 'next/link'

const chips = ['Community', 'Events', 'Bessere Empfehlungen', 'Stärkerer Assistent'] as const

export function MemberCTA() {
  return (
    <section className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8" aria-labelledby="member-cta-heading">
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] px-5 py-5 shadow-[var(--shadow-sm)] md:flex md:items-center md:justify-between md:gap-8 md:px-6">
        <div className="max-w-2xl">
          <p className="font-mono text-[11px] font-bold uppercase tracking-[0.08em] text-[var(--accent)]">
            Member-Modus
          </p>
          <h2 id="member-cta-heading" className="mt-2 text-xl font-bold text-[var(--text)] md:text-2xl">
            Mehr aus den Tools rausholen.
          </h2>
          <p className="mt-2 text-sm leading-[1.65] text-[var(--text-secondary)]">
            Als Mitglied bekommst du Community-Zugang, Events und einen stärkeren KI-Assistenten mit tieferen Empfehlungen.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {chips.map((chip) => (
              <span
                key={chip}
                className="rounded-full border border-[var(--border)] bg-[var(--accent-soft)] px-3 py-1 text-xs font-mono text-[var(--text)]"
              >
                {chip}
              </span>
            ))}
          </div>
        </div>
        <div className="mt-5 flex flex-col items-start gap-2 sm:flex-row md:mt-0 md:shrink-0 md:flex-col lg:flex-row">
          <a
            href="https://generation-ai.org/join?utm_source=tools"
            data-cta="member-panel-register"
            className="inline-flex min-h-[44px] w-[calc(100%-5rem)] items-center justify-center rounded-full bg-[var(--accent)] px-4 py-2.5 text-sm font-mono font-bold text-[var(--text-on-accent)] transition-[box-shadow,transform] duration-300 hover:scale-[1.03] hover:shadow-[0_0_20px_var(--accent-glow)] active:scale-[0.98] sm:w-auto"
          >
            Kostenlos Mitglied werden
          </a>
          <Link
            href="/login"
            data-cta="member-panel-login"
            className="inline-flex min-h-[44px] w-[calc(100%-5rem)] items-center justify-center rounded-full border border-[var(--border)] px-4 py-2.5 text-sm font-mono font-bold text-[var(--text)] transition-[background-color,border-color,color] duration-300 hover:border-[var(--border-accent)] hover:bg-[var(--accent-soft)] sm:w-auto"
          >
            Bereits Mitglied? Einloggen
          </Link>
        </div>
      </div>
    </section>
  )
}
