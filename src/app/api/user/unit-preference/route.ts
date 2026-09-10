import { NextResponse } from "next/server";
import { z } from "zod";
import {} from "@/lib/group";
import { recupererGroupeActif } from "@/lib/groupServer";
import { recupererContexteGroupe } from "@/lib/sessionServeur";
import { pool } from "@/lib/baseDeDonnees";
import {
  reponseRateLimit,
  verifierOrigineRequete,
  verifierRateLimit,
} from "@/lib/api/securiteRequetes";
import { executerRouteAvecLogs } from "@/lib/api/routeAvecLogs";
import { journal } from "@/lib/logger";

const schemaCorps = z.object({
  organizationId: z.string().min(1),
  unitId: z.string(),
});

export async function POST(req: Request) {
  return executerRouteAvecLogs(req, async () => {
    try {
      const { identifiantUtilisateur, identifiantOrganisation } =
        await recupererContexteGroupe();
      if (!identifiantUtilisateur || !identifiantOrganisation) {
        return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
      }

      const erreurOrigine = verifierOrigineRequete(req);
      if (erreurOrigine) return erreurOrigine;

      const corps = schemaCorps.safeParse(await req.json().catch(() => null));
      if (!corps.success) {
        return NextResponse.json(
          { error: "Requête invalide" },
          { status: 400 },
        );
      }
      if (corps.data.organizationId !== identifiantOrganisation) {
        return NextResponse.json(
          { error: "Accès au groupe refusé" },
          { status: 403 },
        );
      }

      const limitation = verifierRateLimit(
        `maj-unite:${identifiantUtilisateur}:${identifiantOrganisation}`,
        30,
        60 * 1000,
      );
      if (!limitation.autorise) {
        return reponseRateLimit(limitation.attenteSecondes);
      }

      const unitId = corps.data.unitId.trim();
      const groupe = await recupererGroupeActif(identifiantOrganisation);
      if (unitId && !groupe.unites.some((unite) => unite.id === unitId)) {
        return NextResponse.json({ error: "Unité invalide" }, { status: 400 });
      }

      if (unitId) {
        await pool.query(
          `INSERT INTO scouticket_user_unit_preference (user_id, organization_id, unit_id)
           VALUES ($1, $2, $3)
           ON CONFLICT (user_id, organization_id) DO UPDATE SET unit_id = EXCLUDED.unit_id`,
          [identifiantUtilisateur, identifiantOrganisation, unitId],
        );
      } else {
        await pool.query(
          "DELETE FROM scouticket_user_unit_preference WHERE user_id = $1 AND organization_id = $2",
          [identifiantUtilisateur, identifiantOrganisation],
        );
      }

      return NextResponse.json({ success: true, unitId });
    } catch (erreur) {
      journal.erreur("preference_unite.mise_a_jour_echouee", { erreur });
      return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
    }
  });
}
