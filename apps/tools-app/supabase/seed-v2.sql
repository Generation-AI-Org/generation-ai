-- Generation AI tools-app — Seed Content V2
-- 18 neue Tools + Updates bestehende Tools
-- Im Supabase SQL Editor ausführen

-- =====================
-- UPDATES BESTEHENDE TOOLS (Pricing-Korrekturen)
-- =====================
UPDATE content_items SET content = E'## Was ist ChatGPT?\nChatGPT ist der bekannteste KI-Assistent und für die meisten der erste Berührungspunkt mit generativer KI. Entwickelt von OpenAI, läuft auf GPT-4o.\n\n## Was kann er besonders gut?\n- Texte schreiben, überarbeiten, kürzen\n- Themen erklären und vereinfachen\n- Brainstorming und Ideenentwicklung\n- Code erklären und debuggen\n- Zusammenfassungen aus langen Texten\n\n## So nutzt du es als Studierender\nNutze ChatGPT als ersten Ansprechpartner für alles: Textentwürfe, Erklärungen, Prüfungsvorbereitung. Starte immer mit Kontext: wer du bist, was du brauchst, für wen es ist.\n\n## Pricing\nKostenlos: GPT-4o mit täglichen Limits, Bildgenerierung eingeschränkt.\nPlus: 20 USD/Monat — erhöhte Limits, DALL-E, Canvas, GPT-4o ohne Drosselung.\n\n## Quick Win\nFrag: "Erklär mir [Thema] wie einem 12-Jährigen" — schnellster Weg um schwierige Konzepte zu verstehen.\n\n## Alternativen\n- Claude: besser bei langen Texten und nuanciertem Schreiben\n- Gemini: Google-Integration, Deep Research'
WHERE slug = 'chatgpt';

UPDATE content_items SET content = E'## Was ist Claude?\nClaude von Anthropic ist Chatbot und Thinking Partner. Besonders stark bei sehr langen Kontexten (bis 200.000 Tokens), präzisem Schreiben und ehrlicher Selbsteinschätzung.\n\n## Was kann er besonders gut?\n- Lange PDFs, Papers und Dokumente analysieren\n- Nuancierte Argumentationen schreiben und hinterfragen\n- Code reviewen und erklären\n- Als Sparringspartner für komplexe Themen\n- Eigene Einschätzung geben statt nur zu bestätigen\n\n## So nutzt du es als Studierender\nLad dein Thesis-Kapitel oder Paper als PDF hoch. Frag gezielt: "Was ist die schwächste Stelle in meiner Argumentation?" oder "Welche Gegenargumente habe ich nicht berücksichtigt?"\n\n## Pricing\nKostenlos: Claude Sonnet mit täglichen Limits.\nPro: 20 USD/Monat — erhöhte Nutzung, Projects, Priority Access.\nMax: 100 USD/Monat (5× Nutzung) oder 200 USD/Monat (20× Nutzung) für intensive Nutzung.\n\n## Alternativen\n- ChatGPT: breiter bekannt, mehr Plugins\n- Gemini: besser für Google-Docs-Integration'
WHERE slug = 'claude';

-- =====================
-- NEUE TOOLS
-- =====================
INSERT INTO content_items (type, status, title, slug, summary, content, category, tags, use_cases, pricing_model, external_url, logo_domain, quick_win) VALUES

('tool', 'published', 'Gemini', 'gemini',
 'Googles KI-Assistent mit Deep Research, langen Kontextfenstern und direkter Integration in Docs, Gmail und Sheets.',
 E'## Was ist Gemini?\nGoogles multimodaler KI-Assistent auf Basis von Gemini 2.5 Pro/Flash. Verarbeitet Text, Bilder, Audio und PDFs. Tief integriert ins Google-Ökosystem.\n\n## Was kann er besonders gut?\n- Deep Research: recherchiert eigenständig in hunderten Quellen und liefert einen strukturierten Bericht — kein manuelles Durchsuchen\n- Lange Dokumente: ganze PDFs, Buchkapitel oder Skripte auf einmal verarbeiten und befragen\n- Direkt in Google Docs und Gmail: Texte überarbeiten, Entwürfe, Zusammenfassungen ohne App-Wechsel\n- Guided Learning: erklärt Konzepte Schritt für Schritt, generiert Quizze aus eigenem Lernstoff\n- Handgeschriebene Notizen oder Diagramme fotografieren und sofort erklären lassen\n\n## Pricing\nKostenlos: Gemini 2.5 Flash + limitierter 2.5 Pro-Zugriff, Deep Research enthalten.\nGoogle AI Pro: 19,99 USD/Monat — unbegrenzter 2.5 Pro-Zugang, 2 TB Speicher.\nStudierende: 1 Monat AI Pro kostenlos testbar.\n\n## So nutzt du es als Studierender\nDeep Research mit einer konkreten Seminarfrage starten — Gemini liefert in unter 5 Minuten einen strukturierten Überblick mit zitierten Quellen. Als Ausgangspunkt für die eigene Hausarbeit nutzen, nicht als Abgabe.',
 'KI-Assistenten', ARRAY['google','chat','deep-research','multimodal'],
 ARRAY['Texte schreiben','Recherche','Prüfungsvorbereitung','Google Workspace'],
 'freemium', 'https://gemini.google.com', 'google.com',
 'Deep Research aufrufen, konkrete Seminarfrage eingeben — strukturierter Überblick mit zitierten Quellen in unter 5 Minuten.'),

