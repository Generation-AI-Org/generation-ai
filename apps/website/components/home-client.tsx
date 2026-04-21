'use client'

import { useState } from 'react'
import { MotionConfig } from "motion/react"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { TerminalSplash } from "@/components/terminal-splash"
import { HeroSection } from "@/components/sections/hero-section"
// DiscrepancySection temporarily not mounted — visual concept rejected by Luca 2026-04-22, redesign in Phase 20.6
// import { DiscrepancySection } from "@/components/sections/discrepancy-section"
import { OfferingSection } from "@/components/sections/offering-section"
import { ToolShowcaseSection } from "@/components/sections/tool-showcase-section"
import { CommunityPreviewSection } from "@/components/sections/community-preview-section"
import { AudienceSplitSection } from "@/components/sections/audience-split-section"
import { TrustSection } from "@/components/sections/trust-section"
import { FinalCTASection } from "@/components/sections/final-cta-section"

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
        <main id="main-content" className="min-h-screen pt-16">
          {/* Phase 20 Wave-3 sections — Plans 03 (Hero, Discrepancy), 04 (Offering, ToolShowcase, CommunityPreview), 05 (AudienceSplit, Trust, FinalCTA) */}
          <HeroSection />
          {/* <DiscrepancySection /> — deferred to Phase 20.6 rebuild */}
          <OfferingSection />
          <ToolShowcaseSection />
          <CommunityPreviewSection />
          <AudienceSplitSection />
          <TrustSection />
          <FinalCTASection />
        </main>
        <Footer />
      </div>
    </MotionConfig>
  )
}
