"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { clientAuth } from "@/lib/auth-client";

export default function PageInvitation({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const { data: session } = clientAuth.useSession();
  const [invitationId, setInvitationId] = useState<string>();
  const [message, setMessage] = useState("");
  useEffect(() => {
    void searchParams.then(({ id }) => setInvitationId(id));
  }, [searchParams]);
  const accepter = async () => {
    if (!invitationId) return;
    const resultat = await clientAuth.organization.acceptInvitation({
      invitationId,
    });
    setMessage(
      resultat.error
        ? "Invitation invalide ou expirée."
        : "Invitation acceptée.",
    );
  };
  if (!session)
    return (
      <main className="min-h-screen bg-zinc-50 p-6 text-center">
        <p>Connectez-vous avec l’adresse invitée avant de continuer.</p>
        <Link
          href="/sign-in"
          className="mt-4 inline-block text-[#1E3A8A] underline"
        >
          Connexion
        </Link>
      </main>
    );
  return (
    <main className="min-h-screen bg-zinc-50 p-6 flex items-center justify-center">
      <section className="w-full max-w-md rounded-xl border border-zinc-200 bg-white p-6 text-center">
        <h1 className="text-xl font-semibold">Invitation Scouticket</h1>
        <button
          type="button"
          onClick={() => void accepter()}
          disabled={!invitationId}
          className="mt-5 rounded-lg bg-[#1E3A8A] px-5 py-3 text-white disabled:opacity-50"
        >
          Accepter l’invitation
        </button>
        {message && <p className="mt-4 text-zinc-600">{message}</p>}
      </section>
    </main>
  );
}
