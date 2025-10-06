import { auth, clerkClient } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { migrateExistingUsers } from '@/lib/db/init'

export async function POST() {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    // Récupérer les métadonnées de l'utilisateur depuis Clerk
    const ck = await clerkClient()
    const user = await ck.users.getUser(userId)
    const currentBranch = user.publicMetadata?.branch as string

    if (!currentBranch) {
      return NextResponse.json({
        message: 'Aucune branche à migrer trouvée dans les métadonnées'
      })
    }

    // Effectuer la migration
    await migrateExistingUsers(userId, currentBranch)

    // Nettoyer les anciennes métadonnées après migration réussie
    await ck.users.updateUser(userId, {
      publicMetadata: {
        ...user.publicMetadata,
        // Garder branch pour backward compatibility mais l'API ne l'utilisera plus
        branch: currentBranch,
        migratedToMultiBranch: true
      }
    })

    return NextResponse.json({
      success: true,
      message: `Migration réussie vers la branche "${currentBranch}"`,
      branch: currentBranch
    })

  } catch (error) {
    console.error('Erreur lors de la migration de l\'utilisateur:', error)
    return NextResponse.json({
      error: 'Erreur interne du serveur',
      details: error instanceof Error ? error.message : 'Erreur inconnue'
    }, { status: 500 })
  }
}