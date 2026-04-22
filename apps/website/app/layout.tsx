import type { Metadata, Viewport } from "next";

// CSP mit Nonce erfordert dynamic rendering — sonst wird HTML zur Build-Zeit
// ohne Nonce gebaut, und der per-request-Nonce in den Script-Tags fehlt →
// strict-dynamic blockt alle Chunks.
// Doc: next.js content-security-policy "all pages must be dynamically rendered".
export const dynamic = "force-dynamic";

import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import {
  buildOrganizationSchema,
  buildWebSiteSchema,
} from "@/lib/schema";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#141414" },
    { media: "(prefers-color-scheme: light)", color: "#F6F6F6" },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL("https://generation-ai.org"),
  title: {
    default: "Generation AI",
    template: "%s | Generation AI",
  },
  description:
    "Die erste kostenlose KI-Community für Studierende im DACH-Raum",

  // Icons werden automatisch über app/icon.svg (Next.js file convention) bereitgestellt.
  keywords: [
    "KI",
    "AI",
    "Studierende",
    "Community",
    "DACH",
    "kostenlos",
    "Künstliche Intelligenz",
  ],
  authors: [{ name: "Generation AI" }],
  creator: "Generation AI",
  openGraph: {
    type: "website",
    locale: "de_DE",
    siteName: "Generation AI",
    title: "Generation AI - Die KI-Community für Studierende",
    description:
      "Die erste kostenlose KI-Community für Studierende im DACH-Raum. Tools, Wissen und Austausch.",
    url: "https://generation-ai.org",
    // OG-Image wird automatisch über app/opengraph-image.tsx (Next.js file convention) bereitgestellt.
  },
  twitter: {
    card: "summary_large_image",
    title: "Generation AI - Die KI-Community für Studierende",
    description:
      "Die erste kostenlose KI-Community für Studierende im DACH-Raum. Tools, Wissen und Austausch.",
    // Twitter-Image wird automatisch über app/twitter-image.tsx (Next.js file convention) bereitgestellt.
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
    },
  },
  alternates: {
    canonical: "https://generation-ai.org",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="de" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body className="antialiased min-h-screen">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(buildOrganizationSchema()),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(buildWebSiteSchema()),
          }}
        />
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
