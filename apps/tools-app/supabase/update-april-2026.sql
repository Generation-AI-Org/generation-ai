-- Generation AI tools-app — Content Update April 2026
-- Deep Research Update für alle 29 Tools
-- Im Supabase SQL Editor ausführen

-- =====================
-- KI-ASSISTENTEN
-- =====================

-- ChatGPT: GPT-5.4 ist aktuell, GPT-4o retired
UPDATE content_items SET
  content = E'## Was ist ChatGPT?\nChatGPT ist der bekannteste KI-Assistent und für die meisten der erste Berührungspunkt mit generativer KI. Entwickelt von OpenAI, läuft aktuell auf GPT-5.4 (März 2026).\n\n## Was kann er besonders gut?\n- Texte schreiben, überarbeiten, kürzen\n- Themen erklären und vereinfachen\n- Brainstorming und Ideenentwicklung\n- Code schreiben und debuggen mit GPT-5.3-Codex\n- Deep Research über Web-Quellen\n- Präsentationen und Tabellen erstellen\n\n## So nutzt du es als Studierender\nNutze ChatGPT als ersten Ansprechpartner für alles: Textentwürfe, Erklärungen, Prüfungsvorbereitung. Starte immer mit Kontext: wer du bist, was du brauchst, für wen es ist.\n\n## Pricing\nKostenlos: 10 Nachrichten mit GPT-5.3 alle 5 Stunden, danach Mini-Version.\nGo: 8 USD/Monat — Rate-Limits aufgehoben, Basis-Features.\nPlus: 20 USD/Monat — GPT-5.4, o3-mini, DALL-E 3, Advanced Voice.\nPro: 200 USD/Monat — Unbegrenzter Zugang, o3 Pro Mode, maximale Priorität.\n\n## Quick Win\nFrag: "Erklär mir [Thema] wie einem 12-Jährigen" — schnellster Weg um schwierige Konzepte zu verstehen.\n\n## Alternativen\n- Claude: besser bei langen Texten und nuanciertem Schreiben, 1M Token Kontext\n- Gemini: Google-Integration, Deep Research',
  summary = 'Der KI-Chatbot von OpenAI auf GPT-5.4. Einstieg in generative KI für die meisten — vielseitig, einfach, kostenlos nutzbar.',
  quick_win = 'Frag: "Erklär mir [Thema] wie einem 12-Jährigen" — schnellster Weg um schwierige Konzepte zu verstehen.'
WHERE slug = 'chatgpt';

-- Claude: Opus 4.6 / Sonnet 4.6, 1M Context GA
UPDATE content_items SET
  content = E'## Was ist Claude?\nClaude von Anthropic ist Chatbot und Thinking Partner. Besonders stark bei sehr langen Kontexten (bis 1 Million Tokens — ganze Bücher am Stück), präzisem Schreiben und ehrlicher Selbsteinschätzung. Aktuell: Claude Opus 4.6 und Sonnet 4.6 (Februar 2026).\n\n## Was kann er besonders gut?\n- Lange PDFs, Papers und Dokumente analysieren (1M Token Kontext)\n- Nuancierte Argumentationen schreiben und hinterfragen\n- Code reviewen und erklären\n- Als Sparringspartner für komplexe Themen\n- Eigene Einschätzung geben statt nur zu bestätigen\n- Adaptive Thinking für komplexe Probleme\n- Agent-Teams für mehrstufige Aufgaben\n\n## So nutzt du es als Studierender\nLad dein Thesis-Kapitel oder Paper als PDF hoch. Frag gezielt: "Was ist die schwächste Stelle in meiner Argumentation?" oder "Welche Gegenargumente habe ich nicht berücksichtigt?"\n\n## Pricing\nKostenlos: ~15-40 Nachrichten pro 5-Stunden-Fenster mit Sonnet, 200K Kontext.\nPro: 20 USD/Monat — erhöhte Nutzung, Projects, Priority Access.\nMax: 100-200 USD/Monat — für Power-User mit intensiver Nutzung.\n\n## Quick Win\nLad ein Paper hoch und frag: "Fass die Kernaussage in 3 Sätzen zusammen und erkläre welche Methodik genutzt wurde."\n\n## Alternativen\n- ChatGPT: breiter bekannt, GPT-5.4 mit Computer Use\n- Gemini: besser für Google-Docs-Integration',
  summary = 'Der KI-Assistent von Anthropic auf Claude Opus 4.6. Stärker als ChatGPT bei langen Texten (1M Token), Nuancen und ehrlichem, reflektiertem Ton.'
WHERE slug = 'claude';

-- Gemini: Pro hinter Paywall seit April 2026
UPDATE content_items SET
  content = E'## Was ist Gemini?\nGoogles multimodaler KI-Assistent auf Basis von Gemini 2.5 Pro/Flash. Verarbeitet Text, Bilder, Audio und PDFs. Tief integriert ins Google-Ökosystem.\n\n## Was kann er besonders gut?\n- Deep Research: recherchiert eigenständig in hunderten Quellen und liefert einen strukturierten Bericht\n- Lange Dokumente: ganze PDFs, Buchkapitel oder Skripte auf einmal verarbeiten (1M Token Kontext)\n- Direkt in Google Docs und Gmail: Texte überarbeiten, Entwürfe, Zusammenfassungen ohne App-Wechsel\n- Guided Learning: erklärt Konzepte Schritt für Schritt, generiert Quizze aus eigenem Lernstoff\n\n## Pricing\n**Wichtig (April 2026):** Gemini 2.5 Pro ist jetzt hinter einer Paywall — kostenlose Nutzer haben nur noch Zugriff auf Flash-Modelle.\n\nKostenlos: Gemini 2.5 Flash, Deep Research enthalten.\nGoogle AI Pro: 19,99 USD/Monat — 2.5 Pro-Zugang, 2 TB Speicher.\nStudierende: 1 Monat AI Pro kostenlos testbar.\n\n## So nutzt du es als Studierender\nDeep Research mit einer konkreten Seminarfrage starten — Gemini liefert in unter 5 Minuten einen strukturierten Überblick mit zitierten Quellen. Als Ausgangspunkt für die eigene Hausarbeit nutzen, nicht als Abgabe.',
  summary = 'Googles KI-Assistent mit Deep Research und 1M Token Kontext. Achtung: 2.5 Pro seit April 2026 nur noch für zahlende Nutzer.',
  quick_win = 'Deep Research aufrufen, konkrete Seminarfrage eingeben — strukturierter Überblick mit zitierten Quellen in unter 5 Minuten. Kostenlos mit Flash.'
