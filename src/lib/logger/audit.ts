import { createHmac } from "node:crypto";
import { journal } from "@/lib/logger";

type ResultatAudit = "succes" | "echec";

type EntreeAuditAuthentification = {
  evenement: string;
  resultat: ResultatAudit;
  utilisateur: string | null;
  organisation: string | null;
  codeErreur?: string;
};

function secretAudit() {
  const secret = process.env.AUDIT_LOG_SECRET;
  if (secret) return secret;
  if (process.env.NODE_ENV === "test") return "secret-audit-test";
  throw new Error("AUDIT_LOG_SECRET est requis pour les journaux d’audit.");
}

export function pseudonymiserIdentifiant(identifiant: string | null) {
  if (!identifiant) return null;
  return createHmac("sha256", secretAudit()).update(identifiant).digest("hex");
}

export function journaliserAuditAuthentification({
  evenement,
  resultat,
  utilisateur,
  organisation,
  codeErreur,
}: EntreeAuditAuthentification) {
  const contexte = {
    resultat,
    utilisateur: pseudonymiserIdentifiant(utilisateur),
    organisation: pseudonymiserIdentifiant(organisation),
    ...(codeErreur ? { codeErreur } : {}),
  };

  if (resultat === "succes") journal.info(evenement, contexte);
  else journal.avertissement(evenement, contexte);
}
