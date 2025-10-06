import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { db, demandeAcces, validations, userBranchRoles, branches, groups } from '@/lib/db'
import { eq, and } from 'drizzle-orm'

export async function POST(request: Request) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const body = await request.json()
    const { demandeId, commentaire } = body

    if (!demandeId) {
      return NextResponse.json({
        error: 'ID de demande requis'
      }, { status: 400 })
    }

    // Récupérer la demande avec les informations du groupe et de la branche
    const demandeInfo = await db.select({
      demande: demandeAcces,
      groupName: groups.name,
      branchName: branches.name,
    })
      .from(demandeAcces)
      .innerJoin(groups, eq(demandeAcces.groupId, groups.id))
      .innerJoin(branches, eq(demandeAcces.branchId, branches.id))
      .where(eq(demandeAcces.id, demandeId))
      .limit(1)

    if (demandeInfo.length === 0) {
      return NextResponse.json({
        error: 'Demande non trouvée'
      }, { status: 404 })
    }

    const { demande, groupName, branchName } = demandeInfo[0]

    // Vérifier que la demande est en attente
    if (demande.statut !== 'en_attente') {
      return NextResponse.json({
        error: 'Cette demande a déjà été traitée'
      }, { status: 409 })
    }

    // Vérifier que l'utilisateur est admin du groupe
    // Note: Pour l'instant, nous vérifions juste que l'utilisateur est le admin du groupe
    // Plus tard, vous pourriez vouloir vérifier les rôles via userBranchRoles
    const group = await db.select()
      .from(groups)
      .where(and(
        eq(groups.id, demande.groupId),
        eq(groups.adminUserId, userId)
      ))
      .limit(1)

    if (group.length === 0) {
      return NextResponse.json({
        error: 'Vous n\'êtes pas autorisé à approuver cette demande'
      }, { status: 403 })
    }

    // Mettre à jour la transaction de base de données
    await db.transaction(async (tx) => {
      // Créer l'entrée de validation
      await tx.insert(validations)
        .values({
          demandeId,
          validateurUserId: userId,
          decision: 'approuve',
          commentaire: commentaire || null,
        })

      // Mettre à jour le statut de la demande
      await tx.update(demandeAcces)
        .set({
          statut: 'approuve',
          updatedAt: new Date()
        })
        .where(eq(demandeAcces.id, demandeId))

      // Créer l'accès utilisateur à la branche
      if (demande.userId) {
        await tx.insert(userBranchRoles)
          .values({
            userId: demande.userId,
            branchId: demande.branchId,
            role: 'member', // Les nouveaux utilisateurs deviennent membres par défaut
            grantedBy: userId,
          })
      }
    })

    // TODO: Envoyer un email de confirmation à l'utilisateur
    // await sendConfirmationEmail(demande.email, {
    //   groupName,
    //   branchName,
    //   commentaire
    // })

    return NextResponse.json({
      success: true,
      message: 'Demande approuvée avec succès',
      demande: {
        id: demande.id,
        statut: 'approuve',
        groupName,
        branchName
      }
    })

  } catch (error) {
    console.error('Erreur lors de l\'approbation:', error)
    return NextResponse.json({
      error: 'Erreur interne du serveur',
      details: error instanceof Error ? error.message : 'Erreur inconnue'
    }, { status: 500 })
  }
}