WHERE slug = 'gemini';

-- Grok: Standalone, Student-Rabatt, Heavy-Tier
UPDATE content_items SET
  content = E'## Was ist Grok?\nGrok von xAI ist ein KI-Assistent mit direktem Live-Zugriff auf das X-Netzwerk. Läuft auf Grok 4.1/4.2, #1 auf der LMArena Text Arena. Kein X-Account mehr nötig — SuperGrok ist jetzt standalone.\n\n## Was kann er besonders gut?\n- Echtzeit-X-Integration: greift live auf Trends, Posts und Diskussionen zu\n- DeepSearch: kombiniert Web-Recherche mit mehrstufigem Reasoning, liefert zitierte Quellen\n- Big Brain Mode: erhöhter Rechenaufwand für komplexe Probleme\n- 65% weniger Halluzinationen als Vorgängerversion\n- 128k Token Kontextfenster\n\n## Pricing\nKostenlos: ~10 Prompts alle 2 Stunden, Grok 3 (nicht Grok 4).\nSuperGrok: 30 USD/Monat oder 300 USD/Jahr — voller Zugang, DeepSearch, Bildgenerierung.\nSuperGrok Heavy: 300 USD/Monat — Grok 4 Heavy, Priorität.\n**Studierende: 2 Monate kostenlos mit .edu-Mail!**\n\n## So nutzt du es als Studierender\nUnbedingt den Student-Rabatt nutzen: 2 Monate SuperGrok kostenlos mit Uni-Mail. DeepSearch für aktuelle Themen die noch nicht in Lehrbüchern stehen.',
  summary = 'xAIs KI-Assistent mit Echtzeit-X-Zugriff, jetzt standalone ohne X-Abo. Studierende: 2 Monate gratis mit .edu-Mail.',
  quick_win = 'Student-Rabatt aktivieren: 2 Monate SuperGrok kostenlos mit .edu-Mail. DeepSearch für aktuelle Themen nutzen.'
WHERE slug = 'grok';

-- Meta AI: Muse Spark (proprietär), weiterhin kostenlos
UPDATE content_items SET
  content = E'## Was ist Meta AI?\nMetas KI-Assistent läuft jetzt auf Muse Spark (April 2026) — das erste proprietäre Modell von Meta, zusätzlich zu den Open-Weight Llama 4 Modellen. Nativ in WhatsApp, Instagram, Facebook und Messenger.\n\n## Was kann er besonders gut?\n- WhatsApp-nativ: kein App-Wechsel nötig, einfach im Chat "@Meta AI" anschreiben\n- Komplett kostenlos und ohne Nutzungslimit — keine Kreditkarte, kein Abo\n- Texte erklären, zusammenfassen, übersetzen direkt im Messaging-Flow\n- Bildgenerierung direkt im WhatsApp-Chat\n- Multimodale Fähigkeiten mit Llama 4\n\n## Pricing\nVollständig kostenlos (Stand April 2026).\n\n## So nutzt du es als Studierender\nIdeal für schnelle Fragen zwischendurch ohne Tool-Wechsel: Begriffe klären, kurze Texte überarbeiten, etwas auf Englisch übersetzen — direkt in WhatsApp, wo du ohnehin bist.',
  summary = 'Metas kostenloser KI-Assistent auf Muse Spark — direkt in WhatsApp, Instagram und Facebook. Kein Account, kein Setup.'
WHERE slug = 'meta-ai';

-- =====================
-- CODING TOOLS
-- =====================

-- Cursor: Credit-basiert, Multi-Model
UPDATE content_items SET
  content = E'## Was ist Cursor?\nCursor ist ein Fork von VS Code mit tief integrierter KI. Composer generiert und refactort über mehrere Dateien gleichzeitig. Unterstützt Claude Opus 4.6, GPT-5.4, Gemini 3 Pro und eigene Modelle.\n\n## Was kann er besonders gut?\n- Features über mehrere Dateien gleichzeitig implementieren\n- Multi-Model: zwischen Claude, GPT-5.x und Gemini wechseln\n- Auto-Mode: nutzt automatisch effiziente Modelle (effektiv unbegrenzt auf Pro)\n- Bestehenden Code erklären und dokumentieren\n- Tests automatisch schreiben\n\n## So nutzt du es als Studierender\nErstell ein neues Projekt, öffne Cursor, drück Cmd+I (Composer) und beschreibe was du bauen willst. Cursor plant die Umsetzung über alle Dateien.\n\n## Pricing\nHobby: kostenlos mit limitierten Credits.\nPro: 20 USD/Monat (16 USD/Monat jährlich) — Credit-basiert, alle Premium-Modelle.\nPro+: 60 USD/Monat — mehr Credits.\nUltra: 200 USD/Monat — höchstes Tier.\n\n## Quick Win\nMarkiere einen Code-Block, drück Cmd+K, beschreib die Änderung in einem Satz — Cursor schreibt den Diff direkt.',
  summary = 'Der KI-Code-Editor mit Claude Opus 4.6, GPT-5.4 und Gemini 3 Pro. Credit-basiertes System seit Juni 2025.'
