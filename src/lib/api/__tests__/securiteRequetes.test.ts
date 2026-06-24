import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Mock next/server before any imports of the module under test
vi.mock("next/server", () => {
  return {
    NextResponse: {
      json: vi.fn((body: unknown, init?: ResponseInit & { headers?: Record<string, string> }) => {
        const headers: Record<string, string> = {};
        if (init?.headers) {
          Object.assign(headers, init.headers);
        }
        return {
          status: init?.status ?? 200,
          headers: {
            get: (key: string) => headers[key] ?? null,
            entries: () => Object.entries(headers),
          },
          json: async () => body,
          _body: body,
          _headers: headers,
        };
      }),
    },
  };
});

// Each describe block re-imports the module for a fresh Map state
// We use vi.resetModules() to clear the module cache between groups.

describe("verifierOrigineRequete", () => {
  let verifierOrigineRequete: (req: Request) => unknown;

  beforeEach(async () => {
    vi.resetModules();
    // Re-mock after resetModules
    vi.mock("next/server", () => {
      return {
        NextResponse: {
          json: vi.fn((body: unknown, init?: ResponseInit & { headers?: Record<string, string> }) => {
            const headers: Record<string, string> = {};
            if (init?.headers) {
              Object.assign(headers, init.headers);
            }
            return {
              status: init?.status ?? 200,
              headers: {
                get: (key: string) => headers[key] ?? null,
              },
              json: async () => body,
              _body: body,
            };
          }),
        },
      };
    });
    const mod = await import("@/lib/api/securiteRequetes");
    verifierOrigineRequete = mod.verifierOrigineRequete;
  });

  afterEach(() => {
    vi.resetModules();
  });

  it("returns null when no origin header and no sec-fetch-site header are present", () => {
    const req = new Request("http://localhost:3000/api/test");
    const result = verifierOrigineRequete(req);
    expect(result).toBeNull();
  });

  it("returns null when origin matches the app origin derived from x-forwarded headers", () => {
    const req = new Request("http://localhost:3000/api/test", {
      headers: {
        origin: "https://app.example.com",
        "x-forwarded-proto": "https",
        "x-forwarded-host": "app.example.com",
      },
    });
    const result = verifierOrigineRequete(req);
    expect(result).toBeNull();
  });

  it("returns 403 when origin header does not match app origin", () => {
    const req = new Request("http://localhost:3000/api/test", {
      headers: {
        origin: "https://evil.example.com",
        "x-forwarded-proto": "https",
        "x-forwarded-host": "app.example.com",
      },
    });
    const result = verifierOrigineRequete(req) as { status: number; _body: { error: string } };
    expect(result).not.toBeNull();
    expect(result.status).toBe(403);
  });

  it("returns 403 response body with error 'Requête refusée' on origin mismatch", async () => {
    const req = new Request("http://localhost:3000/api/test", {
      headers: {
        origin: "https://attacker.com",
        "x-forwarded-proto": "https",
        "x-forwarded-host": "app.example.com",
      },
    });
    const result = verifierOrigineRequete(req) as { status: number; json: () => Promise<{ error: string }> };
    const body = await result.json();
    expect(body.error).toBe("Requête refusée");
  });

  it("returns 403 when sec-fetch-site is 'cross-site'", () => {
    const req = new Request("http://localhost:3000/api/test", {
      headers: {
        "sec-fetch-site": "cross-site",
      },
    });
    const result = verifierOrigineRequete(req) as { status: number };
    expect(result).not.toBeNull();
    expect(result.status).toBe(403);
  });

  it("returns null when sec-fetch-site is 'same-origin'", () => {
    const req = new Request("http://localhost:3000/api/test", {
      headers: {
        "sec-fetch-site": "same-origin",
      },
    });
    const result = verifierOrigineRequete(req);
    expect(result).toBeNull();
  });

  it("returns null when sec-fetch-site is 'same-site'", () => {
    const req = new Request("http://localhost:3000/api/test", {
      headers: {
        "sec-fetch-site": "same-site",
      },
    });
    const result = verifierOrigineRequete(req);
    expect(result).toBeNull();
  });

  it("returns null when origin matches URL origin (no forwarded headers)", () => {
    const req = new Request("http://localhost:3000/api/test", {
      headers: {
        origin: "http://localhost:3000",
      },
    });
    const result = verifierOrigineRequete(req);
    expect(result).toBeNull();
  });

  it("returns 403 when origin differs from URL origin and no forwarded headers", () => {
    const req = new Request("http://localhost:3000/api/test", {
      headers: {
        origin: "http://other-site.com",
      },
    });
    const result = verifierOrigineRequete(req) as { status: number };
    expect(result).not.toBeNull();
    expect(result.status).toBe(403);
  });

  it("uses x-forwarded-host over host header when building app origin", () => {
    // When x-forwarded-host is present, it takes precedence over host
    const req = new Request("http://proxy.internal/api/test", {
      headers: {
        origin: "https://real-app.com",
        "x-forwarded-proto": "https",
        "x-forwarded-host": "real-app.com",
        host: "proxy.internal",
      },
    });
    const result = verifierOrigineRequete(req);
    expect(result).toBeNull();
  });

  it("falls back to host header when x-forwarded-host is absent", () => {
    const req = new Request("http://localhost:3000/api/test", {
      headers: {
        origin: "http://localhost:3000",
        "x-forwarded-proto": "http",
        host: "localhost:3000",
      },
    });
    const result = verifierOrigineRequete(req);
    expect(result).toBeNull();
  });

  it("cross-site check takes priority even if no origin header is set", async () => {
    // sec-fetch-site: cross-site without origin header should still block
    const req = new Request("http://localhost:3000/api/test", {
      headers: {
        "sec-fetch-site": "cross-site",
      },
    });
    const result = verifierOrigineRequete(req) as { status: number; json: () => Promise<{ error: string }> };
    expect(result.status).toBe(403);
    const body = await result.json();
    expect(body.error).toBe("Requête refusée");
  });
});

