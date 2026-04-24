/**
 * Phase 23 — Uni-Dropdown-Liste für /join Waitlist-Form.
 *
 * Enthält die ~40 grössten deutschen Hochschulen (nach Studierendenzahl 2024/25),
 * gemischt Unis + HAWs, plus 4 Fallback-Optionen am Ende für Non-Students
 * (D-12: Combobox + Freitext-Option für Berufstätig / Ausbildung / Andere).
 *
 * Der Combobox akzeptiert ausserdem Freitext — diese Liste ist nur die
 * Autocomplete-Quelle, kein Whitelist-Filter. Validation erfolgt in der
 * Server-Action (Plan 23-03): jeder nicht-leere String ist erlaubt.
 */

export type University = string

export const UNIVERSITIES: University[] = [
  // Grosse Unis (Studierenden-top-15 2024/25)
  'FernUniversität in Hagen',
  'Universität zu Köln',
  'LMU München',
  'RWTH Aachen',
  'Goethe-Universität Frankfurt',
  'Universität Hamburg',
  'Universität Münster',
  'Universität Duisburg-Essen',
  'Humboldt-Universität zu Berlin',
  'Universität Bonn',
  'Freie Universität Berlin',
  'Technische Universität Berlin',
  'Technische Universität München',
  'Universität Würzburg',
  'Universität Heidelberg',

  // TUs + Elite
  'Karlsruher Institut für Technologie (KIT)',
  'Technische Universität Dresden',
  'Technische Universität Darmstadt',
  'Universität Stuttgart',
  'Universität Tübingen',
  'Universität Freiburg',
  'Universität Leipzig',
  'Universität Göttingen',
  'Universität Mannheim',
  'Universität Jena',

  // Weitere wichtige Standorte
  'Ruhr-Universität Bochum',
  'Universität Bremen',
  'Universität Hannover (Leibniz)',
  'Universität Kiel',
  'Universität Rostock',
  'Universität Regensburg',
  'Universität Bayreuth',
  'Universität Bielefeld',
  'Universität Potsdam',
  'Universität Konstanz',
  'Universität Augsburg',
  'Universität Mainz (Johannes Gutenberg)',
  'Universität Marburg',
  'Universität Münster (FH)',
  'Universität Osnabrück',

  // Ausgewählte grosse HAWs / Hochschulen
  'Hochschule München',
  'Hochschule für Angewandte Wissenschaften Hamburg (HAW)',
  'Technische Hochschule Köln',
  'Hochschule Niederrhein',
  'Frankfurt University of Applied Sciences',

  // Österreich & Schweiz (DACH)
  'Universität Wien',
  'Technische Universität Wien',
  'ETH Zürich',
  'Universität Zürich',

  // Fallback-Optionen (immer am Ende, D-12)
  'Andere Hochschule',
  'Ausbildung / Berufstätig',
  'Kein Studium',
]
