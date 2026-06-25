import { render, screen } from "@testing-library/react";
import type { ComponentType } from "react";
import { describe, expect, it, vi } from "vitest";
import ClerkSignInClient from "../components/ClerkSignInClient";

vi.mock("next/dynamic", () => ({
  default: () => {
    const ComposantDynamique = ({
      forceRedirectUrl,
    }: {
      forceRedirectUrl?: string;
    }) => (
      <div
        data-testid="formulaire-connexion-clerk"
        data-force-redirect-url={forceRedirectUrl}
      />
    );

    return ComposantDynamique as ComponentType<{ forceRedirectUrl?: string }>;
  },
}));

describe("Redirection de connexion", () => {
  it("redirige vers l'application principale apres connexion", () => {
    render(<ClerkSignInClient />);

    expect(screen.getByTestId("formulaire-connexion-clerk")).toHaveAttribute(
      "data-force-redirect-url",
      "/",
    );
  });
});
