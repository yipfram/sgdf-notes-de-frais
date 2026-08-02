import Image from "next/image";
import { DocumentTextIcon, TrashIcon } from "@heroicons/react/24/outline";
import { type ExpenseAttachment } from "@/constants/piecesJointes";

interface ListePiecesJointesProps {
  readonly piecesJointes: ExpenseAttachment[];
  readonly onSupprimer?: (index: number) => void;
}

export function ListePiecesJointes({
  piecesJointes,
  onSupprimer,
}: ListePiecesJointesProps) {
  if (piecesJointes.length === 0) return null;

  return (
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
              className="flex items-center gap-3 rounded-lg border border-zinc-200 bg-zinc-50 p-3"
            >
              {estImage ? (
                <Image
                  src={`data:${pieceJointe.mimeType};base64,${pieceJointe.base64Data}`}
                  alt={pieceJointe.displayName}
                  width={56}
                  height={56}
                  className="h-14 w-14 rounded-md border border-zinc-200 object-cover"
                />
              ) : (
                <div className="flex h-14 w-14 items-center justify-center rounded-md border border-zinc-200 bg-white">
                  <DocumentTextIcon className="h-8 w-8 text-zinc-500" />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-zinc-900">
                  {pieceJointe.displayName}
                </p>
                <p className="text-xs text-zinc-500">
                  {pieceJointe.mimeType === "application/pdf" ? "PDF" : "Image"}
                </p>
              </div>
              {onSupprimer && (
                <button
                  type="button"
                  onClick={() => onSupprimer(index)}
                  className="rounded-md p-2 text-zinc-500 transition-colors hover:bg-zinc-200 hover:text-zinc-700"
                  aria-label={`Supprimer ${pieceJointe.displayName}`}
                >
                  <TrashIcon className="h-5 w-5" />
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
