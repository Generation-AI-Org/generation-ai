// 10-Fragen-FAQ für /about#faq (UI-SPEC §FAQ, Zeile 215-228).
//
// Sync-Regel (UI-SPEC Zeile 213): Fragen 3, 5, 6, 7 sind 1:1 identisch zur
// Answer-Copy in `components/sections/kurz-faq-section.tsx`. Copy-Änderungen
// müssen in BEIDEN Files gemacht werden (Phase 27 Copy-Pass wird dies als
// Regression-Check aufnehmen).
//
// Inline-Anker-Links in Antworten 8, 9, 10 → realisiert durch segmented
// `answerNodes`-Array mit { kind: "text" } | { kind: "link" }-Nodes.

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
    // SYNC with kurz-faq-section.tsx — answer 1:1 identisch.
    q: "Kostet die Mitgliedschaft etwas?",
    answerNodes: [
      t(
        "Nein. Mitgliedschaft, Community-Zugang, Wissensplattform und Events sind kostenlos. Generation AI ist als gemeinnütziger Verein aufgestellt und finanziert sich über Fördermitglieder und Partner.",
      ),
    ],
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
    // SYNC with kurz-faq-section.tsx — answer 1:1 identisch.
    q: "Brauche ich technisches Vorwissen?",
    answerNodes: [
      t(
        "Nein. Wir starten beim Alltagsnutzen und führen schrittweise zu Agenten und Automatisierung. Alle Fachrichtungen willkommen — du musst weder programmieren können noch Informatik studieren.",
      ),
    ],
  },
  {
    // SYNC with kurz-faq-section.tsx — answer 1:1 identisch.
    q: "Wie viel Zeit muss ich investieren?",
    answerNodes: [
      t(
        "So viel oder so wenig du willst. Kein Pflichtprogramm. Die Community läuft asynchron, Events sind optional. Viele schauen monatlich rein, andere bauen aktiv mit — beides passt.",
      ),
    ],
  },
  {
    // SYNC with kurz-faq-section.tsx "Muss ich an einer bestimmten Uni studieren?" — answer 1:1, q-wording minimal different.
    q: "Muss ich an einer bestimmten Uni sein?",
    answerNodes: [
      t(
        "Nein. Offen für Studierende und Early-Career aus dem gesamten DACH-Raum, unabhängig von Hochschule oder Fachrichtung. Wir arbeiten perspektivisch mit Hochschulen zusammen, aber eine Mitgliedschaft ist daran nicht gebunden.",
      ),
    ],
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
