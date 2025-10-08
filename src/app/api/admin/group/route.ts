import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { db, groups, branches, userBranchRoles } from '@/lib/db'
import { eq, and, count } from 'drizzle-orm'

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

    // Récupérer les informations du groupe
    const groupData = await db
      .select()
      .from(groups)
      .where(eq(groups.id, userBranch[0].groupId))
      .limit(1)

    if (groupData.length === 0) {
      return NextResponse.json({ error: 'Groupe non trouvé' }, { status: 404 })
    }

    const group = groupData[0]

    return NextResponse.json({
      id: group.id,
      name: group.name,
      slug: group.slug,
      adminUserId: group.adminUserId,
      isActive: group.isActive,
    })

  } catch (error) {
    console.error('Erreur lors de la récupération du groupe:', error)
    return NextResponse.json({
      error: 'Erreur interne du serveur'
    }, { status: 500 })
  }
}