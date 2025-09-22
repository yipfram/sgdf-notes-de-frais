import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { sendExpenseEmail, type EmailData } from '@/lib/email'

// Utilitaire de réponse JSON d'erreur
const jsonError = (message: string, status: number) => NextResponse.json({ error: message }, { status })

function validateEnv() {
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD || !process.env.TREASURY_EMAIL) {
    console.error('Variables d\'environnement manquantes pour Gmail SMTP')
    return jsonError('Configuration serveur manquante', 500)
  }
  return null
}

function validateBody(body: any): { emailData?: EmailData; error?: NextResponse } {
  const { userEmail, date, branch, expenseType, amount, description, imageBase64, fileName } = body || {}
  if (!userEmail || !date || !branch || !expenseType || !amount || !description || !imageBase64 || !fileName) {
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
    emailData: { userEmail, date, branch, expenseType, amount, description, imageBase64, fileName }
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

    // Send email
    const result = await sendExpenseEmail(emailData)
    return NextResponse.json({ success: true, message: 'Email envoyé avec succès', messageId: result.messageId })

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