WHERE slug = 'cursor';

-- GitHub Copilot: Free Tier, Workspace, Student Update
UPDATE content_items SET
  content = E'## Was ist GitHub Copilot?\nCopilot von GitHub und OpenAI ergänzt deinen Code in Echtzeit — direkt in VS Code, JetBrains, Neovim. Copilot Workspace (März 2025) liest ganze Codebases und plant Lösungen über dutzende Dateien.\n\n## Was kann er besonders gut?\n- Boilerplate automatisch vervollständigen\n- Tests aus Code generieren\n- **Copilot Workspace:** Plant und implementiert Features über viele Dateien, öffnet PRs aus natürlicher Sprache\n- 1 Million Token effektiver Kontext via Multi-File RAG\n- 55% auf SWE-bench Verified (höchstes unter kommerziellen Tools)\n\n## So nutzt du es als Studierender\nBeantrags das GitHub Student Developer Pack — Copilot Pro kostenlos enthalten. Seit März 2026: GPT-5.4 und Claude Opus nicht mehr selbst wählbar auf Student-Plan, aber voller Zugang zu Workspace.\n\n## Pricing\nFree: Basis-Features, limitiert.\nPro: 10 USD/Monat — voller Individual-Zugang.\nPro+: 39 USD/Monat — Premium-Modelle.\nStudierende: Kostenlos über Student Pack (Copilot Pro).\n\n## Quick Win\neducation.github.com → Student Pack beantragen mit Uni-Mail → Copilot Pro + Workspace sofort kostenlos.',
  summary = 'KI-Autocomplete und Copilot Workspace für ganze Codebases. Für Studierende kostenlos über das GitHub Student Pack.',
  quick_win = 'education.github.com → Student Pack beantragen mit Uni-Mail → Copilot Pro + Workspace sofort kostenlos.'
WHERE slug = 'github-copilot';

-- Bolt.new: Token Rollover
UPDATE content_items SET
  content = E'## Was ist Bolt.new?\nBolt.new ist ein Browser-basierter Full-Stack-App-Builder. Aus einem Text-Prompt generiert er vollständige, lauffähige Web-Apps — inklusive Code, Abhängigkeiten und Deployment-Link.\n\n## Was kann es besonders gut?\n- Generiert Frontend + Backend + Datenbank in einer Session\n- Installiert NPM-Packages automatisch, managed Abhängigkeiten selbst\n- Live-Preview direkt im Browser während der Generierung\n- **Token Rollover seit Juli 2025:** Ungenutzte Tokens übertragen sich für einen zusätzlichen Monat\n- Integrationen: Supabase, Stripe, GitHub, Netlify, Figma\n\n## Pricing\nKostenlos: 1M Tokens/Monat, 300K tägliches Limit, Bolt-Subdomain.\nPro: 25 USD/Monat — 10M+ Tokens, Custom Domains, kein Branding.\nPro 50: 50 USD/Monat — 26M Tokens.\nPro 100: 100 USD/Monat — 55M Tokens.\n\n## So nutzt du es als Studierender\nPerfekt für schnelle Prototypen, Semesterprojekte oder Portfolio-Sites ohne Dev-Setup. Prompt eingeben, App steht in 2-3 Minuten.',
  summary = 'Browser-basierter Full-Stack-Builder mit Token-Rollover. Schreib einen Satz, bekomm eine lauffähige Web-App.',
  quick_win = 'bolt.new aufrufen, beschreiben was du bauen willst — App steht in 2-3 Minuten, "Deploy" klicken. 1M Tokens/Monat kostenlos.'
WHERE slug = 'bolt';

-- v0: Student Tier, Pricing Update
UPDATE content_items SET
  content = E'## Was ist v0?\nv0 von Vercel ist ein spezialisierter UI-Generator. Aus Text-Prompts entstehen fertige React-Komponenten mit Tailwind CSS und shadcn/ui — direkt in echte Projekte kopierbar.\n\n## Was kann es besonders gut?\n- Generiert saubere, produktionsreife React-Komponenten\n- 1-Click-Deploy auf Vercel, GitHub-Sync\n- Design Mode: visuelle Editierung ohne erneutes Prompting\n- Figma-Import (ab Premium)\n- Mini/Pro/Max Modell-Tiers je nach Komplexität\n\n## Pricing\nKostenlos: Basis-Zugang, limitierte tägliche Messages.\n**Student: 4,99 USD/Monat — mit Verifizierung.**\nPremium: 20 USD/Monat — volle Features.\nTeam: 30 USD/User/Monat.\n\n## So nutzt du es als Studierender\nStudent-Tier nutzen: 4,99 USD/Monat mit Nachweis. Komponente per Prompt generieren, in Next.js-Projekt kopieren.',
  summary = 'Vercels Prompt-zu-React-Komponente Generator. Student-Tier: 4,99 USD/Monat.',
  quick_win = 'Student-Tier für 4,99 USD/Monat aktivieren (Support kontaktieren mit Nachweis). Komponente per Prompt generieren, in Projekt kopieren.'
WHERE slug = 'v0';