('tool', 'published', 'NotebookLM', 'notebooklm',
 'Googles Recherche-Tool das nur auf deinen eigenen Dokumenten basiert — keine Halluzinationen, jede Aussage direkt aus deinem Material.',
 E'## Was ist NotebookLM?\nNotebookLM von Google ist ein KI-Assistent, der ausschließlich auf Basis eigener hochgeladener Quellen antwortet: PDFs, Texte, Slides, YouTube-Links. Keine externen Informationen, keine erfundenen Fakten.\n\n## Was kann es besonders gut?\n- Quellengebundene Antworten: jede Aussage ist direkt auf die Originalstelle verlinkbar — überprüfbar statt geraten\n- Audio Overviews: generiert aus jedem Notebook einen KI-Podcast-Dialog (zwei Stimmen) — zum Lernen beim Pendeln oder Sport\n- Quizze und Flashcards automatisch aus dem eigenen Material erstellen, nicht aus dem Internet\n- Mind Maps (seit 2025): visualisiert Zusammenhänge aus hochgeladenen Quellen\n- Mehrere Mitschriften hochladen und fragen was in der Klausur drankommen könnte\n\n## Pricing\nKostenlos: 100 Notebooks, 50 Quellen pro Notebook, Audio Overviews enthalten — reicht für die meisten Studis vollständig.\nGoogle AI Pro (19,99 USD/Monat): 500 Notebooks, 300 Quellen, mehr Audio Overviews.\n\n## So nutzt du es als Studierender\nAlle Vorlesungsfolien eines Fachs als PDFs hochladen. Dann: "Erstelle 20 mögliche Prüfungsfragen mit Antworten aus diesem Material." Die Fragen kommen direkt aus deinem Lernstoff — kein generisches Wissen.',
 'Recherche', ARRAY['google','notizen','recherche','pdf','lernen','podcast'],
 ARRAY['Prüfungsvorbereitung','Literaturrecherche','Papers analysieren','Lernkarten'],
 'freemium', 'https://notebooklm.google.com', 'google.com',
 'Alle Vorlesungsfolien als PDF hochladen → "Erstelle 20 Prüfungsfragen mit Antworten" → direkt klausurrelevant, nur aus deinem Stoff.'),

('tool', 'published', 'Grok', 'grok',
 'xAIs KI-Assistent mit Echtzeit-Zugriff auf X/Twitter — der einzige große Chatbot der live auf aktuelle Diskussionen und Trends zugreift.',
 E'## Was ist Grok?\nGrok von xAI (Elon Musk) ist ein KI-Assistent mit direktem Live-Zugriff auf das X-Netzwerk. Läuft auf Grok 4.1, kein X-Account zum Testen nötig.\n\n## Was kann er besonders gut?\n- Echtzeit-X-Integration: greift live auf Trends, Posts und Diskussionen zu — kein anderer großer Chatbot hat das\n- DeepSearch: kombiniert Web-Recherche mit mehrstufigem Reasoning, liefert zitierte Quellen\n- Big Brain Mode: erhöhter Rechenaufwand für komplexe Probleme wie Coding oder strukturierte Analysen\n- 128k Token Kontextfenster im kostenlosen Tier\n- Bildgenerierung via Grok Imagine\n\n## Pricing\nKostenlos: ca. 10 Prompts alle 2 Stunden, Grok 4.1 Basic.\nSuperGrok: 30 USD/Monat — voller Zugang, DeepSearch, Bildgenerierung, kein Limit.\n\n## So nutzt du es als Studierender\nDeepSearch für aktuelle Themen nutzen die noch nicht in Wikipedia oder Lehrbüchern stehen — z.B. neue Gerichtsentscheidungen, Unternehmens-Nachrichten oder aktuelle politische Debatten.',
 'KI-Assistenten', ARRAY['xai','chat','echtzeit','twitter','search'],
 ARRAY['Recherche','Aktuelle Themen','Brainstorming','Texte schreiben'],
 'freemium', 'https://grok.com', 'x.ai',
 'DeepSearch aufrufen und eine aktuelle Frage eingeben — Grok recherchiert live und liefert eine strukturierte Antwort mit Quellen.'),

