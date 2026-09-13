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

type ErreurInvitation = {
  code?: string;
  statut?: number;
};

function extraireErreurInvitation(erreur: unknown): ErreurInvitation {
  if (typeof erreur !== "object" || erreur === null) return {};
  const valeur = erreur as Record<string, unknown>;
  return {
    ...(typeof valeur.code === "string" ? { code: valeur.code } : {}),
    ...(typeof valeur.status === "number" ? { statut: valeur.status } : {}),
  };
}

function avecDelai<T>(promesse: Promise<T>, delaiMs: number) {
  return Promise.race([
    promesse,
    new Promise<never>((_, rejeter) => {
      window.setTimeout(() => rejeter(new Error("DELAI_DEPASSE")), delaiMs);
    }),
  ]);
}

/** Affiche une invitation de groupe et permet d’y répondre. */
export default function PageInvitation({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const routeur = useRouter();
  const {
    data: session,
    isPending,
    refetch: rafraichirSession,
  } = clientAuth.useSession();
  const [invitationId, setInvitationId] = useState<string>();
  const [nomGroupe, setNomGroupe] = useState<string>();
  const [invitationPrete, setInvitationPrete] = useState(false);
  const [message, setMessage] = useState("");
  const [enCours, setEnCours] = useState(false);
  const journaliserEchec = (
    etape: "acceptation" | "activation_groupe" | "groupe_principal",
    erreur: ErreurInvitation,
    dureeMs: number,
  ) => {
    console.error("Échec lors de l’acceptation d’invitation", {
      etape,
      ...erreur,
      dureeMs,
    });
    void fetch("/api/observabilite/echec-invitation", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ etape, ...erreur, dureeMs }),
      keepalive: true,
    }).catch(() => {});
  };
  useEffect(() => {
    let annule = false;
    void searchParams
      .then(({ id }) => {
        let identifiant =
          new URLSearchParams(window.location.search).get("id") || id;
        if (!identifiant) {
          const retour = window.sessionStorage.getItem("invitation-retour");
          if (retour) {
            const urlRetour = new URL(retour, window.location.origin);
            if (
              urlRetour.origin === window.location.origin &&
              urlRetour.pathname === "/invitation"
            )
              identifiant = urlRetour.searchParams.get("id") || undefined;
          }
        }

        if (annule) return;
        setInvitationId(identifiant);
        setInvitationPrete(true);

        if (!identifiant) return;
        void fetch(`/api/invitation?id=${encodeURIComponent(identifiant)}`)
          .then((reponse) => (reponse.ok ? reponse.json() : null))
          .then((invitation: { nomGroupe: string } | null) => {
            if (!annule) setNomGroupe(invitation?.nomGroupe);
          })
          .catch(() => {
            // Le nom du groupe est informatif : l’invitation reste actionnable.
          });
      })
      .catch(() => {
        if (!annule) setInvitationPrete(true);
      });
    return () => {
      annule = true;
    };
  }, [searchParams]);
  useEffect(() => {
    if (isPending || session || enCours || !invitationId || !invitationPrete)
      return;
    const retour = new URLSearchParams({
      callbackURL: `/invitation?id=${invitationId}`,
      invitation: "1",
    });
    window.location.replace(`/sign-in?${retour.toString()}`);
  }, [enCours, invitationId, invitationPrete, isPending, session]);
  const accepter = async () => {
    if (!invitationId || enCours) return;
    setEnCours(true);
    setMessage("");
    const debut = Date.now();
    try {
      const resultat = await avecDelai(
        clientAuth.organization.acceptInvitation({ invitationId }),
        15_000,
      );
      if (resultat.error) {
        const erreur = extraireErreurInvitation(resultat.error);
        journaliserEchec("acceptation", erreur, Date.now() - debut);
        setMessage(
          `${messageErreurInvitation(erreur.code)}${erreur.code ? ` (code : ${erreur.code})` : ""}`,
        );
        setEnCours(false);
        return;
      }
      setMessage("Invitation acceptée. Redirection…");
      window.sessionStorage.removeItem("invitation-retour");
      const identifiantOrganisation = resultat.data?.invitation?.organizationId;
      if (identifiantOrganisation) {
        void fetch("/api/user/default-group", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ organizationId: identifiantOrganisation }),
          keepalive: true,
        })
          .then((reponse) => {
            if (!reponse.ok)
              journaliserEchec(
                "groupe_principal",
                { statut: reponse.status },
                Date.now() - debut,
              );
          })
          .catch((erreur) => {
            journaliserEchec(
              "groupe_principal",
              extraireErreurInvitation(erreur),
              Date.now() - debut,
            );
          });
      }
      try {
        await rafraichirSession?.();
      } catch {
        // La session déjà active reste exploitable si son rafraîchissement échoue.
      }
      routeur.replace("/");
    } catch (erreur) {
      const details = extraireErreurInvitation(erreur);
      const estDelaiDepasse =
        erreur instanceof Error && erreur.message === "DELAI_DEPASSE";
      journaliserEchec(
        "acceptation",
        { ...details, ...(estDelaiDepasse ? { code: "DELAI_DEPASSE" } : {}) },
        Date.now() - debut,
      );
      setMessage(
        estDelaiDepasse
          ? "L’acceptation prend trop de temps. Vérifiez votre connexion puis réessayez. (code : DELAI_DEPASSE)"
          : "Impossible d’accepter cette invitation. Réessayez.",
      );
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
  if (!invitationPrete)
    return (
      <main className="min-h-screen bg-zinc-50 p-6 text-center text-zinc-600">
        Chargement de l’invitation…
      </main>
    );
  if (!invitationId)
    return (
      <main className="min-h-screen bg-zinc-50 p-6 flex items-center justify-center">
        <section className="w-full max-w-md rounded-xl border border-zinc-200 bg-white p-6 text-center">
          <h1 className="text-xl font-semibold text-[#1E3A8A]">
            Invitation introuvable
          </h1>
          <p className="mt-2 text-zinc-600">
            Le lien ne contient pas d’invitation. Retrouvez vos invitations en
            attente sur l’accueil.
          </p>
          <Link href="/" className="mt-4 inline-block text-[#1E3A8A] underline">
            Retour à l’accueil
          </Link>
        </section>
      </main>
    );
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
        <h1 className="text-xl font-semibold text-[#1E3A8A]">
          Invitation Scouticket
        </h1>
        <p className="mt-2 text-zinc-600">
          Vous allez rejoindre {nomGroupe || "ce groupe"}.
        </p>
        <button
          type="button"
          onClick={() => void accepter()}
          disabled={enCours}
          className="mt-5 rounded-lg bg-[#1E3A8A] px-5 py-3 text-white disabled:opacity-50"
        >
          {enCours ? "Acceptation…" : "Accepter l’invitation"}
        </button>
        <button
          type="button"
          onClick={() => void refuser()}
          disabled={enCours}
          className="mt-3 block w-full text-sm text-zinc-600 underline disabled:opacity-50"
        >
          Refuser l’invitation
        </button>
        {message && (
          <p role="alert" className="mt-4 text-zinc-600">
            {message}
          </p>
        )}
      </section>
    </main>
  );
}