-- Replit: Effort-Based Pricing
UPDATE content_items SET
  content = E'## Was ist Replit?\nReplit ist eine vollständige Browser-IDE mit integriertem KI-Agent. Der Agent baut eigenständige Apps aus einer Beschreibung — lauffähige Projekte mit Deployment.\n\n## Was kann es besonders gut?\n- Replit Agent baut eigenständige Apps aus einem Beschreibungs-Prompt\n- Sofortige Multiplayer-Kollaboration\n- Deployment mit einem Klick\n- 50+ Sprachen: Python, Node, Go, Rust\n\n## Pricing (Februar 2026 Überarbeitung)\n**Achtung: Effort-Based Pricing ersetzt pro-Checkpoint-Modell.**\n\nStarter: Kostenlos — limitierte Features.\nCore: 17 USD/Monat (jährlich) — voller Agent, 20 USD Usage-Credits.\nPro: 95 USD/Monat (jährlich) — bis 15 Builders, keine Per-Seat-Gebühren.\n\n**Warnung:** Tatsächliche Kosten liegen ~70% über dem Listenpreis (Agent-Charges inkl. fehlgeschlagener Versuche, Storage-Overage, Deployment-Gebühren).\n\n## So nutzt du es als Studierender\nAccount anlegen, "Use Replit Agent", Prompt eingeben. Agent erstellt alles und deployed automatisch. Kosten im Blick behalten — Effort-Based kann teuer werden.',
  summary = 'Browser-IDE mit KI-Agent der eigenständig Apps baut. Effort-Based Pricing seit Februar 2026 — Kosten im Blick behalten.',
  quick_win = 'Account erstellen → "Create Repl" → "Use Replit Agent" → Projekt beschreiben. Aber: Usage-Kosten genau beobachten.'
WHERE slug = 'replit';

-- =====================
-- AUDIO & TRANSKRIPTION
-- =====================

-- ElevenLabs: Pricing Update
UPDATE content_items SET
  content = E'## Was ist ElevenLabs?\nElevenLabs ist die führende Plattform für KI-Audio: Text in realistische Stimmen umwandeln, eigene Stimme klonen, Videos automatisch synchronisieren.\n\n## Was kann es besonders gut?\n- Voice Cloning: eigene Stimme mit wenigen Sekunden Audio klonen — spricht dann in 29 Sprachen\n- TTS in 70+ Sprachen mit über 1.000 Stimmen\n- AI Dubbing: Videos automatisch synchronisieren\n- Sound Effects Generator\n\n## Pricing\nKostenlos: 10.000 Credits/Monat (~20 Min. Audio), keine kommerzielle Nutzung.\nStarter: 5 USD/Monat — 30.000 Credits, Instant Voice Cloning.\nCreator: 11 USD/Monat — 100.000 Credits, Professional Voice Cloning.\nPro: 99 USD/Monat — 500.000 Credits.\n\n## So nutzt du es als Studierender\nHausarbeit oder Zusammenfassung als Audio-Version produzieren — zum Hören beim Sport oder Pendeln.',
  summary = 'KI-Audioplattform für Text-to-Speech, Stimmen-Klonen und Video-Dubbing. Creator-Tier jetzt nur 11 USD/Monat.'
WHERE slug = 'elevenlabs';

-- Super Whisper: Lifetime Preis korrigiert
UPDATE content_items SET
  content = E'## Was ist Super Whisper?\nSuper Whisper ist eine macOS/Windows/iOS-App die per globalem Hotkey (⌥ + Space) systemweit Spracheingabe in Text umwandelt — in jedem Programm.\n\n## Was kann es besonders gut?\n- Systemweit per Hotkey: in jeder App aktivierbar\n- Vollständig offline mit lokalen Whisper-Modellen\n- Custom AI-Modi: "Academic", "Formal Email", "Code Comment"\n- 100+ Sprachen inklusive Übersetzung\n- Cross-Device Lizenz (Mac, Windows, iPhone, iPad)\n\n## Pricing\nFree-Tier vorhanden.\nPro: 8-10 USD/Monat.\nPro Annual: 85 USD/Jahr.\nLifetime: 250 USD einmalig.\n\n## So nutzt du es als Studierender\nPerfekt für alle die schneller sprechen als tippen: E-Mails, Zusammenfassungen oder Gliederungen diktieren statt abtippen.',
  summary = 'Mac/Windows/iOS-App für systemweite Sprach-zu-Text-Eingabe mit Hotkey. Lifetime: 250 USD einmalig.',
  quick_win = 'App installieren, ⌥ + Space drücken, E-Mail oder Gliederung diktieren — direkt ins geöffnete Fenster.'
WHERE slug = 'super-whisper';

-- Otter.ai: Pro Minuten reduziert
UPDATE content_items SET
  content = E'## Was ist Otter.ai?\nOtter.ai transkribiert Meetings und Vorlesungen in Echtzeit. Unterscheidet Sprecher, erstellt automatisch Zusammenfassungen und wählt sich selbstständig in Zoom, Teams oder Google Meet ein.\n\n## Was kann es besonders gut?\n- Live-Transkription mit Sprecher-Diarization\n- OtterPilot wählt sich automatisch ins Meeting ein\n- AI Chat über vergangene Transkripte\n- Automatische Extraktion von Key Points\n\n## Pricing\nKostenlos: 300 Minuten/Monat, 30 Min. pro Session.\nPro: 17 USD/Monat (8,33 USD jährlich) — **1.200 Min./Monat** (reduziert von früher 6.000!), 90 Min. pro Meeting.\nBusiness: 30 USD/User/Monat — 6.000 Min., 4h pro Meeting.\n\n**Achtung:** Pro-Plan wurde von 6.000 auf 1.200 Minuten reduziert — bei 5+ Meetings/Tag sind die Minuten in ~2 Wochen aufgebraucht.\n\n## So nutzt du es als Studierender\nOtter-Bot zur nächsten Online-Vorlesung einladen: Meeting-Link einfügen, Bot tritt bei und transkribiert.',
  summary = 'Live-Transkription für Vorlesungen und Meetings. Achtung: Pro-Plan jetzt nur noch 1.200 statt 6.000 Min./Monat.'
