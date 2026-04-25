'use client'

// apps/website/components/test/test-client.tsx
// Phase 24 — /test landing client wrapper (MotionConfig + Header + Footer).

import { MotionConfig } from 'motion/react'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { TestHeroSection } from '@/components/test/test-hero-section'

export function TestClient({ nonce }: { nonce: string }) {
  return (
    <MotionConfig nonce={nonce}>
      <Header />
      <main id="main-content" className="min-h-screen pt-20">
        <TestHeroSection />
      </main>
      <Footer />
    </MotionConfig>
  )
}
