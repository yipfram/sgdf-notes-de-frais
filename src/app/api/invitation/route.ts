import { NextResponse } from "next/server";
import { pool } from "@/lib/baseDeDonnees";

export async function GET(requete: Request) {
  const identifiantInvitation = new URL(requete.url).searchParams.get("id");
  if (!identifiantInvitation)
    return NextResponse.json({ error: "Invitation invalide" }, { status: 400 });

  const resultat = await pool.query<{ name: string }>(
    `SELECT organization.name
       FROM invitation
       JOIN organization ON organization.id = invitation."organizationId"
      WHERE invitation.id = $1 AND invitation.status = $2`,
    [identifiantInvitation, "pending"],
  );
  const invitation = resultat.rows[0];
  if (!invitation)
    return NextResponse.json(
      { error: "Invitation introuvable" },
      { status: 404 },
    );
  return NextResponse.json({ nomGroupe: invitation.name });
}
