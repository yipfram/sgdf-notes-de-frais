import { afterEach, describe, expect, it, vi } from "vitest";
import {
  actionAuditAuthentification,
  dechiffrerIdentifiant,
  journaliserAuditAuthentification,
  pseudonymiserIdentifiant,
} from "@/lib/auditAuthentification";

describe("audit Better Auth", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("chiffre les identifiants de façon déchiffrable", () => {
    const identifiantChiffre = pseudonymiserIdentifiant("user_123");

    expect(identifiantChiffre).not.toBe("user_123");
    expect(dechiffrerIdentifiant(identifiantChiffre)).toBe("user_123");
  });

  it("reconnaît les actions d’authentification et d’organisation", () => {
    expect(actionAuditAuthentification("/sign-in/email")).toBe("connexion");
    expect(actionAuditAuthentification("/organization/invite-member")).toBe(
      "membre_invite",
    );
    expect(actionAuditAuthentification("/get-session")).toBeNull();
  });

  it("journalise les identifiants pseudonymisés de la session Better Auth", () => {
    const espion = vi.spyOn(console, "info").mockImplementation(() => {});
    journaliserAuditAuthentification({
      chemin: "/organization/invite-member",
      resultat: "succes",
      contexte: {
        session: {
          user: { id: "user_123" },
          session: { activeOrganizationId: "org_456" },
        },
      },
    });

    const entree = JSON.parse(espion.mock.calls[0][0] as string) as {
      contexte: Record<string, unknown>;
    };
    expect(dechiffrerIdentifiant(entree.contexte.utilisateur as string)).toBe(
      "user_123",
    );
    expect(dechiffrerIdentifiant(entree.contexte.organisation as string)).toBe(
      "org_456",
    );
  });

  it("utilise une nouvelle session lors de la connexion", () => {
    const espion = vi.spyOn(console, "info").mockImplementation(() => {});
    journaliserAuditAuthentification({
      chemin: "/sign-in/email",
      resultat: "succes",
      contexte: { newSession: { user: { id: "user_123" }, session: {} } },
    });

    const entree = JSON.parse(espion.mock.calls[0][0] as string) as {
      contexte: Record<string, unknown>;
    };
    expect(dechiffrerIdentifiant(entree.contexte.utilisateur as string)).toBe(
      "user_123",
    );
    expect(entree.contexte.organisation).toBeNull();
  });

  it("utilise l’organisation du corps et ne journalise aucune donnée sensible", () => {
    const espion = vi.spyOn(console, "warn").mockImplementation(() => {});
    journaliserAuditAuthentification({
      chemin: "/organization/invite-member",
      resultat: "echec",
      contexte: { session: { user: { id: "user_123" }, session: {} } },
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
    expect(dechiffrerIdentifiant(entree.contexte.utilisateur as string)).toBe(
      "user_123",
    );
    expect(dechiffrerIdentifiant(entree.contexte.organisation as string)).toBe(
      "org_456",
    );
    expect(sortie).not.toContain("user_123");
    expect(sortie).not.toContain("org_456");
    expect(sortie).not.toContain("membre@example.test");
  });

  it("utilise les identifiants retournés lorsque la session n’est pas exposée au hook", () => {
    const espion = vi.spyOn(console, "info").mockImplementation(() => {});
    journaliserAuditAuthentification({
      chemin: "/organization/update",
      resultat: "succes",
      contexte: {},
      retour: {
        user: { id: "user_123" },
        organizationId: "org_456",
      },
    });

    const entree = JSON.parse(espion.mock.calls[0][0] as string) as {
      contexte: Record<string, unknown>;
    };
    expect(dechiffrerIdentifiant(entree.contexte.utilisateur as string)).toBe(
      "user_123",
    );
    expect(dechiffrerIdentifiant(entree.contexte.organisation as string)).toBe(
      "org_456",
    );
  });

  it("journalise le code fonctionnel d’une erreur Better Auth", () => {
    const espion = vi.spyOn(console, "warn").mockImplementation(() => {});
    journaliserAuditAuthentification({
      chemin: "/organization/invite-member",
      resultat: "echec",
      contexte: {},
      codeErreur: "USER_IS_ALREADY_A_MEMBER_OF_THIS_ORGANIZATION",
    });

    const entree = JSON.parse(espion.mock.calls[0][0] as string) as {
      contexte: Record<string, unknown>;
    };
    expect(entree.contexte.codeErreur).toBe(
      "USER_IS_ALREADY_A_MEMBER_OF_THIS_ORGANIZATION",
    );
  });

  it("laisse les identifiants à null pour une action anonyme", () => {
    const espion = vi.spyOn(console, "info").mockImplementation(() => {});
    journaliserAuditAuthentification({
      chemin: "/sign-up/email",
      resultat: "succes",
      contexte: {},
    });

    const entree = JSON.parse(espion.mock.calls[0][0] as string) as {
      contexte: Record<string, unknown>;
    };
    expect(entree.contexte).toMatchObject({
      utilisateur: null,
      organisation: null,
    });
  });
});
