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
import { construireNomsFichiersNormalises } from "@/lib/attachments";
import {
  MAX_ATTACHMENT_COUNT,
  MAX_ATTACHMENT_SIZE_BYTES,
  MAX_TOTAL_ATTACHMENTS_SIZE_BYTES,
  type PieceJointeDepense,
  type DetailDepense,
} from "@/constants/piecesJointes";
import { TYPES_DEPENSES } from "@/constants/configScoute";
import type { UniteGroupe } from "@/lib/group";

interface FormulaireDepenseProps {
  readonly piecesJointes: PieceJointeDepense[];
  readonly emailUtilisateur: string;
  readonly units: UniteGroupe[];
  readonly uniteInitiale?: string;
  readonly treasuryVerified: boolean;
  readonly onChangementUnite?: (unitId: string) => void;
  readonly onCreerNouvelleNote?: () => void;
  readonly onSupprimerPieceJointe?: (index: number) => void;
}

export function FormulaireDepense({
  piecesJointes,
  emailUtilisateur,
  units,
  uniteInitiale = "",
  treasuryVerified,
  onChangementUnite,
  onCreerNouvelleNote,
  onSupprimerPieceJointe,
  estEnLigne = true,
}: FormulaireDepenseProps & { estEnLigne?: boolean }) {
  const [formulaire, setFormulaire] = useState({
    date: new Date().toISOString().split("T")[0],
    branche: uniteInitiale || "",
    typeDepense: "",
    montant: "",
    description: "",
  });
  const [detailsDepenses, setDetailsDepenses] = useState<DetailDepense[]>([]);
  const uniteSelectionnee = units.find(
    (unit) => unit.id === formulaire.branche,
  );

  useEffect(() => {
    if (uniteInitiale !== formulaire.branche) {
      if (!formulaire.branche || uniteInitiale === "") {
        setFormulaire((prev) => ({ ...prev, branche: uniteInitiale }));
      }
    }
  }, [uniteInitiale, formulaire.branche]);

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
    if (champ === "branche") onChangementUnite?.(valeur);
    if (statutEnvoi.type) {
      setStatutEnvoi({ type: null, message: "" });
    }
  };

  const normaliserMontant = (montant: string) => {
    return montant.replace(",", ".");
  };

  const plusieursDepenses = piecesJointes.length > 1;

  useEffect(() => {
    setDetailsDepenses((precedents) =>
      piecesJointes.map(
        (_, index) =>
          precedents[index] ?? { typeDepense: "", montant: Number.NaN },
      ),
    );
  }, [piecesJointes]);

  const modifierDetailDepense = (
    index: number,
    champ: keyof DetailDepense,
    valeur: string,
  ) => {
    setDetailsDepenses((precedents) =>
      precedents.map((detail, detailIndex) =>
        detailIndex === index
          ? {
              ...detail,
              [champ]: champ === "montant" ? Number(valeur) : valeur,
            }
          : detail,
      ),
    );
    if (statutEnvoi.type) setStatutEnvoi({ type: null, message: "" });
  };

  const totalDepenses = detailsDepenses.reduce(
    (total, detail) =>
      total + (Number.isFinite(detail.montant) ? detail.montant : 0),
    0,
  );
  const detailsDepensesValides =
    detailsDepenses.length === piecesJointes.length &&
    detailsDepenses.every(
      (detail) =>
        detail.typeDepense &&
        Number.isFinite(detail.montant) &&
        detail.montant > 0,
    );

  const genererNomsFichiers = () => {
    if (piecesJointes.length === 0) return [];
    if (plusieursDepenses) {
      return piecesJointes.map((pieceJointe, index) => {
        const detail = detailsDepenses[index];
        const [nom] = construireNomsFichiersNormalises([pieceJointe], {
          date: formulaire.date,
          branch: uniteSelectionnee?.label ?? "",
          expenseType: detail?.typeDepense ?? "",
          amount: String(detail?.montant ?? ""),
        });
        const suffixe = ` - ${String(index + 1).padStart(2, "0")}`;
        const point = nom.lastIndexOf(".");
        return point === -1
          ? `${nom}${suffixe}`
          : `${nom.slice(0, point)}${suffixe}${nom.slice(point)}`;
      });
    }
    return construireNomsFichiersNormalises(piecesJointes, {
      date: formulaire.date,
      branch: uniteSelectionnee?.label ?? "",
      expenseType: formulaire.typeDepense,
      amount: normaliserMontant(formulaire.montant),
    });
  };

  const envoyerDepense = async (evenement: React.FormEvent) => {
    evenement.preventDefault();

    if (plusieursDepenses && detailsDepenses.length !== piecesJointes.length) {
      setStatutEnvoi({
        type: "erreur",
        message:
          "Les justificatifs et leurs détails ne sont plus synchronisés. Veuillez actualiser la page avant de réessayer.",
      });
      return;
    }

    if (
      piecesJointes.length === 0 ||
      !formulaire.branche ||
      (plusieursDepenses
        ? !detailsDepensesValides
        : !formulaire.typeDepense || !formulaire.montant)
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
        displayName: pieceJointe.nomAffiche,
        mimeType: pieceJointe.typeMime,
        base64Data: pieceJointe.donneesBase64,
        originalFileName: pieceJointe.nomFichierOriginal,
        normalizedFileName:
          nomsFichiersNormalises[index] ||
          pieceJointe.nomFichierNormalise ||
          pieceJointe.nomFichierOriginal,
      }));

      const reponse = await fetch("/api/send-expense", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userEmail: emailUtilisateur,
          date: formulaire.date,
          unitId: formulaire.branche,
          expenseType: plusieursDepenses ? undefined : formulaire.typeDepense,
          amount: plusieursDepenses
            ? undefined
            : normaliserMontant(formulaire.montant),
          description: formulaire.description,
          attachments: piecesJointesPourApi,
          expenseDetails: plusieursDepenses
            ? detailsDepenses.map((detail) => ({
                expenseType: detail.typeDepense,
                amount: detail.montant,
              }))
            : undefined,
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
        // Réinitialise les champs variables, garde la branche, puis vide les fichiers côté parent.
        setFormulaire((prev) => ({
          date: new Date().toISOString().split("T")[0],
          branche: prev.branche,
          typeDepense: "",
          montant: "",
          description: "",
        }));
        setDetailsDepenses([]);
        onCreerNouvelleNote?.();
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
    (plusieursDepenses
      ? detailsDepensesValides
      : formulaire.typeDepense && formulaire.montant),
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
    setDetailsDepenses([]);
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
              const estImage = pieceJointe.typeMime.startsWith("image/");
              return (
                <div
                  key={`${pieceJointe.nomAffiche}-${index}`}
                  className="flex items-center gap-3 p-3 rounded-lg border border-zinc-200 bg-zinc-50"
                >
                  {estImage ? (
                    <Image
                      src={`data:${pieceJointe.typeMime};base64,${pieceJointe.donneesBase64}`}
                      alt={pieceJointe.nomAffiche}
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
                  <div className="flex-1 min-w-0 space-y-3">
                    <p className="text-sm text-zinc-900 truncate font-medium">
                      {pieceJointe.nomAffiche}
                    </p>
                    <p className="text-xs text-zinc-500">
                      {pieceJointe.typeMime === "application/pdf"
                        ? "PDF"
                        : "Image"}
                    </p>
                    {plusieursDepenses && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <select
                          aria-label={`Catégorie pour ${pieceJointe.nomAffiche}`}
                          value={detailsDepenses[index]?.typeDepense ?? ""}
                          onChange={(e) =>
                            modifierDetailDepense(
                              index,
                              "typeDepense",
                              e.target.value,
                            )
                          }
                          className="p-2 border border-zinc-300 rounded-md bg-white text-sm text-zinc-900"
                          required
                        >
                          <option value="">Catégorie *</option>
                          {TYPES_DEPENSES.map((type) => (
                            <option key={type} value={type}>
                              {type}
                            </option>
                          ))}
                        </select>
                        <input
                          aria-label={`Montant pour ${pieceJointe.nomAffiche}`}
                          type="number"
                          min="0.01"
                          step="0.01"
                          placeholder="Montant (€) *"
                          value={
                            Number.isFinite(detailsDepenses[index]?.montant)
                              ? detailsDepenses[index].montant
                              : ""
                          }
                          onChange={(e) =>
                            modifierDetailDepense(
                              index,
                              "montant",
                              e.target.value,
                            )
                          }
                          className="p-2 border border-zinc-300 rounded-md bg-white text-sm text-zinc-900"
                          required
                        />
                      </div>
                    )}
                  </div>
                  {onSupprimerPieceJointe && (
                    <button
                      type="button"
                      onClick={() => {
                        setDetailsDepenses((precedents) =>
                          precedents.filter(
                            (_, detailIndex) => detailIndex !== index,
                          ),
                        );
                        onSupprimerPieceJointe(index);
                      }}
                      className="p-2 rounded-md text-zinc-500 hover:bg-zinc-200 hover:text-zinc-700 transition-colors"
                      aria-label={`Supprimer ${pieceJointe.nomAffiche}`}
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

      {!plusieursDepenses && (
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
      )}

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
          Unité *
        </label>
        <select
          id="branche"
          value={formulaire.branche}
          onChange={(e) => modifierChamp("branche", e.target.value)}
          className="w-full p-3 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-zinc-400 focus:border-zinc-400 bg-white text-zinc-900"
          required
        >
          <option value="">Sélectionner une unité</option>
          {units.map((unit) => (
            <option key={unit.id} value={unit.id}>
              {unit.label}
            </option>
          ))}
        </select>
        {uniteSelectionnee && (
          <div
            className="mt-2 h-1.5 rounded-full"
            style={{ backgroundColor: uniteSelectionnee.color }}
          />
        )}
      </div>

      {plusieursDepenses && (
        <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-lg flex items-center justify-between">
          <span className="text-sm font-medium text-zinc-700">
            Total des dépenses
          </span>
          <span className="text-lg font-bold text-zinc-900">
            {totalDepenses.toFixed(2)} €
          </span>
        </div>
      )}

      {!plusieursDepenses && (
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
      )}

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
              <br />• Trésorerie : votre groupe
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
              {nomsFichiersApercu.map((nom, index) => (
                <span key={`${nom}-${index}`}>
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
          disabled={
            !formulaireEstValide ||
            envoiEnCours ||
            !estEnLigne ||
            !treasuryVerified
          }
          className={`w-full p-4 rounded-lg font-semibold text-white transition-colors focus:outline-none ${
            formulaireEstValide &&
            !envoiEnCours &&
            estEnLigne &&
            treasuryVerified
              ? "bg-zinc-900 hover:bg-zinc-800 focus:ring-2 focus:ring-zinc-400"
              : "bg-zinc-300 cursor-not-allowed"
          }`}
        >
          {!treasuryVerified ? (
            "Validation de la trésorerie en attente"
          ) : envoiEnCours ? (
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
