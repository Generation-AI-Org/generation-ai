'use client'

import type { ReactNode } from 'react'
import { useState } from 'react'
import { MotionConfig } from "motion/react"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { TerminalSplash } from "@/components/terminal-splash"
import { HeroSection } from "@/components/sections/hero-section"
import { ProblemBlockSection } from "@/components/sections/problem-block-section"
import { OfferingSection } from "@/components/sections/offering-section"
import { TrustSection } from "@/components/sections/trust-section"
import { FinalCTASection } from "@/components/sections/final-cta-section"
import { KurzFaqSection } from "@/components/sections/kurz-faq-section"
import { SectionTransition } from "@/components/ui/section-transition"

// Phase 26 Plan 26-05 — Tool-Showcase + Community-Preview wandern auf
// async Server-Components (D-15, D-08). Diese Datei ist `'use client'`
// (TerminalSplash + state + MotionConfig) und kann sie deshalb nicht direkt
// importieren — React verbietet das. Wir nehmen sie als ReactNode-Props
// entgegen, die in `app/page.tsx` server-seitig gerendert werden.
//
// PRESERVED 1:1 (Plan 26-05 PLAN-CHECK Warning #5):
//   - TerminalSplash mount + onComplete + skipIfSeen
//   - showContent + splashDone state
//   - handleSplashComplete callback
//   - transition-wrapper div + classes (opacity/translate)
//   - <main id="main-content" className="min-h-screen pt-20">
//   - MotionConfig nonce wrapper (CSP-relevant, Phase 13)

type HomeClientProps = {
  nonce: string
  toolShowcase: ReactNode
  communityPreview: ReactNode
}

export function HomeClient({ nonce, toolShowcase, communityPreview }: HomeClientProps) {
  const [showContent, setShowContent] = useState(false)
  const [splashDone, setSplashDone] = useState(false)

  const handleSplashComplete = () => {
    setSplashDone(true)
    setTimeout(() => setShowContent(true), 50)
  }

  return (
    <MotionConfig nonce={nonce}>
      {!splashDone && (
        <TerminalSplash onComplete={handleSplashComplete} skipIfSeen={true} />
      )}

      <Header />

      <div
        className={`transition-all duration-700 ${
          showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
      >
        <main id="main-content" className="min-h-screen pt-20">
          <HeroSection />
          {/* Hero → Problem-Block: keine SectionTransition. Luca UAT
              2026-04-23: harte Hairline zerschnitt den narrativen Flow
              von Hero-LabeledNodes in den Problem-Block. Sections touchen
              direkt, Problem-Block hat eigenes Top-Padding für Breathing-
              Room. Signal-Echo-Anchor war als Opener gedacht, aber
              Luca las es als visuellen Cut statt als Connection. */}
          <ProblemBlockSection />
          <SectionTransition variant="soft-fade" />
          <OfferingSection />
          <SectionTransition variant="soft-fade" />
          {toolShowcase}
          <SectionTransition variant="soft-fade" />
          {communityPreview}
          <SectionTransition variant="soft-fade" />
          <TrustSection />
          <SectionTransition variant="signal-echo" />
          <FinalCTASection />
          {/* Final-CTA → Kurz-FAQ: keine SectionTransition. Der Connection-
              Beam aus Final-CTA uebernimmt die Bridging-Funktion (Luca UAT
              2026-04-23). Beam ragt 120px in Kurz-FAQ, Hairline wuerde
              dort nur mit dem Beam kollidieren. */}
          <KurzFaqSection />
        </main>
        <Footer />
      </div>
    </MotionConfig>
  )
}
