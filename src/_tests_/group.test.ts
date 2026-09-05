import { describe, expect, it } from "vitest";
import {
  lireUniteSelectionnee,
  lireUnitesSelectionnees,
  UNITES_PAR_DEFAUT,
} from "@/lib/group";

describe("préférences d’unité", () => {
  it("lit uniquement une unité existante du groupe actif", () => {
    expect(
      lireUniteSelectionnee(
        {
          unitesSelectionneesParOrganisation: {
            org_a: "pionniers-caravelles",
            org_b: "inconnue",
          },
        },
        "org_a",
        UNITES_PAR_DEFAUT,
      ),
    ).toBe("pionniers-caravelles");
    expect(
      lireUniteSelectionnee(
        {
          unitesSelectionneesParOrganisation: { org_b: "inconnue" },
        },
        "org_b",
        UNITES_PAR_DEFAUT,
      ),
    ).toBe("");
  });

  it("ignore les métadonnées malformées", () => {
    expect(lireUnitesSelectionnees(["pionniers-caravelles"])).toEqual({});
    expect(lireUnitesSelectionnees({ org_a: 42, org_b: "groupe" })).toEqual({
      org_b: "groupe",
    });
  });
});
