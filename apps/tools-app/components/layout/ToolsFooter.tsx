'use client'

import Link from 'next/link'
import { Logo } from '@genai/ui'
import { useTheme } from '@/components/ThemeProvider'

const discoveryLinks = [
  { label: 'Tools', href: 'https://tools.generation-ai.org' },
  { label: 'Events', href: 'https://generation-ai.org/events' },
  { label: 'Community', href: 'https://generation-ai.org/community' },
  { label: 'Für Partner', href: 'https://generation-ai.org/partner' },
  { label: 'Über uns', href: 'https://generation-ai.org/about' },
  { label: 'Kostenlos Mitglied werden', href: 'https://generation-ai.org/join?utm_source=tools' },
] as const

export function ToolsFooter() {
  const { theme } = useTheme()

  return (
    <footer className="mt-12 border-t border-white/10 bg-bg-header py-8 text-white">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-4 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr_1fr] lg:px-8">
        <div>
          <a href="https://generation-ai.org" aria-label="Generation AI - Startseite" className="inline-flex">
            <Logo context="footer" theme={theme} colorway={theme === 'dark' ? 'neon' : 'red'} size="lg" />
          </a>
          <p className="mt-3 max-w-xs text-sm font-mono leading-[1.45] text-[var(--text-on-header)]">
            Die KI-Community für Studierende im DACH-Raum.
          </p>
          <p className="mt-4 text-[11px] font-mono leading-[1.45] text-[var(--text-on-header)] opacity-75">
            © {new Date().getFullYear()} Generation AI e.V. (i.G.).
          </p>
        </div>

        <nav aria-label="Tools-App Entdecken">
          <h2 className="mb-3 text-xs font-mono font-bold uppercase tracking-wider text-[var(--accent)]">
            Entdecken
          </h2>
          <ul className="space-y-1.5 text-sm font-mono">
            {discoveryLinks.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="text-white transition-colors duration-150 hover:text-[var(--accent-hover)]"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Rechtliches">
          <h2 className="mb-3 text-xs font-mono font-bold uppercase tracking-wider text-[var(--accent)]">
            Rechtliches
          </h2>
          <ul className="space-y-1.5 text-sm font-mono">
            <li>
              <Link href="/impressum" className="text-white transition-colors duration-150 hover:text-[var(--accent-hover)]">
                Impressum
              </Link>
            </li>
            <li>
              <Link href="/datenschutz" className="text-white transition-colors duration-150 hover:text-[var(--accent-hover)]">
                Datenschutz
              </Link>
            </li>
          </ul>
        </nav>

        <div>
          <h2 className="mb-3 text-xs font-mono font-bold uppercase tracking-wider text-[var(--accent)]">
            Kontakt
          </h2>
          <a
            href="mailto:info@generation-ai.org"
            className="text-sm font-mono text-white transition-colors duration-150 hover:text-[var(--accent-hover)]"
          >
            info@generation-ai.org
          </a>
        </div>
      </div>
    </footer>
  )
}
