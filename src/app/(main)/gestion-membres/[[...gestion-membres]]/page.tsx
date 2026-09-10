import { OrganizationProfile } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function PageGestionMembres() {
  const { orgId, orgRole } = await auth();
  if (!orgId || orgRole !== "org:admin") redirect("/");

  return (
    <main className="min-h-screen bg-zinc-50 p-4">
      <div className="mx-auto w-full max-w-3xl">
        <OrganizationProfile path="/gestion-membres" routing="path" />
      </div>
    </main>
  );
}
