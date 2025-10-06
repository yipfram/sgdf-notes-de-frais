import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { db, userBranchRoles, userSessions } from '@/lib/db'
import { eq, and } from 'drizzle-orm'

export async function POST(req: Request) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const body = await req.json().catch(() => null)
    if (!body || !body.branchId) {
      return NextResponse.json({ error: 'ID de branche manquant' }, { status: 400 })
    }

    const { branchId } = body

    // Vérifier que l'utilisateur a accès à cette branche
    const userBranchRole = await db
      .select({ role: userBranchRoles.role })
      .from(userBranchRoles)
      .where(and(
        eq(userBranchRoles.userId, userId),
        eq(userBranchRoles.branchId, branchId),
        eq(userBranchRoles.isActive, true)
      ))
      .limit(1)

    if (userBranchRole.length === 0) {
      return NextResponse.json({ error: 'Accès non autorisé à cette branche' }, { status: 403 })
    }

    // Mettre à jour ou créer la session utilisateur
    const existingSession = await db
      .select()
      .from(userSessions)
      .where(eq(userSessions.userId, userId))
      .limit(1)

    const deviceInfo = {
      userAgent: req.headers.get('user-agent'),
      timestamp: new Date().toISOString()
    }

    if (existingSession.length > 0) {
      await db
        .update(userSessions)
        .set({
          activeBranchId: branchId,
          lastSeen: new Date(),
          deviceInfo
        })
        .where(eq(userSessions.id, existingSession[0].id))
    } else {
      await db
        .insert(userSessions)
        .values({
          userId,
          activeBranchId: branchId,
          deviceInfo
        })
    }

    return NextResponse.json({
      success: true,
      branchId,
      role: userBranchRole[0].role,
      message: 'Branche active mise à jour'
    })

  } catch (error) {
    console.error('Erreur lors de la mise à jour de la branche active:', error)
    return NextResponse.json({
      error: 'Erreur interne du serveur',
      details: error instanceof Error ? error.message : 'Erreur inconnue'
    }, { status: 500 })
  }
}