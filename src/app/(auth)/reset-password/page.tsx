import { FormulaireNouveauMotDePasse } from "@/components/FormulairesAuthentification";
import { Suspense } from "react";

export default function PageReinitialisationMotDePasse() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-50 p-4">
      <section className="w-full max-w-lg rounded-lg border border-zinc-200 bg-white shadow-sm">
        <header className="rounded-t-lg border-b border-zinc-200 p-6 text-center text-zinc-900">
          <h1 className="text-2xl font-semibold">Nouveau mot de passe</h1>
          <p className="mt-2 text-zinc-500">
            Choisissez un mot de passe d’au moins 8 caractères.
          </p>
        </header>
        <div className="p-6">
          <div className="mx-auto max-w-sm">
            <Suspense fallback={<p className="text-zinc-600">Chargement…</p>}>
              <FormulaireNouveauMotDePasse />
            </Suspense>
          </div>
        </div>
      </section>
    </main>
  );
}
