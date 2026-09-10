export const TYPES_DEPENSES = [
  "Alimentation, Intendance",
  "Achat Petit Materiel",
  "Achat Materiel PÈdagogique",
  "Transport collectif Train",
  "Transport collectif : en Autocar",
  "Transport collectif en commun (RER, metro, Tram, bus, etc.)",
  "Medecin, Pharmacie",
  "Hebergement",
  "Achat Gros Materiel",
  "Participation Activites",
  "Carburants",
  "Peage-Parking",
  "Autres",
] as const;

export type TypeDepense = (typeof TYPES_DEPENSES)[number];
