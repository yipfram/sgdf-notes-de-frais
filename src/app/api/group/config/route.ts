import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { validerUnites } from "@/lib/group";
import { recupererGroupeActif } from "@/lib/groupServer";
import { creerValidationTresorerie } from "@/lib/treasuryVerification";
import { envoyerEmailValidationTresorerie } from "@/lib/treasuryEmail";
import { verifierOrigineRequete } from "@/lib/api/securiteRequetes";

const bodySchema = z.object({
  treasuryEmail: z.string().email(),
  units: z.unknown(),
});

function isAdmin(role: string | null | undefined) {
  return role === "org:admin";
}

export async function GET() {
  const { orgId, orgRole } = await auth();
  if (!orgId)
    return NextResponse.json(
      { error: "Sélectionnez un groupe" },
      { status: 400 },
    );
  const group = await recupererGroupeActif(orgId);
  return NextResponse.json({
    groupName: group.organisation.name,
    units: group.unites,
    configured: Boolean(group.emailTresorerie && group.unites.length),
    treasuryVerified: group.validation.status === "verified",
    isAdmin: isAdmin(orgRole),
  });
}

export async function POST(req: Request) {
  const { orgId, orgRole } = await auth();
  if (!orgId || !isAdmin(orgRole))
    return NextResponse.json(
      { error: "Accès réservé aux responsables du groupe" },
      { status: 403 },
    );
  const originError = verifierOrigineRequete(req);
  if (originError) return originError;
  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  const units = parsed.success ? validerUnites(parsed.data.units) : null;
  if (!parsed.success || !units)
    return NextResponse.json(
      { error: "Configuration invalide" },
      { status: 400 },
    );

  const group = await recupererGroupeActif(orgId);
  const { token, verification } = creerValidationTresorerie();
  await group.client.organizations.updateOrganizationMetadata(orgId, {
    publicMetadata: { units },
    privateMetadata: {
      treasuryEmail: parsed.data.treasuryEmail,
      treasuryVerification: verification,
    },
  });
  const url = `${new URL(req.url).origin}/verify-treasury?org=${encodeURIComponent(orgId)}&token=${encodeURIComponent(token)}`;
  await envoyerEmailValidationTresorerie({
    destinataire: parsed.data.treasuryEmail,
    nomGroupe: group.organisation.name,
    url,
  });
  return NextResponse.json({ success: true });
}