WHERE slug = 'otter-ai';

-- Whisper: MacWhisper Preis korrigiert
UPDATE content_items SET
  content = E'## Was ist Whisper?\nWhisper ist OpenAIs Open-Source ASR-Modell. Es transkribiert Sprache in Text mit sehr hoher Genauigkeit — auch bei Deutsch, Dialekten und gemischten Sprachen.\n\n## Was kann es besonders gut?\n- Automatische Spracherkennung in 90+ Sprachen\n- Sehr gut bei Deutsch und Code-Switching\n- Läuft lokal auf dem Mac (M-Chip) — komplett privat\n- Transkription mit Zeitstempeln\n\n## Pricing\nOpen Source (kostenlos selbst betreiben).\nAPI: 0,006 USD/Minute.\nGPT-4o Mini Transcribe: 0,003 USD/Minute (Budget-Option).\nMacWhisper Pro: 59 EUR einmalig — beste Mac-App, kein Abo, keine Cloud.\n\n## So nutzt du es als Studierender\nLad MacWhisper runter — Audiodatei reinziehen → Transcript mit Zeitstempeln in 2 Minuten. Keine laufenden Kosten nach Kauf.',
  summary = 'Open-Source Speech-to-Text von OpenAI. MacWhisper Pro: 59 EUR einmalig für die beste Mac-App.',
  quick_win = 'MacWhisper Pro (59 EUR einmalig) laden — Audiodatei reinziehen → Transcript mit Zeitstempeln in 2 Minuten. Keine Abokosten.'
WHERE slug = 'whisper';

-- Suno: Keine Änderungen nötig, Daten korrekt

-- =====================
-- RECHERCHE & PRODUKTIVITÄT
-- =====================

-- Perplexity: Max Tier, Model Council
UPDATE content_items SET
  content = E'## Was ist Perplexity?\nPerplexity kombiniert Websuche mit LLMs und zitiert jede Aussage direkt mit Quellen. Model Council (Februar 2026) routet Anfragen durch GPT-5.2, Claude 4.6 und Gemini 3.1 Pro.\n\n## Was kann es besonders gut?\n- Aktuelle Informationen mit Quellenangaben\n- **Model Council:** Wählt automatisch das beste Modell pro Anfrage\n- Pro Search für tiefere Recherche-Läufe\n- Labs: Dashboards, Spreadsheets, Präsentationen erstellen\n\n## Pricing\nKostenlos: Standard-Suche, limitiert.\nPro: 20 USD/Monat — erhöhte Limits, Modell-Auswahl.\n**Max: 200 USD/Monat — Perplexity Computer (19 Modelle orchestriert), 10.000 Credits/Monat, unbegrenzte Labs.**\n\n## So nutzt du es als Studierender\nNutze Perplexity für den ersten Recherche-Schritt: Überblick verschaffen, Schlüsselquellen finden, Definitionen klären.',
  summary = 'KI-Suchmaschine mit Quellen und Model Council (GPT-5.2, Claude 4.6, Gemini). Max-Tier: 200 USD/Monat für 19-Modell-Orchestrierung.'
WHERE slug = 'perplexity';

-- NotebookLM: Eigenes Pricing, Ultra-Tier
UPDATE content_items SET
  content = E'## Was ist NotebookLM?\nNotebookLM von Google ist ein KI-Assistent, der ausschließlich auf Basis eigener hochgeladener Quellen antwortet. Keine externen Informationen, keine erfundenen Fakten.\n\n## Was kann es besonders gut?\n- Quellengebundene Antworten: jede Aussage direkt auf die Originalstelle verlinkbar\n- Audio Overviews: KI-Podcast-Dialog aus jedem Notebook, jetzt auch offline auf Mobile\n- Quizze und Flashcards automatisch erstellen\n- Mind Maps: Zusammenhänge visualisieren\n- Slide Decks und Infografiken generieren\n\n## Pricing\nKostenlos: 100 Notebooks, 50 Quellen pro Notebook, 50 Chat-Anfragen/Tag, 3 Audio/Tag.\nPlus/Pro: 14-19 USD/Monat — 500 Notebooks, mehr Limits.\n**Studierende (US): 9,99 USD/Monat (50% Rabatt)**\nUltra: ~250 USD/Monat — kommerzielle Nutzung, 1.000 Generierungen/Tag.\n\n## So nutzt du es als Studierender\nAlle Vorlesungsfolien als PDFs hochladen. "Erstelle 20 mögliche Prüfungsfragen mit Antworten aus diesem Material." Audio Overview zum Lernen beim Pendeln.',
  summary = 'Googles Recherche-Tool nur auf deinen eigenen Dokumenten. Studierende (US): 9,99 USD/Monat.'
WHERE slug = 'notebooklm';

