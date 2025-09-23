import { NextResponse } from 'next/server'
import { createEmailTransporter } from '@/lib/email'
import { ALL_BRANCHES } from '@/lib/branches'

const SMTP_VERIFY_TIMEOUT_MS = 3000

async function verifySmtpWithTimeout() {
  const transporter = createEmailTransporter()
  const verifyPromise = transporter.verify()

  const timeout = new Promise((_, reject) =>
    setTimeout(() => reject(new Error('SMTP_VERIFY_TIMEOUT')), SMTP_VERIFY_TIMEOUT_MS)
  )

  return Promise.race([verifyPromise, timeout])
}

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

  // SMTP check (only if env OK)
  let smtpOk = false
  let smtpError: string | null = null
  if (envOk) {
    try {
      // verify may throw; use timeout wrapper
      // eslint-disable-next-line no-await-in-loop
      await verifySmtpWithTimeout()
      smtpOk = true
    } catch (err) {
      smtpOk = false
      smtpError = err instanceof Error ? err.message : String(err)
      console.error('Health check: SMTP verify failed:', smtpError)
    }
  } else {
    smtpError = 'Skipping SMTP verify because env variables are missing'
  }

  const allOk = envOk && smtpOk && branchesOk

  const body = {
    ok: allOk,
    timestamp,
    uptimeSeconds,
    env: {
      ok: envOk,
      missing: missingEnv,
    },
    smtp: {
      ok: smtpOk,
      // Too sensitive, might contain secrets
      // error: smtpError,
      timeoutMs: SMTP_VERIFY_TIMEOUT_MS,
    },
    branches: {
      ok: branchesOk,
      count: Array.isArray(ALL_BRANCHES) ? ALL_BRANCHES.length : 0,
    },
  }

  if (allOk) return NextResponse.json(body)
  return NextResponse.json(body, { status: 503 })
}
