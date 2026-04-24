'use client'

import { useCallback, useEffect, useRef } from "react"
import { PartnerTabContent } from "./partner-tab-content"
import type { PartnerTyp } from "./partner-tab-content"

const TABS: Array<{ slug: PartnerTyp; label: string }> = [
  { slug: 'unternehmen', label: 'Unternehmen' },
  { slug: 'stiftungen', label: 'Stiftungen' },
  { slug: 'hochschulen', label: 'Hochschulen' },
  { slug: 'initiativen', label: 'Initiativen' },
]

interface PartnerTabSystemProps {
  activeTyp: PartnerTyp
  onTypChange: (slug: PartnerTyp) => void
}

export function PartnerTabSystem({ activeTyp, onTypChange }: PartnerTabSystemProps) {
  const tabRailRef = useRef<HTMLDivElement>(null)

  const setActiveTyp = useCallback(
    (slug: PartnerTyp) => {
      onTypChange(slug)
    },
    [onTypChange],
  )

  // Scroll active tab into view (for deep-linked ?typ= mounts)
  useEffect(() => {
    const rail = tabRailRef.current
    if (!rail) return
    const activeTab = rail.querySelector('[aria-selected="true"]') as HTMLElement | null
    if (activeTab) {
      activeTab.scrollIntoView({ inline: 'center', behavior: 'smooth' })
    }
  }, [activeTyp])

  // Keyboard navigation: Arrow Left/Right
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLButtonElement>, currentIndex: number) => {
      let nextIndex: number | null = null
      if (e.key === 'ArrowRight') {
        nextIndex = (currentIndex + 1) % TABS.length
      } else if (e.key === 'ArrowLeft') {
        nextIndex = (currentIndex - 1 + TABS.length) % TABS.length
      } else if (e.key === 'Home') {
        nextIndex = 0
      } else if (e.key === 'End') {
        nextIndex = TABS.length - 1
      }

      if (nextIndex !== null) {
        e.preventDefault()
        const nextSlug = TABS[nextIndex]!.slug
        setActiveTyp(nextSlug)
        // Focus the next tab button
        const nextBtn = tabRailRef.current?.querySelector(
          `[id="${nextSlug}-tab"]`,
        ) as HTMLButtonElement | null
        nextBtn?.focus()
      }
    },
    [setActiveTyp],
  )

  return (
    <section
      aria-label="Partnertypen auswählen"
      data-section="partner-tab-system"
      className="relative bg-bg"
    >
      {/* Tab rail */}
      <div
        ref={tabRailRef}
        role="tablist"
        aria-label="Partnertypen"
        className="overflow-x-auto scrollbar-hide border-b border-border"
      >
        <div className="flex flex-nowrap gap-1 px-6 mx-auto max-w-4xl sm:justify-center">
          {TABS.map((tab, index) => {
            const isActive = tab.slug === activeTyp
            return (
              <button
                key={tab.slug}
                id={`${tab.slug}-tab`}
                role="tab"
                aria-selected={isActive}
                aria-controls={`${tab.slug}-panel`}
                onClick={() => setActiveTyp(tab.slug)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                tabIndex={isActive ? 0 : -1}
                className={[
                  'min-h-[44px] px-4 py-3 font-mono font-bold text-[14px] tracking-[0.02em] whitespace-nowrap transition-colors border-b-2',
                  'focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-text focus-visible:outline-offset-2 focus-visible:rounded-[4px]',
                  isActive
                    ? 'text-text border-[var(--accent)]'
                    : 'text-text-muted border-transparent hover:text-text-secondary',
                ].join(' ')}
                style={
                  isActive
                    ? { borderBottomColor: 'var(--accent)' }
                    : {}
                }
              >
                {tab.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Tab panels */}
      <PartnerTabContent activeTyp={activeTyp} />
    </section>
  )
}
