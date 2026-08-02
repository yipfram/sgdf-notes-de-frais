"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useUser, UserButton } from "@clerk/nextjs";
import Image from "next/image";
import {
  BanknotesIcon,
  CheckCircleIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  DocumentTextIcon,
  PaperAirplaneIcon,
  PlusIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { PhotoCapture } from "@/components/PhotoCapture";
import { ChampsDepense, type ValeursDepense } from "@/components/ChampsDepense";
import { ListePiecesJointes } from "@/components/ListePiecesJointes";
import { BRANCHES_ASC } from "@/constants/configScoute";
import { type ExpenseAttachment } from "@/constants/piecesJointes";
import { StatusEstEnligne } from "@/lib/useOnlineStatus";

interface DepenseSaisie {
  date: string;
  categorie: string;
  description: string;
  montant: string;
  piecesJointes: ExpenseAttachment[];
}

type ChampsDepenseInvalides = Partial<
  Record<keyof ValeursDepense | "piecesJointes", boolean>
>;

const nouvelleDepense = (): DepenseSaisie => ({
  date: new Date().toISOString().slice(0, 10),
  categorie: "",
  description: "",
  montant: "",
  piecesJointes: [],
});

export function VueRemboursement() {
  const { user } = useUser();
  const estEnLigne = StatusEstEnligne();
  const [branche, setBranche] = useState("");
  const [titulaireCompte, setTitulaireCompte] = useState("");
  const [profilRemboursementCharge, setProfilRemboursementCharge] =
    useState(false);
  const [sectionInformationsOuverte, setSectionInformationsOuverte] =
    useState(true);
  const informationsDejaRepliees = useRef(false);
  const [depenseEnCours, setDepenseEnCours] =
    useState<DepenseSaisie>(nouvelleDepense);
  const [depenses, setDepenses] = useState<DepenseSaisie[]>([]);
  const [champsInvalides, setChampsInvalides] =
    useState<ChampsDepenseInvalides>({});
  const [envoiEnCours, setEnvoiEnCours] = useState(false);
  const [message, setMessage] = useState<{
    type: "succes" | "erreur" | null;
    texte: string;
  }>({ type: null, texte: "" });

  useEffect(() => {
    const brancheUtilisateur = user?.publicMetadata.branch;
    setBranche(
      typeof brancheUtilisateur === "string" ? brancheUtilisateur : "",
    );
  }, [user?.publicMetadata.branch]);

  useEffect(() => {
    fetch("/api/profil-remboursement")
      .then((reponse) => (reponse.ok ? reponse.json() : null))
      .then((donnees: { titulaireCompte?: string } | null) => {
        if (donnees?.titulaireCompte)
          setTitulaireCompte(donnees.titulaireCompte);
      })
      .catch(() => undefined)
      .finally(() => setProfilRemboursementCharge(true));
  }, []);

  useEffect(() => {
    if (
      !informationsDejaRepliees.current &&
      profilRemboursementCharge &&
      branche &&
      titulaireCompte
    ) {
      setSectionInformationsOuverte(false);
      informationsDejaRepliees.current = true;
    }
  }, [branche, profilRemboursementCharge, titulaireCompte]);

  const total = useMemo(
    () =>
      depenses.reduce(
        (somme, depense) => somme + Number(depense.montant.replace(",", ".")),
        0,
      ),
    [depenses],
  );
  const nombrePiecesJointes =
    depenses.reduce(
      (totalPieces, depense) => totalPieces + depense.piecesJointes.length,
      0,
    ) + depenseEnCours.piecesJointes.length;

  const ajouterDepense = () => {
    const montant = Number(depenseEnCours.montant.replace(",", "."));
    const nouveauxChampsInvalides: ChampsDepenseInvalides = {
      date: !depenseEnCours.date,
      categorie: !depenseEnCours.categorie,
      description: !depenseEnCours.description.trim(),
      montant: !Number.isFinite(montant) || montant <= 0,
      piecesJointes: depenseEnCours.piecesJointes.length === 0,
    };
    if (Object.values(nouveauxChampsInvalides).some(Boolean)) {
      setChampsInvalides(nouveauxChampsInvalides);
      setMessage({
        type: "erreur",
        texte: "Veuillez compléter les champs signalés en rouge.",
      });
      return;
    }
    setDepenses((precedentes) => [...precedentes, depenseEnCours]);
    setDepenseEnCours(nouvelleDepense());
    setChampsInvalides({});
    setMessage({ type: null, texte: "" });
  };

  const enregistrerTitulaire = async () => {
    const valeur = titulaireCompte.trim();
    if (valeur.length < 2) return;
    const reponse = await fetch("/api/profil-remboursement", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ titulaireCompte: valeur }),
    });
    if (!reponse.ok)
      setMessage({
        type: "erreur",
        texte: "Impossible de mémoriser le titulaire du compte.",
      });
  };

  const memoriserBranche = async (nouvelleBranche: string) => {
    setBranche(nouvelleBranche);
    if (!nouvelleBranche) return;

    const reponse = await fetch("/api/update-branch", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ branch: nouvelleBranche }),
    });
    if (!reponse.ok) {
      setMessage({
        type: "erreur",
        texte: "Impossible de mémoriser la branche sélectionnée.",
      });
      return;
    }
    await user?.reload();
  };

  const envoyerDemande = async (evenement: React.FormEvent) => {
    evenement.preventDefault();
    if (
      !estEnLigne ||
      !branche ||
      titulaireCompte.trim().length < 2 ||
      depenses.length === 0
    ) {
      setMessage({
        type: "erreur",
        texte:
          "Ajoutez au moins une dépense et renseignez la branche ainsi que le titulaire du compte.",
      });
      return;
    }
    setEnvoiEnCours(true);
    setMessage({ type: null, texte: "" });
    try {
      const reponse = await fetch("/api/envoyer-remboursement", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          branche,
          titulaireCompte: titulaireCompte.trim(),
          depenses: depenses.map((depense) => ({
            ...depense,
            montant: depense.montant.replace(",", "."),
          })),
        }),
      });
      const donnees = await reponse.json().catch(() => ({}));
      if (!reponse.ok)
        throw new Error(donnees.error || "Erreur lors de l'envoi");
      setDepenses([]);
      setDepenseEnCours(nouvelleDepense());
      setMessage({
        type: "succes",
        texte:
          "Demande envoyée à la trésorerie. Une copie vous a été adressée.",
      });
    } catch (erreur) {
      setMessage({
        type: "erreur",
        texte:
          erreur instanceof Error
            ? erreur.message
            : "Erreur de connexion. Veuillez réessayer.",
      });
    } finally {
      setEnvoiEnCours(false);
    }
  };

  return (
    <main className="min-h-screen bg-zinc-50 p-4">
      <div className="mx-auto max-w-md overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-sm">
        <div className="border-b border-zinc-200 p-6">
          <div className="flex items-center justify-between gap-4">
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
                  Remboursement
                </h1>
              </div>
              <p className="mt-2 text-zinc-500">La Guillotière</p>
            </div>
            <UserButton appearance={{ elements: { avatarBox: "w-10 h-10" } }} />
          </div>
        </div>

        {!estEnLigne && (
          <p className="border-b border-amber-200 bg-amber-50 px-6 py-2 text-center text-sm text-amber-800">
            Hors ligne : l&apos;envoi est indisponible.
          </p>
        )}

        <form noValidate onSubmit={envoyerDemande} className="space-y-6 p-6">
          <section className="rounded-lg border border-zinc-200 bg-zinc-50">
            <button
              type="button"
              className="flex w-full items-center justify-between gap-3 p-4 text-left"
              onClick={() =>
                setSectionInformationsOuverte((ouverte) => !ouverte)
              }
              aria-expanded={sectionInformationsOuverte}
            >
              <span>
                <span className="block text-sm font-medium text-zinc-900">
                  Informations de remboursement
                </span>
                {!sectionInformationsOuverte && (
                  <span className="mt-1 block text-xs text-zinc-600">
                    {titulaireCompte} · {branche}
                  </span>
                )}
              </span>
              {sectionInformationsOuverte ? (
                <ChevronUpIcon className="h-5 w-5 text-zinc-600" />
              ) : (
                <ChevronDownIcon className="h-5 w-5 text-zinc-600" />
              )}
            </button>

            {sectionInformationsOuverte && (
              <div className="space-y-4 border-t border-zinc-200 p-4">
                <div className="space-y-2">
                  <label
                    htmlFor="titulaireCompte"
                    className="block text-sm font-medium text-zinc-700"
                  >
                    Titulaire du compte *
                  </label>
                  <input
                    id="titulaireCompte"
                    value={titulaireCompte}
                    onChange={(e) => setTitulaireCompte(e.target.value)}
                    onBlur={enregistrerTitulaire}
                    placeholder="Prénom NOM"
                    className="w-full rounded-lg border border-zinc-300 bg-white p-3 text-zinc-900 [color-scheme:light] focus:border-zinc-400 focus:ring-2 focus:ring-zinc-400"
                  />
                  <p className="text-xs text-zinc-500">
                    Mémorisé de façon privée pour vos prochaines demandes.
                  </p>
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="brancheRemboursement"
                    className="block text-sm font-medium text-zinc-700"
                  >
                    Branche *
                  </label>
                  <select
                    id="brancheRemboursement"
                    value={branche}
                    onChange={(e) => void memoriserBranche(e.target.value)}
                    className="w-full rounded-lg border border-zinc-300 bg-white p-3 text-zinc-900 [color-scheme:light] focus:border-zinc-400 focus:ring-2 focus:ring-zinc-400"
                  >
                    <option value="">Sélectionner une branche</option>
                    {BRANCHES_ASC.map((valeur) => (
                      <option key={valeur} value={valeur}>
                        {valeur}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </section>

          <div className="border-t border-zinc-200 pt-6">
            <PhotoCapture
              currentCount={nombrePiecesJointes}
              messageErreur={
                champsInvalides.piecesJointes
                  ? "Ajoutez au moins un justificatif."
                  : undefined
              }
              onAttachmentsAdd={(piecesJointes) => {
                setDepenseEnCours((precedente) => ({
                  ...precedente,
                  piecesJointes: [
                    ...precedente.piecesJointes,
                    ...piecesJointes,
                  ],
                }));
                setChampsInvalides((precedents) => ({
                  ...precedents,
                  piecesJointes: false,
                }));
              }}
            />
            <div className="mt-4">
              <ListePiecesJointes
                piecesJointes={depenseEnCours.piecesJointes}
                onSupprimer={(index) =>
                  setDepenseEnCours((precedente) => ({
                    ...precedente,
                    piecesJointes: precedente.piecesJointes.filter(
                      (_, position) => position !== index,
                    ),
                  }))
                }
              />
            </div>

            <h2 className="mt-6 flex items-center gap-2 text-lg font-semibold text-zinc-900">
              <BanknotesIcon className="h-5 w-5" /> Ajouter une dépense
            </h2>
            <div className="mt-4 space-y-4">
              <ChampsDepense
                valeurs={depenseEnCours}
                champsInvalides={champsInvalides}
                onModifier={(champ, valeur) => {
                  setDepenseEnCours((precedente) => ({
                    ...precedente,
                    [champ]: valeur,
                  }));
                  setChampsInvalides((precedents) => ({
                    ...precedents,
                    [champ]: false,
                  }));
                }}
                prefixeId="remboursement"
                descriptionObligatoire
                validationNative={false}
              />
              <button
                type="button"
                onClick={ajouterDepense}
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-zinc-300 p-3 font-medium text-zinc-800 hover:bg-zinc-50"
              >
                <PlusIcon className="h-5 w-5" />
                Ajouter cette dépense
              </button>
            </div>
          </div>

          {depenses.length > 0 && (
            <div className="space-y-3 border-t border-zinc-200 pt-6">
              <h2 className="flex items-center gap-2 text-lg font-semibold text-zinc-900">
                <DocumentTextIcon className="h-5 w-5" /> Dépenses ajoutées (
                {depenses.length})
              </h2>
              {depenses.map((depense, index) => (
                <div
                  key={`${depense.date}-${index}`}
                  className="flex items-start justify-between gap-3 rounded-lg border border-zinc-200 bg-zinc-50 p-3"
                >
                  <div>
                    <p className="font-medium text-zinc-900">
                      {depense.categorie} -{" "}
                      {Number(depense.montant.replace(",", ".")).toFixed(2)} EUR
                    </p>
                    <p className="text-sm text-zinc-600">
                      {depense.date} · {depense.description}
                    </p>
                    <p className="mt-1 text-xs text-zinc-500">
                      {depense.piecesJointes.length} justificatif(s)
                    </p>
                  </div>
                  <button
                    type="button"
                    aria-label={`Supprimer la dépense ${index + 1}`}
                    onClick={() =>
                      setDepenses((precedentes) =>
                        precedentes.filter((_, position) => position !== index),
                      )
                    }
                    className="p-1 text-zinc-600"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </div>
              ))}
              <p className="text-right text-lg font-semibold text-zinc-900">
                Total : {total.toFixed(2)} EUR
              </p>
            </div>
          )}

          {message.type && (
            <div
              className={`rounded-lg border p-3 text-sm ${message.type === "succes" ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-rose-200 bg-rose-50 text-rose-800"}`}
            >
              {message.type === "succes" && (
                <CheckCircleIcon className="mr-2 inline h-5 w-5" />
              )}
              {message.texte}
            </div>
          )}
          <button
            type="submit"
            disabled={envoiEnCours || !estEnLigne || depenses.length === 0}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-zinc-900 p-3 font-medium text-white hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-400"
          >
            <PaperAirplaneIcon className="h-5 w-5" />
            {envoiEnCours ? "Envoi en cours..." : "Envoyer la demande"}
          </button>
        </form>
      </div>
    </main>
  );
}
