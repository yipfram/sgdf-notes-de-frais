import { lireUnites } from "./group";
import type { ValidationTresorerie } from "./treasuryVerification";
import { pool } from "@/lib/baseDeDonnees";

export async function recupererGroupeActif(identifiantOrganisation: string) {
  const resultat = await pool.query<{
    name: string;
    units: unknown;
    treasury_email: string;
    treasury_verification: unknown;
  }>(
    `SELECT organization.name, donnees.units, donnees.treasury_email,
            donnees.treasury_verification
       FROM organization
       LEFT JOIN scouticket_group_data donnees
         ON donnees.organization_id = organization.id
      WHERE organization.id = $1`,
    [identifiantOrganisation],
  );
  const groupe = resultat.rows[0];
  if (!groupe) throw new Error("ORGANISATION_INTRouvable");
  return {
    organisation: { id: identifiantOrganisation, name: groupe.name },
    unites: lireUnites(groupe.units),
    emailTresorerie: groupe.treasury_email,
    validation: (groupe.treasury_verification ?? {
      status: "pending",
    }) as ValidationTresorerie,
  };
}

export async function recupererRoleMembre(
  identifiantUtilisateur: string,
  identifiantOrganisation: string,
) {
  const resultat = await pool.query<{ role: string }>(
    'SELECT role FROM member WHERE "userId" = $1 AND "organizationId" = $2',
    [identifiantUtilisateur, identifiantOrganisation],
  );
  return resultat.rows[0]?.role ?? null;
}
