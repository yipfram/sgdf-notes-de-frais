import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { FormulaireDepense } from "@/components/FormulaireDepense";
import { UNITES_PAR_DEFAUT } from "@/lib/group";

const pieceJointe = {
  nomAffiche: "ticket.jpg",
  typeMime: "image/jpeg",
  donneesBase64: "aGVsbG8=",
  nomFichierOriginal: "ticket.jpg",
  nomFichierNormalise: "ticket.jpg",
};

describe("FormulaireDepense", () => {
  it("met à jour l’unité immédiatement avant sa mémorisation", async () => {
    const utilisateur = userEvent.setup();
    const onChangementUnite = vi.fn();

    render(
      <FormulaireDepense
        piecesJointes={[]}
        emailUtilisateur="test@example.test"
        units={UNITES_PAR_DEFAUT}
        treasuryVerified
        onChangementUnite={onChangementUnite}
      />,
    );

    const select = screen.getByLabelText("Unité *");
    await utilisateur.selectOptions(select, "pionniers-caravelles");

    expect(select).toHaveValue("pionniers-caravelles");
    expect(onChangementUnite).toHaveBeenCalledWith("pionniers-caravelles");
  });

  it("rejette une option ajoutée dans le HTML", () => {
    const onChangementUnite = vi.fn();
    render(
      <FormulaireDepense
        piecesJointes={[]}
        emailUtilisateur="test@example.test"
        units={UNITES_PAR_DEFAUT}
        uniteInitiale="groupe"
        treasuryVerified
        onChangementUnite={onChangementUnite}
      />,
    );

    const select = screen.getByLabelText("Unité *") as HTMLSelectElement;
    const optionFalsifiee = document.createElement("option");
    optionFalsifiee.value = "aeioaifoaieoifa";
    optionFalsifiee.text = "aoaeifoaieeof";
    select.append(optionFalsifiee);

    fireEvent.change(select, { target: { value: optionFalsifiee.value } });

    expect(select).toHaveValue("groupe");
    expect(onChangementUnite).not.toHaveBeenCalled();
    expect(
      screen.getByText("Cette unité n’est pas autorisée pour ce groupe."),
    ).toBeInTheDocument();
  });

  it("signale les champs obligatoires au clic sur envoyer", async () => {
    const utilisateur = userEvent.setup();
    render(
      <FormulaireDepense
        piecesJointes={[]}
        emailUtilisateur="test@example.test"
        units={UNITES_PAR_DEFAUT}
        treasuryVerified
      />,
    );

    const envoyer = screen.getByRole("button", {
      name: "Envoyer la facture",
    });
    expect(envoyer).toBeEnabled();

    await utilisateur.click(envoyer);

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Il manque des informations pour envoyer la facture",
    );
    expect(screen.getByRole("alert")).toHaveTextContent("un justificatif");
    expect(
      screen.getByText("Sélectionnez un type de dépense."),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Sélectionnez un mode de paiement."),
    ).toBeInTheDocument();
    expect(screen.getByText("Sélectionnez une unité.")).toBeInTheDocument();
    expect(
      screen.getByText("Saisissez un montant supérieur à 0 €."),
    ).toBeInTheDocument();
  });

  it("retire l’erreur d’un champ dès qu’il est corrigé", async () => {
    const utilisateur = userEvent.setup();
    render(
      <FormulaireDepense
        piecesJointes={[pieceJointe]}
        emailUtilisateur="test@example.test"
        units={UNITES_PAR_DEFAUT}
        uniteInitiale="groupe"
        treasuryVerified
      />,
    );

    await utilisateur.click(
      screen.getByRole("button", { name: "Envoyer la facture" }),
    );
    await utilisateur.selectOptions(
      screen.getByLabelText("Type de dépense *"),
      "Autres",
    );
    await utilisateur.selectOptions(
      screen.getByLabelText("Mode de paiement *"),
      "Carte bancaire",
    );

    expect(
      screen.queryByText("Sélectionnez un type de dépense."),
    ).not.toBeInTheDocument();
    expect(
      screen.getByText("Saisissez un montant supérieur à 0 €."),
    ).toBeInTheDocument();
  });

  it("détaille les erreurs de chaque justificatif lors d’un envoi multiple", async () => {
    const utilisateur = userEvent.setup();
    render(
      <FormulaireDepense
        piecesJointes={[
          pieceJointe,
          { ...pieceJointe, nomAffiche: "ticket-2.jpg" },
        ]}
        emailUtilisateur="test@example.test"
        units={UNITES_PAR_DEFAUT}
        uniteInitiale="groupe"
        treasuryVerified
      />,
    );

    await utilisateur.click(
      screen.getByRole("button", { name: "Envoyer la facture" }),
    );

    expect(screen.getByRole("alert")).toHaveTextContent(
      "la catégorie du justificatif 1",
    );
    expect(screen.getByRole("alert")).toHaveTextContent(
      "le montant du justificatif 2",
    );
    expect(screen.getAllByText("Sélectionnez une catégorie.")).toHaveLength(2);
    expect(
      screen.getAllByText("Sélectionnez un mode de paiement."),
    ).toHaveLength(2);
  });
});