-- Elicit: Plus-Tier neu
UPDATE content_items SET
  content = E'## Was ist Elicit?\nElicit ist ein KI-Recherchetool speziell für wissenschaftliche Literatur. Durchsucht 138+ Millionen Paper und 545.000 klinische Studien mit semantischem Verständnis.\n\n## Was kann es besonders gut?\n- Semantische Suche: findet relevante Studien auch ohne exakte Keywords\n- Automatische Datenextraktion: Studiendesign, Stichprobengröße, Ergebnisse\n- Systematische Reviews: bis zu 1.000 relevante Paper identifizieren\n- Zitate auf Satzebene\n\n## Pricing\nKostenlos: unbegrenzte Suche und Zusammenfassungen.\n**Plus: 12 USD/Monat — 4 automatisierte Reports/Monat, bis 80 Paper pro Report.**\nPro: 49 USD/Monat — 12 Reports, 20.000 Datenpunkte analysieren.\nTeam: 79 USD/User/Monat — 20 gepoolte Reports.\n\n## So nutzt du es als Studierender\nForschungsfrage auf Englisch eingeben, Elicit zeigt sofort Tabelle mit relevanten Studien. Plus-Tier (12 USD) für 4 Reports/Monat reicht für die meisten Seminararbeiten.',
  summary = 'KI-Assistent für akademische Literaturrecherche — 138M Paper, 545K klinische Studien. Plus-Tier: 12 USD/Monat.'
WHERE slug = 'elicit';

-- Notion AI: Nur noch in Business/Enterprise
UPDATE content_items SET
  content = E'## Was ist Notion AI?\nNotion AI ist in die Notion-App integriert: Schreib-Assistent, Q&A über den ganzen Workspace, AI Meeting Notes, AI Agents (seit September 2025).\n\n## Was kann es besonders gut?\n- Meeting-Notizen automatisch strukturieren\n- Entwürfe aus Stichpunkten ausformulieren\n- Ask Notion: Fragen zum ganzen Workspace beantworten\n- AI Agents für automatisierte Workflows\n\n## Pricing\n**Wichtige Änderung:** Das AI-Add-on (früher 8 USD/Monat extra) ist nicht mehr separat erhältlich. AI ist jetzt ausschließlich in Business und Enterprise enthalten.\n\nFree: Kern-Features, AI nur als Trial.\nPlus: 10-12 USD/Monat — **kein AI-Zugang mehr.**\nBusiness: 15-18 USD/Monat — **AI enthalten.**\nEnterprise: Custom — AI enthalten.\n\n## So nutzt du es als Studierender\nNur sinnvoll wenn du bereit bist, Business (15+ USD/Monat) zu zahlen. Für reine Notizen ohne AI ist Plus günstiger, oder Obsidian als kostenlose Alternative.',
  summary = 'KI direkt in Notion. Achtung: AI nur noch in Business-Tier (15+ USD/Monat), nicht mehr als Add-on erhältlich.'
WHERE slug = 'notion-ai';

-- Obsidian: Smart Connections Pricing
UPDATE content_items SET
  content = E'## Was ist Obsidian?\nObsidian speichert Notizen als plain-text Markdown-Dateien lokal auf dem eigenen Gerät. Über 1.000 Community-Plugins erweiterbar — darunter starke KI-Integrationen.\n\n## Was kann es besonders gut?\n- Smart Connections Plugin: zeigt semantisch verwandte Notizen in Echtzeit\n- Smart Chat / Copilot Plugin: chattet mit dem eigenen Vault als Kontext\n- Lokale LLMs via Ollama: läuft komplett offline\n- Vollständige Datenkontrolle, kein Cloud-Lock-in\n\n## Pricing\nObsidian App: vollständig kostenlos für Einzelpersonen.\nSync: 4 USD/Monat — Geräteübergreifende Synchronisation.\nPublish: 8 USD/Monat — Notizen als Website veröffentlichen.\n\n**Plugins:**\nCopilot for Obsidian: Basis kostenlos, Premium mit erweiterten Features.\nSmart Connections Pro: 299 USD/Jahr (~25 USD/Monat) — All-Access für alle Pro-Features.\n\n## So nutzt du es als Studierender\nObsidian installieren, Smart Connections Plugin aktivieren (kostenlos für Basis), Vault mit Vorlesungsmitschriften füllen. Pro-Features erst wenn du wirklich tief einsteigst.',
  summary = 'Lokale Notiz-App mit KI-Plugins. App kostenlos, Smart Connections Pro: 299 USD/Jahr für Power-User.'
WHERE slug = 'obsidian';

-- =====================
-- AUTOMATION
-- =====================

-- Make: Credit-basiert seit August 2025
UPDATE content_items SET
  content = E'## Was ist Make?\nMake (früher Integromat) ist die visuelle Plattform für Workflow-Automatisierung mit 3.000+ App-Integrationen. Seit August 2025: Credit-basiertes Billing statt Operations.\n\n## Was kann es besonders gut?\n- Komplexe mehrstufige Workflows ohne Code\n- Native AI-Module für OpenAI, Claude/Anthropic\n- Daten zwischen Apps automatisch synchronisieren\n- Günstiger und flexibler als Zapier\n\n## Pricing\nKostenlos: 1.000 Credits/Monat, 2 aktive Scenarios, 15-Min Minimum-Intervall.\nCore: 10,59 USD/Monat — 10.000 Credits, unbegrenzte Scenarios, 1-Min Intervall.\nPro: 18,82 USD/Monat — Priority Execution, Volltext-Suche.\nTeams: 34,12 USD/Monat — Kollaboration, Templates.\n\n**Credit-System:** Jeder Trigger, Filter, Action = 1 Credit. Ungenutzte Credits übertragen sich 1 Monat. Extra-Credits kosten +25%.\n\n## So nutzt du es als Studierender\nTemplate klonen (z.B. "Gmail → Notion"), anpassen, fertig. 1.000 Credits/Monat kostenlos reichen für einfache Automationen.',
  summary = 'No-Code-Automation mit 3.000+ Apps. Credit-basiert seit August 2025. Core: 10,59 USD/Monat.'
