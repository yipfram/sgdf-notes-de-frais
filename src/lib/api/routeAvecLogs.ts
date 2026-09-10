import { NextResponse } from "next/server";
import { journal } from "@/lib/logger";
import { recupererSession } from "@/lib/sessionServeur";

type GestionnaireRoute = () => Response | Promise<Response>;

function cheminSansParametres(requete: Request) {
  try {
    return new URL(requete.url).pathname;
  } catch {
    return "inconnu";
  }
}

export async function executerRouteAvecLogs(
  requete: Request,
  gestionnaire: GestionnaireRoute,
): Promise<Response> {
  const identifiantRequete = crypto.randomUUID();
  const contexte: {
    identifiantRequete: string;
    identifiantUtilisateur: string | null;
    methode: string;
    route: string;
  } = {
    identifiantRequete,
    identifiantUtilisateur: null,
    methode: requete.method,
    route: cheminSansParametres(requete),
  };

  try {
    const session = await recupererSession();
    contexte.identifiantUtilisateur = session?.user.id ?? null;
    const reponse = await gestionnaire();
    const entetes = new Headers(reponse.headers);
    entetes.set("X-Request-Id", identifiantRequete);

    if (reponse.status >= 500) {
      journal.erreur("api.reponse_serveur_en_erreur", {
        ...contexte,
        statut: reponse.status,
      });
    } else if (reponse.status >= 400) {
      journal.avertissement("api.requete_rejetee", {
        ...contexte,
        statut: reponse.status,
      });
    }

    return new Response(reponse.body, {
      status: reponse.status,
      statusText: reponse.statusText,
      headers: entetes,
    });
  } catch (erreur) {
    journal.erreur("api.exception_non_interceptee", { ...contexte, erreur });
    return NextResponse.json(
      { error: "Erreur interne" },
      {
        status: 500,
        headers: { "X-Request-Id": identifiantRequete },
      },
    );
  }
}