describe("verifierRateLimit", () => {
  let verifierRateLimit: (
    cle: string,
    limite: number,
    fenetreMs: number,
  ) => { autorise: true } | { autorise: false; attenteSecondes: number };

  beforeEach(async () => {
    vi.resetModules();
    vi.useFakeTimers();
    vi.mock("next/server", () => ({
      NextResponse: {
        json: vi.fn((body: unknown, init?: { status?: number }) => ({
          status: init?.status ?? 200,
          json: async () => body,
        })),
      },
    }));
    const mod = await import("@/lib/api/securiteRequetes");
    verifierRateLimit = mod.verifierRateLimit;
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.resetModules();
  });

  it("allows the first request", () => {
    const result = verifierRateLimit("test-key-first", 3, 60_000);
    expect(result).toEqual({ autorise: true });
  });

  it("allows requests up to the limit", () => {
    const key = "test-key-up-to-limit";
    const limit = 5;
    for (let i = 0; i < limit; i++) {
      const result = verifierRateLimit(key, limit, 60_000);
      expect(result).toEqual({ autorise: true });
    }
  });

  it("blocks the request when limit is exceeded", () => {
    const key = "test-key-block";
    const limit = 3;
    for (let i = 0; i < limit; i++) {
      verifierRateLimit(key, limit, 60_000);
    }
    const result = verifierRateLimit(key, limit, 60_000);
    expect(result).toMatchObject({ autorise: false });
  });

  it("blocked result includes attenteSecondes >= 1", () => {
    const key = "test-key-wait";
    const limit = 2;
    verifierRateLimit(key, limit, 60_000);
    verifierRateLimit(key, limit, 60_000);
    const result = verifierRateLimit(key, limit, 60_000) as { autorise: false; attenteSecondes: number };
    expect(result.autorise).toBe(false);
    expect(result.attenteSecondes).toBeGreaterThanOrEqual(1);
  });

  it("attenteSecondes reflects remaining window duration in seconds (rounded up)", () => {
    const key = "test-key-wait-duration";
    const limit = 1;
    const windowMs = 30_000; // 30 seconds
    verifierRateLimit(key, limit, windowMs);

    // Advance time by 10 seconds — 20 seconds remain
    vi.advanceTimersByTime(10_000);

    const result = verifierRateLimit(key, limit, windowMs) as { autorise: false; attenteSecondes: number };
    expect(result.autorise).toBe(false);
    expect(result.attenteSecondes).toBeGreaterThanOrEqual(19);
    expect(result.attenteSecondes).toBeLessThanOrEqual(21);
  });

  it("allows a new request after the window expires", async () => {
    const key = "test-key-reset";
    const limit = 2;
    const windowMs = 5_000;

    verifierRateLimit(key, limit, windowMs);
    verifierRateLimit(key, limit, windowMs);
    // Exceeded: next call is blocked
    const blocked = verifierRateLimit(key, limit, windowMs);
    expect((blocked as { autorise: boolean }).autorise).toBe(false);

    // Advance time beyond the window
    vi.advanceTimersByTime(windowMs + 1);

    const result = verifierRateLimit(key, limit, windowMs);
    expect(result).toEqual({ autorise: true });
  });

  it("independent keys do not interfere with each other", () => {
    const limit = 1;
    verifierRateLimit("key-a-independent", limit, 60_000);
    // key-a is now exhausted; key-b should still be allowed
    const resultB = verifierRateLimit("key-b-independent", limit, 60_000);
    expect(resultB).toEqual({ autorise: true });
  });

  it("enforces a limit of 1 correctly", () => {
    const key = "test-key-limit-one";
    const first = verifierRateLimit(key, 1, 60_000);
    expect(first).toEqual({ autorise: true });
    const second = verifierRateLimit(key, 1, 60_000);
    expect((second as { autorise: boolean }).autorise).toBe(false);
  });

  it("cleans up expired entries to prevent memory leaks", () => {
    // Fill with several keys that will expire
    for (let i = 0; i < 5; i++) {
      verifierRateLimit(`cleanup-key-${i}`, 10, 1_000);
    }
    // Advance past expiry; the next call should trigger cleanup
    vi.advanceTimersByTime(2_000);
    // Adding a new key triggers nettoyerRateLimitsExpires; simply assert no error thrown
    expect(() => verifierRateLimit("cleanup-trigger", 10, 60_000)).not.toThrow();
  });

  it("attenteSecondes is at least 1 even when window is about to expire", () => {
    const key = "test-key-min-wait";
    const limit = 1;
    const windowMs = 500; // 0.5 seconds

    verifierRateLimit(key, limit, windowMs);

    // Advance to 499ms — just 1ms remains in window
    vi.advanceTimersByTime(499);

    const result = verifierRateLimit(key, limit, windowMs) as { autorise: false; attenteSecondes: number };
    expect(result.autorise).toBe(false);
    expect(result.attenteSecondes).toBeGreaterThanOrEqual(1);
  });
});