WHERE slug = 'make';

-- n8n: LangChain Integration
UPDATE content_items SET
  content = E'## Was ist n8n?\nn8n ist eine Open-Source-Workflow-Automatisierungsplattform mit nativen KI-Agenten-Nodes. Seit n8n 2.0 (Januar 2026): vollständige LangChain-Integration.\n\n## Was kann es besonders gut?\n- **Native LangChain-Integration:** AI Agent Nodes für GPT-4o, Claude 3.5, lokale Ollama-Modelle\n- Memory Nodes für Konversationshistorie\n- RAG-Workflows mit Pinecone, Qdrant, Supabase als Vector Stores\n- 400+ offizielle Integrationen, ~2.000 Community-Nodes\n- Self-Hosted: komplett kostenlos, unbegrenzte Executions\n\n## Pricing\nSelf-Hosted (Community): Vollständig kostenlos, alle Features.\nCloud Starter: 24 EUR/Monat — 2.500 Executions.\nCloud Pro: 60 EUR/Monat — 10.000 Executions.\nCloud Business: 800 EUR/Monat — 40.000 Executions.\n\n**Realistische Self-Hosting-Kosten:** 200-500 USD/Monat (Infrastruktur, Wartung).\n\n## So nutzt du es als Studierender\nAuf Railway.app kostenlos deployen. Community Template importieren, OpenAI-Key eintragen, fertig. KI-Features ohne Extrakosten (du zahlst nur den LLM-Provider).',
  summary = 'Open-Source-Automation mit LangChain-AI-Agents seit n8n 2.0. Self-Hosted: kostenlos, Cloud: ab 24 EUR/Monat.'
WHERE slug = 'n8n';

-- Zapier: Agents, MCP
UPDATE content_items SET
  content = E'## Was ist Zapier?\nZapier ist die meistgenutzte No-Code-Automatisierungsplattform mit 8.000+ App-Integrationen. Copilot baut Workflows aus einem Satz, Agents führen komplexe mehrstufige Tasks aus.\n\n## Was kann es besonders gut?\n- Zapier Copilot: Workflow aus einem Satz bauen\n- **Zapier Agents:** KI-Agenten für komplexe Multi-Turn-Interaktionen\n- **MCP Integration:** Verbindet ChatGPT, Claude, Gemini direkt mit Zapiers 30.000+ Actions\n- 8.000+ Integrationen — größtes Ökosystem\n\n## Pricing\nKostenlos: 100 Tasks/Monat, 400 Agent-Activities/Monat, MCP enthalten.\nProfessional: 19,99 USD/Monat — höhere Limits.\n**Pro Agent Add-on: 33,33 USD/Monat — 1.500 Activities/Monat.**\nTeam: 69 USD/Monat — Kollaboration.\n\n**MCP:** Kostet 2 Zapier-Tasks pro Tool-Call. Verbindet deine KI mit dem gesamten Zapier-Ökosystem.\n\n## So nutzt du es als Studierender\nCopilot aufrufen, Use Case beschreiben, Zap steht in 60 Sekunden. MCP nutzen um Claude/ChatGPT mit deinen Apps zu verbinden — 100 Tasks/Monat kostenlos.',
  summary = 'No-Code-Automation mit 8.000+ Apps, AI Agents und MCP-Integration für ChatGPT/Claude. 100 Tasks/Monat kostenlos.'
WHERE slug = 'zapier';

-- =====================
-- DESIGN & CREATIVE
-- =====================

-- Gamma: Pro-Tier, Ultra neu
UPDATE content_items SET
  content = E'## Was ist Gamma?\nGamma generiert Präsentationen, Dokumente und Websites aus Text-Prompts. Professionelle Templates, responsive Layouts, automatische Bilder.\n\n## Was kann es besonders gut?\n- Vollständige Präsentationen aus einem Satz generieren\n- Export als PDF, PPTX, PNG, Google Slides\n- API-Integrationen: Zapier, Make, Airtable, Figma, Miro\n- Design Mode für visuelle Editierung\n\n## Pricing\nKostenlos: 400 AI-Credits (~10 Präsentationen), Gamma-Branding.\nPlus: 8 USD/Monat (jährlich), 10 USD/Monat (monatlich) — unbegrenzte AI, kein Branding, PPTX-Export.\nPro: 15 USD/Monat (jährlich), 20 USD/Monat (monatlich) — Analytics, API, 10 Custom Domains.\nUltra: Premium-Features, 100 Custom Domains, Early Access.\n\n## So nutzt du es als Studierender\nAbstract oder Gliederung reinkopieren → Slide-Deck in unter einer Minute. Plus-Tier für 8 USD/Monat wenn du regelmäßig präsentierst.',
  summary = 'KI-Präsentationen in Minuten. Plus: 8 USD/Monat (jährlich) für unbegrenzte AI ohne Branding.'
WHERE slug = 'gamma';

-- Midjourney: V7 default, V8 Alpha, Web App
UPDATE content_items SET
  content = E'## Was ist Midjourney?\nMidjourney ist der führende Dienst für KI-Bildgenerierung. V7 ist seit Juni 2025 der Standard — komplett neue Architektur mit besserem Prompt-Verständnis. V8 Alpha seit März 2026.\n\n## Was kann es besonders gut?\n- Fotorealistische Bilder aus Beschreibungen\n- V7: "Totally different architecture" mit smarterem Text-Verständnis\n- Konsistente Ästhetik über mehrere Bilder\n- **Web App verfügbar** — nicht mehr nur Discord\n\n## Pricing\nKein Free-Tier.\nBasic: 10 USD/Monat (8 USD jährlich).\nStandard: 30 USD/Monat (24 USD jährlich) — ~900 Fast-Images + unbegrenzt Relax.\nPro: 60 USD/Monat (48 USD jährlich).\nMega: 120 USD/Monat (96 USD jährlich).\n\n## So nutzt du es als Studierender\nFüg "--ar 16:9 --style raw" an deinen Prompt — gibt Folien-kompatible Bilder ohne typischen KI-Look. Web-App nutzen statt Discord für bessere UX.',
  summary = 'Goldstandard für KI-Bildgenerierung. V7 default, V8 Alpha verfügbar. Web-App statt nur Discord.'
