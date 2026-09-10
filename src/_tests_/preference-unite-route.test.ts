import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  recupererContexteGroupe: vi.fn(),
  recupererSession: vi.fn(),
  recupererGroupeActif: vi.fn(),
  query: vi.fn(),
  verifierOrigineRequete: vi.fn(),
  verifierRateLimit: vi.fn(),
}));

vi.mock("@/lib/sessionServeur", () => ({
  recupererContexteGroupe: mocks.recupererContexteGroupe,
  recupererSession: mocks.recupererSession,
}));

vi.mock("@/lib/baseDeDonnees", () => ({ pool: { query: mocks.query } }));

vi.mock("@/lib/groupServer", () => ({
  recupererGroupeActif: mocks.recupererGroupeActif,
}));

vi.mock("@/lib/api/securiteRequetes", () => ({
  verifierOrigineRequete: mocks.verifierOrigineRequete,
  verifierRateLimit: mocks.verifierRateLimit,
  reponseRateLimit: vi.fn(),
}));

import { POST } from "@/app/api/user/unit-preference/route";

describe("POST /api/user/unit-preference", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.recupererContexteGroupe.mockResolvedValue({
      identifiantUtilisateur: "user_1",
      identifiantOrganisation: "org_1",
    });
    mocks.recupererSession.mockResolvedValue({ user: { id: "user_1" } });
    mocks.verifierOrigineRequete.mockReturnValue(null);
    mocks.verifierRateLimit.mockReturnValue({ autorise: true });
    mocks.recupererGroupeActif.mockResolvedValue({
      unites: [
        { id: "pionniers-caravelles", label: "Pionniers", color: "#E30613" },
      ],
    });
    mocks.query.mockResolvedValue({});
  });

  it("enregistre une unité valide", async () => {
    const reponse = await POST(
      new Request("https://example.test/api/user/unit-preference", {
        method: "POST",
        body: JSON.stringify({
          organizationId: "org_1",
          unitId: "pionniers-caravelles",
        }),
      }),
    );

    expect(reponse.status).toBe(200);
    expect(mocks.query).toHaveBeenCalled();
  });

  it("refuse une unité absente de la configuration du groupe", async () => {
    const reponse = await POST(
      new Request("https://example.test/api/user/unit-preference", {
        method: "POST",
        body: JSON.stringify({ organizationId: "org_1", unitId: "inconnue" }),
      }),
    );

    expect(reponse.status).toBe(400);
    expect(mocks.query).not.toHaveBeenCalled();
  });

  it("refuse une organisation différente du groupe actif", async () => {
    const reponse = await POST(
      new Request("https://example.test/api/user/unit-preference", {
        method: "POST",
        body: JSON.stringify({
          organizationId: "org_2",
          unitId: "pionniers-caravelles",
        }),
      }),
    );

    expect(reponse.status).toBe(403);
    expect(mocks.query).not.toHaveBeenCalled();
  });

  it.each([
    { identifiantUtilisateur: null, identifiantOrganisation: null },
    { identifiantUtilisateur: "user_1", identifiantOrganisation: null },
  ])("renvoie 401 sans session ou groupe actif", async (contexte) => {
    mocks.recupererContexteGroupe.mockResolvedValue(contexte);

    const reponse = await POST(
      new Request("https://example.test/api/user/unit-preference", {
        method: "POST",
        body: JSON.stringify({
          organizationId: "org_1",
          unitId: "pionniers-caravelles",
        }),
      }),
    );

    expect(reponse.status).toBe(401);
    expect(mocks.query).not.toHaveBeenCalled();
  });
});
