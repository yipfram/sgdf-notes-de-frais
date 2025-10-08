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

    const groupId = userBranch[0].groupId

    // Récupérer toutes les branches du groupe avec le nombre de chefs
    const branchesData = await db
      .select({
        id: branches.id,
        name: branches.name,
        isActive: branches.isActive,
        chefsCount: count(userBranchRoles.userId).mapWith(Number),
      })
      .from(branches)
      .leftJoin(userBranchRoles, and(
        eq(userBranchRoles.branchId, branches.id),
        eq(userBranchRoles.isActive, true)
      ))
      .where(eq(branches.groupId, groupId))
      .groupBy(branches.id, branches.name, branches.isActive)
      .orderBy(branches.name)

    return NextResponse.json({
      branches: branchesData
    })

  } catch (error) {
    console.error('Erreur lors de la récupération des branches:', error)
    return NextResponse.json({
      error: 'Erreur interne du serveur'
    }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    // Vérifier que l'utilisateur est admin
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

    const body = await request.json()
    const { name } = body

    if (!name) {
      return NextResponse.json({
        error: 'Nom de la branche requis'
      }, { status: 400 })
    }

    // Créer la nouvelle branche
    const [newBranch] = await db
      .insert(branches)
      .values({
        name,
        groupId: userBranch[0].groupId,
        isActive: true,
      })
      .returning()

    return NextResponse.json({
      success: true,
      branch: {
        id: newBranch.id,
        name: newBranch.name,
        isActive: newBranch.isActive,
        chefsCount: 0,
      }
    })

  } catch (error) {
    console.error('Erreur lors de la création de la branche:', error)
    return NextResponse.json({
      error: 'Erreur interne du serveur'
    }, { status: 500 })
  }
}