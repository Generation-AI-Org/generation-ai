@AGENTS.md
@../../LEARNINGS.md

# Claude Code — Tools App

> KI-Tool-Bibliothek + Chat-Assistent für Studierende

## Stack

- Next.js 15, React 19
- Supabase (Auth + DB)
- Claude API (Anthropic)
- Vercel (Hosting)

## Projekt-Struktur

```
.planning/           ← GSD Artefakte
├── STATE.md         ← Source of Truth für aktuellen Stand
├── PROJECT.md       ← Vision, Entscheidungen
├── ROADMAP.md       ← Phasen
├── REQUIREMENTS.md  ← Anforderungen
└── v3-architecture.md ← Agent-Architektur (v3.0)

app/                 ← Next.js App Router
lib/                 ← Shared Logic (LLM, Content, Types)
components/          ← React Components
```

## Aktueller Stand

- **v2.0 shipped:** Grounded Chat mit Full-Context
- **v3.0 in Arbeit:** Tool-Calling Agent mit KB-Navigation

Siehe `.planning/STATE.md` für Details.
