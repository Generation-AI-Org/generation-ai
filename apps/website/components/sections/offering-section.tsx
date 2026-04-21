'use client'

import Link from "next/link"
import { Users, BookOpen, Calendar, Mic2, ArrowUpRight } from "lucide-react"
import { BentoGrid, BentoGridItem } from "@/components/ui/bento-grid"

type OfferingCard = {
  title: string
  description: string
  href: string
  external: boolean
  icon: React.ReactNode
}

const cards: OfferingCard[] = [
  {
    title: "Community",
    description: "Lebendiger Austausch, Peer-Learning und Sparring im Circle.",
    href: "https://community.generation-ai.org",
    external: true,
    icon: <Users className="w-6 h-6" aria-hidden="true" />,
  },
  {
    title: "Wissensplattform",
    description: "Kuratierte KI-Tools mit Anleitungen für den Studi-Alltag.",
    href: "https://tools.generation-ai.org",
    external: true,
    icon: <BookOpen className="w-6 h-6" aria-hidden="true" />,
  },
  {
    title: "Events & Workshops",
    description: "Hands-on Sessions zu Prompting, Automatisierung, Tools.",
    href: "/about",
    external: false,
    icon: <Calendar className="w-6 h-6" aria-hidden="true" />,
  },
  {
    title: "Expert-Formate",
    description: "Masterclasses und Q&A mit Praktiker:innen aus der Branche.",
    href: "/about",
    external: false,
    icon: <Mic2 className="w-6 h-6" aria-hidden="true" />,
  },
]

export function OfferingSection() {
  return (
    <section
      aria-labelledby="offering-heading"
      data-section="offering"
      className="bg-bg py-24 sm:py-32 border-b border-border"
    >
      <div className="mx-auto max-w-6xl px-6">
        <div className="text-center mb-16">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-text-muted mb-3">
            Was wir anbieten
          </p>
          <h2
            id="offering-heading"
            className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-text"
          >
            Vier Säulen, ein Ziel.
          </h2>
        </div>

        <BentoGrid className="max-w-5xl mx-auto md:grid-cols-2 lg:grid-cols-4 md:auto-rows-[14rem]">
          {cards.map((card) => {
            const titleNode = (
              <span className="inline-flex items-center gap-2">
                {card.title}
                <ArrowUpRight
                  className="w-4 h-4 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all"
                  aria-hidden="true"
                />
              </span>
            )
            const iconNode = (
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-[var(--accent-soft,rgba(0,255,128,0.08))] text-[var(--accent)]">
                {card.icon}
              </div>
            )
            const itemClass =
              "h-full bg-bg-card border border-border hover:border-brand-neon-6 hover:shadow-[0_0_20px_var(--accent-glow)] transition-all duration-300"

            if (card.external) {
              return (
                <a
                  key={card.title}
                  href={card.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group block"
                >
                  <BentoGridItem
                    title={titleNode}
                    description={card.description}
                    icon={iconNode}
                    className={itemClass}
                  />
                </a>
              )
            }

            return (
              <Link key={card.title} href={card.href} className="group block">
                <BentoGridItem
                  title={titleNode}
                  description={card.description}
                  icon={iconNode}
                  className={itemClass}
                />
              </Link>
            )
          })}
        </BentoGrid>
      </div>
    </section>
  )
}
