"use client";

import { useState, useEffect } from "react";
import {
  useOrganization,
  useUser,
  UserButton,
  OrganizationSwitcher,
  InviteMembersButton,
} from "@clerk/nextjs";
import { FormulaireDepense } from "@/components/FormulaireDepense";
import { AvertissementNouveaute } from "@/components/FeatureNotice";
import { CapturePhoto } from "@/components/PhotoCapture";
import { useStatutEnLigne } from "@/lib/useOnlineStatus";
import { InviteInstallation } from "@/components/InstallPrompt";
import {
  MAX_ATTACHMENT_COUNT,
  type PieceJointeDepense,
} from "@/constants/piecesJointes";
import Image from "next/image";
import { ConfigurationGroupe } from "@/components/GroupSetup";
import type { UniteGroupe } from "@/lib/group";

export default function Home() {
  const { isSignedIn, user, isLoaded } = useUser();
  const { organization } = useOrganization();
  const [piecesJointes, setPiecesJointes] = useState<PieceJointeDepense[]>([]);
  const [group, setGroup] = useState<{
    units: UniteGroupe[];
    configured: boolean;
    treasuryVerified: boolean;
    isAdmin: boolean;
  } | null>(null);
  const [etatRenvoiValidation, setEtatRenvoiValidation] = useState<
    "repos" | "envoi" | "envoye" | "erreur"
  >("repos");
  const estEnLigne = useStatutEnLigne();

  useEffect(() => {
    setEtatRenvoiValidation("repos");
    if (!organization) {
      setGroup(null);
      return;
    }
    fetch("/api/group/config")
      .then((response) => (response.ok ? response.json() : null))
      .then(setGroup)
      .catch(() => setGroup(null));
  }, [organization?.id]);

  const renvoyerValidationTresorerie = async () => {
    setEtatRenvoiValidation("envoi");
    try {
      const reponse = await fetch("/api/group/resend-verification", {
        method: "POST",
      });
      setEtatRenvoiValidation(reponse.ok ? "envoye" : "erreur");
    } catch {
      setEtatRenvoiValidation("erreur");
    }
  };

  // Afficher un loader pendant le chargement de l'état d'authentification
  if (!isLoaded || !isSignedIn) {
    return (
      <main className="min-h-screen p-4 flex items-center justify-center bg-zinc-50">
        <div className="text-zinc-600 text-sm">Chargement…</div>
      </main>
    );
  }

  if (!organization)
    return (
      <main className="min-h-screen bg-zinc-950 p-4 text-white flex items-center justify-center">
        <section className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
          <h1 className="text-2xl font-semibold">Bienvenue</h1>
          <p className="mt-2 text-zinc-300">
            Créez votre groupe ou sélectionnez un groupe auquel vous avez été
            invité.
          </p>
          <div className="mt-6">
            <OrganizationSwitcher />
          </div>
        </section>
      </main>
    );

  return (
    <main className="min-h-screen p-4 bg-zinc-950">
      <div className="max-w-md mx-auto bg-white rounded-lg border border-zinc-200 shadow-sm overflow-hidden">
        <div className="bg-white p-6 border-b border-zinc-200">
          <div className="flex justify-between items-center">
            <div>
              <div className="flex items-center gap-2">
                <Image
                  src="/SGDF_symbole_RVB.png"
                  alt="SGDF"
                  width={28}
                  height={20}
                  className="rounded-sm"
                  style={{ height: "auto" }}
                />
                <h1 className="text-2xl font-semibold text-zinc-900">
                  Factures carte procurement SGDF
                </h1>
              </div>
              <p className="text-zinc-500 mt-2">{organization.name}</p>
            </div>
            <div className="flex items-center space-x-3">
              <UserButton
                appearance={{
                  elements: {
                    avatarBox: "w-10 h-10",
                  },
                }}
              />
              <OrganizationSwitcher hidePersonal />
            </div>
          </div>
        </div>

        {!estEnLigne && (
          <div className="bg-amber-50 border-t border-b border-amber-200 text-amber-800 text-center text-sm py-2">
            Hors ligne - certaines fonctionnalités sont limitées
          </div>
        )}

        <div className="p-6 space-y-6">
          {!group?.configured && group?.isAdmin ? (
            <ConfigurationGroupe
              onSaved={() => {
                fetch("/api/group/config")
                  .then((response) => response.json())
                  .then(setGroup);
              }}
            />
          ) : !group?.configured ? (
            <p className="text-sm text-zinc-600">
              Votre responsable doit terminer la configuration du groupe.
            </p>
          ) : (
            <>
              {!group.treasuryVerified && (
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                  <p>
                    Un mail a été envoyé à l'adresse de la trésorerie pour
                    confirmer son rattachement. Une fois validé, vous pourrez
                    envoyer des justificatifs.
                  </p>
                  {group.isAdmin && (
                    <div className="mt-3">
                      <button
                        type="button"
                        onClick={renvoyerValidationTresorerie}
                        disabled={etatRenvoiValidation === "envoi"}
                        className="rounded-lg border border-amber-300 bg-white px-3 py-2 font-medium text-amber-900 transition-colors hover:bg-amber-100 focus:outline-none focus:ring-2 focus:ring-amber-500 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {etatRenvoiValidation === "envoi"
                          ? "Envoi…"
                          : "Renvoyer l’e-mail"}
                      </button>
                      {etatRenvoiValidation === "envoye" && (
                        <p className="mt-2 text-emerald-800">
                          E-mail de validation renvoyé.
                        </p>
                      )}
                      {etatRenvoiValidation === "erreur" && (
                        <p className="mt-2 text-rose-800">
                          Impossible de renvoyer l’e-mail pour le moment.
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}
              <AvertissementNouveaute />
              {group.isAdmin && (
                <InviteMembersButton>
                  <button
                    type="button"
                    className="w-full rounded-lg border border-zinc-300 bg-white p-3 text-sm font-medium text-[#1E3A8A] transition-colors hover:border-[#1E3A8A] hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] focus:ring-offset-2"
                  >
                    Inviter une personne
                  </button>
                </InviteMembersButton>
              )}
              <CapturePhoto
                onAttachmentsAdd={(nouvellesPiecesJointes) => {
                  setPiecesJointes((precedentes) =>
                    [...precedentes, ...nouvellesPiecesJointes].slice(
                      0,
                      MAX_ATTACHMENT_COUNT,
                    ),
                  );
                }}
                currentCount={piecesJointes.length}
              />

              <FormulaireDepense
                piecesJointes={piecesJointes}
                emailUtilisateur={user?.emailAddresses[0]?.emailAddress || ""}
                units={group.units}
                uniteInitiale={
                  typeof window === "undefined"
                    ? ""
                    : (window.localStorage.getItem(
                        `sgdf-unit:${organization.id}`,
                      ) ?? "")
                }
                treasuryVerified={group.treasuryVerified}
                onChangementUnite={(unitId) =>
                  window.localStorage.setItem(
                    `sgdf-unit:${organization.id}`,
                    unitId,
                  )
                }
                onCreerNouvelleNote={() => {
                  setPiecesJointes([]);
                }}
                onSupprimerPieceJointe={(index) => {
                  setPiecesJointes((precedentes) =>
                    precedentes.filter((_, i) => i !== index),
                  );
                }}
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
