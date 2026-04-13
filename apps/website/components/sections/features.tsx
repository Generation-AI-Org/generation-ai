'use client'

import { Sparkles, Users, GraduationCap, Calendar } from 'lucide-react'

const features = [
  {
    icon: Sparkles,
    title: 'KI-Tool-Bibliothek',
    description: 'Die besten KI-Tools für Studium und Alltag — kuratiert und erklärt.',
    available: true,
  },
  {
    icon: Users,
    title: 'Community',
    description: 'Vernetze dich mit anderen KI-Interessierten im DACH-Raum.',
    available: true,
  },
  {
    icon: GraduationCap,
    title: 'Kurse & Guides',
    description: 'Lerne KI praktisch anzuwenden — von Basics bis Advanced.',
    available: false,
  },
  {
    icon: Calendar,
    title: 'Events',
    description: 'Webinare, Workshops und Talks mit Experten aus der Branche.',
    available: false,
  },
]

export function Features() {
  return (
    <section id="features" className="py-20 md:py-28 px-4 bg-bg">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-text mb-4">
            Was wir bieten
          </h2>
          <p className="text-text-secondary text-lg max-w-2xl mx-auto">
            Alles was du brauchst um KI sinnvoll in deinem Studium einzusetzen.
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group relative p-6 rounded-2xl bg-bg-card border border-border hover:border-accent/30 transition-all duration-300"
            >
              {/* Coming Soon Badge */}
              {!feature.available && (
                <span className="absolute top-4 right-4 text-xs font-medium text-text-muted bg-bg-elevated px-2 py-1 rounded-full">
                  Coming Soon
                </span>
              )}

              {/* Icon */}
              <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-4 group-hover:bg-accent/20 transition-colors">
                <feature.icon className="w-6 h-6 text-accent" />
              </div>

              {/* Content */}
              <h3 className="text-lg font-semibold text-text mb-2">
                {feature.title}
              </h3>
              <p className="text-text-muted text-sm leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