describe("reponseRateLimit", () => {
  let reponseRateLimit: (attenteSecondes: number) => unknown;

  beforeEach(async () => {
    vi.resetModules();
    vi.mock("next/server", () => {
      return {
        NextResponse: {
          json: vi.fn(
            (
              body: unknown,
              init?: { status?: number; headers?: Record<string, string> },
            ) => {
              const headers: Record<string, string> = {};
              if (init?.headers) {
                Object.assign(headers, init.headers);
              }
              return {
                status: init?.status ?? 200,
                headers: {
                  get: (key: string) => headers[key] ?? null,
                },
                json: async () => body,
                _body: body,
                _headers: headers,
              };
            },
          ),
        },
      };
    });
    const mod = await import("@/lib/api/securiteRequetes");
    reponseRateLimit = mod.reponseRateLimit;
  });

  afterEach(() => {
    vi.resetModules();
  });

  it("returns a response with HTTP 429 status", () => {
    const response = reponseRateLimit(30) as { status: number };
    expect(response.status).toBe(429);
  });

  it("includes the Retry-After header set to the wait time in seconds", () => {
    const response = reponseRateLimit(45) as {
      headers: { get: (key: string) => string | null };
    };
    expect(response.headers.get("Retry-After")).toBe("45");
  });

  it("returns the correct French error message in the body", async () => {
    const response = reponseRateLimit(10) as {
      json: () => Promise<{ error: string }>;
    };
    const body = await response.json();
    expect(body.error).toBe("Trop de tentatives. Veuillez réessayer plus tard.");
  });

  it("Retry-After header is a string representation of attenteSecondes", () => {
    const response = reponseRateLimit(120) as {
      headers: { get: (key: string) => string | null };
    };
    expect(response.headers.get("Retry-After")).toBe("120");
  });

  it("works with attenteSecondes = 1 (minimum value)", async () => {
    const response = reponseRateLimit(1) as {
      status: number;
      headers: { get: (key: string) => string | null };
      json: () => Promise<{ error: string }>;
    };
    expect(response.status).toBe(429);
    expect(response.headers.get("Retry-After")).toBe("1");
    const body = await response.json();
    expect(body.error).toBeTruthy();
  });

  it("works with large attenteSecondes values", () => {
    const response = reponseRateLimit(600) as {
      status: number;
      headers: { get: (key: string) => string | null };
    };
    expect(response.status).toBe(429);
    expect(response.headers.get("Retry-After")).toBe("600");
  });
});