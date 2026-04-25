// apps/website/lib/assessment/__tests__/fixtures.ts
// Phase 24 — deterministic test fixtures for scoreAssessment().
// 10 questions, one per widget type (+ extra pick variants), total maxPoints = 30.
// Three answer patterns: LOW (<=5), MID (13-19), HIGH (>=26).

import type { Answer, Question } from '../types'

export const FIXTURE_QUESTIONS: Question[] = [
  // q1 — pick (tools, maxPoints 3)
  {
    id: 'q1',
    dimension: 'tools',
    prompt: 'Welches Tool ist am besten zum Brainstorming?',
    maxPoints: 3,
    type: 'pick',
    options: [
      { id: 'a', label: 'A', points: 3 },
      { id: 'b', label: 'B', points: 1 },
      { id: 'c', label: 'C', points: 0 },
      { id: 'd', label: 'D', points: 0 },
    ],
  },
  // q2 — pick (tools, maxPoints 3)
  {
    id: 'q2',
    dimension: 'tools',
    prompt: 'Welches Modell eignet sich fuer lange Texte?',
    maxPoints: 3,
    type: 'pick',
    options: [
      { id: 'a', label: 'A', points: 0 },
      { id: 'b', label: 'B', points: 3 },
      { id: 'c', label: 'C', points: 1 },
      { id: 'd', label: 'D', points: 0 },
    ],
  },
  // q3 — rank (prompting, maxPoints 3, Levenshtein)
  {
    id: 'q3',
    dimension: 'prompting',
    prompt: 'Reihe die Prompts von bestem zum schlechtesten.',
    maxPoints: 3,
    type: 'rank',
    scoring: 'levenshtein',
    items: [
      { id: 'r1', label: 'R1' },
      { id: 'r2', label: 'R2' },
      { id: 'r3', label: 'R3' },
      { id: 'r4', label: 'R4' },
    ],
    correctOrder: ['r1', 'r2', 'r3', 'r4'],
  },
  // q4 — best-prompt (prompting, maxPoints 3)
  {
    id: 'q4',
    dimension: 'prompting',
    prompt: 'Welcher Prompt ist am besten?',
    maxPoints: 3,
    type: 'best-prompt',
    options: [
      { id: 'p1', code: 'prompt 1', language: 'text', points: 3 },
      { id: 'p2', code: 'prompt 2', language: 'text', points: 0 },
      { id: 'p3', code: 'prompt 3', language: 'text', points: 1 },
    ],
  },
  // q5 — side-by-side (agents, maxPoints 3)
  // choicePoints=1, reasonPointPerCorrect=1 -> 1 (choice) + up to 2 (reasons) = 3
  {
    id: 'q5',
    dimension: 'agents',
    prompt: 'A oder B? Waehle Gruende.',
    maxPoints: 3,
    type: 'side-by-side',
    outputs: { a: 'Output A text', b: 'Output B text' },
    correctChoice: 'a',
    reasons: [
      { id: 'rn1', label: 'Reason 1', isCorrect: true },
      { id: 'rn2', label: 'Reason 2', isCorrect: true },
      { id: 'rn3', label: 'Reason 3', isCorrect: false },
    ],
    choicePoints: 1,
    reasonPointPerCorrect: 1,
  },
  // q6 — match (agents, maxPoints 3)
  // 3 task/tool pairs, pointPerCorrect=1 -> max 3
  {
    id: 'q6',
    dimension: 'agents',
    prompt: 'Welches Tool fuer welche Aufgabe?',
    maxPoints: 3,
    type: 'match',
    tasks: [
      { id: 't1', label: 'T1' },
      { id: 't2', label: 'T2' },
      { id: 't3', label: 'T3' },
    ],
    tools: [
      { id: 'u1', label: 'U1' },
      { id: 'u2', label: 'U2' },
      { id: 'u3', label: 'U3' },
    ],
    correctPairs: { t1: 'u1', t2: 'u2', t3: 'u3' },
    pointPerCorrect: 1,
  },
  // q7 — spot (application, maxPoints 3)
  {
    id: 'q7',
    dimension: 'application',
    prompt: 'Klicke auf die halluzinierte Stelle.',
    maxPoints: 3,
    type: 'spot',
    passageSegments: [
      { id: 's1', text: 'segment 1', isCorrect: false },
      { id: 's2', text: 'segment 2', isCorrect: true },
      { id: 's3', text: 'segment 3', isCorrect: false },
    ],
  },
  // q8 — fill (application, maxPoints 3)
  // 3 blanks, pointsIfCorrect=1 each -> max 3
  {
    id: 'q8',
    dimension: 'application',
    prompt: 'Fuelle die Luecken im Code.',
    maxPoints: 3,
    type: 'fill',
    codeTemplate: 'const x = {{B1}}\nconst y = {{B2}}\nconst z = {{B3}}',
    blanks: [
      {
        id: 'B1',
        pointsIfCorrect: 1,
        options: [
          { value: 'true', isCorrect: true },
          { value: 'false', isCorrect: false },
        ],
      },
      {
        id: 'B2',
        pointsIfCorrect: 1,
        options: [
          { value: '1', isCorrect: true },
          { value: '0', isCorrect: false },
        ],
      },
      {
        id: 'B3',
        pointsIfCorrect: 1,
        options: [
          { value: 'yes', isCorrect: true },
          { value: 'no', isCorrect: false },
        ],
      },
    ],
  },
  // q9 — confidence (literacy, maxPoints 3)
  // pointByDistance [3,2,1,0,0]: dist=0 -> 3, dist=1 -> 2, dist>=3 -> 0
  {
    id: 'q9',
    dimension: 'literacy',
    prompt: 'Wie zuverlaessig ist der Output?',
    maxPoints: 3,
    type: 'confidence',
    outputText: 'Some output text to evaluate.',
    groundTruthStep: 2,
    pointByDistance: [3, 2, 1, 0, 0],
  },
  // q10 — mc (literacy, maxPoints 3)
  {
    id: 'q10',
    dimension: 'literacy',
    prompt: 'Welche Aussage zu KI-Halluzinationen stimmt?',
    maxPoints: 3,
    type: 'mc',
    options: [
      { id: 'a', label: 'A', points: 0 },
      { id: 'b', label: 'B', points: 3 },
      { id: 'c', label: 'C', points: 0 },
      { id: 'd', label: 'D', points: 1 },
    ],
  },
]

