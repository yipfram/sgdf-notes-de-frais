import { headers } from "next/headers";
import { auth } from "@/lib/auth";

export async function recupererSession() {
  return auth.api.getSession({ headers: await headers() });
}

export async function recupererContexteGroupe() {
  const session = await recupererSession();
  return {
    session,
    identifiantUtilisateur: session?.user.id ?? null,
    identifiantOrganisation: session?.session.activeOrganizationId ?? null,
  };
}
