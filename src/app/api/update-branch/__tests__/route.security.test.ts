/**
 * Tests for the security additions introduced in src/app/api/update-branch/route.ts:
 *   - verifierOrigineRequete is called and its response is returned
 *   - Rate limit (30 requests / 60 seconds) is applied per user
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextResponse } from "next/server";

// ---------------------------------------------------------------------------
// Module mocks (hoisted - must be at top level)
// ---------------------------------------------------------------------------

vi.mock("@clerk/nextjs/server", () => ({
  auth: vi.fn(),
  clerkClient: vi.fn(),
}));

vi.mock("@/lib/branches", () => ({
  ALL_BRANCHES: ["Scouts", "Louveteaux", "Guides", "Routiers"],
}));

vi.mock("@/lib/api/securiteRequetes", () => ({
  verifierOrigineRequete: vi.fn(),
  verifierRateLimit: vi.fn(),
  reponseRateLimit: vi.fn(),
}));

// ---------------------------------------------------------------------------
// Imports (after mocks)
// ---------------------------------------------------------------------------

import { auth, clerkClient } from "@clerk/nextjs/server";
import {
  verifierOrigineRequete,
  verifierRateLimit,
  reponseRateLimit,
} from "@/lib/api/securiteRequetes";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeRequest(
  body: unknown = { branch: "Scouts" },
  headers: Record<string, string> = {},
): Request {
  return new Request("http://localhost:3000/api/update-branch", {
    method: "POST",
    headers: { "content-type": "application/json", ...headers },
    body: JSON.stringify(body),
  });
}

const mock429Response = NextResponse.json(
  { error: "Trop de tentatives. Veuillez réessayer plus tard." },
  { status: 429, headers: { "Retry-After": "50" } },
);

const mock403Response = NextResponse.json(
  { error: "Requête refusée" },
  { status: 403 },
);

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("POST /api/update-branch – security additions", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Default: authenticated user
    vi.mocked(auth).mockResolvedValue({
      userId: "user_branch_test",
    } as ReturnType<typeof auth> extends Promise<infer T> ? T : never);

    vi.mocked(clerkClient).mockResolvedValue({
      users: {
        updateUser: vi.fn().mockResolvedValue({}),
      },
    } as ReturnType<typeof clerkClient> extends Promise<infer T> ? T : never);

    // Default security mocks: everything passes
    vi.mocked(verifierOrigineRequete).mockReturnValue(null);
    vi.mocked(verifierRateLimit).mockReturnValue({ autorise: true });
    vi.mocked(reponseRateLimit).mockReturnValue(mock429Response);
  });

  it("calls verifierOrigineRequete with the request object", async () => {
    const { POST } = await import("@/app/api/update-branch/route");
    const req = makeRequest();
    await POST(req);
    expect(verifierOrigineRequete).toHaveBeenCalledWith(req);
  });

  it("returns the verifierOrigineRequete error response when origin check fails (403)", async () => {
    vi.mocked(verifierOrigineRequete).mockReturnValue(mock403Response);
    const { POST } = await import("@/app/api/update-branch/route");

    const response = await POST(makeRequest());
    expect(response.status).toBe(403);
    const body = await response.json();
    expect(body.error).toBe("Requête refusée");
  });

  it("does not call verifierRateLimit when origin check fails", async () => {
    vi.mocked(verifierOrigineRequete).mockReturnValue(mock403Response);
    const { POST } = await import("@/app/api/update-branch/route");

    await POST(makeRequest());
    expect(verifierRateLimit).not.toHaveBeenCalled();
  });

  it("calls verifierRateLimit with correct parameters (30 per 60s)", async () => {
    const { POST } = await import("@/app/api/update-branch/route");
    await POST(makeRequest());
    expect(verifierRateLimit).toHaveBeenCalledWith(
      "maj-branche:user_branch_test",
      30,
      60_000,
    );
  });

  it("calls verifierRateLimit exactly once per request", async () => {
    const { POST } = await import("@/app/api/update-branch/route");
    await POST(makeRequest());
    expect(verifierRateLimit).toHaveBeenCalledTimes(1);
  });

  it("returns 429 when rate limit is exceeded", async () => {
    vi.mocked(verifierRateLimit).mockReturnValue({
      autorise: false,
      attenteSecondes: 50,
    });
    const { POST } = await import("@/app/api/update-branch/route");

    const response = await POST(makeRequest());
    expect(response.status).toBe(429);
  });

  it("calls reponseRateLimit with attenteSecondes when rate limit is exceeded", async () => {
    vi.mocked(verifierRateLimit).mockReturnValue({
      autorise: false,
      attenteSecondes: 50,
    });
    const { POST } = await import("@/app/api/update-branch/route");

    await POST(makeRequest());
    expect(reponseRateLimit).toHaveBeenCalledWith(50);
  });

  it("does not update user branch when rate limited", async () => {
    vi.mocked(verifierRateLimit).mockReturnValue({
      autorise: false,
      attenteSecondes: 50,
    });
    const mockUpdateUser = vi.fn().mockResolvedValue({});
    vi.mocked(clerkClient).mockResolvedValue({
      users: { updateUser: mockUpdateUser },
    } as ReturnType<typeof clerkClient> extends Promise<infer T> ? T : never);

    const { POST } = await import("@/app/api/update-branch/route");
    await POST(makeRequest());

    expect(mockUpdateUser).not.toHaveBeenCalled();
  });

  it("returns 429 error body with Retry-After header", async () => {
    vi.mocked(verifierRateLimit).mockReturnValue({
      autorise: false,
      attenteSecondes: 50,
    });
    const { POST } = await import("@/app/api/update-branch/route");

    const response = await POST(makeRequest());
    expect(response.status).toBe(429);
    expect(response.headers.get("Retry-After")).toBe("50");
  });

  it("returns 401 for unauthenticated requests (before security checks)", async () => {
    vi.mocked(auth).mockResolvedValue({
      userId: null,
    } as ReturnType<typeof auth> extends Promise<infer T> ? T : never);
    const { POST } = await import("@/app/api/update-branch/route");

    const response = await POST(makeRequest());
    expect(response.status).toBe(401);
    // Security functions must not be called before auth check
    expect(verifierOrigineRequete).not.toHaveBeenCalled();
    expect(verifierRateLimit).not.toHaveBeenCalled();
  });

  it("uses the authenticated userId in the rate-limit key", async () => {
    vi.mocked(auth).mockResolvedValue({
      userId: "custom_user_xyz",
    } as ReturnType<typeof auth> extends Promise<infer T> ? T : never);
    vi.mocked(clerkClient).mockResolvedValue({
      users: { updateUser: vi.fn().mockResolvedValue({}) },
    } as ReturnType<typeof clerkClient> extends Promise<infer T> ? T : never);

    const { POST } = await import("@/app/api/update-branch/route");
    await POST(makeRequest());

    expect(verifierRateLimit).toHaveBeenCalledWith(
      "maj-branche:custom_user_xyz",
      30,
      60_000,
    );
  });

  it("proceeds to update branch when all security checks pass", async () => {
    const mockUpdateUser = vi.fn().mockResolvedValue({});
    vi.mocked(clerkClient).mockResolvedValue({
      users: { updateUser: mockUpdateUser },
    } as ReturnType<typeof clerkClient> extends Promise<infer T> ? T : never);

    const { POST } = await import("@/app/api/update-branch/route");
    const response = await POST(makeRequest({ branch: "Scouts" }));

    expect(mockUpdateUser).toHaveBeenCalledWith("user_branch_test", {
      publicMetadata: { branch: "Scouts" },
    });
    expect(response.status).toBe(200);
  });

  it("returns success JSON when security passes and branch is valid", async () => {
    vi.mocked(clerkClient).mockResolvedValue({
      users: { updateUser: vi.fn().mockResolvedValue({}) },
    } as ReturnType<typeof clerkClient> extends Promise<infer T> ? T : never);

    const { POST } = await import("@/app/api/update-branch/route");
    const response = await POST(makeRequest({ branch: "Guides" }));

    const body = await response.json();
    expect(body.success).toBe(true);
    expect(body.branch).toBe("Guides");
  });
});