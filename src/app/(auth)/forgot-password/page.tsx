import { FormulaireMotDePasseOublie } from "@/components/FormulairesAuthentification";
import Link from "next/link";

export default function PageMotDePasseOublie() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-50 p-4">
      <section className="w-full max-w-lg rounded-lg border border-zinc-200 bg-white shadow-sm">
        <header className="rounded-t-lg border-b border-zinc-200 p-6 text-center text-zinc-900">
          <h1 className="text-2xl font-semibold">Mot de passe oublié</h1>
          <p className="mt-2 text-zinc-500">
            Nous vous enverrons un lien sécurisé.
          </p>
        </header>
        <div className="p-6">
          <div className="mx-auto max-w-sm space-y-5">
            <FormulaireMotDePasseOublie />
            <p className="text-center text-sm text-zinc-600">
              <Link
                href="/sign-in"
                className="font-medium text-[#1E3A8A] underline"
              >
                Retour à la connexion
              </Link>
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
