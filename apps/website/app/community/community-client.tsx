"use client";

import { MotionConfig } from "motion/react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import type { Article } from "@/lib/mdx/frontmatter";
import { CommunityHero } from "./components/community-hero";
import { PillarsGrid } from "./components/pillars-grid";
import { CommunityFinalCta } from "./components/community-final-cta";

// Phase 26 Plan 02 — Client-side wrapper analog zu home-client.tsx.
// MotionConfig propagates the CSP-nonce to motion's injected <style> tags
// (see LEARNINGS.md CSP incident + home-client.tsx pattern).
//
// Note: ArticlesCarousel is wired in Plan 26-02 Task 2 — `articles` is held
// here so Task 2 can drop in <ArticlesCarousel articles={articles} /> without
// touching page.tsx again.

interface CommunityClientProps {
  nonce: string;
  articles: Article[];
}

export function CommunityClient({ nonce, articles: _articles }: CommunityClientProps) {
  return (
    <MotionConfig nonce={nonce}>
      <Header />
      <main id="main-content" className="min-h-screen pt-20">
        <CommunityHero />
        <PillarsGrid />
        <CommunityFinalCta />
      </main>
      <Footer />
    </MotionConfig>
  );
}
