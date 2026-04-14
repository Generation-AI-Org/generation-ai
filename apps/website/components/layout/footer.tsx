'use client'

import Image from "next/image";
import Link from "next/link";
import { useTheme } from "@/components/ThemeProvider";

export function Footer() {
  const { theme } = useTheme();

  return (
    <footer className="bg-bg-header border-t border-white/10 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Logo - switches based on theme */}
          <Link href="/" className="flex items-center">
            <Image
              src={theme === 'dark' ? '/logos/generationai-blau-neon.jpg' : '/logos/generationai-pink-rot.jpg'}
              alt="Generation AI"
              width={150}
              height={40}
              className="h-8 md:h-10 w-auto"
            />
          </Link>

          {/* Legal Links */}
          <nav className="flex items-center gap-6">
            <Link href="/impressum" className="text-text-muted text-sm hover:text-text transition-colors">
              Impressum
            </Link>
            <Link href="/datenschutz" className="text-text-muted text-sm hover:text-text transition-colors">
              Datenschutz
            </Link>
            <a href="mailto:info@generation-ai.org" className="text-text-muted text-sm hover:text-text transition-colors">
              Kontakt
            </a>
          </nav>

          {/* Copyright */}
          <p className="text-text-muted text-sm">
            &copy; {new Date().getFullYear()} Generation AI
          </p>
        </div>
      </div>
    </footer>
  );
}
