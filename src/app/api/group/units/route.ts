import { NextResponse } from "next/server";
import { z } from "zod";
import { validerUnites } from "@/lib/group";
import { recupererRoleMembre } from "@/lib/groupServer";
import { recupererContexteGroupe } from "@/lib/sessionServeur";
import { pool } from "@/lib/baseDeDonnees";
import { verifierOrigineRequete } from "@/lib/api/securiteRequetes";
import { executerRouteAvecLogs } from "@/lib/api/routeAvecLogs";

const schemaCorps = z.object({ units: z.unknown() });

function estAdministrateur(role: string | null) {
  return role === "admin" || role === "owner";
}

export async function PATCH(requete: Request) {
  return executerRouteAvecLogs(requete, async () => {
    const { identifiantOrganisation, identifiantUtilisateur } =
      await recupererContexteGroupe();
    const role =
      identifiantOrganisation && identifiantUtilisateur
        ? await recupererRoleMembre(
            identifiantUtilisateur,
            identifiantOrganisation,
          )
        : null;
    if (!identifiantOrganisation || !estAdministrateur(role))
      return NextResponse.json(
        { error: "Accès réservé aux responsables du groupe" },
        { status: 403 },
      );

    const erreurOrigine = verifierOrigineRequete(requete);
    if (erreurOrigine) return erreurOrigine;
    const corps = schemaCorps.safeParse(await requete.json().catch(() => null));
    const unites = corps.success ? validerUnites(corps.data.units) : null;
    if (!unites)
      return NextResponse.json({ error: "Unités invalides" }, { status: 400 });

    await pool.query(
      `UPDATE scouticket_group_data SET units = $2::jsonb WHERE organization_id = $1`,
      [identifiantOrganisation, JSON.stringify(unites)],
    );
    return NextResponse.json({ success: true });
  });
}
