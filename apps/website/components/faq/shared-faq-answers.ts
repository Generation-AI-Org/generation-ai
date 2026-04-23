// Shared FAQ Answer-Strings (Review WR-03 — Phase 21).
//
// Sync-Contract: Bestimmte Antworten müssen 1:1 identisch sein zwischen
//   - `components/sections/kurz-faq-section.tsx` (Landing Kurz-FAQ, 5 Items)
//   - `components/about/faq-data.ts` (About-Page FAQ, 10 Items)
//
// Früher via Kommentar dokumentiert, jetzt maschinell erzwungen: beide Files
// importieren die Answer-Strings aus diesem Modul. Edit hier = Edit in beiden.
//
// Nur die Antworten werden geteilt. Die Frage-Wordings unterscheiden sich
// bewusst (kürzer auf Landing, länger auf About) — das ist SPEC-konform.

export const SHARED_FAQ_ANSWERS = {
  // Landing "Kostet das was?" / About "Kostet die Mitgliedschaft etwas?"
  kosten:
    "Nein. Mitgliedschaft, Community-Zugang, Wissensplattform und Events sind kostenlos. Generation AI ist als gemeinnütziger Verein aufgestellt und finanziert sich über Fördermitglieder und Partner.",

  // Beide Seiten identisch: "Brauche ich technisches Vorwissen?"
  vorwissen:
    "Nein. Wir starten beim Alltagsnutzen und führen schrittweise zu Agenten und Automatisierung. Alle Fachrichtungen willkommen — du musst weder programmieren können noch Informatik studieren.",

  // Landing "Muss ich an einer bestimmten Uni studieren?" / About "Muss ich an einer bestimmten Uni sein?"
  uni:
    "Nein. Offen für Studierende und Early-Career aus dem gesamten DACH-Raum, unabhängig von Hochschule oder Fachrichtung. Wir arbeiten perspektivisch mit Hochschulen zusammen, aber eine Mitgliedschaft ist daran nicht gebunden.",

  // Beide Seiten identisch: "Wie viel Zeit muss ich investieren?"
  zeit:
    "So viel oder so wenig du willst. Kein Pflichtprogramm. Die Community läuft asynchron, Events sind optional. Viele schauen monatlich rein, andere bauen aktiv mit — beides passt.",
} as const