('tool', 'published', 'Meta AI', 'meta-ai',
 'Metas kostenloser KI-Assistent direkt in WhatsApp, Instagram und Facebook — kein Account, kein Setup, einfach @Meta AI anschreiben.',
 E'## Was ist Meta AI?\nMetas KI-Assistent auf Basis der Llama-4-Modelle (aktuell Muse Spark). Läuft nativ in WhatsApp, Instagram, Facebook und Messenger — und auf meta.ai im Browser.\n\n## Was kann er besonders gut?\n- WhatsApp-nativ: kein App-Wechsel nötig, einfach im Chat "@Meta AI" anschreiben oder den KI-Tab nutzen\n- Komplett kostenlos und ohne Nutzungslimit — keine Kreditkarte, kein Abo\n- Texte erklären, zusammenfassen, übersetzen direkt im Messaging-Flow\n- Bildgenerierung direkt im WhatsApp-Chat (außerhalb der EU noch eingeschränkt)\n- 1 Milliarde monatliche Nutzer — meistgenutzte KI weltweit\n\n## Pricing\nVollständig kostenlos, kein Premium-Tier (Stand April 2026).\n\n## So nutzt du es als Studierender\nIdeal für schnelle Fragen zwischendurch ohne Tool-Wechsel: Begriffe klären, kurze Texte überarbeiten, etwas auf Englisch übersetzen — direkt in WhatsApp, wo du ohnehin bist.',
 'KI-Assistenten', ARRAY['meta','whatsapp','kostenlos','chat','llama'],
 ARRAY['Texte schreiben','Schnelle Fragen','Übersetzen','Erklärungen'],
 'free', 'https://meta.ai', 'meta.com',
 'WhatsApp öffnen → im Suchfeld "Meta AI" antippen → sofort Fragen stellen. Kein Account, kein Abo, läuft auf jedem Smartphone.'),

('tool', 'published', 'ElevenLabs', 'elevenlabs',
 'KI-Audioplattform für Text-to-Speech, Stimmen-Klonen und Video-Dubbing — produziert synthetische Stimmen die kaum von echten zu unterscheiden sind.',
 E'## Was ist ElevenLabs?\nElevenLabs ist die führende Plattform für KI-Audio: Text in realistische Stimmen umwandeln, eigene Stimme klonen, Videos automatisch in andere Sprachen synchronisieren.\n\n## Was kann es besonders gut?\n- Voice Cloning: eigene Stimme mit wenigen Sekunden Audio klonen — spricht dann in 29 Sprachen\n- TTS in 70+ Sprachen mit über 1.000 Stimmen: Vorlesungsskripte als Audio-Version für unterwegs\n- AI Dubbing: Videos automatisch synchronisieren und dabei Tonfall und Rhythmus des Originals beibehalten\n- Sound Effects Generator: Soundeffekte aus Text-Beschreibungen generieren\n- Komplett-Plattform: TTS, STT, Voice Design, Conversational Agents alles unter einem Dach\n\n## Pricing\nKostenlos: 10.000 Credits/Monat (ca. 10 Min. TTS), keine kommerzielle Nutzung, Attribution nötig.\nStarter: 5 USD/Monat — 30.000 Credits, kommerzielle Lizenz, Instant Voice Cloning.\nCreator: 22 USD/Monat — Professional Voice Cloning, ca. 100.000 Credits, 50% Rabatt im ersten Monat.\n\n## So nutzt du es als Studierender\nHausarbeit oder Zusammenfassung als Audio-Version produzieren — zum Hören beim Sport oder Pendeln. Abstract eintippen, Stimme wählen, MP3 runterladen. Kostenlos machbar.',
 'Audio & Transkription', ARRAY['tts','stimme','audio','dubbing','klonen'],
 ARRAY['Audio-Inhalte erstellen','Präsentationsvertonung','Sprachen lernen','Barrierefreiheit'],
 'freemium', 'https://elevenlabs.io', 'elevenlabs.io',
 'Zusammenfassung deiner Hausarbeit reinkopieren, Stimme wählen, MP3 runterladen — kostenlos und in 2 Minuten.'),

('tool', 'published', 'Super Whisper', 'super-whisper',
 'Mac-App für systemweite Sprach-zu-Text-Eingabe mit einem Hotkey — diktiere direkt in jede App, auch offline.',
 E'## Was ist Super Whisper?\nSuper Whisper ist eine macOS/iOS-App die per globalem Hotkey (⌥ + Space) systemweit Spracheingabe in Text umwandelt — in jedem Programm: Slack, Mail, Word, Code-Editoren.\n\n## Was kann es besonders gut?\n- Systemweit per Hotkey: in jeder App aktivierbar, kein Fenster-Wechsel\n- Vollständig offline mit lokalen Whisper-Modellen — keine Cloud, kein Datenschutzproblem\n- Custom AI-Modi: "Academic", "Formal Email", "Code Comment" — Output wird automatisch entsprechend formatiert\n- 100+ Sprachen inklusive Übersetzung direkt beim Diktieren ins Englische\n- Wählbare Backend-Modelle: GPT, Claude, Llama, Gemini\n\n## Pricing\nFree-Tier vorhanden.\nPro: 8 USD/Monat (oder günstiger jährlich).\nLifetime: 849 USD einmalig.\n30-Tage-Geld-zurück-Garantie.\n\n## So nutzt du es als Studierender\nPerfekt für alle die schneller sprechen als tippen: E-Mails, Zusammenfassungen oder Gliederungen diktieren statt abtippen. Den Academic-Modus einrichten damit der Output direkt in sauberem Schriftdeutsch landet.',
 'Produktivität', ARRAY['audio','diktat','mac','sprache','whisper','offline'],
 ARRAY['Notizen diktieren','E-Mails schreiben','Texte verfassen','Barrierefreiheit'],
 'freemium', 'https://superwhisper.com', 'superwhisper.com',
 'App installieren, ⌥ + Space drücken, E-Mail oder Gliederung diktieren — direkt in das geöffnete Fenster, ohne Copy-Paste.'),

