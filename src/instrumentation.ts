import type { Instrumentation } from "next";
import { journal } from "@/lib/logger";

export const onRequestError: Instrumentation.onRequestError = (
  erreur,
  requete,
  contexte,
) => {
  journal.erreur("next.exception_serveur", {
    erreur,
    methode: requete.method,
    route: requete.path.split("?")[0],
    routeType: contexte.routeType,
    routePath: contexte.routePath,
  });
};
