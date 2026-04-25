// Team-Daten für /about-Team-Section.
//
// Quelle: UI-SPEC §Team (Zeile 159-172).
// Namen + Bios sind Placeholder bis Luca finale Copy liefert (CONTEXT Open Q 2).
// LinkedIn-URLs nachgeliefert (D-06) — bis dahin undefined → Icon wird nicht
// gerendert (siehe FounderCard conditional render).
// Member-Namen: Aktuelle 10-Leute-Liste noch nicht gelockt (CONTEXT Open Q 1).
// Bei Phase-27-Copy-Pass wird diese Datei mit finalen Namen + Fotos + URLs
// befüllt.

export type Founder = {
  name: string
  role: string
  bio: string
  linkedinUrl?: string
}

export type Member = {
  name: string
}

export const founders: Founder[] = [
  {
    name: "Janna Meister",
    role: "Co-Founder",
    bio: "Gründerin. Macht das strategische Big-Picture und die Partnerschaften.",
    linkedinUrl: undefined,
  },
  {
    name: "Simon Becker",
    role: "Co-Founder",
    bio: "Gründer. Verantwortet Community-Aufbau und Events.",
    linkedinUrl: undefined,
  },
]

// Placeholder-Namen für 10 aktive Mitglieder. Luca ersetzt in Phase 27.
export const members: Member[] = [
  { name: "Mitglied 1" },
  { name: "Mitglied 2" },
  { name: "Mitglied 3" },
  { name: "Mitglied 4" },
  { name: "Mitglied 5" },
  { name: "Mitglied 6" },
  { name: "Mitglied 7" },
  { name: "Mitglied 8" },
  { name: "Mitglied 9" },
  { name: "Mitglied 10" },
]
