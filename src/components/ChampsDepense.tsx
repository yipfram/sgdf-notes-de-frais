import { TYPES_DEPENSES } from "@/constants/configScoute";

export interface ValeursDepense {
  date: string;
  categorie: string;
  montant: string;
  description: string;
}

interface ChampsDepenseProps {
  readonly valeurs: ValeursDepense;
  readonly onModifier: (champ: keyof ValeursDepense, valeur: string) => void;
  readonly prefixeId: string;
  readonly descriptionObligatoire?: boolean;
  readonly champsInvalides?: Partial<Record<keyof ValeursDepense, boolean>>;
  readonly validationNative?: boolean;
}

export function ChampsDepense({
  valeurs,
  onModifier,
  prefixeId,
  descriptionObligatoire = false,
  champsInvalides = {},
  validationNative = true,
}: ChampsDepenseProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label
          htmlFor={`${prefixeId}-categorie`}
          className="block text-sm font-medium text-zinc-700"
        >
          Type de dépense *
        </label>
        <select
          id={`${prefixeId}-categorie`}
          value={valeurs.categorie}
          onChange={(evenement) =>
            onModifier("categorie", evenement.target.value)
          }
          aria-invalid={champsInvalides.categorie || undefined}
          className={`w-full rounded-lg border bg-white p-3 text-zinc-900 [color-scheme:light] focus:ring-2 ${champsInvalides.categorie ? "border-rose-500 focus:border-rose-500 focus:ring-rose-200" : "border-zinc-300 focus:border-zinc-400 focus:ring-zinc-400"}`}
          required={validationNative}
        >
          <option value="">Sélectionner un type</option>
          {TYPES_DEPENSES.map((categorie) => (
            <option key={categorie} value={categorie}>
              {categorie}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <label
            htmlFor={`${prefixeId}-date`}
            className="block text-sm font-medium text-zinc-700"
          >
            Date *
          </label>
          <input
            id={`${prefixeId}-date`}
            type="date"
            value={valeurs.date}
            onChange={(evenement) => onModifier("date", evenement.target.value)}
            aria-invalid={champsInvalides.date || undefined}
            className={`w-full rounded-lg border bg-white p-3 text-zinc-900 [color-scheme:light] focus:ring-2 ${champsInvalides.date ? "border-rose-500 focus:border-rose-500 focus:ring-rose-200" : "border-zinc-300 focus:border-zinc-400 focus:ring-zinc-400"}`}
            required={validationNative}
          />
        </div>
        <div className="space-y-2">
          <label
            htmlFor={`${prefixeId}-montant`}
            className="block text-sm font-medium text-zinc-700"
          >
            Montant (EUR) *
          </label>
          <input
            id={`${prefixeId}-montant`}
            type="number"
            min="0.01"
            step="0.01"
            placeholder="0.00"
            value={valeurs.montant}
            onChange={(evenement) =>
              onModifier("montant", evenement.target.value)
            }
            aria-invalid={champsInvalides.montant || undefined}
            className={`w-full rounded-lg border bg-white p-3 text-zinc-900 [color-scheme:light] focus:ring-2 ${champsInvalides.montant ? "border-rose-500 focus:border-rose-500 focus:ring-rose-200" : "border-zinc-300 focus:border-zinc-400 focus:ring-zinc-400"}`}
            required={validationNative}
          />
        </div>
      </div>

      <div className="space-y-2">
        <label
          htmlFor={`${prefixeId}-description`}
          className="block text-sm font-medium text-zinc-700"
        >
          Description{descriptionObligatoire ? " *" : " (optionnel)"}
        </label>
        <textarea
          id={`${prefixeId}-description`}
          value={valeurs.description}
          onChange={(evenement) =>
            onModifier("description", evenement.target.value)
          }
          rows={3}
          required={validationNative && descriptionObligatoire}
          aria-invalid={champsInvalides.description || undefined}
          className={`w-full resize-none rounded-lg border bg-white p-3 text-zinc-900 [color-scheme:light] focus:ring-2 ${champsInvalides.description ? "border-rose-500 focus:border-rose-500 focus:ring-rose-200" : "border-zinc-300 focus:border-zinc-400 focus:ring-zinc-400"}`}
        />
      </div>
    </div>
  );
}