WHERE slug = 'midjourney';

-- Runway: Gen-4/4.5 Pricing
UPDATE content_items SET
  content = E'## Was ist Runway?\nBrowser-basierte KI-Plattform für professionelle Video-Generierung. Gen-4/4.5 belegt Platz 1 im Video Arena Leaderboard.\n\n## Was kann es besonders gut?\n- Text-to-Video: hochauflösende Clips bis 10 Sekunden\n- Image-to-Video: Standbild animieren\n- Konsistente Charaktere über mehrere Szenen\n- Act-Two: Mimik auf KI-Charaktere übertragen\n\n## Pricing\nKostenlos: 125 Credits einmalig, Watermark.\nStandard: 12 USD/Monat (jährlich), 15 USD monatlich — 625 Credits/Monat.\nPro: 28 USD/Monat (jährlich), 35 USD monatlich — 2.250 Credits.\nUnlimited: 76 USD/Monat (jährlich) — Explore Mode (unbegrenzt relaxed).\n\n**Credit-Kosten:**\n- Gen-4 Turbo: 5 Credits/Sekunde (50 für 10s Video)\n- Gen-4 Standard: 12 Credits/Sekunde\n- Gen-4.5: 25 Credits/Sekunde\n\n## So nutzt du es als Studierender\n125 Gratis-Credits reichen für ~10 Test-Clips. Standard-Tier (12 USD/Monat jährlich) wenn du regelmäßig Video brauchst.',
  summary = 'KI-Videoplattform mit Gen-4/4.5. Standard: 12 USD/Monat (jährlich). 125 Credits kostenlos zum Testen.'
WHERE slug = 'runway';

-- DeepL: Pricing Update
UPDATE content_items SET
  content = E'## Was ist DeepL?\nDeepL ist ein KI-Übersetzer auf Basis eines eigenen, kuratierten LLMs. Besonders stark bei Deutsch↔Englisch mit natürlichen Formulierungen.\n\n## Was kann es besonders gut?\n- Überdurchschnittliche Qualität bei Deutsch↔Englisch\n- Dokumentenübersetzung mit Formaterhalt (PDF, Word, PowerPoint)\n- Alternative Übersetzungen: Wörter anklicken für Synonyme\n- Glossar-System für konsistente Fachbegriffe\n- DeepL Write: Stil-, Ton- und Grammatikverbesserung\n\n## Pricing\nKostenlos (Web): 1.500 Zeichen pro Übersetzung.\nFree API: 500.000 Zeichen/Monat.\nStarter: 10,49 USD/Monat.\nAdvanced: 34,49 USD/Monat.\nUltimate: 68,99 USD/Monat.\nAPI Pro: 5,49 USD/Monat + 25 USD pro Million Zeichen.\n\n## So nutzt du es als Studierender\nEnglischsprachige Paper-PDF direkt hochladen — in Sekunden layouttreu übersetzt. Free-API (500K Zeichen/Monat) reicht für die meisten Studis.',
  summary = 'KI-Übersetzer auf proprietärem LLM. Deutsch↔Englisch besonders präzise. Free API: 500K Zeichen/Monat.'
WHERE slug = 'deepl';

-- Lovable: Pricing Update
UPDATE content_items SET
  content = E'## Was ist Lovable?\nLovable (ehemals GPT Engineer) ist ein KI-Website-Builder der aus Text-Beschreibungen funktionierende Web-Apps generiert. Läuft auf Claude und erzeugt echten React-Code mit Supabase-Backend.\n\n## Was kann es besonders gut?\n- Text-zu-App: Formulare, Dashboards, Landing Pages, interne Tools\n- Echter Code: React + TypeScript + Tailwind, exportierbar\n- Supabase-Integration: Datenbank, Auth und Storage direkt eingebaut\n- Iteratives Arbeiten: Änderungen per Chat\n- GitHub-Sync und One-Click Deploy\n\n## Pricing\n**Credit-System:** 1 Credit = 1 Message/Prompt (Flat-Rate, unabhängig von Komplexität).\n\nKostenlos: 5 Credits täglich (~30/Monat), nur öffentliche Projekte.\nPro: 25 USD/Monat — 100 monatlich + 5 täglich (bis 150), private Projekte, Custom Domains.\nBusiness: 50 USD/Monat — +100 extra Credits, SSO, Design-Templates.\n\n## So nutzt du es als Studierender\nProjekt in 2-3 Sätzen beschreiben, Lovable generiert funktionierende App. 5 Credits täglich kostenlos reichen zum Ausprobieren. Pro für ernsthafte Projekte.',
  summary = 'KI-Website-Builder für funktionierende React-Apps aus Text. 5 Credits täglich kostenlos, Pro: 25 USD/Monat.',
  quick_win = 'Projekt in 2-3 Sätzen beschreiben → funktionierende Web-App → iterativ per Chat verbessern. 5 Credits täglich kostenlos.'
WHERE slug = 'lovable';

-- Canva: Keine Änderungen nötig, Daten korrekt

-- Suno: Keine Änderungen nötig, Daten korrekt
