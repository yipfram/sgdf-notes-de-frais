import nodemailer from "nodemailer";
import { getBranchColor } from "@/constants/configScoute";
import { estTypeMimePieceJointeAutorise } from "./attachments";
import {
  type PieceJointeDepense,
  type DetailDepense,
} from "@/constants/piecesJointes";

export interface DonneesEmail {
  emailUtilisateur: string;
  date: string;
  branche: string;
  typeDepense: string;
  montant: number;
  description?: string;
  piecesJointes: PieceJointeDepense[];
  detailsDepenses?: DetailDepense[];
}

// Configuration du transporteur SMTP générique
export const creerTransporteurEmail = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number.parseInt(process.env.SMTP_PORT || "587"),
    secure: process.env.SMTP_SECURE === "true", // true pour port 465, false pour les autres ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });
};

// Fonction pour envoyer un email avec pièce jointe
export const envoyerEmail = async (donnees: DonneesEmail) => {
  const transporteur = creerTransporteurEmail();

  // Vérifier la connexion SMTP
  try {
    await transporteur.verify();
    console.log("Serveur SMTP prêt à envoyer des emails");
  } catch (error) {
    console.error("Erreur de configuration SMTP:", error);
    throw new Error("Configuration SMTP invalide");
  }

  const {
    emailUtilisateur,
    date,
    branche,
    typeDepense,
    montant,
    description,
    piecesJointes,
    detailsDepenses,
  } = donnees;

  // Helper pour extraire le buffer depuis une data URL ou une chaîne base64 brute
  const extraireTamponPieceJointe = (entree: string, typeMime: string) => {
    if (!entree || !typeMime) {
      throw new Error("ATTACHMENT_MISSING");
    }

    let mime = typeMime;
    let partieBase64 = entree;

    // Format attendu: data:<type>;base64,<data>
    if (entree.startsWith("data:")) {
      const match = /^data:([a-zA-Z0-9.+/-]+);base64,(.*)$/.exec(entree);
      if (!match || match.length < 3) {
        throw new Error("ATTACHMENT_DATA_URL_INVALID");
      }
      mime = match[1];
      partieBase64 = match[2];
    } else if (entree.includes(",")) {
      // Cas dégradé: on prend tout après la première virgule
      const indexVirgule = entree.indexOf(",");
      partieBase64 =
        indexVirgule >= 0 ? entree.slice(indexVirgule + 1) : entree;
    }

    partieBase64 = partieBase64.replace(/\s+/g, "");
    if (!/^[A-Za-z0-9+/=]+$/.test(partieBase64)) {
      // Vérification minimale que la chaîne ressemble à du base64
      throw new Error("ATTACHMENT_NOT_BASE64");
    }

    if (!estTypeMimePieceJointeAutorise(mime)) {
      throw new Error("ATTACHMENT_MIME_NOT_ALLOWED");
    }

    try {
      const buffer = Buffer.from(partieBase64, "base64");
      if (buffer.length === 0) {
        throw new Error("ATTACHMENT_EMPTY_BUFFER");
      }
      return { buffer, mime };
    } catch (e) {
      console.error("Erreur conversion buffer pièce jointe:", e);
      throw new Error("ATTACHMENT_BUFFER_CONVERSION_FAILED");
    }
  };

  const piecesJointesAnalysees = piecesJointes.map((pieceJointe) => {
    try {
      const info = extraireTamponPieceJointe(
        pieceJointe.donneesBase64,
        pieceJointe.typeMime,
      );
      return {
        filename:
          pieceJointe.nomFichierNormalise ||
          pieceJointe.nomAffiche ||
          pieceJointe.nomFichierOriginal,
        content: info.buffer,
        contentType: info.mime,
      };
    } catch (e) {
      if (e instanceof Error && e.message.startsWith("ATTACHMENT_")) {
        throw new Error(`INVALID_ATTACHMENT:${e.message}`);
      }
      throw e;
    }
  });
  const escapeHtml = (value: string) =>
    value
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");

  const nomExpediteurDefaut =
    process.env.SMTP_FROM_NAME || "Factures carte procurement SGDF";
  const fromRaw = process.env.SMTP_FROM?.trim();
  const adresseRepli = process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER;

  if (!fromRaw && !adresseRepli) {
    throw new Error("SMTP_FROM_UNDEFINED");
  }

  const from = (() => {
    if (fromRaw) {
      // Allow full "Name <email>" syntax or simple email override
      if (fromRaw.includes("<") || fromRaw.includes(">")) {
        return fromRaw;
      }
      return {
        name: nomExpediteurDefaut,
        address: fromRaw,
      };
    }
    return {
      name: nomExpediteurDefaut,
      address: adresseRepli!,
    };
  })();

  const sujet = `Facture carte procurement - ${branche} - ${date}`;
  const couleurPrincipale = getBranchColor(branche);
  // Accent: If the primary color is a warm tone, keep gold, else use a light variant
  const accentColor = "#FBB042";
  const texteSurCouleurPrincipale = "#ffffff";
  const plusieursDepenses =
    piecesJointes.length > 1 &&
    detailsDepenses?.length === piecesJointes.length;

  const contenuHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background-color: ${couleurPrincipale}; color: ${texteSurCouleurPrincipale}; padding: 20px; text-align: center;">
  <h1 style="margin: 0; font-size: 24px;">📜 Facture carte procurement SGDF</h1>
        <p style="margin: 10px 0 0 0; opacity: 0.9;">La Guillotière</p>
      </div>

      <div style="padding: 30px; background-color: #f9f9f9;">
  <h2 style="color: ${couleurPrincipale}; margin-top: 0;">Nouvelle facture</h2>

        <div style="background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 10px 0; border-bottom: 1px solid #eee; font-weight: bold; color: #374151;">Date :</td>
              <td style="padding: 10px 0; border-bottom: 1px solid #eee; color: #374151;">${date}</td>
            </tr>
            ${
              plusieursDepenses
                ? `
            <tr>
              <td colspan="2" style="padding: 14px 0 6px; font-weight: bold; color: #374151;">Détail des dépenses :</td>
            </tr>
            ${detailsDepenses!
              .map(
                (detail, index) => `
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #eee; color: #374151;">${escapeHtml(piecesJointesAnalysees[index].filename)} — ${escapeHtml(detail.typeDepense)}</td>
              <td style="padding: 8px 0; border-bottom: 1px solid #eee; color: #374151; text-align: right;">${detail.montant} €</td>
            </tr>`,
              )
              .join("")}`
                : ""
            }
            <tr>
              <td style="padding: 10px 0; border-bottom: 1px solid #eee; font-weight: bold; color: #374151;">Branche :</td>
              <td style="padding: 10px 0; border-bottom: 1px solid #eee; color: #374151;">${branche}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; border-bottom: 1px solid #eee; font-weight: bold; color: #374151;">Type :</td>
              <td style="padding: 10px 0; border-bottom: 1px solid #eee; color: #374151;">${typeDepense}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; border-bottom: 1px solid #eee; font-weight: bold; color: ${couleurPrincipale};">Montant :</td>
              <td style="padding: 10px 0; border-bottom: 1px solid #eee; color: ${couleurPrincipale}; font-weight: bold; font-size: 18px;">${montant} €</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; border-bottom: 1px solid #eee; font-weight: bold; color: #374151;">Demandeur :</td>
              <td style="padding: 10px 0; border-bottom: 1px solid #eee; color: #374151;">${emailUtilisateur}</td>
            </tr>
            ${
              description
                ? `
            <tr>
              <td style="padding: 10px 0; font-weight: bold; color: #374151; vertical-align: top;">Description :</td>
              <td style="padding: 10px 0; color: #374151;">${escapeHtml(description)}</td>
            </tr>`
                : ""
            }
          </table>
        </div>

        <div style="background-color: ${accentColor}; color: ${couleurPrincipale}; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <strong>📎 ${piecesJointesAnalysees.length} pièce(s) jointe(s) :</strong>
          <ul style="margin: 8px 0 0 18px; padding: 0;">
            ${piecesJointesAnalysees.map((pieceJointe) => `<li>${escapeHtml(pieceJointe.filename)}</li>`).join("")}
          </ul>
        </div>

        <p style="color: #6B7280; font-size: 14px; margin-top: 30px;">
          Email envoyé automatiquement par l'application Factures carte procurement SGDF.
        </p>
      </div>
    </div>
  `;

  const contenuTexte = `
Facture carte procurement SGDF - La Guillotière

Nouvelle facture

Date : ${date}
Branche : ${branche}
${plusieursDepenses ? "Dépenses :" : `Type : ${typeDepense}`}
${
  plusieursDepenses
    ? detailsDepenses!
        .map(
          (detail, index) =>
            `- ${piecesJointesAnalysees[index].filename} — ${detail.typeDepense} : ${detail.montant} €`,
        )
        .join("\n")
    : ""
}
${plusieursDepenses ? "Total" : "Montant"} : ${montant} €
Demandeur : ${emailUtilisateur}
${description ? `Description : ${description}` : ""}

Pièce(s) jointe(s) (${piecesJointesAnalysees.length}) :
${piecesJointesAnalysees.map((pieceJointe) => `- ${pieceJointe.filename}`).join("\n")}

Email envoyé automatiquement par l'application Factures carte procurement SGDF.
  `;

  const optionsEmail = {
    from,
    to: process.env.NEXT_PUBLIC_TREASURY_EMAIL!,
    cc: emailUtilisateur,
    subject: sujet,
    text: contenuTexte,
    html: contenuHtml,
    // Mark the message as important/high priority for most email clients
    priority: "high" as const,
    headers: {
      Importance: "High",
      "X-Priority": "1 (Highest)",
      "X-MSMail-Priority": "High",
    },
    attachments: piecesJointesAnalysees,
  };

  try {
    // Some nodemailer typings present overloads that make the return type awkward;
    // cast to any so we can access messageId reliably at runtime.
    const info: any = await transporteur.sendMail(optionsEmail);
    console.log("Email envoyé avec succès:", info?.messageId);
    return { success: true, messageId: info?.messageId };
  } catch (error) {
    console.error("Erreur lors de l'envoi de l'email:", error);
    throw error;
  }
};
