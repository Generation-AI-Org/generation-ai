"use client";

// Phase 22.6 Plan 03 Task 3 — EventsFormats section.
// 3 format cards: Workshops / Speaker Sessions / Masterclasses.
// UI-SPEC: grid grid-cols-1 md:grid-cols-3 gap-6, bg-bg-elevated border rounded-2xl p-6.

import { Wrench, Mic, GraduationCap } from "lucide-react";

const FORMATS = [
  {
    icon: Wrench,
    name: "Workshops",
    description:
      "Praktische Hands-on-Sessions in kleinen Gruppen. Du verlässt jeden Workshop mit konkreten Skills, die du sofort anwenden kannst.",
  },
  {
    icon: Mic,
    name: "Speaker Sessions",
    description:
      "Inputs von Praktiker:innen und Forschenden. Strategische Perspektive statt Tool-Hopping — gefolgt von echtem Q&A.",
  },
  {
    icon: GraduationCap,
    name: "Masterclasses",
    description:
      "Tiefe Einblicke von Expert:innen aus Industrie und Wissenschaft. 90–120 Minuten konzentrierte Lerneinheit.",
  },
] as const;

export function EventsFormats() {
  return (
    <section
      aria-labelledby="events-formats-heading"
      data-section="events-formats"
      className="mx-auto max-w-6xl px-6 py-16"
    >
      <h2
        id="events-formats-heading"
        className="font-sans font-bold text-text mb-8 text-center"
        style={{ fontSize: "var(--fs-h2)" }}
      >
        Unsere Formate
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {FORMATS.map((f) => {
          const Icon = f.icon;
          return (
            <div
              key={f.name}
              className="bg-bg-elevated border border-border rounded-2xl p-6"
            >
              <Icon
                className="h-6 w-6 text-[var(--accent)] mb-4"
                aria-hidden="true"
              />
              <h3
                className="font-sans font-semibold text-text leading-[1.3]"
                style={{ fontSize: "var(--fs-h3)" }}
              >
                {f.name}
              </h3>
              <p className="mt-3 text-base leading-[1.65] text-text-muted">
                {f.description}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
