import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { db, emailUnite, userBranchRoles, branches, groups } from '@/lib/db'
import { eq, and, inArray } from 'drizzle-orm'

// GET: Récupérer toutes les propositions pour le groupe de l'utilisateur
export async function GET() {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    // Récupérer les branches où l'utilisateur est admin
    const adminBranches = await db.select({
      branchId: userBranchRoles.branchId,
      branchName: branches.name,
      groupId: branches.groupId,
      groupName: groups.name,
    })
      .from(userBranchRoles)
      .innerJoin(branches, eq(userBranchRoles.branchId, branches.id))
      .innerJoin(groups, eq(branches.groupId, groups.id))
      .where(and(
        eq(userBranchRoles.userId, userId),
        eq(userBranchRoles.role, 'admin'),
        eq(userBranchRoles.isActive, true)
      ))

    if (adminBranches.length === 0) {
      return NextResponse.json({
        error: 'Aucun accès admin trouvé'
      }, { status: 403 })
    }

    const branchIds = adminBranches.map(b => b.branchId)

    // Récupérer les propositions d'emails pour ces branches
    const propositions = await db.select({
      id: emailUnite.id,
      email: emailUnite.email,
      statut: emailUnite.statut,
      proposePar: emailUnite.proposePar,
      validePar: emailUnite.validePar,
      createdAt: emailUnite.createdAt,
      updatedAt: emailUnite.updatedAt,
      branchName: branches.name,
      groupName: groups.name,
    })
      .from(emailUnite)
      .innerJoin(branches, eq(emailUnite.branchId, branches.id))
      .innerJoin(groups, eq(branches.groupId, groups.id))
      .where(inArray(emailUnite.branchId, branchIds))
      .orderBy(emailUnite.createdAt)

    return NextResponse.json({
      success: true,
      propositions
    })

  } catch (error) {
    console.error('Erreur lors de la récupération des propositions:', error)
    return NextResponse.json({
      error: 'Erreur interne du serveur'
    }, { status: 500 })
  }
}

// POST: Proposer un email d'unité pour une branche
export async function POST(request: Request) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const body = await request.json()
    const { branchId, email } = body

    if (!branchId || !email) {
      return NextResponse.json({
        error: 'ID de branche et email requis'
      }, { status: 400 })
    }

    // Valider le format de l'email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({
        error: 'Format d\'email invalide'
      }, { status: 400 })
    }

    // Vérifier que l'utilisateur a accès à cette branche
    const userAccess = await db.select()
      .from(userBranchRoles)
      .where(and(
        eq(userBranchRoles.userId, userId),
        eq(userBranchRoles.branchId, branchId),
        eq(userBranchRoles.isActive, true)
      ))
      .limit(1)

    if (userAccess.length === 0) {
      return NextResponse.json({
        error: 'Vous n\'avez pas accès à cette branche'
      }, { status: 403 })
    }

    // Vérifier s'il existe déjà une proposition pour cette branche
    const existingProposition = await db.select()
      .from(emailUnite)
      .where(and(
        eq(emailUnite.branchId, branchId),
        eq(emailUnite.statut, 'propose')
      ))
      .limit(1)

    if (existingProposition.length > 0) {
      return NextResponse.json({
        error: 'Une proposition est déjà en attente pour cette branche'
      }, { status: 409 })
    }

    // Créer la proposition
    const [nouvelleProposition] = await db.insert(emailUnite)
      .values({
        branchId,
        email,
        statut: 'propose',
        proposePar: userId,
      })
      .returning()

    // TODO: Notifier les admins du groupe de la nouvelle proposition
    // await notifyAdmins(branchId, {
    //   type: 'new_email_proposition',
    //   email,
    //   proposePar: userId
    // })

    return NextResponse.json({
      success: true,
      message: 'Proposition d\'email envoyée avec succès',
      proposition: nouvelleProposition
    })

  } catch (error) {
    console.error('Erreur lors de la proposition d\'email:', error)
    return NextResponse.json({
      error: 'Erreur interne du serveur',
      details: error instanceof Error ? error.message : 'Erreur inconnue'
    }, { status: 500 })
  }
}

// PUT: Valider ou rejeter une proposition d'email
export async function PUT(request: Request) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const body = await request.json()
    const { propositionId, action, commentaire } = body

    if (!propositionId || !action || !['valide', 'refuse'].includes(action)) {
      return NextResponse.json({
        error: 'ID de proposition et action (valide/refuse) requis'
      }, { status: 400 })
    }

    // Récupérer la proposition avec les informations de la branche
    const propositionInfo = await db.select({
      proposition: emailUnite,
      branchName: branches.name,
      groupName: groups.name,
    })
      .from(emailUnite)
      .innerJoin(branches, eq(emailUnite.branchId, branches.id))
      .innerJoin(groups, eq(branches.groupId, groups.id))
      .where(eq(emailUnite.id, propositionId))
      .limit(1)

    if (propositionInfo.length === 0) {
      return NextResponse.json({
        error: 'Proposition non trouvée'
      }, { status: 404 })
    }

    const { proposition, branchName, groupName } = propositionInfo[0]

    // Vérifier que l'utilisateur est admin pour cette branche
    const adminAccess = await db.select()
      .from(userBranchRoles)
      .where(and(
        eq(userBranchRoles.userId, userId),
        eq(userBranchRoles.branchId, proposition.branchId),
        eq(userBranchRoles.role, 'admin'),
        eq(userBranchRoles.isActive, true)
      ))
      .limit(1)

    if (adminAccess.length === 0) {
      return NextResponse.json({
        error: 'Vous n\'êtes pas autorisé à valider cette proposition'
      }, { status: 403 })
    }

    // Mettre à jour la proposition
    const [updatedProposition] = await db.update(emailUnite)
      .set({
        statut: action === 'valide' ? 'valide' : 'refuse',
        validePar: userId,
        updatedAt: new Date()
      })
      .where(eq(emailUnite.id, propositionId))
      .returning()

    // TODO: Notifier le proposant du résultat
    // await notifyProposer(proposition.proposePar, {
    //   action,
    //   email: proposition.email,
    //   branchName,
    //   commentaire
    // })

    return NextResponse.json({
      success: true,
      message: `Proposition ${action === 'valide' ? 'validée' : 'refusée'} avec succès`,
      proposition: updatedProposition
    })

  } catch (error) {
    console.error('Erreur lors du traitement de la proposition:', error)
    return NextResponse.json({
      error: 'Erreur interne du serveur',
      details: error instanceof Error ? error.message : 'Erreur inconnue'
    }, { status: 500 })
  }
}