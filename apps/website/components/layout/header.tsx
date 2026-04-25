'use client'

import { useState } from "react"
import Link from "next/link"
import { motion, useReducedMotion } from "motion/react"
import { ChevronDown, Menu, X } from "lucide-react"
import { useTheme } from "@/components/ThemeProvider"
import { Logo } from "@genai/ui"
import { cn } from "@/lib/utils"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from "@/components/ui/sheet"

// Nav-Struktur (D-18, locked)
const navLinks = [
  { label: "Tools", href: "https://tools.generation-ai.org", external: true },
  { label: "Community", href: "/community", external: false },
] as const

const partnerSubItems = [
  { label: "Unternehmen", href: "/partner?typ=unternehmen" },
  { label: "Stiftungen", href: "/partner?typ=stiftungen" },
  { label: "Hochschulen", href: "/partner?typ=hochschulen" },
  { label: "Initiativen", href: "/partner?typ=initiativen" },
] as const

const aboutLink = { label: "Über uns", href: "/about" } as const

export function Header() {
  const { theme, toggleTheme } = useTheme()
  const prefersReducedMotion = useReducedMotion()

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-bg-header border-b border-white/10">
      {/* Skip to content link - first focusable element */}
      <a href="#main-content" className="skip-link">
        Zum Inhalt springen
      </a>

      <nav aria-label="Hauptnavigation" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center" aria-label="Generation AI - Startseite">
            <Logo context="header" theme={theme} size="lg" className="hover:opacity-90 transition-opacity" />
          </Link>

          {/* Desktop Nav (md+) */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) =>
              link.external ? (
                <a
                  key={link.href}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-2 text-sm font-mono text-[var(--text-on-header)] hover:text-[var(--text-on-header-hover)] transition-colors"
                >
                  {link.label}
                </a>
              ) : (
                <Link
                  key={link.href}
                  href={link.href}
                  className="px-3 py-2 text-sm font-mono text-[var(--text-on-header)] hover:text-[var(--text-on-header-hover)] transition-colors"
                >
                  {link.label}
                </Link>
              )
            )}

            {/* Für Partner Dropdown (D-17) */}
            <DropdownMenu>
              <DropdownMenuTrigger
                aria-label="Für Partner Untermenü öffnen"
                className="px-3 py-2 text-sm font-mono text-[var(--text-on-header)] hover:text-[var(--text-on-header-hover)] inline-flex items-center gap-1 transition-colors cursor-pointer"
              >
                Für Partner
                <ChevronDown className="w-3.5 h-3.5" aria-hidden="true" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-bg-card border-border">
                <DropdownMenuGroup>
                  <DropdownMenuLabel className="text-text-muted text-xs font-mono uppercase tracking-wider">
                    Für Partner
                  </DropdownMenuLabel>
                  {partnerSubItems.map((item) => (
                    <DropdownMenuItem key={item.href} render={<Link href={item.href} />}>
                      <span className="font-mono text-sm">{item.label}</span>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Über uns */}
            <Link
              href={aboutLink.href}
              className="px-3 py-2 text-sm font-mono text-[var(--text-on-header)] hover:text-[var(--text-on-header-hover)] transition-colors"
            >
              {aboutLink.label}
            </Link>
          </div>

          {/* Right side: Theme Toggle + CTA + Mobile Hamburger */}
          <div className="flex items-center gap-2">
            {/* Theme Toggle (D-20, existing pattern preserved) */}
            <button
              onClick={toggleTheme}
              className={cn(
                "p-2.5 rounded-lg transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center cursor-pointer",
                theme === "dark" ? "bg-white/10 hover:bg-white/20" : "bg-black/20 hover:bg-black/30"
              )}
              aria-label={theme === "dark" ? "Light Mode aktivieren" : "Dark Mode aktivieren"}
            >
              {theme === "dark" ? (
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>

            {/* Primary CTA (Desktop only) */}
            <Link
              href="/join"
              prefetch={false}
              className="hidden md:inline-flex bg-[var(--accent)] text-[var(--text-on-accent)] px-4 py-2 rounded-full text-sm font-mono font-bold hover:opacity-90 transition-opacity"
            >
              Jetzt beitreten
            </Link>

            {/* Mobile Hamburger (D-19) */}
            <div className="md:hidden">
              <Sheet>
                <SheetTrigger
                  aria-label="Menü öffnen"
                  className="p-2.5 rounded-lg min-w-[44px] min-h-[44px] flex items-center justify-center text-[var(--text-on-header)] hover:bg-white/10 cursor-pointer"
                >
                  <Menu className="w-6 h-6" aria-hidden="true" />
                </SheetTrigger>
                <SheetContent
                  side="right"
                  showCloseButton={false}
                  className="bg-bg-card border-border w-full sm:max-w-sm"
                >
                  <SheetHeader className="relative">
                    <SheetTitle className="font-mono">Navigation</SheetTitle>
                    {/* German aria-label overrides shadcn's default "Close" — landing.spec.ts
                        matches /Menü schließen|Close/i either way. Positioned top-right. */}
                    <SheetClose
                      aria-label="Menü schließen"
                      className="absolute top-3 right-3 p-2 rounded-md text-[var(--text-on-header)] hover:bg-white/10 cursor-pointer inline-flex items-center justify-center"
                    >
                      <X className="w-5 h-5" aria-hidden="true" />
                    </SheetClose>
                  </SheetHeader>
                  <MobileNavList prefersReducedMotion={prefersReducedMotion} />
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </nav>
    </header>
  )
}

type MobileNavListProps = {
  prefersReducedMotion: boolean | null
}

function MobileNavList({ prefersReducedMotion }: MobileNavListProps) {
  const [isPartnerOpen, setIsPartnerOpen] = useState(false)

  // Mobile-Nav items (locked D-18 order)
  const items: Array<{ type: "link" | "partner" | "about"; label?: string; href?: string; external?: boolean }> = [
    { type: "link", label: "Tools", href: "https://tools.generation-ai.org", external: true },
    { type: "link", label: "Community", href: "/community", external: false },
    { type: "partner" },
    { type: "about", label: "Über uns", href: "/about" },
  ]

  const motionInitial = prefersReducedMotion ? false : { opacity: 0, y: 10 }
  const motionAnimate = prefersReducedMotion ? undefined : { opacity: 1, y: 0 }

  return (
    <div className="flex flex-col gap-1 px-4 pb-4">
      <ul className="flex flex-col gap-1">
        {items.map((item, index) => (
          <motion.li
            key={`${item.type}-${item.label ?? index}`}
            initial={motionInitial}
            animate={motionAnimate}
            transition={{ delay: index * 0.05, duration: 0.2 }}
          >
            {item.type === "link" && item.href && item.label && (
              <SheetClose
                render={
                  <a
                    href={item.href}
                    target={item.external ? "_blank" : undefined}
                    rel={item.external ? "noopener noreferrer" : undefined}
                    className="block px-3 py-3 text-base font-mono text-[var(--text-on-header)] hover:text-[var(--text-on-header-hover)] hover:bg-white/5 rounded-lg transition-colors"
                  >
                    {item.label}
                  </a>
                }
              />
            )}

            {item.type === "partner" && (
              <div>
                <button
                  type="button"
                  onClick={() => setIsPartnerOpen((v) => !v)}
                  aria-expanded={isPartnerOpen}
                  aria-controls="mobile-partner-submenu"
                  className="w-full flex items-center justify-between px-3 py-3 text-base font-mono text-[var(--text-on-header)] hover:text-[var(--text-on-header-hover)] hover:bg-white/5 rounded-lg transition-colors cursor-pointer"
                >
                  <span>Für Partner</span>
                  <ChevronDown
                    className={cn(
                      "w-4 h-4 transition-transform",
                      isPartnerOpen && "rotate-180"
                    )}
                    aria-hidden="true"
                  />
                </button>
                {isPartnerOpen && (
                  <ul
                    id="mobile-partner-submenu"
                    className="mt-1 ml-3 border-l border-border pl-3 flex flex-col gap-1"
                  >
                    {partnerSubItems.map((sub) => (
                      <li key={sub.href}>
                        <SheetClose
                          render={
                            <Link
                              href={sub.href}
                              className="block px-3 py-2 text-sm font-mono text-[var(--text-on-header)] hover:text-[var(--text-on-header-hover)] hover:bg-white/5 rounded-lg transition-colors"
                            >
                              {sub.label}
                            </Link>
                          }
                        />
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {item.type === "about" && item.href && item.label && (
              <SheetClose
                render={
                  <Link
                    href={item.href}
                    className="block px-3 py-3 text-base font-mono text-[var(--text-on-header)] hover:text-[var(--text-on-header-hover)] hover:bg-white/5 rounded-lg transition-colors"
                  >
                    {item.label}
                  </Link>
                }
              />
            )}
          </motion.li>
        ))}
      </ul>

      {/* Mobile Primary CTA */}
      <SheetClose
        render={
          <Link
            href="/join"
            prefetch={false}
            className="mt-4 inline-flex justify-center bg-[var(--accent)] text-[var(--text-on-accent)] px-4 py-3 rounded-full text-base font-mono font-bold hover:opacity-90 transition-opacity"
          >
            Jetzt beitreten
          </Link>
        }
      />
      {/* Close-Button: the shadcn SheetContent already renders a built-in close button
          with sr-only text "Close" — the landing.spec.ts matcher is /Menü schließen|Close/i,
          so no extra button is needed. */}
    </div>
  )
}
