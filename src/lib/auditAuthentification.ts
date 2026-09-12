import { journaliserAuditAuthentification as ecrireAuditAuthentification } from "@/lib/logger/audit";

export {
  dechiffrerIdentifiant,
  pseudonymiserIdentifiant,
} from "@/lib/logger/audit";

type ValeurObjet = Record<string, unknown>;

const actionsParChemin: Record<string, string> = {
  "/sign-up/email": "inscription",
  "/sign-in/email": "connexion",
  "/sign-out": "deconnexion",
  "/request-password-reset": "reinitialisation_mot_de_passe_demandee",
  "/reset-password": "reinitialisation_mot_de_passe_terminee",
  "/send-verification-email": "verification_email_envoyee",
  "/verify-email": "email_verifie",
  "/organization/create": "organisation_creee",
  "/organization/update": "organisation_modifiee",
  "/organization/delete": "organisation_supprimee",
  "/organization/invite-member": "membre_invite",
  "/organization/accept-invitation": "invitation_acceptee",
  "/organization/reject-invitation": "invitation_refusee",
  "/organization/cancel-invitation": "invitation_annulee",
  "/organization/remove-member": "membre_supprime",
  "/organization/update-member-role": "role_membre_modifie",
  "/organization/leave": "organisation_quittee",
};

function estObjet(valeur: unknown): valeur is ValeurObjet {
  return typeof valeur === "object" && valeur !== null;
}

function lireChaine(valeur: unknown, cle: string) {
  return estObjet(valeur) && typeof valeur[cle] === "string"
    ? valeur[cle]
    : null;
}

export function actionAuditAuthentification(chemin: string | undefined) {
  return chemin ? (actionsParChemin[chemin] ?? null) : null;
}

function lireChaineImbriquee(valeur: unknown, cles: string[]) {
  const resultat = cles.reduce<unknown>(
    (resultat, cle) => (estObjet(resultat) ? resultat[cle] : null),
    valeur,
  );
  return typeof resultat === "string" ? resultat : null;
}

function identifiantsAudit(contexte: unknown, corps: unknown, retour: unknown) {
  const contexteAuth = estObjet(contexte) ? contexte : {};
  const session = estObjet(contexteAuth.session) ? contexteAuth.session : {};
  const nouvelleSession = estObjet(contexteAuth.newSession)
    ? contexteAuth.newSession
    : {};
  const utilisateurSession = lireChaine(session.user, "id");
  const utilisateurNouvelleSession = lireChaine(nouvelleSession.user, "id");
  const organisationSession = lireChaine(
    session.session,
    "activeOrganizationId",
  );
  const utilisateurRetour =
    lireChaineImbriquee(retour, ["user", "id"]) ??
    lireChaine(retour, "inviterId") ??
    lireChaine(retour, "actorId");
  const organisationRetour =
    lireChaine(retour, "organizationId") ??
    lireChaineImbriquee(retour, ["organization", "id"]);

  return {
    utilisateur:
      utilisateurSession ?? utilisateurNouvelleSession ?? utilisateurRetour,
    organisation:
      organisationSession ??
      lireChaine(corps, "organizationId") ??
      organisationRetour,
  };
}

export function journaliserAuditAuthentification({
  chemin,
  resultat,
  contexte,
  corps,
  retour,
  codeErreur,
}: {
  chemin: string | undefined;
  resultat: "succes" | "echec";
  contexte: unknown;
  corps?: unknown;
  retour?: unknown;
  codeErreur?: unknown;
}) {
  const action = actionAuditAuthentification(chemin);
  if (!action) return;

  const identifiants = identifiantsAudit(contexte, corps, retour);
  ecrireAuditAuthentification({
    evenement: `auth.audit.${action}`,
    resultat,
    ...identifiants,
    ...(typeof codeErreur === "string" ? { codeErreur } : {}),
  });
}
