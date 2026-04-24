'use client'

// Client-Wrapper für /partner (Phase 22). Analog zu about-client.tsx:
//   - MotionConfig mit nonce für CSP-konforme motion/react styles
//   - Header + Footer global gemountet
//   - pt-20 auf <main> (fixed Header h-20 = 80px)
//
// Section-Reihenfolge (UI-SPEC Zeilen 218-235):
//   1. Hero (kein SectionTransition danach — immediate continuity)
//   2. TabSystem (4 Tabs: Unternehmen, Stiftungen, Hochschulen, Initiativen)
//   [SectionTransition soft-fade]
//   3. TrustSection (Component-Reuse aus sections/, D-08)
//   [SectionTransition soft-fade]
//   4. Kontaktformular + PersonCards (gleicher Section-Container)
//   [SectionTransition signal-echo]
//   5. VereinHint (Transparenz-Hinweis)

import { useState, useCallback } from "react"
import { MotionConfig, motion, useReducedMotion } from "motion/react"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { SectionTransition } from "@/components/ui/section-transition"
import { TrustSection } from "@/components/sections/trust-section"
import { PartnerHeroSection } from "@/components/partner/partner-hero-section"
import { PartnerTabSystem } from "@/components/partner/partner-tab-system"
import { PartnerContactForm } from "@/components/partner/partner-contact-form"
import { PartnerPersonCards } from "@/components/partner/partner-person-card"
import { PartnerVereinHint } from "@/components/partner/partner-verein-hint"
import type { PartnerTyp } from "@/components/partner/partner-tab-content"

type PartnerClientProps = {
  nonce: string
  initialTyp?: string
}

function ContactSection({ activeTyp }: { activeTyp: PartnerTyp }) {
  const prefersReducedMotion = useReducedMotion()

  const fadeIn = prefersReducedMotion
    ? {}
    : {
        initial: { opacity: 0, y: 16 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, margin: '-10% 0px' },
        transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const },
      }

  return (
    <section
      id="kooperation-anfragen"
      aria-labelledby="partner-kontakt-heading"
      data-section="partner-kontakt"
      className="relative bg-bg py-24 sm:py-32"
    >
      <div className="mx-auto max-w-4xl px-6">
        {/* Eyebrow */}
        <motion.div
          {...fadeIn}
          className="mx-auto mb-5 flex items-center justify-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-text-muted"
        >
          <span
            aria-hidden="true"
            className="h-1.5 w-1.5 rounded-full"
            style={{ background: "var(--accent)", boxShadow: "0 0 8px var(--accent-glow)" }}
          />
          {"// kooperation anfragen"}
        </motion.div>

        {/* H2 */}
        <motion.h2
          {...fadeIn}
          id="partner-kontakt-heading"
          className="text-center font-sans font-bold text-text text-balance mb-12"
          style={{ fontSize: "var(--fs-h2)", lineHeight: "var(--lh-headline)" }}
        >
          Jetzt Kontakt aufnehmen
        </motion.h2>

        {/* Contact form */}
        <PartnerContactForm activeTyp={activeTyp} />

        {/* Person cards — same section, no transition */}
        <div className="mt-20">
          <PartnerPersonCards />
        </div>
      </div>
    </section>
  )
}

const VALID_SLUGS = new Set<string>(['unternehmen', 'stiftungen', 'hochschulen', 'initiativen'])

export function PartnerClient({ nonce, initialTyp }: PartnerClientProps) {
  const resolvedTyp: PartnerTyp =
    initialTyp && VALID_SLUGS.has(initialTyp)
      ? (initialTyp as PartnerTyp)
      : 'unternehmen'

  const [activeTyp, setActiveTyp] = useState<PartnerTyp>(resolvedTyp)

  const handleTypChange = useCallback((slug: PartnerTyp) => {
    setActiveTyp(slug)
    window.history.pushState(null, '', `?typ=${slug}`)
  }, [])

  return (
    <MotionConfig nonce={nonce}>
      <Header />
      <main id="main-content" className="min-h-screen pt-20">
        <PartnerHeroSection />
        {/* Hero → TabSystem: keine SectionTransition (immediate continuity) */}
        <PartnerTabSystem activeTyp={activeTyp} onTypChange={handleTypChange} />
        <SectionTransition variant="soft-fade" />
        <TrustSection />
        <SectionTransition variant="soft-fade" />
        <ContactSection activeTyp={activeTyp} />
        <SectionTransition variant="signal-echo" />
        <PartnerVereinHint />
      </main>
      <Footer />
    </MotionConfig>
  )
}
