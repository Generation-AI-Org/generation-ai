/**
 * Phase 23 — Uni-Dropdown-Liste für /join Waitlist-Form.
 *
 * Enthält 50 wichtige Hochschulen im DACH-Raum, gemischt Unis + HAWs,
 * plus deterministische Fallback-Option "Andere" am Ende.
 *
 * Auswertung: "Andere" bleibt als stabiler Wert in `waitlist.university`.
 * Der optionale Freitext dazu wird separat als Kontext gesendet, damit
 * Analytics nicht durch Schreibvarianten fragmentieren.
 */

export type University = string

export const OTHER_UNIVERSITY = 'Andere'

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
  'Universität Osnabrück',
  'Universität Passau',
  'Universität Erlangen-Nürnberg',
  'Universität Trier',
  'Universität des Saarlandes',
  'Bergische Universität Wuppertal',

  // Ausgewählte grosse HAWs / Hochschulen
  'IU Internationale Hochschule',
  'FOM Hochschule',
  'Hochschule München',
  'Hochschule für Angewandte Wissenschaften Hamburg (HAW)',
  'FH Aachen',
  'Technische Hochschule Köln',
  'Hochschule der Medien Stuttgart (HdM)',
  'Hochschule Niederrhein',
  'Frankfurt University of Applied Sciences',
  'Hochschule Darmstadt',
  'Berliner Hochschule für Technik',
  'Hochschule Mannheim',
  'Hochschule Bonn-Rhein-Sieg',

  // Österreich & Schweiz (DACH)
  'Universität Wien',
  'Technische Universität Wien',
  'ETH Zürich',
  'Universität Zürich',

  // Deterministischer Fallback (immer am Ende)
  OTHER_UNIVERSITY,
]
