"use client";

import { clientAuth } from "@/lib/auth-client";

export function ConnexionGoogle() {
  return (
    <button
      type="button"
      onClick={() =>
        void clientAuth.signIn.social({ provider: "google", callbackURL: "/" })
      }
      className="w-full rounded-lg bg-[#1E3A8A] px-5 py-3 font-medium text-white transition-colors hover:bg-[#162d69]"
    >
      Continuer avec Google
    </button>
  );
}
