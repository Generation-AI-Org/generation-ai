'use client';

import { useState, type ReactNode } from 'react';
import { Logo, type LogoTheme } from './Logo';

type HeaderLink = {
  label: string;
  href: string;
  external?: boolean;
};

type PartnerLink = {
  label: string;
  href: string;
};

export interface MarketingHeaderProps {
  theme: LogoTheme;
  toggleTheme: () => void;
  logoHref: string;
  navLinks: ReadonlyArray<HeaderLink>;
  partnerHref: string;
  partnerLinks: ReadonlyArray<PartnerLink>;
  aboutHref: string;
  ctaHref: string;
  ctaLabel?: string;
  searchSlot?: ReactNode;
  accountSlot?: ReactNode;
  mobileAccountSlot?: ReactNode;
  fixed?: boolean;
  onClear?: () => void;
}

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ');
}

export function MarketingHeader({
  theme,
  toggleTheme,
  logoHref,
  navLinks,
  partnerHref,
  partnerLinks,
  aboutHref,
  ctaHref,
  ctaLabel = 'Jetzt beitreten',
  searchSlot,
  accountSlot,
  mobileAccountSlot,
  fixed = true,
  onClear,
}: MarketingHeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [partnerOpen, setPartnerOpen] = useState(false);

  return (
    <header
      className={cx(
        fixed ? 'fixed top-0 left-0 right-0 z-50' : 'relative shrink-0 z-50',
        'bg-bg-header border-b border-white/10'
      )}
      onClick={onClear}
    >
      <a href="#main-content" className="skip-link">
        Zum Inhalt springen
      </a>

      <nav aria-label="Hauptnavigation" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid h-20 grid-cols-[1fr_auto_1fr] items-center gap-4">
          <a href={logoHref} className="flex items-center justify-self-start" aria-label="Generation AI - Startseite">
            <Logo context="header" theme={theme} size="lg" interactive />
          </a>

          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                target={link.external ? '_blank' : undefined}
                rel={link.external ? 'noopener noreferrer' : undefined}
                className="px-3 py-2 text-sm font-mono text-[var(--text-on-header)] hover:text-[var(--text-on-header-hover)] transition-colors"
              >
                {link.label}
              </a>
            ))}

            <div className="relative flex items-center">
              <a
                href={partnerHref}
                className="px-3 py-2 text-sm font-mono text-[var(--text-on-header)] hover:text-[var(--text-on-header-hover)] transition-colors"
              >
                Für Partner
              </a>
              <button
                type="button"
                aria-label="Partnertypen-Untermenü öffnen"
                aria-expanded={partnerOpen}
                onClick={(event) => {
                  event.stopPropagation();
                  setPartnerOpen((value) => !value);
                }}
                onBlur={(event) => {
                  if (!event.currentTarget.parentElement?.contains(event.relatedTarget as Node | null)) {
                    setPartnerOpen(false);
                  }
                }}
                className="-ml-1 p-1.5 text-[var(--text-on-header)] hover:text-[var(--text-on-header-hover)] transition-colors cursor-pointer"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m6 9 6 6 6-6" />
                </svg>
              </button>
              {partnerOpen && (
                <div
                  className="absolute right-0 top-[calc(100%+0.5rem)] z-50 min-w-44 rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-2 shadow-xl"
                  onMouseDown={(event) => event.preventDefault()}
                >
                  <p className="text-text-muted text-xs font-mono uppercase tracking-wider px-3 py-1.5">
                    Für Partner
                  </p>
                  {partnerLinks.map((item) => (
                    <a
                      key={item.href}
                      href={item.href}
                      className="block rounded-xl px-3 py-2.5 text-sm font-mono text-[var(--text)] transition-colors duration-150 hover:bg-[var(--accent-soft)]"
                      onClick={() => setPartnerOpen(false)}
                    >
                      {item.label}
                    </a>
                  ))}
                </div>
              )}
            </div>

            <a
              href={aboutHref}
              className="px-3 py-2 text-sm font-mono text-[var(--text-on-header)] hover:text-[var(--text-on-header-hover)] transition-colors"
            >
              Über uns
            </a>
          </div>

          <div className="flex items-center justify-end gap-2">
            {searchSlot}

            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                toggleTheme();
              }}
              className={cx(
                'group flex min-h-[44px] min-w-[44px] cursor-pointer items-center justify-center rounded-full p-2.5 transition-[background-color,transform] duration-300 hover:scale-105 active:scale-[0.96]',
                theme === 'dark'
                  ? 'bg-white/10 hover:bg-white/15'
                  : 'bg-black/20 hover:bg-black/25'
              )}
              aria-label={theme === 'dark' ? 'Light Mode aktivieren' : 'Dark Mode aktivieren'}
              aria-pressed={theme === 'dark'}
            >
              {theme === 'dark' ? (
                <svg className="h-5 w-5 text-white transition-transform duration-300 group-hover:rotate-45 group-hover:scale-110 group-active:rotate-45 group-active:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="h-5 w-5 text-white transition-transform duration-300 group-hover:rotate-[-20deg] group-hover:scale-110 group-active:rotate-[-20deg] group-active:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>

            {accountSlot ?? (
              <a
                href={ctaHref}
                className="hidden md:inline-flex bg-[var(--accent)] text-[var(--text-on-accent)] px-4 py-2 rounded-full text-sm font-mono font-bold hover:opacity-90 transition-opacity"
              >
                {ctaLabel}
              </a>
            )}

            <button
              type="button"
              aria-label={mobileOpen ? 'Menü schließen' : 'Menü öffnen'}
              aria-expanded={mobileOpen}
              aria-controls="marketing-mobile-nav"
              onClick={(event) => {
                event.stopPropagation();
                setMobileOpen((value) => !value);
              }}
              className="md:hidden p-2.5 rounded-lg min-w-[44px] min-h-[44px] flex items-center justify-center text-[var(--text-on-header)] hover:bg-white/10 cursor-pointer"
            >
              {mobileOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18 18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </nav>

      {mobileOpen && (
        <div
          id="marketing-mobile-nav"
          className="absolute left-0 right-0 top-full z-50 border-b border-white/10 bg-bg-header shadow-xl md:hidden"
          onClick={(event) => event.stopPropagation()}
        >
          <nav aria-label="Hauptnavigation mobil" className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-4">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                target={link.external ? '_blank' : undefined}
                rel={link.external ? 'noopener noreferrer' : undefined}
                onClick={() => setMobileOpen(false)}
                className="block px-3 py-3 text-base font-mono text-[var(--text-on-header)] hover:text-[var(--text-on-header-hover)] hover:bg-white/5 rounded-lg transition-colors"
              >
                {link.label}
              </a>
            ))}
            <a
              href={partnerHref}
              onClick={() => setMobileOpen(false)}
              className="block px-3 py-3 text-base font-mono text-[var(--text-on-header)] hover:text-[var(--text-on-header-hover)] hover:bg-white/5 rounded-lg transition-colors"
            >
              Für Partner
            </a>
            <a
              href={aboutHref}
              onClick={() => setMobileOpen(false)}
              className="block px-3 py-3 text-base font-mono text-[var(--text-on-header)] hover:text-[var(--text-on-header-hover)] hover:bg-white/5 rounded-lg transition-colors"
            >
              Über uns
            </a>
            {mobileAccountSlot ?? (
              <a
                href={ctaHref}
                onClick={() => setMobileOpen(false)}
                className="mt-4 inline-flex justify-center bg-[var(--accent)] text-[var(--text-on-accent)] px-4 py-3 rounded-full text-base font-mono font-bold hover:opacity-90 transition-opacity"
              >
                {ctaLabel}
              </a>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
