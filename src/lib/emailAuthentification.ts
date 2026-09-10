import { creerTransporteurEmail, echapperHtml } from "@/lib/email";

function expediteur() {
  const expediteurConfigure = process.env.SMTP_FROM?.trim();
  const adresse =
    expediteurConfigure ||
    process.env.SMTP_FROM_EMAIL ||
    process.env.SMTP_USER;
  if (!adresse) throw new Error("SMTP_FROM_UNDEFINED");
  if (expediteurConfigure?.includes("<") || expediteurConfigure?.includes(">"))
    return expediteurConfigure;

  return {
    name: process.env.SMTP_FROM_NAME || "Scouticket",
    address: adresse,
  };
}

async function envoyerEmailAuthentification(parametres: {
  destinataire: string;
  sujet: string;
  titre: string;
  message: string;
  url: string;
  libelleLien: string;
}) {
  await creerTransporteurEmail().sendMail({
    from: expediteur(),
    to: parametres.destinataire,
    subject: parametres.sujet,
    text: `${parametres.message}\n\n${parametres.libelleLien} : ${parametres.url}\n\nSi vous n’êtes pas à l’origine de cette demande, ignorez cet e-mail.`,
    html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;"><div style="background-color: #1E3A8A; color: #ffffff; padding: 20px; text-align: center;"><h1 style="margin: 0; font-size: 24px;">Scouticket</h1></div><div style="padding: 30px; background-color: #f9f9f9;"><h2 style="color: #1E3A8A;">${echapperHtml(parametres.titre)}</h2><p style="color: #374151; line-height: 1.5;">${echapperHtml(parametres.message)}</p><p style="margin: 24px 0;"><a href="${echapperHtml(parametres.url)}" style="display: inline-block; background-color: #1E3A8A; color: #ffffff; padding: 12px 20px; border-radius: 6px; font-weight: bold; text-decoration: none;">${echapperHtml(parametres.libelleLien)}</a></p><p style="color: #6B7280; font-size: 14px;">Si vous n’êtes pas à l’origine de cette demande, ignorez cet e-mail.</p></div></div>`,
  });
}

export function envoyerEmailVerificationCompte(parametres: {
  destinataire: string;
  url: string;
}) {
  return envoyerEmailAuthentification({
    ...parametres,
    sujet: "Confirmez votre adresse e-mail Scouticket",
    titre: "Confirmez votre adresse e-mail",
    message:
      "Confirmez votre adresse e-mail pour activer votre compte Scouticket.",
    libelleLien: "Confirmer mon adresse e-mail",
  });
}

export function envoyerEmailReinitialisationMotDePasse(parametres: {
  destinataire: string;
  url: string;
}) {
  return envoyerEmailAuthentification({
    ...parametres,
    sujet: "Réinitialisez votre mot de passe Scouticket",
    titre: "Réinitialisation du mot de passe",
    message:
      "Utilisez ce lien pour choisir un nouveau mot de passe Scouticket.",
    libelleLien: "Choisir un nouveau mot de passe",
  });
}
