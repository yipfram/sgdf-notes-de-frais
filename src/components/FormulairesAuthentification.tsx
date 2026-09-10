"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { type FormEvent, useEffect, useRef, useState } from "react";
import { clientAuth } from "@/lib/auth-client";

function MessageErreur({ message }: { readonly message: string }) {
  return message ? (
    <p className="text-sm text-rose-700" role="alert">
      {message}
    </p>
  ) : null;
}

const classeChamp =
  "mt-2 w-full rounded-lg border border-zinc-300 bg-white p-3 text-zinc-900 outline-none focus:border-[#1E3A8A] focus:ring-2 focus:ring-[#1E3A8A]/20";

export function FormulaireConnexionEmail() {
  const recherche = useSearchParams();
  const retour = recherche?.get("callbackURL");
  const callbackURL = retour?.startsWith("/") ? retour : "/";
  const nomGroupeInvite = recherche?.get("invitation")
    ? recherche.get("groupe")
    : null;
  const [email, setEmail] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
  const [erreur, setErreur] = useState("");
  const [message, setMessage] = useState("");
  const [enCours, setEnCours] = useState(false);
  const referenceFormulaire = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (callbackURL.startsWith("/invitation?id=")) {
      window.sessionStorage.setItem("invitation-retour", callbackURL);
    }
  }, [callbackURL]);

  const connecter = async (event: FormEvent) => {
    event.preventDefault();
    setEnCours(true);
    setErreur("");
    setMessage("");
    const resultat = await clientAuth.signIn.email({
      email,
      password: motDePasse,
      rememberMe: true,
      callbackURL,
    });
    setEnCours(false);
    if (resultat.error) {
      setErreur(
        resultat.error.status === 403
          ? "Confirmez votre adresse e-mail avant de vous connecter."
          : "Adresse e-mail ou mot de passe incorrect.",
      );
      return;
    }
    window.location.assign(callbackURL);
  };

  const inscrire = async () => {
    if (!referenceFormulaire.current?.reportValidity()) return;
    setEnCours(true);
    setErreur("");
    setMessage("");
    const resultat = await clientAuth.signUp.email({
      name: email,
      email,
      password: motDePasse,
      callbackURL,
    });
    setEnCours(false);
    if (resultat.error) {
      setErreur(
        resultat.error.message ||
          "Impossible de créer le compte. Vérifiez l’adresse e-mail et le mot de passe.",
      );
      return;
    }
    setEmail("");
    setMotDePasse("");
    setMessage(
      "Si cette adresse peut être utilisée, vous recevrez un lien de confirmation dans quelques instants.",
    );
  };

  return (
    <form ref={referenceFormulaire} onSubmit={connecter} className="space-y-4">
      {nomGroupeInvite && (
        <p
          className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-950"
          role="status"
        >
          Vous avez été invité à rejoindre le groupe {nomGroupeInvite}.
        </p>
      )}
      <div>
        <label htmlFor="email" className="text-sm font-medium text-zinc-700">
          Adresse e-mail
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className={classeChamp}
        />
      </div>
      <div>
        <label
          htmlFor="mot-de-passe"
          className="text-sm font-medium text-zinc-700"
        >
          Mot de passe
        </label>
        <input
          id="mot-de-passe"
          type="password"
          autoComplete="current-password"
          minLength={8}
          required
          value={motDePasse}
          onChange={(event) => setMotDePasse(event.target.value)}
          className={classeChamp}
        />
      </div>
      <div className="text-right">
        <Link
          href="/forgot-password"
          className="text-sm font-medium text-[#1E3A8A] underline"
        >
          Mot de passe oublié ?
        </Link>
      </div>
      <MessageErreur message={erreur} />
      {message && (
        <div
          className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900"
          role="status"
        >
          <p className="font-medium">Vérifiez votre boîte e-mail</p>
          <p className="mt-1 text-emerald-800">{message}</p>
        </div>
      )}
      <div className="grid grid-cols-2 gap-2">
        <button
          disabled={enCours}
          className="cursor-pointer rounded-lg bg-[#1E3A8A] px-5 py-3 font-medium text-white transition-colors hover:bg-[#162d69] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {enCours ? "Connexion…" : "Se connecter"}
        </button>
        <button
          type="button"
          disabled={enCours}
          onClick={() => void inscrire()}
          className="cursor-pointer rounded-lg border border-[#1E3A8A] px-5 py-3 font-medium text-[#1E3A8A] transition-colors hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          S’inscrire
        </button>
      </div>
    </form>
  );
}

export function FormulaireMotDePasseOublie() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [enCours, setEnCours] = useState(false);
  const envoyer = async (event: FormEvent) => {
    event.preventDefault();
    setEnCours(true);
    await clientAuth.requestPasswordReset({
      email,
      redirectTo: "/reset-password",
    });
    setEnCours(false);
    setMessage(
      "Si un compte correspond à cette adresse, un e-mail de réinitialisation vient d’être envoyé.",
    );
  };
  return (
    <form onSubmit={envoyer} className="space-y-4">
      <div>
        <label htmlFor="email" className="text-sm font-medium text-zinc-700">
          Adresse e-mail
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className={classeChamp}
        />
      </div>
      {message && (
        <p className="text-sm text-emerald-700" role="status">
          {message}
        </p>
      )}
      <button
        disabled={enCours}
        className="w-full rounded-lg bg-[#1E3A8A] px-5 py-3 font-medium text-white disabled:opacity-60"
      >
        {enCours ? "Envoi…" : "Envoyer le lien"}
      </button>
    </form>
  );
}

export function FormulaireNouveauMotDePasse() {
  const recherche = useSearchParams();
  const token = recherche.get("token");
  const [motDePasse, setMotDePasse] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [erreur, setErreur] = useState(
    token ? "" : "Ce lien est invalide ou expiré.",
  );
  const [enCours, setEnCours] = useState(false);
  const modifier = async (event: FormEvent) => {
    event.preventDefault();
    if (!token || motDePasse !== confirmation) {
      setErreur("Les mots de passe ne correspondent pas.");
      return;
    }
    setEnCours(true);
    const resultat = await clientAuth.resetPassword({
      newPassword: motDePasse,
      token,
    });
    setEnCours(false);
    if (resultat.error) return setErreur("Ce lien est invalide ou expiré.");
    window.location.assign("/sign-in");
  };
  return (
    <form onSubmit={modifier} className="space-y-4">
      <div>
        <label
          htmlFor="mot-de-passe"
          className="text-sm font-medium text-zinc-700"
        >
          Nouveau mot de passe
        </label>
        <input
          id="mot-de-passe"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
          value={motDePasse}
          onChange={(event) => setMotDePasse(event.target.value)}
          className={classeChamp}
        />
      </div>
      <div>
        <label
          htmlFor="confirmation"
          className="text-sm font-medium text-zinc-700"
        >
          Confirmer le mot de passe
        </label>
        <input
          id="confirmation"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
          value={confirmation}
          onChange={(event) => setConfirmation(event.target.value)}
          className={classeChamp}
        />
      </div>
      <MessageErreur message={erreur} />
      <button
        disabled={!token || enCours}
        className="w-full rounded-lg bg-[#1E3A8A] px-5 py-3 font-medium text-white disabled:opacity-60"
      >
        {enCours ? "Enregistrement…" : "Enregistrer le mot de passe"}
      </button>
    </form>
  );
}
