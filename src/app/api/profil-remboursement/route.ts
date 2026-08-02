import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import {
  reponseRateLimit,
  verifierOrigineRequete,
  verifierRateLimit,
} from "@/lib/api/securiteRequetes";

export async function GET() {
  const { userId } = await auth();
  if (!userId)
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const clientClerk = await clerkClient();
  const utilisateur = await clientClerk.users.getUser(userId);
  const titulaireCompte = utilisateur.privateMetadata.titulaireCompte;
  return NextResponse.json({
    titulaireCompte: typeof titulaireCompte === "string" ? titulaireCompte : "",
  });
}

export async function POST(requete: Request) {
  try {
    const { userId } = await auth();
    if (!userId)
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

    const erreurOrigine = verifierOrigineRequete(requete);
    if (erreurOrigine) return erreurOrigine;

    const limitation = verifierRateLimit(
      `maj-titulaire:${userId}`,
      15,
      60 * 1000,
    );
    if (!limitation.autorise)
      return reponseRateLimit(limitation.attenteSecondes);

    const corps = await requete.json().catch(() => null);
    const titulaireCompte =
      typeof corps?.titulaireCompte === "string"
        ? corps.titulaireCompte.trim().replace(/\s+/g, " ")
        : "";
    if (titulaireCompte.length < 2 || titulaireCompte.length > 120) {
      return NextResponse.json(
        { error: "Titulaire du compte invalide" },
        { status: 400 },
      );
    }

    const clientClerk = await clerkClient();
    await clientClerk.users.updateUser(userId, {
      privateMetadata: { titulaireCompte },
    });
    return NextResponse.json({ success: true, titulaireCompte });
  } catch (erreur) {
    console.error(
      "Erreur lors de la sauvegarde du titulaire du compte",
      erreur,
    );
    return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
  }
}
