import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { db, branches, userBranchRoles } from '@/lib/db'
import { eq, and } from 'drizzle-orm'

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const branchId = params.id
    const body = await request.json()
    const { name, isActive } = body

    // Vérifier que l'utilisateur est admin du groupe de cette branche
    const userAccess = await db
      .select({
        groupId: branches.groupId,
        role: userBranchRoles.role,
      })
      .from(userBranchRoles)
      .innerJoin(branches, eq(userBranchRoles.branchId, branches.id))
      .where(and(
        eq(userBranchRoles.userId, userId),
        eq(userBranchRoles.branchId, branchId),
        eq(userBranchRoles.isActive, true),
        eq(userBranchRoles.role, 'admin')
      ))
      .limit(1)

    if (userAccess.length === 0) {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 })
    }

    // Préparer les données de mise à jour
    const updateData: any = {}
    if (name !== undefined) updateData.name = name
    if (isActive !== undefined) updateData.isActive = isActive

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({
        error: 'Aucune donnée à mettre à jour'
      }, { status: 400 })
    }

    // Mettre à jour la branche
    const [updatedBranch] = await db
      .update(branches)
      .set(updateData)
      .where(eq(branches.id, branchId))
      .returning()

    return NextResponse.json({
      success: true,
      branch: updatedBranch
    })

  } catch (error) {
    console.error('Erreur lors de la mise à jour de la branche:', error)
    return NextResponse.json({
      error: 'Erreur interne du serveur'
    }, { status: 500 })
  }
}