import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import Home from "../app/(main)/page";

vi.mock("@/lib/auth-client", () => ({
  clientAuth: {
    useSession: () => ({
      data: { user: { email: "test@example.test" } },
      isPending: false,
    }),
    useActiveOrganization: () => ({ data: { id: "org_test", name: "Test" } }),
    useListOrganizations: () => ({ data: [] }),
    organization: { setActive: vi.fn(), create: vi.fn() },
    signOut: vi.fn(),
  },
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

  it("affiche les actions d'administration pour un responsable", async () => {
    render(<Home />);

    expect(
      await screen.findByRole("heading", {
        name: "Scouticket",
      }),
    ).toBeInTheDocument();
    expect(
      await screen.findByLabelText("Formulaire depense"),
    ).toHaveTextContent("test@example.test");
    expect(
      screen.getByRole("link", { name: "Gérer les membres" }),
    ).toHaveAttribute("href", "/gestion-membres");
  });

  it("masque les actions d'administration pour un membre", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            units: [{ id: "groupe", label: "Groupe", color: "#1E3A8A" }],
            configured: true,
            treasuryVerified: true,
            isAdmin: false,
          }),
      }),
    );

    render(<Home />);

    await screen.findByLabelText("Formulaire depense");
    expect(screen.queryByText("Administration")).not.toBeInTheDocument();
  });
});
