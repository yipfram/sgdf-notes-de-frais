import { NextResponse } from "next/server";
import { pseudonymiserIdentifiant } from "@/lib/auditAuthentification";
import { recupererSession } from "@/lib/sessionServeur";

export async function GET() {
  const session = await recupererSession();
  if (!session)
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  return NextResponse.json({
    id: pseudonymiserIdentifiant(session.user.id),
  });
}
