import { afterEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  recupererSession: vi.fn(),
}));

vi.mock("@/lib/sessionServeur", () => ({
  recupererSession: mocks.recupererSession,
}));

import { executerRouteAvecLogs } from "@/lib/api/routeAvecLogs";
import { journal } from "@/lib/logger";

describe("journal technique", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    mocks.recupererSession.mockReset();
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
    mocks.recupererSession.mockResolvedValue({ user: { id: "user_123" } });
    const reponse = await executerRouteAvecLogs(
      new Request("https://example.test/api/test?email=membre@example.test"),
      () => Response.json({ error: "Requête invalide" }, { status: 400 }),
    );

    expect(reponse.headers.get("X-Request-Id")).toBeTruthy();
    const entree = JSON.parse(espion.mock.calls[0][0] as string);
    expect(entree.evenement).toBe("api.requete_rejetee");
    expect(entree.contexte.route).toBe("/api/test");
    expect(entree.contexte.statut).toBe(400);
    expect(entree.contexte.identifiantUtilisateur).toBe("user_123");
  });

  it("indique une identité utilisateur absente pour une requête anonyme", async () => {
    const espion = vi.spyOn(console, "warn").mockImplementation(() => {});
    mocks.recupererSession.mockResolvedValue(null);

    await executerRouteAvecLogs(
      new Request("https://example.test/api/test"),
      () => Response.json({ error: "Non autorisé" }, { status: 401 }),
    );

    const entree = JSON.parse(espion.mock.calls[0][0] as string);
    expect(entree.contexte.identifiantUtilisateur).toBeNull();
  });

  it("convertit une exception non interceptée en réponse 500", async () => {
    const espion = vi.spyOn(console, "error").mockImplementation(() => {});
    mocks.recupererSession.mockResolvedValue({ user: { id: "user_123" } });
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
