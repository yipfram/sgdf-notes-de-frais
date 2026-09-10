import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ConnexionGoogle } from "../components/ConnexionGoogle";

vi.mock("@/lib/auth-client", () => ({
  clientAuth: { signIn: { social: vi.fn() } },
}));

describe("Redirection de connexion", () => {
  it("affiche le parcours Google", () => {
    render(<ConnexionGoogle />);
    expect(
      screen.getByRole("button", { name: /continuer avec google/i }),
    ).toBeInTheDocument();
  });
});
