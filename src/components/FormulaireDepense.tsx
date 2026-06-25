"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  ClipboardDocumentListIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  PlusCircleIcon,
  PaperAirplaneIcon,
  DocumentTextIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { buildNormalizedFileNames } from "@/lib/attachments";
import {
  MAX_ATTACHMENT_COUNT,
  MAX_ATTACHMENT_SIZE_BYTES,
  MAX_TOTAL_ATTACHMENTS_SIZE_BYTES,
  type ExpenseAttachment,
} from "@/constants/piecesJointes";
import { TYPES_DEPENSES, BRANCHES_ASC } from "@/constants/configScoute";

interface FormulaireDepenseProps {
  readonly piecesJointes: ExpenseAttachment[];
  readonly emailUtilisateur: string;
  readonly brancheInitiale?: string; // Depuis les métadonnées publiques Clerk
  readonly onMemoriserBranche?: (branche: string) => Promise<void> | void;
  readonly onCreerNouvelleNote?: () => void;
  readonly onChangementBranche?: (branche: string) => void;
  readonly onSupprimerPieceJointe?: (index: number) => void;
}

export function FormulaireDepense({
  piecesJointes,
  emailUtilisateur,
  brancheInitiale = "",
  onMemoriserBranche,
  onCreerNouvelleNote,
  onChangementBranche,
  onSupprimerPieceJointe,
  estEnLigne = true,
}: FormulaireDepenseProps & { estEnLigne?: boolean }) {
  const [formulaire, setFormulaire] = useState({
    date: new Date().toISOString().split("T")[0],
    branche: brancheInitiale || "",
    typeDepense: "",
    montant: "",
    description: "",
  });
  const emailTresorier = process.env.NEXT_PUBLIC_TREASURY_EMAIL ?? "";

  const [statutMemoBranche, setStatutMemoBranche] = useState<
    "repos" | "sauvegarde" | "sauvegardee" | "erreur"
  >("repos");

  // Synchronise la branche initiale quand les métadonnées Clerk arrivent.
  useEffect(() => {
    if (brancheInitiale !== formulaire.branche) {
      // Permet de vider la valeur, sans écraser une saisie déjà modifiée.
      if (!formulaire.branche || brancheInitiale === "") {
        setFormulaire((prev) => ({ ...prev, branche: brancheInitiale }));
      }
    }
  }, [brancheInitiale, formulaire.branche]);

  const [envoiEnCours, setEnvoiEnCours] = useState(false);
  const [statutEnvoi, setStatutEnvoi] = useState<{
    type: "succes" | "erreur" | null;
    message: string;
  }>({ type: null, message: "" });

  const modifierChamp = (
    champ: "date" | "branche" | "typeDepense" | "montant" | "description",
    valeur: string,
  ) => {
    setFormulaire((prev) => ({ ...prev, [champ]: valeur }));
    if (champ === "branche") {
      if (onChangementBranche) {
        onChangementBranche(valeur);
      }
      // Mémorise la branche dans les métadonnées utilisateur.
      if (onMemoriserBranche && valeur) {
        setStatutMemoBranche("sauvegarde");
        Promise.resolve(onMemoriserBranche(valeur))
          .then(() => setStatutMemoBranche("sauvegardee"))
          .catch(() => setStatutMemoBranche("erreur"));
      }
    }
    if (statutEnvoi.type) {
      setStatutEnvoi({ type: null, message: "" });
    }
  };

  const normaliserMontant = (montant: string) => {
    return montant.replace(",", ".");
  };

  const genererNomsFichiers = () => {
    if (piecesJointes.length === 0) return [];
    return buildNormalizedFileNames(piecesJointes, {
      date: formulaire.date,
      branch: formulaire.branche,
      expenseType: formulaire.typeDepense,
      amount: normaliserMontant(formulaire.montant),
    });
  };

  const envoyerDepense = async (evenement: React.FormEvent) => {
    evenement.preventDefault();

    if (
      piecesJointes.length === 0 ||
      !formulaire.branche ||
      !formulaire.typeDepense ||
      !formulaire.montant
    ) {
      setStatutEnvoi({
        type: "erreur",
        message:
          "Veuillez remplir tous les champs obligatoires et ajouter au moins un justificatif.",
      });
      return;
    }

    setEnvoiEnCours(true);
    setStatutEnvoi({ type: null, message: "" });

    try {
      const nomsFichiersNormalises = genererNomsFichiers();
      const piecesJointesPourApi = piecesJointes.map((pieceJointe, index) => ({
        ...pieceJointe,
        normalizedFileName:
          nomsFichiersNormalises[index] ||
          pieceJointe.normalizedFileName ||
          pieceJointe.originalFileName,
      }));

      const reponse = await fetch("/api/send-expense", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userEmail: emailUtilisateur,
          date: formulaire.date,
          branch: formulaire.branche,
          expenseType: formulaire.typeDepense,
          amount: normaliserMontant(formulaire.montant),
          description: formulaire.description,
          attachments: piecesJointesPourApi,
        }),
      });

      const texteReponse = await reponse.text();
      let erreurApi = "";
      if (texteReponse) {
        try {
          const donnees = JSON.parse(texteReponse) as { error?: string };
          erreurApi = donnees.error || "";
        } catch {
          // Certaines erreurs plateforme (ex. 413) ne renvoient pas du JSON.
        }
      }

      if (reponse.ok) {
        setStatutEnvoi({
          type: "succes",
          message:
            "Email envoyé avec succès ! La facture a été transmise à la trésorerie et une copie vous a été envoyée.",
        });
        // Réinitialise les champs variables, mais garde la branche.
        setFormulaire((prev) => ({
          date: new Date().toISOString().split("T")[0],
          branche: prev.branche,
          typeDepense: "",
          montant: "",
          description: "",
        }));
      } else {
        const piecesJointesTropLourdes =
          reponse.status === 413 ||
          /payload too large|request entity too large|function_payload_too_large/i.test(
            texteReponse,
          );
        const erreurValidation = reponse.status === 400;
        const erreurAuth = reponse.status === 401 || reponse.status === 403;
        const tropDeTentatives = reponse.status === 429;
        const erreurServeur = reponse.status >= 500;

        let messageErreur = erreurApi || "Erreur lors de l'envoi de l'email";

        if (piecesJointesTropLourdes) {
          messageErreur = `Pièces jointes trop volumineuses. Réduisez la taille ou le nombre de fichiers (max ${MAX_ATTACHMENT_COUNT} fichiers, ${(MAX_ATTACHMENT_SIZE_BYTES / (1024 * 1024)).toFixed(0)}MB/fichier, ${(MAX_TOTAL_ATTACHMENTS_SIZE_BYTES / (1024 * 1024)).toFixed(0)}MB au total), puis réessayez.`;
        } else if (erreurAuth) {
          messageErreur =
            "Session expirée ou accès refusé. Veuillez vous reconnecter puis réessayer.";
        } else if (tropDeTentatives) {
          messageErreur =
            "Trop de tentatives. Veuillez patienter quelques minutes puis réessayer.";
        } else if (erreurServeur) {
          messageErreur =
            "Erreur serveur temporaire. Veuillez réessayer plus tard.";
        } else if (erreurValidation && !erreurApi) {
          messageErreur =
            "Données invalides. Vérifiez le formulaire puis réessayez.";
        }

        setStatutEnvoi({
          type: "erreur",
          message: messageErreur,
        });
      }
    } catch (erreur) {
      console.error("Erreur:", erreur);
      setStatutEnvoi({
        type: "erreur",
        message: "Erreur de connexion. Veuillez réessayer.",
      });
    } finally {
      setEnvoiEnCours(false);
    }
  };

  // Validation complète (inclut type de dépense)
  const formulaireEstValide = Boolean(
    piecesJointes.length > 0 &&
      formulaire.branche &&
      formulaire.typeDepense &&
      formulaire.montant,
  );
  const nomsFichiersApercu = formulaireEstValide ? genererNomsFichiers() : [];

  const creerNouvelleNote = () => {
    // Vide le formulaire, garde la branche et demande au parent de retirer les fichiers.
    setFormulaire((prev) => ({
      date: new Date().toISOString().split("T")[0],
      branche: prev.branche,
      typeDepense: "",
      montant: "",
      description: "",
    }));
    setStatutEnvoi({ type: null, message: "" });
    if (onCreerNouvelleNote) onCreerNouvelleNote();
  };

  return (
    <form onSubmit={envoyerDepense} className="space-y-6">
      <h2 className="text-lg font-semibold text-zinc-900 flex items-center gap-2">
        <ClipboardDocumentListIcon
          className="w-5 h-5 text-zinc-700"
          aria-hidden="true"
        />
        Informations de la dépense
      </h2>

      {piecesJointes.length > 0 && (
        <div className="space-y-2">
          <label className="block text-sm font-medium text-zinc-700">
            Justificatifs ({piecesJointes.length})
          </label>
          <div className="space-y-2">
            {piecesJointes.map((pieceJointe, index) => {
              const estImage = pieceJointe.mimeType.startsWith("image/");
              return (
                <div
                  key={`${pieceJointe.displayName}-${index}`}
                  className="flex items-center gap-3 p-3 rounded-lg border border-zinc-200 bg-zinc-50"
                >
                  {estImage ? (
                    <Image
                      src={`data:${pieceJointe.mimeType};base64,${pieceJointe.base64Data}`}
                      alt={pieceJointe.displayName}
                      width={56}
                      height={56}
                      className="w-14 h-14 object-cover rounded-md border border-zinc-200"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-md border border-zinc-200 bg-white flex items-center justify-center">
                      <DocumentTextIcon
                        className="w-8 h-8 text-zinc-500"
                        aria-hidden="true"
                      />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-zinc-900 truncate font-medium">
                      {pieceJointe.displayName}
                    </p>
                    <p className="text-xs text-zinc-500">
                      {pieceJointe.mimeType === "application/pdf"
                        ? "PDF"
                        : "Image"}
                    </p>
                  </div>
                  {onSupprimerPieceJointe && (
                    <button
                      type="button"
                      onClick={() => onSupprimerPieceJointe(index)}
                      className="p-2 rounded-md text-zinc-500 hover:bg-zinc-200 hover:text-zinc-700 transition-colors"
                      aria-label={`Supprimer ${pieceJointe.displayName}`}
                    >
                      <TrashIcon className="w-5 h-5" aria-hidden="true" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="space-y-2">
        <label
          htmlFor="typeDepense"
          className="block text-sm font-medium text-zinc-700"
        >
          Type de dépense *
        </label>
        <select
          id="typeDepense"
          value={formulaire.typeDepense}
          onChange={(e) => modifierChamp("typeDepense", e.target.value)}
          className="w-full p-3 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-zinc-400 focus:border-zinc-400 bg-white text-zinc-900"
          required
        >
          <option value="">Sélectionner un type</option>
          {TYPES_DEPENSES.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <label
          htmlFor="date"
          className="block text-sm font-medium text-zinc-700"
        >
          Date *
        </label>
        <input
          id="date"
          type="date"
          value={formulaire.date}
          onChange={(e) => modifierChamp("date", e.target.value)}
          className="w-full p-3 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-zinc-400 focus:border-zinc-400 bg-white text-zinc-900"
          required
        />
      </div>

      <div className="space-y-2">
        <label
          htmlFor="branche"
          className="block text-sm font-medium text-zinc-700"
        >
          Branche *
        </label>
        <select
          id="branche"
          value={formulaire.branche}
          onChange={(e) => modifierChamp("branche", e.target.value)}
          className="w-full p-3 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-zinc-400 focus:border-zinc-400 bg-white text-zinc-900"
          required
        >
          <option value="">Sélectionner une branche</option>
          {BRANCHES_ASC.map((branche) => (
            <option key={branche} value={branche}>
              {branche}
            </option>
          ))}
        </select>
        {formulaire.branche && (
          <div className="mt-1 flex items-center justify-between">
            <p className="text-xs text-zinc-500 flex items-center gap-1">
              {statutMemoBranche === "sauvegarde" && (
                <span className="inline-flex items-center gap-1">
                  <svg
                    className="animate-spin h-3.5 w-3.5 text-zinc-500"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  Sauvegarde…
                </span>
              )}
              {statutMemoBranche === "sauvegardee" && (
                <span className="inline-flex items-center gap-1 text-emerald-700">
                  <CheckCircleIcon className="w-4 h-4" aria-hidden="true" />{" "}
                  Branche mémorisée
                </span>
              )}
              {statutMemoBranche === "erreur" && (
                <span className="inline-flex items-center gap-1 text-rose-700">
                  <ExclamationTriangleIcon
                    className="w-4 h-4"
                    aria-hidden="true"
                  />{" "}
                  Erreur de sauvegarde
                </span>
              )}
            </p>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <label
          htmlFor="montant"
          className="block text-sm font-medium text-zinc-700"
        >
          Montant (€) *
        </label>
        <input
          id="montant"
          type="number"
          step="0.01"
          placeholder="0.00"
          value={formulaire.montant}
          onChange={(e) => modifierChamp("montant", e.target.value)}
          className="w-full p-3 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-zinc-400 focus:border-zinc-400 bg-white text-zinc-900"
          required
        />
      </div>

      <div className="space-y-2">
        <label
          htmlFor="description"
          className="block text-sm font-medium text-zinc-700"
        >
          Description (optionnel)
        </label>
        <textarea
          id="description"
          placeholder="Description de la dépense..."
          value={formulaire.description}
          onChange={(e) => modifierChamp("description", e.target.value)}
          rows={3}
          className="w-full p-3 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-zinc-400 focus:border-zinc-400 resize-none bg-white text-zinc-900"
        />
      </div>

      {/* Messages de statut */}
      {statutEnvoi.type && (
        <div
          className={`p-4 rounded-lg space-y-3 ${
            statutEnvoi.type === "succes"
              ? "bg-emerald-50 border border-emerald-200 text-emerald-800"
              : "bg-rose-50 border border-rose-200 text-rose-800"
          }`}
        >
          <p className="text-sm flex items-start gap-2">
            {statutEnvoi.type === "succes" ? (
              <CheckCircleIcon
                className="w-5 h-5 flex-none"
                aria-hidden="true"
              />
            ) : (
              <ExclamationTriangleIcon
                className="w-5 h-5 flex-none"
                aria-hidden="true"
              />
            )}
            <span>{statutEnvoi.message}</span>
          </p>
          {statutEnvoi.type === "succes" && (
            <button
              type="button"
              onClick={creerNouvelleNote}
              className="w-full p-3 rounded-lg font-medium bg-zinc-900 text-white hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-400 transition-colors"
            >
              <span className="inline-flex items-center justify-center gap-2">
                <PlusCircleIcon className="w-5 h-5" aria-hidden="true" />{" "}
                Nouvelle facture
              </span>
            </button>
          )}
        </div>
      )}

      <div className="space-y-4">
        {formulaireEstValide && !statutEnvoi.type && (
          <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-lg">
            <p className="text-sm text-zinc-800">
              <span className="inline-flex items-center gap-2 font-medium">
                <PaperAirplaneIcon className="w-4 h-4" aria-hidden="true" />{" "}
                Email sera envoyé à :
              </span>
              <br />• Trésorerie : {emailTresorier}
              <br />• Vous : {emailUtilisateur}
              <br />
              <span className="inline-flex items-center gap-2 font-medium">
                <svg
                  className="w-4 h-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 5 17 10" />
                  <line x1="12" x2="12" y1="5" y2="20" />
                </svg>
                Pièce(s) jointe(s) :
              </span>
              <br />
              {nomsFichiersApercu.map((nom) => (
                <span key={nom}>
                  • {nom}
                  <br />
                </span>
              ))}
            </p>
          </div>
        )}

        {!estEnLigne && (
          <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-sm flex items-start gap-2">
            <ExclamationTriangleIcon
              className="w-5 h-5 mt-0.5"
              aria-hidden="true"
            />
            <span>
              Vous êtes hors ligne. Vous pouvez préparer la note mais
              l&apos;envoi ne fonctionnera qu&apos;une fois reconnecté.
            </span>
          </div>
        )}

        <button
          type="submit"
          disabled={!formulaireEstValide || envoiEnCours || !estEnLigne}
          className={`w-full p-4 rounded-lg font-semibold text-white transition-colors focus:outline-none ${
            formulaireEstValide && !envoiEnCours && estEnLigne
              ? "bg-zinc-900 hover:bg-zinc-800 focus:ring-2 focus:ring-zinc-400"
              : "bg-zinc-300 cursor-not-allowed"
          }`}
        >
          {envoiEnCours ? (
            <span className="flex items-center justify-center">
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Envoi en cours...
            </span>
          ) : (
            <span className="inline-flex items-center justify-center gap-2">
              <PaperAirplaneIcon className="w-5 h-5" aria-hidden="true" />{" "}
              Envoyer la facture
            </span>
          )}
        </button>
      </div>
    </form>
  );
}
