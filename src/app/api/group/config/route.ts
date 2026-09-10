import { NextResponse } from "next/server";
import { z } from "zod";
import { validerUnites } from "@/lib/group";
import { recupererGroupeActif, recupererRoleMembre } from "@/lib/groupServer";
import { recupererContexteGroupe } from "@/lib/sessionServeur";
import { pool } from "@/lib/baseDeDonnees";
import {
  creerUrlVerificationTresorerie,
  creerValidationTresorerie,
} from "@/lib/treasuryVerification";
import { envoyerEmailValidationTresorerie } from "@/lib/treasuryEmail";
import { verifierOrigineRequete } from "@/lib/api/securiteRequetes";
import { executerRouteAvecLogs } from "@/lib/api/routeAvecLogs";

const bodySchema = z.object({
  treasuryEmail: z.string().email(),
  units: z.unknown(),
});

function isAdmin(role: string | null) {
  return role === "admin" || role === "owner";
}

export async function GET(requete: Request) {
  return executerRouteAvecLogs(requete, async () => {
    const { identifiantOrganisation, identifiantUtilisateur } =
      await recupererContexteGroupe();
    if (!identifiantOrganisation || !identifiantUtilisateur)
      return NextResponse.json(
        { error: "Sélectionnez un groupe" },
        { status: 400 },
      );
    const group = await recupererGroupeActif(identifiantOrganisation);
    const role = await recupererRoleMembre(
      identifiantUtilisateur,
      identifiantOrganisation,
    );
    const preference = await pool.query<{ unit_id: string }>(
      `SELECT unit_id FROM scouticket_user_unit_preference
        WHERE user_id = $1 AND organization_id = $2`,
      [identifiantUtilisateur, identifiantOrganisation],
    );
    return NextResponse.json({
      groupName: group.organisation.name,
      units: group.unites,
      configured: Boolean(group.emailTresorerie && group.unites.length),
      treasuryVerified: group.validation.status === "verified",
      isAdmin: isAdmin(role),
      unitPreference: preference.rows[0]?.unit_id ?? "",
    });
  });
}

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
    if (!identifiantOrganisation || !isAdmin(role))
      return NextResponse.json(
        { error: "Accès réservé aux responsables du groupe" },
        { status: 403 },
      );
    const originError = verifierOrigineRequete(req);
    if (originError) return originError;
    const parsed = bodySchema.safeParse(await req.json().catch(() => null));
    const units = parsed.success ? validerUnites(parsed.data.units) : null;
    if (!parsed.success || !units)
      return NextResponse.json(
        { error: "Configuration invalide" },
        { status: 400 },
      );

    const group = await recupererGroupeActif(identifiantOrganisation);
    const { token, verification } = creerValidationTresorerie();
    await pool.query(
      `INSERT INTO scouticket_group_data
        (organization_id, units, treasury_email, treasury_verification)
       VALUES ($1, $2::jsonb, $3, $4::jsonb)
       ON CONFLICT (organization_id) DO UPDATE
       SET units = EXCLUDED.units, treasury_email = EXCLUDED.treasury_email,
           treasury_verification = EXCLUDED.treasury_verification`,
      [
        identifiantOrganisation,
        JSON.stringify(units),
        parsed.data.treasuryEmail,
        JSON.stringify(verification),
      ],
    );
    const url = creerUrlVerificationTresorerie(identifiantOrganisation, token);
    await envoyerEmailValidationTresorerie({
      destinataire: parsed.data.treasuryEmail,
      nomGroupe: group.organisation.name,
      url,
    });
    return NextResponse.json({ success: true });
  });
}
