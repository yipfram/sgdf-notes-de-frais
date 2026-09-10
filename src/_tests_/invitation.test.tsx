import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import PageInvitation from "@/app/invitation/page";

const mocks = vi.hoisted(() => ({
  accepterInvitation: vi.fn(),
  refuserInvitation: vi.fn(),
  remplacer: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: mocks.remplacer }),
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
