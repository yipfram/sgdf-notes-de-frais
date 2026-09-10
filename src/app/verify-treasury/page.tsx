import type { Metadata } from "next";
import {
  jetonTresorerieValide,
  type ValidationTresorerie,
} from "@/lib/treasuryVerification";
import { recupererGroupeActif } from "@/lib/groupServer";
import { pool } from "@/lib/baseDeDonnees";

export const metadata: Metadata = {
  title: "Confirmation de la trésorerie",
  description:
    "Confirmez l’adresse e-mail de trésorerie de votre groupe Scouticket.",
  openGraph: {
    title: "Confirmation de la trésorerie | Scouticket",
    description:
      "Confirmez l’adresse e-mail de trésorerie de votre groupe Scouticket.",
    images: ["/og-scouticket.png"],
  },
  twitter: {
    title: "Confirmation de la trésorerie | Scouticket",
    description:
      "Confirmez l’adresse e-mail de trésorerie de votre groupe Scouticket.",
    images: ["/og-scouticket.png"],
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default async function VerifyTreasuryPage({
  searchParams,
}: {
  searchParams: Promise<{ org?: string; token?: string }>;
}) {
  const { org, token } = await searchParams;
  let valid = false;
  if (org && token) {
    try {
      const groupe = await recupererGroupeActif(org);
      const verification = groupe.validation as ValidationTresorerie;
      if (verification && jetonTresorerieValide(verification, token)) {
        await pool.query(
          `UPDATE scouticket_group_data
             SET treasury_verification = jsonb_build_object(
               'status', 'verified',
               'verifiedAt', EXTRACT(EPOCH FROM CURRENT_TIMESTAMP) * 1000
             )
           WHERE organization_id = $1`,
          [org],
        );
        valid = true;
      }
    } catch {
      valid = false;
    }
  }
  return (
    <main className="min-h-screen bg-zinc-50 p-6 flex items-center justify-center">
      <section className="w-full max-w-md bg-white rounded-xl border border-zinc-200 p-6 text-center">
        <h1 className="text-xl font-semibold text-zinc-900">
          {valid ? "Trésorerie confirmée" : "Lien invalide ou expiré"}
        </h1>
        <p className="mt-3 text-zinc-600">
          {valid
            ? "Cette adresse est maintenant rattachée au groupe. Les membres peuvent envoyer leurs notes de frais."
            : "Demandez au responsable du groupe de renvoyer un nouveau lien de confirmation."}
        </p>
      </section>
    </main>
  );
}
