"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { clientAuth } from "@/lib/auth-client";

type Invitation = { id: string; email: string };

export default function PageGestionMembres() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [autorise, setAutorise] = useState<boolean>();
  const [organisation, setOrganisation] = useState<{
    id: string;
    name: string;
  }>();
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const chargementLance = useRef(false);
  useEffect(() => {
    if (chargementLance.current) return;
    chargementLance.current = true;
    void fetch("/api/group/members")
      .then(async (reponse) => ({ reponse, corps: await reponse.json() }))
      .then(({ reponse, corps }) => {
        setAutorise(reponse.ok);
        if (!reponse.ok) return;
        setOrganisation(corps.organisation);
        setInvitations(corps.invitations);
      })
      .catch(() => setAutorise(false));
  }, []);
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
      setInvitations((precedentes) => [
        ...((resultats
          .map((resultat) => resultat.data)
          .filter(Boolean) as Invitation[]) ?? []),
        ...precedentes,
      ]);
      return;
    }
    setMessage(
      nombreSucces > 0
        ? `${nombreSucces} invitation${nombreSucces > 1 ? "s" : ""} envoyée${nombreSucces > 1 ? "s" : ""}, ${nombreEchecs} impossible${nombreEchecs > 1 ? "s" : ""}.`
        : "Invitations impossibles.",
    );
  };
  const annulerInvitation = async (invitationId: string) => {
    const resultat = await clientAuth.organization.cancelInvitation({
      invitationId,
    });
    setMessage(
      resultat.error
        ? "Impossible d’annuler cette invitation."
        : "Invitation annulée.",
    );
    if (!resultat.error)
      setInvitations((precedentes) =>
        precedentes.filter((invitation) => invitation.id !== invitationId),
      );
  };
  if (autorise === false)
    return (
      <main className="min-h-screen bg-zinc-50 p-6 text-center text-zinc-700">
        Vous n’avez pas accès à la gestion des membres.{" "}
        <Link href="/" className="text-[#1E3A8A] underline">
          Retour
        </Link>
      </main>
    );
  if (autorise === undefined || !organisation)
    return (
      <main className="min-h-screen bg-zinc-50 p-6 text-center text-zinc-600">
        Chargement…
      </main>
    );
  return (
    <main className="min-h-screen bg-zinc-50 p-4">
      <section className="mx-auto max-w-lg rounded-xl border border-zinc-200 bg-white p-6">
        <Link href="/" className="text-sm text-[#1E3A8A]">
          ← Retour
        </Link>
        <h1 className="mt-4 text-2xl font-semibold text-zinc-900">Membres</h1>
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
        <h2 className="mt-8 text-lg font-semibold text-zinc-900">
          Invitations en attente
        </h2>
        {invitations.length === 0 ? (
          <p className="mt-2 text-sm text-zinc-600">
            Aucune invitation en attente.
          </p>
        ) : (
          <ul className="mt-3 space-y-2">
            {invitations.map((invitation) => (
              <li
                key={invitation.id}
                className="flex items-center justify-between gap-3 rounded-lg border border-zinc-200 p-3 text-sm"
              >
                <span className="min-w-0 truncate text-zinc-700">
                  {invitation.email}
                </span>
                <button
                  type="button"
                  onClick={() => void annulerInvitation(invitation.id)}
                  className="shrink-0 text-[#1E3A8A] underline"
                >
                  Annuler
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
