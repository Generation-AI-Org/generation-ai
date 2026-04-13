import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://wbohulnuwqrhystaamjc.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indib2h1bG51d3FyaHlzdGFhbWpjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTg0MjQxNCwiZXhwIjoyMDkxNDE4NDE0fQ.l9f3TwODSkQ0mV_7StGSAlol7JgpNB4Ci6a1p0pkSxc'
)

const updates = [
  {
    slug: 'chatgpt',
    content: `## Was ist ChatGPT?\nChatGPT ist der bekannteste KI-Assistent und für die meisten der erste Berührungspunkt mit generativer KI. Entwickelt von OpenAI, läuft auf GPT-4o.\n\n## Was kann er besonders gut?\n- Texte schreiben, überarbeiten, kürzen\n- Themen erklären und vereinfachen\n- Brainstorming und Ideenentwicklung\n- Code erklären und debuggen\n- Zusammenfassungen aus langen Texten\n\n## So nutzt du es als Studierender\nNutze ChatGPT als ersten Ansprechpartner für alles: Textentwürfe, Erklärungen, Prüfungsvorbereitung. Starte immer mit Kontext: wer du bist, was du brauchst, für wen es ist.\n\n## Pricing\nKostenlos: GPT-4o mit täglichen Limits, Bildgenerierung eingeschränkt.\nPlus: 20 USD/Monat — erhöhte Limits, DALL-E, Canvas, GPT-4o ohne Drosselung.\n\n## Quick Win\nFrag: "Erklär mir [Thema] wie einem 12-Jährigen" — schnellster Weg um schwierige Konzepte zu verstehen.\n\n## Alternativen\n- Claude: besser bei langen Texten und nuanciertem Schreiben\n- Gemini: Google-Integration, Deep Research`,
  },
  {
    slug: 'claude',
    content: `## Was ist Claude?\nClaude von Anthropic ist Chatbot und Thinking Partner. Besonders stark bei sehr langen Kontexten (bis 200.000 Tokens), präzisem Schreiben und ehrlicher Selbsteinschätzung.\n\n## Was kann er besonders gut?\n- Lange PDFs, Papers und Dokumente analysieren\n- Nuancierte Argumentationen schreiben und hinterfragen\n- Code reviewen und erklären\n- Als Sparringspartner für komplexe Themen\n- Eigene Einschätzung geben statt nur zu bestätigen\n\n## So nutzt du es als Studierender\nLad dein Thesis-Kapitel oder Paper als PDF hoch. Frag gezielt: "Was ist die schwächste Stelle in meiner Argumentation?" oder "Welche Gegenargumente habe ich nicht berücksichtigt?"\n\n## Pricing\nKostenlos: Claude Sonnet mit täglichen Limits.\nPro: 20 USD/Monat — erhöhte Nutzung, Projects, Priority Access.\nMax: 100 USD/Monat (5× Nutzung) oder 200 USD/Monat (20× Nutzung).\n\n## Alternativen\n- ChatGPT: breiter bekannt, mehr Plugins\n- Gemini: besser für Google-Docs-Integration`,
  },
]

