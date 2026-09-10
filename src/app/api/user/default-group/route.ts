import { NextResponse } from "next/server";
import { z } from "zod";
import { pool } from "@/lib/baseDeDonnees";
import { recupererSession } from "@/lib/sessionServeur";
import {
  reponseRateLimit,
  verifierOrigineRequete,
  verifierRateLimit,
} from "@/lib/api/securiteRequetes";

const schemaCorps = z.object({ organizationId: z.string().min(1) });

export async function GET() {
  const session = await recupererSession();
  if (!session)
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const resultat = await pool.query<{ organization_id: string }>(
    `SELECT preference.organization_id
       FROM scouticket_user_default_group preference
       JOIN member membre
         ON membre."organizationId" = preference.organization_id
        AND membre."userId" = preference.user_id
      WHERE preference.user_id = $1`,
    [session.user.id],
  );
  return NextResponse.json({
    organizationId: resultat.rows[0]?.organization_id ?? null,
  });
}

export async function POST(requete: Request) {
  const session = await recupererSession();
  if (!session)
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  const erreurOrigine = verifierOrigineRequete(requete);
  if (erreurOrigine) return erreurOrigine;
  const limitation = verifierRateLimit(
    `groupe-principal:${session.user.id}`,
    30,
    60 * 1000,
  );
  if (!limitation.autorise) return reponseRateLimit(limitation.attenteSecondes);

  const corps = schemaCorps.safeParse(await requete.json().catch(() => null));
  if (!corps.success)
    return NextResponse.json({ error: "Requête invalide" }, { status: 400 });

  const appartenance = await pool.query(
    'SELECT 1 FROM member WHERE "userId" = $1 AND "organizationId" = $2',
    [session.user.id, corps.data.organizationId],
  );
  if (appartenance.rowCount === 0)
    return NextResponse.json(
      { error: "Accès au groupe refusé" },
      { status: 403 },
    );

  await pool.query(
    `INSERT INTO scouticket_user_default_group (user_id, organization_id)
     VALUES ($1, $2)
     ON CONFLICT (user_id) DO UPDATE SET organization_id = EXCLUDED.organization_id`,
    [session.user.id, corps.data.organizationId],
  );
  return NextResponse.json({ success: true });
}
