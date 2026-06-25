// ##### DEPENSES
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

// ##### BRANCHES
export const COULEURS_BRANCHES: Record<string, string> = {
  // 'Pionniers-Caravelles': '#E30613',
  Scouts: "#0072CE",
  Guides: "#0072CE",
  Louveteaux: "#F28C00",
  Jeannettes: "#F28C00",
  Compagnons: "#00A19A",
  Farfadets: "#6CC24A",
  Groupe: "#1E3A8A",
  "Piok Saône": "#EB1B2A",
  "Piok Rhône": "#D20510",
};

export const BRANCHES_ASC = [
  "Farfadets",
  "Louveteaux",
  "Jeannettes",
  "Scouts",
  "Guides",
  "Piok Saône",
  "Piok Rhône",
  "Compagnons",
  "Groupe",
] as const;

export const SGDF_BRANCHES = Object.keys(COULEURS_BRANCHES);

export function getBranchColor(branch: string, fallback = "#1E3A8A") {
  return COULEURS_BRANCHES[branch] || fallback;
}
