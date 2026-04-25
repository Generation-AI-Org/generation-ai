"use client";

import type { ReactNode } from "react";
import { MotionConfig } from "motion/react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

// Phase 26 Plan 03 Task 2 — Article-Page client wrapper.
//
// Mirrors community-client.tsx pattern: Header + Footer are NOT in
// app/layout.tsx (root layout only injects ThemeProvider + JSON-LD).
// `MotionConfig` propagates the per-request CSP-Nonce to motion's injected
// <style> tags (LEARNINGS.md CSP incident).
//
// The article body is passed through as `children` so the server component
// can do MDX-import + JSON-LD inject + frontmatter-driven rendering on the
// server side (D-13 — root OG image inherits, no client OG mutations).

interface ArticleShellProps {
  nonce: string;
  children: ReactNode;
}

export function ArticleShell({ nonce, children }: ArticleShellProps) {
  return (
    <MotionConfig nonce={nonce}>
      <Header />
      <main id="main-content" className="min-h-screen pt-20">
        {children}
      </main>
      <Footer />
    </MotionConfig>
  );
}
