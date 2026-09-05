import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { FormulaireDepense } from "@/components/FormulaireDepense";
import { UNITES_PAR_DEFAUT } from "@/lib/group";

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
});
