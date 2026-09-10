import { describe, expect, it } from "vitest";
import { validerUnites } from "@/lib/group";

describe("Validation des unités de groupe", () => {
  it("accepte une couleur choisie par le responsable", () => {
    expect(
      validerUnites([
        { id: "unite-test", label: "Unité test", color: "#8b5cf6" },
      ]),
    ).toEqual([{ id: "unite-test", label: "Unité test", color: "#8b5cf6" }]);
  });

  it("refuse une couleur qui ne peut pas être utilisée dans un e-mail", () => {
    expect(
      validerUnites([
        {
          id: "unite-test",
          label: "Unité test",
          color: "url(javascript:alert(1))",
        },
      ]),
    ).toBeNull();
  });
});
