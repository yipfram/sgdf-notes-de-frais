import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { db, groups, branches, demandeAcces } from '@/lib/db'
import { eq, and } from 'drizzle-orm'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { groupCode, email } = body

    if (!groupCode || !email) {
      return NextResponse.json({
        error: 'Code groupe et email requis'
      }, { status: 400 })
    }

    // Chercher le groupe par son code (slug)
    const group = await db.select()
      .from(groups)
      .where(eq(groups.slug, groupCode.toLowerCase()))
      .limit(1)

    if (group.length === 0) {
      return NextResponse.json({
        error: 'Code groupe invalide'
      }, { status: 404 })
    }

    // Chercher une branche active dans ce groupe (la première disponible)
    const branch = await db.select()
      .from(branches)
      .where(and(
        eq(branches.groupId, group[0].id),
        eq(branches.isActive, true)
      ))
      .limit(1)

    if (branch.length === 0) {
      return NextResponse.json({
        error: 'Aucune branche disponible dans ce groupe'
      }, { status: 404 })
    }

    // Vérifier si une demande existe déjà pour cet email et cette branche
    const existingDemande = await db.select()
      .from(demandeAcces)
      .where(and(
        eq(demandeAcces.email, email),
        eq(demandeAcces.branchId, branch[0].id),
        eq(demandeAcces.statut, 'en_attente')
      ))
      .limit(1)

    if (existingDemande.length > 0) {
      return NextResponse.json({
        error: 'Vous avez déjà une demande en attente pour ce groupe'
      }, { status: 409 })
    }

    // Créer la demande d'accès (sans userId pour l'instant)
    const [nouvelleDemande] = await db.insert(demandeAcces)
      .values({
        email,
        groupId: group[0].id,
        branchId: branch[0].id,
        userId: null, // Sera rempli après l'inscription
        statut: 'en_attente',
        message: null,
      })
      .returning()

    // TODO: Envoyer un email au trésorier du groupe
    // await sendTreasurerEmail(group[0].adminUserId, {
    //   demandeId: nouvelleDemande.id,
    //   userEmail,
    //   groupName: group[0].name,
    //   branchName: branch[0].name,
    //   message
    // })

    return NextResponse.json({
      success: true,
      message: 'Demande d\'accès envoyée avec succès',
      demande: nouvelleDemande
    })

  } catch (error) {
    console.error('Erreur lors de la demande d\'accès:', error)
    return NextResponse.json({
      error: 'Erreur interne du serveur',
      details: error instanceof Error ? error.message : 'Erreur inconnue'
    }, { status: 500 })
  }
}

export async function GET() {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    // Récupérer les demandes de l'utilisateur
    const demandes = await db.select({
      id: demandeAcces.id,
      statut: demandeAcces.statut,
      message: demandeAcces.message,
      createdAt: demandeAcces.createdAt,
      updatedAt: demandeAcces.updatedAt,
      groupName: groups.name,
      branchName: branches.name,
    })
      .from(demandeAcces)
      .innerJoin(groups, eq(demandeAcces.groupId, groups.id))
      .innerJoin(branches, eq(demandeAcces.branchId, branches.id))
      .where(eq(demandeAcces.userId, userId))
      .orderBy(demandeAcces.createdAt)

    return NextResponse.json({
      success: true,
      demandes
    })

  } catch (error) {
    console.error('Erreur lors de la récupération des demandes:', error)
    return NextResponse.json({
      error: 'Erreur interne du serveur'
    }, { status: 500 })
  }
}