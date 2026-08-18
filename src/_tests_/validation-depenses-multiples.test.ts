import { describe, expect, it } from "vitest";
import { validateBody } from "@/lib/api/validateBody";

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
  branch: "Groupe",
};

describe("validateBody avec plusieurs dépenses", () => {
  it("calcule le total à partir des détails de chaque justificatif", () => {
    const result = validateBody({
      ...baseBody,
      attachments: [attachment("ticket-1.jpg"), attachment("ticket-2.jpg")],
      expenseDetails: [
        { expenseType: "Alimentation, Intendance", amount: "12.50" },
        { expenseType: "Carburants", amount: 30 },
      ],
    });

    expect(result.error).toBeUndefined();
    expect(result.emailData).toMatchObject({
      expenseType: "Dépenses multiples",
      amount: 42.5,
      expenseDetails: [
        { expenseType: "Alimentation, Intendance", amount: 12.5 },
        { expenseType: "Carburants", amount: 30 },
      ],
    });
  });

  it("refuse un détail manquant ou une catégorie inconnue", () => {
    const missingDetail = validateBody({
      ...baseBody,
      attachments: [attachment("ticket-1.jpg"), attachment("ticket-2.jpg")],
      expenseDetails: [{ expenseType: "Carburants", amount: 20 }],
    });
    const invalidCategory = validateBody({
      ...baseBody,
      attachments: [attachment("ticket-1.jpg"), attachment("ticket-2.jpg")],
      expenseDetails: [
        { expenseType: "Catégorie inconnue", amount: 20 },
        { expenseType: "Carburants", amount: 30 },
      ],
    });

    expect(missingDetail.error?.status).toBe(400);
    expect(invalidCategory.error?.status).toBe(400);
  });

  it("conserve le format d'une dépense unique", () => {
    const result = validateBody({
      ...baseBody,
      expenseType: "Carburants",
      amount: "18.40",
      attachments: [attachment("ticket.jpg")],
    });

    expect(result.emailData).toMatchObject({
      expenseType: "Carburants",
      amount: 18.4,
      expenseDetails: undefined,
    });
  });
});
