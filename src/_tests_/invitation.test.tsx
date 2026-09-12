import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import PageInvitation from "@/app/invitation/page";
import { FormulaireConnexionEmail } from "@/components/FormulairesAuthentification";

const mocks = vi.hoisted(() => ({
  accepterInvitation: vi.fn(),
  refuserInvitation: vi.fn(),
  remplacer: vi.fn(),
  connecterEmail: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: mocks.remplacer }),
  useSearchParams: () =>
    new URLSearchParams(
      "?callbackURL=%2Finvitation%3Fid%3Dinvitation-test&invitation=1",
    ),
}));

vi.mock("@/lib/auth-client", () => ({
  clientAuth: {
    useSession: () => ({
      data: { user: { id: "utilisateur-test" } },
      isPending: false,
    }),
    organization: {
      acceptInvitation: mocks.accepterInvitation,
      rejectInvitation: mocks.refuserInvitation,
    },
    signIn: { email: mocks.connecterEmail },
  },
}));

function afficherInvitation() {
  return render(
    <PageInvitation
      searchParams={Promise.resolve({
        id: "invitation-test",
        groupe: "Groupe test",
      })}
    />,
  );
}

describe("Page d’invitation", () => {
  beforeEach(() => {
    mocks.accepterInvitation.mockReset();
    mocks.refuserInvitation.mockReset();
    mocks.remplacer.mockReset();
    mocks.connecterEmail.mockReset();
    window.sessionStorage.clear();
    window.history.replaceState({}, "", "/");
  });

  it("redirige vers l’accueil après une acceptation réussie", async () => {
    mocks.accepterInvitation.mockResolvedValue({ data: {} });
    const utilisateur = userEvent.setup();
    afficherInvitation();

    await utilisateur.click(
      await screen.findByRole("button", { name: "Accepter l’invitation" }),
    );

    await waitFor(() => {
      expect(mocks.accepterInvitation).toHaveBeenCalledWith({
        invitationId: "invitation-test",
      });
      expect(mocks.remplacer).toHaveBeenCalledWith("/");
    });
  });

  it("affiche l’erreur renvoyée par l’acceptation", async () => {
    mocks.accepterInvitation.mockResolvedValue({
      error: {
        code: "EMAIL_VERIFICATION_REQUIRED_BEFORE_ACCEPTING_OR_REJECTING_INVITATION",
      },
    });
    const utilisateur = userEvent.setup();
    afficherInvitation();

    await utilisateur.click(
      await screen.findByRole("button", { name: "Accepter l’invitation" }),
    );

    expect(
      await screen.findByText(/confirmez d’abord votre adresse e-mail/i),
    ).toBeInTheDocument();
    expect(screen.getByRole("alert")).toHaveTextContent(
      "EMAIL_VERIFICATION_REQUIRED_BEFORE_ACCEPTING_OR_REJECTING_INVITATION",
    );
  });

  it("affiche une erreur et libère les actions si l’acceptation échoue", async () => {
    mocks.accepterInvitation.mockRejectedValue(
      new Error("Réseau indisponible"),
    );
    const utilisateur = userEvent.setup();
    afficherInvitation();

    await utilisateur.click(
      await screen.findByRole("button", { name: "Accepter l’invitation" }),
    );

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Impossible d’accepter cette invitation",
    );
    expect(
      screen.getByRole("button", { name: "Accepter l’invitation" }),
    ).toBeEnabled();
  });

  it("retrouve l’invitation mémorisée après le retour de vérification", async () => {
    window.sessionStorage.setItem(
      "invitation-retour",
      "/invitation?id=invitation-memorisee&groupe=Groupe%20test",
    );
    mocks.accepterInvitation.mockResolvedValue({ data: {} });
    const utilisateur = userEvent.setup();
    render(<PageInvitation searchParams={Promise.resolve({})} />);

    await utilisateur.click(
      await screen.findByRole("button", { name: "Accepter l’invitation" }),
    );

    await waitFor(() => {
      expect(mocks.accepterInvitation).toHaveBeenCalledWith({
        invitationId: "invitation-memorisee",
      });
    });
  });

  it("explique l’absence d’identifiant au lieu de laisser une action grisée", async () => {
    render(<PageInvitation searchParams={Promise.resolve({})} />);

    expect(
      await screen.findByRole("heading", { name: "Invitation introuvable" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Accepter l’invitation" }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Retour à l’accueil" }),
    ).toHaveAttribute("href", "/");
  });

  it("utilise l’identifiant de l’URL même si les paramètres transmis sont vides", async () => {
    window.history.replaceState({}, "", "/invitation?id=invitation-url");
    mocks.accepterInvitation.mockResolvedValue({ data: {} });
    render(<PageInvitation searchParams={Promise.resolve({})} />);

    await userEvent.click(
      await screen.findByRole("button", { name: "Accepter l’invitation" }),
    );

    await waitFor(() => {
      expect(mocks.accepterInvitation).toHaveBeenCalledWith({
        invitationId: "invitation-url",
      });
    });
  });

  it("transmet l’invitation au retour de la connexion par mot de passe", async () => {
    mocks.connecterEmail.mockResolvedValue({ error: { status: 401 } });
    const utilisateur = userEvent.setup();
    render(<FormulaireConnexionEmail />);

    await utilisateur.type(
      screen.getByLabelText("Adresse e-mail"),
      "invitee@example.test",
    );
    await utilisateur.type(
      screen.getByLabelText("Mot de passe"),
      "motdepasse-test",
    );
    await utilisateur.click(
      screen.getByRole("button", { name: "Se connecter" }),
    );

    expect(mocks.connecterEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        callbackURL: "/invitation?id=invitation-test",
      }),
    );
  });

  it("désactive les actions pendant l’acceptation", async () => {
    let resoudre: (resultat: { data: object }) => void;
    mocks.accepterInvitation.mockImplementation(
      () =>
        new Promise((resolve) => {
          resoudre = resolve;
        }),
    );
    const utilisateur = userEvent.setup();
    afficherInvitation();

    const accepter = await screen.findByRole("button", {
      name: "Accepter l’invitation",
    });
    await utilisateur.click(accepter);

    expect(accepter).toBeDisabled();
    expect(screen.getByRole("button", { name: "Acceptation…" })).toBeDisabled();
    expect(
      screen.getByRole("button", { name: "Refuser l’invitation" }),
    ).toBeDisabled();

    await act(async () => {
      resoudre!({ data: {} });
    });
  });
});
