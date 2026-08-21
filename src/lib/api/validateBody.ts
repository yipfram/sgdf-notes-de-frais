import { jsonError } from "@/lib/api/utils";
import { estTypeMimePieceJointeAutorise } from "@/lib/attachments";
import {
  type PieceJointeDepense,
  type DetailDepense,
} from "@/constants/piecesJointes";
import {
  MAX_ATTACHMENT_COUNT,
  MAX_ATTACHMENT_SIZE_BYTES,
  MAX_TOTAL_ATTACHMENTS_SIZE_BYTES,
} from "@/constants/piecesJointes";

import type { DonneesEmail } from "@/lib/email";
import type { NextResponse } from "next/server";
import { z } from "zod";
import { TYPES_DEPENSES } from "@/constants/configScoute";

export function validerCorpsRequete(body: unknown): {
  donneesEmail?: DonneesEmail;
  error?: NextResponse;
} {
  const bodyParsed = z
    .object({
      userEmail: z.string().email(),
      date: z.string(),
      branch: z.string(),
      expenseType: z.string().optional(),
      amount: z.union([z.string(), z.number()]).optional(),
      description: z.string().optional(),
      expenseDetails: z
        .array(
          z.object({
            expenseType: z.string(),
            amount: z.union([z.string(), z.number()]),
          }),
        )
        .optional(),
      attachments: z.array(z.any()).optional(),
      imageBase64: z.string().optional(),
      fileName: z.string().optional(),
    })
    .safeParse(body);

  if (!bodyParsed.success) {
    console.error(
      "Erreur lors de l'envoi de l'e-mail :",
      bodyParsed.error.issues,
    );
    return { error: jsonError("Données manquantes ou incorrecte", 400) };
  }

  const b = bodyParsed.data;

  // ─── Pièces jointes ───
  let piecesJointesBrutes: unknown[] = b.attachments ?? [];

  // ─── Si il y a des images dans attachements ───
  if (piecesJointesBrutes.length === 0 && b.imageBase64 && b.fileName) {
    piecesJointesBrutes = [
      {
        displayName: b.fileName,
        mimeType: "image/jpeg",
        base64Data: b.imageBase64.includes(",")
          ? b.imageBase64.slice(b.imageBase64.indexOf(",") + 1)
          : b.imageBase64,
        originalFileName: b.fileName,
        normalizedFileName: b.fileName,
      },
    ];
  }

  if (piecesJointesBrutes.length === 0) {
    return { error: jsonError("Aucun justificatif fourni", 400) };
  }

  if (piecesJointesBrutes.length > MAX_ATTACHMENT_COUNT) {
    return {
      error: jsonError(
        `Trop de fichiers (maximum ${MAX_ATTACHMENT_COUNT})`,
        400,
      ),
    };
  }

  // ─── Validation de chaque pièce jointe ───
  let tailleTotale = 0;
  const expressionBase64Sure = /^[A-Za-z0-9+/=]+$/;
  const piecesJointesNormalisees: PieceJointeDepense[] = [];

  for (let i = 0; i < piecesJointesBrutes.length; i++) {
    const pieceJointeBrute = piecesJointesBrutes[i];
    const numeroPieceJointe = i + 1;

    if (!pieceJointeBrute || typeof pieceJointeBrute !== "object") {
      return {
        error: jsonError(`Justificatif invalide (#${numeroPieceJointe})`, 400),
      };
    }

    const pieceJointe = pieceJointeBrute as Record<string, unknown>;

    const nomAffiche = String(pieceJointe.displayName ?? "").trim();
    const typeMime = String(pieceJointe.mimeType ?? "")
      .trim()
      .toLowerCase();
    const donneesBase64 = String(pieceJointe.base64Data ?? "")
      .trim()
      .replace(/\s+/g, "");
    const nomFichierOriginal = String(
      pieceJointe.originalFileName ?? pieceJointe.displayName ?? "",
    ).trim();
    const nomFichierNormalise = String(
      pieceJointe.normalizedFileName ?? nomFichierOriginal ?? nomAffiche ?? "",
    ).trim();

    if (
      !nomAffiche ||
      !typeMime ||
      !donneesBase64 ||
      !nomFichierOriginal ||
      !nomFichierNormalise
    ) {
      return {
        error: jsonError(`Justificatif incomplet (#${numeroPieceJointe})`, 400),
      };
    }

    if (!estTypeMimePieceJointeAutorise(typeMime)) {
      return {
        error: jsonError(
          `Type de fichier non supporté (#${numeroPieceJointe})`,
          400,
        ),
      };
    }

    if (!expressionBase64Sure.test(donneesBase64)) {
      return {
        error: jsonError(
          `Fichier encodé invalide (#${numeroPieceJointe})`,
          400,
        ),
      };
    }

    let size: number;
    try {
      size = Buffer.from(donneesBase64, "base64").length;
    } catch {
      return {
        error: jsonError(`Fichier corrompu (#${numeroPieceJointe})`, 400),
      };
    }

    if (size <= 0) {
      return { error: jsonError(`Fichier vide (#${numeroPieceJointe})`, 400) };
    }

    if (size > MAX_ATTACHMENT_SIZE_BYTES) {
      return {
        error: jsonError(
          `Fichier trop volumineux (#${numeroPieceJointe})`,
          400,
        ),
      };
    }

    tailleTotale += size;
    if (tailleTotale > MAX_TOTAL_ATTACHMENTS_SIZE_BYTES) {
      return {
        error: jsonError("Volume total des pièces jointes trop élevé", 400),
      };
    }

    piecesJointesNormalisees.push({
      nomAffiche,
      typeMime,
      donneesBase64,
      nomFichierOriginal,
      nomFichierNormalise,
    });
  }

  const estTypeDepenseValide = (typeDepense: string) =>
    TYPES_DEPENSES.includes(typeDepense as (typeof TYPES_DEPENSES)[number]);
  let montant: number;
  let typeDepense: string;
  let detailsDepenses: DetailDepense[] | undefined;

  if (b.expenseDetails && piecesJointesNormalisees.length < 2) {
    return {
      error: jsonError(
        "Une dépense unique doit contenir un type et un montant, sans détails de dépenses.",
        400,
      ),
    };
  }

  if (piecesJointesNormalisees.length > 1) {
    if (
      !b.expenseDetails ||
      b.expenseDetails.length !== piecesJointesNormalisees.length
    ) {
      return { error: jsonError("Détails des dépenses incomplets", 400) };
    }

    detailsDepenses = [];
    for (let i = 0; i < b.expenseDetails.length; i++) {
      const detail = b.expenseDetails[i];
      const montantDetail = Number(detail.amount);
      if (
        !estTypeDepenseValide(detail.expenseType) ||
        !Number.isFinite(montantDetail) ||
        montantDetail <= 0
      ) {
        return { error: jsonError(`Dépense invalide (#${i + 1})`, 400) };
      }
      detailsDepenses.push({
        typeDepense: detail.expenseType,
        montant: montantDetail,
      });
    }
    montant = detailsDepenses.reduce(
      (total, detail) => total + detail.montant,
      0,
    );
    typeDepense = "Dépenses multiples";
  } else {
    montant = Number(b.amount);
    typeDepense = b.expenseType?.trim() ?? "";
    if (!Number.isFinite(montant) || montant <= 0) {
      return { error: jsonError("Montant invalide", 400) };
    }
    if (!estTypeDepenseValide(typeDepense)) {
      return { error: jsonError("Type de dépense invalide", 400) };
    }
  }

  return {
    donneesEmail: {
      emailUtilisateur: b.userEmail,
      date: b.date,
      branche: b.branch,
      typeDepense,
      montant,
      description: b.description ?? "",
      piecesJointes: piecesJointesNormalisees,
      detailsDepenses,
    },
  };
}