('tool', 'published', 'Otter.ai', 'otter-ai',
 'Live-Transkription für Vorlesungen und Meetings — Sprecher werden unterschieden, Zusammenfassung und Action Items kommen automatisch.',
 E'## Was ist Otter.ai?\nOtter.ai transkribiert Meetings und Vorlesungen in Echtzeit. Unterscheidet Sprecher, erstellt automatisch Zusammenfassungen und kann sich selbstständig in Zoom, Teams oder Google Meet einwählen.\n\n## Was kann es besonders gut?\n- Live-Transkription mit Sprecher-Diarization: wer sagt was — direkt lesbar\n- KI-Agent wählt sich automatisch ins Meeting ein und transkribiert ohne eigene Aufnahme\n- AI Chat über vergangene Transkripte: "Was hat der Professor zur Prüfungsstruktur gesagt?"\n- Automatische Extraktion von Key Points und Entscheidungen\n- Alle Transkripte durchsuchbar und exportierbar\n\n## Pricing\nKostenlos: 300 Minuten/Monat, Zoom/Teams/Meet-Integration, 3 Dateiimporte lifetime.\nPro: 8,33 USD/Monat (jährlich) — 1.200 Min./Monat, bis 90 Min. pro Meeting.\nBusiness: 19,99 USD/Monat — unlimitierte Meetings, bis 4h pro Meeting.\n\n## So nutzt du es als Studierender\nOtter-Bot zur nächsten Online-Vorlesung einladen: Meeting-Link einfügen, Bot tritt bei und transkribiert. Danach volles Skript + Zusammenfassung ohne eigene Mitschrift.',
 'Audio & Transkription', ARRAY['transkription','meetings','vorlesungen','live','zusammenfassung'],
 ARRAY['Vorlesungen transkribieren','Meeting-Protokolle','Mitschriften','Nachbereitung'],
 'freemium', 'https://otter.ai', 'otter.ai',
 'Otter-Bot zur nächsten Zoom-Vorlesung einladen (Meeting-Link einfügen) → nach der Stunde vollständiges Transkript + Zusammenfassung.'),

('tool', 'published', 'Elicit', 'elicit',
 'KI-Assistent für akademische Literaturrecherche — durchsucht 125 Millionen Paper und extrahiert strukturiert Daten aus Studien.',
 E'## Was ist Elicit?\nElicit ist ein KI-Recherchetool speziell für wissenschaftliche Literatur. Durchsucht 125+ Millionen Paper mit semantischem Verständnis und extrahiert automatisch strukturierte Daten — für systematische Reviews.\n\n## Was kann es besonders gut?\n- Semantische Suche: findet relevante Studien auch ohne exakte Keywords\n- Automatische Datenextraktion: Studiendesign, Stichprobengröße, Ergebnisse in strukturierten Tabellen\n- Systematische Reviews: bis zu 1.000 relevante Paper in einer Abfrage identifizieren\n- Zitate auf Satzebene: jede Aussage verlinkt direkt auf die Originalstelle im Paper\n- Bis zu 80% Zeitersparnis bei Literaturreviews laut eigenen Fallstudien\n\n## Pricing\nKostenlos: unbegrenzte Suche und Zusammenfassungen, 2 Reports/Monat.\nPro: 49 USD/Monat — 144 Reports/Jahr, 5.000 Paper pro Review, API-Zugang.\n\n## So nutzt du es als Studierender\nForschungsfrage eingeben (auf Englisch für beste Ergebnisse), Elicit zeigt sofort eine Tabelle mit relevanten Studien, Methodik und Key Findings. Die 2 kostenlosen Reports pro Monat reichen für die meisten Seminararbeiten.',
 'Recherche', ARRAY['wissenschaft','literatur','paper','recherche','akademisch'],
 ARRAY['Literaturrecherche','Systematische Reviews','Seminararbeiten','Paper-Analyse'],
 'freemium', 'https://elicit.com', 'elicit.com',
 'Forschungsfrage auf Englisch eingeben → Elicit zeigt sofort Tabelle mit relevanten Studien, Methodik und Ergebnissen. 2 Reports/Monat kostenlos.'),

