'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import { MotionConfig } from "motion/react"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { HeroSection } from "@/components/sections/hero-section"
import { OfferingSection } from "@/components/sections/offering-section"

// Splash nur für Erstbesucher (sessionStorage-Check intern) → client-only, aus
// dem Initial-Bundle raus. Wiederkehrer laden diesen Chunk nie.
const TerminalSplash = dynamic(
  () => import("@/components/terminal-splash").then(m => m.TerminalSplash),
  { ssr: false },
)

// Under-the-fold Sections lazy-loaded → kleinerer Critical-Path-Bundle,
// bessere TBT/LCP. Kein Loading-Skeleton nötig, da die Sections per Scroll
// erreicht werden; React hydriert sie rechtzeitig.
const ToolShowcaseSection = dynamic(
  () => import("@/components/sections/tool-showcase-section").then(m => m.ToolShowcaseSection),
)
const CommunityPreviewSection = dynamic(
  () => import("@/components/sections/community-preview-section").then(m => m.CommunityPreviewSection),
)
const TrustSection = dynamic(
  () => import("@/components/sections/trust-section").then(m => m.TrustSection),
)
const FinalCTASection = dynamic(
  () => import("@/components/sections/final-cta-section").then(m => m.FinalCTASection),
)

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
          {/* Above-the-fold (sync): Hero + Offering.
              Below-the-fold (dynamic): ToolShowcase, CommunityPreview, Trust, FinalCTA. */}
          <HeroSection />
          <OfferingSection />
          <ToolShowcaseSection />
          <CommunityPreviewSection />
          <TrustSection />
          <FinalCTASection />
        </main>
        <Footer />
      </div>
    </MotionConfig>
  )
}
