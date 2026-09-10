"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { clientAuth } from "@/lib/auth-client";
import { FormulaireDepense } from "@/components/FormulaireDepense";
import { CapturePhoto } from "@/components/PhotoCapture";
import { InviteInstallation } from "@/components/InstallPrompt";
import { ConfigurationGroupe } from "@/components/GroupSetup";
import { useStatutEnLigne } from "@/lib/useOnlineStatus";
import {
  MAX_ATTACHMENT_COUNT,
  type PieceJointeDepense,
} from "@/constants/piecesJointes";
import type { UniteGroupe } from "@/lib/group";

type Groupe = {
  units: UniteGroupe[];
  configured: boolean;
  treasuryVerified: boolean;
  isAdmin: boolean;
  unitPreference: string;
};

export default function Home() {
  const { data: session, isPending } = clientAuth.useSession();
  const { data: organisation } = clientAuth.useActiveOrganization();
  const { data: organisations } = clientAuth.useListOrganizations();
  const [piecesJointes, setPiecesJointes] = useState<PieceJointeDepense[]>([]);
  const [groupe, setGroupe] = useState<Groupe | null>(null);
  const [nomGroupe, setNomGroupe] = useState("");
  const [initialisationGroupeTerminee, setInitialisationGroupeTerminee] =
    useState(false);
  const [choixManuelGroupe, setChoixManuelGroupe] = useState(false);
  const estEnLigne = useStatutEnLigne();

  const definirGroupePrincipal = async (identifiantOrganisation: string) => {
    await fetch("/api/user/default-group", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ organizationId: identifiantOrganisation }),
    });
  };

  useEffect(() => {
    if (!session || organisation || !organisations || choixManuelGroupe) return;
    let annule = false;
    const activerGroupePrincipal = async () => {
      try {
        const reponse = await fetch("/api/user/default-group");
        const { organizationId } = reponse.ok
          ? ((await reponse.json()) as { organizationId: string | null })
          : { organizationId: null };
        if (
          organizationId &&
          organisations.some((item) => item.id === organizationId)
        ) {
          await clientAuth.organization.setActive({ organizationId });
        }
      } finally {
        if (!annule) setInitialisationGroupeTerminee(true);
      }
    };
    void activerGroupePrincipal();
    return () => {
      annule = true;
    };
  }, [choixManuelGroupe, organisation, organisations, session]);

  const chargerGroupe = useCallback(() => {
    if (!organisation) return setGroupe(null);
    fetch("/api/group/config")
      .then((r) => (r.ok ? r.json() : null))
      .then(setGroupe)
      .catch(() => setGroupe(null));
  }, [organisation]);
  useEffect(() => {
    chargerGroupe();
  }, [chargerGroupe]);

  if (isPending)
    return (
      <main className="min-h-screen bg-zinc-50 p-6 text-center text-zinc-600">
        Chargement…
      </main>
    );
  if (!session) {
    if (typeof window !== "undefined") window.location.assign("/sign-in");
    return null;
  }
  const creerGroupe = async () => {
    const nom = nomGroupe.trim();
    if (!nom) return;
    const normalise = nom
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    const resultat = await clientAuth.organization.create({
      name: nom,
      slug: `${normalise}-${Date.now().toString(36)}`,
    });
    if (resultat.data?.id) {
      await definirGroupePrincipal(resultat.data.id);
      await clientAuth.organization.setActive({
        organizationId: resultat.data.id,
      });
    }
    setNomGroupe("");
  };
  if (!organisation && !initialisationGroupeTerminee && !choixManuelGroupe)
    return (
      <main className="min-h-screen bg-zinc-50 p-6 text-center text-zinc-600">
        Chargement…
      </main>
    );
  if (!organisation)
    return (
      <main className="min-h-screen bg-zinc-50 p-6 flex items-center justify-center">
        <section className="w-full max-w-md rounded-xl border border-zinc-200 bg-white p-6">
          <h1 className="text-2xl font-semibold text-zinc-900">Bienvenue</h1>
          <p className="mt-2 text-zinc-600">
            Choisissez ou créez votre groupe scout.
          </p>
          <div className="mt-5 space-y-2">
            {organisations?.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() =>
                  void (async () => {
                    await definirGroupePrincipal(item.id);
                    await clientAuth.organization.setActive({
                      organizationId: item.id,
                    });
                  })()
                }
                className="block w-full rounded-lg border border-zinc-300 p-3 text-left text-zinc-900 hover:bg-zinc-50"
              >
                {item.name}
              </button>
            ))}
          </div>
          <div className="mt-5 flex gap-2">
            <input
              value={nomGroupe}
              onChange={(e) => setNomGroupe(e.target.value)}
              placeholder="Nom du groupe"
              className="min-w-0 flex-1 rounded-lg border border-zinc-300 bg-white p-3 text-zinc-900 placeholder:text-zinc-500"
            />
            <button
              type="button"
              onClick={() => void creerGroupe()}
              className="rounded-lg bg-[#1E3A8A] px-4 text-white"
            >
              Créer
            </button>
          </div>
        </section>
      </main>
    );
  return (
    <main className="min-h-screen bg-zinc-50 p-4">
      <div className="mx-auto max-w-md overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-sm">
        <header className="flex items-center justify-between border-b border-zinc-200 p-6">
          <div>
            <h1 className="text-2xl font-semibold text-zinc-900">Scouticket</h1>
            <p className="mt-2 text-zinc-500">{organisation.name}</p>
          </div>
          <button
            type="button"
            onClick={() =>
              void clientAuth.signOut({
                fetchOptions: {
                  onSuccess: () => window.location.assign("/sign-in"),
                },
              })
            }
            className="text-sm text-zinc-600 underline"
          >
            Déconnexion
          </button>
        </header>
        {!estEnLigne && (
          <p className="bg-amber-50 p-2 text-center text-sm text-amber-800">
            Hors ligne - certaines fonctionnalités sont limitées
          </p>
        )}
        <div className="space-y-6 p-6">
          {!groupe?.configured && groupe?.isAdmin ? (
            <ConfigurationGroupe onSaved={chargerGroupe} />
          ) : !groupe?.configured ? (
            <p className="text-sm text-zinc-600">
              Votre responsable doit terminer la configuration du groupe.
            </p>
          ) : (
            <>
              <div className="flex gap-3 text-sm">
                {groupe.isAdmin && (
                  <Link
                    href="/gestion-membres"
                    className="font-medium text-[#1E3A8A]"
                  >
                    Gérer les membres
                  </Link>
                )}
                <button
                  type="button"
                  onClick={() =>
                    void (async () => {
                      setChoixManuelGroupe(true);
                      await clientAuth.organization.setActive({
                        organizationId: null,
                      });
                    })()
                  }
                  className="text-zinc-600 underline"
                >
                  Changer de groupe
                </button>
              </div>
              <CapturePhoto
                onAttachmentsAdd={(nouvelles) =>
                  setPiecesJointes((precedentes) =>
                    [...precedentes, ...nouvelles].slice(
                      0,
                      MAX_ATTACHMENT_COUNT,
                    ),
                  )
                }
                currentCount={piecesJointes.length}
              />
              <FormulaireDepense
                key={organisation.id}
                piecesJointes={piecesJointes}
                emailUtilisateur={session.user.email}
                units={groupe.units}
                uniteInitiale={groupe.unitPreference}
                treasuryVerified={groupe.treasuryVerified}
                onChangementUnite={(unitId) =>
                  void fetch("/api/user/unit-preference", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      organizationId: organisation.id,
                      unitId,
                    }),
                  })
                }
                erreurEnregistrementUnite=""
                onCreerNouvelleNote={() => setPiecesJointes([])}
                onSupprimerPieceJointe={(index) =>
                  setPiecesJointes((precedentes) =>
                    precedentes.filter((_, i) => i !== index),
                  )
                }
                estEnLigne={estEnLigne}
              />
            </>
          )}
        </div>
      </div>
      <InviteInstallation />
    </main>
  );
}
