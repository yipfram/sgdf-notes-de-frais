/**
 * Tests for the security additions introduced in src/app/api/send-expense/route.ts:
 *   - verifierOrigineRequete is called and its response is returned
 *   - Short rate limit (2 requests / 30 seconds) is applied
 *   - Long rate limit (5 requests / 10 minutes) is applied
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest, NextResponse } from "next/server";

// ---------------------------------------------------------------------------
// Module mocks (hoisted - must be at top level)
// ---------------------------------------------------------------------------

vi.mock("@clerk/nextjs/server", () => ({
  auth: vi.fn(),
  clerkClient: vi.fn(),
}));

vi.mock("@/lib/email", () => ({
  envoyerEmail: vi.fn(),
}));

vi.mock("@/lib/api/utils", () => ({
  jsonError: vi.fn(
    (msg: string, status: number) =>
      NextResponse.json({ error: msg }, { status }),
  ),
  verifierErreur: vi.fn((err: Error) =>
    NextResponse.json({ error: err.message }, { status: 500 }),
  ),
}));

vi.mock("@/lib/api/validateBody", () => ({
  validateBody: vi.fn(),
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
import { envoyerEmail } from "@/lib/email";
import { validateBody } from "@/lib/api/validateBody";
import {
  verifierOrigineRequete,
  verifierRateLimit,
  reponseRateLimit,
} from "@/lib/api/securiteRequetes";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeRequest(headers: Record<string, string> = {}): NextRequest {
  return new NextRequest("http://localhost:3000/api/send-expense", {
    method: "POST",
    headers: { "content-type": "application/json", ...headers },
    body: JSON.stringify({
      userEmail: "user@example.com",
      amount: 10,
    }),
  });
}

const mock429Response = NextResponse.json(
  { error: "Trop de tentatives. Veuillez réessayer plus tard." },
  {
    status: 429,
    headers: { "Retry-After": "25" },
  },
);

const mock403Response = NextResponse.json(
  { error: "Requête refusée" },
  { status: 403 },
);

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("POST /api/send-expense – security additions", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Default: authenticated user
    vi.mocked(auth).mockResolvedValue({ userId: "user_test123" } as ReturnType<typeof auth> extends Promise<infer T> ? T : never);
    vi.mocked(clerkClient).mockResolvedValue({
      users: {
        getUser: vi.fn().mockResolvedValue({
          primaryEmailAddress: { emailAddress: "user@example.com" },
        }),
      },
    } as ReturnType<typeof clerkClient> extends Promise<infer T> ? T : never);

    vi.mocked(envoyerEmail).mockResolvedValue({ messageId: "msg-1" } as Awaited<ReturnType<typeof envoyerEmail>>);

    vi.mocked(validateBody).mockReturnValue({
      emailData: {
        to: "treasury@example.com",
        subject: "Test",
        html: "<p>test</p>",
        attachments: [],
        userEmail: "user@example.com",
      },
      error: null,
    } as ReturnType<typeof validateBody>);

    // Default security mocks: everything passes
    vi.mocked(verifierOrigineRequete).mockReturnValue(null);
    vi.mocked(verifierRateLimit).mockReturnValue({ autorise: true });
    vi.mocked(reponseRateLimit).mockReturnValue(mock429Response);

    // Set required env vars
    process.env.SMTP_HOST = "smtp.example.com";
    process.env.SMTP_USER = "user";
    process.env.SMTP_PASSWORD = "pass";
    process.env.NEXT_PUBLIC_TREASURY_EMAIL = "treasury@example.com";
  });

  it("calls verifierOrigineRequete with the request object", async () => {
    const { POST } = await import("@/app/api/send-expense/route");
    const req = makeRequest();
    await POST(req);
    expect(verifierOrigineRequete).toHaveBeenCalledWith(req);
  });

  it("returns the verifierOrigineRequete error response when origin check fails (403)", async () => {
    vi.mocked(verifierOrigineRequete).mockReturnValue(mock403Response);
    const { POST } = await import("@/app/api/send-expense/route");
    const req = makeRequest();

    const response = await POST(req);
    expect(response.status).toBe(403);
    const body = await response.json();
    expect(body.error).toBe("Requête refusée");
  });

  it("does not proceed to email sending when origin check fails", async () => {
    vi.mocked(verifierOrigineRequete).mockReturnValue(mock403Response);
    const { POST } = await import("@/app/api/send-expense/route");

    await POST(makeRequest());
    expect(envoyerEmail).not.toHaveBeenCalled();
  });

  it("calls verifierRateLimit twice (short + long limits) when origin check passes", async () => {
    const { POST } = await import("@/app/api/send-expense/route");
    await POST(makeRequest());
    expect(verifierRateLimit).toHaveBeenCalledTimes(2);
  });

  it("calls short rate limit with correct parameters (2 per 30s)", async () => {
    const { POST } = await import("@/app/api/send-expense/route");
    await POST(makeRequest());
    expect(verifierRateLimit).toHaveBeenCalledWith(
      "envoi-email:court:user_test123",
      2,
      30_000,
    );
  });

  it("calls long rate limit with correct parameters (5 per 10min)", async () => {
    const { POST } = await import("@/app/api/send-expense/route");
    await POST(makeRequest());
    expect(verifierRateLimit).toHaveBeenCalledWith(
      "envoi-email:long:user_test123",
      5,
      600_000,
    );
  });

  it("returns 429 when short rate limit is exceeded", async () => {
    vi.mocked(verifierRateLimit).mockReturnValueOnce({
      autorise: false,
      attenteSecondes: 25,
    });
    const { POST } = await import("@/app/api/send-expense/route");

    const response = await POST(makeRequest());
    expect(response.status).toBe(429);
  });

  it("calls reponseRateLimit with attenteSecondes when short limit is exceeded", async () => {
    vi.mocked(verifierRateLimit).mockReturnValueOnce({
      autorise: false,
      attenteSecondes: 25,
    });
    const { POST } = await import("@/app/api/send-expense/route");

    await POST(makeRequest());
    expect(reponseRateLimit).toHaveBeenCalledWith(25);
  });

  it("does not call long rate limit when short limit is exceeded (early return)", async () => {
    vi.mocked(verifierRateLimit).mockReturnValueOnce({
      autorise: false,
      attenteSecondes: 25,
    });
    const { POST } = await import("@/app/api/send-expense/route");

    await POST(makeRequest());
    // Only called once (short limit), not twice
    expect(verifierRateLimit).toHaveBeenCalledTimes(1);
  });

  it("returns 429 when long rate limit is exceeded (short limit passes)", async () => {
    vi.mocked(verifierRateLimit)
      .mockReturnValueOnce({ autorise: true }) // short limit passes
      .mockReturnValueOnce({ autorise: false, attenteSecondes: 540 }); // long limit fails
    const { POST } = await import("@/app/api/send-expense/route");

    const response = await POST(makeRequest());
    expect(response.status).toBe(429);
  });

  it("calls reponseRateLimit with correct seconds when long limit is exceeded", async () => {
    vi.mocked(verifierRateLimit)
      .mockReturnValueOnce({ autorise: true })
      .mockReturnValueOnce({ autorise: false, attenteSecondes: 540 });
    const { POST } = await import("@/app/api/send-expense/route");

    await POST(makeRequest());
    expect(reponseRateLimit).toHaveBeenCalledWith(540);
  });

  it("does not send email when long rate limit is exceeded", async () => {
    vi.mocked(verifierRateLimit)
      .mockReturnValueOnce({ autorise: true })
      .mockReturnValueOnce({ autorise: false, attenteSecondes: 540 });
    const { POST } = await import("@/app/api/send-expense/route");

    await POST(makeRequest());
    expect(envoyerEmail).not.toHaveBeenCalled();
  });

  it("returns 401 for unauthenticated requests (before security checks)", async () => {
    vi.mocked(auth).mockResolvedValue({ userId: null } as ReturnType<typeof auth> extends Promise<infer T> ? T : never);
    const { POST } = await import("@/app/api/send-expense/route");

    const response = await POST(makeRequest());
    expect(response.status).toBe(401);
    // Security functions should not be called when not authenticated
    expect(verifierOrigineRequete).not.toHaveBeenCalled();
  });

  it("uses the authenticated userId in the rate-limit key", async () => {
    vi.mocked(auth).mockResolvedValue({ userId: "specific_user_abc" } as ReturnType<typeof auth> extends Promise<infer T> ? T : never);
    vi.mocked(clerkClient).mockResolvedValue({
      users: {
        getUser: vi.fn().mockResolvedValue({
          primaryEmailAddress: { emailAddress: "user@example.com" },
        }),
      },
    } as ReturnType<typeof clerkClient> extends Promise<infer T> ? T : never);

    const { POST } = await import("@/app/api/send-expense/route");
    await POST(makeRequest());

    expect(verifierRateLimit).toHaveBeenCalledWith(
      "envoi-email:court:specific_user_abc",
      2,
      30_000,
    );
    expect(verifierRateLimit).toHaveBeenCalledWith(
      "envoi-email:long:specific_user_abc",
      5,
      600_000,
    );
  });
});