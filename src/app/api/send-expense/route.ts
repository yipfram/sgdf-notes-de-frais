import { NextRequest, NextResponse } from "next/server";
import { envoyerEmail } from "@/lib/email";
import { jsonError, verifierErreurSmtp } from "@/lib/api/utils";
import { validerCorpsRequete } from "@/lib/api/validateBody";
import { recupererGroupeActif } from "@/lib/groupServer";
import {
  reponseRateLimit,
  verifierOrigineRequete,
  verifierRateLimit,
} from "@/lib/api/securiteRequetes";
import { executerRouteAvecLogs } from "@/lib/api/routeAvecLogs";
import { journal } from "@/lib/logger";
import { recupererContexteGroupe } from "@/lib/sessionServeur";

function validateEnv() {
  if (
    !process.env.SMTP_HOST ||
    !process.env.SMTP_USER ||
    !process.env.SMTP_PASSWORD
  ) {
    journal.erreur("smtp.variables_environnement_manquantes");
    return jsonError("Configuration serveur manquante", 500);
  }
  return null;
}

export async function POST(req: NextRequest) {
  return executerRouteAvecLogs(req, async () => {
    try {
      // Auth
      const { session, identifiantUtilisateur, identifiantOrganisation } =
        await recupererContexteGroupe();
      if (!session || !identifiantUtilisateur || !identifiantOrganisation)
        return jsonError("Sélectionnez un groupe", 401);

      const erreurOrigine = verifierOrigineRequete(req);
      if (erreurOrigine) return erreurOrigine;

      // Max 2 envois par 30 secondes
      const limiteCourte = verifierRateLimit(
        `envoi-email:court:${identifiantUtilisateur}`,
        2,
        30 * 1000,
      );
      if (!limiteCourte.autorise) {
        return reponseRateLimit(limiteCourte.attenteSecondes);
      }

      // Max 5 envois par 10 minutes
      const limiteLongue = verifierRateLimit(
        `envoi-email:long:${identifiantUtilisateur}`,
        5,
        10 * 60 * 1000,
      );
      if (!limiteLongue.autorise) {
        return reponseRateLimit(limiteLongue.attenteSecondes);
      }

      const userEmail = session.user.email;
      // Env vars
      const envError = validateEnv();
      if (envError) return envError;

      // Body & validation
      const body = await req.json().catch(() => null);
      if (!body) return jsonError("Corps de requête invalide", 400);
      if (body.userEmail !== userEmail) return jsonError("Email invalide", 403);

      const { donneesEmail, error } = validerCorpsRequete(body);
      if (error || !donneesEmail) return error as NextResponse;
      const group = await recupererGroupeActif(identifiantOrganisation);
      if (group.validation.status !== "verified" || !group.emailTresorerie)
        return jsonError(
          "La trésorerie doit confirmer son adresse avant les envois",
          403,
        );
      const unit = group.unites.find(
        (item) => item.id === donneesEmail.branche,
      );
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
      journal.erreur("depense.envoi_echoue", { erreur: error });
      if (error instanceof Error) {
        return verifierErreurSmtp(error);
      }
      return jsonError("Erreur interne du serveur", 500);
    }
  });
}
