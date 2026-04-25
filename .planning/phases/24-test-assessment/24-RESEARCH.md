---
phase: 24
slug: test-assessment
type: research
created: 2026-04-24
status: complete
---

# Phase 24 — Technical Research

> Research scope: what does the planner need to know to plan 8-10 plans that deliver a deterministic, interactive AI literacy test with 5+ widget types, a results page with radar chart, and a Sparring-Slot placeholder?

---

## 1. Scoring — deterministic, client-side (D-01)

### Scoring model (discriminated union in TypeScript)

```ts
// lib/assessment/types.ts
export type Dimension = 'tools' | 'prompting' | 'agents' | 'application' | 'literacy'

export interface BaseQuestion {
  id: string                     // e.g. "q-01"
  dimension: Dimension
  prompt: string                 // max 2 sentences
  helpText?: string
  maxPoints: number              // per-question max (0-3 typical)
}

export type Question =
  | PickQuestion        // W1 + W9 (single-select card grid + MC)
  | RankQuestion        // W2 (Levenshtein-scored drag rank)
  | BestPromptQuestion  // W3 (single-select, shiki-highlighted)
  | SideBySideQuestion  // W4 (A/B + reason multi-select)
  | SpotQuestion        // W5 (click-to-mark one correct span)
  | MatchQuestion       // W6 (N:M pairing, correct-count scored)
  | ConfidenceQuestion  // W7 (discrete slider, distance-scored)
  | FillQuestion        // W8 (dropdown per blank)

export interface PickQuestion extends BaseQuestion {
  type: 'pick' | 'mc'
  options: Array<{ id: string; label: string; points: number }>
}

export interface RankQuestion extends BaseQuestion {
  type: 'rank'
  items: Array<{ id: string; label: string }>
  correctOrder: string[]           // item ids in correct order
  scoring: 'levenshtein' | 'exact'
}

export interface BestPromptQuestion extends BaseQuestion {
  type: 'best-prompt'
  options: Array<{ id: string; code: string; language: string; points: number }>
}

export interface SideBySideQuestion extends BaseQuestion {
  type: 'side-by-side'
  outputs: { a: string; b: string }
  correctChoice: 'a' | 'b'
  reasons: Array<{ id: string; label: string; isCorrect: boolean }>
  choicePoints: number             // if correctChoice matches
  reasonPointPerCorrect: number
}

export interface SpotQuestion extends BaseQuestion {
  type: 'spot'
  passageSegments: Array<{ id: string; text: string; isCorrect: boolean }>
}

export interface MatchQuestion extends BaseQuestion {
  type: 'match'
  tasks: Array<{ id: string; label: string }>
  tools: Array<{ id: string; label: string }>
  correctPairs: Record<string, string>  // taskId -> toolId
  pointPerCorrect: number
}

export interface ConfidenceQuestion extends BaseQuestion {
  type: 'confidence'
  prompt: string
  output: string
  groundTruthStep: 0 | 1 | 2 | 3 | 4   // 0%..100% in 5 steps
  pointByDistance: [number, number, number, number, number]  // by |userStep - groundTruth|
}

export interface FillQuestion extends BaseQuestion {
  type: 'fill'
  codeTemplate: string             // contains {{BLANK_ID}} tokens
  blanks: Array<{
    id: string
    options: Array<{ value: string; isCorrect: boolean }>
    pointsIfCorrect: number
  }>
}

export type Answer =
  | { questionId: string; type: 'pick' | 'mc'; optionId: string | null }
  | { questionId: string; type: 'rank'; order: string[] }
  | { questionId: string; type: 'best-prompt'; optionId: string | null }
  | { questionId: string; type: 'side-by-side'; choice: 'a' | 'b' | null; reasonIds: string[] }
  | { questionId: string; type: 'spot'; segmentId: string | null }
  | { questionId: string; type: 'match'; pairs: Record<string, string> }
  | { questionId: string; type: 'confidence'; step: 0 | 1 | 2 | 3 | 4 | null }
  | { questionId: string; type: 'fill'; selections: Record<string, string> }
```

### Level thresholds (D-04 — math-derived, hard-coded)

Assume 10 questions, average maxPoints 3 per question → max total ~30.

