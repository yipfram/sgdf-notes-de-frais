import { describe, expect, it, vi } from "vitest";
import {
  actionAuditAuthentification,
  journaliserAuditAuthentification,
  pseudonymiserIdentifiant,
} from "@/lib/auditAuthentification";

describe("audit Better Auth", () => {
  it("pseudonymise les identifiants de façon stable", () => {
    expect(pseudonymiserIdentifiant("user_123")).toBe(
      pseudonymiserIdentifiant("user_123"),
    );
    expect(pseudonymiserIdentifiant("user_123")).not.toBe(
      pseudonymiserIdentifiant("user_456"),
    );
  });

  it("reconnaît les actions d’authentification et d’organisation", () => {
    expect(actionAuditAuthentification("/sign-in/email")).toBe("connexion");
    expect(actionAuditAuthentification("/organization/invite-member")).toBe(
      "membre_invite",
    );
    expect(actionAuditAuthentification("/get-session")).toBeNull();
  });

  it("écrit un échec sans identifiant brut ni donnée sensible", () => {
    const espion = vi.spyOn(console, "warn").mockImplementation(() => {});
    journaliserAuditAuthentification({
      chemin: "/organization/invite-member",
      resultat: "echec",
      contexte: { session: { userId: "user_123" } },
      corps: { organizationId: "org_456", email: "membre@example.test" },
      codeErreur: "FORBIDDEN",
    });

    const sortie = espion.mock.calls[0][0] as string;
    const entree = JSON.parse(sortie) as {
      evenement: string;
      contexte: Record<string, unknown>;
    };
    expect(entree.evenement).toBe("auth.audit.membre_invite");
    expect(entree.contexte).toMatchObject({
      resultat: "echec",
      codeErreur: "FORBIDDEN",
    });
    expect(sortie).not.toContain("user_123");
    expect(sortie).not.toContain("org_456");
    expect(sortie).not.toContain("membre@example.test");
    espion.mockRestore();
  });
});
