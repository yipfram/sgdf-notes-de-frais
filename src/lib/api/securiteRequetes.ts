import { NextResponse } from "next/server";

interface EntreeRateLimit {
  nombreRequetes: number;
  reinitialisationA: number;
}

const compteursRateLimit = new Map<string, EntreeRateLimit>();

function origineApplication(req: Request) {
  const protocole = req.headers.get("x-forwarded-proto");
  const hote = req.headers.get("x-forwarded-host") ?? req.headers.get("host");

  if (protocole && hote) {
    return `${protocole}://${hote}`;
  }

  return new URL(req.url).origin;
}

export function verifierOrigineRequete(req: Request): NextResponse | null {
  const origine = req.headers.get("origin");
  const origineAutorisee = origineApplication(req);

  if (origine && origine !== origineAutorisee) {
    return NextResponse.json({ error: "Requête refusée" }, { status: 403 });
  }

  const siteFetch = req.headers.get("sec-fetch-site");
  if (siteFetch === "cross-site") {
    return NextResponse.json({ error: "Requête refusée" }, { status: 403 });
  }

  return null;
}

function nettoyerRateLimitsExpires(maintenant: number) {
  for (const [cle, entree] of compteursRateLimit.entries()) {
    if (entree.reinitialisationA <= maintenant) {
      compteursRateLimit.delete(cle);
    }
  }
}

export function verifierRateLimit(
  cle: string,
  limite: number,
  fenetreMs: number,
): { autorise: true } | { autorise: false; attenteSecondes: number } {
  const maintenant = Date.now();
  nettoyerRateLimitsExpires(maintenant);

  const entree = compteursRateLimit.get(cle);
  if (!entree || entree.reinitialisationA <= maintenant) {
    compteursRateLimit.set(cle, {
      nombreRequetes: 1,
      reinitialisationA: maintenant + fenetreMs,
    });
    return { autorise: true };
  }

  if (entree.nombreRequetes >= limite) {
    return {
      autorise: false,
      attenteSecondes: Math.max(
        1,
        Math.ceil((entree.reinitialisationA - maintenant) / 1000),
      ),
    };
  }

  entree.nombreRequetes += 1;
  return { autorise: true };
}

export function reponseRateLimit(attenteSecondes: number): NextResponse {
  return NextResponse.json(
    { error: "Trop de tentatives. Veuillez réessayer plus tard." },
    {
      status: 429,
      headers: {
        "Retry-After": String(attenteSecondes),
      },
    },
  );
}
