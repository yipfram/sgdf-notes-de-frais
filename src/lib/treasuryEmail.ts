import { creerTransporteurEmail } from "./email";

export async function envoyerEmailValidationTresorerie(parametres: {
  destinataire: string;
  nomGroupe: string;
  url: string;
}) {
  const transport = creerTransporteurEmail();
  const from =
    process.env.SMTP_FROM ||
    process.env.SMTP_FROM_EMAIL ||
    process.env.SMTP_USER;
  if (!from) throw new Error("SMTP_FROM_UNDEFINED");
  await transport.sendMail({
    from,
    to: parametres.destinataire,
    subject: `Confirmez la trésorerie du groupe ${parametres.nomGroupe}`,
    text: `Bonjour,\n\nUn responsable a rattaché cette adresse à la trésorerie du groupe ${parametres.nomGroupe}. Confirmez ce rattachement :\n${parametres.url}\n\nCe lien expire dans 48 heures. Si cette demande ne vous concerne pas, ignorez cet e-mail.`,
    html: `<p>Bonjour,</p><p>Un responsable a rattaché cette adresse à la trésorerie du groupe <strong>${parametres.nomGroupe}</strong>.</p><p><a href="${parametres.url}">Confirmer le rattachement</a></p><p>Ce lien expire dans 48 heures. Si cette demande ne vous concerne pas, ignorez cet e-mail.</p>`,
  });
}
