import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export default clerkMiddleware((_auth, requete) => {
  if (process.env.MAINTENANCE_MODE !== "true") return;

  const { pathname } = requete.nextUrl;

  if (pathname === "/maintenance") return;

  if (pathname === "/api/health") {
    return NextResponse.json(
      { ok: false, status: "maintenance" },
      { status: 503 },
    );
  }

  if (pathname.startsWith("/api/")) {
    return NextResponse.json(
      { erreur: "Service en maintenance", status: "maintenance" },
      { status: 503 },
    );
  }

  return NextResponse.redirect(new URL("/maintenance", requete.url));
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
