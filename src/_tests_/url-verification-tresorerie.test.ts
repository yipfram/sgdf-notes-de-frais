import { afterEach, describe, expect, it, vi } from "vitest";
import { creerUrlVerificationTresorerie } from "@/lib/treasuryVerification";

const urlApplicationInitiale = process.env.APP_URL;

afterEach(() => {
  if (urlApplicationInitiale === undefined) delete process.env.APP_URL;
  else process.env.APP_URL = urlApplicationInitiale;
  vi.unstubAllEnvs();
});

describe("URL de vérification de la trésorerie", () => {
  it("utilise l'URL publique configurée", () => {
    vi.stubEnv("APP_URL", "https://treso.exemple.fr/");

    expect(creerUrlVerificationTresorerie("org_123", "jeton-test")).toBe(
      "https://treso.exemple.fr/verify-treasury?org=org_123&token=jeton-test",
    );
  });

  it("refuse de générer un lien sans URL publique", () => {
    vi.stubEnv("APP_URL", "");

    expect(() =>
      creerUrlVerificationTresorerie("org_123", "jeton-test"),
    ).toThrow("APP_URL_UNDEFINED");
  });
});
