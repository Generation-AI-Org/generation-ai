# Generation AI — Voice & Tone

> Wie wir schreiben. Source of Truth für alle Texte in Website, Apps, Mails, Social, Decks.
> Version 1.0 · 2026-04-18

---

## Brand-Ton: "konfident-casual"

Wir schreiben, wie ein konfidentes Mitte-20er-Startup im DACH-Raum reden würde. Nicht steif wie Corporate. Nicht plump wie Kumpel-Marketing. Dazwischen — mit Substanz.

**Claim:** Wir wollen geilen Shit machen und wissen was wir tun. Das hört man auch.

### Grundprinzipien

1. **Du** überall — auch bei Business-Kontakten
2. **Denglisch erwünscht** wo natürlich — "Let's go", "cool", "fair enough", "okay"
3. **Klare Sätze**, keine Corporate-Phrasen
4. **Selbstbewusst statt entschuldigend** — "Passt, gespeichert!" > "Erfolgreich gespeichert."
5. **Kurz gewinnt** — jedes Wort muss arbeiten
6. **Ehrlich bei Fehlern** — "Ups, da ist was schiefgelaufen" > "Ein Fehler ist aufgetreten"
7. **Deutsch mit echten Umlauten** — ö/ä/ü/ß, nie oe/ae/ue/ss
8. **Tech-Terminologie Englisch lassen** — Agent, Chat, Tool, Dashboard, Feature, Onboarding

### Interjektionen als Brand-Signatur

Diese Wörter sind unsere Signatur. Sparsam einsetzen (max 1 pro Message):

- **"Ups"** — bei Fehlern, die uns passieren (Server-Errors)
- **"Hmm"** — bei User-Input-Fehlern, freundlich korrigierend
- **"Passt"** — bei Success-Bestätigungen, selbstsicher
- **"Let's go"** — bei Motivations-Momenten (Onboarding fertig, Account aktiviert)

### Emoji-Policy

| Kontext | Erlaubt? | Regel |
|---|---|---|
| UI / Buttons / Labels | ❌ nein | Icons statt Emojis |
| Website-Body | ❌ nein (außer explizit nötig) | Ruhiges Interface-Feel |
| Auth / Utility-Mails | ⚠️ nur funktional | 👋 in Welcome-Mail ersetzt "Hallo", sonst nichts |
| Marketing-Mails | ✅ sparsam | Max 1 pro Mail, ersetzt Wort, nicht Dekor |
| Social-Posts | ✅ sparsam | Max 1–2 pro Post, funktional |
| Intern (Slack, Docs) | — | Egal, hier sind wir nicht der Brand |

**Regel:** Emojis dürfen **ersetzen**, nie **dekorieren**. Kein "Jetzt anmelden! 🚀🔥✨"

### Was wir nie sagen

- ❌ "Leider" (Corporate-Floskel)
- ❌ "Bitte haben Sie Verständnis" (passiv-aggressiv)
- ❌ "Wir freuen uns, Ihnen mitteilen zu dürfen..."
- ❌ "Erfolgreich" vor jedem Verb ("Erfolgreich gespeichert" → einfach "Gespeichert" oder "Passt")
- ❌ "Ein Fehler ist aufgetreten" (cold, uninformativ)
- ❌ "Möchten Sie" (zu formell — "Willst du" oder direkter Imperativ)
- ❌ Ausrufezeichen in Button-Labels ("Jetzt loslegen!" → "Loslegen")

---

## Microcopy-Library

### Kernsituationen (verbindlich)

| Kontext | Text |
|---|---|
| **Welcome-Mail Betreff** | "Willkommen bei Generation AI 👋" |
| **Welcome-Mail Body** | "Hey [Name], schön dass du da bist. So geht's weiter: …" |
| **CTA-Button (bestätigen)** | "E-Mail bestätigen" |
| **Empty-State** | "Hier ist noch nichts. Leg los mit deinem ersten Tool." |
| **Error (Server)** | "Ups, da ist was schiefgelaufen. Probier's nochmal!" |
| **Error (User-Input)** | "Hmm, die Mail-Adresse passt noch nicht ganz." |
| **Success (neutral)** | "Passt, gespeichert!" |
| **Success (großer Moment)** | "Dein Account ist bereit. Let's go!" |
| **Loading** | "Einen Moment…" |
| **Bestätigung destruktiv** | "Sicher? Das lässt sich nicht rückgängig machen." |

### Button-Labels

Buttons sind **functional, kurz, verb-first**:

| Action | Label |
|---|---|
| Bestätigen / Speichern | "E-Mail bestätigen" / "Speichern" / "Änderungen übernehmen" |
| Abbrechen | "Abbrechen" (nicht "Zurück") |
| Löschen | "Löschen" (nie "Unwiderruflich entfernen") |
| Weiter / Next | "Weiter" |
| Zurück | "Zurück" |
| Schließen | "Schließen" |
| Anmelden | "Anmelden" (nicht "Jetzt anmelden") |
| Registrieren | "Account anlegen" |
| Passwort zurücksetzen | "Link schicken" |
| Mehr erfahren | "Mehr erfahren" |

