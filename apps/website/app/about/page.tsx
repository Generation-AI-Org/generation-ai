import type { Metadata } from "next"

import { AboutHeroSection } from "@/components/about/about-hero-section"
import { AboutStorySection } from "@/components/about/about-story-section"
import { AboutTeamSection } from "@/components/about/about-team-section"
import { AboutValuesSection } from "@/components/about/about-values-section"
import { AboutVereinSection } from "@/components/about/about-verein-section"
import { AboutMitmachCTASection } from "@/components/about/about-mitmach-cta-section"
import { AboutFaqSection } from "@/components/about/about-faq-section"
import { AboutFinalCTASection } from "@/components/about/about-final-cta-section"
import { AboutKontaktSection } from "@/components/about/about-kontakt-section"

// Route `/about` — Credibility-Anker-Seite (Phase 21).
//
// Single-Page-Layout mit 9 Sections in fester Reihenfolge:
//   1. Hero (H1 + Display-Claim)
//   2. Story (Gründungs-Narrative)
//   3. Team (Founders + Member-Grid)
//   4. Values (4 Werte-Blöcke)
//   5. Verein (Gemeinnützigkeit, Transparenz — #verein Anker load-bearing für Phase 22)
//   6. Mitmach-CTA (Mailto → #mitmach Anker)
//   7. FAQ (10-Fragen-Accordion — #faq Anker load-bearing für Landing-Kurz-FAQ-Link)
//   8. Final-CTA (Primary /join + Secondary Partner/Mitmach-Links)
//   9. Kontakt (3-Zeilen Card)
//
// Route ist dynamic via Root-Layout (`export const dynamic = "force-dynamic"`
// in app/layout.tsx) — CSP-Nonce-Flow bleibt intakt (siehe LEARNINGS.md).

export const metadata: Metadata = {
  title: {
    absolute: "Über uns · Generation AI",
  },
  description:
    "Warum es Generation AI gibt, wer dahintersteckt und wie wir uns organisieren. Gemeinnütziger Verein in Gründung, von und für Studierende im DACH-Raum.",
  openGraph: {
    title: "Über uns · Generation AI",
    description:
      "Warum es Generation AI gibt, wer dahintersteckt und wie wir uns organisieren. Gemeinnütziger Verein in Gründung, von und für Studierende im DACH-Raum.",
    url: "https://generation-ai.org/about",
    // OG-Image Reuse vom Root (Landing-OG) — dediziertes /about-OG ist Phase 27 Scope.
  },
  twitter: {
    title: "Über uns · Generation AI",
    description:
      "Warum es Generation AI gibt, wer dahintersteckt und wie wir uns organisieren. Gemeinnütziger Verein in Gründung, von und für Studierende im DACH-Raum.",
  },
  alternates: {
    canonical: "https://generation-ai.org/about",
  },
}

export default function AboutPage() {
  return (
    <main id="main-content">
      <AboutHeroSection />
      <AboutStorySection />
      <AboutTeamSection />
      <AboutValuesSection />
      <AboutVereinSection />
      <AboutMitmachCTASection />
      <AboutFaqSection />
      <AboutFinalCTASection />
      <AboutKontaktSection />
    </main>
  )
}
