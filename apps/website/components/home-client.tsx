'use client'

import type { ReactNode } from 'react'
import { useState } from 'react'
import { MotionConfig } from "motion/react"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { TerminalSplash } from "@/components/terminal-splash"
import { HeroSection } from "@/components/sections/hero-section"
import { OfferingSection } from "@/components/sections/offering-section"
import { TrustSection } from "@/components/sections/trust-section"
import { FinalCTASection } from "@/components/sections/final-cta-section"

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

      <div
        className={`transition-all duration-700 ${
          showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
      >
        <Header />
        <main id="main-content" className="min-h-screen pt-20">
          <HeroSection />
          <OfferingSection />
          {toolShowcase}
          {communityPreview}
          <TrustSection />
          <FinalCTASection />
        </main>
        <Footer />
      </div>
    </MotionConfig>
  )
}
