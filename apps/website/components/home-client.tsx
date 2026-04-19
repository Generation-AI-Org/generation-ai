'use client'

import { useState } from 'react'
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { TerminalSplash } from "@/components/terminal-splash"

export function HomeClient() {
  const [showContent, setShowContent] = useState(false)
  const [splashDone, setSplashDone] = useState(false)

  const handleSplashComplete = () => {
    setSplashDone(true)
    setTimeout(() => setShowContent(true), 50)
  }

  return (
    <>
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
          {/* Phase 20 Wave 2 (Plan 02) wires Header + sections here. */}
          {/* Phase 20 Wave 3 (Plans 03-05) fills in the section components. */}
        </main>
        <Footer />
      </div>
    </>
  )
}
