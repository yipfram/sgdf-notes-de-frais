import { beforeEach, describe, expect, it, vi } from "vitest";
import { dechiffrerIdentifiant } from "@/lib/logger/audit";

const mocks = vi.hoisted(() => ({ recupererSession: vi.fn() }));

vi.mock("@/lib/sessionServeur", () => ({
  recupererSession: mocks.recupererSession,
}));

import { GET } from "@/app/api/observabilite/rum-utilisateur/route";

describe("GET /api/observabilite/rum-utilisateur", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("transmet un identifiant chiffré à OpenObserve", async () => {
    mocks.recupererSession.mockResolvedValue({ user: { id: "user_123" } });

    const reponse = await GET();
    const corps = (await reponse.json()) as { id: string };

    expect(reponse.status).toBe(200);
    expect(corps.id).not.toBe("user_123");
    expect(dechiffrerIdentifiant(corps.id)).toBe("user_123");
  });

  it("refuse les demandes sans session", async () => {
    mocks.recupererSession.mockResolvedValue(null);

    const reponse = await GET();

    expect(reponse.status).toBe(401);
  });
});
