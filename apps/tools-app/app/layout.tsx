import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AuthProvider } from "@/components/AuthProvider";
import { getUser } from "@/lib/auth";

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
    { media: "(prefers-color-scheme: light)", color: "#FAF7F8" },
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

  return (
    <html lang="de" className={inter.variable} suppressHydrationWarning>
      <body className="bg-bg text-text antialiased font-sans">
        <a href="#main-content" className="skip-link">
          Zum Hauptinhalt springen
        </a>
        <ThemeProvider>
          <AuthProvider initialUser={user}>
            {children}
          </AuthProvider>
        </ThemeProvider>
        <SpeedInsights />
      </body>
    </html>
  );
}
