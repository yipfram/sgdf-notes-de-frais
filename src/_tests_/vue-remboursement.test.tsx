import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
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
  it("désactive la validation native du brouillon de dépense", () => {
    render(<VueRemboursement />);

    expect(
      screen
        .getByRole("button", { name: "Envoyer la demande" })
        .closest("form"),
    ).toHaveAttribute("novalidate");
  });
});
