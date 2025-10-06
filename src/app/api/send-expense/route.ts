import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { sendExpenseEmail, type EmailData } from '@/lib/email'
import { db, branches, emailUnite, groups } from '@/lib/db'
import { eq, and } from 'drizzle-orm'

// Utilitaire de réponse JSON d'erreur
const jsonError = (message: string, status: number) => NextResponse.json({ error: message }, { status })

function validateEnv() {
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    console.error('Variables d\'environnement manquantes pour Gmail SMTP')
    return jsonError('Configuration serveur manquante', 500)
  }
  return null
}

// Fonction pour récupérer les destinataires depuis la base de données
async function getRecipientsFromDB(branchName: string) {
  try {
    // Récupérer la branche et son groupe
    const branchInfo = await db.select({
      branchId: branches.id,
      groupId: branches.groupId,
      groupName: groups.name,
      adminUserId: groups.adminUserId,
    })
      .from(branches)
      .innerJoin(groups, eq(branches.groupId, groups.id))
      .where(eq(branches.name, branchName))
      .limit(1)

    if (branchInfo.length === 0) {
      console.warn(`Branche "${branchName}" non trouvée en base de données`)
      // Fallback vers les variables d'environnement si la branche n'est pas trouvée
      return {
        treasuryEmail: process.env.TREASURY_EMAIL,
        unitEmail: null,
        groupName: 'La Guillotière', // Valeur par défaut
      }
    }

    const { branchId, groupId, groupName } = branchInfo[0]

    // Récupérer l'email d'unité validé pour cette branche
    const unitEmailResult = await db.select()
      .from(emailUnite)
      .where(and(
        eq(emailUnite.branchId, branchId),
        eq(emailUnite.statut, 'valide')
      ))
      .limit(1)

    const unitEmail = unitEmailResult.length > 0 ? unitEmailResult[0].email : null

    // Pour l'instant, on utilise l'email de trésorerie par défaut
    // Plus tard, on pourrait avoir une table spécifique pour les emails de trésorerie par groupe
    const treasuryEmail = process.env.TREASURY_EMAIL

    return {
      treasuryEmail,
      unitEmail,
      groupName,
    }

  } catch (error) {
    console.error('Erreur lors de la récupération des destinataires:', error)
    // Fallback vers les variables d'environnement
    return {
      treasuryEmail: process.env.TREASURY_EMAIL,
      unitEmail: null,
      groupName: 'La Guillotière',
    }
  }
}

function validateBody(body: any): { emailData?: EmailData; error?: NextResponse } {
  const { userEmail, date, branch, expenseType, amount, description, imageBase64, fileName } = body || {}
  if (!userEmail || !date || !branch || !expenseType || !amount || !imageBase64 || !fileName) {
    return { error: jsonError('Données manquantes', 400) }
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(userEmail)) {
    return { error: jsonError('Format email invalide', 400) }
  }
  const amountNumber = parseFloat(amount)
  if (isNaN(amountNumber) || amountNumber <= 0) {
    return { error: jsonError('Montant invalide', 400) }
  }
  return {
    emailData: { userEmail, date, branch, expenseType, amount, description: description || '', imageBase64, fileName }
  }
}

export async function POST(req: NextRequest) {
  try {
    // Auth
    const { userId } = await auth()
    if (!userId) return jsonError('Non autorisé', 401)

    // Env vars
    const envError = validateEnv()
    if (envError) return envError

    // Body & validation
    const body = await req.json().catch(() => null)
    if (!body) return jsonError('Corps de requête invalide', 400)
    const { emailData, error } = validateBody(body)
    if (error || !emailData) return error as NextResponse

    // Get recipients from database
    const recipients = await getRecipientsFromDB(emailData.branch)

    // Prepare email data with recipients
    const emailDataWithRecipients = {
      ...emailData,
      groupName: recipients.groupName,
      treasuryEmail: recipients.treasuryEmail,
      unitEmail: recipients.unitEmail,
    }

    // Send email
    const result = await sendExpenseEmail(emailDataWithRecipients)
    return NextResponse.json({
      success: true,
      message: 'Email envoyé avec succès',
      messageId: result.messageId,
      recipients: {
        treasury: recipients.treasuryEmail,
        unit: recipients.unitEmail,
        groupName: recipients.groupName
      }
    })

  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'email:', error)
    if (error instanceof Error) {
      if (error.message.startsWith('INVALID_IMAGE:')) return jsonError('Image invalide ou corrompue. Veuillez reprendre la photo/import.', 400)
      if (error.message.includes('Invalid login')) return jsonError('Erreur d\'authentification Gmail. Vérifiez le mot de passe d\'application.', 500)
      if (error.message.includes('SMTP')) return jsonError('Erreur de connexion SMTP. Vérifiez la configuration.', 500)
    }
    return jsonError('Erreur interne du serveur', 500)
  }
}