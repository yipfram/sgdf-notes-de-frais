"use client";

import { useState } from "react";
import {
  UNITES_PAR_DEFAUT,
  COULEURS_UNITES,
  type UniteGroupe,
} from "@/lib/group";

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
          className="block text-sm font-medium text-zinc-200"
        >
          E-mail de la trésorerie
        </label>
        <input
          id="treasury-email"
          required
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="tresorerie@exemple.fr"
          className="mt-2 w-full rounded-xl border border-white/15 bg-white/10 p-3 text-white placeholder:text-zinc-500"
        />
      </div>
      <div className="space-y-2">
        <p className="text-sm font-medium text-zinc-200">Unités du groupe</p>
        {units.map((unit, index) => (
          <div key={unit.id} className="flex gap-2">
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
              className="min-w-0 flex-1 rounded-xl border border-white/15 bg-white/10 p-3 text-white"
              aria-label={`Nom de l’unité ${index + 1}`}
            />
            <select
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
              className="w-14 rounded-xl border border-white/15 bg-white/10 text-white"
              aria-label={`Couleur de ${unit.label}`}
            >
              {COULEURS_UNITES.map((color) => (
                <option key={color} value={color} style={{ background: color }}>
                  {color}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() =>
                setUnits((current) =>
                  current.filter((_, itemIndex) => itemIndex !== index),
                )
              }
              className="rounded-xl px-3 text-zinc-300"
              aria-label={`Supprimer ${unit.label}`}
            >
              ×
            </button>
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
        className="w-full rounded-xl border border-white/15 p-3 text-sm font-medium text-zinc-100"
      >
        Ajouter une unité
      </button>
      {error && <p className="text-sm text-rose-300">{error}</p>}
      <button
        disabled={saving || units.length === 0}
        className="w-full rounded-xl bg-amber-400 p-3 font-semibold text-zinc-950 disabled:opacity-60"
      >
        {saving ? "Envoi…" : "Enregistrer et valider la trésorerie"}
      </button>
    </form>
  );
}
