import type { Metadata } from "next"
import { headers } from "next/headers"

import { AboutClient } from "@/components/about-client"

// Route `/about` — Credibility-Anker-Seite (Phase 21).
//
// Server Component, liest den Request-Nonce aus dem `x-nonce`-Header (von
// proxy.ts gesetzt) und reicht ihn an <AboutClient> durch. AboutClient mountet
// Header + MotionConfig + 9 Sections + Footer — analog zu home-client.tsx.
//
// `await headers()` erzwingt dynamic rendering (konsistent mit Root-Layout
// `export const dynamic = "force-dynamic"`) — CSP-Nonce-Flow bleibt intakt
// (siehe LEARNINGS.md CSP-Incident).
//
// Section-Reihenfolge (fix, in AboutClient):
//   1. Hero  2. Story  3. Team  4. Values  5. Verein
//   6. Mitmach-CTA  7. FAQ  8. Final-CTA  9. Kontakt

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

export default async function AboutPage() {
  const nonce = (await headers()).get("x-nonce") ?? ""
  return <AboutClient nonce={nonce} />
}