('tool', 'published', 'Bolt.new', 'bolt',
 'Schreib einen Satz, bekomm eine lauffähige Web-App — inkl. Frontend, Backend, Datenbank und Deployment im Browser.',
 E'## Was ist Bolt.new?\nBolt.new ist ein Browser-basierter Full-Stack-App-Builder. Aus einem Text-Prompt generiert er vollständige, lauffähige Web-Apps — inklusive Code, Abhängigkeiten und Deployment-Link. Kein lokales Setup.\n\n## Was kann es besonders gut?\n- Generiert Frontend + Backend + Datenbank in einer Session\n- Installiert NPM-Packages automatisch, managed Abhängigkeiten selbst\n- Live-Preview direkt im Browser während der Generierung\n- Direktes Deployment zu Netlify, Vercel oder GitHub\n- Iteratives Editieren: Änderungen per Folge-Prompts auf bestehendem Code\n\n## Pricing\nKostenlos: 300.000 Tokens/Tag, 1M/Monat, Bolt-Branding auf gehosteten Sites.\nPro: 25 USD/Monat — kein Daily Cap, 10M Tokens/Monat, Custom Domains, kein Branding.\n\n## So nutzt du es als Studierender\nPerfekt für schnelle Prototypen, Semesterprojekte oder Portfolio-Sites ohne Dev-Setup. Prompt eingeben, App steht in 2-3 Minuten, Netlify-Deployment mit einem Klick. Kein Account nötig zum ersten Ausprobieren.',
 'Coding', ARRAY['no-code','fullstack','deployment','prototyping','web'],
 ARRAY['Prototypen bauen','Semesterprojekte','Portfolio','Web-Apps ohne Setup'],
 'freemium', 'https://bolt.new', 'bolt.new',
 'bolt.new aufrufen, beschreiben was du bauen willst — App steht in 2-3 Minuten, "Deploy to Netlify" klicken. Kein Account nötig.'),

('tool', 'published', 'v0', 'v0',
 'Verkaufs Prompt, kriegt React-Komponente — v0 von Vercel generiert produktionsreife UI-Code mit Tailwind und shadcn/ui.',
 E'## Was ist v0?\nv0 von Vercel ist ein spezialisierter UI-Generator. Aus Text-Prompts entstehen fertige React-Komponenten mit Tailwind CSS und shadcn/ui — direkt in echte Projekte kopierbar.\n\n## Was kann es besonders gut?\n- Generiert saubere, produktionsreife React-Komponenten statt Dummy-Code\n- 1-Click-Deploy auf Vercel, GitHub-Sync\n- Design Mode: visuelle Editierung ohne erneutes Prompting\n- Figma-Import (ab Premium): UI aus Figma direkt in Code\n- Spezialisierte Modelle (Mini/Pro/Max) je nach Komplexität\n\n## Pricing\nKostenlos: 5 USD monatliche Credits, max. 7 Messages/Tag.\nPremium: 30 USD/User/Monat.\nStudierenden-Programm: 1 Jahr kostenloses Premium bei verifizierbarer Uni-Mail (aktuell v.a. US-Unis, Ausweitung läuft).\n\n## So nutzt du es als Studierender\nPrompt: "Create a dashboard with a stats overview and dark mode toggle using shadcn/ui" → Code in ein bestehendes Next.js-Projekt kopieren. Auf v0.dev/students prüfen ob die eigene Uni gelistet ist.',
 'Coding', ARRAY['react','ui','design','vercel','tailwind','komponenten'],
 ARRAY['UI-Komponenten','Web-Apps','Prototypen','Frontend-Entwicklung'],
 'freemium', 'https://v0.dev', 'vercel.com',
 'v0.dev/students aufrufen — prüfen ob Uni gelistet ist → 1 Jahr kostenlos. Sonst: Komponente per Prompt generieren, in Next.js-Projekt kopieren.'),

('tool', 'published', 'Replit', 'replit',
 'Browser-IDE mit KI-Agent der eigenständig Apps baut, debuggt und deployed — kein lokales Setup, 50+ Programmiersprachen.',
 E'## Was ist Replit?\nReplit ist eine vollständige Browser-IDE mit integriertem KI-Agent. Der Agent baut eigenständig Apps aus einer Beschreibung — nicht nur Snippets, sondern lauffähige Projekte mit Deployment.\n\n## Was kann es besonders gut?\n- Replit Agent baut eigenständige Apps aus einem Beschreibungs-Prompt\n- Sofortige Multiplayer-Kollaboration: mehrere Personen live im selben Code\n- Deployment mit einem Klick, kein separates Hosting\n- 50+ Sprachen: Python, Node, Go, Rust, alle gängigen Frameworks\n- Persistent Repls mit eigenem Dateisystem — auch nach Browser-Schließen erhalten\n\n## Pricing\nKostenlos: tägliche Agent-Credits, 10 AI Checkpoints/Monat, 1 deploybare App, schläft nach 5 Min Inaktivität.\nCore: 25 USD/Monat — 5 Collaborateure, unbegrenzte Workspaces, höhere Limits.\nPro: 100 USD/Monat — stärkste Modelle, 15 Collaborateure.\n\n## So nutzt du es als Studierender\nAccount anlegen, "Use Replit Agent", Prompt eingeben — z.B. "Build a Flask API that tracks study sessions with start time, duration and subject". Agent erstellt alles und deployed automatisch. 10 Checkpoints/Monat kostenlos.',
 'Coding', ARRAY['browser-ide','python','agent','deployment','kollaboration'],
 ARRAY['Programmieren lernen','Semesterprojekte','Python-Skripte','Gruppen-Coding'],
 'freemium', 'https://replit.com', 'replit.com',
 'Account erstellen → "Create Repl" → "Use Replit Agent" → Projekt beschreiben. Agent baut und deployed in Minuten, 10 Checkpoints/Monat kostenlos.'),

