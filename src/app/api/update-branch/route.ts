import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { ALL_BRANCHES } from "@/lib/branches";
import {
  reponseRateLimit,
  verifierOrigineRequete,
  verifierRateLimit,
} from "@/lib/api/securiteRequetes";

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const erreurOrigine = verifierOrigineRequete(req);
    if (erreurOrigine) return erreurOrigine;

    // max 30 mises à jour par minute pour cet utilisateur
    const limitation = verifierRateLimit(
      `maj-branche:${userId}`,
      30,
      60 * 1000,
    );
    if (!limitation.autorise) {
      return reponseRateLimit(limitation.attenteSecondes);
    }

    const body = await req.json().catch(() => null);
    if (!body || typeof body.branch !== "string") {
      return NextResponse.json({ error: "Branche manquante" }, { status: 400 });
    }

    const branch = body.branch.trim();

    if (!ALL_BRANCHES.includes(branch)) {
      return NextResponse.json(
        { error: "Valeur de branche invalide" },
        { status: 400 },
      );
    }

    // Update public metadata
    const ck = await clerkClient();
    await ck.users.updateUser(userId, { publicMetadata: { branch } });

    return NextResponse.json({ success: true, branch });
  } catch (err) {
    console.error("Erreur API update-branch", err);
    return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
  }
}
