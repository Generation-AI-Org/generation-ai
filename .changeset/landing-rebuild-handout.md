---
"@genai/website": minor
---

Landing-Rebuild inspired by Claude Design handout

- **Hero**: neuer Labeled-Nodes Constellation-Background. Cluster-Flow on
  Hover (Desktop) mit Neon-Labels und Flow-Particles zwischen den Nodes.
  Auto-Wander-Cluster auf Mobile (alle 3.5–5 s neuer Edge-Spot). Safe-Zone
  hält Cluster-Detection + Node-Rendering aus dem zentralen Textbereich
  raus; `text-shadow` in BG-Farbe dimmt Nodes lokal hinter den Buchstaben.
- **Header**: auf 80 px vergrößert, Logo jetzt `size="lg"` (56 px), pt des
  Main-Content entsprechend angepasst. Footer-Logo symmetrisch auf `lg`.
- **Offering**: 4-Säulen Bento durch 3 Surface-Cards ersetzt (Community /
  Wissensplattform / Events & Workshops). Mit Nummern-Marker, Subdomain-
  Tag, Preview-Visualisierung (Messages / Tools-Grid / Event-Rows) und
  CTA je Card.
- **Tool-Showcase**: Handout-Style horizontaler Marquee mit echten Tool-
  Logos (react-icons/si + Custom-SVGs für Midjourney/Gamma/Runway/Grok).
  Jede Card linkt auf `tools.generation-ai.org/{slug}`; Slugs stimmen 1:1
  mit den Content-Slugs der tools-app überein.
- **Trust**: 6-Col Partners-Grid (12 Stub-Partner: Unis + Firmen +
  Initiativen) im Handout-Layout — ersetzt die Marquee-Pills.
- **Final-CTA**: Wording auf „Sei **dabei**, bevor der Rest aufholt." mit
  Neon-Akzent. Lampe getunt: Glow-Körper kompakter und sanfter, Balken
  breiter nach außen.
- **Footer**: `info@generation-ai.org` statt `admin@`, LinkedIn-Zeile
  inkl. Inline-SVG entfernt.
- **AudienceSplitSection** komplett entfernt (Studi-CTA war doppelt mit
  Final-CTA, Partner-Streifen war visuell nicht im Design-System).
