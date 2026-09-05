import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import {
  CLE_UNITE_SELECTIONNEE_PAR_ORGANISATION,
  lireUnitesSelectionnees,
} from "@/lib/group";
import { recupererGroupeActif } from "@/lib/groupServer";
import {
  reponseRateLimit,
  verifierOrigineRequete,
  verifierRateLimit,
} from "@/lib/api/securiteRequetes";

const schemaCorps = z.object({
  organizationId: z.string().min(1),
  unitId: z.string(),
});

export async function POST(req: Request) {
  try {
    const { userId, orgId } = await auth();
    if (!userId || !orgId) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const erreurOrigine = verifierOrigineRequete(req);
    if (erreurOrigine) return erreurOrigine;

    const corps = schemaCorps.safeParse(await req.json().catch(() => null));
    if (!corps.success) {
      return NextResponse.json({ error: "Requête invalide" }, { status: 400 });
    }
    if (corps.data.organizationId !== orgId) {
      return NextResponse.json(
        { error: "Accès au groupe refusé" },
        { status: 403 },
      );
    }

    const limitation = verifierRateLimit(
      `maj-unite:${userId}:${orgId}`,
      30,
      60 * 1000,
    );
    if (!limitation.autorise) {
      return reponseRateLimit(limitation.attenteSecondes);
    }

    const unitId = corps.data.unitId.trim();
    const groupe = await recupererGroupeActif(orgId);
    if (unitId && !groupe.unites.some((unite) => unite.id === unitId)) {
      return NextResponse.json({ error: "Unité invalide" }, { status: 400 });
    }

    const client = await clerkClient();
    const utilisateur = await client.users.getUser(userId);
    const metadonnees = {
      ...(utilisateur.publicMetadata ?? {}),
    } as Record<string, unknown>;
    const unitesSelectionnees = lireUnitesSelectionnees(
      metadonnees[CLE_UNITE_SELECTIONNEE_PAR_ORGANISATION],
    );

    if (unitId) {
      unitesSelectionnees[orgId] = unitId;
    } else {
      delete unitesSelectionnees[orgId];
    }

    await client.users.updateUser(userId, {
      publicMetadata: {
        ...metadonnees,
        [CLE_UNITE_SELECTIONNEE_PAR_ORGANISATION]: unitesSelectionnees,
      },
    });

    return NextResponse.json({ success: true, unitId });
  } catch (erreur) {
    console.error("Erreur API préférence d’unité", erreur);
    return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
  }
}