('tool', 'published', 'Canva', 'canva',
 'Design-Tool mit integrierter KI-Suite — Präsentationen, Social Posts und Grafiken mit Magic Write, Dream Lab und Magic Design in Minuten.',
 E'## Was ist Canva?\nOnline-Design-Plattform mit integriertem Magic Studio. Texterstellung, Bildgenerierung und Design-Bearbeitung direkt im Browser — für Präsentationen, Social Posts, Infografiken.\n\n## Was kann es besonders gut?\n- Magic Write: KI generiert Captions, Präsentationstexte und Gliederungen direkt im Design\n- Dream Lab: Bilder aus Text-Prompts in verschiedenen Stilen — kein Midjourney-Export nötig\n- Magic Edit / Eraser: Objekte aus Fotos entfernen, KI füllt den Hintergrund nahtlos\n- Magic Design: aus Prompt oder Bild automatisch eine komplette Präsentation generieren\n- Magic Expand: Bilder über Grenzen hinaus generativ erweitern\n\n## Pricing\nKostenlos: begrenzte KI-Credits (~50/Monat), Kern-Features von Magic Studio.\nPro: ca. 15 USD/Monat — unbegrenzte KI-Generierungen, alle Magic Studio Tools.\nEducation: vollständig kostenlos für verifizierte Studierende und Lehrende.\n\n## So nutzt du es als Studierender\nUnbedingt den Education-Account aktivieren: canva.com/education → volle Pro-Features kostenlos mit Uni-Mail. Dann Magic Design für Seminar-Präsentationen nutzen.',
 'Bilder & Design', ARRAY['design','praesentation','ki','magic-studio','canva'],
 ARRAY['Präsentationen','Social Media','Infografiken','Poster','Flyer'],
 'freemium', 'https://canva.com', 'canva.com',
 'canva.com/education aufrufen, Education-Account mit Uni-Mail aktivieren — vollständiges Pro-Paket kostenlos, inkl. aller KI-Features.'),

('tool', 'published', 'Obsidian', 'obsidian',
 'Lokale Notiz-App in der deine Gedanken bleiben — mit KI-Plugins chattest du mit deinem eigenen Wissensarchiv, ohne Cloud-Upload.',
 E'## Was ist Obsidian?\nObsidian speichert Notizen als plain-text Markdown-Dateien lokal auf dem eigenen Gerät. Über 1.000 Community-Plugins erweiterbar — darunter starke KI-Integrationen die den eigenen Vault als Wissensbasis nutzen.\n\n## Was kann es besonders gut?\n- Smart Connections Plugin: zeigt in Echtzeit semantisch verwandte Notizen — ohne API-Key, vollständig lokal\n- Smart Chat / Copilot Plugin: chattet mit dem eigenen Vault als Kontext (RAG über eigene Notizen)\n- Lokale LLMs via Ollama: läuft komplett offline mit Modellen wie Llama 3 — ideal für datenschutzsensible Arbeiten\n- Vollständige Datenkontrolle: alles auf dem eigenen Rechner, kein Cloud-Lock-in\n- Verknüpfte Notizen als Graph: Zusammenhänge zwischen Themen visualisieren\n\n## Pricing\nObsidian App: vollständig kostenlos für Einzelpersonen.\nSync: 4 USD/Monat für Geräteübergreifende Synchronisation.\nCopilot Plus Plugin: 14,99 USD/Monat für erweiterte Agent-Features (eigene API-Keys nötig für das Basis-Plugin).\n\n## So nutzt du es als Studierender\nObsidian installieren, Smart Connections Plugin aus dem Community-Store installieren, Vault mit Vorlesungsmitschriften füllen. Nach ein paar Wochen zeigt die App automatisch was zusammenhängt — ein Second Brain für das Studium.',
 'Produktivität', ARRAY['notizen','second-brain','lokal','markdown','ki-plugins','obsidian'],
 ARRAY['Notizen verwalten','Wissensaufbau','Prüfungsvorbereitung','Recherche-Archiv'],
 'free', 'https://obsidian.md', 'obsidian.md',
 'Obsidian installieren → Settings → Community Plugins → "Smart Connections" suchen und aktivieren → verwandte Notizen erscheinen automatisch in der Sidebar.'),

