'use client'

import { MotionConfig } from 'motion/react'
import { useEffect, useRef } from 'react'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { LabeledNodes } from '@/components/ui/labeled-nodes'
import { CommunityBanner } from '@/components/welcome/community-banner'

interface Props {
  nonce: string
  name: string | null
  communityUrl: string
  showFallback: boolean
}

export default function WelcomeClient({ nonce, name, communityUrl, showFallback }: Props) {
  const h1Ref = useRef<HTMLHeadingElement | null>(null)
  useEffect(() => {
    h1Ref.current?.focus()
  }, [])

  return (
    <MotionConfig nonce={nonce}>
      <Header />
      <main id="main-content" className="min-h-screen pt-20">
        <section className="relative isolate">
          <LabeledNodes />
          <div className="relative z-10 mx-auto max-w-4xl px-6 py-20 text-center">
            <h1
              ref={h1Ref}
              tabIndex={-1}
              className="outline-none"
              style={{
                fontSize: 'var(--fs-display)',
                lineHeight: 1.02,
                letterSpacing: '-0.03em',
                textShadow:
                  '0 0 18px rgba(var(--bg-rgb), 1), 0 0 8px rgba(var(--bg-rgb), 1)',
              }}
            >
              Du bist drin.
            </h1>
            <p
              className="mt-6 text-lg sm:text-xl max-w-2xl mx-auto"
              style={{
                lineHeight: 1.5,
                textShadow:
                  '0 0 10px rgba(var(--bg-rgb), 1), 0 0 4px rgba(var(--bg-rgb), 1)',
              }}
            >
              {showFallback
                ? "Dein Account ist aktiv. Jetzt noch ein Klick zur Community."
                : 'Dein Account ist aktiv.'}
            </p>

            {showFallback && (
              <div className="mt-10 mx-auto max-w-xl">
                <CommunityBanner communityUrl={communityUrl} name={name} />
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </MotionConfig>
  )
}
