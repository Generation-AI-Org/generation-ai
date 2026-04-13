'use client'

import { Check } from 'lucide-react'

const benefits = [
  'Komplett kostenlos für alle Studierenden',
  'Kuratierte Tools statt endloser Recherche',
  'Community mit echtem Austausch',
  'Von Studierenden für Studierende',
]

export function TargetAudience() {
  return (
    <section className="py-20 md:py-28 px-4 bg-bg-elevated">
      <div className="max-w-4xl mx-auto text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 mb-8">
          <span className="text-sm text-accent font-medium">DACH-Region</span>
        </div>

        {/* Headline */}
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-text mb-6">
          Für Studierende, die KI
          <span className="block text-accent mt-2">wirklich verstehen wollen</span>
        </h2>

        {/* Subline */}
        <p className="text-text-secondary text-lg md:text-xl max-w-2xl mx-auto mb-12 leading-relaxed">
          Egal ob du gerade erst anfängst oder schon Erfahrung hast —
          bei uns findest du die richtigen Tools, Wissen und Leute.
        </p>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl mx-auto">
          {benefits.map((benefit) => (
            <div
              key={benefit}
              className="flex items-center gap-3 text-left p-4 rounded-xl bg-bg border border-border"
            >
              <div className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center shrink-0">
                <Check className="w-4 h-4 text-accent" />
              </div>
              <span className="text-text text-sm font-medium">{benefit}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
