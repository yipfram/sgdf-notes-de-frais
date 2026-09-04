import { clerkClient } from "@clerk/nextjs/server";
import {
  jetonTresorerieValide,
  type ValidationTresorerie,
} from "@/lib/treasuryVerification";

export default async function VerifyTreasuryPage({
  searchParams,
}: {
  searchParams: Promise<{ org?: string; token?: string }>;
}) {
  const { org, token } = await searchParams;
  let valid = false;
  if (org && token) {
    try {
      const client = await clerkClient();
      const organization = await client.organizations.getOrganization({
        organizationId: org,
      });
      const privateMetadata = (organization.privateMetadata ?? {}) as Record<
        string,
        unknown
      >;
      const verification =
        privateMetadata.treasuryVerification as ValidationTresorerie;
      if (verification && jetonTresorerieValide(verification, token)) {
        await client.organizations.updateOrganizationMetadata(org, {
          privateMetadata: {
            treasuryVerification: {
              status: "verified",
            },
          },
        });
        valid = true;
      }
    } catch {
      valid = false;
    }
  }
  return (
    <main className="min-h-screen bg-zinc-50 p-6 flex items-center justify-center">
      <section className="w-full max-w-md bg-white rounded-xl border border-zinc-200 p-6 text-center">
        <h1 className="text-xl font-semibold text-zinc-900">
          {valid ? "Trésorerie confirmée" : "Lien invalide ou expiré"}
        </h1>
        <p className="mt-3 text-zinc-600">
          {valid
            ? "Cette adresse est maintenant rattachée au groupe. Les membres peuvent envoyer leurs notes de frais."
            : "Demandez au responsable du groupe de renvoyer un nouveau lien de confirmation."}
        </p>
      </section>
    </main>
  );
}
