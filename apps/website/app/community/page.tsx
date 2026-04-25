import { headers } from "next/headers";
import type { Metadata } from "next";
import { CommunityClient } from "./community-client";
import { getAllArticles } from "@/lib/mdx/community";

// Phase 26 Plan 02 — `/community` SEO-Landing + Member-Gateway (D-01, D-02, D-12, D-18).
// Server-Component reads CSP-Nonce + community articles MDX (build-time), mounts
// the client wrapper that hosts Header + sections + Footer.
//
// `force-dynamic` is inherited from app/layout.tsx (CSP-Nonce flow, see LEARNINGS.md).
// `getAllArticles()` reads `content/community/*.mdx` newest-first (Plan 26-01).

export const metadata: Metadata = {
  title: "Community — Mehr als eine Community",
  description:
    "Austausch, Kurse, News, exklusive Inhalte. Von Studis, für Studis.",
  alternates: { canonical: "https://generation-ai.org/community" },
  openGraph: {
    type: "website",
    title: "Generation AI · Community",
    description:
      "Austausch, Kurse, News, exklusive Inhalte. Von Studis, für Studis.",
    url: "https://generation-ai.org/community",
  },
};

export default async function CommunityPage() {
  const nonce = (await headers()).get("x-nonce") ?? "";
  const articles = await getAllArticles();
  return <CommunityClient nonce={nonce} articles={articles} />;
}
