'use client'

// Client-Wrapper für /about (Phase 21). Analog zu home-client.tsx, aber:
//   - KEIN Terminal-Splash (ist Landing-only Intro)
//   - MotionConfig mit nonce für CSP-konforme motion/react styles
//   - Header (mit Skip-Link + Nav + Mobile-Menu) + Footer global gemountet
//   - Kein Transition-Padding (pt-20) auf <main> nötig — Header ist fixed,
//     aber About-Hero hat py-28 sm:py-36 und startet dadurch mit genug
//     Offset unterhalb des Headers (Header h-20 = 80px, Hero py-28 = 112px top).
//     ABER: fixed Header überlagert Content — wir brauchen trotzdem pt-20 auf
//     <main>, sonst scrollt Hero unter den Header. Gleiches Pattern wie
//     home-client.tsx.

import { MotionConfig } from "motion/react"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { AboutHeroSection } from "@/components/about/about-hero-section"
import { AboutStorySection } from "@/components/about/about-story-section"
import { AboutTeamSection } from "@/components/about/about-team-section"
import { AboutValuesSection } from "@/components/about/about-values-section"
import { AboutVereinSection } from "@/components/about/about-verein-section"
import { AboutMitmachCTASection } from "@/components/about/about-mitmach-cta-section"
import { AboutFaqSection } from "@/components/about/about-faq-section"
import { AboutFinalCTASection } from "@/components/about/about-final-cta-section"
import { AboutKontaktSection } from "@/components/about/about-kontakt-section"

type AboutClientProps = {
  nonce: string
}

export function AboutClient({ nonce }: AboutClientProps) {
  return (
    <MotionConfig nonce={nonce}>
      <Header />
      <main id="main-content" className="min-h-screen pt-20">
        <AboutHeroSection />
        <AboutStorySection />
        <AboutTeamSection />
        <AboutValuesSection />
        <AboutVereinSection />
        <AboutMitmachCTASection />
        <AboutFaqSection />
        <AboutFinalCTASection />
        <AboutKontaktSection />
      </main>
      <Footer />
    </MotionConfig>
  )
}
