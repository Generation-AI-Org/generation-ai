import { headers } from "next/headers";
import { HomeClient } from "@/components/home-client";
import { ToolShowcaseSection } from "@/components/sections/tool-showcase-section";
import { CommunityPreviewSection } from "@/components/sections/community-preview-section";

// `await headers()` reads the request-time x-nonce header set by proxy.ts and
// forces dynamic rendering — consistent with the Root-Layout `force-dynamic`
// directive that keeps the CSP nonce flow intact (see LEARNINGS.md CSP incident).
//
// Phase 26 Plan 26-05: Tool-Showcase + Community-Preview sind async Server-
// Components. Da `<HomeClient />` `'use client'` ist, dürfen wir die Server-
// Sections nicht *innerhalb* von HomeClient importieren — React-Limit. Stattdessen
// rendern wir sie hier (Server-Component-Boundary) und reichen sie als ReactNode-
// Props durch. Das ist das kanonische Server-in-Client-Pattern; Next streamt
// die async children korrekt.
export default async function Home() {
  const nonce = (await headers()).get("x-nonce") ?? "";
  return (
    <HomeClient
      nonce={nonce}
      toolShowcase={<ToolShowcaseSection />}
      communityPreview={<CommunityPreviewSection />}
    />
  );
}
