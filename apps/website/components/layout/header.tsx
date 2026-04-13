'use client'

import Image from "next/image";
import Link from "next/link";
import { useTheme } from "@/components/ThemeProvider";

export function Header() {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-bg-header border-b border-white/10">
      {/* Skip to content link - first focusable element */}
      <a href="#main-content" className="skip-link">
        Zum Inhalt springen
      </a>

      <nav aria-label="Hauptnavigation" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo - switches based on theme */}
          <Link href="/" className="flex items-center" aria-label="Generation AI - Startseite">
            <Image
              src="/logos/generationai-blau-neon.jpg"
              alt="Generation AI"
              width={150}
              height={40}
              className="h-8 md:h-10 w-auto hover:opacity-90 transition-opacity"
              priority
            />
          </Link>

          {/* Navigation + Actions */}
          <div className="flex items-center gap-4">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className={`p-2.5 rounded-lg transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center cursor-pointer ${
                theme === 'dark'
                  ? 'bg-white/10 hover:bg-white/20'
                  : 'bg-black/20 hover:bg-black/30'
              }`}
              aria-label={theme === 'dark' ? 'Light Mode aktivieren' : 'Dark Mode aktivieren'}
            >
              {theme === 'dark' ? (
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>

            {/* CTA */}
            <a href="#signup" className="bg-accent text-text-on-accent px-4 py-2 rounded-full text-sm font-medium hover:opacity-90 transition-opacity">
              Beitreten
            </a>
          </div>
        </div>
      </nav>
    </header>
  );
}
