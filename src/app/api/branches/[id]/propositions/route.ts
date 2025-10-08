import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { db, emailUnite, userBranchRoles, branches } from '@/lib/db'
import { eq, and } from 'drizzle-orm'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const branchId = params.id

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

    // Récupérer les propositions d'email d'unité pour cette branche
    const emailData = await db
      .select({
        id: emailUnite.id,
        email: emailUnite.email,
        statut: emailUnite.statut,
        proposePar: emailUnite.proposePar,
        validePar: emailUnite.validePar,
        createdAt: emailUnite.createdAt,
        updatedAt: emailUnite.updatedAt,
      })
      .from(emailUnite)
      .where(eq(emailUnite.branchId, branchId))
      .orderBy(emailUnite.createdAt)

    // Formater les données pour le retour
    const propositions = emailData.map(prop => ({
      id: prop.id,
      type: 'email_unite' as const,
      value: prop.email,
      statut: prop.statut,
      createdAt: prop.createdAt,
      updatedAt: prop.updatedAt,
      proposePar: prop.proposePar,
      validePar: prop.validePar,
    }))

    return NextResponse.json({
      propositions
    })

  } catch (error) {
    console.error('Erreur lors de la récupération des propositions:', error)
    return NextResponse.json({
      error: 'Erreur interne du serveur'
    }, { status: 500 })
  }
}

export async function POST(
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
    const { type, value } = body

    if (!type || !value) {
      return NextResponse.json({
        error: 'Type et valeur requis'
      }, { status: 400 })
    }

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

    if (type === 'email_unite') {
      // Créer une nouvelle proposition d'email d'unité
      const [newProposition] = await db
        .insert(emailUnite)
        .values({
          branchId,
          email: value,
          statut: 'propose',
          proposePar: userId,
        })
        .returning()

      return NextResponse.json({
        success: true,
        proposition: {
          id: newProposition.id,
          type: 'email_unite',
          value: newProposition.email,
          statut: newProposition.statut,
          createdAt: newProposition.createdAt,
        }
      })
    } else {
      return NextResponse.json({
        error: 'Type de proposition non supporté'
      }, { status: 400 })
    }

  } catch (error) {
    console.error('Erreur lors de la création de la proposition:', error)
    return NextResponse.json({
      error: 'Erreur interne du serveur'
    }, { status: 500 })
  }
}