('tool', 'published', 'n8n', 'n8n',
 'Open-Source-Automation mit nativen KI-Agenten-Nodes, lokalem LLM-Support und RAG-Workflows — selbst hostbar, kostenlos.',
 E'## Was ist n8n?\nn8n ist eine Open-Source-Workflow-Automatisierungsplattform mit visuellen Node-Pipelines und nativen KI-Integrationen. Die Developer-freundlichere Alternative zu Zapier — selbst hostbar und mit direktem Code-Zugriff.\n\n## Was kann es besonders gut?\n- Native AI Agent Nodes: Conversational Agent, ReAct Agent, Plan-and-Execute direkt im Editor\n- Breite LLM-Unterstützung: OpenAI, Anthropic, Gemini, Mistral, und lokale Modelle via Ollama\n- RAG-Workflows visuell zusammenstecken: Pinecone, Qdrant, Supabase, PGVector als Vector Store Nodes\n- AI Transform Node: Datentransformation per natürlichsprachlichem Prompt statt Code\n- 9.000+ Community Workflows als Templates importierbar\n\n## Pricing\nSelf-Hosted (Community Edition): vollständig kostenlos, alle Features, eigene Infrastruktur (Docker oder Railway.app Free Tier).\nCloud Starter: ca. 20 USD/Monat.\n\n## So nutzt du es als Studierender\nn8n per Railway.app kostenlos deployen (kein eigener Server nötig). Dann den "Email Summarizer" Community-Template importieren und mit eigenem OpenAI-Key verknüpfen — E-Mails werden automatisch zusammengefasst und als Digest zugeschickt.',
 'Automation', ARRAY['automation','open-source','self-hosted','ki-agenten','workflow','n8n'],
 ARRAY['Workflows automatisieren','KI-Agenten bauen','Apps verbinden','Daten verarbeiten'],
 'open_source', 'https://n8n.io', 'n8n.io',
 'n8n auf Railway.app (kostenloser Hobby-Plan) deployen → Community Template "Email Summarizer" importieren → OpenAI-Key eintragen → fertig.'),

('tool', 'published', 'Zapier', 'zapier',
 'No-Code-Automation mit dem größten App-Ökosystem (8.000+ Integrationen) und KI-Copilot der Workflows aus einem Satz baut.',
 E'## Was ist Zapier?\nZapier ist die meistgenutzte No-Code-Automatisierungsplattform mit 8.000+ App-Integrationen. Seit 2023 schrittweise KI-Features: Copilot, AI Steps in Workflows, eigenständige Agents.\n\n## Was kann es besonders gut?\n- Zapier Copilot: Workflow aus einem Satz bauen — "Wenn neue Gmail-Anhang, speichere in Drive nach Absender-Ordner" → Copilot baut den Zap\n- AI Steps in Zaps: LLM-Prompts direkt in Workflow-Schritten — Text klassifizieren, zusammenfassen, übersetzen\n- Zapier Agents: eigenständige KI-Agenten die Tasks über mehrere Apps ausführen\n- Zapier MCP: verbindet Claude oder ChatGPT direkt mit dem Zapier-Ökosystem\n- 8.000+ Integrationen: mehr App-Abdeckung als jede Alternative\n\n## Pricing\nKostenlos: 100 Tasks/Monat, Multi-Step Zaps, Zapier MCP enthalten.\nProfessional: ab ca. 19 USD/Monat für 750 Tasks, 33% Rabatt jährlich.\n\n## So nutzt du es als Studierender\nIdeal als Einstieg in Automation ohne technisches Setup. Copilot aufrufen, Use Case beschreiben, Zap steht in 60 Sekunden — ohne eine Zeile Code.',
 'Automation', ARRAY['automation','no-code','workflow','integration','zapier'],
 ARRAY['Apps verbinden','Aufgaben automatisieren','Benachrichtigungen','Datei-Management'],
 'freemium', 'https://zapier.com', 'zapier.com',
 'Copilot aufrufen, Use Case in einem Satz beschreiben — Zapier baut den Workflow automatisch. 100 Tasks/Monat kostenlos.'),

('tool', 'published', 'DeepL', 'deepl',
 'KI-Übersetzer auf proprietärem LLM — besonders präzise bei Deutsch↔Englisch, übersetzt Dokumente layouttreu und bietet Stilverbesserungen.',
 E'## Was ist DeepL?\nDeepL ist ein KI-Übersetzer auf Basis eines eigenen, von Sprachexperten kuratierten LLMs — kein allgemeines GPT-Modell. Besonders stark bei Deutsch↔Englisch mit natürlichen Formulierungen.\n\n## Was kann es besonders gut?\n- Überdurchschnittliche Qualität bei Deutsch↔Englisch: idiomatischere Formulierungen als Konkurrenz\n- Dokumentenübersetzung mit Formaterhalt: PDF, Word, PowerPoint werden layouttreu übersetzt\n- Alternative Übersetzungen: einzelne Wörter anklicken um Synonyme und Stilalternativen zu sehen\n- Glossar-System: eigene Terminologie einpflegen für konsistente Fachbegriffe\n- DeepL Write: separates Tool für Stil-, Ton- und Grammatikverbesserung auf Deutsch und Englisch\n\n## Pricing\nKostenlos: 50.000 Zeichen/Monat, 1 Datei/Monat — Texte können für Training genutzt werden.\nIndividual: 8,74 USD/Monat (jährlich) — 300.000 Zeichen, kein Training mit eigenen Texten.\n\n## So nutzt du es als Studierender\nEnglischsprachige Seminar-PDF direkt hochladen — in Sekunden komplett übersetzt mit erhaltenem Layout. Dann einzelne Sätze im Editor anklicken um Stilalternativen zu finden und den Text zu verfeinern.',
 'Schreiben & Chat', ARRAY['übersetzen','deutsch','englisch','dokumente','schreiben'],
 ARRAY['Texte übersetzen','Papers lesen','Hausarbeiten überarbeiten','Fachbegriffe'],
 'freemium', 'https://deepl.com', 'deepl.com',
 'PDF oder Word-Datei direkt auf deepl.com hochladen — in Sekunden layouttreu übersetzt. Einzelne Sätze anklicken für Stilalternativen.'),

