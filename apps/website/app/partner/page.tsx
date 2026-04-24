import type { Metadata } from "next"
import { headers } from "next/headers"

import { PartnerClient } from "@/components/partner-client"

// Route `/partner` — B2B-Landing (Phase 22).
//
// Server Component, liest Request-Nonce aus `x-nonce`-Header (von proxy.ts gesetzt)
// und `typ` aus searchParams für Tab-Hydration-Parity.
//
// `await headers()` erzwingt dynamic rendering — CSP-Nonce-Flow bleibt intakt
// (siehe LEARNINGS.md CSP-Incident).
//
// Section-Reihenfolge (fix, in PartnerClient):
//   1. Hero  2. TabSystem  3. Trust  4. Kontaktformular + PersonCards  5. VereinHint

export const metadata: Metadata = {
  title: {
    absolute: "Für Partner · Generation AI",
  },
  description:
    "Ob Unternehmen, Stiftung, Hochschule oder Initiative — arbeitet mit Generation AI zusammen. B2B-Kooperationen, Employer Branding und Impact-Partnerschaften.",
  openGraph: {
    title: "Für Partner · Generation AI",
    description:
      "Ob Unternehmen, Stiftung, Hochschule oder Initiative — arbeitet mit Generation AI zusammen. B2B-Kooperationen, Employer Branding und Impact-Partnerschaften.",
    url: "https://generation-ai.org/partner",
  },
  twitter: {
    title: "Für Partner · Generation AI",
    description:
      "Ob Unternehmen, Stiftung, Hochschule oder Initiative — arbeitet mit Generation AI zusammen. B2B-Kooperationen, Employer Branding und Impact-Partnerschaften.",
  },
  alternates: {
    canonical: "https://generation-ai.org/partner",
  },
}

interface PartnerPageProps {
  searchParams: Promise<{ typ?: string }>
}

export default async function PartnerPage({ searchParams }: PartnerPageProps) {
  const nonce = (await headers()).get("x-nonce") ?? ""
  const { typ } = await searchParams
  return <PartnerClient nonce={nonce} initialTyp={typ} />
}
