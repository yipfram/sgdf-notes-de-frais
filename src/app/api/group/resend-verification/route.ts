import { NextResponse } from "next/server";
import { recupererGroupeActif, recupererRoleMembre } from "@/lib/groupServer";
import { recupererContexteGroupe } from "@/lib/sessionServeur";
import { pool } from "@/lib/baseDeDonnees";
import {
  creerUrlVerificationTresorerie,
  creerValidationTresorerie,
} from "@/lib/treasuryVerification";
import { envoyerEmailValidationTresorerie } from "@/lib/treasuryEmail";
import {
  reponseRateLimit,
  verifierOrigineRequete,
  verifierRateLimit,
} from "@/lib/api/securiteRequetes";
import { executerRouteAvecLogs } from "@/lib/api/routeAvecLogs";

export async function POST(req: Request) {
  return executerRouteAvecLogs(req, async () => {
    const { identifiantOrganisation, identifiantUtilisateur } =
      await recupererContexteGroupe();
    const role =
      identifiantOrganisation && identifiantUtilisateur
        ? await recupererRoleMembre(
            identifiantUtilisateur,
            identifiantOrganisation,
          )
        : null;
    if (!identifiantOrganisation || (role !== "admin" && role !== "owner"))
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    const originError = verifierOrigineRequete(req);
    if (originError) return originError;
    const groupe = await recupererGroupeActif(identifiantOrganisation);
    if (!groupe.emailTresorerie)
      return NextResponse.json(
        { error: "Adresse de trésorerie manquante" },
        { status: 400 },
      );
    if (groupe.validation.status === "verified")
      return NextResponse.json(
        { error: "La trésorerie a déjà confirmé son adresse" },
        { status: 409 },
      );

    const limiteCourte = verifierRateLimit(
      `renvoi-validation-tresorerie:${identifiantOrganisation}:15-minutes`,
      1,
      15 * 60 * 1000,
    );
    if (!limiteCourte.autorise)
      return reponseRateLimit(limiteCourte.attenteSecondes);

    const limiteLongue = verifierRateLimit(
      `renvoi-validation-tresorerie:${identifiantOrganisation}:24-heures`,
      5,
      24 * 60 * 60 * 1000,
    );
    if (!limiteLongue.autorise)
      return reponseRateLimit(limiteLongue.attenteSecondes);

    const { token, verification } = creerValidationTresorerie();
    await pool.query(
      `UPDATE scouticket_group_data SET treasury_verification = $2::jsonb
        WHERE organization_id = $1`,
      [identifiantOrganisation, JSON.stringify(verification)],
    );
    const url = creerUrlVerificationTresorerie(identifiantOrganisation, token);
    await envoyerEmailValidationTresorerie({
      destinataire: groupe.emailTresorerie,
      nomGroupe: groupe.organisation.name,
      url,
    });
    return NextResponse.json({ success: true });
  });
}
