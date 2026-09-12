import {
  createCipheriv,
  createDecipheriv,
  createHash,
  randomBytes,
} from "node:crypto";
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
  const vecteurInitialisation = randomBytes(12);
  const chiffreur = createCipheriv(
    "aes-256-gcm",
    createHash("sha256").update(secretAudit()).digest(),
    vecteurInitialisation,
  );
  const texteChiffre = Buffer.concat([
    chiffreur.update(identifiant, "utf8"),
    chiffreur.final(),
  ]);

  return [
    "v1",
    vecteurInitialisation.toString("base64url"),
    chiffreur.getAuthTag().toString("base64url"),
    texteChiffre.toString("base64url"),
  ].join(".");
}

export function dechiffrerIdentifiant(identifiant: string | null) {
  if (!identifiant) return null;
  const [version, vecteurInitialisation, etiquette, texteChiffre, ...reste] =
    identifiant.split(".");
  if (
    version !== "v1" ||
    !vecteurInitialisation ||
    !etiquette ||
    !texteChiffre ||
    reste.length > 0
  ) {
    throw new Error("Identifiant d’audit chiffré invalide.");
  }

  const dechiffreur = createDecipheriv(
    "aes-256-gcm",
    createHash("sha256").update(secretAudit()).digest(),
    Buffer.from(vecteurInitialisation, "base64url"),
  );
  dechiffreur.setAuthTag(Buffer.from(etiquette, "base64url"));
  return Buffer.concat([
    dechiffreur.update(Buffer.from(texteChiffre, "base64url")),
    dechiffreur.final(),
  ]).toString("utf8");
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
