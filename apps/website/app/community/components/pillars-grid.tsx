import { Users, BookOpen, Newspaper, Lock } from "lucide-react";
import { BentoGrid, BentoGridItem } from "@/components/ui/bento-grid";

// Phase 26 Plan 02 — 4-Pillar Bento-Grid (D-12).
// Server Component — keine Interaktivität nötig, reused BentoGrid statt
// neuer Custom-Card. Lucide-Icons nach D-12 Spec (Users / BookOpen /
// Newspaper / Lock). Konsistent zur offering-section.tsx.

const pillars = [
  {
    title: "Austausch",
    description:
      "Peer-to-Peer, Fragen, Sparring. Andere Studis, gleiche Probleme.",
    icon: <Users className="h-5 w-5 text-[var(--accent)]" aria-hidden />,
  },
  {
    title: "Lernpfade & Kurse",
    description:
      "Strukturiert, im eigenen Tempo. Vom KI-Einstieg bis zur Spezialisierung.",
    icon: <BookOpen className="h-5 w-5 text-[var(--accent)]" aria-hidden />,
  },
  {
    title: "News & Insights",
    description:
      "Kuratiert. Signal statt Noise. Die wichtigsten Releases pro Woche.",
    icon: <Newspaper className="h-5 w-5 text-[var(--accent)]" aria-hidden />,
  },
  {
    title: "Exklusive Inhalte",
    description:
      "Prompt-Bibliotheken, Tool-Tiefgänge, Masterclass-Materialien.",
    icon: <Lock className="h-5 w-5 text-[var(--accent)]" aria-hidden />,
  },
];

export function PillarsGrid() {
  return (
    <section
      aria-labelledby="pillars-heading"
      data-section="community-pillars"
      className="bg-bg py-24 sm:py-32 border-b border-border"
    >
      <div className="mx-auto max-w-6xl px-6">
        <div className="text-center mb-12 max-w-2xl mx-auto">
          <p className="font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-text-muted mb-3">
            {"// was dich drinnen erwartet"}
          </p>
          <h2
            id="pillars-heading"
            className="text-3xl sm:text-4xl font-bold tracking-tight text-text"
          >
            Vier Räume, ein Ziel.
          </h2>
        </div>

        <BentoGrid className="md:grid-cols-2 md:auto-rows-[14rem]">
          {pillars.map((p) => (
            <BentoGridItem
              key={p.title}
              title={p.title}
              description={p.description}
              icon={p.icon}
            />
          ))}
        </BentoGrid>
      </div>
    </section>
  );
}
