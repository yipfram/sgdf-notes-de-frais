import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  auth: vi.fn(),
  clerkClient: vi.fn(),
  recupererGroupeActif: vi.fn(),
  verifierOrigineRequete: vi.fn(),
  verifierRateLimit: vi.fn(),
}));

vi.mock("@clerk/nextjs/server", () => ({
  auth: mocks.auth,
  clerkClient: mocks.clerkClient,
}));

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
  const updateUser = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mocks.auth.mockResolvedValue({ userId: "user_1", orgId: "org_1" });
    mocks.verifierOrigineRequete.mockReturnValue(null);
    mocks.verifierRateLimit.mockReturnValue({ autorise: true });
    mocks.recupererGroupeActif.mockResolvedValue({
      unites: [
        { id: "pionniers-caravelles", label: "Pionniers", color: "#E30613" },
      ],
    });
    mocks.clerkClient.mockResolvedValue({
      users: {
        getUser: vi.fn().mockResolvedValue({
          publicMetadata: {
            autrePreference: "conservée",
            unitesSelectionneesParOrganisation: { org_2: "groupe" },
          },
        }),
        updateUser,
      },
    });
  });

  it("enregistre une unité valide sans écraser les autres métadonnées", async () => {
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
    expect(updateUser).toHaveBeenCalledWith("user_1", {
      publicMetadata: {
        autrePreference: "conservée",
        unitesSelectionneesParOrganisation: {
          org_1: "pionniers-caravelles",
          org_2: "groupe",
        },
      },
    });
  });

  it("refuse une unité absente de la configuration du groupe", async () => {
    const reponse = await POST(
      new Request("https://example.test/api/user/unit-preference", {
        method: "POST",
        body: JSON.stringify({ organizationId: "org_1", unitId: "inconnue" }),
      }),
    );

    expect(reponse.status).toBe(400);
    expect(updateUser).not.toHaveBeenCalled();
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
    expect(updateUser).not.toHaveBeenCalled();
  });

  it.each([
    { userId: null, orgId: null },
    { userId: "user_1", orgId: null },
  ])("renvoie 401 sans session ou groupe actif", async (authentification) => {
    mocks.auth.mockResolvedValue(authentification);

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
    expect(updateUser).not.toHaveBeenCalled();
  });
});
