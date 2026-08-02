import { describe, expect, it } from "vitest";
import { genererCsvRemboursement } from "@/lib/remboursement";

describe("genererCsvRemboursement", () => {
  it("produit un CSV Excel et échappe les descriptions", () => {
    const csv = genererCsvRemboursement({
      branche: "Groupe",
      titulaireCompte: "Camille Martin",
      depenses: [
        {
          date: "2026-08-02",
          categorie: "Autres",
          description: 'Repas ; "réunion"',
          montant: 12.5,
          piecesJointes: [
            {
              displayName: "facture.jpg",
              originalFileName: "facture.jpg",
              normalizedFileName: "D1-facture.jpg",
              mimeType: "image/jpeg",
              base64Data: "Zg==",
            },
          ],
        },
      ],
    });

    expect(csv.startsWith("\uFEFF")).toBe(true);
    expect(csv).toContain('"Repas ; ""réunion"""');
    expect(csv).toContain('"12,50"');
  });
});
