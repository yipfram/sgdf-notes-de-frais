import { describe, expect, it } from "vitest";
import { construireNomsFichiersNormalises } from "@/lib/attachments";

describe("construireNomsFichiersNormalises", () => {
  it("inclut le mode de paiement dans le nom du justificatif", () => {
    const [nom] = construireNomsFichiersNormalises(
      [{ typeMime: "image/jpeg", nomFichierOriginal: "ticket.jpg" }],
      {
        date: "2026-09-13",
        branch: "Groupe",
        expenseType: "Carburants",
        paymentMethod: "Carte bancaire",
        amount: "28,50",
      },
    );

    expect(nom).toBe(
      "2026-09-13 - Groupe - Carburants - Carte bancaire - 28.50.jpg",
    );
  });
});
