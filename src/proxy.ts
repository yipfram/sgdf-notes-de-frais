import { NextResponse, type NextRequest } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

export default function proxy(requete: NextRequest) {
  const chemin = requete.nextUrl.pathname;

  if (process.env.MAINTENANCE_MODE === "true") {
    if (chemin === "/maintenance") return NextResponse.next();
    if (chemin === "/api/health") {
      return NextResponse.json(
        { ok: false, status: "maintenance" },
        { status: 503 },
      );
    }
    if (chemin.startsWith("/api/")) {
      return NextResponse.json(
        { erreur: "Service en maintenance", status: "maintenance" },
        { status: 503 },
      );
    }
    return NextResponse.redirect(new URL("/maintenance", requete.url));
  }

  const estConnecte = Boolean(getSessionCookie(requete));
  if (chemin === "/invitation" && !estConnecte) {
    const urlConnexion = new URL("/sign-in", requete.url);
    urlConnexion.searchParams.set(
      "callbackURL",
      `${chemin}${requete.nextUrl.search}`,
    );
    urlConnexion.searchParams.set("invitation", "1");
    const nomGroupe = requete.nextUrl.searchParams.get("groupe");
    if (nomGroupe) urlConnexion.searchParams.set("groupe", nomGroupe);
    return NextResponse.redirect(urlConnexion);
  }
  const estRoutePublique =
    chemin.startsWith("/api/auth") ||
    chemin === "/api/health" ||
    chemin === "/sign-in" ||
    chemin === "/forgot-password" ||
    chemin === "/reset-password" ||
    chemin === "/verify-treasury" ||
    chemin === "/offline" ||
    chemin === "/invitation";
  if (estRoutePublique || estConnecte) return NextResponse.next();
  if (chemin.startsWith("/api/"))
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  return NextResponse.redirect(new URL("/sign-in", requete.url));
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
