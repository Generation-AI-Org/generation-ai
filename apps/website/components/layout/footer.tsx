'use client'

import Link from "next/link";
import { useTheme } from "@/components/ThemeProvider";
import { Logo } from "@genai/ui";

export function Footer() {
  const { theme } = useTheme();

  return (
    <footer className="bg-bg-header border-t border-white/10 py-5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Logo - resolved via colorway="auto" + theme */}
          <Link href="/" className="flex items-center" aria-label="Generation AI - Startseite">
            <Logo context="footer" theme={theme} colorway={theme === "dark" ? "neon" : "auto"} size="md" />
          </Link>

          {/* Legal Links */}
          <nav className="flex items-center gap-6">
            <Link href="/impressum" className="text-[var(--accent)] text-sm font-mono hover:text-[var(--accent-hover)] transition-colors">
              Impressum
            </Link>
            <Link href="/datenschutz" className="text-[var(--accent)] text-sm font-mono hover:text-[var(--accent-hover)] transition-colors">
              Datenschutz
            </Link>
            <a href="mailto:info@generation-ai.org" className="text-[var(--accent)] text-sm font-mono hover:text-[var(--accent-hover)] transition-colors">
              Kontakt
            </a>
          </nav>

          {/* Copyright */}
          <p className="text-[var(--accent)] text-sm font-mono">
            &copy; {new Date().getFullYear()} Generation AI
          </p>
        </div>
      </div>
    </footer>
  );
}
