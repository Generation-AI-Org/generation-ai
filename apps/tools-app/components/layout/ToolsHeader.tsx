'use client'

import { MarketingHeader } from '@genai/ui'
import { useTheme } from '@/components/ThemeProvider'
import { AccountMenu } from '@/components/layout/AccountMenu'
import type { ChatMode } from '@/lib/types'

const navLinks = [
  { label: 'Tools', href: 'https://tools.generation-ai.org' },
  { label: 'Events', href: 'https://generation-ai.org/events' },
  { label: 'Community', href: 'https://generation-ai.org/community' },
] as const

const partnerLinks = [
  { label: 'Unternehmen', href: 'https://generation-ai.org/partner?typ=unternehmen' },
  { label: 'Stiftungen', href: 'https://generation-ai.org/partner?typ=stiftungen' },
  { label: 'Hochschulen', href: 'https://generation-ai.org/partner?typ=hochschulen' },
  { label: 'Initiativen', href: 'https://generation-ai.org/partner?typ=initiativen' },
] as const

interface ToolsHeaderProps {
  mode: ChatMode
  openSearch: (() => void) | null
  onClearHighlights: () => void
}

export function ToolsHeader({ mode, openSearch, onClearHighlights }: ToolsHeaderProps) {
  const { theme, toggleTheme } = useTheme()

  return (
    <MarketingHeader
      theme={theme}
      toggleTheme={toggleTheme}
      logoHref="https://generation-ai.org"
      navLinks={navLinks}
      partnerHref="https://generation-ai.org/partner"
      partnerLinks={partnerLinks}
      aboutHref="https://generation-ai.org/about"
      ctaHref="https://generation-ai.org/join?utm_source=tools"
      fixed={false}
      onClear={onClearHighlights}
      searchSlot={
        openSearch ? (
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation()
              openSearch()
            }}
            className={`group inline-flex min-h-[44px] w-[76px] items-center justify-center gap-2 rounded-full px-3 py-2 text-sm font-mono text-white transition-[background-color,transform,color] duration-300 hover:scale-[1.03] ${
              theme === 'dark'
                ? 'bg-white/10 hover:bg-white/15'
                : 'bg-black/20 hover:bg-black/25'
            }`}
            aria-label="Suche öffnen"
          >
            <svg className="h-4 w-4 text-[var(--accent)] transition-transform duration-300 group-hover:rotate-[-12deg] group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <kbd className="rounded-full bg-white/10 px-1.5 py-0.5 text-[10px] text-white/75">
              ⌘K
            </kbd>
          </button>
        ) : null
      }
      accountSlot={mode === 'member' ? <AccountMenu /> : undefined}
      mobileAccountSlot={
        mode === 'member' ? (
          <div className="mt-4 border-t border-white/10 pt-4">
            <p className="px-3 pb-2 text-[11px] font-mono font-bold uppercase tracking-[0.08em] text-white/55">
              Account
            </p>
            <a
              href="/settings"
              className="block rounded-lg px-3 py-3 text-base font-mono text-[var(--text-on-header)] transition-colors hover:bg-white/5 hover:text-[var(--text-on-header-hover)]"
            >
              Einstellungen
            </a>
            <a
              href="https://community.generation-ai.org"
              className="block rounded-lg px-3 py-3 text-base font-mono text-[var(--text-on-header)] transition-colors hover:bg-white/5 hover:text-[var(--text-on-header-hover)]"
            >
              Community öffnen
            </a>
            <form action="/auth/signout" method="POST">
              <button
                type="submit"
                className="block w-full rounded-lg px-3 py-3 text-left text-base font-mono text-[var(--text-on-header)] transition-colors hover:bg-white/5 hover:text-[var(--status-error)]"
              >
                Abmelden
              </button>
            </form>
          </div>
        ) : undefined
      }
    />
  )
}
