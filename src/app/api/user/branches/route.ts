import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { db, branches, userBranchRoles } from '@/lib/db'
import { eq, and } from 'drizzle-orm'

export async function GET() {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    // Récupérer les branches avec les rôles de l'utilisateur
    const userBranchesData = await db
      .select({
        branch: branches,
        role: userBranchRoles.role,
      })
      .from(userBranchRoles)
      .innerJoin(branches, eq(userBranchRoles.branchId, branches.id))
      .where(and(
        eq(userBranchRoles.userId, userId),
        eq(userBranchRoles.isActive, true)
      ))

    // Si aucune branche trouvée, essayer de migrer depuis Clerk metadata
    if (userBranchesData.length === 0) {
      // TODO: Implémenter la migration automatique ici
      // Pour l'instant, retourner une liste vide
      return NextResponse.json({
        branches: [],
        message: 'Aucune branche trouvée. Veuillez contacter un administrateur.'
      })
    }

    const branchesList = userBranchesData.map(item => item.branch)

    return NextResponse.json({
      branches: branchesList,
      roles: userBranchesData.reduce((acc, item) => {
        acc[item.branch.id] = item.role
        return acc
      }, {} as Record<string, string>)
    })

  } catch (error) {
    console.error('Erreur lors de la récupération des branches utilisateur:', error)
    return NextResponse.json({
      error: 'Erreur interne du serveur',
      details: error instanceof Error ? error.message : 'Erreur inconnue'
    }, { status: 500 })
  }
}