**Regel:** Keine Ausrufezeichen in Buttons. Keine Emojis in Buttons. Keine Worte wie "einfach", "schnell", "jetzt", "hier".

### Passwörter + Auth

| Kontext | Text |
|---|---|
| Passwort-Reset angefordert | "Check deine Mail — wir haben dir einen Link geschickt." |
| Passwort-Reset Mail Betreff | "Neues Passwort für Generation AI" |
| Passwort-Reset Mail Body | "Hey [Name], klick auf den Button, um ein neues Passwort zu setzen. Der Link gilt 60 Minuten." |
| Magic-Link Betreff | "Dein Anmelde-Link" |
| Magic-Link Body | "Hey [Name], hier ist dein Login-Link. Klick drauf und du bist drin." |
| Passwort zu schwach | "Das Passwort ist noch zu kurz — mindestens 8 Zeichen." |
| Passwörter stimmen nicht überein | "Die beiden Passwörter sind nicht gleich." |
| Falsches Passwort | "Das Passwort passt nicht. Probier's nochmal." |

### Session + Access

| Kontext | Text |
|---|---|
| Nicht eingeloggt | "Du musst angemeldet sein, um hier weiterzumachen." |
| Session abgelaufen | "Deine Session ist abgelaufen. Log dich nochmal kurz ein." |
| Zugriff verweigert | "Dieser Bereich ist nicht für dich freigeschaltet." |

### Forms + Validierung

| Kontext | Text |
|---|---|
| Pflichtfeld leer | "Das Feld darf nicht leer sein." |
| Email ungültig | "Hmm, die Mail-Adresse passt noch nicht ganz." |
| Zu viele Zeichen | "Maximal [N] Zeichen." |
| Zu wenige Zeichen | "Mindestens [N] Zeichen." |
| URL ungültig | "Das sieht nicht nach einer URL aus." |

### Toasts / Feedback

| Kontext | Text |
|---|---|
| Gespeichert | "Passt, gespeichert!" |
| Kopiert in Zwischenablage | "Kopiert." |
| Link geteilt | "Link ist unterwegs." |
| Mail verschickt | "Mail ist raus." |
| Änderung rückgängig | "Rückgängig gemacht." |

### Mails — Strukturelemente

| Element | Muster |
|---|---|
| Begrüßung (Welcome) | "Hey [Name], schön dass du da bist." |
| Begrüßung (generic) | "Hey [Name]," |
| Abschluss (casual) | "— Das Team von Generation AI" |
| Abschluss (Utility) | "— Generation AI" |
| Preview-Text Welcome | "Schön dass du da bist. Hier geht's weiter." |
| Preview-Text Reset | "Setz dein Passwort in 60 Minuten zurück." |
| Preview-Text Magic-Link | "Dein Login-Link, gültig 15 Minuten." |

---

## Sprach-Policy

### Primärsprache

**Deutsch** mit korrekten Umlauten (ö/ä/ü/ß). Niemals Umschrift zu oe/ae/ue/ss.

### Englisch wann erlaubt

- **Tech-Terminologie**: Agent, Chat, Tool, Dashboard, Feature, Onboarding, Community, Support, Login, Account, User, Password, Link — nicht zwangseindeutschen
- **Social-Posts an internationales Publikum**: LinkedIn-Posts an Partner dürfen in Englisch sein
- **Denglisch-Phrases** im Brand-Ton: "Let's go", "cool", "okay", "fair enough" — wenn sie natürlich fließen

### Genderformen

- **Neutral formulieren** wenn möglich ("Studierende" statt "Studenten", "Teammitglieder" statt "Teammitglieder:innen")
- **Kein Binnen-I, kein Gender-Gap** — kollidiert mit lockerem Ton
- **Ausnahme**: Wenn Gruppe explizit Frauen+ ist ("Studentinnen bei Partner-Event X")

---

## Ansprache pro Rolle

| Rolle | Ansprache | Beispiel |
|---|---|---|
| Studierende (Haupt-Zielgruppe) | Du | "Du willst deine ersten KI-Projekte bauen?" |
| Universitäts-Partner | Du | "Wir zeigen euch, wie Generation AI zu eurem Curriculum passt." |
| Corporate-Partner | Du (wenn gemeinsam gepitcht), Sie (wenn sehr formaler Kontext) | Default Du — Ausnahme nur auf expliziten Wunsch |
| Investoren | Du (konfident, auf Augenhöhe) | "Hier ist, warum Generation AI skaliert." |
| Presse / Journalisten | Sie (Konvention) | "Gerne stellen wir Ihnen weitere Informationen bereit." |

**Hinweis Corporate-Partner:** Bei erstem Kontakt können wir uns auf Sie einstellen und im Verlauf auf Du wechseln, wenn der Gegenüber das macht.

---

## Tone-Check (vor Veröffentlichung)

Drei Fragen:

1. **Würde ich das mündlich so sagen?** Wenn nicht → umschreiben.
2. **Ist ein Wort entbehrlich?** → streichen.
3. **Klingt es entschuldigend, wo es konfident sein könnte?** → umdrehen.

---

## Changelog

- **2026-04-18 v1.0** — Erstfassung, Ton & Microcopy-Library nach Luca-Session.
