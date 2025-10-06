import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { initializeDatabase } from '@/lib/db/init'

export async function POST() {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    // Initialiser la base de données
    const result = await initializeDatabase(userId)

    return NextResponse.json({
      success: true,
      message: 'Base de données initialisée avec succès',
      data: result
    })

  } catch (error) {
    console.error('Erreur lors de l\'initialisation:', error)
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

    // Pour l'instant, juste vérifier si l'utilisateur est connecté
    // On pourrait ajouter une vérification si la base est déjà initialisée
    return NextResponse.json({
      message: 'Utilisateur autorisé à initialiser la base de données',
      userId
    })

  } catch (error) {
    console.error('Erreur lors de la vérification:', error)
    return NextResponse.json({
      error: 'Erreur interne du serveur'
    }, { status: 500 })
  }
}