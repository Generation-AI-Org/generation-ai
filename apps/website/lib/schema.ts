/**
 * Schema.org JSON-LD builders for SEO
 *
 * Used in layout.tsx to inject structured data for search engines.
 */

interface JsonLdOrganization {
  "@context": "https://schema.org";
  "@type": "Organization";
  name: string;
  url: string;
  logo: string;
  description: string;
  sameAs: string[];
}

interface JsonLdWebSite {
  "@context": "https://schema.org";
  "@type": "WebSite";
  name: string;
  url: string;
  description: string;
  inLanguage: string;
}

/**
 * Builds Organization schema for Generation AI
 */
export function buildOrganizationSchema(): JsonLdOrganization {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Generation AI",
    url: "https://generation-ai.org",
    logo: "https://generation-ai.org/og-image.jpg",
    description:
      "Die erste kostenlose KI-Community fuer Studierende im DACH-Raum",
    sameAs: [],
  };
}

/**
 * Builds WebSite schema for Generation AI
 */
export function buildWebSiteSchema(): JsonLdWebSite {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Generation AI",
    url: "https://generation-ai.org",
    description:
      "Die erste kostenlose KI-Community fuer Studierende im DACH-Raum",
    inLanguage: "de-DE",
  };
}
