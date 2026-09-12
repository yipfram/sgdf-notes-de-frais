import { echapperHtml, envoyerMail } from "./email";

export async function envoyerEmailValidationTresorerie(parametres: {
  destinataire: string;
  nomGroupe: string;
  url: string;
}) {
  await envoyerMail({
    to: parametres.destinataire,
    subject: `Confirmez la trésorerie du groupe ${parametres.nomGroupe}`,
    text: `Bonjour,\n\nUn responsable a rattaché cette adresse à la trésorerie du groupe ${parametres.nomGroupe}. Confirmez ce rattachement :\n${parametres.url}\n\nCe lien expire dans 48 heures. Si cette demande ne vous concerne pas, ignorez cet e-mail.`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #1E3A8A; color: #ffffff; padding: 20px; text-align: center;">
          <h1 style="margin: 0; font-size: 24px;">📜 Scouticket</h1>
          <p style="margin: 10px 0 0; opacity: 0.9;">${echapperHtml(parametres.nomGroupe)}</p>
        </div>

        <div style="padding: 30px; background-color: #f9f9f9;">
          <h2 style="color: #1E3A8A; margin-top: 0;">Confirmation de la trésorerie</h2>
          <p style="color: #374151; line-height: 1.5;">Bonjour,</p>
          <p style="color: #374151; line-height: 1.5;">Un responsable a rattaché cette adresse à la trésorerie du groupe <strong>${echapperHtml(parametres.nomGroupe)}</strong>.</p>

          <div style="background-color: #ffffff; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
            <p style="color: #374151; line-height: 1.5; margin: 0 0 18px;">Confirmez ce rattachement pour permettre aux membres du groupe d&apos;envoyer leurs notes de frais.</p>
            <a href="${echapperHtml(parametres.url)}" style="display: inline-block; background-color: #1E3A8A; color: #ffffff; padding: 12px 20px; border-radius: 6px; font-weight: bold; text-decoration: none;">Confirmer le rattachement</a>
          </div>

          <div style="background-color: #FBB042; color: #1E3A8A; padding: 15px; border-radius: 8px; margin: 20px 0; line-height: 1.5;">
            <strong>⏱️ Ce lien expire dans 48 heures.</strong>
          </div>

          <p style="color: #6B7280; font-size: 14px; line-height: 1.5; margin: 30px 0 0;">Si cette demande ne vous concerne pas, vous pouvez simplement ignorer cet e-mail.</p>
          <p style="color: #6B7280; font-size: 14px; margin: 20px 0 0;">E-mail envoyé automatiquement par Scouticket.</p>
        </div>
      </div>
    `,
  });
}
