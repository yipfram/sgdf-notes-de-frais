"use client";

import type { UniteGroupe } from "@/lib/group";

const COULEURS_CHOIX = [
  ["#6CC24A", "Vert"],
  ["#F28C00", "Orange"],
  ["#0072CE", "Bleu clair"],
  ["#E30613", "Rouge"],
  ["#00A19A", "Turquoise"],
  ["#1E3A8A", "Bleu foncé"],
] as const;

export function EditeurUnites({
  unites,
  onChange,
}: {
  readonly unites: UniteGroupe[];
  readonly onChange: (unites: UniteGroupe[]) => void;
}) {
  const modifierUnite = (index: number, modification: Partial<UniteGroupe>) =>
    onChange(
      unites.map((unite, position) =>
        position === index ? { ...unite, ...modification } : unite,
      ),
    );

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-zinc-700">Unités du groupe</p>
      {unites.map((unite, index) => (
        <div key={unite.id} className="rounded-xl border border-zinc-200 p-3">
          <div className="flex items-center gap-2">
            <input
              value={unite.label}
              onChange={(event) =>
                modifierUnite(index, { label: event.target.value })
              }
              className="min-w-0 flex-1 rounded-xl border border-zinc-300 bg-white p-3 text-zinc-900 outline-none focus:border-[#1E3A8A] focus:ring-2 focus:ring-[#1E3A8A]/20"
              aria-label={`Nom de l’unité ${index + 1}`}
            />
            <button
              type="button"
              onClick={() =>
                onChange(unites.filter((_, position) => position !== index))
              }
              className="rounded-xl px-3 py-2 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900"
              aria-label={`Supprimer ${unite.label}`}
            >
              ×
            </button>
          </div>
          <div className="mt-3 flex items-center justify-between gap-3">
            <span className="text-sm text-zinc-600">Couleur</span>
            <div
              className="flex gap-2"
              role="group"
              aria-label={`Couleur de ${unite.label}`}
            >
              {COULEURS_CHOIX.map(([couleur, nom]) => (
                <button
                  key={couleur}
                  type="button"
                  onClick={() => modifierUnite(index, { color: couleur })}
                  className={`flex h-8 w-8 items-center justify-center rounded-full border-2 transition-transform focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] focus:ring-offset-2 ${unite.color === couleur ? "scale-110 border-zinc-900" : "border-white"}`}
                  style={{ backgroundColor: couleur }}
                  aria-label={nom}
                  aria-pressed={unite.color === couleur}
                >
                  {unite.color === couleur && (
                    <span className="text-sm font-bold text-white">✓</span>
                  )}
                </button>
              ))}
              <label
                className="relative flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border-2 border-white bg-[conic-gradient(#e30613,#f28c00,#6cc24a,#00a19a,#0072ce,#1e3a8a,#e30613)] text-sm font-bold text-white shadow-sm outline-none focus-within:ring-2 focus-within:ring-[#1E3A8A] focus-within:ring-offset-2"
                title="Choisir une autre couleur"
              >
                <span aria-hidden="true">+</span>
                <input
                  type="color"
                  value={unite.color}
                  onChange={(event) =>
                    modifierUnite(index, { color: event.target.value })
                  }
                  className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                  aria-label="Choisir une autre couleur"
                />
              </label>
            </div>
          </div>
        </div>
      ))}
      <button
        type="button"
        onClick={() =>
          onChange([
            ...unites,
            {
              id: `unite-${crypto.randomUUID()}`,
              label: "Nouvelle unité",
              color: "#1E3A8A",
            },
          ])
        }
        className="w-full rounded-xl border border-dashed border-zinc-300 p-3 text-sm font-medium text-[#1E3A8A] transition-colors hover:border-[#1E3A8A] hover:bg-blue-50"
      >
        Ajouter une unité
      </button>
    </div>
  );
}