```ts
// lib/assessment/scoring.ts
export const LEVEL_THRESHOLDS: Array<{ min: number; max: number; level: Level; slug: LevelSlug }> = [
  { min: 0,  max: 5,  level: 1, slug: 'neugieriger' },
  { min: 6,  max: 12, level: 2, slug: 'einsteiger' },
  { min: 13, max: 19, level: 3, slug: 'fortgeschritten' },
  { min: 20, max: 25, level: 4, slug: 'pro' },
  { min: 26, max: 30, level: 5, slug: 'expert' },
]
```

Plan-02 finalizes exact thresholds once Plan-03 commits the final per-question `maxPoints` values (e.g. 10 questions × 3 = 30, else rescale proportionally). Unit test verifies threshold contiguity (min_n+1 = max_n + 1).

### Per-dimension normalization

```ts
// Skill-score (0-100 per dimension):
// dim_score = sum(points earned where question.dimension === dim)
// dim_max   = sum(maxPoints where question.dimension === dim)
// dim_pct   = Math.round((dim_score / dim_max) * 100)
```

### Levenshtein for rank scoring

For 4-item rank: min distance 0 → `maxPoints`. For each swap needed: `-1 point` floor 0.

```ts
function levenshtein(a: string[], b: string[]): number {
  // standard DP levenshtein on arrays of ids
  const m = a.length, n = b.length
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0))
  for (let i = 0; i <= m; i++) dp[i][0] = i
  for (let j = 0; j <= n; j++) dp[0][j] = j
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i-1] === b[j-1]) dp[i][j] = dp[i-1][j-1]
      else dp[i][j] = 1 + Math.min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1])
    }
  }
  return dp[m][n]
}
```

For 4 items: max distance ~4. Points = `Math.max(0, maxPoints - distance)`.

### Fixture-based unit tests (Determinism requirement)

```ts
// lib/assessment/__tests__/scoring.test.ts
describe('scoreAssessment', () => {
  it('is deterministic: same input -> same output', () => {
    const result1 = scoreAssessment(FIXTURE_QUESTIONS, FIXTURE_ANSWERS_PATTERN_A)
    const result2 = scoreAssessment(FIXTURE_QUESTIONS, FIXTURE_ANSWERS_PATTERN_A)
    expect(result1).toEqual(result2)
  })
  it('low scorer -> Level 1', () => { /* ... */ })
  it('mid scorer -> Level 3', () => { /* ... */ })
  it('top scorer -> Level 5', () => { /* ... */ })
  it('levenshtein rank matches spec', () => { /* ... */ })
})
```

---

## 2. Drag-Drop — @dnd-kit/core (CONTEXT D-note)

### Package choice

Per CONTEXT open-questions: `@dnd-kit/core` is the decision (A11y-first, keyboard support, React 19 / Next 16 compatible). Sibling package `@dnd-kit/sortable` for ranking.

```
pnpm --filter @genai/website add @dnd-kit/core @dnd-kit/sortable @dnd-kit/modifiers
```

### Rank widget pattern (W2)

```tsx
import { DndContext, closestCenter, KeyboardSensor, PointerSensor,
         useSensor, useSensors } from '@dnd-kit/core'
import { SortableContext, sortableKeyboardCoordinates,
         useSortable, arrayMove, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

export function DragRankWidget({ items, onChange }: Props) {
  const [order, setOrder] = useState(items.map(i => i.id))
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )
  function handleDragEnd(evt) {
    if (evt.active.id !== evt.over?.id) {
      const newOrder = arrayMove(order, order.indexOf(evt.active.id), order.indexOf(evt.over.id))
      setOrder(newOrder)
      onChange(newOrder)
    }
  }
  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={order} strategy={verticalListSortingStrategy}>
        {order.map(id => <SortableItem key={id} id={id} label={items.find(i=>i.id===id)!.label} />)}
      </SortableContext>
    </DndContext>
  )
}
```

### Matching widget (W6) — mobile fallback

Mobile: detect `window.matchMedia('(pointer: coarse)').matches` OR use a `useIsTouch` hook. If coarse → render native `<select>` per task row. Desktop → dnd-kit drag zones.

### A11y announcements

`@dnd-kit/core` has built-in `announcements` prop. Custom messages in German:

```ts
const announcements: Announcements = {
  onDragStart({ active }) { return `Element ${active.id} aufgenommen` },
  onDragOver({ active, over }) { return over ? `Element ${active.id} über Position ${over.id}` : '' },
  onDragEnd({ active, over }) { return over ? `Element ${active.id} auf Position ${over.id} abgelegt` : 'Abgebrochen' },
  onDragCancel({ active }) { return `Element ${active.id} — Drag abgebrochen` },
}
```

