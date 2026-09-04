import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import Home from "../app/(main)/page";

vi.mock("@clerk/nextjs", () => ({
  useUser: () => ({
    isLoaded: true,
    isSignedIn: true,
    user: {
      emailAddresses: [{ emailAddress: "test@example.test" }],
      publicMetadata: { branch: "Louveteaux-Jeannettes" },
      reload: vi.fn(),
    },
  }),
  useOrganization: () => ({ organization: { id: "org_test", name: "Test" } }),
  UserButton: () => <button type="button" aria-label="Compte utilisateur" />,
  OrganizationSwitcher: () => <div>Changer de groupe</div>,
  InviteMembersButton: ({ children }: { children: React.ReactNode }) =>
    children,
}));

vi.mock("next/image", () => ({
  default: ({ alt, ...props }: React.ImgHTMLAttributes<HTMLImageElement>) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img alt={alt} {...props} />
  ),
}));

vi.mock("@/components/FeatureNotice", () => ({
  AvertissementNouveaute: () => <div>Information fonctionnalite</div>,
}));

vi.mock("@/components/PhotoCapture", () => ({
  CapturePhoto: () => <div>Ajout piece jointe</div>,
}));

vi.mock("@/components/FormulaireDepense", () => ({
  FormulaireDepense: ({ emailUtilisateur }: { emailUtilisateur: string }) => (
    <form aria-label="Formulaire depense">{emailUtilisateur}</form>
  ),
}));

vi.mock("@/components/InstallPrompt", () => ({
  InviteInstallation: () => null,
}));

vi.mock("@/lib/useOnlineStatus", () => ({
  useStatutEnLigne: () => true,
}));

describe("Page principale", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            units: [{ id: "groupe", label: "Groupe", color: "#1E3A8A" }],
            configured: true,
            treasuryVerified: true,
            isAdmin: true,
          }),
      }),
    );
  });

  it("affiche l'application et l'invitation pour un responsable", async () => {
    render(<Home />);

    expect(
      await screen.findByRole("heading", {
        name: "Factures carte procurement SGDF",
      }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Compte utilisateur" }));
    expect(
      await screen.findByLabelText("Formulaire depense"),
    ).toHaveTextContent("test@example.test");
    expect(
      screen.getByRole("button", { name: "Inviter une personne" }),
    ).toBeInTheDocument();
  });
});
