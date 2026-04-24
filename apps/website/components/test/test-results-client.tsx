'use client'

// apps/website/components/test/test-results-client.tsx
// Phase 24 — /test/ergebnis top-level client. Reads assessment state from
// AssessmentProvider (mounted in /test layout). Renders fallback if no result.

import { MotionConfig } from 'motion/react'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { SectionTransition } from '@/components/ui/section-transition'
import { useAssessment } from '@/lib/assessment/use-assessment'
import { LevelBadge } from '@/components/test/level-badge'
import { SkillRadarChart } from '@/components/test/skill-radar-chart'
import { EmpfehlungsCard } from '@/components/test/empfehlungs-card'
import { SparringSlot } from '@/components/test/sparring-slot'
import { ResultsCtaCluster } from '@/components/test/results-cta-cluster'
import { NoResultFallback } from '@/components/test/no-result-fallback'
import { LevelProfile } from '@/lib/assessment/profiles'
import { loadRecommendations } from '@/lib/assessment/load-community'

export function TestResultsClient({ nonce }: { nonce: string }) {
  const { result, isComplete } = useAssessment()

  if (!isComplete || !result) {
    return (
      <MotionConfig nonce={nonce}>
        <Header />
        <main id="main-content" className="min-h-screen pt-20">
          <NoResultFallback />
        </main>
        <Footer />
      </MotionConfig>
    )
  }

  const ProfileComponent = LevelProfile[result.slug]
  const recs = loadRecommendations(result.slug, 5)

  return (
    <MotionConfig nonce={nonce}>
      <Header />
      <main id="main-content" className="min-h-screen pt-20">
        <LevelBadge slug={result.slug} />

        <section
          className="mx-auto max-w-2xl px-4 py-8"
          aria-labelledby="profile-heading"
        >
          <h2 id="profile-heading" className="sr-only">
            Level-Beschreibung
          </h2>
          <ProfileComponent />
        </section>

        <SectionTransition variant="soft-fade" />

        <section
          className="mx-auto max-w-4xl px-4 py-8"
          aria-label="Skill-Profil"
        >
          <SkillRadarChart skills={result.skills} slug={result.slug} />
        </section>

        <SectionTransition variant="soft-fade" />

        <section className="mx-auto max-w-4xl px-4 py-8">
          <h2
            className="mb-6 text-center font-semibold text-[var(--text)]"
            style={{ fontSize: 'var(--fs-h2)' }}
          >
            Das empfehlen wir für Level {result.level}
          </h2>
          <div className="mx-auto grid max-w-4xl grid-cols-1 gap-4 sm:grid-cols-2">
            {recs.map((rec) => (
              <EmpfehlungsCard key={rec.id} rec={rec} />
            ))}
          </div>
        </section>

        <SectionTransition variant="soft-fade" />

        <section className="mx-auto max-w-2xl px-4 py-8">
          <SparringSlot
            level={result.level}
            skills={result.skills}
            mode="placeholder"
          />
        </section>

        <ResultsCtaCluster slug={result.slug} skills={result.skills} />
      </main>
      <Footer />
    </MotionConfig>
  )
}
