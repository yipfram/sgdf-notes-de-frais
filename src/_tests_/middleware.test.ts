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
  clerkMiddleware: vi.fn(
    (handler?: MockedClerkMiddlewareHandler) =>
      handler ?? (async () => undefined),
  ),
}));

describe("Proxy(middleware) Clerk", () => {
  beforeEach(() => {
    vi.clearAllMocks();
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
});
