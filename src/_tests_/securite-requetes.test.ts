import { afterEach, describe, expect, it, vi } from "vitest";
import { verifierOrigineRequete } from "@/lib/api/securiteRequetes";

const urlApplicationInitiale = process.env.APP_URL;

afterEach(() => {
  if (urlApplicationInitiale === undefined) {
    delete process.env.APP_URL;
  } else {
    process.env.APP_URL = urlApplicationInitiale;
  }
});

describe("verifierOrigineRequete", () => {
  it("accepte l’origine publique configurée derrière un proxy", () => {
    process.env.APP_URL = "https://app.scouticket.fr";
    const requete = new Request("http://app:3000/api/group/config", {
      headers: {
        origin: "https://app.scouticket.fr",
        "x-forwarded-host": "tunnel-interne.example",
        "x-forwarded-proto": "http",
      },
    });

    expect(verifierOrigineRequete(requete)).toBeNull();
  });

  it("refuse et journalise une origine différente de l’URL publique", async () => {
    process.env.APP_URL = "https://app.scouticket.fr";
    const espion = vi.spyOn(console, "warn").mockImplementation(() => {});
    const requete = new Request("http://app:3000/api/group/config", {
      headers: { origin: "https://site-tiers.example" },
    });

    const reponse = verifierOrigineRequete(requete);

    expect(reponse?.status).toBe(403);
    await expect(reponse?.json()).resolves.toEqual({
      error: "Requête refusée",
    });
    const entree = JSON.parse(espion.mock.calls[0][0] as string);
    expect(entree.contexte).toMatchObject({
      motif: "origine-differente",
      origineRecue: "https://site-tiers.example",
      origineAutorisee: "https://app.scouticket.fr",
    });
    espion.mockRestore();
  });

  it("refuse une requête intersite, même sans en-tête Origin", () => {
    process.env.APP_URL = "https://app.scouticket.fr";
    const requete = new Request("http://app:3000/api/group/config", {
      headers: { "sec-fetch-site": "cross-site" },
    });

    expect(verifierOrigineRequete(requete)?.status).toBe(403);
  });
});
