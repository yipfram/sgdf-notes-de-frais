"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { EditeurUnites } from "@/components/EditeurUnites";
import { clientAuth } from "@/lib/auth-client";
import type { UniteGroupe } from "@/lib/group";

type Groupe = { units: UniteGroupe[]; isAdmin: boolean };

export default function PageGestionUnites() {
  const { data: organisation } = clientAuth.useActiveOrganization();
  const [unites, setUnites] = useState<UniteGroupe[]>([]);
  const [chargement, setChargement] = useState(true);
  const [estAdministrateur, setEstAdministrateur] = useState(false);
  const [enregistrement, setEnregistrement] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/group/config")
      .then((reponse) => (reponse.ok ? reponse.json() : null))
      .then((groupe: Groupe | null) => {
        if (!groupe?.isAdmin) {
          setMessage("Accès réservé aux responsables du groupe.");
          return;
        }
        setEstAdministrateur(true);
        setUnites(groupe.units);
      })
      .catch(() => setMessage("Impossible de charger les unités."))
      .finally(() => setChargement(false));
  }, []);

  const enregistrer = async (event: FormEvent) => {
    event.preventDefault();
    setEnregistrement(true);
    setMessage("");
    const reponse = await fetch("/api/group/units", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ units: unites }),
    });
    setEnregistrement(false);
    setMessage(
      reponse.ok
        ? "Unités enregistrées."
        : "Impossible d’enregistrer les unités. Vérifiez-les puis réessayez.",
    );
  };

  if (!organisation) return <main className="p-6">Aucun groupe actif.</main>;
  return (
    <main className="min-h-screen bg-zinc-50 p-4">
      <section className="mx-auto max-w-lg rounded-xl border border-zinc-200 bg-white p-6">
        <Link href="/" className="text-sm text-[#1E3A8A]">
          ← Retour
        </Link>
        <h1 className="mt-4 text-2xl font-semibold text-zinc-900">
          Gérer les unités
        </h1>
        <p className="mt-2 text-zinc-600">{organisation.name}</p>
        {chargement ? (
          <p className="mt-5 text-sm text-zinc-600">Chargement…</p>
        ) : !estAdministrateur ? (
          <p className="mt-5 text-sm text-rose-600">{message}</p>
        ) : (
          <form onSubmit={enregistrer} className="mt-5 space-y-5">
            <EditeurUnites unites={unites} onChange={setUnites} />
            {message && <p className="text-sm text-zinc-600">{message}</p>}
            <button
              disabled={enregistrement || unites.length === 0}
              className="w-full rounded-xl bg-[#1E3A8A] p-3 font-semibold text-white shadow-sm transition-colors hover:bg-[#162d69] focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {enregistrement ? "Enregistrement…" : "Enregistrer les unités"}
            </button>
          </form>
        )}
      </section>
    </main>
  );
}