---

## 3. Recharts — Radar Chart for 5 Dimensions

### Install

```
pnpm --filter @genai/website add recharts
```

Recharts v2 supports React 19 (peerDep range includes 19). v3 exists but overkill for one chart.

### Minimal radar

```tsx
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, Radar } from 'recharts'

const data = [
  { dim: 'Tools', score: skills.tools },
  { dim: 'Prompting', score: skills.prompting },
  { dim: 'Agents', score: skills.agents },
  { dim: 'Anwendung', score: skills.application },
  { dim: 'Critical Literacy', score: skills.literacy },
]

<ResponsiveContainer width="100%" aspect={1}>
  <RadarChart data={data} margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
    <PolarGrid stroke="var(--border)" />
    <PolarAngleAxis dataKey="dim"
      tick={{ fill: 'var(--text-muted)', fontSize: 14, fontFamily: 'var(--font-geist-sans)' }} />
    <Radar
      dataKey="score"
      stroke={levelColor}
      fill={levelColor}
      fillOpacity={0.2}
      strokeWidth={2}
      animationDuration={reducedMotion ? 0 : 800}
      isAnimationActive={!reducedMotion}
    />
  </RadarChart>
</ResponsiveContainer>
```

### A11y — figure + figcaption

Recharts renders SVG without ARIA-caption inside. Wrap in `<figure>` with programmatic `<figcaption>`:

```tsx
const topTwo = Object.entries(skills).sort(([,a],[,b])=>b-a).slice(0,2).map(([k])=>k)
const bottom = Object.entries(skills).sort(([,a],[,b])=>a-b)[0][0]
<figure>
  <ResponsiveContainer>...</ResponsiveContainer>
  <figcaption className="sr-only">
    Deine Stärken: {topTwo.join(', ')}. Ausbaufähig: {bottom}.
  </figcaption>
</figure>
```

### CSP consideration

Recharts uses inline styles on SVG elements. With our `nonce`-based CSP this is fine — we allow `style-src 'self' 'unsafe-inline'` for SVG (standard pattern). No inline script, no CSP issue.

---

## 4. Shiki — Syntax highlighting in Next.js 16 App Router

### Install

```
pnpm --filter @genai/website add shiki
```

Shiki is pure JS, no runtime WASM issues in edge.

### Pattern — server-component highlight (preferred)

For **static code in questions.json**: pre-highlight at build-time OR at route-request-time in a **server component**. Shiki in client bundles is ~200KB — undesirable.

**Approach A (chosen):** Highlight inside the content-fetching server boundary. But widgets are interactive client components. So:

**Approach B (actually chosen):** Highlight inside a server `page.tsx` helper that emits pre-rendered HTML strings alongside the question data, passed to the client via props. Use `getHighlighter` once at module-eval.

```ts
// lib/shiki.ts
import { createHighlighter } from 'shiki'
let highlighter: Awaited<ReturnType<typeof createHighlighter>> | null = null
export async function getShiki() {
  if (!highlighter) {
    highlighter = await createHighlighter({
      themes: ['github-dark', 'github-light'],
      langs: ['javascript', 'typescript', 'python', 'json', 'bash', 'plaintext'],
    })
  }
  return highlighter
}

// in a server component / route handler:
const hl = await getShiki()
const html = hl.codeToHtml(code, { lang, theme: 'github-dark' })  // or light per user prefs
```

### Alternative for this phase: build-time pre-render

Since questions.json is static content under `content/assessment/`:
- Add a build-step/util `lib/assessment/prepare-questions.ts` which at page load (server side) enriches questions with `codeHtml` for any `code`-bearing options/templates.
- Client widgets receive `codeHtml: string` and render via `dangerouslySetInnerHTML` (content is trusted — authored in repo).
- Theme: detect user theme (dark default, light on `.light`). Since page is dark by default, ship `github-dark`. Light-theme switch is phase 24 out-of-scope (all code blocks dark-themed; matches `<code>` style precedent).

### Font sync

Shiki `codeToHtml` emits `<pre><code>` with `style` inline. Add `font-family: var(--font-geist-mono)` via wrapper class — shiki's inline font style can be overridden with `.shiki code { font-family: inherit }` in globals.

---

## 5. Framer Motion (already installed as `motion@12.38.0`) — AnimatePresence in Next 16

Pattern already proven in the codebase (`home-client.tsx`, `about-client.tsx`):

