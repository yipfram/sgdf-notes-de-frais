import { NextRequest, NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { envoyerDemandeRemboursement } from "@/lib/emailRemboursement";
import { validerDemandeRemboursement } from "@/lib/remboursement";
import { RATE_LIMIT_COURT, RATE_LIMIT_LONG } from "@/constants/rateLimit";
import {
  jsonError,
  verifierConfigurationSmtp,
  verifierErreurSmtp,
} from "@/lib/api/utils";
import {
  reponseRateLimit,
  verifierOrigineRequete,
  verifierRateLimit,
} from "@/lib/api/securiteRequetes";

export async function POST(requete: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return jsonError("Non autorisé", 401);

    const erreurOrigine = verifierOrigineRequete(requete);
    if (erreurOrigine) return erreurOrigine;

    const limiteCourte = verifierRateLimit(
      `envoi-remboursement:court:${userId}`,
      RATE_LIMIT_COURT.limite,
      RATE_LIMIT_COURT.fenetreMs,
    );
    if (!limiteCourte.autorise)
      return reponseRateLimit(limiteCourte.attenteSecondes);
    const limiteLongue = verifierRateLimit(
      `envoi-remboursement:long:${userId}`,
      RATE_LIMIT_LONG.limite,
      RATE_LIMIT_LONG.fenetreMs,
    );
    if (!limiteLongue.autorise)
      return reponseRateLimit(limiteLongue.attenteSecondes);

    const erreurConfiguration = verifierConfigurationSmtp();
    if (erreurConfiguration) return erreurConfiguration;

    const corps = await requete.json().catch(() => null);
    const demande = validerDemandeRemboursement(corps);
    if (!demande) return jsonError("Données de remboursement invalides", 400);

    const clientClerk = await clerkClient();
    const utilisateur = await clientClerk.users.getUser(userId);
    const emailUtilisateur = utilisateur.primaryEmailAddress?.emailAddress;
    if (!emailUtilisateur)
      return jsonError("Adresse e-mail utilisateur introuvable", 400);

    await clientClerk.users.updateUser(userId, {
      privateMetadata: { titulaireCompte: demande.titulaireCompte },
    });

    const resultat = await envoyerDemandeRemboursement(
      demande,
      emailUtilisateur,
    );
    return NextResponse.json({ success: true, messageId: resultat.messageId });
  } catch (erreur) {
    console.error("Erreur lors de l'envoi du remboursement", erreur);
    return erreur instanceof Error
      ? verifierErreurSmtp(erreur)
      : jsonError("Erreur interne du serveur", 500);
  }
}
