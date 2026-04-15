# Generation AI — Tools App

> Die erste kostenlose KI-Tool-Bibliothek für Studierende im DACH-Raum.  
> **Live:** [tools.generation-ai.org](https://tools.generation-ai.org)

## Was ist das?

Studierende wissen nicht, welche KI-Tools es gibt — und nutzen deshalb nur ChatGPT. Diese App zeigt das komplette Bild: kuratierte Tools und Guides, was sie können, wie man sie nutzt, was sie kosten. Geführt durch einen Chat-Assistenten der zuhört und gezielt empfiehlt.

## Features

- **Tool-Bibliothek** — Kuratierte KI-Tools mit Beschreibungen, Pricing, Use Cases
- **Chat-Assistent** — Claude-powered Beratung, die passende Tools aus der Bibliothek empfiehlt
- **Highlight-System** — Empfohlene Tools leuchten neon auf, Rest wird gedimmt
- **Floating Chat Bubble** — Kollabierbarer Chat mit Kiwi-Maskottchen (Augen folgen Cursor)
- **Voice Input** — Deepgram-powered Spracheingabe mit Live-Transkription
- **Web-Link Attachment** — URLs als Kontext an den Chat anhängen
- **Light/Dark Mode** — Zwei CI-Farbwelten (Blue/Neon Green + Pink/Red)
- **Lite/Pro Badge** — Zeigt Login-Status im Chat-Header
- **Mobile-optimiert** — Touch-Targets, iOS-Zoom-Fix, responsive Layout
- **Cmd+K Suche** — Schnelle Tool-Suche mit Keyboard-Navigation

## Tech Stack

| | |
|---|---|
| **Framework** | Next.js 16 (App Router, TypeScript, Turbopack) |
| **Datenbank** | Supabase (Postgres) |
| **LLM** | Claude API (claude-sonnet-4-6) |
| **Hosting** | Vercel |
| **Styling** | Tailwind CSS v4 |

## Design System

Zwei Farbwelten, gesteuert über CSS-Variablen:

| Token | Dark Mode | Light Mode |
|---|---|---|
| `--bg` | #141414 | #F6F6F6 |
| `--accent` | #CEFF32 (Neon Green) | #F5133B (Red) |
| `--bg-header` | #3A3AFF (Blue) | #FC78FE (Pink) |

Theme-Toggle speichert die Präferenz in localStorage.

## Projekt-Struktur

```
app/
├── page.tsx              # Hauptseite: Library + Chat
├── [slug]/page.tsx       # Tool/Guide Detail-Seite
├── api/chat/route.ts     # Claude API Endpunkt
├── layout.tsx            # Root Layout mit Metadata
├── loading.tsx           # Skeleton Loading State
└── not-found.tsx         # 404 Page

components/
├── AppShell.tsx          # Haupt-Layout mit State
├── ThemeProvider.tsx     # Light/Dark Mode Context
├── library/
│   ├── CardGrid.tsx      # Tool-Grid mit Highlight-Logik
│   ├── ContentCard.tsx   # Einzelne Tool-Card
│   └── FilterBar.tsx     # Use-Case Filter
├── chat/
│   ├── ChatPanel.tsx     # Chat-Container mit Persistence
│   ├── ChatInput.tsx     # Textarea + Send Button
│   ├── MessageList.tsx   # Nachrichten mit Markdown
│   └── QuickActions.tsx  # Schnellstart-Buttons
└── ui/
    ├── Badge.tsx         # Pricing/Type Badges
    ├── KiwiMascot.tsx    # Cursor-following Maskottchen
    ├── ToolLogo.tsx      # Logo mit Clearbit Fallback
    └── SkeletonCard.tsx  # Loading Placeholder

lib/
├── supabase.ts           # Browser + Server Client
├── content.ts            # Datenbank-Queries
├── types.ts              # TypeScript Typen
└── llm.ts                # Claude Integration

supabase/
├── schema.sql            # Datenbankschema
└── seed.sql              # Beispiel-Daten (10 Tools)
```

## Lokale Entwicklung

```bash
# 1. Repository klonen
git clone <repo-url>
cd tools-app

# 2. Dependencies installieren
npm install

# 3. Environment einrichten
cp .env.example .env.local
# Dann .env.local mit echten Keys befüllen

# 4. Datenbank einrichten
# Supabase Dashboard → SQL Editor → supabase/schema.sql ausführen
# Optional: supabase/seed.sql für Beispiel-Daten

# 5. Dev Server starten
npm run dev
```

Öffne [http://localhost:3000](http://localhost:3000).

## Umgebungsvariablen

| Variable | Beschreibung | Wo? |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Project URL | Client + Server |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Anon Key | Client + Server |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Service Role | Server only |
| `ANTHROPIC_API_KEY` | Anthropic API Key | Server only |
| `DEEPGRAM_API_KEY` | Deepgram API Key (Voice) | Server only |

## Security

- **SSL/TLS** — Automatisch via Vercel
- **HSTS** — Strict-Transport-Security aktiviert
- **X-Frame-Options: DENY** — Clickjacking-Schutz
- **X-Content-Type-Options: nosniff** — MIME-Sniffing verhindert
- **Permissions-Policy** — Kamera/Mikrofon/Geolocation deaktiviert
- **Referrer-Policy** — origin-when-cross-origin

## Content pflegen

Inhalte werden direkt im **Supabase Dashboard** gepflegt:
1. Table Editor → `content_items`
2. Neuen Eintrag erstellen
3. Felder ausfüllen (title, slug, summary, content, pricing_model, etc.)
4. `status` auf `published` setzen

Die App revalidiert automatisch alle 60 Sekunden (ISR).

## Deployment

Das Projekt ist mit Vercel verbunden. Deployment erfolgt via CLI:

```bash
# Preview Deploy
vercel

# Production Deploy
vercel --prod
```

Live unter: [tools.generation-ai.org](https://tools.generation-ai.org)

## Performance

- **Image Optimization** — AVIF/WebP via next/image, priority für above-the-fold
- **Static Generation** — Tool-Seiten werden zur Build-Zeit generiert
- **ISR** — Incremental Static Regeneration (60s)
- **Aggressive Caching** — Static Assets mit 1-Jahr Cache
- **Turbopack** — Schnelle Dev-Builds
- **Lazy Loading** — FloatingChat wird erst bei Bedarf geladen
- **Memoization** — React.memo für ContentCard, MarkdownContent
- **GPU Animationen** — CSS transforms statt JS für smooth 60fps

---

**Generation AI** — Die erste kostenlose KI-Community für Studierende im DACH-Raum.

[community.generation-ai.org](https://community.generation-ai.org) · 2026
