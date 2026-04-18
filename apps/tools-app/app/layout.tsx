import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import localFont from "next/font/local";
import { SpeedInsights } from "@vercel/speed-insights/next";

const cascadiaCode = localFont({
  src: "./fonts/CascadiaCode.woff2",
  variable: "--font-mono",
  display: "swap",
  preload: true,
});
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AuthProvider } from "@/components/AuthProvider";
import { VersionBadge } from "@/components/ui/VersionBadge";
import ConditionalGlobalLayout from "@/components/layout/ConditionalGlobalLayout";
import { getUser } from "@/lib/auth";
import type { ChatMode } from "@/lib/types";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  preload: true,
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#141414" },
    { media: "(prefers-color-scheme: light)", color: "#F6F6F6" },
  ],
};

export const metadata: Metadata = {
  title: {
    default: "Generation AI — KI-Tools für Studierende",
    template: "%s | Generation AI",
  },
  description: "Die kuratierte KI-Tool-Bibliothek für Studierende im DACH-Raum. Finde die richtigen Tools für Recherche, Schreiben, Coding und mehr.",
  keywords: ["KI", "AI", "Tools", "Studierende", "ChatGPT", "Claude", "Produktivität", "Lernen"],
  authors: [{ name: "Generation AI" }],
  creator: "Generation AI",
  publisher: "Generation AI",
  metadataBase: new URL("https://tools.generation-ai.org"),

  // Favicon & Icons
  icons: {
    icon: [
      { url: "/favicon.png", sizes: "32x32", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },

  // Open Graph (Facebook, WhatsApp, etc.)
  openGraph: {
    type: "website",
    locale: "de_DE",
    url: "https://tools.generation-ai.org",
    siteName: "Generation AI",
    title: "Generation AI — KI-Tools für Studierende",
    description: "Die kuratierte KI-Tool-Bibliothek für Studierende im DACH-Raum. Finde die richtigen Tools für deinen Workflow.",
    images: [
      {
        url: "/og-image-v2.png",
        width: 1200,
        height: 630,
        alt: "Generation AI - KI-Tools für Studierende",
      },
    ],
  },

  // Twitter Card
  twitter: {
    card: "summary_large_image",
    title: "Generation AI — KI-Tools für Studierende",
    description: "Die kuratierte KI-Tool-Bibliothek für Studierende im DACH-Raum.",
    images: ["/og-image-v2.png"],
  },

  // Robots
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getUser()
  const mode: ChatMode = user ? 'member' : 'public'

  return (
    <html lang="de" className={`${inter.variable} ${cascadiaCode.variable}`} suppressHydrationWarning>
      <body className="bg-bg text-text antialiased font-sans">
        <a href="#main-content" className="skip-link">
          Zum Hauptinhalt springen
        </a>
        <ThemeProvider>
          <AuthProvider initialUser={user}>
            <ConditionalGlobalLayout mode={mode}>
              {children}
            </ConditionalGlobalLayout>
          </AuthProvider>
        </ThemeProvider>
        <SpeedInsights />
        <VersionBadge />
      </body>
    </html>
  );
}
