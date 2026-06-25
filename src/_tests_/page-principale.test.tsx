import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
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
  UserButton: () => <button type="button" aria-label="Compte utilisateur" />,
}));

vi.mock("next/image", () => ({
  default: ({ alt, ...props }: React.ImgHTMLAttributes<HTMLImageElement>) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img alt={alt} {...props} />
  ),
}));

vi.mock("@/components/FeatureNotice", () => ({
  FeatureNotice: () => <div>Information fonctionnalite</div>,
}));

vi.mock("@/components/PhotoCapture", () => ({
  PhotoCapture: () => <div>Ajout piece jointe</div>,
}));

vi.mock("@/components/FormulaireDepense", () => ({
  FormulaireDepense: ({ emailUtilisateur }: { emailUtilisateur: string }) => (
    <form aria-label="Formulaire depense">{emailUtilisateur}</form>
  ),
}));

vi.mock("@/components/InstallPrompt", () => ({
  InstallPrompt: () => null,
}));

vi.mock("@/lib/useOnlineStatus", () => ({
  StatusEstEnligne: () => true,
}));

describe("Page principale", () => {
  it("affiche l'application pour un utilisateur connecte", () => {
    render(<Home />);

    expect(
      screen.getByRole("heading", {
        name: "Factures carte procurement SGDF",
      }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Compte utilisateur" }));
    expect(screen.getByLabelText("Formulaire depense")).toHaveTextContent(
      "test@example.test",
    );
  });
});
