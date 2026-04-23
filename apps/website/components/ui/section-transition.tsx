'use client'

import { motion, useReducedMotion } from "motion/react"

// SectionTransition — connective-tissue primitive zwischen Landing-Sections.
//
// Plan 20.6-08 (autonomous defaults):
//   - Template-based, nicht section-spezifisch: eine wiederverwendbare Komponente
//     mit 2 Varianten deckt alle 8 Section-Boundaries ab.
//   - Viewport-entry statt scroll-driven: `motion/react` whileInView (once:true),
//     keine scroll-listener-Performance-Kosten.
//   - Connection-Motif als subtile Anchor-Lines bei narrativen Schlüssel-
//     Transitions (Hero→Problem-Block als opener, Trust→Final-CTA als closer).
//   - Max. 2 Motion-Layer pro Boundary. Reduced-motion = alles static.
//   - Mobile (unter md): vertikale anchor-line deaktiviert, nur hairline bleibt.
//
// Varianten:
//   variant="soft-fade"   → horizontale Hairline (60%-fade-in von transparent →
//                           var(--border) → transparent), kein Vertical-Echo.
//                           Für Content-zu-Content-Übergänge (most boundaries).
//   variant="signal-echo" → zusätzlich kurze vertikale Anchor-Line (`--accent`)
//                           die beim Viewport-Entry von oben wächst und auf
//                           65% fadet. "Roter-Faden"-Motif, narrative anchor.
//                           Für Hero→Problem-Block (opener) und Trust→Final-CTA
//                           (closer).
//
// Tokens: --accent, --accent-glow, --border, --dur-normal, --ease-out.
// Kein Custom-Hex, keine Ad-hoc-Animationen.
//
// A11y: pointer-events-none + aria-hidden — rein dekorativ.

type Variant = "soft-fade" | "signal-echo"

interface SectionTransitionProps {
  /** `soft-fade` (default) für normale Boundaries, `signal-echo` für narrative anchors. */
  variant?: Variant
  /** Optional className for outer wrapper (z.B. für Farb-Kontext der Hairline). */
  className?: string
}

export function SectionTransition({
  variant = "soft-fade",
  className,
}: SectionTransitionProps) {
  const prefersReducedMotion = useReducedMotion()

  // Horizontaler Hairline — in allen Varianten present, DS-Token only.
  const hairlineIn = prefersReducedMotion
    ? { initial: { scaleX: 1, opacity: 0.6 } }
    : {
        initial: { scaleX: 0, opacity: 0 },
        whileInView: { scaleX: 1, opacity: 0.6 },
        viewport: { once: true, margin: "-10% 0px" },
        transition: {
          duration: 0.8,
          ease: [0.16, 1, 0.3, 1] as const,
        },
      }

  // Vertical anchor-line (Signal-Echo variant) — wächst von oben, zentriert.
  // Mobile: per CSS deaktiviert (hidden md:block).
  const anchorIn = prefersReducedMotion
    ? { initial: { scaleY: 1, opacity: 0.65 } }
    : {
        initial: { scaleY: 0, opacity: 0 },
        whileInView: { scaleY: 1, opacity: 0.65 },
        viewport: { once: true, margin: "-15% 0px" },
        transition: {
          duration: 0.9,
          ease: [0.16, 1, 0.3, 1] as const,
          delay: 0.15,
        },
      }

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none relative flex w-full items-center justify-center ${
        variant === "signal-echo" ? "h-12 sm:h-16" : "h-6 sm:h-8"
      } ${className ?? ""}`}
    >
      {/* Horizontale Hairline — DS-Border, fade-from-transparent */}
      <motion.span
        {...hairlineIn}
        className="absolute left-1/2 top-1/2 block h-px w-[min(80%,640px)] -translate-x-1/2 -translate-y-1/2 origin-center"
        style={{
          background:
            "linear-gradient(90deg, transparent, var(--border), transparent)",
        }}
      />

      {/* Vertikale Anchor-Line — nur bei signal-echo, desktop-only (md+) */}
      {variant === "signal-echo" && (
        <motion.span
          {...anchorIn}
          className="absolute left-1/2 top-0 hidden h-full w-px origin-top -translate-x-1/2 md:block"
          style={{
            background:
              "linear-gradient(to bottom, var(--accent), transparent)",
            boxShadow: "0 0 8px var(--accent-glow)",
          }}
        />
      )}
    </div>
  )
}
