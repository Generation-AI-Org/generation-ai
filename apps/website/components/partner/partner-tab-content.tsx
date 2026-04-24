'use client'

import { motion, useReducedMotion } from "motion/react"

export type PartnerTyp = 'unternehmen' | 'stiftungen' | 'hochschulen' | 'initiativen'

interface TabContentData {
  slug: PartnerTyp
  heading: string
  valueProp: string
  vorteile: string[]
  formateLabel: string
  formate: string[]
  ctaLabel: string
}

const TAB_CONTENT: Record<PartnerTyp, TabContentData> = {
  unternehmen: {
    slug: 'unternehmen',
    heading: 'Employer Branding trifft echte Zielgruppe.',
    valueProp:
      'KI-kompetente Talente aus allen Fachrichtungen werden zur wertvollsten Zielgruppe im Recruiting der nächsten Jahre. Wir bringen euch zusammen.',
    vorteile: [
      'Early Access zu KI-affinen Talenten über alle Studiengänge hinweg',
      'Brand Association als zukunftsorientierter Arbeitgeber',
      'DACH-Reichweite über eine einzige Partnerschaft',
    ],
    formateLabel: 'Kooperationsformate',
    formate: ['Masterclasses', 'Speaker Sessions', 'Sponsoring & Sachleistungen'],
    ctaLabel: 'Gespräch vereinbaren',
  },
  stiftungen: {
    slug: 'stiftungen',
    heading: 'Impact mit Substanz.',
    valueProp:
      'Wir schließen eine Bildungslücke, die kein Lehrplan bisher adressiert. Fachrichtungsoffen, kostenlos, DACH-weit.',
    vorteile: [
      'Messbarer Impact in einer schnell wachsenden Zielgruppe',
      'Gemeinnütziger Verein (e.V. i.G.) mit transparenten Strukturen',
      'Hochschulübergreifende Reichweite ohne Mehraufwand',
    ],
    formateLabel: 'Förderformate',
    formate: [
      'Projekt- & Programm-Förderung',
      'Stipendienkooperationen',
      'Institutionelle Förderung',
    ],
    ctaLabel: 'Förderanfrage senden',
  },
  hochschulen: {
    slug: 'hochschulen',
    heading: 'Praxis direkt an die Uni.',
    valueProp:
      'Wir ergänzen den Lehrplan dort, wo KI-Kompetenz praxisnah erlernt werden muss. Kostenfrei für eure Studierenden, unaufwendig für euch.',
    vorteile: [
      'Praxisnahe KI-Skills, die der Lehrplan nicht abdecken kann',
      'Entlastung für Career Services und Lehrstühle',
      'Kostenloses Angebot für alle Studierenden',
    ],
    formateLabel: 'Kooperationsformate',
    formate: [
      'Vorlesungs- & Gastvorträge',
      'Career-Service-Integration',
      'Lehrstuhl- & Fachbereichskooperationen',
    ],
    ctaLabel: 'Kooperation anfragen',
  },
  initiativen: {
    slug: 'initiativen',
    heading: 'Gemeinsam mehr erreichen.',
    valueProp:
      'Wir glauben an Kollaboration statt Konkurrenz. Wenn ihr eine komplementäre Community habt, lasst uns gemeinsam etwas bauen.',
    vorteile: [
      'Geteilte Reichweite, geteilte Sichtbarkeit',
      'Fachrichtungsoffene Community als Multiplikator',
      'Gemeinsame Formate statt Einzelkämpfertum',
    ],
    formateLabel: 'Zusammenarbeitsformate',
    formate: ['Co-hosted Events & Workshops', 'Inhaltliche Cross-Promotion', 'Geteilte Speaker & Masterclasses'],
    ctaLabel: 'Unverbindlich kennenlernen',
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
                className="mx-auto max-w-4xl px-6 text-center"
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
                  className="mx-auto mt-4 max-w-2xl text-text-secondary leading-[1.65] text-balance"
                  style={{ fontSize: "var(--fs-body)" }}
                >
                  {data.valueProp}
                </p>

                {/* Vorteile-Grid */}
                <ul
                  className="mx-auto mt-10 grid max-w-3xl grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-6"
                  role="list"
                >
                  {data.vorteile.map((vorteil) => (
                    <li
                      key={vorteil}
                      className="rounded-2xl border border-border bg-bg-card p-5 text-left"
                    >
                      <span
                        aria-hidden="true"
                        className="mb-3 inline-block h-1.5 w-1.5 rounded-full"
                        style={{
                          background: "var(--accent)",
                          boxShadow: "0 0 8px var(--accent-glow)",
                        }}
                      />
                      <p
                        className="text-text-secondary leading-[1.5] text-pretty"
                        style={{ fontSize: "var(--fs-body)" }}
                      >
                        {vorteil}
                      </p>
                    </li>
                  ))}
                </ul>

                {/* Formate */}
                <div className="mt-10">
                  <p className="font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-text-muted mb-3">
                    {data.formateLabel}
                  </p>
                  <ul className="flex flex-wrap justify-center gap-3" role="list">
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
                <div className="mt-10 flex justify-center">
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
