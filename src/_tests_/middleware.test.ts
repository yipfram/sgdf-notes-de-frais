import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ cookieSession: vi.fn() }));

vi.mock("better-auth/cookies", () => ({
  getSessionCookie: mocks.cookieSession,
}));

function requete(pathname: string) {
  return {
    nextUrl: { pathname },
    headers: new Headers(),
    url: `https://example.test${pathname}`,
  } as never;
}

describe("Proxy Better Auth", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    delete process.env.MAINTENANCE_MODE;
  });

  it.each(["/", "/api/send-expense", "/api/user/unit-preference"])(
    "redirige une route protégée sans session : %s",
    async (pathname) => {
      mocks.cookieSession.mockReturnValue(null);
      const { default: proxy } = await import("../proxy");
      const reponse = proxy(requete(pathname));

      if (pathname.startsWith("/api/")) {
        expect(reponse.status).toBe(401);
      } else {
        expect(reponse.headers.get("location")).toContain("/sign-in");
      }
    },
  );

  it("redirige les pages vers la maintenance lorsqu'elle est active", async () => {
    process.env.MAINTENANCE_MODE = "true";
    const { default: proxy } = await import("../proxy");
    const response = proxy(requete("/"));

    expect(response).toMatchObject({ status: 307 });
    expect((response as Response).headers.get("location")).toBe(
      "https://example.test/maintenance",
    );
  });

  it("renvoie 503 pour les API pendant la maintenance", async () => {
    process.env.MAINTENANCE_MODE = "true";
    const { default: proxy } = await import("../proxy");
    const response = proxy(requete("/api/send-expense"));

    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toEqual({
      erreur: "Service en maintenance",
      status: "maintenance",
    });
  });

  it("indique la maintenance au contrôle de santé", async () => {
    process.env.MAINTENANCE_MODE = "true";
    const { default: proxy } = await import("../proxy");
    const response = proxy(requete("/api/health"));

    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toEqual({
      ok: false,
      status: "maintenance",
    });
  });

  it("laisse la page de maintenance accessible", async () => {
    process.env.MAINTENANCE_MODE = "true";
    const { default: proxy } = await import("../proxy");
    expect(proxy(requete("/maintenance")).status).toBe(200);
  });
});
