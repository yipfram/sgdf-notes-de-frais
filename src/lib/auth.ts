import { betterAuth } from "better-auth";
import { organization } from "better-auth/plugins";
import { nextCookies } from "better-auth/next-js";
import { pool } from "@/lib/baseDeDonnees";
import { envoyerEmailInvitation } from "@/lib/emailInvitation";

export const auth = betterAuth({
  database: pool,
  baseURL: process.env.BETTER_AUTH_URL,
  secret: process.env.BETTER_AUTH_SECRET,
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
  account: {
    accountLinking: { trustedProviders: ["google"] },
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
