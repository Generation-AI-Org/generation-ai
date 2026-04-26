"use client";

// Phase 22.6 Plan 04 Task 1 — EventModal using @base-ui/react/dialog.
//
// SECURITY (T-22.6-A-AUTH — Phase 19 CR-01 pattern):
//   buildSafeRedirectAfter() whitelist-validates slug before building redirect URL.
//   Only /events/<alphanumeric-slug> relative paths are produced — never protocol-relative
//   or absolute URLs. Open-redirect via `//evil.com` or `http://...` is impossible
//   because the slug regex rejects any `/`, `:`, `.` or protocol-prefix characters.
//
// SECURITY (T-22.6-A-NEWTAB):
//   window.open always passes "noopener,noreferrer" — prevents ctaUrl page from
//   accessing window.opener on our origin.
//
// SECURITY (T-22.6-A-XSS-CTA):
//   ctaUrl is MDX-authored by maintainers (no UGC). Used as window.open URL, not
//   interpolated into HTML. Modern browsers reject javascript: in window.open.
//   Documented here per threat-register disposition "accept".
//
// A11Y (T-22.6-A-A11Y):
//   Dialog.Popup provides aria-modal="true" natively via @base-ui.
//   Dialog.Root provides focus-trap, ESC-close, click-outside-close natively.
//   Dialog.Close has explicit aria-label="Event schließen" (icon-only button).
//   Dialog.Title is required for screen-reader modal naming.

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Dialog } from "@base-ui/react/dialog";
import { CalendarDays, MapPin, X } from "lucide-react";
import { createClient } from "@genai/auth/browser";
import type { EventEntry } from "@/lib/mdx/events";
import { BeispielBadge } from "@/components/ui/beispiel-badge";

