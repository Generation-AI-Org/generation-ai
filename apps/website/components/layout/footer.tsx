'use client'

import Link from "next/link"
import { useTheme } from "@/components/ThemeProvider"
import { Logo } from "@genai/ui"

// LinkedIn brand glyph as inline SVG — lucide-react@1.8.0 does not export a
// `Linkedin` icon (brand icons landed in later versions). Self-contained SVG
// keeps the Footer self-describing without adding a dependency.
function LinkedinIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      {...props}
    >
      <path d="M20.447 20.452h-3.554v-5.569c0-1.327-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.047c.476-.9 1.637-1.852 3.37-1.852 3.601 0 4.268 2.37 4.268 5.455v6.288zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.063 2.063 0 112.063 2.065zm1.782 13.019H3.554V9h3.565v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  )
}

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
                size="md"
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
                  className="text-[var(--accent)] hover:text-[var(--accent-hover)] transition-colors"
                >
                  Über uns
                </Link>
              </li>
              <li>
                <a
                  href="https://tools.generation-ai.org"
                  target="_blank"
                  rel="noopener noreferrer"
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
                  href="/partner"
                  className="text-[var(--accent)] hover:text-[var(--accent-hover)] transition-colors"
                >
                  Für Partner
                </Link>
              </li>
              <li>
                <Link
                  href="/join"
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
                  href="mailto:admin@generation-ai.org"
                  className="text-[var(--accent)] hover:text-[var(--accent-hover)] transition-colors"
                >
                  admin@generation-ai.org
                </a>
              </li>
              <li>
                <a
                  href="https://www.linkedin.com/company/generation-ai-org/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Generation AI auf LinkedIn"
                  className="inline-flex items-center gap-2 text-[var(--accent)] hover:text-[var(--accent-hover)] transition-colors"
                >
                  <LinkedinIcon className="w-4 h-4" />
                  LinkedIn
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