('tool', 'published', 'Runway', 'runway',
 'Browser-basierte KI-Videoplattform — generiert Videos aus Text oder Bild, hält Charaktere über Szenen hinweg konsistent.',
 E'## Was ist Runway?\nBrowser-basierte KI-Plattform für professionelle Video-Generierung und -bearbeitung. Das Gen-4/4.5-Modell belegt aktuell Platz 1 im Video Arena Leaderboard (vor Google und OpenAI).\n\n## Was kann es besonders gut?\n- Text-to-Video: hochauflösende Videoclips bis 10 Sekunden aus Textbeschreibungen\n- Image-to-Video: Standbild als Ausgangspunkt, KI animiert daraus eine Sequenz\n- Konsistente Charaktere: ein Referenzbild reicht, um eine Figur über mehrere Szenen identisch zu halten\n- Act-Two: Gesichtsmimik und Bewegungen auf KI-generierte Charaktere übertragen\n- Kein lokales Setup: läuft vollständig im Browser\n\n## Pricing\nKostenlos: 125 Credits einmalig (nicht nachfüllbar), Watermark, kein Gen-4-Zugang.\nStandard: 15 USD/Monat — 625 Credits, kein Watermark.\nPro: 35 USD/Monat — 2.250 Credits, Custom Voices für Lip-Sync.\n\n## So nutzt du es als Studierender\nIdeal für Videoprojekte, Präsentations-Opener oder kreative Semesterarbeiten. Die 125 Gratis-Credits reichen für ca. 10-15 Test-Clips. Szenario beschreiben, Stil angeben, Clip generieren.',
 'Bilder & Design', ARRAY['video','ki-generierung','animation','kreativ','runway'],
 ARRAY['Video-Projekte','Präsentationen','Kreative Semesterarbeiten','Prototypen'],
 'freemium', 'https://runwayml.com', 'runwayml.com',
 'Im Free-Plan einloggen, "Text to Video" wählen, Szene beschreiben — 125 Gratis-Credits reichen für ca. 10 Test-Clips.'),

('tool', 'published', 'Suno', 'suno',
 'KI-Musikgenerierung aus einem Prompt — vollständige Songs mit Gesang, Instrumenten und Struktur in Sekunden, kein Vorwissen nötig.',
 E'## Was ist Suno?\nSuno generiert aus Textprompts vollständige Songs: Gesang, Instrumentierung, Lyrics und Songstruktur. V5 (für Pro-Nutzer) ist kaum von menschlich produzierten Tracks zu unterscheiden.\n\n## Was kann es besonders gut?\n- Vollständige Songs aus einem Satz — Stil, Tempo, Stimmung und Instrumente per Prompt steuerbar\n- Custom Lyrics: eigene Texte eintippen, Suno vertont sie automatisch\n- Song-Fortsetzungen: bestehende Clips verlängern oder Variationen generieren\n- 10 Songs täglich kostenlos (V4.5) — kein Abo nötig zum Ausprobieren\n- Suno Studio (Premier): erweitertes Editing einzelner Abschnitte\n\n## Pricing\nKostenlos: 50 Credits/Tag täglich neu (ca. 10 Songs/Tag), V4.5-Modell, keine kommerziellen Rechte.\nPro: 10 USD/Monat — 2.500 Credits/Monat, V5-Zugang, kommerzielle Rechte.\nPremier: 30 USD/Monat — 10.000 Credits, Suno Studio.\nHinweis: Laufender Rechtsstreit mit Plattenlabels wegen Trainingsdaten — für kommerzielle Nutzung beachten.\n\n## So nutzt du es als Studierender\nFür Videoprojekte, Podcast-Intros, Präsentations-Soundtracks oder als kreatives Experiment. Täglich 10 Songs kostenlos, kein Abo.',
 'Audio & Transkription', ARRAY['musik','audio','generierung','kreativ','songs'],
 ARRAY['Video-Soundtracks','Podcast-Intros','Kreative Projekte','Präsentationen'],
 'freemium', 'https://suno.com', 'suno.com',
 'Auf suno.com einloggen (Google/Apple), Musikstil und Stimmung beschreiben — fertiger Song in 30 Sekunden. 10 Songs täglich kostenlos.');
