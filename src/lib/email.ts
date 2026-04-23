import nodemailer from 'nodemailer'
import { getBranchColor } from './branches'
import { isAllowedAttachmentMimeType, type ExpenseAttachment } from './attachments'

export interface EmailData {
  userEmail: string
  date: string
  branch: string
  expenseType: string
  amount: string
  description?: string
  attachments: ExpenseAttachment[]
}

// Configuration du transporteur SMTP générique
export const createEmailTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number.parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true', // true pour port 465, false pour les autres ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  })
}

// Fonction pour envoyer un email avec pièce jointe
export const sendExpenseEmail = async (data: EmailData) => {
  const transporter = createEmailTransporter()

  // Vérifier la connexion SMTP
  try {
    await transporter.verify()
    console.log('Serveur SMTP prêt à envoyer des emails')
  } catch (error) {
    console.error('Erreur de configuration SMTP:', error)
    throw new Error('Configuration SMTP invalide')
  }

  const { userEmail, date, branch, expenseType, amount, description, attachments } = data

  // Helper pour extraire le buffer depuis une data URL ou une chaîne base64 brute
  const extractAttachmentBuffer = (input: string, mimeType: string) => {
    if (!input || !mimeType) {
      throw new Error('ATTACHMENT_MISSING')
    }

    let mime = mimeType
    let base64Part = input

    // Format attendu: data:<type>;base64,<data>
    if (input.startsWith('data:')) {
      const match = /^data:([a-zA-Z0-9.+/-]+);base64,(.*)$/.exec(input)
      if (!match || match.length < 3) {
        throw new Error('ATTACHMENT_DATA_URL_INVALID')
      }
      mime = match[1]
      base64Part = match[2]
    } else if (input.includes(',')) {
      // Cas dégradé: on prend tout après la première virgule
      const commaIndex = input.indexOf(',')
      base64Part = commaIndex >= 0 ? input.slice(commaIndex + 1) : input
    }

    base64Part = base64Part.replace(/\s+/g, '')
    if (!/^[A-Za-z0-9+/=]+$/.test(base64Part)) {
      // Vérification minimale que la chaîne ressemble à du base64
      throw new Error('ATTACHMENT_NOT_BASE64')
    }

    if (!isAllowedAttachmentMimeType(mime)) {
      throw new Error('ATTACHMENT_MIME_NOT_ALLOWED')
    }

    try {
      const buffer = Buffer.from(base64Part, 'base64')
      if (buffer.length === 0) {
        throw new Error('ATTACHMENT_EMPTY_BUFFER')
      }
      return { buffer, mime }
    } catch (e) {
      console.error('Erreur conversion buffer pièce jointe:', e)
      throw new Error('ATTACHMENT_BUFFER_CONVERSION_FAILED')
    }
  }

  const parsedAttachments = attachments.map((attachment) => {
    try {
      const info = extractAttachmentBuffer(attachment.base64Data, attachment.mimeType)
      return {
        filename: attachment.normalizedFileName || attachment.displayName || attachment.originalFileName,
        content: info.buffer,
        contentType: info.mime
      }
    } catch (e) {
      if (e instanceof Error && e.message.startsWith('ATTACHMENT_')) {
        throw new Error(`INVALID_ATTACHMENT:${e.message}`)
      }
      throw e
    }
  })
  const escapeHtml = (value: string) => value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')

  const defaultFromName = process.env.SMTP_FROM_NAME || 'Factures carte procurement SGDF'
  const fromRaw = process.env.SMTP_FROM?.trim()
  const fallbackAddress = process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER

  if (!fromRaw && !fallbackAddress) {
    throw new Error('SMTP_FROM_UNDEFINED')
  }

  const from = (() => {
    if (fromRaw) {
      // Allow full "Name <email>" syntax or simple email override
      if (fromRaw.includes('<') || fromRaw.includes('>')) {
        return fromRaw
      }
      return {
        name: defaultFromName,
        address: fromRaw,
      }
    }
    return {
      name: defaultFromName,
      address: fallbackAddress!,
    }
  })()

  const subject = `Facture carte procurement - ${branch} - ${date}`
  const primaryColor = getBranchColor(branch)
  // Accent: If the primary color is a warm tone, keep gold, else use a light variant
  const accentColor = '#FBB042'
  const textOnPrimary = '#ffffff'

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background-color: ${primaryColor}; color: ${textOnPrimary}; padding: 20px; text-align: center;">
  <h1 style="margin: 0; font-size: 24px;">📜 Facture carte procurement SGDF</h1>
        <p style="margin: 10px 0 0 0; opacity: 0.9;">La Guillotière</p>
      </div>
      
      <div style="padding: 30px; background-color: #f9f9f9;">
  <h2 style="color: ${primaryColor}; margin-top: 0;">Nouvelle facture</h2>
        
        <div style="background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 10px 0; border-bottom: 1px solid #eee; font-weight: bold; color: #374151;">Date :</td>
              <td style="padding: 10px 0; border-bottom: 1px solid #eee; color: #374151;">${date}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; border-bottom: 1px solid #eee; font-weight: bold; color: #374151;">Branche :</td>
              <td style="padding: 10px 0; border-bottom: 1px solid #eee; color: #374151;">${branch}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; border-bottom: 1px solid #eee; font-weight: bold; color: #374151;">Type :</td>
              <td style="padding: 10px 0; border-bottom: 1px solid #eee; color: #374151;">${expenseType}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; border-bottom: 1px solid #eee; font-weight: bold; color: ${primaryColor};">Montant :</td>
              <td style="padding: 10px 0; border-bottom: 1px solid #eee; color: ${primaryColor}; font-weight: bold; font-size: 18px;">${amount} €</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; border-bottom: 1px solid #eee; font-weight: bold; color: #374151;">Demandeur :</td>
              <td style="padding: 10px 0; border-bottom: 1px solid #eee; color: #374151;">${userEmail}</td>
            </tr>
            ${description ? `
            <tr>
              <td style="padding: 10px 0; font-weight: bold; color: #374151; vertical-align: top;">Description :</td>
              <td style="padding: 10px 0; color: #374151;">${description}</td>
            </tr>` : ''}
          </table>
        </div>
        
        <div style="background-color: ${accentColor}; color: ${primaryColor}; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <strong>📎 ${parsedAttachments.length} pièce(s) jointe(s) :</strong>
          <ul style="margin: 8px 0 0 18px; padding: 0;">
            ${parsedAttachments.map(a => `<li>${escapeHtml(a.filename)}</li>`).join('')}
          </ul>
        </div>
        
        <p style="color: #6B7280; font-size: 14px; margin-top: 30px;">
          Email envoyé automatiquement par l'application Factures carte procurement SGDF.
        </p>
      </div>
    </div>
  `

  const textContent = `
Facture carte procurement SGDF - La Guillotière

Nouvelle facture

Date : ${date}
Branche : ${branch}
Type : ${expenseType}
Montant : ${amount} €
Demandeur : ${userEmail}
${description ? `Description : ${description}` : ''}

Pièce(s) jointe(s) (${parsedAttachments.length}) :
${parsedAttachments.map(a => `- ${a.filename}`).join('\n')}

Email envoyé automatiquement par l'application Factures carte procurement SGDF.
  `

  const mailOptions = {
    from,
    to: process.env.TREASURY_EMAIL!,
    cc: userEmail,
    subject,
    text: textContent,
    html: htmlContent,
  // Mark the message as important/high priority for most email clients
  priority: 'high' as const,
    headers: {
      Importance: 'High',
      'X-Priority': '1 (Highest)',
      'X-MSMail-Priority': 'High'
    },
    attachments: parsedAttachments
  }

  try {
    // Some nodemailer typings present overloads that make the return type awkward;
    // cast to any so we can access messageId reliably at runtime.
    const info: any = await transporter.sendMail(mailOptions)
    console.log('Email envoyé avec succès:', info?.messageId)
    return { success: true, messageId: info?.messageId }
  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'email:', error)
    throw error
  }
}
