'use client'

import { motion, useReducedMotion } from "motion/react"

export type PartnerTyp = 'unternehmen' | 'stiftungen' | 'hochschulen' | 'initiativen'

interface TabContentData {
  slug: PartnerTyp
  heading: string
  valueProp: string
  formateLabel: string
  formate: string[]
  ctaLabel: string
}

const TAB_CONTENT: Record<PartnerTyp, TabContentData> = {
  unternehmen: {
    slug: 'unternehmen',
    heading: 'Employer Branding trifft echte Zielgruppe.',
    valueProp:
      'Erreicht KI-affine Studierende im DACH-Raum, die aktiv an ihrer Karriere arbeiten. Mit uns präsentiert ihr euch dort, wo die nächste Generation von KI-Talenten bereits aktiv ist.',
    formateLabel: 'Kooperationsformate',
    formate: ['Masterclasses', 'Speaker Sessions', 'Sponsoring'],
    ctaLabel: 'Jetzt Anfrage stellen',
  },
  stiftungen: {
    slug: 'stiftungen',
    heading: 'Impact mit Substanz.',
    valueProp:
      'Fördert Bildungsgerechtigkeit im KI-Bereich — gemeinnützig, transparent und mit messbarem Wirkung. Generation AI schafft Zugangsmöglichkeiten für Studierende, die sich KI-Weiterbildung sonst nicht leisten könnten.',
    formateLabel: 'Förderformate',
    formate: [
      'Projekt- und Programm-Förderung',
      'Stipendien',
      'Institutionelle Förderung',
    ],
    ctaLabel: 'Kooperation anfragen',
  },
  hochschulen: {
    slug: 'hochschulen',
    heading: 'Praxis direkt an die Uni.',
    valueProp:
      'Bringt aktuelle KI-Expertise in den Lehrplan. Unsere Speaker und Formate ergänzen euer Studienangebot mit praxisnahen Einblicken aus Industrie und Forschung.',
    formateLabel: 'Kooperationsformate',
    formate: [
      'Gastvorträge',
      'Career-Service-Integration',
      'Lehrstuhl-Kooperationen',
    ],
    ctaLabel: 'Kooperation anfragen',
  },
  initiativen: {
    slug: 'initiativen',
    heading: 'Gemeinsam mehr erreichen.',
    valueProp:
      'Ihr arbeitet an ähnlichen Zielen? Dann lasst uns Kräfte bündeln. Co-Hosting, Reichweiten-Sharing und gemeinsame Speaker-Pools — für mehr Impact auf beiden Seiten.',
    formateLabel: 'Zusammenarbeitsformate',
    formate: ['Co-hosted Events', 'Cross-Promotion', 'Geteilte Speaker'],
    ctaLabel: 'Kontakt aufnehmen',
  },
}

interface PartnerTabContentProps {
  activeTyp: PartnerTyp
}

export function PartnerTabContent({ activeTyp }: PartnerTabContentProps) {
  const prefersReducedMotion = useReducedMotion()

  const panels = (['unternehmen', 'stiftungen', 'hochschulen', 'initiativen'] as PartnerTyp[])

  return (
    <>
      {panels.map((slug) => {
        const data = TAB_CONTENT[slug]
        const isActive = slug === activeTyp
        return (
          <div
            key={slug}
            role="tabpanel"
            id={`${slug}-panel`}
            aria-labelledby={`${slug}-tab`}
            tabIndex={isActive ? 0 : -1}
            hidden={!isActive}
            className="py-12 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-text rounded-lg"
          >
            {isActive && (
              <motion.div
                key={slug}
                initial={prefersReducedMotion ? false : { opacity: 0, y: 8 }}
                animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="mx-auto max-w-4xl px-6"
              >
                {/* H2 */}
                <h2
                  className="font-sans font-bold text-text text-balance"
                  style={{
                    fontSize: "var(--fs-h2)",
                    lineHeight: "var(--lh-headline)",
                    letterSpacing: "-0.015em",
                  }}
                >
                  {data.heading}
                </h2>

                {/* Value prop */}
                <p
                  className="mt-4 text-text-secondary leading-[1.65]"
                  style={{ fontSize: "var(--fs-body)" }}
                >
                  {data.valueProp}
                </p>

                {/* Formate */}
                <div className="mt-8">
                  <p className="font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-text-muted mb-3">
                    {data.formateLabel}
                  </p>
                  <ul className="flex flex-wrap gap-3" role="list">
                    {data.formate.map((format) => (
                      <li
                        key={format}
                        className="rounded-full border border-border px-4 py-2 font-mono text-[13px] font-bold text-text-secondary"
                      >
                        {format}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* CTA — scroll to contact form */}
                <div className="mt-10">
                  <a
                    href="#kooperation-anfragen"
                    className="inline-flex items-center gap-2 rounded-full px-6 py-3 font-mono font-bold text-[14px] tracking-[0.02em] transition-all duration-300"
                    style={{
                      background: "var(--accent)",
                      color: "var(--text-on-accent)",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.boxShadow = "0 0 20px var(--accent-glow)"
                      e.currentTarget.style.transform = "scale(1.03)"
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.boxShadow = ""
                      e.currentTarget.style.transform = ""
                    }}
                  >
                    {data.ctaLabel}
                  </a>
                </div>
              </motion.div>
            )}
          </div>
        )
      })}
    </>
  )
}
