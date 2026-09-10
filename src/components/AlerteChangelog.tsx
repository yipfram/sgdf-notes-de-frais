"use client";

import { useEffect, useState } from "react";

export function AlerteChangeLog() {
  const [ouvert, setOuvert] = useState(false);
  const [nePlusAfficher, setNePlusAfficher] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem("alerte-authentification-v1")) setOuvert(true);
  }, []);

  function fermer() {
    if (nePlusAfficher)
      localStorage.setItem("alerte-authentification-v1", "vue");
    setOuvert(false);
  }

  if (!ouvert) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="max-w-md rounded-2xl border border-white/10 bg-zinc-900 p-6 text-zinc-100 shadow-2xl">
        <h2 className="text-xl font-semibold">Quelques changements</h2>
        <p className="mt-3 text-zinc-300">
          Nous avons changé de manière de gérer les comptes, en internalisant la
          gestion (plus de gestionnaire tiers). Les informations que vous avez
          rentré devraient être synchronisées.
        </p>
        <p className="mt-3 text-zinc-300">
          Si vous voyez un bug, signalez-le à{" "}
          <a
            className="underline"
            href="mailto:romainrochas69@gmail.com?subject=BUG%20-%20Scouticket"
          >
            romainrochas69@gmail.com
          </a>
          .
        </p>
        <div className="mt-6 flex items-center gap-4">
          <button
            className="rounded-lg bg-white px-4 py-2 font-medium text-zinc-900"
            onClick={fermer}
          >
            J’ai compris
          </button>
          <label className="flex items-center gap-2 text-sm text-zinc-300">
            <input
              type="checkbox"
              checked={nePlusAfficher}
              onChange={(event) => setNePlusAfficher(event.target.checked)}
            />
            Ne plus montrer
          </label>
        </div>
      </div>
    </div>
  );
}
