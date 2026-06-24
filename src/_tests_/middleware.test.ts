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
) => Promise<void>;

vi.mock("@clerk/nextjs/server", () => ({
  clerkMiddleware: vi.fn((handler) => handler),
  createRouteMatcher: vi.fn((routes: string[]) => {
    return (req: { nextUrl?: { pathname: string }; url?: string }) => {
      const pathname =
        req.nextUrl?.pathname ?? (req.url ? new URL(req.url).pathname : "");

      return routes.includes(pathname);
    };
  }),
}));

describe("Proxy(middleware) Clerk", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it.each(["/", "/api/send-expense", "/api/update-branch"])(
    "protege la route %s",
    async (pathname) => {
      const { default: middleware } = await import("../proxy");
      const handleRequest =
        middleware as unknown as MockedClerkMiddlewareHandler;
      const auth = { protect: vi.fn().mockResolvedValue(undefined) };

      await handleRequest(auth, {
        nextUrl: { pathname },
        url: `https://example.test${pathname}`,
      });

      expect(auth.protect).toHaveBeenCalledTimes(1);
    },
  );

  it("ne protege pas les routes publiques", async () => {
    const { default: middleware } = await import("../proxy");
    const handleRequest = middleware as unknown as MockedClerkMiddlewareHandler;
    const auth = { protect: vi.fn().mockResolvedValue(undefined) };

    await handleRequest(auth, {
      nextUrl: { pathname: "/sign-in" },
      url: "https://example.test/sign-in",
    });

    expect(auth.protect).not.toHaveBeenCalled();
  });
});
