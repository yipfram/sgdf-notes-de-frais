import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  recupererSession: vi.fn(),
  query: vi.fn(),
  verifierOrigineRequete: vi.fn(),
  verifierRateLimit: vi.fn(),
  reponseRateLimit: vi.fn(),
}));

vi.mock("@/lib/sessionServeur", () => ({
  recupererSession: mocks.recupererSession,
}));
vi.mock("@/lib/baseDeDonnees", () => ({ pool: { query: mocks.query } }));
vi.mock("@/lib/api/securiteRequetes", () => ({
  verifierOrigineRequete: mocks.verifierOrigineRequete,
  verifierRateLimit: mocks.verifierRateLimit,
  reponseRateLimit: mocks.reponseRateLimit,
}));

import { GET, POST } from "@/app/api/user/default-group/route";

describe("/api/user/default-group", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.recupererSession.mockResolvedValue({ user: { id: "user_1" } });
    mocks.verifierOrigineRequete.mockReturnValue(null);
    mocks.verifierRateLimit.mockReturnValue({ autorise: true });
  });

  it("renvoie le groupe principal encore accessible", async () => {
    mocks.query.mockResolvedValue({ rows: [{ organization_id: "org_1" }] });
    const reponse = await GET();

    await expect(reponse.json()).resolves.toEqual({ organizationId: "org_1" });
  });

  it("refuse de définir un groupe dont le membre ne fait pas partie", async () => {
    mocks.query.mockResolvedValue({ rowCount: 0 });
    const reponse = await POST(
      new Request("https://example.test/api/user/default-group", {
        method: "POST",
        body: JSON.stringify({ organizationId: "org_2" }),
      }),
    );

    expect(reponse.status).toBe(403);
    expect(mocks.query).toHaveBeenCalledTimes(1);
  });

  it("enregistre un groupe accessible", async () => {
    mocks.query
      .mockResolvedValueOnce({ rowCount: 1 })
      .mockResolvedValueOnce({});
    const reponse = await POST(
      new Request("https://example.test/api/user/default-group", {
        method: "POST",
        body: JSON.stringify({ organizationId: "org_1" }),
      }),
    );

    expect(reponse.status).toBe(200);
    expect(mocks.query).toHaveBeenCalledTimes(2);
  });
});
