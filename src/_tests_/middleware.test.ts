import { beforeEach, describe, expect, it, vi } from "vitest";

type AuthMock = {
  protect: ReturnType<typeof vi.fn>;
};

type MiddlewareRequestMock = {
  nextUrl: { pathname: string };
  url: string;
};

type MockedClerkMiddlewareHandler = (
  auth: AuthMock,
  req: MiddlewareRequestMock,
) => Promise<Response | void>;

vi.mock("@clerk/nextjs/server", () => ({
  clerkMiddleware: vi.fn(
    (handler?: MockedClerkMiddlewareHandler) =>
      handler ?? (async () => undefined),
  ),
}));

describe("Proxy(middleware) Clerk", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    delete process.env.MAINTENANCE_MODE;
  });

  it.each(["/", "/api/send-expense", "/api/user/unit-preference"])(
    "ne protège plus la route par son chemin : %s",
    async (pathname) => {
      const { default: middleware } = await import("../proxy");
      const handleRequest =
        middleware as unknown as MockedClerkMiddlewareHandler;
      const auth = { protect: vi.fn().mockResolvedValue(undefined) };

      await handleRequest(auth, {
        nextUrl: { pathname },
        url: `https://example.test${pathname}`,
      });

      expect(auth.protect).not.toHaveBeenCalled();
    },
  );

  it("redirige les pages vers la maintenance lorsqu'elle est active", async () => {
    process.env.MAINTENANCE_MODE = "true";
    const { default: middleware } = await import("../proxy");
    const handleRequest = middleware as unknown as MockedClerkMiddlewareHandler;

    const response = await handleRequest(
      { protect: vi.fn() },
      { nextUrl: { pathname: "/" }, url: "https://example.test/" },
    );

    expect(response).toMatchObject({ status: 307 });
    expect((response as Response).headers.get("location")).toBe(
      "https://example.test/maintenance",
    );
  });

  it("renvoie 503 pour les API pendant la maintenance", async () => {
    process.env.MAINTENANCE_MODE = "true";
    const { default: middleware } = await import("../proxy");
    const handleRequest = middleware as unknown as MockedClerkMiddlewareHandler;

    const response = (await handleRequest(
      { protect: vi.fn() },
      {
        nextUrl: { pathname: "/api/send-expense" },
        url: "https://example.test/api/send-expense",
      },
    )) as Response;

    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toEqual({
      erreur: "Service en maintenance",
      status: "maintenance",
    });
  });

  it("indique la maintenance au contrôle de santé", async () => {
    process.env.MAINTENANCE_MODE = "true";
    const { default: middleware } = await import("../proxy");
    const handleRequest = middleware as unknown as MockedClerkMiddlewareHandler;

    const response = (await handleRequest(
      { protect: vi.fn() },
      {
        nextUrl: { pathname: "/api/health" },
        url: "https://example.test/api/health",
      },
    )) as Response;

    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toEqual({
      ok: false,
      status: "maintenance",
    });
  });

  it("laisse la page de maintenance accessible", async () => {
    process.env.MAINTENANCE_MODE = "true";
    const { default: middleware } = await import("../proxy");
    const handleRequest = middleware as unknown as MockedClerkMiddlewareHandler;

    await expect(
      handleRequest(
        { protect: vi.fn() },
        {
          nextUrl: { pathname: "/maintenance" },
          url: "https://example.test/maintenance",
        },
      ),
    ).resolves.toBeUndefined();
  });
});
