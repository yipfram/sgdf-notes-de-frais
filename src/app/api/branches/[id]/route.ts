import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { db, branches, groups } from '@/lib/db'
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

    // Récupérer les informations de la branche avec le groupe
    const branchData = await db
      .select({
        id: branches.id,
        name: branches.name,
        groupId: branches.groupId,
        groupName: groups.name,
        groupSlug: groups.slug,
        isActive: branches.isActive,
      })
      .from(branches)
      .innerJoin(groups, eq(branches.groupId, groups.id))
      .where(and(
        eq(branches.id, branchId),
        eq(branches.isActive, true)
      ))
      .limit(1)

    if (branchData.length === 0) {
      return NextResponse.json({ error: 'Branche non trouvée' }, { status: 404 })
    }

    const branch = branchData[0]

    return NextResponse.json({
      id: branch.id,
      name: branch.name,
      groupName: branch.groupName,
      groupCode: branch.groupSlug.toUpperCase(),
      isActive: branch.isActive,
    })

  } catch (error) {
    console.error('Erreur lors de la récupération de la branche:', error)
    return NextResponse.json({
      error: 'Erreur interne du serveur'
    }, { status: 500 })
  }
}