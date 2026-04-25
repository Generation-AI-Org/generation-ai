'use client'

// Client-Wrapper für /join (Phase 23). Pattern analog zu about-client.tsx:
//   - MotionConfig mit nonce für CSP-konforme motion/react styles (LEARNINGS.md)
//   - Header + <main> mit pt-20 (fixer Header überlagert sonst Content)
//   - Hero + Form-Section direkt hintereinander — KEIN <SectionTransition>
//     (UI-SPEC Layout Contract: D-19 Form soll auf Desktop ohne Scroll
//     angeteasert sein; eine Section-Transition würde die Form unter den Fold
//     schieben und widerspricht dem Kern-Requirement)
//   - Kein <SectionTransition> zwischen Form und Footer — Form schliesst als
//     finaler CTA-Cluster visuell selbst ab (AGENTS.md Ausnahme-Regel)

import { MotionConfig } from 'motion/react'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { JoinHeroSection } from '@/components/join/join-hero-section'
import { JoinFormSection } from '@/components/join/join-form-section'

export interface JoinClientProps {
  nonce: string
}

export function JoinClient({ nonce }: JoinClientProps) {
  return (
    <MotionConfig nonce={nonce}>
      <Header />
      <main id="main-content" className="min-h-screen pt-20">
        <JoinHeroSection />
        <JoinFormSection />
      </main>
      <Footer />
    </MotionConfig>
  )
}
