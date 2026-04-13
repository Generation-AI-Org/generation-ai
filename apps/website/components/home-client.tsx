'use client'

import { useState } from 'react'
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Hero } from "@/components/hero"
import { Features } from "@/components/sections/features"
import { TargetAudience } from "@/components/sections/target-audience"
import { Signup } from "@/components/sections/signup"
import { TerminalSplash } from "@/components/terminal-splash"

export function HomeClient() {
  const [showContent, setShowContent] = useState(false)
  const [splashDone, setSplashDone] = useState(false)

  const handleSplashComplete = () => {
    setSplashDone(true)
    // Small delay for smooth transition
    setTimeout(() => setShowContent(true), 50)
  }

  return (
    <>
      {!splashDone && (
        <TerminalSplash onComplete={handleSplashComplete} skipIfSeen={true} />
      )}

      <div
        className={`transition-all duration-700 ${
          showContent
            ? 'opacity-100 translate-y-0'
            : 'opacity-0 translate-y-8'
        }`}
      >
        <Header />
        <main id="main-content" className="min-h-screen pt-16">
          <Hero />
          <Features />
          <TargetAudience />
          <Signup />
        </main>
        <Footer />
      </div>
    </>
  )
}
