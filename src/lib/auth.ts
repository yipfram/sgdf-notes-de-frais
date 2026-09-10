import { betterAuth } from "better-auth";
import { createAuthMiddleware } from "better-auth/api";
import { organization } from "better-auth/plugins";
import { nextCookies } from "better-auth/next-js";
import { pool } from "@/lib/baseDeDonnees";
import { envoyerEmailInvitation } from "@/lib/emailInvitation";
import {
  envoyerEmailReinitialisationMotDePasse,
  envoyerEmailVerificationCompte,
} from "@/lib/emailAuthentification";
import { journal } from "@/lib/logger";
import { journaliserAuditAuthentification } from "@/lib/auditAuthentification";

export const auth = betterAuth({
  database: pool,
  baseURL: process.env.BETTER_AUTH_URL,
  secret: process.env.BETTER_AUTH_SECRET,
  trustedOrigins: [process.env.BETTER_AUTH_URL, process.env.APP_URL].filter(
    (origine): origine is string => Boolean(origine),
  ),
  rateLimit: {
    enabled: true,
    storage: "database",
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    minPasswordLength: 8,
    revokeSessionsOnPasswordReset: true,
    async sendResetPassword({ user, url }) {
      void envoyerEmailReinitialisationMotDePasse({
        destinataire: user.email,
        url,
      }).catch((erreur) => {
        journal.erreur("auth.reinitialisation_mot_de_passe_non_envoyee", {
          erreur,
        });
      });
    },
  },
  emailVerification: {
    autoSignInAfterVerification: true,
    async sendVerificationEmail({ user, url }) {
      void envoyerEmailVerificationCompte({
        destinataire: user.email,
        url,
      }).catch((erreur) => {
        journal.erreur("auth.verification_email_non_envoyee", { erreur });
      });
    },
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
  account: {
    accountLinking: { trustedProviders: ["google"] },
  },
  hooks: {
    after: createAuthMiddleware(async (contexte) => {
      const retour = contexte.context.returned;
      const codeErreur =
        typeof retour === "object" && retour !== null && "code" in retour
          ? retour.code
          : undefined;
      const statutErreur =
        typeof retour === "object" && retour !== null && "statusCode" in retour
          ? retour.statusCode
          : undefined;
      journaliserAuditAuthentification({
        chemin: contexte.path,
        resultat:
          typeof codeErreur === "string" ||
          (typeof statutErreur === "number" && statutErreur >= 400)
            ? "echec"
            : "succes",
        contexte: contexte.context,
        corps: contexte.body,
        codeErreur:
          typeof codeErreur === "string"
            ? codeErreur
            : typeof statutErreur === "number"
              ? `HTTP_${statutErreur}`
              : undefined,
      });
    }),
  },
  plugins: [
    organization({
      async sendInvitationEmail(data) {
        await envoyerEmailInvitation({
          destinataire: data.email,
          nomGroupe: data.organization.name,
          nomInvitant: data.inviter.user.name,
          invitationId: data.id,
        });
      },
    }),
    nextCookies(),
  ],
});
