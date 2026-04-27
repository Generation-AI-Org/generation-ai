'use client'

import { MarketingHeader } from "@genai/ui"
import { useTheme } from "@/components/ThemeProvider"

const navLinks = [
  { label: "Tools", href: "https://tools.generation-ai.org", external: true },
  { label: "Events", href: "/events" },
  { label: "Community", href: "/community" },
] as const

const partnerLinks = [
  { label: "Unternehmen", href: "/partner?typ=unternehmen" },
  { label: "Stiftungen", href: "/partner?typ=stiftungen" },
  { label: "Hochschulen", href: "/partner?typ=hochschulen" },
  { label: "Initiativen", href: "/partner?typ=initiativen" },
] as const

export function Header() {
  const { theme, toggleTheme } = useTheme()

  return (
    <MarketingHeader
      theme={theme}
      toggleTheme={toggleTheme}
      logoHref="/"
      navLinks={navLinks}
      partnerHref="/partner"
      partnerLinks={partnerLinks}
      aboutHref="/about"
      ctaHref="/join"
      fixed
    />
  )
}
