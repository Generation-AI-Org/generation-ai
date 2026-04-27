"use client";

// Phase 22.6 Plan 03 — Client-Wrapper for /events page.
// Pattern: analog community-client.tsx (Phase 26).
// MotionConfig propagates the CSP-nonce to motion's injected <style> tags
// (see LEARNINGS.md CSP incident + community-client.tsx pattern).

import { MotionConfig } from "motion/react";
import type { EventEntry } from "@/lib/mdx/events";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { SectionTransition } from "@/components/ui/section-transition";
import { EventsHero } from "./components/events-hero";
import { EventsGrid } from "./components/events-grid";
import { EventsFormats } from "./components/events-formats";
import { EventsMembersOnly } from "./components/events-members-only";
import { EventsArchive } from "./components/events-archive";
import { EventsFinalCta } from "./components/events-final-cta";

interface EventsClientProps {
  nonce: string;
  upcomingEvents: EventEntry[];
  pastEvents: EventEntry[];
}

export function EventsClient({
  nonce,
  upcomingEvents,
  pastEvents,
}: EventsClientProps) {
  return (
    <MotionConfig nonce={nonce}>
      <Header />
      <main id="main-content" className="min-h-screen pt-20">
        <EventsHero />
        <EventsGrid events={upcomingEvents} />
        <SectionTransition variant="soft-fade" />
        <EventsFormats />
        <SectionTransition variant="soft-fade" />
        <EventsMembersOnly />
        <SectionTransition variant="soft-fade" />
        <EventsArchive events={pastEvents} />
        <SectionTransition variant="signal-echo" />
        <EventsFinalCta />
      </main>
      <Footer />
    </MotionConfig>
  );
}