// ---------------------------------------------------------------------------
// LOW: all zero-point options -> total 0-5
// ---------------------------------------------------------------------------

export const FIXTURE_ANSWERS_LOW: Record<string, Answer> = {
  q1: { questionId: 'q1', type: 'pick', optionId: 'c' }, // 0
  q2: { questionId: 'q2', type: 'pick', optionId: 'd' }, // 0
  q3: { questionId: 'q3', type: 'rank', order: ['r4', 'r3', 'r2', 'r1'] }, // distance 4 -> clamp 0
  q4: { questionId: 'q4', type: 'best-prompt', optionId: 'p2' }, // 0
  q5: { questionId: 'q5', type: 'side-by-side', choice: 'b', reasonIds: ['rn3'] }, // 0 + 0 = 0
  q6: { questionId: 'q6', type: 'match', pairs: { t1: 'u3', t2: 'u1', t3: 'u2' } }, // 0 correct
  q7: { questionId: 'q7', type: 'spot', segmentId: 's1' }, // 0
  q8: {
    questionId: 'q8',
    type: 'fill',
    selections: { B1: 'false', B2: '0', B3: 'no' },
  }, // 0
  q9: { questionId: 'q9', type: 'confidence', step: 4 }, // |4-2|=2 -> 1
  q10: { questionId: 'q10', type: 'mc', optionId: 'a' }, // 0
}
// Total LOW = 1

// ---------------------------------------------------------------------------
// MID: mix of partial-credit answers -> total 13-19
// ---------------------------------------------------------------------------
// Target ~16:
//  q1 pick b -> 1
//  q2 pick c -> 1
//  q3 rank 1-swap -> distance 2, 3-2 = 1
//  q4 best-prompt p3 -> 1
//  q5 side-by-side choice a + 1 correct reason + 1 wrong -> 1 + 1 = 2
//  q6 match 2/3 correct -> 2
//  q7 spot s2 -> 3
//  q8 fill 2/3 correct -> 2
//  q9 confidence step 1 -> |1-2|=1 -> 2
//  q10 mc d -> 1
// Total = 1+1+1+1+2+2+3+2+2+1 = 16
// ---------------------------------------------------------------------------

export const FIXTURE_ANSWERS_MID: Record<string, Answer> = {
  q1: { questionId: 'q1', type: 'pick', optionId: 'b' },
  q2: { questionId: 'q2', type: 'pick', optionId: 'c' },
  q3: { questionId: 'q3', type: 'rank', order: ['r2', 'r1', 'r3', 'r4'] }, // Levenshtein distance 2
  q4: { questionId: 'q4', type: 'best-prompt', optionId: 'p3' },
  q5: {
    questionId: 'q5',
    type: 'side-by-side',
    choice: 'a',
    reasonIds: ['rn1', 'rn3'], // 1 correct + 1 wrong -> choice 1 + reason 1 = 2
  },
  q6: {
    questionId: 'q6',
    type: 'match',
    pairs: { t1: 'u1', t2: 'u2', t3: 'u1' }, // 2 correct
  },
  q7: { questionId: 'q7', type: 'spot', segmentId: 's2' }, // 3
  q8: {
    questionId: 'q8',
    type: 'fill',
    selections: { B1: 'true', B2: '1', B3: 'no' }, // 2/3
  },
  q9: { questionId: 'q9', type: 'confidence', step: 1 }, // dist 1 -> 2
  q10: { questionId: 'q10', type: 'mc', optionId: 'd' }, // 1
}

// ---------------------------------------------------------------------------
// HIGH: all correct -> total 30
// ---------------------------------------------------------------------------

export const FIXTURE_ANSWERS_HIGH: Record<string, Answer> = {
  q1: { questionId: 'q1', type: 'pick', optionId: 'a' }, // 3
  q2: { questionId: 'q2', type: 'pick', optionId: 'b' }, // 3
  q3: { questionId: 'q3', type: 'rank', order: ['r1', 'r2', 'r3', 'r4'] }, // 3
  q4: { questionId: 'q4', type: 'best-prompt', optionId: 'p1' }, // 3
  q5: {
    questionId: 'q5',
    type: 'side-by-side',
    choice: 'a',
    reasonIds: ['rn1', 'rn2'], // choice 1 + 2 reasons = 3
  },
  q6: {
    questionId: 'q6',
    type: 'match',
    pairs: { t1: 'u1', t2: 'u2', t3: 'u3' }, // 3/3
  },
  q7: { questionId: 'q7', type: 'spot', segmentId: 's2' }, // 3
  q8: {
    questionId: 'q8',
    type: 'fill',
    selections: { B1: 'true', B2: '1', B3: 'yes' }, // 3
  },
  q9: { questionId: 'q9', type: 'confidence', step: 2 }, // dist 0 -> 3
  q10: { questionId: 'q10', type: 'mc', optionId: 'b' }, // 3
}
