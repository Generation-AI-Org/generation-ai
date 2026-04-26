'use client'

import Link from "next/link"
import { useTheme } from "@/components/ThemeProvider"
import { Logo } from "@genai/ui"

export function Footer() {
  const { theme } = useTheme()

  return (
    <footer className="bg-bg-header border-t border-white/10 pt-10 pb-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Col 1: Logo + Tagline */}
          <div>
            <Link href="/" aria-label="Generation AI - Startseite" className="inline-flex">
              <Logo
                context="footer"
                theme={theme}
                colorway={theme === "dark" ? "neon" : "auto"}
                size="lg"
              />
            </Link>
            <p className="mt-4 text-sm font-mono text-[var(--text-on-header)] max-w-xs">
              Die KI-Community für Studierende im DACH-Raum.
            </p>
          </div>

          {/* Col 2: Sitemap */}
          <nav aria-label="Sitemap">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--text-on-header)] mb-4">
              Entdecken
            </h3>
            <ul className="space-y-2 text-sm font-mono">
              <li>
                <Link
                  href="/about"
                  prefetch={false}
                  className="text-[var(--accent)] hover:text-[var(--accent-hover)] transition-colors"
                >
                  Über uns
                </Link>
              </li>
              <li>
                <a
                  href="https://tools.generation-ai.org"
                  className="text-[var(--accent)] hover:text-[var(--accent-hover)] transition-colors"
                >
                  Tools
                </a>
              </li>
              <li>
                <a
                  href="https://community.generation-ai.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[var(--accent)] hover:text-[var(--accent-hover)] transition-colors"
                >
                  Community
                </a>
              </li>
              <li>
                <Link
                  href="/events"
                  prefetch={false}
                  className="text-[var(--accent)] hover:text-[var(--accent-hover)] transition-colors"
                >
                  Events
                </Link>
              </li>
              <li>
                <Link
                  href="/partner"
                  prefetch={false}
                  className="text-[var(--accent)] hover:text-[var(--accent-hover)] transition-colors"
                >
                  Für Partner
                </Link>
              </li>
              <li>
                <Link
                  href="/join"
                  prefetch={false}
                  className="text-[var(--accent)] hover:text-[var(--accent-hover)] transition-colors"
                >
                  Jetzt beitreten
                </Link>
              </li>
            </ul>
          </nav>

          {/* Col 3: Legal */}
          <nav aria-label="Rechtliches">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--text-on-header)] mb-4">
              Rechtliches
            </h3>
            <ul className="space-y-2 text-sm font-mono">
              <li>
                <Link
                  href="/impressum"
                  className="text-[var(--accent)] hover:text-[var(--accent-hover)] transition-colors"
                >
                  Impressum
                </Link>
              </li>
              <li>
                <Link
                  href="/datenschutz"
                  className="text-[var(--accent)] hover:text-[var(--accent-hover)] transition-colors"
                >
                  Datenschutz
                </Link>
              </li>
            </ul>
          </nav>

          {/* Col 4: Kontakt + Social */}
          <div>
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--text-on-header)] mb-4">
              Kontakt
            </h3>
            <ul className="space-y-2 text-sm font-mono">
              <li>
                <a
                  href="mailto:info@generation-ai.org"
                  className="text-[var(--accent)] hover:text-[var(--accent-hover)] transition-colors"
                >
                  info@generation-ai.org
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar: Copyright */}
        <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs font-mono text-[var(--text-on-header)]">
            © {new Date().getFullYear()} Generation AI e.V. (i.G.). Alle Rechte vorbehalten.
          </p>
          <p className="text-xs font-mono text-[var(--text-on-header)]">
            Made with care in Berlin &amp; Hamburg.
          </p>
        </div>
      </div>
    </footer>
  )
}
