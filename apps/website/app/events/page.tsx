import { headers } from "next/headers";
import type { Metadata } from "next";
import { getUpcomingEvents, getPastEvents } from "@/lib/mdx/events";
import { EventsClient } from "./events-client";

// Phase 22.6 Plan 03 — /events Server-Component.
//
// CRITICAL (LEARNINGS.md CSP-Pitfall):
// `await headers()` forces this route to render dynamically (ƒ in build output).
// Without this, route renders static (○) → CSP-Nonce middleware never runs →
// no nonce on Script-tags → CSP strict-dynamic blocks all scripts → black page.
// Build MUST show `ƒ /events` NOT `○ /events`.

export const metadata: Metadata = {
  title: "Events — Generation AI",
  description:
    "Workshops, Speaker Sessions und Masterclasses — exklusiv für die Generation AI Community.",
  alternates: { canonical: "https://generation-ai.org/events" },
  openGraph: {
    type: "website",
    title: "Generation AI · Events",
    description:
      "Workshops, Speaker Sessions und Masterclasses — exklusiv für die Generation AI Community.",
    url: "https://generation-ai.org/events",
  },
};

export default async function EventsPage() {
  // await headers() is MANDATORY — see LEARNINGS.md CSP-Pitfall.
  // This single call opts the route out of static prerendering → route stays
  // dynamic (ƒ) so the nonce middleware can inject a fresh nonce each request.
  const nonce = (await headers()).get("x-nonce") ?? "";

  const upcomingEvents = await getUpcomingEvents();
  const pastEvents = await getPastEvents();

  return (
    <EventsClient
      nonce={nonce}
      upcomingEvents={upcomingEvents}
      pastEvents={pastEvents}
    />
  );
}
