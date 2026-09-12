import { NextResponse } from "next/server";
import { z } from "zod";
import {
  verifierOrigineRequete,
  verifierRateLimit,
} from "@/lib/api/securiteRequetes";
import { journaliserAuditAuthentification } from "@/lib/logger/audit";
import { journal } from "@/lib/logger";
import { recupererSession } from "@/lib/sessionServeur";

const schemaCorps = z.object({
  etape: z.enum(["acceptation", "activation_groupe", "groupe_principal"]),
  code: z.string().max(120).optional(),
  statut: z.number().int().min(100).max(599).optional(),
  dureeMs: z.number().int().min(0).max(60_000),
});

export async function POST(requete: Request) {
  const session = await recupererSession();
  if (!session)
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const erreurOrigine = verifierOrigineRequete(requete);
  if (erreurOrigine) return erreurOrigine;
  const limitation = verifierRateLimit(
    `observabilite-invitation:${session.user.id}`,
    10,
    60_000,
  );
  if (!limitation.autorise)
    return NextResponse.json({ error: "Trop de tentatives" }, { status: 429 });

  const corps = schemaCorps.safeParse(await requete.json().catch(() => null));
  if (!corps.success)
    return NextResponse.json({ error: "Requête invalide" }, { status: 400 });

  const codeErreur =
    corps.data.code ??
    (corps.data.statut ? `HTTP_${corps.data.statut}` : "INCONNUE");
  journal.erreur("invitation.acceptation_echouee", {
    etape: corps.data.etape,
    codeErreur,
    dureeMs: corps.data.dureeMs,
  });
  journaliserAuditAuthentification({
    evenement: "auth.audit.invitation_acceptee",
    resultat: "echec",
    utilisateur: session.user.id,
    organisation: null,
    codeErreur,
  });
  return NextResponse.json({ success: true });
}
