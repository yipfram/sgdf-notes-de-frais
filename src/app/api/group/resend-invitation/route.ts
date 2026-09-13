import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { pool } from "@/lib/baseDeDonnees";
import { recupererRoleMembre } from "@/lib/groupServer";
import { recupererContexteGroupe } from "@/lib/sessionServeur";
import {
  reponseRateLimit,
  verifierOrigineRequete,
  verifierRateLimit,
} from "@/lib/api/securiteRequetes";
import { executerRouteAvecLogs } from "@/lib/api/routeAvecLogs";

type CorpsRenvoiInvitation = { invitationId?: unknown };

export async function POST(requete: Request) {
  return executerRouteAvecLogs(requete, async () => {
    const erreurOrigine = verifierOrigineRequete(requete);
    if (erreurOrigine) return erreurOrigine;

    const { identifiantOrganisation, identifiantUtilisateur } =
      await recupererContexteGroupe();
    if (!identifiantOrganisation || !identifiantUtilisateur)
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

    const roleMembre = await recupererRoleMembre(
      identifiantUtilisateur,
      identifiantOrganisation,
    );
    if (roleMembre !== "admin" && roleMembre !== "owner")
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });

    const corps = (await requete
      .json()
      .catch(() => null)) as CorpsRenvoiInvitation | null;
    if (!corps || typeof corps.invitationId !== "string" || !corps.invitationId)
      return NextResponse.json(
        { error: "Invitation invalide" },
        { status: 400 },
      );

    const resultatInvitation = await pool.query<{
      email: string;
      role: string;
    }>(
      'SELECT email, role FROM invitation WHERE id = $1 AND "organizationId" = $2 AND status = $3',
      [corps.invitationId, identifiantOrganisation, "pending"],
    );
    const invitation = resultatInvitation.rows[0];
    if (!invitation)
      return NextResponse.json(
        { error: "Cette invitation n’est plus en attente." },
        { status: 409 },
      );

    const cleRateLimit = `${identifiantOrganisation}:${invitation.email.toLowerCase()}`;
    const limiteCourte = verifierRateLimit(
      `renvoi-invitation:${cleRateLimit}:15-minutes`,
      1,
      15 * 60 * 1000,
    );
    if (!limiteCourte.autorise)
      return reponseRateLimit(limiteCourte.attenteSecondes);
    const limiteLongue = verifierRateLimit(
      `renvoi-invitation:${cleRateLimit}:24-heures`,
      5,
      24 * 60 * 60 * 1000,
    );
    if (!limiteLongue.autorise)
      return reponseRateLimit(limiteLongue.attenteSecondes);

    await auth.api.createInvitation({
      headers: requete.headers,
      body: {
        email: invitation.email,
        role: invitation.role as "member" | "admin" | "owner",
        organizationId: identifiantOrganisation,
        resend: true,
      },
    });
    return NextResponse.json({ success: true });
  });
}
