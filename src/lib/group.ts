export const COULEURS_UNITES = [
  "#6CC24A",
  "#F28C00",
  "#0072CE",
  "#E30613",
  "#00A19A",
  "#1E3A8A",
] as const;

export interface UniteGroupe {
  id: string;
  label: string;
  color: string;
}

export const UNITES_PAR_DEFAUT: UniteGroupe[] = [
  ["farfadets", "Farfadets", "#6CC24A"],
  ["louveteaux-jeannettes", "Louveteaux-Jeannettes", "#F28C00"],
  ["scouts-guides", "Scouts-Guides", "#0072CE"],
  ["pionniers-caravelles", "Pionniers-Caravelles", "#E30613"],
  ["compagnons", "Compagnons", "#00A19A"],
  ["groupe", "Groupe", "#1E3A8A"],
].map(([id, label, color]) => ({ id, label, color }));

export function lireUnites(valeur: unknown): UniteGroupe[] {
  if (!Array.isArray(valeur)) return [];
  return valeur.filter(
    (unite): unite is UniteGroupe =>
      !!unite &&
      typeof unite === "object" &&
      typeof unite.id === "string" &&
      typeof unite.label === "string" &&
      typeof unite.color === "string",
  );
}

export function validerUnites(valeur: unknown): UniteGroupe[] | null {
  const unites = lireUnites(valeur);
  if (unites.length === 0 || unites.length > 30) return null;
  const identifiants = new Set<string>();
  for (const unite of unites) {
    if (!/^[a-z0-9-]{1,50}$/.test(unite.id) || identifiants.has(unite.id))
      return null;
    if (!unite.label.trim() || unite.label.trim().length > 80) return null;
    if (
      !COULEURS_UNITES.includes(unite.color as (typeof COULEURS_UNITES)[number])
    )
      return null;
    identifiants.add(unite.id);
  }
  return unites.map((unite) => ({ ...unite, label: unite.label.trim() }));
}
