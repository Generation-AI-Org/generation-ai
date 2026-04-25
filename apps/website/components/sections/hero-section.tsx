'use client'

import Link from "next/link"
import { motion, useReducedMotion } from "motion/react"
import { LabeledNodes } from "@/components/ui/labeled-nodes"

export function HeroSection() {
  const prefersReducedMotion = useReducedMotion()

  return (
    <section
      aria-labelledby="hero-heading"
      data-section="hero"
      className="relative isolate"
    >
      <LabeledNodes className="flex min-h-[calc(100vh-5rem)] flex-col items-center justify-center">
        <motion.div
          initial={prefersReducedMotion ? false : { opacity: 0, y: 16 }}
          animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="relative z-10 mx-auto max-w-3xl px-6 py-20 text-center"
        >
          {/* Eyebrow mit LED-Dot */}
          <div
            className="inline-flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-text-muted"
            style={{
              textShadow:
                "0 0 10px rgba(var(--bg-rgb), 1), 0 0 4px rgba(var(--bg-rgb), 1)",
            }}
          >
            <span
              aria-hidden="true"
              className="h-1.5 w-1.5 rounded-full"
              style={{
                background: "var(--accent)",
                boxShadow: "0 0 8px var(--accent-glow)",
              }}
            />
            Generation AI · DACH-Community
          </div>

          {/* H1 — Geist Mono 700, tracking tight, accent-span auf "fehlen" */}
          <h1
            id="hero-heading"
            className="mt-6 font-mono font-bold leading-[1.02] tracking-[-0.03em] text-text text-balance"
            style={{
              fontSize: "var(--fs-display)",
              textShadow:
                "0 0 18px rgba(var(--bg-rgb), 1), 0 0 8px rgba(var(--bg-rgb), 1)",
            }}
          >
            KI-Skills,
            <br />
            die im Studium{" "}
            <span style={{ color: "var(--accent)" }}>fehlen</span>.
          </h1>

          {/* Subline */}
          <p
            className="mx-auto mt-6 max-w-xl text-lg leading-[1.5] text-text-secondary text-pretty sm:text-xl"
            style={{
              textShadow:
                "0 0 12px rgba(var(--bg-rgb), 1), 0 0 5px rgba(var(--bg-rgb), 1)",
            }}
          >
            Die Community für Studierende, die KI nicht nur benutzen, sondern
            verstehen wollen. Tools, Kurse, Events — und ein Netzwerk, das
            verbindet.
          </p>

          {/* CTAs */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/join"
              prefetch={false}
              className="group inline-flex items-center justify-center gap-2 rounded-full px-7 py-4 font-mono text-[15px] font-bold tracking-[0.02em] text-[var(--text-on-accent)] transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:scale-[1.03] hover:shadow-[0_0_24px_var(--accent-glow)] active:scale-[0.98]"
              style={{ background: "var(--accent)" }}
            >
              Kostenlos beitreten
              <svg
                aria-hidden="true"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-[3px]"
              >
                <path d="M5 12h14M13 5l7 7-7 7" />
              </svg>
            </Link>
            <Link
              href="#offering-heading"
              className="inline-flex items-center justify-center rounded-full border px-7 py-4 font-mono text-[15px] font-bold tracking-[0.02em] text-text transition-colors duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]"
              style={{ borderColor: "var(--border)" }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.borderColor = "var(--border-accent)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.borderColor = "var(--border)")
              }
            >
              Mehr erfahren
            </Link>
          </div>

          {/* Meta-Row mit 3 Checks */}
          <div
            className="mt-7 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 font-mono text-[11px] uppercase tracking-[0.12em] text-text-muted"
            style={{
              textShadow:
                "0 0 10px rgba(var(--bg-rgb), 1), 0 0 4px rgba(var(--bg-rgb), 1)",
            }}
          >
            {["Kostenlos", "Gemeinnützig", "Für Studis & Early-Career"].map(
              (label) => (
                <span key={label} className="inline-flex items-center gap-1.5">
                  <svg
                    aria-hidden="true"
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{ color: "var(--accent)" }}
                  >
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                  {label}
                </span>
              ),
            )}
          </div>
        </motion.div>
      </LabeledNodes>

      {/* Scroll-Indicator — Kind der Section, damit bottom relativ zur Hero-Höhe ist */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-8 left-1/2 z-20 hidden -translate-x-1/2 flex-col items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-text-muted opacity-70 sm:flex"
      >
        <span>scroll</span>
        <span className="hero-scroll-line block h-8 w-px" />
      </div>

      <style jsx>{`
        .hero-scroll-line {
          background: linear-gradient(
            to bottom,
            var(--text-muted),
            transparent
          );
          animation: heroScrollPulse 2s ease-in-out infinite;
        }
        @keyframes heroScrollPulse {
          0%,
          100% {
            opacity: 0.3;
          }
          50% {
            opacity: 1;
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .hero-scroll-line {
            animation: none;
          }
        }
      `}</style>
    </section>
  )
}
