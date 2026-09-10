import { createHmac } from "node:crypto";
import { journal } from "@/lib/logger";

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

function secretAudit() {
  const secret = process.env.AUDIT_LOG_SECRET;
  if (secret) return secret;
  if (process.env.NODE_ENV === "test") return "secret-audit-test";
  throw new Error("AUDIT_LOG_SECRET est requis pour les journaux d'audit.");
}

export function pseudonymiserIdentifiant(identifiant: string | null) {
  if (!identifiant) return null;
  return createHmac("sha256", secretAudit()).update(identifiant).digest("hex");
}

export function actionAuditAuthentification(chemin: string | undefined) {
  return chemin ? (actionsParChemin[chemin] ?? null) : null;
}

function identifiantsContexte(contexte: unknown) {
  const contexteAuth = estObjet(contexte) ? contexte : {};
  const session = estObjet(contexteAuth.session) ? contexteAuth.session : {};
  const nouvelleSession = estObjet(contexteAuth.newSession)
    ? contexteAuth.newSession
    : {};
  const sessionUtilisateur = lireChaine(session, "userId");
  const utilisateurNouvelleSession = lireChaine(nouvelleSession, "userId");
  const organisationSession = lireChaine(session, "activeOrganizationId");

  return {
    utilisateur: sessionUtilisateur ?? utilisateurNouvelleSession,
    organisation: organisationSession,
  };
}

export function journaliserAuditAuthentification({
  chemin,
  resultat,
  contexte,
  corps,
  codeErreur,
}: {
  chemin: string | undefined;
  resultat: "succes" | "echec";
  contexte: unknown;
  corps?: unknown;
  codeErreur?: unknown;
}) {
  const action = actionAuditAuthentification(chemin);
  if (!action) return;

  const identifiants = identifiantsContexte(contexte);
  const organisationCorps = lireChaine(corps, "organizationId");
  const entree = {
    resultat,
    utilisateur: pseudonymiserIdentifiant(identifiants.utilisateur),
    organisation: pseudonymiserIdentifiant(
      identifiants.organisation ?? organisationCorps,
    ),
    ...(typeof codeErreur === "string" ? { codeErreur } : {}),
  };

  if (resultat === "succes") journal.info(`auth.audit.${action}`, entree);
  else journal.avertissement(`auth.audit.${action}`, entree);
}
