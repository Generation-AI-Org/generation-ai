# Website Feature Ideas

> Gesammelt am 2026-04-13, Deep Dive Session mit Claude

## Status: Discovery / Backlog

Diese Features sind Ideen aus dem Brainstorming. Noch nicht geplant oder priorisiert.

---

## Stream A: AI-Skill-Assessment

**Idee:** Interaktives Quiz statt "Level 1-5" Buttons — wirklich rausfinden wo jemand steht.

**Scope:**
- Teil vom Signup ODER eigener "Teste dich selbst!" Button
- Eigene Seite `/assessment`
- Auch für bestehende Member nutzbar

**Was abfragen:**
- Wissen ("Was ist ein Prompt?")
- Erfahrung ("Welche Tools hast du schon genutzt?")
- Use Cases ("Wofür würdest du KI einsetzen?")

**Output:**
- Fundiertes Level (nicht nur 1-5 Selbsteinschätzung)
- Profil mit Dimensionen (Tools, Prompting, Coding, Creative...)
- Personalisierte Empfehlungen ("Starte hier")

**Abhängigkeiten:**
- DB-Schema für Assessment-Ergebnisse
- Ggf. Integration mit Learning Paths

---

## Stream B: Building in Public / Blog

**Idee:** Content-Section auf der Website — teilen was ihr baut, lernt, plant.

**Content-Typen:**
- Updates ("Wir haben X gelauncht")
- Behind the scenes ("So haben wir Y gebaut")
- Learnings ("Was wir über Z gelernt haben")
- KI-News kuratiert ("Diese Woche in AI")

**Technisch:**
- Simpel starten (Markdown files oder Supabase Tabelle)
- Später: Kurator-Agent schreibt Drafts

**Wo:**
- `/blog` auf der Website
- Cross-Post zu Circle möglich

---

## Stream C: AI-Native Features

### Claude Bot auf Website
- Gleicher Bot wie tools-app
- Haiku für Kosten
- FAQ + Onboarding-Fragen beantworten
- Später: Assessment als Chat-Flow

### Smart FAQ
- AI-powered statt statische FAQ-Seite
- Kann gleicher Bot sein

### Personalisierte Learning Paths
- Basierend auf Assessment-Daten
- "Dein Weg von Level 2 zu Level 4"
- Empfehlungen für Tools, Kurse, Content

### Autonomer Kurator-Agent
- Beobachtet neue KI-Tools/News
- Kuratiert was relevant ist
- Schreibt Drafts für Blog/Circle Posts
- Schlägt Learning Path Updates vor
- Human Review bevor was live geht

---

## Priorisierung (vorläufig)

| Feature | Prio | Aufwand | Abhängigkeiten |
|---------|------|---------|----------------|
| AI-Skill-Assessment | Hoch | Mittel | - |
| Learning Paths | Hoch | Mittel | Assessment |
| Blog/Building in Public | Mittel | Niedrig | - |
| Claude Bot | Mittel | Niedrig | tools-app Bot existiert |
| Smart FAQ | Mittel | Niedrig | Bot |
| Kurator-Agent | Vision | Hoch | Blog, Content-Pipeline |

---

## Nächste Schritte

1. Monorepo-Migration abschließen
2. `/gsd-explore` für Assessment-Design
3. Blog-Section MVP (simpel starten)

---

*Erstellt: 2026-04-13*
