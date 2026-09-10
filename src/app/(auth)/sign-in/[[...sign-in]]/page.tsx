import ClerkSignInClient from "@/components/ClerkSignInClient";
import type { Metadata } from "next";

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

export default function Page() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-zinc-50">
      <div className="bg-white rounded-lg border border-zinc-200 shadow-sm w-full max-w-lg mx-auto">
        <div className="bg-white text-zinc-900 p-6 text-center border-b border-zinc-200 rounded-t-lg">
          <h1 className="text-2xl font-semibold">Scouticket</h1>
          <p className="text-zinc-500 mt-2">Connexion</p>
        </div>
        <div className="py-6 flex justify-center items-center">
          <div className="max-w-sm mx-auto">
            <ClerkSignInClient />
          </div>
        </div>
      </div>
    </div>
  );
}
