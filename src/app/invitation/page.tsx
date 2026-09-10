"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { clientAuth } from "@/lib/auth-client";

function messageErreurInvitation(code: string | undefined) {
  if (code === "YOU_ARE_NOT_THE_RECIPIENT_OF_THE_INVITATION")
    return "Cette invitation est réservée à une autre adresse e-mail. Connectez-vous avec l’adresse invitée.";
  if (
    code ===
    "EMAIL_VERIFICATION_REQUIRED_BEFORE_ACCEPTING_OR_REJECTING_INVITATION"
  )
    return "Confirmez d’abord votre adresse e-mail avant d’accepter cette invitation.";
  if (code === "ORGANIZATION_MEMBERSHIP_LIMIT_REACHED")
    return "Ce groupe a atteint son nombre maximal de membres.";
  return "Invitation invalide ou expirée.";
}

export default function PageInvitation({
  searchParams,
}: {
  searchParams: Promise<{ id?: string; groupe?: string }>;
}) {
  const routeur = useRouter();
  const { data: session, isPending } = clientAuth.useSession();
  const [invitationId, setInvitationId] = useState<string>();
  const [nomGroupe, setNomGroupe] = useState<string>();
  const [invitationPrete, setInvitationPrete] = useState(false);
  const [message, setMessage] = useState("");
  const [enCours, setEnCours] = useState(false);
  useEffect(() => {
    void searchParams.then(async ({ id, groupe }) => {
      let identifiant = id;
      let nom = groupe;
      if (!identifiant) {
        const retour = window.sessionStorage.getItem("invitation-retour");
        if (retour) {
          const urlRetour = new URL(retour, window.location.origin);
          identifiant = urlRetour.searchParams.get("id") || undefined;
          nom = urlRetour.searchParams.get("groupe") || undefined;
        }
      }
      if (identifiant && !nom) {
        const reponse = await fetch(
          `/api/invitation?id=${encodeURIComponent(identifiant)}`,
        );
        if (reponse.ok)
          nom = ((await reponse.json()) as { nomGroupe: string }).nomGroupe;
      }
      setInvitationId(identifiant);
      setNomGroupe(nom);
      setInvitationPrete(true);
    });
  }, [searchParams]);
  useEffect(() => {
    if (isPending || session || !invitationId || !invitationPrete) return;
    const retour = new URLSearchParams({
      callbackURL: `/invitation?id=${invitationId}${nomGroupe ? `&groupe=${nomGroupe}` : ""}`,
      invitation: "1",
    });
    if (nomGroupe) retour.set("groupe", nomGroupe);
    window.location.replace(`/sign-in?${retour.toString()}`);
  }, [invitationId, invitationPrete, isPending, nomGroupe, session]);
  const accepter = async () => {
    if (!invitationId || enCours) return;
    setEnCours(true);
    setMessage("");
    try {
      const resultat = await clientAuth.organization.acceptInvitation({
        invitationId,
      });
      if (resultat.error) {
        setMessage(messageErreurInvitation(resultat.error.code));
        setEnCours(false);
        return;
      }
      setMessage("Invitation acceptée. Redirection…");
      window.sessionStorage.removeItem("invitation-retour");
      routeur.replace("/");
    } catch {
      setMessage("Impossible d’accepter cette invitation. Réessayez.");
      setEnCours(false);
    }
  };
  const refuser = async () => {
    if (!invitationId) return;
    const resultat = await clientAuth.organization.rejectInvitation({
      invitationId,
    });
    setMessage(
      resultat.error
        ? "Impossible de refuser cette invitation."
        : "Invitation refusée.",
    );
    if (!resultat.error) window.sessionStorage.removeItem("invitation-retour");
  };
  if (!session)
    return (
      <main className="min-h-screen bg-zinc-50 p-6 text-center">
        <p>Redirection vers la connexion…</p>
        <Link
          href="/sign-in"
          className="mt-4 inline-block text-[#1E3A8A] underline"
        >
          Accéder à la connexion
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
          disabled={!invitationId || enCours}
          className="mt-5 rounded-lg bg-[#1E3A8A] px-5 py-3 text-white disabled:opacity-50"
        >
          {enCours ? "Acceptation…" : "Accepter l’invitation"}
        </button>
        <button
          type="button"
          onClick={() => void refuser()}
          disabled={!invitationId || enCours}
          className="mt-3 block w-full text-sm text-zinc-600 underline disabled:opacity-50"
        >
          Refuser l’invitation
        </button>
        {message && <p className="mt-4 text-zinc-600">{message}</p>}
      </section>
    </main>
  );
}
