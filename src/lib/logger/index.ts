// Point d’entrée unique des journaux applicatifs.
type NiveauJournal = "info" | "warn" | "error";

export type ContexteJournal = Record<string, unknown>;

const expressionCleSensible =
  /(email|mail|password|motdepasse|authorization|cookie|token|secret|base64|attachment|piecejointe|donnees|data|body|corps|userid|orgid|messageid|filename|nomfichier)/i;
const expressionEmail = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi;
const expressionJeton = /\b(?:bearer|basic)\s+[^\s]+/gi;

function nettoyerTexte(valeur: string) {
  return valeur
    .replace(expressionEmail, "[masqué]")
    .replace(expressionJeton, "[masqué]");
}

function nettoyerValeur(valeur: unknown, profondeur = 0): unknown {
  if (profondeur > 4) return "[tronqué]";
  if (valeur instanceof Error) {
    return {
      nom: valeur.name,
      message: nettoyerTexte(valeur.message),
      ...(process.env.NODE_ENV !== "production" && valeur.stack
        ? { pile: valeur.stack }
        : {}),
    };
  }
  if (typeof valeur === "string") return nettoyerTexte(valeur);
  if (
    typeof valeur === "number" ||
    typeof valeur === "boolean" ||
    valeur === null ||
    valeur === undefined
  ) {
    return valeur;
  }
  if (Array.isArray(valeur)) {
    return valeur.map((element) => nettoyerValeur(element, profondeur + 1));
  }
  if (typeof valeur === "object") {
    return Object.fromEntries(
      Object.entries(valeur).map(([cle, element]) => [
        cle,
        expressionCleSensible.test(cle)
          ? "[masqué]"
          : nettoyerValeur(element, profondeur + 1),
      ]),
    );
  }
  return String(valeur);
}

function ecrireJournal(
  niveau: NiveauJournal,
  evenement: string,
  contexte: ContexteJournal = {},
) {
  const entree = JSON.stringify({
    horodatage: new Date().toISOString(),
    niveau,
    evenement,
    contexte: nettoyerValeur(contexte),
  });

  if (niveau === "error") console.error(entree);
  else if (niveau === "warn") console.warn(entree);
  else console.info(entree);
}

export const journal = {
  info: (evenement: string, contexte?: ContexteJournal) =>
    ecrireJournal("info", evenement, contexte),
  avertissement: (evenement: string, contexte?: ContexteJournal) =>
    ecrireJournal("warn", evenement, contexte),
  erreur: (evenement: string, contexte?: ContexteJournal) =>
    ecrireJournal("error", evenement, contexte),
};
