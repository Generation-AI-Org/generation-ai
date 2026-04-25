// Phase 22.6 Plan 05 Task 1 — /events/[slug] Standalone Event Detail Page.
//
// Purpose: SEO + share-link target for individual events. Same content as modal
// but as a full server-rendered page (A-05 decision). Provides canonical URLs for
// search engines + social sharing.
//
// T-22.6-A-CSP Mitigation: `await headers()` REQUIRED — forces dynamic rendering
// so the CSP nonce is injected at request-time (not build-time). Without this the
// route would be `○` (static) and CSP strict-dynamic would block all scripts.
// (LEARNINGS.md 2026-04-18 incident)
//
// T-22.6-A-MDX Mitigation: event body rendered as whitespace-pre-wrap plain text
// inside React tree — NO dangerouslySetInnerHTML. No script injection vector.
// Full @next/mdx integration is deferred to Phase 28+.
//
// T-22.6-A-CTA-NEWTAB Mitigation: `rel="noopener noreferrer"` on external ctaUrl link.
//
// T-22.6-A-404: notFound() for unknown slugs — does not enumerate valid slugs.

import { headers } from "next/headers";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { CalendarDays, MapPin, ArrowLeft } from "lucide-react";
import { MotionConfig } from "motion/react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { BeispielBadge } from "@/components/ui/beispiel-badge";
import { getEventBySlug, getEventSlugs } from "@/lib/mdx/events";

interface PageProps {
  params: Promise<{ slug: string }>;
}

/** Build-time slug whitelist — unknown slugs return 404 without FS hit. */
export async function generateStaticParams() {
  const slugs = await getEventSlugs();
  return slugs.map((slug) => ({ slug }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const event = await getEventBySlug(slug);
  if (!event) {
    return { title: "Event nicht gefunden — Generation AI" };
  }
  const fm = event.frontmatter;
  const url = `https://generation-ai.org/events/${fm.slug}`;
  return {
    title: `${fm.title} — Generation AI Events`,
    description: fm.description ?? `Event-Details: ${fm.title}`,
    alternates: { canonical: url },
    openGraph: {
      title: fm.title,
      description: fm.description ?? "",
      type: "article",
      url,
      images: fm.imageUrl ? [{ url: fm.imageUrl }] : undefined,
    },
  };
}

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

export default async function EventDetailPage({ params }: PageProps) {
  // CRITICAL (LEARNINGS.md CSP-Pitfall): `await headers()` forces dynamic rendering
  // = `ƒ` in build output. Removing this call breaks CSP nonce injection.
  const nonce = (await headers()).get("x-nonce") ?? "";
  const { slug } = await params;
  const event = await getEventBySlug(slug);

  if (!event) {
    notFound();
  }

  const fm = event.frontmatter;

  return (
    <MotionConfig nonce={nonce}>
      <Header />
      <main id="main-content" className="mx-auto max-w-3xl px-6 py-16">
        <Link
          href="/events"
          className="inline-flex items-center gap-2 font-mono text-xs text-text-muted hover:text-text transition-colors mb-8"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
          Zurück zu allen Events
        </Link>

        {/* Header image */}
        <div className="relative h-64 bg-bg overflow-hidden rounded-2xl border border-border">
          {fm.imageUrl ? (
            <img
              src={fm.imageUrl}
              alt={`${fm.title} — Vorschaubild`}
              className="h-full w-full object-cover"
            />
          ) : (
            <div
              aria-hidden="true"
              className="h-full w-full"
              style={{
                background:
                  "linear-gradient(135deg, var(--bg-elevated) 0%, var(--bg) 60%, var(--bg-elevated) 100%)",
              }}
            />
          )}
          {fm.example && (
            <div className="absolute top-4 left-4">
              <BeispielBadge />
            </div>
          )}
        </div>

        {/* Tag row */}
        <div className="flex flex-wrap gap-2 mt-6">
          <span className="font-mono text-[11px] font-bold uppercase tracking-[0.08em] bg-bg-elevated border border-border rounded-full px-2 py-0.5 text-text-muted">
            {fm.format}
          </span>
          <span className="font-mono text-[11px] font-bold uppercase tracking-[0.08em] bg-bg-elevated border border-border rounded-full px-2 py-0.5 text-text-muted">
            {fm.level}
          </span>
          {fm.partner && (
            <span className="font-mono text-[11px] font-bold uppercase tracking-[0.08em] rounded-full px-2 py-0.5 text-[var(--accent)] border border-[var(--accent)]/40">
              mit {fm.partner}
            </span>
          )}
        </div>

        <h1
          className="mt-4 font-sans font-bold text-text leading-[1.15]"
          style={{ fontSize: "var(--fs-h1)" }}
        >
          {fm.title}
        </h1>

        <div className="flex flex-col sm:flex-row gap-4 mt-4 text-sm text-text-muted">
          <span className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4" aria-hidden="true" />
            {formatDate(fm.date)}
          </span>
          <span className="flex items-center gap-2">
            <MapPin className="h-4 w-4" aria-hidden="true" />
            {fm.location}
          </span>
        </div>

        {fm.description && (
          <p className="mt-6 text-lg leading-[1.6] text-text">{fm.description}</p>
        )}

        {/* Speakers */}
        {fm.speakers.length > 0 && (
          <div className="mt-10">
            <h2 className="font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-text-muted mb-4">
              Speaker
            </h2>
            <div className="flex flex-col gap-4">
              {fm.speakers.map((s) => (
                <div key={s.name} className="flex items-center gap-3">
                  <div
                    aria-hidden="true"
                    className="w-12 h-12 rounded-full bg-bg-elevated border border-border shrink-0"
                  />
                  <div>
                    <div className="font-sans font-semibold text-text">{s.name}</div>
                    <div className="font-sans text-sm text-text-muted">{s.role}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* MDX body — V1 deferred: the reader.ts FrontmatterEntry only exposes
            frontmatter (no body field). Full MDX body rendering via @next/mdx
            is deferred to Phase 28+. The frontmatter description field serves
            as the primary content for the V1 standalone page. (T-22.6-A-MDX) */}

        {/* Anmelde-CTA — links to external ctaUrl.
            T-22.6-A-CTA-NEWTAB: rel="noopener noreferrer" required. */}
        <div className="mt-12 flex flex-col sm:flex-row gap-3">
          <a
            href={fm.ctaUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[var(--accent)] text-[var(--text-on-accent)] font-mono font-bold text-sm rounded-full px-6 py-3 hover:shadow-[0_0_20px_var(--accent-glow)] hover:scale-[1.03] transition-all duration-[var(--dur-fast)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] text-center"
          >
            Zum Event anmelden →
          </a>
          <Link
            href="/join"
            className="bg-bg-elevated border border-border text-text font-mono text-sm rounded-full px-6 py-3 hover:border-border-accent transition-colors duration-[var(--dur-normal)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] text-center"
          >
            Erst Mitglied werden
          </Link>
        </div>
      </main>
      <Footer />
    </MotionConfig>
  );
}
