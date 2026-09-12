import nodemailer from "nodemailer";
import type { SendMailOptions } from "nodemailer";
import { z } from "zod";
import { estTypeMimePieceJointeAutorise } from "./attachments";
import {
  type PieceJointeDepense,
  type DetailDepense,
} from "@/constants/piecesJointes";
import { journal } from "@/lib/logger";

export interface DonneesEmailDepense {
  emailUtilisateur: string;
  date: string;
  branche: string;
  typeDepense: string;
  montant: number;
  description?: string;
  piecesJointes: PieceJointeDepense[];
  detailsDepenses?: DetailDepense[];
  groupe?: string;
  couleur?: string;
  emailTresorerie?: string;
}

const schemaTexteHtml = z
  .string()
  .transform((valeur) =>
    valeur
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;"),
  );

const schemaCouleurHtml = z.string().regex(/^#[0-9a-f]{6}$/i);

export const echapperHtml = (valeur: string) => schemaTexteHtml.parse(valeur);

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

function creerExpediteurEmail() {
  const adresseConfiguree = process.env.SMTP_FROM?.trim();
  const adresse =
    adresseConfiguree ||
    process.env.SMTP_FROM_EMAIL?.trim() ||
    process.env.SMTP_USER?.trim();

  if (!adresse) throw new Error("SMTP_FROM_UNDEFINED");

  const adresseDepuisFormatComplet = adresse.match(/<\s*([^<>\s]+)\s*>$/)?.[1];

  return {
    name: process.env.SMTP_FROM_NAME || "Scouticket",
    address: adresseDepuisFormatComplet || adresse,
  };
}

export async function envoyerMail(optionsEmail: Omit<SendMailOptions, "from">) {
  const transporteur = creerTransporteurEmail();

  try {
    await transporteur.verify();
    journal.info("smtp.connexion_verifiee");
  } catch (error) {
    journal.erreur("smtp.configuration_invalide", { error });
    throw new Error("Configuration SMTP invalide");
  }

  try {
    const info = await transporteur.sendMail({
      from: creerExpediteurEmail(),
      ...optionsEmail,
    });
    journal.info("smtp.email_envoye");
    return info;
  } catch (error) {
    journal.erreur("smtp.envoi_email_echoue", { erreur: error });
    throw error;
  }
}

// Compose et envoie l'e-mail de note de frais avec ses pièces jointes.
export const envoyerEmailDepense = async (donnees: DonneesEmailDepense) => {
  const {
    emailUtilisateur,
    date,
    branche,
    typeDepense,
    montant,
    description,
    piecesJointes,
    detailsDepenses,
    groupe = "Groupe scout",
    couleur = "#1E3A8A",
    emailTresorerie,
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
      journal.erreur("smtp.conversion_piece_jointe_echouee", { erreur: e });
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
  if (!emailTresorerie) throw new Error("TREASURY_EMAIL_UNDEFINED");
  const sujet = `Scouticket - ${groupe} - ${branche} - ${date}`;
  const resultatCouleur = schemaCouleurHtml.safeParse(couleur);
  const couleurPrincipale = resultatCouleur.success
    ? resultatCouleur.data
    : "#1E3A8A";
  // Accent: If the primary color is a warm tone, keep gold, else use a light variant
  const accentColor = "#FBB042";
  const texteSurCouleurPrincipale = "#ffffff";
  const plusieursDepenses =
    piecesJointes.length > 1 &&
    detailsDepenses?.length === piecesJointes.length;

  const contenuHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background-color: ${couleurPrincipale}; color: ${texteSurCouleurPrincipale}; padding: 20px; text-align: center;">
  <h1 style="margin: 0; font-size: 24px;">📜 Scouticket</h1>
        <p style="margin: 10px 0 0 0; opacity: 0.9;">${echapperHtml(groupe)}</p>
      </div>

      <div style="padding: 30px; background-color: #f9f9f9;">
  <h2 style="color: ${couleurPrincipale}; margin-top: 0;">Nouvelle facture</h2>

        <div style="background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 10px 0; border-bottom: 1px solid #eee; font-weight: bold; color: #374151;">Date :</td>
              <td style="padding: 10px 0; border-bottom: 1px solid #eee; color: #374151;">${echapperHtml(date)}</td>
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
              <td style="padding: 8px 0; border-bottom: 1px solid #eee; color: #374151;">${echapperHtml(piecesJointesAnalysees[index].filename)} — ${echapperHtml(detail.typeDepense)}</td>
              <td style="padding: 8px 0; border-bottom: 1px solid #eee; color: #374151; text-align: right;">${echapperHtml(String(detail.montant))} €</td>
            </tr>`,
              )
              .join("")}`
                : ""
            }
            <tr>
              <td style="padding: 10px 0; border-bottom: 1px solid #eee; font-weight: bold; color: #374151;">Branche :</td>
              <td style="padding: 10px 0; border-bottom: 1px solid #eee; color: #374151;">${echapperHtml(branche)}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; border-bottom: 1px solid #eee; font-weight: bold; color: #374151;">Type :</td>
              <td style="padding: 10px 0; border-bottom: 1px solid #eee; color: #374151;">${echapperHtml(typeDepense)}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; border-bottom: 1px solid #eee; font-weight: bold; color: ${couleurPrincipale};">Montant :</td>
              <td style="padding: 10px 0; border-bottom: 1px solid #eee; color: ${couleurPrincipale}; font-weight: bold; font-size: 18px;">${echapperHtml(String(montant))} €</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; border-bottom: 1px solid #eee; font-weight: bold; color: #374151;">Demandeur :</td>
              <td style="padding: 10px 0; border-bottom: 1px solid #eee; color: #374151;">${echapperHtml(emailUtilisateur)}</td>
            </tr>
            ${
              description
                ? `
            <tr>
              <td style="padding: 10px 0; font-weight: bold; color: #374151; vertical-align: top;">Description :</td>
              <td style="padding: 10px 0; color: #374151;">${echapperHtml(description)}</td>
            </tr>`
                : ""
            }
          </table>
        </div>

        <div style="background-color: ${accentColor}; color: ${couleurPrincipale}; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <strong>📎 ${echapperHtml(String(piecesJointesAnalysees.length))} pièce(s) jointe(s) :</strong>
          <ul style="margin: 8px 0 0 18px; padding: 0;">
            ${piecesJointesAnalysees.map((pieceJointe) => `<li>${echapperHtml(pieceJointe.filename)}</li>`).join("")}
          </ul>
        </div>

        <p style="color: #6B7280; font-size: 14px; margin-top: 30px;">
          Email envoyé automatiquement par Scouticket.
        </p>
      </div>
    </div>
  `;

  const contenuTexte = `
Scouticket - ${groupe}

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

Email envoyé automatiquement par Scouticket.
  `;

  const optionsEmail = {
    to: emailTresorerie,
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

  const info = await envoyerMail(optionsEmail);
  return { success: true, messageId: info.messageId };
};
