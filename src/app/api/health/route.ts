import { NextResponse } from "next/server";
import { SGDF_BRANCHES } from "@/constants/configScoute";

export async function GET() {
  const timestamp = new Date().toISOString();
  const uptimeSeconds =
    typeof process.uptime === "function" ? Math.floor(process.uptime()) : null;

  // Env checks
  const missingEnv: string[] = [];
  if (!process.env.SMTP_HOST) missingEnv.push("SMTP_HOST");
  if (!process.env.SMTP_USER) missingEnv.push("SMTP_USER");
  if (!process.env.SMTP_PASSWORD) missingEnv.push("SMTP_PASSWORD");
  if (!process.env.NEXT_PUBLIC_TREASURY_EMAIL)
    missingEnv.push("NEXT_PUBLIC_TREASURY_EMAIL");

  const envOk = missingEnv.length === 0;

  // Branches check
  const branchesOk = Array.isArray(SGDF_BRANCHES) && SGDF_BRANCHES.length > 0;

  // Overall health: env vars present + branches configured
  const allOk = envOk && branchesOk;

  const body = {
    ok: allOk,
    timestamp,
    uptimeSeconds,
    env: {
      ok: envOk,
      missing: missingEnv,
    },
    branches: {
      ok: branchesOk,
      count: Array.isArray(SGDF_BRANCHES) ? SGDF_BRANCHES.length : 0,
    },
  };

  if (allOk) return NextResponse.json(body);
  return NextResponse.json(body, { status: 503 });
}
