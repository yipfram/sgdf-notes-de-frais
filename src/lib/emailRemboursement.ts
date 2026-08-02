import { createEmailTransporter } from "@/lib/email";
import { getBranchColor } from "@/constants/configScoute";
import { isAllowedAttachmentMimeType } from "@/lib/attachments";
import {
  buildNormalizedFileNames,
  sanitizeFileNameSegment,
} from "@/lib/attachments";
import {
  genererCsvRemboursement,
  type DemandeRemboursement,
} from "@/lib/remboursement";

function echapperHtml(valeur: string): string {
  return valeur
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export async function envoyerDemandeRemboursement(
  demande: DemandeRemboursement,
  emailUtilisateur: string,
) {
  const transporteur = createEmailTransporter();
  await transporteur.verify();

  const piecesJointes = demande.depenses.flatMap((depense, indexDepense) => {
    const noms = buildNormalizedFileNames(depense.piecesJointes, {
      date: depense.date,
      branch: demande.branche,
      expenseType: depense.categorie,
      amount: depense.montant.toFixed(2),
    });
    return depense.piecesJointes.map((pieceJointe, indexPieceJointe) => {
      if (!isAllowedAttachmentMimeType(pieceJointe.mimeType))
        throw new Error("INVALID_ATTACHMENT: type MIME non autorisé");
      pieceJointe.normalizedFileName = `D${indexDepense + 1}-${noms[indexPieceJointe]}`;
      return {
        filename: pieceJointe.normalizedFileName,
        content: Buffer.from(pieceJointe.base64Data, "base64"),
        contentType: pieceJointe.mimeType,
      };
    });
  });
  const total = demande.depenses.reduce(
    (somme, depense) => somme + depense.montant,
    0,
  );
  const dateEnvoi = new Date().toISOString().slice(0, 10);
  const nomCsv = `demande-remboursement-${dateEnvoi}-${sanitizeFileNameSegment(demande.branche)}.csv`;
  const couleur = getBranchColor(demande.branche);
  const from =
    process.env.SMTP_FROM?.trim() ||
    process.env.SMTP_FROM_EMAIL ||
    process.env.SMTP_USER;
  if (!from) throw new Error("SMTP_FROM_UNDEFINED");

  const lignes = demande.depenses
    .map(
      (depense) =>
        `<tr><td>${echapperHtml(depense.date)}</td><td>${echapperHtml(depense.categorie)}</td><td>${echapperHtml(depense.description)}</td><td>${depense.montant.toFixed(2)} EUR</td></tr>`,
    )
    .join("");
  const html = `<div style="font-family:Arial,sans-serif;max-width:640px;margin:auto"><div style="background:${couleur};color:#fff;padding:20px"><h1 style="margin:0">Demande de remboursement SGDF</h1></div><div style="padding:20px"><p><strong>Branche :</strong> ${echapperHtml(demande.branche)}<br><strong>Titulaire du compte :</strong> ${echapperHtml(demande.titulaireCompte)}<br><strong>Demandeur :</strong> ${echapperHtml(emailUtilisateur)}</p><table style="width:100%;border-collapse:collapse"><thead><tr><th align="left">Date</th><th align="left">Catégorie</th><th align="left">Description</th><th align="left">Montant</th></tr></thead><tbody>${lignes}</tbody></table><p style="font-size:18px"><strong>Total : ${total.toFixed(2)} EUR</strong></p><p>Le fichier CSV et les justificatifs sont joints à cet e-mail.</p></div></div>`;

  const info = await transporteur.sendMail({
    from,
    to: process.env.NEXT_PUBLIC_TREASURY_EMAIL!,
    cc: emailUtilisateur,
    subject: `Demande de remboursement - ${demande.branche} - ${dateEnvoi}`,
    text: `Demande de remboursement\nBranche : ${demande.branche}\nTitulaire : ${demande.titulaireCompte}\nDemandeur : ${emailUtilisateur}\nTotal : ${total.toFixed(2)} EUR`,
    html,
    attachments: [
      {
        filename: nomCsv,
        content: genererCsvRemboursement(demande),
        contentType: "text/csv; charset=utf-8",
      },
      ...piecesJointes,
    ],
  });
  return { messageId: info.messageId };
}
