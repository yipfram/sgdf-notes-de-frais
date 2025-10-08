import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { db, groups, branches, demandeAcces } from '@/lib/db'
import { eq, and } from 'drizzle-orm'

export async function POST(request: Request) {
  try {
    // Vérifier l'authentification
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({
        error: 'Vous devez être connecté pour faire une demande d\'accès'
      }, { status: 401 })
    }

    // Récupérer l'email de l'utilisateur depuis Clerk
    const { clerkClient } = await import('@clerk/nextjs/server')
    const client = await clerkClient()
    const user = await client.users.getUser(userId)
    const email = user.emailAddresses[0]?.emailAddress

    if (!email) {
      return NextResponse.json({
        error: 'Aucun email trouvé pour votre compte'
      }, { status: 400 })
    }

    const body = await request.json()
    const { groupCode } = body

    if (!groupCode) {
      return NextResponse.json({
        error: 'Code groupe requis'
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

    // Vérifier si une demande existe déjà pour cet utilisateur et cette branche
    const existingDemande = await db.select()
      .from(demandeAcces)
      .where(and(
        eq(demandeAcces.userId, userId),
        eq(demandeAcces.branchId, branch[0].id),
        eq(demandeAcces.statut, 'en_attente')
      ))
      .limit(1)

    if (existingDemande.length > 0) {
      return NextResponse.json({
        error: 'Vous avez déjà une demande en attente pour ce groupe'
      }, { status: 409 })
    }

    // Créer la demande d'accès avec le userId
    const [nouvelleDemande] = await db.insert(demandeAcces)
      .values({
        email,
        groupId: group[0].id,
        branchId: branch[0].id,
        userId, // Maintenant on a le userId dès le départ
        statut: 'en_attente',
        message: null,
      })
      .returning()

    console.log('POST /api/access/request - Demande créée:', {
      id: nouvelleDemande.id,
      email,
      userId,
      groupId: group[0].id,
      branchId: branch[0].id,
      groupName: group[0].name,
      branchName: branch[0].name
    })

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

    console.log('GET /api/access/request - userId:', userId)

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

    console.log('Demandes trouvées:', demandes.length)

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