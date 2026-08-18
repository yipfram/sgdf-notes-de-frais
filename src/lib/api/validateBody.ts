import { jsonError } from "@/lib/api/utils";
import { isAllowedAttachmentMimeType } from "@/lib/attachments";
import {
  type ExpenseAttachment,
  type ExpenseDetail,
} from "@/constants/piecesJointes";
import {
  MAX_ATTACHMENT_COUNT,
  MAX_ATTACHMENT_SIZE_BYTES,
  MAX_TOTAL_ATTACHMENTS_SIZE_BYTES,
} from "@/constants/piecesJointes";

import type { EmailData } from "@/lib/email";
import type { NextResponse } from "next/server";
import { z } from "zod";
import { TYPES_DEPENSES } from "@/constants/configScoute";

export function validateBody(body: unknown): {
  emailData?: EmailData;
  error?: NextResponse;
} {
  const bodyParsed = z
    .object({
      userEmail: z.email(),
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
    console.error("Error while sending email:", bodyParsed.error.issues);
    return { error: jsonError("Données manquantes ou incorrecte", 400) };
  }

  const b = bodyParsed.data;

  // ─── Pièces jointes ───
  let attachments: unknown[] = b.attachments ?? [];

  // ─── Si il y a des images dans attachements ───
  if (attachments.length === 0 && b.imageBase64 && b.fileName) {
    attachments = [
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

  if (attachments.length === 0) {
    return { error: jsonError("Aucun justificatif fourni", 400) };
  }

  if (attachments.length > MAX_ATTACHMENT_COUNT) {
    return {
      error: jsonError(
        `Trop de fichiers (maximum ${MAX_ATTACHMENT_COUNT})`,
        400,
      ),
    };
  }

  // ─── Validate each attachment ───
  let totalSize = 0;
  const safeBase64Regex = /^[A-Za-z0-9+/=]+$/;
  const normalizedAttachments: ExpenseAttachment[] = [];

  for (let i = 0; i < attachments.length; i++) {
    const att = attachments[i];
    const numAtt = i + 1;

    if (!att || typeof att !== "object") {
      return { error: jsonError(`Justificatif invalide (#${numAtt})`, 400) };
    }

    const a = att as Record<string, unknown>;

    const displayName = String(a.displayName ?? "").trim();
    const mimeType = String(a.mimeType ?? "")
      .trim()
      .toLowerCase();
    const base64Data = String(a.base64Data ?? "")
      .trim()
      .replace(/\s+/g, "");
    const originalFileName = String(
      a.originalFileName ?? a.displayName ?? "",
    ).trim();
    const normalizedFileName = String(
      a.normalizedFileName ?? originalFileName ?? displayName ?? "",
    ).trim();

    if (
      !displayName ||
      !mimeType ||
      !base64Data ||
      !originalFileName ||
      !normalizedFileName
    ) {
      return { error: jsonError(`Justificatif incomplet (#${numAtt})`, 400) };
    }

    if (!isAllowedAttachmentMimeType(mimeType)) {
      return {
        error: jsonError(`Type de fichier non supporté (#${numAtt})`, 400),
      };
    }

    if (!safeBase64Regex.test(base64Data)) {
      return { error: jsonError(`Fichier encodé invalide (#${numAtt})`, 400) };
    }

    let size: number;
    try {
      size = Buffer.from(base64Data, "base64").length;
    } catch {
      return { error: jsonError(`Fichier corrompu (#${numAtt})`, 400) };
    }

    if (size <= 0) {
      return { error: jsonError(`Fichier vide (#${numAtt})`, 400) };
    }

    if (size > MAX_ATTACHMENT_SIZE_BYTES) {
      return { error: jsonError(`Fichier trop volumineux (#${numAtt})`, 400) };
    }

    totalSize += size;
    if (totalSize > MAX_TOTAL_ATTACHMENTS_SIZE_BYTES) {
      return {
        error: jsonError("Volume total des pièces jointes trop élevé", 400),
      };
    }

    normalizedAttachments.push({
      displayName,
      mimeType,
      base64Data,
      originalFileName,
      normalizedFileName,
    });
  }

  const isExpenseTypeValid = (expenseType: string) =>
    TYPES_DEPENSES.includes(expenseType as (typeof TYPES_DEPENSES)[number]);
  let amount: number;
  let expenseType: string;
  let expenseDetails: ExpenseDetail[] | undefined;

  if (normalizedAttachments.length > 1) {
    if (
      !b.expenseDetails ||
      b.expenseDetails.length !== normalizedAttachments.length
    ) {
      return { error: jsonError("Détails des dépenses incomplets", 400) };
    }

    expenseDetails = [];
    for (let i = 0; i < b.expenseDetails.length; i++) {
      const detail = b.expenseDetails[i];
      const detailAmount = Number(detail.amount);
      if (
        !isExpenseTypeValid(detail.expenseType) ||
        !Number.isFinite(detailAmount) ||
        detailAmount <= 0
      ) {
        return { error: jsonError(`Dépense invalide (#${i + 1})`, 400) };
      }
      expenseDetails.push({
        expenseType: detail.expenseType,
        amount: detailAmount,
      });
    }
    amount = expenseDetails.reduce((total, detail) => total + detail.amount, 0);
    expenseType = "Dépenses multiples";
  } else {
    amount = Number(b.amount);
    expenseType = b.expenseType?.trim() ?? "";
    if (!Number.isFinite(amount) || amount <= 0) {
      return { error: jsonError("Montant invalide", 400) };
    }
    if (!isExpenseTypeValid(expenseType)) {
      return { error: jsonError("Type de dépense invalide", 400) };
    }
  }

  return {
    emailData: {
      userEmail: b.userEmail,
      date: b.date,
      branch: b.branch,
      expenseType,
      amount,
      description: b.description ?? "",
      attachments: normalizedAttachments,
      expenseDetails,
    },
  };
}
