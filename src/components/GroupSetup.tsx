"use client";

import { useState } from "react";
import { UNITES_PAR_DEFAUT, type UniteGroupe } from "@/lib/group";

const COULEURS_CHOIX = [
  ["#6CC24A", "Vert"],
  ["#F28C00", "Orange"],
  ["#0072CE", "Bleu clair"],
  ["#E30613", "Rouge"],
  ["#00A19A", "Turquoise"],
  ["#1E3A8A", "Bleu foncé"],
] as const;

export function ConfigurationGroupe({
  onSaved,
}: {
  readonly onSaved: () => void;
}) {
  const [email, setEmail] = useState("");
  const [units, setUnits] = useState<UniteGroupe[]>(UNITES_PAR_DEFAUT);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    const response = await fetch("/api/group/config", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ treasuryEmail: email, units }),
    });
    setSaving(false);
    if (!response.ok) {
      setError(
        "Impossible d’enregistrer le groupe. Vérifiez les informations puis réessayez.",
      );
      return;
    }
    onSaved();
  };
  return (
    <form onSubmit={save} className="space-y-5">
      <div>
        <label
          htmlFor="treasury-email"
          className="block text-sm font-medium text-zinc-700"
        >
          E-mail de la trésorerie (qui recevra les justificatifs)
        </label>
        <input
          id="treasury-email"
          required
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="tresorerie@exemple.fr"
          className="mt-2 w-full rounded-xl border border-zinc-300 bg-white p-3 text-zinc-900 placeholder:text-zinc-400 outline-none focus:border-[#1E3A8A] focus:ring-2 focus:ring-[#1E3A8A]/20"
        />
      </div>
      <div className="space-y-2">
        <p className="text-sm font-medium text-zinc-700">Unités du groupe</p>
        {units.map((unit, index) => (
          <div key={unit.id} className="rounded-xl border border-zinc-200 p-3">
            <div className="flex items-center gap-2">
              <input
                value={unit.label}
                onChange={(event) =>
                  setUnits((current) =>
                    current.map((item, itemIndex) =>
                      itemIndex === index
                        ? { ...item, label: event.target.value }
                        : item,
                    ),
                  )
                }
                className="min-w-0 flex-1 rounded-xl border border-zinc-300 bg-white p-3 text-zinc-900 outline-none focus:border-[#1E3A8A] focus:ring-2 focus:ring-[#1E3A8A]/20"
                aria-label={`Nom de l’unité ${index + 1}`}
              />
              <button
                type="button"
                onClick={() =>
                  setUnits((current) =>
                    current.filter((_, itemIndex) => itemIndex !== index),
                  )
                }
                className="rounded-xl px-3 py-2 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900"
                aria-label={`Supprimer ${unit.label}`}
              >
                ×
              </button>
            </div>
            <div className="mt-3 flex items-center justify-between gap-3">
              <span className="text-sm text-zinc-600">Couleur</span>
              <div
                className="flex gap-2"
                role="group"
                aria-label={`Couleur de ${unit.label}`}
              >
                {COULEURS_CHOIX.map(([couleur, nom]) => (
                  <button
                    key={couleur}
                    type="button"
                    onClick={() =>
                      setUnits((current) =>
                        current.map((item, itemIndex) =>
                          itemIndex === index
                            ? { ...item, color: couleur }
                            : item,
                        ),
                      )
                    }
                    className={`flex h-8 w-8 items-center justify-center rounded-full border-2 transition-transform focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] focus:ring-offset-2 ${
                      unit.color === couleur
                        ? "scale-110 border-zinc-900"
                        : "border-white"
                    }`}
                    style={{ backgroundColor: couleur }}
                    aria-label={nom}
                    aria-pressed={unit.color === couleur}
                  >
                    {unit.color === couleur && (
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
                    value={unit.color}
                    onChange={(event) =>
                      setUnits((current) =>
                        current.map((item, itemIndex) =>
                          itemIndex === index
                            ? { ...item, color: event.target.value }
                            : item,
                        ),
                      )
                    }
                    className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                    aria-label="Choisir une autre couleur"
                  />
                </label>
              </div>
            </div>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={() =>
          setUnits((current) => [
            ...current,
            {
              id: `unite-${Date.now()}`,
              label: "Nouvelle unité",
              color: "#1E3A8A",
            },
          ])
        }
        className="w-full rounded-xl border border-dashed border-zinc-300 p-3 text-sm font-medium text-[#1E3A8A] transition-colors hover:border-[#1E3A8A] hover:bg-blue-50"
      >
        Ajouter une unité
      </button>
      {error && <p className="text-sm text-rose-300">{error}</p>}
      <button
        disabled={saving || units.length === 0}
        className="w-full rounded-xl bg-[#1E3A8A] p-3 font-semibold text-white shadow-sm transition-colors hover:bg-[#162d69] focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {saving ? "Envoi…" : "Enregistrer et envoyer la validation"}
      </button>
    </form>
  );
}
