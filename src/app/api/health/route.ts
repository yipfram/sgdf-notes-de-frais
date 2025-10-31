import { NextResponse } from 'next/server'
import { ALL_BRANCHES } from '@/lib/branches'

export async function GET() {
  const timestamp = new Date().toISOString()
  const uptimeSeconds = typeof process.uptime === 'function' ? Math.floor(process.uptime()) : null

  // Env checks
  const missingEnv: string[] = []
  if (!process.env.GMAIL_USER) missingEnv.push('GMAIL_USER')
  if (!process.env.GMAIL_APP_PASSWORD) missingEnv.push('GMAIL_APP_PASSWORD')
  if (!process.env.TREASURY_EMAIL) missingEnv.push('TREASURY_EMAIL')

  const envOk = missingEnv.length === 0

  // Branches check
  const branchesOk = Array.isArray(ALL_BRANCHES) && ALL_BRANCHES.length > 0

  // Overall health: env vars present + branches configured
  const allOk = envOk && branchesOk

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
      count: Array.isArray(ALL_BRANCHES) ? ALL_BRANCHES.length : 0,
    },
  }

  if (allOk) return NextResponse.json(body)
  return NextResponse.json(body, { status: 503 })
}
