import { NextResponse } from "next/server";
import { pool } from "@/lib/baseDeDonnees";
import { recupererContexteGroupe } from "@/lib/sessionServeur";
import { recupererRoleMembre } from "@/lib/groupServer";
import { executerRouteAvecLogs } from "@/lib/api/routeAvecLogs";

export async function GET(requete: Request) {
  return executerRouteAvecLogs(requete, async () => {
    const { identifiantOrganisation, identifiantUtilisateur } =
      await recupererContexteGroupe();
    if (!identifiantOrganisation || !identifiantUtilisateur)
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

    const role = await recupererRoleMembre(
      identifiantUtilisateur,
      identifiantOrganisation,
    );
    if (role !== "admin" && role !== "owner")
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });

    const [organisation, membres, invitations] = await Promise.all([
      pool.query<{ name: string }>(
        "SELECT name FROM organization WHERE id = $1",
        [identifiantOrganisation],
      ),
      pool.query<{ id: string; nom: string; email: string; role: string }>(
        `SELECT member.id, "user".name AS nom, "user".email, member.role
           FROM member
           JOIN "user" ON "user".id = member."userId"
          WHERE member."organizationId" = $1
          ORDER BY "user".name ASC, "user".email ASC`,
        [identifiantOrganisation],
      ),
      pool.query<{ id: string; email: string }>(
        'SELECT id, email FROM invitation WHERE "organizationId" = $1 AND status = $2 ORDER BY "createdAt" DESC',
        [identifiantOrganisation, "pending"],
      ),
    ]);

    return NextResponse.json({
      organisation: {
        id: identifiantOrganisation,
        name: organisation.rows[0]?.name ?? "",
      },
      membres: membres.rows,
      invitations: invitations.rows,
    });
  });
}
