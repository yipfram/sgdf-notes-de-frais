import { NextRequest, NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { envoyerEmail } from "@/lib/email";
import { jsonError, verifierErreurSmtp } from "@/lib/api/utils";
import { validerCorpsRequete } from "@/lib/api/validateBody";
import { recupererGroupeActif } from "@/lib/groupServer";
import {
  reponseRateLimit,
  verifierOrigineRequete,
  verifierRateLimit,
} from "@/lib/api/securiteRequetes";

function validateEnv() {
  if (
    !process.env.SMTP_HOST ||
    !process.env.SMTP_USER ||
    !process.env.SMTP_PASSWORD
  ) {
    console.error("Variables d'environnement manquantes pour SMTP");
    return jsonError("Configuration serveur manquante", 500);
  }
  return null;
}

export async function POST(req: NextRequest) {
  try {
    // Auth
    const { userId, orgId } = await auth();
    if (!userId || !orgId) return jsonError("Sélectionnez un groupe", 401);

    const erreurOrigine = verifierOrigineRequete(req);
    if (erreurOrigine) return erreurOrigine;

    // Max 2 envois par 30 secondes
    const limiteCourte = verifierRateLimit(
      `envoi-email:court:${userId}`,
      2,
      30 * 1000,
    );
    if (!limiteCourte.autorise) {
      return reponseRateLimit(limiteCourte.attenteSecondes);
    }

    // Max 5 envois par 10 minutes
    const limiteLongue = verifierRateLimit(
      `envoi-email:long:${userId}`,
      5,
      10 * 60 * 1000,
    );
    if (!limiteLongue.autorise) {
      return reponseRateLimit(limiteLongue.attenteSecondes);
    }

    const client = await clerkClient();
    const user = await client.users.getUser(userId);

    const userEmail = user.primaryEmailAddress?.emailAddress;
    // Env vars
    const envError = validateEnv();
    if (envError) return envError;

    // Body & validation
    const body = await req.json().catch(() => {
      console.error("Corps JSON illisible", {
        contentType: req.headers.get("content-type"),
        contentLength: req.headers.get("content-length"),
      });
      return null;
    });
    if (!body) return jsonError("Corps de requête invalide", 400);
    if (body.userEmail !== userEmail) return jsonError("Email invalide", 403);

    const { donneesEmail, error } = validerCorpsRequete(body);
    if (error || !donneesEmail) return error as NextResponse;
    const group = await recupererGroupeActif(orgId);
    if (group.validation.status !== "verified" || !group.emailTresorerie)
      return jsonError(
        "La trésorerie doit confirmer son adresse avant les envois",
        403,
      );
    const unit = group.unites.find((item) => item.id === donneesEmail.branche);
    if (!unit) return jsonError("Unité invalide pour ce groupe", 400);
    donneesEmail.branche = unit.label;
    donneesEmail.groupe = group.organisation.name;
    donneesEmail.couleur = unit.color;
    donneesEmail.emailTresorerie = group.emailTresorerie;

    const resultat = await envoyerEmail(donneesEmail);
    return NextResponse.json({
      success: true,
      message: "Email envoyé avec succès",
      messageId: resultat.messageId,
    });
  } catch (error) {
    console.error("Erreur lors de l'envoi de l'email:", error);
    if (error instanceof Error) {
      return verifierErreurSmtp(error);
    }
    return jsonError("Erreur interne du serveur", 500);
  }
}
