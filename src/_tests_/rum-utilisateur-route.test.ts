import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ recupererSession: vi.fn() }));

vi.mock("@/lib/sessionServeur", () => ({
  recupererSession: mocks.recupererSession,
}));

import { GET } from "@/app/api/observabilite/rum-utilisateur/route";

describe("GET /api/observabilite/rum-utilisateur", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("transmet l'e-mail à OpenObserve", async () => {
    mocks.recupererSession.mockResolvedValue({
      user: { email: "membre@exemple.fr" },
    });

    const reponse = await GET();
    const corps = (await reponse.json()) as { email: string };

    expect(reponse.status).toBe(200);
    expect(corps).toEqual({ email: "membre@exemple.fr" });
  });

  it("refuse les demandes sans session", async () => {
    mocks.recupererSession.mockResolvedValue(null);

    const reponse = await GET();

    expect(reponse.status).toBe(401);
  });
});
