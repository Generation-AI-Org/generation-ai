import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import {
  buildOrganizationSchema,
  buildWebSiteSchema,
} from "@/lib/schema";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#141414" },
    { media: "(prefers-color-scheme: light)", color: "#FAF7F8" },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL("https://generation-ai.org"),
  title: {
    default: "Generation AI",
    template: "%s | Generation AI",
  },
  description:
    "Die erste kostenlose KI-Community fuer Studierende im DACH-Raum",
  keywords: [
    "KI",
    "AI",
    "Studierende",
    "Community",
    "DACH",
    "kostenlos",
    "Kuenstliche Intelligenz",
  ],
  authors: [{ name: "Generation AI" }],
  creator: "Generation AI",
  openGraph: {
    type: "website",
    locale: "de_DE",
    siteName: "Generation AI",
    title: "Generation AI - Die KI-Community fuer Studierende",
    description:
      "Die erste kostenlose KI-Community fuer Studierende im DACH-Raum. Tools, Wissen und Austausch.",
    url: "https://generation-ai.org",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Generation AI",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Generation AI - Die KI-Community fuer Studierende",
    description:
      "Die erste kostenlose KI-Community fuer Studierende im DACH-Raum. Tools, Wissen und Austausch.",
    images: ["/og-image.jpg"],
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
    <html lang="de" className={`${inter.variable} ${GeistMono.variable}`}>
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
