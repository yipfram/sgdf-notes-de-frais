import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { db, demandeAcces, groups, branches, userBranchRoles } from '@/lib/db'
import { eq, and } from 'drizzle-orm'

export async function GET() {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    // Trouver le groupe de l'utilisateur (via sa branche active)
    const userBranch = await db
      .select({
        groupId: branches.groupId,
        role: userBranchRoles.role,
      })
      .from(userBranchRoles)
      .innerJoin(branches, eq(userBranchRoles.branchId, branches.id))
      .where(and(
        eq(userBranchRoles.userId, userId),
        eq(userBranchRoles.isActive, true),
        eq(userBranchRoles.role, 'admin')
      ))
      .limit(1)

    if (userBranch.length === 0) {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 })
    }

    const groupId = userBranch[0].groupId

    // Récupérer toutes les demandes en attente pour ce groupe
    const pendingRequests = await db
      .select({
        id: demandeAcces.id,
        email: demandeAcces.email,
        message: demandeAcces.message,
        createdAt: demandeAcces.createdAt,
        groupName: groups.name,
        branchName: branches.name,
      })
      .from(demandeAcces)
      .innerJoin(groups, eq(demandeAcces.groupId, groups.id))
      .innerJoin(branches, eq(demandeAcces.branchId, branches.id))
      .where(and(
        eq(demandeAcces.groupId, groupId),
        eq(demandeAcces.statut, 'en_attente')
      ))
      .orderBy(demandeAcces.createdAt)

    return NextResponse.json({
      requests: pendingRequests
    })

  } catch (error) {
    console.error('Erreur lors de la récupération des demandes en attente:', error)
    return NextResponse.json({
      error: 'Erreur interne du serveur'
    }, { status: 500 })
  }
}