```tsx
'use client'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'

<AnimatePresence mode="wait">
  <motion.div
    key={currentQuestionIndex}
    initial={reducedMotion ? { opacity: 0 } : { opacity: 0, x: 30 }}
    animate={reducedMotion ? { opacity: 1 } : { opacity: 1, x: 0 }}
    exit={reducedMotion ? { opacity: 0 } : { opacity: 0, x: -20 }}
    transition={{ duration: reducedMotion ? 0.15 : 0.3, ease: 'easeOut' }}
  >
    {/* current question */}
  </motion.div>
</AnimatePresence>
```

`MotionConfig nonce={nonce}` is already set up in every client-wrapper — reuse pattern.

---

## 6. MDX for Level Profiles (D-09)

### Install

```
pnpm --filter @genai/website add @next/mdx @mdx-js/loader @mdx-js/react
```

### Config

`next.config.ts`:
```ts
import createMDX from '@next/mdx'
const withMDX = createMDX({})
export default withMDX({
  pageExtensions: ['ts', 'tsx', 'md', 'mdx'],
})
```

### Structure

```
apps/website/content/assessment/
  questions.json
  community-index.json
  profiles/
    neugieriger.mdx
    einsteiger.mdx
    fortgeschritten.mdx
    pro.mdx
    expert.mdx
```

Profile access pattern:
```ts
// lib/assessment/profiles.ts
import dynamic from 'next/dynamic'
const profileMap = {
  neugieriger: dynamic(() => import('../../content/assessment/profiles/neugieriger.mdx')),
  einsteiger:  dynamic(() => import('../../content/assessment/profiles/einsteiger.mdx')),
  /* ... */
}
export function getProfileComponent(slug: LevelSlug) { return profileMap[slug] }
```

**Simpler alternative (chosen):** Static import map; no `dynamic` needed on server:

```ts
import Neugieriger from '@/content/assessment/profiles/neugieriger.mdx'
import Einsteiger from '@/content/assessment/profiles/einsteiger.mdx'
/* ... */
export const LevelProfile: Record<LevelSlug, React.ComponentType> = {
  neugieriger: Neugieriger,
  einsteiger: Einsteiger,
  fortgeschritten: Fortgeschritten,
  pro: Pro,
  expert: Expert,
}
```

---

## 7. Result State Management (No-Auth, Client-Only)

### Strategy: React Context + useReducer, no persistence

```ts
// lib/assessment/use-assessment.ts
type State = {
  currentIndex: number
  answers: Record<string, Answer>
  startedAt: number  // for optional 15-min UX timer
  complete: boolean
}

type Action =
  | { type: 'ANSWER'; answer: Answer }
  | { type: 'NEXT' }
  | { type: 'RESET' }
  | { type: 'HYDRATE_FROM_URL'; index: number }

// Provider at /test/* layout level (not root — keeps home page clean)
```

### URL-State Sync (D-11)

- `/test/aufgabe/3` → reducer reads `n=3` from `params` on mount. If no answer yet exists for questions 1..2, browser-back goes to `/test` (no reverse engineering).
- Router guard: `useEffect` on `params.n` checks `answers[q(n-1).id]` exists. If missing and `n > 1` → `router.replace('/test')`.

### Handoff to /test/ergebnis

