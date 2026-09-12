import { echapperHtml, envoyerMail } from "@/lib/email";

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
  await envoyerMail({
    to: parametres.destinataire,
    subject: `Invitation à rejoindre ${parametres.nomGroupe} sur Scouticket`,
    text: `Bonjour,\n\n${parametres.nomInvitant} vous invite à rejoindre le groupe ${parametres.nomGroupe} sur Scouticket. Connectez-vous avec l’adresse invitée, puis acceptez l’invitation :\n${url}\n\nCe lien expire dans 48 heures. Si cette invitation ne vous concerne pas, ignorez cet e-mail.`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #1E3A8A; color: #ffffff; padding: 20px; text-align: center;">
          <h1 style="margin: 0; font-size: 24px;">📜 Scouticket</h1>
          <p style="margin: 10px 0 0; opacity: 0.9;">${echapperHtml(parametres.nomGroupe)}</p>
        </div>
        <div style="padding: 30px; background-color: #f9f9f9;">
          <h2 style="color: #1E3A8A; margin-top: 0;">Invitation à rejoindre le groupe</h2>
          <p style="color: #374151; line-height: 1.5;">Bonjour,</p>
          <p style="color: #374151; line-height: 1.5;"><strong>${echapperHtml(parametres.nomInvitant)}</strong> vous invite à rejoindre le groupe <strong>${echapperHtml(parametres.nomGroupe)}</strong> sur Scouticket.</p>
          <div style="background-color: #ffffff; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
            <p style="color: #374151; line-height: 1.5; margin: 0 0 18px;">Connectez-vous avec l’adresse invitée, puis acceptez cette invitation.</p>
            <a href="${echapperHtml(url.toString())}" style="display: inline-block; background-color: #1E3A8A; color: #ffffff; padding: 12px 20px; border-radius: 6px; font-weight: bold; text-decoration: none;">Accepter l’invitation</a>
          </div>
          <div style="background-color: #FBB042; color: #1E3A8A; padding: 15px; border-radius: 8px; margin: 20px 0; line-height: 1.5;"><strong>⏱️ Ce lien expire dans 48 heures.</strong></div>
          <p style="color: #6B7280; font-size: 14px; line-height: 1.5; margin: 30px 0 0;">Si cette invitation ne vous concerne pas, vous pouvez simplement ignorer cet e-mail.</p>
          <p style="color: #6B7280; font-size: 14px; margin: 20px 0 0;">E-mail envoyé automatiquement par Scouticket.</p>
        </div>
      </div>
    `,
  });
}
