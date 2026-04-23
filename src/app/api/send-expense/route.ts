import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { sendExpenseEmail, type EmailData } from '@/lib/email'
import {
  MAX_ATTACHMENT_COUNT,
  MAX_ATTACHMENT_SIZE_BYTES,
  MAX_TOTAL_ATTACHMENTS_SIZE_BYTES,
  isAllowedAttachmentMimeType,
  type ExpenseAttachment
} from '@/lib/attachments'

// Utilitaire de réponse JSON d'erreur
const jsonError = (message: string, status: number) => NextResponse.json({ error: message }, { status })

function validateEnv() {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASSWORD || !process.env.TREASURY_EMAIL) {
    console.error('Variables d\'environnement manquantes pour SMTP')
    return jsonError('Configuration serveur manquante', 500)
  }
  return null
}

function validateBody(body: any): { emailData?: EmailData; error?: NextResponse } {
  const { userEmail, date, branch, expenseType, amount, description } = body || {}
  if (!userEmail || !date || !branch || !expenseType || !amount) {
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

  const bodyAttachments = Array.isArray(body?.attachments) ? body.attachments : null
  const legacyAttachment = (!bodyAttachments || bodyAttachments.length === 0) && body?.imageBase64 && body?.fileName
    ? [{
        displayName: body.fileName,
        mimeType: 'image/jpeg',
        base64Data: typeof body.imageBase64 === 'string' && body.imageBase64.includes(',')
          ? body.imageBase64.split(',').pop()
          : body.imageBase64,
        originalFileName: body.fileName,
        normalizedFileName: body.fileName
      }]
    : []

  const attachments = ((bodyAttachments && bodyAttachments.length > 0) ? bodyAttachments : legacyAttachment) as ExpenseAttachment[]
  if (!attachments || attachments.length === 0) {
    return { error: jsonError('Aucun justificatif fourni', 400) }
  }
  if (attachments.length > MAX_ATTACHMENT_COUNT) {
    return { error: jsonError(`Trop de fichiers (maximum ${MAX_ATTACHMENT_COUNT})`, 400) }
  }

  let totalSize = 0
  const safeBase64Regex = /^[A-Za-z0-9+/=\r\n]+$/
  const normalizedAttachments: ExpenseAttachment[] = []
  for (const [index, attachment] of attachments.entries()) {
    if (!attachment || typeof attachment !== 'object') {
      return { error: jsonError(`Justificatif invalide (#${index + 1})`, 400) }
    }

    const displayName = String(attachment.displayName || '').trim()
    const mimeType = String(attachment.mimeType || '').trim().toLowerCase()
    const base64Data = String(attachment.base64Data || '').trim()
    const originalFileName = String(attachment.originalFileName || attachment.displayName || '').trim()
    const normalizedFileName = String(attachment.normalizedFileName || originalFileName || displayName || '').trim()

    if (!displayName || !mimeType || !base64Data || !originalFileName || !normalizedFileName) {
      return { error: jsonError(`Justificatif incomplet (#${index + 1})`, 400) }
    }
    if (!isAllowedAttachmentMimeType(mimeType)) {
      return { error: jsonError(`Type de fichier non supporté (#${index + 1})`, 400) }
    }
    if (!safeBase64Regex.test(base64Data)) {
      return { error: jsonError(`Fichier encodé invalide (#${index + 1})`, 400) }
    }

    let size = 0
    try {
      size = Buffer.from(base64Data, 'base64').length
    } catch {
      return { error: jsonError(`Fichier corrompu (#${index + 1})`, 400) }
    }
    if (size <= 0) {
      return { error: jsonError(`Fichier vide (#${index + 1})`, 400) }
    }
    if (size > MAX_ATTACHMENT_SIZE_BYTES) {
      return { error: jsonError(`Fichier trop volumineux (#${index + 1})`, 400) }
    }

    totalSize += size
    if (totalSize > MAX_TOTAL_ATTACHMENTS_SIZE_BYTES) {
      return { error: jsonError('Volume total des pièces jointes trop élevé', 400) }
    }

    normalizedAttachments.push({
      displayName,
      mimeType,
      base64Data,
      originalFileName,
      normalizedFileName
    })
  }

  return {
    emailData: {
      userEmail,
      date,
      branch,
      expenseType,
      amount,
      description: description || '',
      attachments: normalizedAttachments
    }
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
      if (error.message.startsWith('INVALID_ATTACHMENT:')) return jsonError('Pièce jointe invalide ou corrompue. Veuillez réessayer.', 400)
      if (error.message === 'SMTP_FROM_UNDEFINED') return jsonError('Expéditeur SMTP manquant. Définissez SMTP_FROM ou SMTP_FROM_EMAIL.', 500)
      if (error.message.includes('Invalid login')) return jsonError('Erreur d\'authentification SMTP. Vérifiez les identifiants.', 500)
      if (error.message.includes('SMTP')) return jsonError('Erreur de connexion SMTP. Vérifiez la configuration.', 500)
    }
    return jsonError('Erreur interne du serveur', 500)
  }
}
