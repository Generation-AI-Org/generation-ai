// 10-Fragen-FAQ für /about#faq (UI-SPEC §FAQ, Zeile 215-228).
//
// Sync-Regel (UI-SPEC Zeile 213): Fragen 3, 5, 6, 7 teilen ihre Answer-Copy
// 1:1 mit `components/sections/kurz-faq-section.tsx`. Der Sync-Contract wird
// jetzt maschinell erzwungen: beide Files importieren die Answer-Strings aus
// `components/faq/shared-faq-answers.ts` (Review WR-03). Copy-Edit an einer
// Stelle — beide Seiten ziehen automatisch mit.
//
// Inline-Anker-Links in Antworten 8, 9, 10 → realisiert durch segmented
// `answerNodes`-Array mit { kind: "text" } | { kind: "link" }-Nodes.

import { SHARED_FAQ_ANSWERS } from "../faq/shared-faq-answers"

export type FaqLink = {
  kind: "link"
  text: string
  href: string // Anker same-page: #team, #verein, #mitmach
}

export type FaqTextNode = {
  kind: "text"
  text: string
}

export type FaqAnswerNode = FaqTextNode | FaqLink

export type FaqItem = {
  q: string
  answerNodes: FaqAnswerNode[]
}

// Helper für reine Text-Antworten (die meisten Items).
const t = (text: string): FaqTextNode => ({ kind: "text", text })
const a = (text: string, href: string): FaqLink => ({ kind: "link", text, href })

export const faqs: FaqItem[] = [
  {
    q: "Was ist Generation AI?",
    answerNodes: [
      t(
        "Wir sind die erste kostenlose KI-Community für Studierende im DACH-Raum. Gemeinnütziger Verein in Gründung. Wir bringen praktische KI-Skills in Workshops, Community-Austausch und kuratierte Wissensplattform zusammen — für alle Fachrichtungen, nicht nur Informatik.",
      ),
    ],
  },
  {
    q: "Wer kann Mitglied werden?",
    answerNodes: [
      t(
        "Studierende und Early-Career-Professionals aus dem DACH-Raum (Deutschland, Österreich, Schweiz) — unabhängig von Hochschule, Fachrichtung oder Vorerfahrung.",
      ),
    ],
  },
  {
    // SYNC with kurz-faq-section.tsx — answer via SHARED_FAQ_ANSWERS.kosten.
    q: "Kostet die Mitgliedschaft etwas?",
    answerNodes: [t(SHARED_FAQ_ANSWERS.kosten)],
  },
  {
    q: "Wie melde ich mich an?",
    answerNodes: [
      t(
        "Über den Button oben (`Jetzt beitreten`) — kurzer Fragebogen, Bestätigung per Mail, dann direkter Zugang zur Community. Dauert keine 2 Minuten.",
      ),
    ],
  },
  {
    // SYNC with kurz-faq-section.tsx — answer via SHARED_FAQ_ANSWERS.vorwissen.
    q: "Brauche ich technisches Vorwissen?",
    answerNodes: [t(SHARED_FAQ_ANSWERS.vorwissen)],
  },
  {
    // SYNC with kurz-faq-section.tsx — answer via SHARED_FAQ_ANSWERS.zeit.
    q: "Wie viel Zeit muss ich investieren?",
    answerNodes: [t(SHARED_FAQ_ANSWERS.zeit)],
  },
  {
    // SYNC with kurz-faq-section.tsx — answer via SHARED_FAQ_ANSWERS.uni (q-wording minimal different).
    q: "Muss ich an einer bestimmten Uni sein?",
    answerNodes: [t(SHARED_FAQ_ANSWERS.uni)],
  },
  {
    q: "Wer steckt hinter Generation AI?",
    answerNodes: [
      t(
        "Gegründet im Februar 2026 von Janna und Simon. Inzwischen ein zehnköpfiges Team aus Studierenden und Early-Careers, alle ehrenamtlich. ",
      ),
      a("→ Mehr zum Team.", "#team"),
    ],
  },
  {
    q: "Wie finanziert ihr euch?",
    answerNodes: [
      t(
        "Über Fördermittel, Partnerschaften mit Unternehmen, Stiftungen, Hochschulen — und durch Sachleistungen (z.B. Tool-Zugänge, Event-Räume). Gewinnorientiert sind wir nicht. ",
      ),
      a("→ Details im Verein-Abschnitt.", "#verein"),
    ],
  },
  {
    q: "Kann ich aktiv im Verein mitarbeiten?",
    answerNodes: [
      t(
        "Ja — und wir suchen aktiv Leute. Events, Content, Strategie, Tech, Partnerschaften. ",
      ),
      a("→ Mitmachen.", "#mitmach"),
    ],
  },
]