interface EventModalProps {
  event: EventEntry | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

/**
 * SECURITY: Sanitize redirect_after to prevent Open-Redirect (Phase 19 CR-01 pattern).
 *
 * Rules:
 *   1. Slug must match /^[a-zA-Z0-9-_]+$/ — rejects slashes, protocols, query strings.
 *   2. Result path is ALWAYS prepended with the hardcoded string "/events/".
 *   3. Any failing input falls back to "/events" (safe, no redirect_after appended).
 *
 * This means the final redirect_after value can ONLY ever be "/events/<safe-slug>".
 * It can never contain "//", "http", or any other open-redirect vector.
 */
export function buildSafeRedirectAfter(slug: string): string {
  // Whitelist: only alphanumeric characters, dashes, and underscores in slug.
  if (!/^[a-zA-Z0-9-_]+$/.test(slug)) {
    return "/events"; // safe fallback — no redirect_after param will be appended
  }
  const path = `/events/${slug}`;
  // Extra assertion — should be impossible to fail given regex above, but belt + suspenders.
  if (path.includes("//") || path.includes("http")) {
    return "/events";
  }
  return path;
}

export function EventModal({ event, open, onOpenChange }: EventModalProps) {
  const router = useRouter();
  const [isAuthed, setIsAuthed] = useState<boolean | null>(null);

  // Responsive: mobile = bottom sheet, desktop = centered dialog.
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  // Check auth state lazily when modal opens (T-22.6-A-AUTH-RACE: fail-open defaults
  // to logged-out path which just sends to /join — safe).
  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    (async () => {
      try {
        const supabase = createClient();
        const { data } = await supabase.auth.getSession();
        if (!cancelled) setIsAuthed(!!data.session);
      } catch {
        if (!cancelled) setIsAuthed(false); // fail-closed: assume logged-out on error
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [open]);

  if (!event) return null;
  const fm = event.frontmatter;

  const handleAnmelden = () => {
    if (isAuthed) {
      // Logged-in: open external event platform in new tab (SECURITY: noopener,noreferrer).
      window.open(fm.ctaUrl, "_blank", "noopener,noreferrer");
    } else {
      // Logged-out: redirect to /join with sanitized redirect_after param.
      const safePath = buildSafeRedirectAfter(fm.slug);
      router.push(`/join?redirect_after=${encodeURIComponent(safePath)}`);
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        {/* Backdrop — fade in/out via @base-ui data-starting-style / data-ending-style */}
        <Dialog.Backdrop
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm data-starting-style:opacity-0 data-ending-style:opacity-0 transition-opacity duration-[var(--dur-normal)]"
        />

        {/* Popup container — desktop: centered, mobile: bottom sheet */}
        <Dialog.Popup
          data-event-modal
          className={
            isMobile
              ? "fixed inset-0 z-50 flex items-end data-starting-style:opacity-0 data-ending-style:opacity-0 transition-opacity duration-[var(--dur-normal)]"
              : "fixed inset-0 z-50 flex items-center justify-center p-4 data-starting-style:opacity-0 data-ending-style:opacity-0 transition-opacity duration-[var(--dur-normal)]"
          }
        >
          {/* Content box — rounded-2xl desktop, rounded-t-2xl mobile (sheet) */}
          <div
            className={
              isMobile
                ? "bg-bg-elevated rounded-t-2xl w-full max-h-[95vh] overflow-y-auto border-t border-border"
                : "bg-bg-elevated rounded-2xl border border-border shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            }
          >
            {/* Header image or brand-pattern fallback */}
            <div className="relative h-48 bg-bg overflow-hidden rounded-t-2xl">
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

              {/* BeispielBadge — top-left when event.frontmatter.example === true (A-10) */}
              {fm.example && (
                <div className="absolute top-3 left-3">
                  <BeispielBadge />
                </div>
              )}

              {/* Close button — explicit aria-label required for icon-only button (A11Y FLAG2) */}
              <Dialog.Close
                aria-label="Event schließen"
                className="absolute top-3 right-3 inline-flex items-center justify-center h-11 w-11 rounded-full bg-bg/80 backdrop-blur-sm text-text hover:bg-bg transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </Dialog.Close>
            </div>

            {/* Modal body */}
            <div className="p-6">
              {/* Tag row: Format + Level + Partner (optional) */}
              <div className="flex flex-wrap gap-2 mb-3">
                <span className="font-mono text-[11px] font-bold uppercase tracking-[0.08em] bg-bg border border-border rounded-full px-2 py-0.5 text-text-muted">
                  {fm.format}
                </span>
                <span className="font-mono text-[11px] font-bold uppercase tracking-[0.08em] bg-bg border border-border rounded-full px-2 py-0.5 text-text-muted">
                  {fm.level}
                </span>
                {fm.partner && (
                  <span className="font-mono text-[11px] font-bold uppercase tracking-[0.08em] rounded-full px-2 py-0.5 text-[var(--accent)] border border-[var(--accent)]/40">
                    mit {fm.partner}
                  </span>
                )}
              </div>

              {/* Dialog.Title is required for aria-labelledby on the popup (a11y) */}
              <Dialog.Title
                className="font-sans font-semibold text-text leading-[1.3]"
                style={{ fontSize: "var(--fs-h2)" }}
              >
                {fm.title}
              </Dialog.Title>

              {/* Meta: date + location */}
              <div className="flex flex-col gap-2 mt-3 text-sm text-text-muted">
                <span className="flex items-center gap-2">
                  <CalendarDays className="h-4 w-4 shrink-0" aria-hidden="true" />
                  {formatDate(fm.date)}
                </span>
                <span className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 shrink-0" aria-hidden="true" />
                  {fm.location}
                </span>
              </div>

              {/* Description — Dialog.Description provides aria-describedby for a11y */}
              {fm.description && (
                <Dialog.Description className="mt-5 text-base leading-[1.65] text-text">
                  {fm.description}
                </Dialog.Description>
              )}

              {/* Speakers list */}
              {fm.speakers.length > 0 && (
                <div className="mt-6">
                  <h3 className="font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-text-muted mb-3">
                    Speaker
                  </h3>
                  <div className="flex flex-col gap-3">
                    {fm.speakers.map((s) => (
                      <div key={s.name} className="flex items-center gap-3">
                        <div
                          aria-hidden="true"
                          className="w-10 h-10 rounded-full bg-bg border border-border shrink-0"
                          style={
                            s.avatar
                              ? {
                                  backgroundImage: `url(${s.avatar})`,
                                  backgroundSize: "cover",
                                  backgroundPosition: "center",
                                }
                              : undefined
                          }
                        />
                        <div>
                          <div className="font-sans font-semibold text-sm text-text">
                            {s.name}
                          </div>
                          <div className="font-sans text-[13px] text-text-muted">
                            {s.role}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Anmelden CTA — auth-aware button text (A-04, A-07) */}
              <button
                type="button"
                onClick={handleAnmelden}
                data-action="anmelden"
                className="mt-8 w-full bg-[var(--accent)] text-[var(--text-on-accent)] font-mono font-bold text-sm rounded-full px-4 py-3 hover:shadow-[0_0_20px_var(--accent-glow)] hover:scale-[1.03] transition-all duration-[var(--dur-fast)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
              >
                {isAuthed === true
                  ? "Jetzt zum Event anmelden →"
                  : "Kostenlos registrieren und anmelden →"}
              </button>

              {/* Permalink to standalone event page (SEO + Share) */}
              <a
                href={`/events/${fm.slug}`}
                className="block mt-3 text-center font-mono text-xs text-text-muted hover:text-text transition-colors"
              >
                Permanenter Link zur Event-Seite →
              </a>
            </div>
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
