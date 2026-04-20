---
"@genai/website": minor
---

Phase 20 — Navigation + Landing-Skeleton

Komplett neue Top-Nav und Landing-Page Architektur als Conversion-Entry-Point für Milestone v4.0.

**Navigation:**
- Top-Nav mit Tools (extern), Community (extern), Für Partner ▾ Dropdown, Über uns, Jetzt beitreten
- Mobile: Hamburger-Icon → Full-Screen Sheet-Overlay mit Accordion-Sub-Items
- Theme-Toggle bleibt im Header
- Kein Login-Button mehr im Header

**Landing — 8 Sections in neuer Reihenfolge:**
1. Hero — Aurora-Background + Claim-Placeholder + Primary-CTA → /join
2. Diskrepanz — Custom Bento-Split mit 6 Number-Tickern, scroll-getriebene Divergenz, Closer-Reveal
3. Angebot — 4-Card Bento-Grid (Community, Wissensplattform, Events, Expert-Formate)
4. Tool-Showcase — Infinite-Moving-Cards mit 5 Stub-Tools + "Beispiel"-Badge
5. Community-Preview — 2-Spalten (3 Artikel-Stubs + 2 Event-Stubs) mit "Beispiel"-Badges
6. Zielgruppen-Split — Studi-Block groß + Primary-CTA, B2B-Streifen dezenter
7. Trust — MagicUI Marquee mit Sparringspartner-Placeholders + "N=109 · März 2026"
8. Final-CTA — Aceternity Lamp Effect + Primary-CTA → /join + Sekundär-Link

**Footer-Erweiterung:**
- 4-Spalten-Layout (Logo+Tagline | Sitemap | Legal | Kontakt+LinkedIn)
- Copyright mit Vereinsnennung

**Accessibility:**
- Terminal-Splash Traffic-Lights: aria-labels (Schließen/Minimieren/Maximieren) + Hit-Target ≥24×24px via padding (visual dots bleiben 12×12)
- Grey-Text-Contrast auf #1e1e1e Hintergrund von #6c6c6c (~3:1) auf #a0a0a0 (~7:1) angehoben
- Lighthouse Accessibility 1.00 (perfect) auf der Landing

**Stack-Additions:**
- motion (ehem. Framer Motion) — Animation-Library
- shadcn/ui Dropdown-Menu + Sheet — A11y-Primitives
- Aceternity Aurora, Bento-Grid, Infinite-Moving-Cards, Lamp — UI-Components
- MagicUI Number-Ticker, Marquee — UI-Components

**Brand- und CSP-Konformität:**
- Alle externen Komponenten auf brand-{neon|blue|pink|red}-{1-12} Skalen umgefärbt
- Lighthouse Landing: A11y 1.00, Best-Practices 0.96, SEO 1.00, CLS 0.0 (Perf 0.88 median — flaky, im Toleranzbereich)
- CLS ≤ 0.1 bei scroll-triggered Animationen (gemessen 0.0)
- prefers-reduced-motion respektiert (Aurora pausiert, Marquees pausieren, Discrepancy-Drift neutralisiert)
- Force-dynamic + Nonce-CSP intakt (Build-Output `ƒ /`)

**Stub-Strategie:**
- Tool-Showcase + Community-Preview verwenden realistischen Dummy-Content mit sichtbaren "Beispiel"-Badges, keine Skeleton-Loader
- Echte API-Daten kommen in Phase 26 (Subdomain-Integration)

**Out-of-Scope (planmäßig):**
- Hero-Claim + Final-CTA finales Wording (späterer Marketing-Pass)
- Echte Tool-Showcase- und Community-Preview-Daten (Phase 26)
- Sparringspartner-Logos (Asset-Delivery durch Lucas)
- /about, /partner, /join, /level-test (Phasen 21-24)
