'use client'

import Link from "next/link"
import { useTheme } from "@/components/ThemeProvider"
import { Logo } from "@genai/ui"

export function Footer() {
  const { theme } = useTheme()

  return (
    <footer className="bg-bg-header border-t border-white/10 py-7">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-7 md:grid-cols-[1.4fr_1fr_1fr_1fr] md:gap-8">
          {/* Col 1: Logo + Tagline */}
          <div>
            <Link href="/" aria-label="Generation AI - Startseite" className="inline-flex">
              <Logo
                context="footer"
                theme={theme}
                colorway={theme === "dark" ? "neon" : "red"}
                size="lg"
              />
            </Link>
            <p className="mt-3 max-w-xs text-sm font-mono leading-[1.45] text-[var(--text-on-header)]">
              Die KI-Community für Studierende im DACH-Raum.
            </p>
            <p className="mt-4 text-[11px] font-mono leading-[1.45] text-[var(--text-on-header)] opacity-75">
              © {new Date().getFullYear()} Generation AI e.V. (i.G.).
            </p>
          </div>

          {/* Col 2: Sitemap */}
          <nav aria-label="Sitemap">
            <h3 className="mb-3 text-xs font-mono font-bold uppercase tracking-wider text-[var(--accent)]">
              Entdecken
            </h3>
            <ul className="space-y-1.5 text-sm font-mono">
              <li>
                <Link
                  href="/about"
                  prefetch={false}
                  className="text-white transition-colors hover:text-[var(--accent-hover)]"
                >
                  Über uns
                </Link>
              </li>
              <li>
                <a
                  href="https://tools.generation-ai.org"
                  className="text-white transition-colors hover:text-[var(--accent-hover)]"
                >
                  Tools
                </a>
              </li>
              <li>
                <a
                  href="https://community.generation-ai.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white transition-colors hover:text-[var(--accent-hover)]"
                >
                  Community
                </a>
              </li>
              <li>
                <Link
                  href="/events"
                  prefetch={false}
                  className="text-white transition-colors hover:text-[var(--accent-hover)]"
                >
                  Events
                </Link>
              </li>
              <li>
                <Link
                  href="/partner"
                  prefetch={false}
                  className="text-white transition-colors hover:text-[var(--accent-hover)]"
                >
                  Für Partner
                </Link>
              </li>
              <li>
                <Link
                  href="/join"
                  prefetch={false}
                  className="text-white transition-colors hover:text-[var(--accent-hover)]"
                >
                  Jetzt beitreten
                </Link>
              </li>
            </ul>
          </nav>

          {/* Col 3: Legal */}
          <nav aria-label="Rechtliches">
            <h3 className="mb-3 text-xs font-mono font-bold uppercase tracking-wider text-[var(--accent)]">
              Rechtliches
            </h3>
            <ul className="space-y-1.5 text-sm font-mono">
              <li>
                <Link
                  href="/impressum"
                  className="text-white transition-colors hover:text-[var(--accent-hover)]"
                >
                  Impressum
                </Link>
              </li>
              <li>
                <Link
                  href="/datenschutz"
                  className="text-white transition-colors hover:text-[var(--accent-hover)]"
                >
                  Datenschutz
                </Link>
              </li>
            </ul>
          </nav>

          {/* Col 4: Kontakt + Social */}
          <div>
            <h3 className="mb-3 text-xs font-mono font-bold uppercase tracking-wider text-[var(--accent)]">
              Kontakt
            </h3>
            <ul className="space-y-1.5 text-sm font-mono">
              <li>
                <a
                  href="mailto:info@generation-ai.org"
                  className="text-white transition-colors hover:text-[var(--accent-hover)]"
                >
                  info@generation-ai.org
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  )
}
