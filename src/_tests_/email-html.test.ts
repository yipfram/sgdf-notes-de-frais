import { beforeEach, describe, expect, it, vi } from "vitest";

const { envoyerMailSimule, verifierSimule } = vi.hoisted(() => ({
  envoyerMailSimule: vi.fn().mockResolvedValue({ messageId: "message-1" }),
  verifierSimule: vi.fn().mockResolvedValue(true),
}));

vi.mock("nodemailer", () => ({
  default: {
    createTransport: vi.fn(() => ({
      sendMail: envoyerMailSimule,
      verify: verifierSimule,
    })),
  },
}));

import { envoyerEmail } from "@/lib/email";
import { envoyerEmailValidationTresorerie } from "@/lib/treasuryEmail";

const texteDangereux = `<img src=x onerror="alerte()"> & 'test'`;

describe("templates HTML des e-mails", () => {
  beforeEach(() => {
    envoyerMailSimule.mockClear();
    verifierSimule.mockClear();
    process.env.SMTP_FROM = "expediteur@example.test";
  });

  it("échappe toutes les valeurs textuelles de l’e-mail de note de frais", async () => {
    await envoyerEmail({
      emailUtilisateur: texteDangereux,
      date: texteDangereux,
      branche: texteDangereux,
      typeDepense: texteDangereux,
      description: texteDangereux,
      groupe: texteDangereux,
      couleur: `#123456; background-image: url("${texteDangereux}")`,
      emailTresorerie: "tresorerie@example.test",
      montant: 12,
      piecesJointes: [
        {
          nomAffiche: texteDangereux,
          nomFichierOriginal: texteDangereux,
          nomFichierNormalise: texteDangereux,
          typeMime: "image/png",
          donneesBase64: Buffer.from("image").toString("base64"),
        },
      ],
    });

    const html = envoyerMailSimule.mock.calls[0][0].html as string;
    expect(html).toContain(
      "&lt;img src=x onerror=&quot;alerte()&quot;&gt; &amp; &#39;test&#39;",
    );
    expect(html).not.toContain('<img src=x onerror="alerte()">');
    expect(html).toContain("background-color: #1E3A8A");
  });

  it("met en forme, échappe et lie l’e-mail de vérification", async () => {
    await envoyerEmailValidationTresorerie({
      destinataire: "tresorerie@example.test",
      nomGroupe: texteDangereux,
      url: `https://example.test/verifier?nom=${texteDangereux}`,
    });

    const html = envoyerMailSimule.mock.calls[0][0].html as string;
    expect(html).toContain(
      "&lt;img src=x onerror=&quot;alerte()&quot;&gt; &amp; &#39;test&#39;",
    );
    expect(html).toContain('href="https://example.test/verifier?nom=&lt;img');
    expect(html).not.toContain('<img src=x onerror="alerte()">');
    expect(html).toContain("📜 Scouticket");
    expect(html).toContain("Confirmation de la trésorerie");
    expect(html).toContain("Confirmer le rattachement");
    expect(html).toContain("background-color: #1E3A8A");
    expect(html).toContain("background-color: #FBB042");
    expect(html).toContain("Ce lien expire dans 48 heures.");
  });
});
