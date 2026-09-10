"use client";

import { useState } from "react";
import Link from "next/link";
import { clientAuth } from "@/lib/auth-client";

export default function PageGestionMembres() {
  const { data: organisation } = clientAuth.useActiveOrganization();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const inviter = async () => {
    const emails = email
      .split(",")
      .map((adresse) => adresse.trim())
      .filter(Boolean);
    if (!organisation || emails.length === 0) return;

    const resultats = await Promise.all(
      emails.map((adresse) =>
        clientAuth.organization.inviteMember({
          email: adresse,
          role: "member",
          organizationId: organisation.id,
        }),
      ),
    );
    const nombreEchecs = resultats.filter((resultat) => resultat.error).length;
    const nombreSucces = emails.length - nombreEchecs;
    if (nombreEchecs === 0) {
      setMessage(
        emails.length === 1 ? "Invitation envoyée." : "Invitations envoyées.",
      );
      setEmail("");
      return;
    }
    setMessage(
      nombreSucces > 0
        ? `${nombreSucces} invitation${nombreSucces > 1 ? "s" : ""} envoyée${nombreSucces > 1 ? "s" : ""}, ${nombreEchecs} impossible${nombreEchecs > 1 ? "s" : ""}.`
        : "Invitations impossibles.",
    );
  };
  if (!organisation) return <main className="p-6">Aucun groupe actif.</main>;
  return (
    <main className="min-h-screen bg-zinc-50 p-4">
      <section className="mx-auto max-w-lg rounded-xl border border-zinc-200 bg-white p-6">
        <Link href="/" className="text-sm text-[#1E3A8A]">
          ← Retour
        </Link>
        <h1 className="mt-4 text-2xl font-semibold text-zinc-900">
          Membres
        </h1>
        <p className="mt-2 text-zinc-600">
          Invitez un membre dans {organisation.name}.
        </p>
        <div className="mt-5 flex gap-2">
          <input
            type="email"
            multiple
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="adresse@email.fr, autre@email.fr"
            aria-label="Adresses e-mail des membres à inviter"
            className="min-w-0 flex-1 rounded-lg border border-zinc-300 bg-white p-3 text-zinc-900 placeholder:text-zinc-400 outline-none focus:border-[#1E3A8A] focus:ring-2 focus:ring-[#1E3A8A]/20"
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
