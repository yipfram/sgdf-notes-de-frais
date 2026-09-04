import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { recupererGroupeActif } from "@/lib/groupServer";
import { creerValidationTresorerie } from "@/lib/treasuryVerification";
import { envoyerEmailValidationTresorerie } from "@/lib/treasuryEmail";
import { verifierOrigineRequete } from "@/lib/api/securiteRequetes";

export async function POST(req: Request) {
  const { orgId, orgRole } = await auth();
  if (!orgId || orgRole !== "org:admin")
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  const originError = verifierOrigineRequete(req);
  if (originError) return originError;
  const groupe = await recupererGroupeActif(orgId);
  if (!groupe.emailTresorerie)
    return NextResponse.json(
      { error: "Adresse de trésorerie manquante" },
      { status: 400 },
    );
  const { token, verification } = creerValidationTresorerie();
  await groupe.client.organizations.updateOrganizationMetadata(orgId, {
    privateMetadata: { treasuryVerification: verification },
  });
  const url = `${new URL(req.url).origin}/verify-treasury?org=${encodeURIComponent(orgId)}&token=${encodeURIComponent(token)}`;
  await envoyerEmailValidationTresorerie({
    destinataire: groupe.emailTresorerie,
    nomGroupe: groupe.organisation.name,
    url,
  });
  return NextResponse.json({ success: true });
}