const newTools = [
  {
    type: 'tool', status: 'published',
    title: 'Gemini', slug: 'gemini',
    summary: 'Googles KI-Assistent mit Deep Research, langen Kontextfenstern und direkter Integration in Docs, Gmail und Sheets.',
    content: `## Was ist Gemini?\nGoogles multimodaler KI-Assistent auf Basis von Gemini 2.5 Pro/Flash. Verarbeitet Text, Bilder, Audio und PDFs. Tief integriert ins Google-Ökosystem.\n\n## Was kann er besonders gut?\n- Deep Research: recherchiert eigenständig in hunderten Quellen und liefert einen strukturierten Bericht\n- Lange Dokumente: ganze PDFs, Buchkapitel oder Skripte auf einmal verarbeiten und befragen\n- Direkt in Google Docs und Gmail: Texte überarbeiten, Entwürfe, Zusammenfassungen ohne App-Wechsel\n- Guided Learning: erklärt Konzepte Schritt für Schritt, generiert Quizze aus eigenem Lernstoff\n- Handgeschriebene Notizen oder Diagramme fotografieren und sofort erklären lassen\n\n## Pricing\nKostenlos: Gemini 2.5 Flash + limitierter 2.5 Pro-Zugriff, Deep Research enthalten.\nGoogle AI Pro: 19,99 USD/Monat — unbegrenzter 2.5 Pro-Zugang, 2 TB Speicher.\nStudierende: 1 Monat AI Pro kostenlos testbar.\n\n## So nutzt du es als Studierender\nDeep Research mit einer konkreten Seminarfrage starten — Gemini liefert in unter 5 Minuten einen strukturierten Überblick mit zitierten Quellen. Als Ausgangspunkt nutzen, nicht als Abgabe.`,
    category: 'KI-Assistenten', tags: ['google','chat','deep-research','multimodal'],
    use_cases: ['Texte schreiben','Recherche','Prüfungsvorbereitung','Google Workspace'],
    pricing_model: 'freemium', external_url: 'https://gemini.google.com', logo_domain: 'google.com',
    quick_win: 'Deep Research aufrufen, konkrete Seminarfrage eingeben — strukturierter Überblick mit zitierten Quellen in unter 5 Minuten.',
  },
  {
    type: 'tool', status: 'published',
    title: 'NotebookLM', slug: 'notebooklm',
    summary: 'Googles Recherche-Tool das nur auf deinen eigenen Dokumenten basiert — keine Halluzinationen, jede Aussage direkt aus deinem Material.',
    content: `## Was ist NotebookLM?\nNotebookLM von Google antwortet ausschließlich auf Basis eigener hochgeladener Quellen: PDFs, Texte, Slides, YouTube-Links. Keine externen Informationen, keine erfundenen Fakten.\n\n## Was kann es besonders gut?\n- Quellengebundene Antworten: jede Aussage ist direkt auf die Originalstelle verlinkbar\n- Audio Overviews: generiert einen KI-Podcast-Dialog aus jedem Notebook — zum Lernen beim Pendeln\n- Quizze und Flashcards automatisch aus dem eigenen Material\n- Mind Maps (seit 2025): visualisiert Zusammenhänge aus hochgeladenen Quellen\n- Mehrere Mitschriften hochladen und fragen was in der Klausur drankommen könnte\n\n## Pricing\nKostenlos: 100 Notebooks, 50 Quellen pro Notebook, Audio Overviews enthalten — reicht für die meisten Studis.\nGoogle AI Pro (19,99 USD/Monat): 500 Notebooks, 300 Quellen, mehr Audio Overviews.\n\n## So nutzt du es als Studierender\nAlle Vorlesungsfolien eines Fachs als PDFs hochladen. Dann: "Erstelle 20 mögliche Prüfungsfragen mit Antworten aus diesem Material."`,
    category: 'Recherche', tags: ['google','notizen','recherche','pdf','lernen','podcast'],
    use_cases: ['Prüfungsvorbereitung','Literaturrecherche','Papers analysieren','Lernkarten'],
    pricing_model: 'freemium', external_url: 'https://notebooklm.google.com', logo_domain: 'google.com',
    quick_win: 'Alle Vorlesungsfolien als PDF hochladen → "Erstelle 20 Prüfungsfragen mit Antworten" → direkt klausurrelevant, nur aus deinem Stoff.',
  },
  {
    type: 'tool', status: 'published',
    title: 'Grok', slug: 'grok',
    summary: 'xAIs KI-Assistent mit Echtzeit-Zugriff auf X/Twitter — der einzige große Chatbot der live auf aktuelle Diskussionen und Trends zugreift.',
    content: `## Was ist Grok?\nGrok von xAI läuft auf Grok 4.1 und hat als einziger großer Chatbot direkten Live-Zugriff auf das X-Netzwerk. Kein X-Account zum Testen nötig.\n\n## Was kann er besonders gut?\n- Echtzeit-X-Integration: greift live auf aktuelle Trends und Diskussionen zu\n- DeepSearch: Web-Recherche mit mehrstufigem Reasoning, zitierte Quellen\n- Big Brain Mode: erhöhter Rechenaufwand für komplexe Coding- oder Analyse-Aufgaben\n- 128k Token Kontextfenster im kostenlosen Tier\n- Bildgenerierung via Grok Imagine\n\n## Pricing\nKostenlos: ca. 10 Prompts alle 2 Stunden, Grok 4.1 Basic.\nSuperGrok: 30 USD/Monat — voller Zugang, DeepSearch, Bildgenerierung.\n\n## So nutzt du es als Studierender\nDeepSearch für aktuelle Themen nutzen die noch nicht in Lehrbüchern stehen: neue Gerichtsentscheidungen, aktuelle Studienergebnisse, politische Debatten.`,
    category: 'KI-Assistenten', tags: ['xai','chat','echtzeit','search'],
    use_cases: ['Recherche','Aktuelle Themen','Brainstorming','Texte schreiben'],
    pricing_model: 'freemium', external_url: 'https://grok.com', logo_domain: 'x.ai',
    quick_win: 'DeepSearch aufrufen, aktuelle Frage eingeben — Grok recherchiert live und liefert strukturierte Antwort mit Quellen.',
  },
  {
    type: 'tool', status: 'published',
    title: 'Meta AI', slug: 'meta-ai',
    summary: 'Metas kostenloser KI-Assistent direkt in WhatsApp, Instagram und Facebook — kein Account, kein Setup, einfach @Meta AI anschreiben.',
    content: `## Was ist Meta AI?\nMetas KI-Assistent auf Basis der Llama-4-Modelle. Läuft nativ in WhatsApp, Instagram, Facebook und Messenger — sowie auf meta.ai im Browser.\n\n## Was kann er besonders gut?\n- WhatsApp-nativ: kein App-Wechsel nötig, einfach "@Meta AI" anschreiben\n- Komplett kostenlos ohne Nutzungslimit — keine Kreditkarte nötig\n- Texte erklären, zusammenfassen, übersetzen direkt im Messaging-Flow\n- Bildgenerierung direkt im WhatsApp-Chat (außerhalb der EU)\n- Meistgenutzte KI weltweit: 1 Milliarde monatliche Nutzer\n\n## Pricing\nVollständig kostenlos, kein Premium-Tier (Stand April 2026).\n\n## So nutzt du es als Studierender\nIdeal für schnelle Fragen ohne Tool-Wechsel: Begriffe klären, kurze Texte überarbeiten, etwas übersetzen — direkt in WhatsApp.`,
    category: 'KI-Assistenten', tags: ['meta','whatsapp','kostenlos','chat','llama'],
    use_cases: ['Texte schreiben','Schnelle Fragen','Übersetzen','Erklärungen'],
    pricing_model: 'free', external_url: 'https://meta.ai', logo_domain: 'meta.com',
    quick_win: 'WhatsApp öffnen → im Suchfeld "Meta AI" antippen → sofort Fragen stellen. Kein Account, kein Abo.',
  },
  {
    type: 'tool', status: 'published',
    title: 'ElevenLabs', slug: 'elevenlabs',
    summary: 'KI-Audioplattform für Text-to-Speech, Stimmen-Klonen und Video-Dubbing — produziert synthetische Stimmen die kaum von echten zu unterscheiden sind.',
    content: `## Was ist ElevenLabs?\nElevenLabs ist die führende Plattform für KI-Audio: Text in realistische Stimmen umwandeln, eigene Stimme klonen, Videos automatisch synchronisieren.\n\n## Was kann es besonders gut?\n- Voice Cloning: eigene Stimme mit wenigen Sekunden Audio klonen — spricht dann in 29 Sprachen\n- TTS in 70+ Sprachen mit über 1.000 Stimmen\n- AI Dubbing: Videos synchronisieren und dabei Tonfall und Rhythmus beibehalten\n- Vorlesungsskripte als Audio-Version für unterwegs produzieren\n- Alles unter einem Dach: TTS, STT, Voice Design, Conversational Agents\n\n## Pricing\nKostenlos: 10.000 Credits/Monat (ca. 10 Min. TTS), keine kommerzielle Nutzung.\nStarter: 5 USD/Monat — 30.000 Credits, kommerzielle Lizenz, Instant Voice Cloning.\nCreator: 22 USD/Monat — Professional Voice Cloning, ca. 100.000 Credits.\n\n## So nutzt du es als Studierender\nHausarbeit oder Zusammenfassung als Audio-Version produzieren — zum Hören beim Sport. Abstract eintippen, Stimme wählen, MP3 runterladen. Kostenlos machbar.`,
    category: 'Audio & Transkription', tags: ['tts','stimme','audio','dubbing','klonen'],
    use_cases: ['Audio-Inhalte erstellen','Präsentationsvertonung','Sprachen lernen','Barrierefreiheit'],
    pricing_model: 'freemium', external_url: 'https://elevenlabs.io', logo_domain: 'elevenlabs.io',
    quick_win: 'Zusammenfassung reinkopieren, Stimme wählen, MP3 runterladen — kostenlos und in 2 Minuten.',
  },
  {
    type: 'tool', status: 'published',
    title: 'Super Whisper', slug: 'super-whisper',
    summary: 'Mac-App für systemweite Sprach-zu-Text-Eingabe mit einem Hotkey — diktiere direkt in jede App, auch vollständig offline.',
    content: `## Was ist Super Whisper?\nSuper Whisper ist eine macOS/iOS-App die per globalem Hotkey (⌥ + Space) systemweit Spracheingabe in Text umwandelt — in jedem Programm: Slack, Mail, Word, Code-Editoren.\n\n## Was kann es besonders gut?\n- Systemweit per Hotkey: in jeder App aktivierbar ohne Fenster-Wechsel\n- Vollständig offline mit lokalen Whisper-Modellen — keine Cloud, kein Datenschutzproblem\n- Custom AI-Modi: "Academic", "Formal Email" — Output wird automatisch entsprechend formatiert\n- 100+ Sprachen inklusive Übersetzung direkt beim Diktieren ins Englische\n- Wählbare Backend-Modelle: GPT, Claude, Llama, Gemini\n\n## Pricing\nFree-Tier vorhanden.\nPro: 8 USD/Monat (günstiger jährlich).\nLifetime: 849 USD einmalig. 30-Tage-Geld-zurück-Garantie.\n\n## So nutzt du es als Studierender\nPerfekt für alle die schneller sprechen als tippen: E-Mails, Zusammenfassungen oder Gliederungen diktieren. Den Academic-Modus einrichten damit der Output direkt in sauberem Schriftdeutsch landet.`,
    category: 'Produktivität', tags: ['audio','diktat','mac','sprache','whisper','offline'],
    use_cases: ['Notizen diktieren','E-Mails schreiben','Texte verfassen','Barrierefreiheit'],
    pricing_model: 'freemium', external_url: 'https://superwhisper.com', logo_domain: 'superwhisper.com',
    quick_win: 'App installieren, ⌥ + Space drücken, E-Mail oder Gliederung diktieren — direkt ins geöffnete Fenster.',
  },
  {
    type: 'tool', status: 'published',
    title: 'Otter.ai', slug: 'otter-ai',
    summary: 'Live-Transkription für Vorlesungen und Meetings — Sprecher werden unterschieden, Zusammenfassung und Key Points kommen automatisch.',
    content: `## Was ist Otter.ai?\nOtter.ai transkribiert Meetings und Vorlesungen in Echtzeit. Unterscheidet Sprecher, erstellt automatisch Zusammenfassungen und kann sich selbstständig in Zoom, Teams oder Google Meet einwählen.\n\n## Was kann es besonders gut?\n- Live-Transkription mit Sprecher-Diarization: wer sagt was — direkt lesbar\n- KI-Agent wählt sich automatisch ins Meeting ein ohne eigene Aufnahme\n- AI Chat über vergangene Transkripte: "Was hat der Professor zur Prüfung gesagt?"\n- Automatische Extraktion von Key Points und Entscheidungen\n- Alle Transkripte durchsuchbar und exportierbar\n\n## Pricing\nKostenlos: 300 Minuten/Monat, Zoom/Teams/Meet-Integration, 3 Dateiimporte lifetime.\nPro: 8,33 USD/Monat (jährlich) — 1.200 Min./Monat, bis 90 Min. pro Meeting.\nBusiness: 19,99 USD/Monat — unlimitierte Meetings, bis 4h pro Session.\n\n## So nutzt du es als Studierender\nOtter-Bot zur nächsten Online-Vorlesung einladen: Meeting-Link einfügen, Bot tritt bei. Danach vollständiges Skript + Zusammenfassung ohne eigene Mitschrift.`,
    category: 'Audio & Transkription', tags: ['transkription','meetings','vorlesungen','live','zusammenfassung'],
    use_cases: ['Vorlesungen transkribieren','Meeting-Protokolle','Mitschriften','Nachbereitung'],
    pricing_model: 'freemium', external_url: 'https://otter.ai', logo_domain: 'otter.ai',
    quick_win: 'Otter-Bot zur nächsten Zoom-Vorlesung einladen → nach der Stunde vollständiges Transkript + Zusammenfassung.',
  },
  {
    type: 'tool', status: 'published',
    title: 'Elicit', slug: 'elicit',
    summary: 'KI-Assistent für akademische Literaturrecherche — durchsucht 125 Millionen Paper und extrahiert strukturiert Daten aus Studien.',
    content: `## Was ist Elicit?\nElicit durchsucht 125+ Millionen wissenschaftliche Paper mit semantischem Verständnis und extrahiert automatisch strukturierte Daten — für systematische Literaturreviews.\n\n## Was kann es besonders gut?\n- Semantische Suche: findet relevante Studien auch ohne exakte Keywords\n- Automatische Datenextraktion: Studiendesign, Stichprobengröße, Ergebnisse in Tabellen\n- Bis zu 1.000 relevante Paper in einer Abfrage identifizieren\n- Zitate auf Satzebene: jede Aussage verlinkt auf die Originalstelle im Paper\n- Bis zu 80% Zeitersparnis bei Literaturreviews\n\n## Pricing\nKostenlos: unbegrenzte Suche und Zusammenfassungen, 2 Reports/Monat.\nPro: 49 USD/Monat — 144 Reports/Jahr, 5.000 Paper pro Review, API-Zugang.\n\n## So nutzt du es als Studierender\nForschungsfrage eingeben (auf Englisch für beste Ergebnisse) — Elicit zeigt sofort eine Tabelle mit relevanten Studien, Methodik und Key Findings. 2 kostenlose Reports/Monat reichen für die meisten Seminararbeiten.`,
    category: 'Recherche', tags: ['wissenschaft','literatur','paper','recherche','akademisch'],
    use_cases: ['Literaturrecherche','Systematische Reviews','Seminararbeiten','Paper-Analyse'],
    pricing_model: 'freemium', external_url: 'https://elicit.com', logo_domain: 'elicit.com',
    quick_win: 'Forschungsfrage auf Englisch eingeben → Tabelle mit relevanten Studien, Methodik und Ergebnissen. 2 Reports/Monat kostenlos.',
  },
  {
    type: 'tool', status: 'published',
    title: 'Bolt.new', slug: 'bolt',
    summary: 'Schreib einen Satz, bekomm eine lauffähige Web-App — inkl. Frontend, Backend, Datenbank und Deployment-Link im Browser.',
    content: `## Was ist Bolt.new?\nBolt.new generiert aus einem Text-Prompt vollständige, lauffähige Web-Apps im Browser — inklusive Code, Abhängigkeiten und Deployment. Kein lokales Dev-Setup nötig.\n\n## Was kann es besonders gut?\n- Generiert Frontend + Backend + Datenbank in einer Session\n- Installiert NPM-Packages automatisch\n- Live-Preview direkt im Browser während der Generierung\n- Direktes Deployment zu Netlify, Vercel oder GitHub\n- Iteratives Editieren per Folge-Prompts auf bestehendem Code\n\n## Pricing\nKostenlos: 300.000 Tokens/Tag, 1M/Monat, Bolt-Branding auf gehosteten Sites.\nPro: 25 USD/Monat — kein Daily Cap, 10M Tokens/Monat, Custom Domains.\n\n## So nutzt du es als Studierender\nPerfekt für schnelle Prototypen oder Semesterprojekte ohne Dev-Setup. Prompt eingeben, App steht in 2-3 Minuten, Netlify-Deployment mit einem Klick. Kein Account nötig zum ersten Ausprobieren.`,
    category: 'Coding', tags: ['no-code','fullstack','deployment','prototyping','web'],
    use_cases: ['Prototypen bauen','Semesterprojekte','Portfolio','Web-Apps ohne Setup'],
    pricing_model: 'freemium', external_url: 'https://bolt.new', logo_domain: 'bolt.new',
    quick_win: 'bolt.new aufrufen, beschreiben was gebaut werden soll — App steht in 2-3 Minuten, "Deploy to Netlify" klicken.',
  },
  {
    type: 'tool', status: 'published',
    title: 'v0', slug: 'v0',
    summary: 'Prompt rein, React-Komponente raus — v0 von Vercel generiert produktionsreife UI-Code mit Tailwind und shadcn/ui.',
    content: `## Was ist v0?\nv0 von Vercel ist ein spezialisierter UI-Generator. Aus Text-Prompts entstehen fertige React-Komponenten mit Tailwind CSS und shadcn/ui — direkt in echte Projekte kopierbar.\n\n## Was kann es besonders gut?\n- Generiert produktionsreife React-Komponenten statt Dummy-Code\n- 1-Click-Deploy auf Vercel, GitHub-Sync\n- Design Mode: visuelle Editierung ohne erneutes Prompting\n- Figma-Import (ab Premium): UI aus Figma direkt in Code\n- Spezialisierte Modelle je nach Komplexität der Aufgabe\n\n## Pricing\nKostenlos: 5 USD monatliche Credits, max. 7 Messages/Tag.\nPremium: 30 USD/User/Monat.\nStudierenden-Programm: 1 Jahr kostenloses Premium bei verifizierbarer Uni-Mail (v0.dev/students).\n\n## So nutzt du es als Studierender\nKomponente per Prompt generieren, in bestehendes Next.js-Projekt kopieren. Auf v0.dev/students prüfen ob die Uni gelistet ist — dann 1 Jahr kostenlos.`,
    category: 'Coding', tags: ['react','ui','design','vercel','tailwind','komponenten'],
    use_cases: ['UI-Komponenten','Web-Apps','Prototypen','Frontend-Entwicklung'],
    pricing_model: 'freemium', external_url: 'https://v0.dev', logo_domain: 'vercel.com',
    quick_win: 'v0.dev/students aufrufen — Uni prüfen für 1 Jahr kostenlos. Sonst: Komponente prompten, in Next.js kopieren.',
  },
  {
    type: 'tool', status: 'published',
    title: 'Replit', slug: 'replit',
    summary: 'Browser-IDE mit KI-Agent der eigenständig Apps baut, debuggt und deployed — kein lokales Setup, 50+ Programmiersprachen.',
    content: `## Was ist Replit?\nReplit ist eine vollständige Browser-IDE mit integriertem KI-Agent. Der Agent baut eigenständig Apps aus einer Beschreibung — lauffähige Projekte mit Deployment, nicht nur Snippets.\n\n## Was kann es besonders gut?\n- Replit Agent baut eigenständige Apps aus einem Beschreibungs-Prompt\n- Sofortige Multiplayer-Kollaboration: mehrere Personen live im selben Code\n- Deployment mit einem Klick, kein separates Hosting\n- 50+ Sprachen und Frameworks: Python, Node, Go, Rust\n- Persistent Repls: Dateisystem bleibt auch nach Browser-Schließen erhalten\n\n## Pricing\nKostenlos: tägliche Agent-Credits, 10 AI Checkpoints/Monat, 1 deploybare App.\nCore: 25 USD/Monat — 5 Collaborateure, unbegrenzte Workspaces.\nPro: 100 USD/Monat — stärkste Modelle, 15 Collaborateure.\n\n## So nutzt du es als Studierender\nAccount anlegen, "Use Replit Agent", Projekt beschreiben — z.B. eine Flask-API oder ein Python-Skript. Agent erstellt alles und deployed automatisch. 10 Checkpoints/Monat kostenlos.`,
    category: 'Coding', tags: ['browser-ide','python','agent','deployment','kollaboration'],
    use_cases: ['Programmieren lernen','Semesterprojekte','Python-Skripte','Gruppen-Coding'],
    pricing_model: 'freemium', external_url: 'https://replit.com', logo_domain: 'replit.com',
    quick_win: 'Account erstellen → "Use Replit Agent" → Projekt beschreiben. Agent baut und deployed in Minuten, 10 Checkpoints/Monat kostenlos.',
  },
  {
    type: 'tool', status: 'published',
    title: 'Canva', slug: 'canva',
    summary: 'Design-Tool mit integrierter KI-Suite — Präsentationen in Minuten mit Magic Write, Dream Lab und Magic Design.',
    content: `## Was ist Canva?\nOnline-Design-Plattform mit Magic Studio. Texterstellung, Bildgenerierung und Design-Bearbeitung im Browser — für Präsentationen, Social Posts, Infografiken ohne Design-Vorkenntnisse.\n\n## Was kann es besonders gut?\n- Magic Write: KI generiert Captions und Präsentationstexte direkt im Design\n- Dream Lab: Bilder aus Text-Prompts in verschiedenen Stilen — kein Midjourney-Export nötig\n- Magic Edit / Eraser: Objekte aus Fotos entfernen, KI füllt den Hintergrund nahtlos\n- Magic Design: aus Prompt oder Bild automatisch eine komplette Präsentation generieren\n- Magic Expand: Bilder über ihre Grenzen generativ erweitern\n\n## Pricing\nKostenlos: begrenzte KI-Credits (~50/Monat).\nPro: ca. 15 USD/Monat — unbegrenzte KI-Generierungen, alle Magic Studio Tools.\nEducation: vollständig kostenlos für verifizierte Studierende mit Uni-Mail.\n\n## So nutzt du es als Studierender\nUnbedingt Education-Account aktivieren: canva.com/education → volle Pro-Features kostenlos.`,
    category: 'Bilder & Design', tags: ['design','praesentation','ki','magic-studio'],
    use_cases: ['Präsentationen','Social Media','Infografiken','Poster'],
    pricing_model: 'freemium', external_url: 'https://canva.com', logo_domain: 'canva.com',
    quick_win: 'canva.com/education aufrufen, Education-Account mit Uni-Mail aktivieren — volles Pro-Paket kostenlos inkl. aller KI-Features.',
  },
  {
    type: 'tool', status: 'published',
    title: 'Obsidian', slug: 'obsidian',
    summary: 'Lokale Notiz-App in der deine Gedanken bleiben — mit KI-Plugins chattest du mit deinem eigenen Wissensarchiv, ohne Cloud-Upload.',
    content: `## Was ist Obsidian?\nObsidian speichert Notizen als Markdown-Dateien lokal. Über 1.000 Community-Plugins erweiterbar — darunter starke KI-Integrationen die den eigenen Vault als Wissensbasis nutzen.\n\n## Was kann es besonders gut?\n- Smart Connections Plugin: zeigt semantisch verwandte Notizen in Echtzeit — ohne API-Key, vollständig lokal\n- Smart Chat / Copilot Plugin: chattet mit dem eigenen Vault als Kontext (RAG über eigene Notizen)\n- Lokale LLMs via Ollama: läuft komplett offline — ideal für datenschutzsensible Arbeiten\n- Vollständige Datenkontrolle: alles auf dem eigenen Rechner, kein Cloud-Lock-in\n- Verknüpfte Notizen als Graph: Zusammenhänge zwischen Themen visualisieren\n\n## Pricing\nApp: kostenlos für Einzelpersonen.\nSync: 4 USD/Monat für Geräte-Synchronisation.\nCopilot Plus Plugin: 14,99 USD/Monat für erweiterte Features (eigener API-Key nötig für Basis-Plugin).\n\n## So nutzt du es als Studierender\nObsidian installieren, Smart Connections Plugin installieren, Vault mit Mitschriften füllen. Nach ein paar Wochen zeigt die App automatisch was zusammenhängt — ein Second Brain für das Studium.`,
    category: 'Produktivität', tags: ['notizen','second-brain','lokal','markdown','ki-plugins'],
    use_cases: ['Notizen verwalten','Wissensaufbau','Prüfungsvorbereitung','Recherche-Archiv'],
    pricing_model: 'free', external_url: 'https://obsidian.md', logo_domain: 'obsidian.md',
    quick_win: 'Obsidian installieren → Community Plugins → "Smart Connections" aktivieren → verwandte Notizen erscheinen automatisch in der Sidebar.',
  },
  {
    type: 'tool', status: 'published',
    title: 'n8n', slug: 'n8n',
    summary: 'Open-Source-Automation mit nativen KI-Agenten-Nodes, lokalem LLM-Support und RAG-Workflows — selbst hostbar und kostenlos.',
    content: `## Was ist n8n?\nn8n ist eine Open-Source-Workflow-Automatisierungsplattform mit visuellen Node-Pipelines und nativen KI-Integrationen. Die Developer-freundlichere Alternative zu Zapier — selbst hostbar.\n\n## Was kann es besonders gut?\n- Native AI Agent Nodes: Conversational Agent, ReAct Agent direkt im visuellen Editor\n- Breite LLM-Unterstützung: OpenAI, Anthropic, Gemini, Mistral und lokale Modelle via Ollama\n- RAG-Workflows visuell zusammenstecken: Pinecone, Qdrant, Supabase als Vector Store Nodes\n- AI Transform Node: Datentransformation per natürlichsprachlichem Prompt statt Code\n- 9.000+ Community Workflow-Templates importierbar\n\n## Pricing\nSelf-Hosted (Community Edition): vollständig kostenlos, alle Features, eigene Infrastruktur (Docker oder Railway.app Free Tier).\nCloud Starter: ca. 20 USD/Monat.\n\n## So nutzt du es als Studierender\nn8n auf Railway.app kostenlos deployen. Dann den "Email Summarizer" Community-Template importieren und mit eigenem OpenAI-Key verknüpfen.`,
    category: 'Automation', tags: ['automation','open-source','self-hosted','ki-agenten','workflow'],
    use_cases: ['Workflows automatisieren','KI-Agenten bauen','Apps verbinden','Daten verarbeiten'],
    pricing_model: 'open_source', external_url: 'https://n8n.io', logo_domain: 'n8n.io',
    quick_win: 'n8n auf Railway.app (kostenloser Hobby-Plan) deployen → Community Template "Email Summarizer" importieren → OpenAI-Key eintragen.',
  },
  {
    type: 'tool', status: 'published',
    title: 'Zapier', slug: 'zapier',
    summary: 'No-Code-Automation mit dem größten App-Ökosystem (8.000+ Integrationen) und KI-Copilot der Workflows aus einem Satz baut.',
    content: `## Was ist Zapier?\nZapier ist die meistgenutzte No-Code-Automatisierungsplattform mit 8.000+ App-Integrationen. KI-Features seit 2023: Copilot baut Workflows aus einem Satz, AI Steps transformieren Daten per Prompt.\n\n## Was kann es besonders gut?\n- Zapier Copilot: Workflow aus einem Satz bauen — Copilot erstellt den Zap und erklärt jeden Schritt\n- AI Steps in Zaps: Text direkt im Workflow klassifizieren, zusammenfassen, übersetzen\n- Zapier Agents: eigenständige KI-Agenten die Tasks über mehrere Apps ausführen\n- Zapier MCP: verbindet Claude oder ChatGPT mit dem gesamten Zapier-Ökosystem\n- 8.000+ Integrationen: mehr App-Abdeckung als jede Alternative\n\n## Pricing\nKostenlos: 100 Tasks/Monat, Multi-Step Zaps, Zapier MCP enthalten.\nProfessional: ab ca. 19 USD/Monat für 750 Tasks.\n\n## So nutzt du es als Studierender\nIdeal als Einstieg in Automation ohne technisches Setup. Copilot aufrufen, Use Case beschreiben, Zap steht in 60 Sekunden.`,
    category: 'Automation', tags: ['automation','no-code','workflow','integration'],
    use_cases: ['Apps verbinden','Aufgaben automatisieren','Benachrichtigungen','Datei-Management'],
    pricing_model: 'freemium', external_url: 'https://zapier.com', logo_domain: 'zapier.com',
    quick_win: 'Copilot aufrufen, Use Case in einem Satz beschreiben — Zapier baut den Workflow. 100 Tasks/Monat kostenlos.',
  },
  {
    type: 'tool', status: 'published',
    title: 'DeepL', slug: 'deepl',
    summary: 'KI-Übersetzer auf proprietärem LLM — besonders präzise bei Deutsch↔Englisch, übersetzt Dokumente layouttreu.',
    content: `## Was ist DeepL?\nDeepL ist ein KI-Übersetzer auf Basis eines eigenen, von Sprachexperten kuratierten LLMs. Besonders stark bei Deutsch↔Englisch mit idiomatischen Formulierungen.\n\n## Was kann es besonders gut?\n- Überdurchschnittliche Qualität bei Deutsch↔Englisch: natürlichere Formulierungen als Konkurrenz\n- Dokumentenübersetzung mit Formaterhalt: PDF, Word, PowerPoint layouttreu übersetzt\n- Alternative Übersetzungen: einzelne Wörter anklicken für Synonyme und Stilalternativen\n- Glossar-System: eigene Fachbegriffe einpflegen für konsistente Übersetzungen\n- DeepL Write: separates Tool für Stil- und Grammatikverbesserung auf Deutsch und Englisch\n\n## Pricing\nKostenlos: 50.000 Zeichen/Monat, 1 Datei/Monat — Texte können für Training genutzt werden.\nIndividual: 8,74 USD/Monat (jährlich) — 300.000 Zeichen, kein Training mit eigenen Texten.\n\n## So nutzt du es als Studierender\nEnglischsprachige Paper-PDF direkt hochladen — in Sekunden vollständig übersetzt mit erhaltenem Layout.`,
    category: 'Schreiben & Chat', tags: ['übersetzen','deutsch','englisch','dokumente'],
    use_cases: ['Texte übersetzen','Papers lesen','Hausarbeiten überarbeiten','Fachbegriffe'],
    pricing_model: 'freemium', external_url: 'https://deepl.com', logo_domain: 'deepl.com',
    quick_win: 'PDF oder Word-Datei direkt auf deepl.com hochladen — in Sekunden layouttreu übersetzt. Sätze anklicken für Stilalternativen.',
  },
  {
    type: 'tool', status: 'published',
    title: 'Runway', slug: 'runway',
    summary: 'Browser-basierte KI-Videoplattform — generiert Videos aus Text oder Bild, Platz 1 im Video Arena Leaderboard (Stand April 2026).',
    content: `## Was ist Runway?\nBrowser-basierte KI-Plattform für Video-Generierung und -bearbeitung. Das Gen-4.5-Modell belegt Platz 1 im Video Arena Leaderboard (vor Google und OpenAI, Stand April 2026).\n\n## Was kann es besonders gut?\n- Text-to-Video: hochauflösende Clips bis 10 Sekunden aus Textbeschreibungen\n- Image-to-Video: Standbild als Ausgangspunkt, KI animiert daraus eine Sequenz\n- Konsistente Charaktere: ein Referenzbild hält eine Figur über mehrere Szenen identisch\n- Act-Two: Gesichtsmimik und Bewegungen auf KI-Charaktere übertragen\n- Vollständig im Browser, kein lokales Setup\n\n## Pricing\nKostenlos: 125 Credits einmalig (nicht nachfüllbar), Watermark, kein Gen-4-Zugang.\nStandard: 15 USD/Monat — 625 Credits, kein Watermark.\nPro: 35 USD/Monat — 2.250 Credits, Custom Voices.\n\n## So nutzt du es als Studierender\nFür Videoprojekte, Präsentations-Opener oder kreative Semesterarbeiten. Die 125 Gratis-Credits reichen für ca. 10-15 Test-Clips.`,
    category: 'Bilder & Design', tags: ['video','ki-generierung','animation','kreativ'],
    use_cases: ['Video-Projekte','Präsentationen','Kreative Semesterarbeiten','Prototypen'],
    pricing_model: 'freemium', external_url: 'https://runwayml.com', logo_domain: 'runwayml.com',
    quick_win: 'Im Free-Plan einloggen, "Text to Video" wählen, Szene beschreiben — 125 Gratis-Credits für ca. 10 Test-Clips.',
  },
  {
    type: 'tool', status: 'published',
    title: 'Suno', slug: 'suno',
    summary: 'KI-Musikgenerierung aus einem Prompt — vollständige Songs mit Gesang, Instrumenten und Lyrics in Sekunden, kein Vorwissen nötig.',
    content: `## Was ist Suno?\nSuno generiert aus Textprompts vollständige Songs: Gesang, Instrumentierung, Lyrics und Songstruktur. 10 Songs täglich kostenlos, kein Vorwissen in Musikproduktion nötig.\n\n## Was kann es besonders gut?\n- Vollständige Songs aus einem Satz — Stil, Tempo, Stimmung per Prompt steuerbar\n- Custom Lyrics: eigene Texte eintippen, Suno vertont automatisch\n- Song-Fortsetzungen: bestehende Clips verlängern oder Variationen generieren\n- Täglich 50 Credits (ca. 10 Songs) kostenlos ohne Abo\n- V5 (Pro) kaum von menschlich produziertem Audio zu unterscheiden\n\n## Pricing\nKostenlos: 50 Credits/Tag täglich neu (ca. 10 Songs), kein Abo nötig, keine kommerziellen Rechte.\nPro: 10 USD/Monat — V5-Zugang, 2.500 Credits/Monat, kommerzielle Rechte.\nHinweis: Laufender Rechtsstreit mit Plattenlabels wegen Trainingsdaten — für kommerzielle Nutzung beachten.\n\n## So nutzt du es als Studierender\nFür Videoprojekte, Podcast-Intros oder Präsentations-Soundtracks. Täglich 10 Songs kostenlos, kein Setup nötig.`,
    category: 'Audio & Transkription', tags: ['musik','audio','generierung','kreativ','songs'],
    use_cases: ['Video-Soundtracks','Podcast-Intros','Kreative Projekte','Präsentationen'],
    pricing_model: 'freemium', external_url: 'https://suno.com', logo_domain: 'suno.com',
    quick_win: 'Auf suno.com einloggen, Stil und Stimmung beschreiben — fertiger Song in 30 Sekunden. 10 Songs täglich kostenlos.',
  },
]

async function main() {
  console.log('Updating existing tools...')
  for (const update of updates) {
    const { error } = await supabase
      .from('content_items')
      .update({ content: update.content })
      .eq('slug', update.slug)
    if (error) console.error(`Error updating ${update.slug}:`, error.message)
    else console.log(`✓ Updated ${update.slug}`)
  }

  console.log('\nInserting new tools...')
  for (const tool of newTools) {
    const { error } = await supabase
      .from('content_items')
      .upsert(tool, { onConflict: 'slug' })
    if (error) console.error(`Error inserting ${tool.slug}:`, error.message)
    else console.log(`✓ Inserted ${tool.title}`)
  }

  console.log('\nDone!')
}

main()
