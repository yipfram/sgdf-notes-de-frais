import { auth, clerkClient } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
  const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const body = await req.json().catch(() => null)
    if (!body || typeof body.branch !== 'string') {
      return NextResponse.json({ error: 'Branche manquante' }, { status: 400 })
    }

    const branch = body.branch.trim()
    const ALLOWED = [
      'Louveteaux',
      'Jeannettes',
      'Scouts',
      'Guides',
      'Pionniers-Caravelles',
      'Compagnons',
      'Farfadets',
      'Groupe'
    ]

    if (!ALLOWED.includes(branch)) {
      return NextResponse.json({ error: 'Valeur de branche invalide' }, { status: 400 })
    }

    // Update public metadata
  const ck = await clerkClient()
  await ck.users.updateUser(userId, { publicMetadata: { branch } })

    return NextResponse.json({ success: true, branch })
  } catch (err) {
    console.error('Erreur API update-branch', err)
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 })
  }
}