- `/test/aufgabe/[n]` → on last answer commit → `router.push('/test/ergebnis')`.
- `/test/ergebnis` reads from context provider. If context empty (direct URL access) → render fallback "Kein Ergebnis" + CTA to `/test` (spec'd in UI-SPEC copywriting).

### Query-param handoff to /join (D-08)

```ts
const skillsParam = Object.entries(skills)
  .map(([dim, pct]) => `${dim}:${pct}`)
  .join(',')
router.push(`/join?pre=${levelSlug}&source=test&skills=${encodeURIComponent(skillsParam)}`)
```

On `/join` side: phase-24 scope is write-only (emit the params). `/join`'s handling of `?pre=` is out-of-scope (phase 23 already accepts the param; actual pre-fill is phase 25 Unified Signup).

---

## 8. Sparring-Slot Placeholder — Props Interface (D-07)

### Props contract (finalized for future live-swap)

```ts
// components/test/sparring-slot.tsx
export interface SparringSlotProps {
  level: 1 | 2 | 3 | 4 | 5
  skills: Record<Dimension, number>  // 0-100 per dim
  mode: 'placeholder' | 'live'
  className?: string
}

export function SparringSlot(props: SparringSlotProps) {
  if (props.mode === 'placeholder') return <SparringSlotPlaceholder {...props} />
  // Future: return <SparringSlotLive {...props} />
  return <SparringSlotPlaceholder {...props} />  // safe fallback
}
```

The live variant (later phase) will add: streaming API endpoint, Anthropic SDK call with `level`/`skills` injected into system prompt, multi-turn state via React hook. The props interface stays identical → drop-in swap.

### Placeholder content (from UI-SPEC)

Static: header strip with PRISMA avatar + "Kommt bald" badge; message bubble with 2-sentence bot message; disabled input; text-link CTA to `/join?source=test-sparring`.

---

## 9. Content Draft Approach (D-09)

Plan 24-03 drafts:
- 10 `questions.json` entries covering ≥5 widget types (CONTEXT.md success criterion)
- 5 MDX `profiles/*.mdx` files (one per level)
- 10-20 entries in `community-index.json` with fields: `{ id, type: 'workshop' | 'tool' | 'artikel' | 'community', title, description, href, levels: LevelSlug[] }` — mapped per level.

Claude drafts; Luca reviews post-execute.

---

## 10. SEO Contract Implementation

From UI-SPEC:
- `<title>`: "AI Literacy Test — Wo stehst du wirklich mit KI?"
- `meta description`: EN for keyword matching
- `og:*`: EN
- `canonical`: `https://generation-ai.org/test`
- `/test/aufgabe/[n]`: `robots: noindex, nofollow`
- `/test/ergebnis`: `robots: noindex, nofollow`

Next 16 App Router: `metadata` export in `app/test/page.tsx`, `app/test/aufgabe/[n]/page.tsx` (`robots`), `app/test/ergebnis/page.tsx` (`robots`).

Sitemap update: add `/test` to `apps/website/app/sitemap.ts` with `priority: 0.8, changeFrequency: 'monthly'`.

---

## 11. Validation Architecture (Nyquist Dimension 8)

**Observables:**
1. `scoreAssessment(questions, answers)` — pure function, deterministic, fixture-tested.
2. React state on `/test/ergebnis`: `{ level, slug, skills }` object.
3. URL on signup click: `/join?pre=<slug>&source=test&skills=<dim:pct,dim:pct,...>`.
4. DOM: ≥5 distinct widget types rendered across the 10 questions (verifiable via Playwright `page.locator('[data-widget-type]').evaluateAll(...)`).
5. SEO metas in HTML `<head>`.

**Oracles (ground truth):**
1. Static test fixtures in `lib/assessment/__tests__/fixtures.ts` — 3 answer patterns (low/mid/high) with expected level/skills.
2. CONTEXT.md decisions (D-01 through D-12).
3. UI-SPEC widget specs.
4. Community-index.json (curated by author).

**Sampling rate:**
- Unit tests: per-fixture equality check (Vitest)
- Smoke: single Playwright run, 3 widget types walked through to /ergebnis
- Lighthouse: 3 routes (/test, /test/aufgabe/1, /test/ergebnis) against local dev

**Gaps known to accept:**
- No adaptive-question validation (D-out-of-scope)
- No shareable URL testing beyond generation (V2)
- No mobile touch E2E (manual UAT)

---

## 12. Package Install Summary

To be added in Plan 24-01:
```
pnpm --filter @genai/website add \
  @dnd-kit/core \
  @dnd-kit/sortable \
  @dnd-kit/modifiers \
  recharts \
  shiki \
  @next/mdx \
  @mdx-js/loader \
  @mdx-js/react \
  @types/mdx
```

Approximate bundle impact:
- `@dnd-kit/*` ~35KB gz on routes that use it (lazy)
- `recharts` ~90KB gz, used only on `/test/ergebnis`
- `shiki` used server-side at page render → zero client bundle
- `@next/mdx` is build-only

All routes continue to target Lighthouse >90.

---

## RESEARCH COMPLETE

All 12 research areas resolved with concrete patterns. Planner has enough to:
- Create discriminated-union types and deterministic scoring with unit tests
- Scaffold all 9 widget components with correct library choices and A11y contracts
- Assemble two route trees (/test/aufgabe/[n], /test/ergebnis) with URL state and transitions
- Define the Sparring-Slot props interface for future live-swap
- Lock SEO metas, sitemap, noindex rules, and Playwright smoke scope
