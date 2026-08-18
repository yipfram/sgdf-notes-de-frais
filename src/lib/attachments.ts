import {
  ALLOWED_ATTACHMENT_MIME_TYPES,
  MIME_EXTENSION_MAP,
  type PieceJointeDepense,
} from "@/constants/piecesJointes";

export function estTypeMimePieceJointeAutorise(typeMime: string): boolean {
  return ALLOWED_ATTACHMENT_MIME_TYPES.includes(
    typeMime as (typeof ALLOWED_ATTACHMENT_MIME_TYPES)[number],
  );
}

export function assainirSegmentNomFichier(valeur: string): string {
  return valeur
    .replace(/[\\/:*?"<>|]/g, "-")
    .replace(/\s+/g, " ")
    .trim();
}

export function devinerExtension(
  typeMime: string,
  nomFichier?: string,
): string {
  if (MIME_EXTENSION_MAP[typeMime]) {
    return MIME_EXTENSION_MAP[typeMime];
  }
  if (nomFichier && nomFichier.includes(".")) {
    const extensionDuNom = nomFichier.split(".").pop()?.toLowerCase();
    if (extensionDuNom && /^[a-z0-9]+$/.test(extensionDuNom)) {
      return extensionDuNom;
    }
  }
  return "bin";
}

export function construireNomBasePieceJointe(parametres: {
  date: string;
  branch: string;
  expenseType: string;
  amount: string;
}): string {
  const typeCourt = parametres.expenseType
    ? parametres.expenseType.replace(/\s+/g, " ").trim()
    : "";
  const montantFormate = parametres.amount.replace(",", ".");
  return assainirSegmentNomFichier(
    `${parametres.date} - ${parametres.branch}${typeCourt ? " - " + typeCourt : ""} - ${montantFormate}`,
  );
}

export function construireNomsFichiersNormalises(
  piecesJointes: Array<
    Pick<PieceJointeDepense, "typeMime" | "nomFichierOriginal">
  >,
  parametres: {
    date: string;
    branch: string;
    expenseType: string;
    amount: string;
  },
): string[] {
  const nomBase = construireNomBasePieceJointe(parametres);
  const ajouterIndex = piecesJointes.length > 1;
  return piecesJointes.map((pieceJointe, index) => {
    const extension = devinerExtension(
      pieceJointe.typeMime,
      pieceJointe.nomFichierOriginal,
    );
    const suffixe = ajouterIndex
      ? ` - ${String(index + 1).padStart(2, "0")}`
      : "";
    return `${nomBase}${suffixe}.${extension}`;
  });
}
