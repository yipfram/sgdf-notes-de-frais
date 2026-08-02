"use client";

import { UserButton } from "@clerk/nextjs";
import { BanknotesIcon } from "@heroicons/react/24/outline";
import Image from "next/image";

export function VueRemboursement() {
  return (
    <main className="min-h-screen bg-zinc-50 p-4">
      <div className="mx-auto max-w-md overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-sm">
        <div className="border-b border-zinc-200 bg-white p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Image
                  src="/SGDF_symbole_RVB.png"
                  alt="SGDF"
                  width={28}
                  height={20}
                  className="rounded-sm"
                  style={{ height: "auto" }}
                />
                <h1 className="text-2xl font-semibold text-zinc-900">
                  Remboursement
                </h1>
              </div>
              <p className="mt-2 text-zinc-500">La Guillotière</p>
            </div>
            <UserButton
              appearance={{
                elements: {
                  avatarBox: "w-10 h-10",
                },
              }}
            />
          </div>
        </div>

        <div className="p-6">
          <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-700">
            <div className="flex items-start gap-3">
              <BanknotesIcon
                className="mt-0.5 h-5 w-5 flex-none text-zinc-600"
                aria-hidden="true"
              />
              <p>
                Le formulaire de remboursement sera ajouté ici. Utilisez
                l&apos;onglet Carte pour transmettre une facture carte
                procurement.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
