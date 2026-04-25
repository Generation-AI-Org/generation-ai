'use client'

import { useState } from 'react'
import { MotionConfig } from "motion/react"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { TerminalSplash } from "@/components/terminal-splash"
import { HeroSection } from "@/components/sections/hero-section"
import { ProblemBlockSection } from "@/components/sections/problem-block-section"
import { OfferingSection } from "@/components/sections/offering-section"
import { ToolShowcaseSection } from "@/components/sections/tool-showcase-section"
import { CommunityPreviewSection } from "@/components/sections/community-preview-section"
import { TrustSection } from "@/components/sections/trust-section"
import { FinalCTASection } from "@/components/sections/final-cta-section"
import { KurzFaqSection } from "@/components/sections/kurz-faq-section"
import { SectionTransition } from "@/components/ui/section-transition"

type HomeClientProps = {
  nonce: string
}

export function HomeClient({ nonce }: HomeClientProps) {
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

      <div
        className={`transition-all duration-700 ${
          showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
      >
        <Header />
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
          <ToolShowcaseSection />
          <SectionTransition variant="soft-fade" />
          <CommunityPreviewSection />
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
