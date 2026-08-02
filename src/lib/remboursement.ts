import { z } from "zod";
import { SGDF_BRANCHES, TYPES_DEPENSES } from "@/constants/configScoute";
import {
  MAX_ATTACHMENT_COUNT,
  MAX_ATTACHMENT_SIZE_BYTES,
  MAX_TOTAL_ATTACHMENTS_SIZE_BYTES,
  type ExpenseAttachment,
} from "@/constants/piecesJointes";
import { isAllowedAttachmentMimeType } from "@/lib/attachments";

export interface DepenseRemboursement {
  date: string;
  categorie: string;
  description: string;
  montant: number;
  piecesJointes: ExpenseAttachment[];
}

export interface DemandeRemboursement {
  branche: string;
  titulaireCompte: string;
  depenses: DepenseRemboursement[];
}

function validerPiecesJointes(
  piecesJointes: unknown[],
): ExpenseAttachment[] | null {
  if (piecesJointes.length === 0) return null;

  const piecesValidees: ExpenseAttachment[] = [];
  const base64Valide = /^[A-Za-z0-9+/=]+$/;

  for (const pieceJointe of piecesJointes) {
    if (!pieceJointe || typeof pieceJointe !== "object") return null;
    const piece = pieceJointe as Record<string, unknown>;
    const displayName = String(piece.displayName ?? "").trim();
    const mimeType = String(piece.mimeType ?? "")
      .trim()
      .toLowerCase();
    const base64Data = String(piece.base64Data ?? "")
      .trim()
      .replace(/\s+/g, "");
    const originalFileName = String(
      piece.originalFileName ?? displayName,
    ).trim();

    if (
      !displayName ||
      !originalFileName ||
      !base64Data ||
      !isAllowedAttachmentMimeType(mimeType) ||
      !base64Valide.test(base64Data)
    ) {
      return null;
    }

    const taille = Buffer.from(base64Data, "base64").length;
    if (taille <= 0 || taille > MAX_ATTACHMENT_SIZE_BYTES) return null;

    piecesValidees.push({
      displayName,
      mimeType,
      base64Data,
      originalFileName,
      normalizedFileName: originalFileName,
    });
  }

  return piecesValidees;
}

export function validerDemandeRemboursement(
  corps: unknown,
): DemandeRemboursement | null {
  const resultat = z
    .object({
      branche: z.string().trim(),
      titulaireCompte: z.string().trim().min(2).max(120),
      depenses: z
        .array(
          z.object({
            date: z.iso.date(),
            categorie: z.string(),
            description: z.string().trim().min(1).max(500),
            montant: z.union([z.string(), z.number()]),
            piecesJointes: z.array(z.unknown()).min(1),
          }),
        )
        .min(1),
    })
    .safeParse(corps);

  if (
    !resultat.success ||
    !SGDF_BRANCHES.includes(resultat.data.branche) ||
    resultat.data.depenses.length === 0
  ) {
    return null;
  }

  let nombrePiecesJointes = 0;
  let tailleTotale = 0;
  const depenses: DepenseRemboursement[] = [];

  for (const depense of resultat.data.depenses) {
    if (
      !TYPES_DEPENSES.includes(
        depense.categorie as (typeof TYPES_DEPENSES)[number],
      )
    )
      return null;
    const montant = Number(String(depense.montant).replace(",", "."));
    const piecesJointes = validerPiecesJointes(depense.piecesJointes);
    if (!Number.isFinite(montant) || montant <= 0 || !piecesJointes)
      return null;

    nombrePiecesJointes += piecesJointes.length;
    tailleTotale += piecesJointes.reduce(
      (total, pieceJointe) =>
        total + Buffer.from(pieceJointe.base64Data, "base64").length,
      0,
    );
    if (
      nombrePiecesJointes > MAX_ATTACHMENT_COUNT ||
      tailleTotale > MAX_TOTAL_ATTACHMENTS_SIZE_BYTES
    )
      return null;

    depenses.push({
      date: depense.date,
      categorie: depense.categorie,
      description: depense.description,
      montant,
      piecesJointes,
    });
  }

  return {
    branche: resultat.data.branche,
    titulaireCompte: resultat.data.titulaireCompte,
    depenses,
  };
}

function echapperCsv(valeur: string | number): string {
  return `"${String(valeur).replace(/"/g, '""')}"`;
}

export function genererCsvRemboursement(demande: DemandeRemboursement): string {
  const entete = [
    "Date",
    "Branche",
    "Categorie",
    "Description",
    "Montant EUR",
    "Justificatifs",
  ];
  const lignes = demande.depenses.map((depense) => [
    depense.date,
    demande.branche,
    depense.categorie,
    depense.description,
    depense.montant.toFixed(2).replace(".", ","),
    depense.piecesJointes
      .map((pieceJointe) => pieceJointe.normalizedFileName)
      .join(", "),
  ]);

  return `\uFEFF${[entete, ...lignes].map((ligne) => ligne.map(echapperCsv).join(";")).join("\r\n")}`;
}
