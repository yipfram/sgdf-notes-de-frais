import { clerkClient } from "@clerk/nextjs/server";
import { lireUnites } from "./group";
import type { ValidationTresorerie } from "./treasuryVerification";

export async function recupererGroupeActif(identifiantOrganisation: string) {
  const client = await clerkClient();
  const organisation = await client.organizations.getOrganization({
    organizationId: identifiantOrganisation,
  });
  const metadonneesPrivees = (organisation.privateMetadata ?? {}) as Record<
    string,
    unknown
  >;
  return {
    client,
    organisation,
    unites: lireUnites(organisation.publicMetadata?.units),
    emailTresorerie:
      typeof metadonneesPrivees.treasuryEmail === "string"
        ? metadonneesPrivees.treasuryEmail
        : "",
    validation: (metadonneesPrivees.treasuryVerification ?? {
      status: "pending",
    }) as ValidationTresorerie,
  };
}
