import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Maintenance en cours",
  description: "Scouticket est momentanément indisponible pour maintenance.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function PageMaintenance() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-50 p-6 text-center">
      <section className="w-full max-w-md rounded-xl border border-zinc-200 bg-white p-6 text-zinc-800 shadow-sm">
        <h1 className="text-2xl font-semibold text-zinc-900">
          Maintenance en cours
        </h1>
        <p className="mt-3 text-zinc-600">
          Scouticket est momentanément indisponible. Revenez dans quelques
          instants.
        </p>
      </section>
    </main>
  );
}
