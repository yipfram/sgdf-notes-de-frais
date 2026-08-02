import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { VueRemboursement } from "@/components/VueRemboursement";

vi.mock("@clerk/nextjs", () => ({
  useUser: () => ({
    user: {
      publicMetadata: { branch: "Groupe" },
      reload: vi.fn(),
    },
  }),
  UserButton: () => <button type="button">Compte</button>,
}));

vi.mock("next/image", () => ({
  default: ({ alt, ...props }: React.ImgHTMLAttributes<HTMLImageElement>) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img alt={alt} {...props} />
  ),
}));

vi.mock("@/lib/useOnlineStatus", () => ({
  StatusEstEnligne: () => true,
}));

describe("VueRemboursement", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("désactive la validation native du brouillon de dépense", () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ titulaireCompte: "Camille Martin" }), {
          status: 200,
        }),
      ),
    );

    render(<VueRemboursement />);

    expect(
      screen
        .getByRole("button", { name: "Envoyer la demande" })
        .closest("form"),
    ).toHaveAttribute("novalidate");
  });
});
