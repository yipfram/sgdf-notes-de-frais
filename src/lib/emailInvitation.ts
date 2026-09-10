import { creerTransporteurEmail, echapperHtml } from "@/lib/email";

export async function envoyerEmailInvitation(parametres: {
  destinataire: string;
  nomGroupe: string;
  nomInvitant: string;
  invitationId: string;
}) {
  const urlApplication = process.env.APP_URL?.replace(/\/+$/, "");
  if (!urlApplication) throw new Error("APP_URL_UNDEFINED");
  const url = new URL("/invitation", urlApplication);
  url.searchParams.set("id", parametres.invitationId);
  const adresseExpediteur =
    process.env.SMTP_FROM ||
    process.env.SMTP_FROM_EMAIL ||
    process.env.SMTP_USER;
  if (!adresseExpediteur) throw new Error("SMTP_FROM_UNDEFINED");

  await creerTransporteurEmail().sendMail({
    from: adresseExpediteur,
    to: parametres.destinataire,
    subject: `Invitation à rejoindre ${parametres.nomGroupe} sur Scouticket`,
    text: `${parametres.nomInvitant} vous invite à rejoindre ${parametres.nomGroupe}. Ouvrez ce lien après vous être connecté avec Google : ${url}`,
    html: `<p>${echapperHtml(parametres.nomInvitant)} vous invite à rejoindre <strong>${echapperHtml(parametres.nomGroupe)}</strong> sur Scouticket.</p><p><a href="${echapperHtml(url.toString())}">Accepter l’invitation</a></p>`,
  });
}
