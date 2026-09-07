import { afterEach, describe, expect, it, vi } from "vitest";
import { executerRouteAvecLogs } from "@/lib/api/routeAvecLogs";
import { journal } from "@/lib/logger";

describe("journal technique", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("masque les données sensibles dans une erreur", () => {
    const espion = vi.spyOn(console, "error").mockImplementation(() => {});

    journal.erreur("test.erreur", {
      emailUtilisateur: "membre@example.test",
      motDePasse: "secret",
      erreur: new Error("Échec pour membre@example.test"),
    });

    const entree = JSON.parse(espion.mock.calls[0][0] as string);
    expect(entree.contexte.emailUtilisateur).toBe("[masqué]");
    expect(entree.contexte.motDePasse).toBe("[masqué]");
    expect(entree.contexte.erreur.message).not.toContain("membre@example.test");
  });

  it("ajoute un identifiant de requête et journalise les rejets", async () => {
    const espion = vi.spyOn(console, "warn").mockImplementation(() => {});
    const reponse = await executerRouteAvecLogs(
      new Request("https://example.test/api/test?email=membre@example.test"),
      () => Response.json({ error: "Requête invalide" }, { status: 400 }),
    );

    expect(reponse.headers.get("X-Request-Id")).toBeTruthy();
    const entree = JSON.parse(espion.mock.calls[0][0] as string);
    expect(entree.evenement).toBe("api.requete_rejetee");
    expect(entree.contexte.route).toBe("/api/test");
    expect(entree.contexte.statut).toBe(400);
  });

  it("convertit une exception non interceptée en réponse 500", async () => {
    const espion = vi.spyOn(console, "error").mockImplementation(() => {});
    const reponse = await executerRouteAvecLogs(
      new Request("https://example.test/api/test"),
      () => {
        throw new Error("Erreur inattendue");
      },
    );

    expect(reponse.status).toBe(500);
    expect(reponse.headers.get("X-Request-Id")).toBeTruthy();
    expect(JSON.parse(espion.mock.calls[0][0] as string).evenement).toBe(
      "api.exception_non_interceptee",
    );
  });
});
