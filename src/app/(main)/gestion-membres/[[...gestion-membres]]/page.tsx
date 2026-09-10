"use client";

import { useState } from "react";
import Link from "next/link";
import { clientAuth } from "@/lib/auth-client";

export default function PageGestionMembres() {
  const { data: organisation } = clientAuth.useActiveOrganization();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const inviter = async () => {
    if (!organisation || !email.trim()) return;
    const resultat = await clientAuth.organization.inviteMember({
      email: email.trim(),
      role: "member",
      organizationId: organisation.id,
    });
    setMessage(
      resultat.error ? "Invitation impossible." : "Invitation envoyée.",
    );
    if (!resultat.error) setEmail("");
  };
  if (!organisation) return <main className="p-6">Aucun groupe actif.</main>;
  return (
    <main className="min-h-screen bg-zinc-50 p-4">
      <section className="mx-auto max-w-lg rounded-xl border border-zinc-200 bg-white p-6">
        <Link href="/" className="text-sm text-[#1E3A8A]">
          ← Retour
        </Link>
        <h1 className="mt-4 text-2xl font-semibold">Membres</h1>
        <p className="mt-2 text-zinc-600">
          Invitez un membre dans {organisation.name}.
        </p>
        <div className="mt-5 flex gap-2">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="adresse@email.fr"
            className="min-w-0 flex-1 rounded-lg border border-zinc-300 p-3"
          />
          <button
            type="button"
            onClick={() => void inviter()}
            className="rounded-lg bg-[#1E3A8A] px-4 text-white"
          >
            Inviter
          </button>
        </div>
        {message && <p className="mt-3 text-sm text-zinc-600">{message}</p>}
      </section>
    </main>
  );
}
