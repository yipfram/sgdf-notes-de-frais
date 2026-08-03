import { describe, expect, it } from "vitest";
import { estIbanValide } from "@/lib/iban";
import {
  genererCsvRemboursement,
  validerDemandeRemboursement,
} from "@/lib/remboursement";

describe("genererCsvRemboursement", () => {
  it("produit un CSV Excel et échappe les descriptions", () => {
    const csv = genererCsvRemboursement({
      branche: "Groupe",
      titulaireCompte: "Camille Martin",
      iban: "FR1420041010050500013M02606",
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

  it("valide le format IBAN", () => {
    expect(estIbanValide("FR14 2004 1010 0505 0001 3M02 606")).toBe(true);
    expect(estIbanValide("12345678")).toBe(false);
  });

  it("rejette une demande avec un IBAN invalide", () => {
    const demande = validerDemandeRemboursement({
      branche: "Groupe",
      titulaireCompte: "Camille Martin",
      iban: "AGRIFRPP",
      depenses: [
        {
          date: "2026-08-02",
          categorie: "Autres",
          description: "Repas",
          montant: "12.50",
          piecesJointes: [
            {
              displayName: "facture.jpg",
              originalFileName: "facture.jpg",
              mimeType: "image/jpeg",
              base64Data: "Zg==",
            },
          ],
        },
      ],
    });

    expect(demande).toBeNull();
  });
});
