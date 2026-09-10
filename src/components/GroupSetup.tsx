"use client";

import { useState, type FormEvent } from "react";
import { EditeurUnites } from "@/components/EditeurUnites";
import { UNITES_PAR_DEFAUT, type UniteGroupe } from "@/lib/group";

export function ConfigurationGroupe({
  onSaved,
}: {
  readonly onSaved: () => void;
}) {
  const [email, setEmail] = useState("");
  const [unites, setUnites] = useState<UniteGroupe[]>(UNITES_PAR_DEFAUT);
  const [enregistrement, setEnregistrement] = useState(false);
  const [erreur, setErreur] = useState("");

  const enregistrer = async (event: FormEvent) => {
    event.preventDefault();
    setEnregistrement(true);
    setErreur("");
    const reponse = await fetch("/api/group/config", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ treasuryEmail: email, units: unites }),
    });
    setEnregistrement(false);
    if (!reponse.ok) {
      setErreur(
        "Impossible d’enregistrer le groupe. Vérifiez les informations puis réessayez.",
      );
      return;
    }
    onSaved();
  };

  return (
    <form onSubmit={enregistrer} className="space-y-5">
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
      <EditeurUnites unites={unites} onChange={setUnites} />
      {erreur && <p className="text-sm text-rose-300">{erreur}</p>}
      <button
        disabled={enregistrement || unites.length === 0}
        className="w-full rounded-xl bg-[#1E3A8A] p-3 font-semibold text-white shadow-sm transition-colors hover:bg-[#162d69] focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {enregistrement ? "Envoi…" : "Enregistrer et envoyer la validation"}
      </button>
    </form>
  );
}
