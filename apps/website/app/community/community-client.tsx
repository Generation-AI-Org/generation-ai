"use client";

import { MotionConfig } from "motion/react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import type { Article } from "@/lib/mdx/frontmatter";
import { CommunityHero } from "./components/community-hero";
import { PillarsGrid } from "./components/pillars-grid";
import { ArticlesCarousel } from "./components/articles-carousel";
import { CommunityFinalCta } from "./components/community-final-cta";

// Phase 26 Plan 02 — Client-side wrapper analog zu home-client.tsx.
// MotionConfig propagates the CSP-nonce to motion's injected <style> tags
// (see LEARNINGS.md CSP incident + home-client.tsx pattern).

interface CommunityClientProps {
  nonce: string;
  articles: Article[];
}

export function CommunityClient({ nonce, articles }: CommunityClientProps) {
  return (
    <MotionConfig nonce={nonce}>
      <Header />
      <main id="main-content" className="min-h-screen pt-20">
        <CommunityHero />
        <PillarsGrid />
        <ArticlesCarousel articles={articles} />
        <CommunityFinalCta />
      </main>
      <Footer />
    </MotionConfig>
  );
}
