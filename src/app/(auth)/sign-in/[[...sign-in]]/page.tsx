import { ConnexionGoogle } from "@/components/ConnexionGoogle";
import { FormulaireConnexionEmail } from "@/components/FormulairesAuthentification";
import type { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Connexion",
  description:
    "Connectez-vous à Scouticket pour envoyer vos justificatifs à la trésorerie de votre groupe.",
  openGraph: {
    title: "Connexion | Scouticket",
    description:
      "Connectez-vous à Scouticket pour envoyer vos justificatifs à la trésorerie de votre groupe.",
    images: ["/og-scouticket.png"],
  },
  twitter: {
    title: "Connexion | Scouticket",
    description:
      "Connectez-vous à Scouticket pour envoyer vos justificatifs à la trésorerie de votre groupe.",
    images: ["/og-scouticket.png"],
  },
  robots: {
    index: false,
    follow: false,
  },
};

function ContenuConnexion() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-zinc-50">
      <div className="bg-white rounded-lg border border-zinc-200 shadow-sm w-full max-w-lg mx-auto">
        <div className="bg-white text-zinc-900 p-6 text-center border-b border-zinc-200 rounded-t-lg">
          <h1 className="text-2xl font-semibold">Scouticket</h1>
          <p className="text-zinc-500 mt-2">Connexion</p>
        </div>
        <div className="p-6">
          <div className="mx-auto max-w-sm space-y-5">
            <FormulaireConnexionEmail />
            <div className="flex items-center gap-3 text-xs text-zinc-500">
              <span className="h-px flex-1 bg-zinc-200" />
              ou
              <span className="h-px flex-1 bg-zinc-200" />
            </div>
            <ConnexionGoogle />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense>
      <ContenuConnexion />
    </Suspense>
  );
}
