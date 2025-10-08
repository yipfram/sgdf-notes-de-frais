import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { db, userBranchRoles, branches } from '@/lib/db'
import { eq, and } from 'drizzle-orm'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { id: branchId } = await params

    // Vérifier que l'utilisateur a accès à cette branche
    const userAccess = await db
      .select()
      .from(userBranchRoles)
      .where(and(
        eq(userBranchRoles.userId, userId),
        eq(userBranchRoles.branchId, branchId),
        eq(userBranchRoles.isActive, true)
      ))
      .limit(1)

    if (userAccess.length === 0) {
      return NextResponse.json({ error: 'Accès non autorisé à cette branche' }, { status: 403 })
    }

    // Récupérer tous les chefs de cette branche
    const chefsData = await db
      .select({
        userId: userBranchRoles.userId,
        role: userBranchRoles.role,
        grantedAt: userBranchRoles.grantedAt,
        lastAccessAt: userBranchRoles.lastAccessAt,
      })
      .from(userBranchRoles)
      .where(and(
        eq(userBranchRoles.branchId, branchId),
        eq(userBranchRoles.isActive, true)
      ))
      .orderBy(userBranchRoles.grantedAt)

    // Formater les données pour le retour
    const chefs = chefsData.map(chef => ({
      id: chef.userId,
      email: chef.userId, // Pour l'instant, nous utilisons l'userId comme email
      role: chef.role,
      grantedAt: chef.grantedAt,
      lastAccessAt: chef.lastAccessAt,
    }))

    return NextResponse.json({
      chefs
    })

  } catch (error) {
    console.error('Erreur lors de la récupération des chefs:', error)
    return NextResponse.json({
      error: 'Erreur interne du serveur'
    }, { status: 500 })
  }
}