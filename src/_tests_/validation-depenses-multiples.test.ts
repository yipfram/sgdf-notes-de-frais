import { describe, expect, it } from "vitest";
import { validerCorpsRequete } from "@/lib/api/validateBody";

const attachment = (name: string) => ({
  displayName: name,
  mimeType: "image/jpeg",
  base64Data: "aGVsbG8=",
  originalFileName: name,
  normalizedFileName: name,
});

const baseBody = {
  userEmail: "utilisateur@example.com",
  date: "2026-08-16",
  unitId: "groupe",
};

describe("validerCorpsRequete avec plusieurs dépenses", () => {
  it("calcule le total à partir des détails de chaque justificatif", () => {
    const resultat = validerCorpsRequete({
      ...baseBody,
      attachments: [attachment("ticket-1.jpg"), attachment("ticket-2.jpg")],
      expenseDetails: [
        { expenseType: "Alimentation, Intendance", amount: "12.50" },
        { expenseType: "Carburants", amount: 30 },
      ],
    });

    expect(resultat.error).toBeUndefined();
    expect(resultat.donneesEmail).toMatchObject({
      typeDepense: "Dépenses multiples",
      montant: 42.5,
      detailsDepenses: [
        { typeDepense: "Alimentation, Intendance", montant: 12.5 },
        { typeDepense: "Carburants", montant: 30 },
      ],
    });
  });

  it("refuse un détail manquant ou une catégorie inconnue", () => {
    const detailManquant = validerCorpsRequete({
      ...baseBody,
      attachments: [attachment("ticket-1.jpg"), attachment("ticket-2.jpg")],
      expenseDetails: [{ expenseType: "Carburants", amount: 20 }],
    });
    const categorieInvalide = validerCorpsRequete({
      ...baseBody,
      attachments: [attachment("ticket-1.jpg"), attachment("ticket-2.jpg")],
      expenseDetails: [
        { expenseType: "Catégorie inconnue", amount: 20 },
        { expenseType: "Carburants", amount: 30 },
      ],
    });

    expect(detailManquant.error?.status).toBe(400);
    expect(categorieInvalide.error?.status).toBe(400);
  });

  it("refuse des détails pour un justificatif unique", () => {
    const resultat = validerCorpsRequete({
      ...baseBody,
      attachments: [attachment("ticket.jpg")],
      expenseDetails: [
        { expenseType: "Carburants", amount: 22 },
        { expenseType: "Carburants", amount: 222 },
      ],
    });

    expect(resultat.error?.status).toBe(400);
  });

  it("conserve le format d'une dépense unique", () => {
    const resultat = validerCorpsRequete({
      ...baseBody,
      expenseType: "Carburants",
      amount: "18.40",
      attachments: [attachment("ticket.jpg")],
    });

    expect(resultat.donneesEmail).toMatchObject({
      typeDepense: "Carburants",
      montant: 18.4,
      detailsDepenses: undefined,
    });
  });
});
