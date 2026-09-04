import { NextResponse } from "next/server";

export async function GET() {
  const timestamp = new Date().toISOString();
  const uptimeSeconds =
    typeof process.uptime === "function" ? Math.floor(process.uptime()) : null;

  // Env checks
  const missingEnv: string[] = [];
  if (!process.env.SMTP_HOST) missingEnv.push("SMTP_HOST");
  if (!process.env.SMTP_USER) missingEnv.push("SMTP_USER");
  if (!process.env.SMTP_PASSWORD) missingEnv.push("SMTP_PASSWORD");

  const envOk = missingEnv.length === 0;

  const allOk = envOk;

  const body = {
    ok: allOk,
    timestamp,
    uptimeSeconds,
    env: {
      ok: envOk,
      missing: missingEnv,
    },
  };

  if (allOk) return NextResponse.json(body);
  return NextResponse.json(body, { status: 503 });
}
