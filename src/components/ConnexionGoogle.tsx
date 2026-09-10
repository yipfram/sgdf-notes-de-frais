"use client";

import { clientAuth } from "@/lib/auth-client";

export function ConnexionGoogle() {
  return (
    <button
      type="button"
      onClick={() =>
        void clientAuth.signIn.social({ provider: "google", callbackURL: "/" })
      }
      className="flex w-full items-center justify-center gap-3 rounded-lg border border-zinc-300 bg-white px-5 py-3 font-medium text-zinc-800 transition-colors hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] focus:ring-offset-2"
    >
      <svg
        aria-hidden="true"
        className="h-5 w-5"
        viewBox="0 0 48 48"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          fill="#FFC107"
          d="M43.6 20.5H42V20H24v8h11.3C33.6 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.2 6.2 29.4 4 24 4 13 4 4 13 4 24s9 20 20 20 20-9 20-20c0-1.2-.1-2.3-.4-3.5Z"
        />
        <path
          fill="#FF3D00"
          d="M6.3 14.7 12.9 19.5C14.7 15.1 19 12 24 12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.2 6.2 29.4 4 24 4c-7.7 0-14.4 4.4-17.7 10.7Z"
        />
        <path
          fill="#4CAF50"
          d="M24 44c5.3 0 10.1-2 13.6-5.2l-6.3-5.3C29.3 35.1 26.8 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.5 16.2 44 24 44Z"
        />
        <path
          fill="#1976D2"
          d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4-4 5.4l.1-.1 6.3 5.3C37.3 38.9 44 34 44 24c0-1.2-.1-2.3-.4-3.5Z"
        />
      </svg>
      Continuer avec Google
    </button>
  );
}
