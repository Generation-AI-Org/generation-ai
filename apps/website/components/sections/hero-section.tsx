'use client'

// Stub for Plan 03 Task 1 — filled with Aurora background + Text-Generate-Effect claim + CTA.
// Do NOT remove the <section> element's data-section attribute — landing.spec.ts and
// the home-client integration rely on it to identify section order in the DOM.
export function HeroSection() {
  return (
    <section
      aria-labelledby="hero-stub-heading"
      data-section="hero"
      className="min-h-[60vh] flex items-center justify-center bg-bg border-b border-border"
    >
      <h2 id="hero-stub-heading" className="font-mono text-text-muted">
        [Hero — Plan 03 Task 1]
      </h2>
    </section>
  )
}
